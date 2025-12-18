import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { getOrCreateCorrelationId, logJson } from '@/lib/observability';
import { createBlogGenerationRun, updateBlogGenerationRun } from '@/lib/blogGenerationRuns';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';

/**
 * Generate URL-friendly slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

const GenerateBlogRequestSchema = z.object({
  topic: z.string().min(3),
  primaryKeyword: z.string().min(2),
  secondaryKeywords: z.string().optional().default(''),
  location: z.string().optional().default('Kent'),
  category: z.string().optional().default('police-station-advice'),
  seoLength: z.enum(['short', 'optimal', 'long']).optional().default('optimal'),
  includeFAQ: z.boolean().optional().default(true),
  includeInternalLinks: z.boolean().optional().default(true),
  imageSource: z.enum(['ai', 'upload', 'url']).optional().default('url'),
  imageUrls: z.array(z.string()).optional().default([]),
  featuredImageIndex: z.number().int().nonnegative().optional().default(0),
  includeInContentImages: z.boolean().optional().default(false),
});

const MetaJsonSchema = z.object({
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  excerpt: z.string().min(1),
});

const FaqJsonSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(5),
      })
    )
    .max(8),
});

function isServerlessRuntime(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { timeoutMs: number; maxAttempts: number; correlationId: string; stage: string }
): Promise<Response> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const started = Date.now();
    try {
      const res = await fetchWithTimeout(url, init, opts.timeoutMs);
      const durationMs = Date.now() - started;

      if (res.ok) return res;

      // Retry on transient classes: 429, 5xx
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        const backoffMs = Math.min(2000 * attempt, 8000);
        logJson('warn', {
          stage: 'failed',
          correlationId: opts.correlationId,
          success: false,
          durationMs,
          attempt,
          httpStatus: res.status,
          note: `Retrying after ${backoffMs}ms`,
          retryStage: opts.stage,
        });
        await sleep(backoffMs);
        continue;
      }

      return res;
    } catch (err) {
      lastErr = err;
      const backoffMs = Math.min(2000 * attempt, 8000);
      logJson('warn', {
        stage: 'failed',
        correlationId: opts.correlationId,
        success: false,
        attempt,
        errorMessage: err instanceof Error ? err.message : String(err),
        note: `Retrying after ${backoffMs}ms`,
        retryStage: opts.stage,
      });
      await sleep(backoffMs);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr || 'Fetch failed'));
}

function extractJsonObject(raw: string): string {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) return raw.slice(start, end + 1);
  return raw;
}

function repairJson(raw: string): string {
  // Minimal, deterministic “repair” without new dependencies:
  // - strip any non-JSON prefix/suffix
  // - replace smart quotes
  // - remove trailing commas
  let s = extractJsonObject(raw.trim());
  s = s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, '$1');
  return s;
}

function safeJsonParse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const repaired = repairJson(raw);
    return JSON.parse(repaired) as T;
  }
}

/**
 * Call OpenAI API for content generation
 */
async function callOpenAI(args: {
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  correlationId: string;
  stage: string;
}): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetchWithRetry(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: args.messages,
        max_tokens: args.maxTokens ?? 2000,
        temperature: 0.7,
      }),
    },
    { timeoutMs: 30000, maxAttempts: 3, correlationId: args.correlationId, stage: args.stage }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Generate SEO-optimized blog content using AI
 */
async function generateAIContent(formData: any, correlationId: string): Promise<{
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  faqs: Array<{ question: string; answer: string }>;
}> {
  const {
    topic,
    primaryKeyword,
    secondaryKeywords,
    location = 'Kent',
    category,
    seoLength = 'optimal',
    includeFAQ,
    includeInternalLinks,
  } = formData;

  // Word count targets
  const wordTargets: Record<string, number> = {
    short: 800,
    optimal: 1200,
    long: 1800,
  };
  const targetWords = wordTargets[seoLength] || 1200;

  // Parse secondary keywords
  const secondaryKeywordsList = secondaryKeywords
    ? secondaryKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  // Build the content generation prompt
  const contentPrompt = `You are an expert legal content writer specialising in UK criminal law, specifically police station representation and PACE 1984 rights.

Write a comprehensive, SEO-optimized blog article for PoliceStationAgent.com about:

**Topic:** ${topic}
**Primary Keyword:** ${primaryKeyword}
**Secondary Keywords:** ${secondaryKeywordsList.join(', ') || 'duty solicitor, PACE rights, police station representation'}
**Target Location:** ${location}
**Target Word Count:** ${targetWords} words
**Category:** ${category}

**IMPORTANT REQUIREMENTS:**

1. **Content Focus:** Write specifically about "${topic}" - the content must be directly relevant and informative about this exact topic. Do NOT write generic police station advice.

2. **SEO Optimization:**
   - Use the primary keyword "${primaryKeyword}" naturally 3-5 times
   - Include secondary keywords where relevant
   - Use proper heading structure (H2, H3)
   - Include the location "${location}" naturally throughout

3. **Legal Accuracy:**
   - Reference PACE 1984 and relevant UK law accurately
   - Mention specific rights and procedures
   - Be authoritative but accessible

4. **Structure:**
   - Start with an engaging introduction that addresses the reader's concern
   - Use clear H2 headings to organize content
   - Include practical advice and actionable information
   - End with a clear call to action

5. **Author Context:**
   - The author is Robert Cashman, a qualified Duty Solicitor with Higher Rights of Audience (Criminal)
   - He covers all ${location} custody suites including Medway, Maidstone, Canterbury, and Gravesend
   - Available 9am to late, including weekends and bank holidays
   - Phone: 01732 247427

${includeInternalLinks ? `6. **Internal Links:** Include 2-3 relevant internal links to:
   - /services/police-station-representation
   - /services/arrest-advice
   - /services/bail-advice
   - /contact
   Use natural anchor text.` : ''}

**OUTPUT FORMAT:**
Return ONLY the HTML content (no markdown). Use these HTML tags:
- <h2> for main sections
- <h3> for subsections
- <p> for paragraphs
- <ul> and <li> for lists
- <strong> for emphasis
- <a href="..."> for links

Do NOT include <h1> (title will be added separately).
Do NOT include any preamble or explanation, just the HTML content.`;

  // Generate main content
  const content = await callOpenAI({
    correlationId,
    stage: 'generate_blog_content',
    messages: [
      { role: 'system', content: 'You are a professional legal content writer for UK criminal defence. Write in British English. Be authoritative, helpful, and SEO-optimized.' },
      { role: 'user', content: contentPrompt },
    ],
    maxTokens: 3000,
  });

  // Generate SEO meta elements (STRICT JSON contract)
  const metaPrompt = `For this blog post about "${topic}" targeting "${primaryKeyword}" in ${location}:

Return VALID JSON ONLY with this exact shape:
{
  "metaTitle": "string (<= 60 chars, include primary keyword)",
  "metaDescription": "string (<= 155 chars, include primary keyword)",
  "excerpt": "string (2-3 sentences)"
}

Do not include markdown. Do not wrap in \`\`\`. Do not include any extra keys.`;

  const metaResponseRaw = await callOpenAI({
    correlationId,
    stage: 'generate_meta',
    messages: [
      { role: 'system', content: 'You are an SEO specialist. Be concise and follow character limits exactly.' },
      { role: 'user', content: metaPrompt },
    ],
    maxTokens: 500,
  });

  // Parse/validate meta response (one repair attempt)
  let metaJson: unknown;
  try {
    metaJson = safeJsonParse(metaResponseRaw);
  } catch {
    metaJson = safeJsonParse(extractJsonObject(metaResponseRaw));
  }
  let metaParsed = MetaJsonSchema.safeParse(metaJson);
  if (!metaParsed.success) {
    const repairPrompt = `Your previous response did not validate. Return VALID JSON ONLY with keys metaTitle, metaDescription, excerpt.\n\nPrevious response:\n${metaResponseRaw}`;
    const repairedRaw = await callOpenAI({
      correlationId,
      stage: 'generate_meta_repair',
      messages: [
        { role: 'system', content: 'You output strict JSON only.' },
        { role: 'user', content: repairPrompt },
      ],
      maxTokens: 500,
    });
    metaParsed = MetaJsonSchema.safeParse(safeJsonParse(repairedRaw));
  }

  const metaTitle = (metaParsed.success ? metaParsed.data.metaTitle : `${topic} | ${location} Duty Solicitor`).trim().substring(0, 60);
  const metaDescription = (metaParsed.success ? metaParsed.data.metaDescription : `Expert guidance on ${topic.toLowerCase()} from qualified Duty Solicitor in ${location}. PACE-compliant police station representation.`).trim().substring(0, 155);
  const excerpt = (metaParsed.success ? metaParsed.data.excerpt : metaDescription).trim();

  // Generate FAQs if requested
  let faqs: Array<{ question: string; answer: string }> = [];
  if (includeFAQ) {
    const faqPrompt = `Generate 4-5 FAQs about "${topic}" for someone in ${location} searching for "${primaryKeyword}".

Return VALID JSON ONLY with this exact shape:
{
  "faqs": [
    { "question": "string", "answer": "string (2-3 sentences)" }
  ]
}

Rules:
- Make them specific to "${topic}" (not generic).
- Mention PACE 1984 where relevant.
- No markdown, no code fences, no extra keys.`;

    const faqResponseRaw = await callOpenAI({
      correlationId,
      stage: 'generate_faqs',
      messages: [
        { role: 'system', content: 'You are a legal FAQ writer. Create clear, helpful FAQs about UK criminal law and police procedures.' },
        { role: 'user', content: faqPrompt },
      ],
      maxTokens: 1500,
    });

    let faqJson: unknown;
    try {
      faqJson = safeJsonParse(faqResponseRaw);
    } catch {
      faqJson = safeJsonParse(extractJsonObject(faqResponseRaw));
    }
    let faqParsed = FaqJsonSchema.safeParse(faqJson);
    if (!faqParsed.success) {
      const repairPrompt = `Your previous response did not validate. Return VALID JSON ONLY with key faqs (array of {question, answer}).\n\nPrevious response:\n${faqResponseRaw}`;
      const repairedRaw = await callOpenAI({
        correlationId,
        stage: 'generate_faqs_repair',
        messages: [
          { role: 'system', content: 'You output strict JSON only.' },
          { role: 'user', content: repairPrompt },
        ],
        maxTokens: 1500,
      });
      faqParsed = FaqJsonSchema.safeParse(safeJsonParse(repairedRaw));
    }

    if (faqParsed.success) {
      faqs = faqParsed.data.faqs.map(f => ({
        question: f.question.trim().replace(/\??\s*$/, '?'),
        answer: f.answer.trim(),
      }));
    }
  }

  return {
    title: topic,
    content,
    excerpt,
    metaTitle,
    metaDescription,
    faqs,
  };
}

/**
 * Generate fallback content when AI is not available
 */
function generateFallbackContent(formData: any): {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  faqs: Array<{ question: string; answer: string }>;
} {
  const {
    topic,
    primaryKeyword,
    secondaryKeywords,
    location = 'Kent',
    includeFAQ,
    includeInternalLinks,
  } = formData;

  const secondaryList = secondaryKeywords?.split(',').map((k: string) => k.trim()).filter(Boolean) || [];

  const content = `
<p class="lead">
  ${topic} is an important topic for anyone facing police investigation in ${location}. 
  Understanding your rights and options is essential for protecting your interests throughout the legal process.
</p>

<h2>Understanding ${topic}</h2>

<p>
  When it comes to ${primaryKeyword}, having expert legal guidance can make a significant difference to the outcome of your case. 
  Under the Police and Criminal Evidence Act 1984 (PACE), you have fundamental rights when dealing with the police, 
  including the right to free and independent legal advice from a qualified solicitor.
</p>

<p>
  ${secondaryList.length > 0 ? `Related matters such as ${secondaryList.slice(0, 2).join(' and ')} are also important considerations. ` : ''}
  As a qualified Duty Solicitor with Higher Rights of Audience (Criminal), I provide expert representation 
  across all ${location} custody suites, ensuring your rights are fully protected.
</p>

<h2>Your Rights and Options</h2>

<p>
  Whether you're attending a voluntary interview or have been arrested, you have the right to:
</p>

<ul>
  <li><strong>Free legal advice</strong> – Available from a qualified solicitor at any police station</li>
  <li><strong>Private consultation</strong> – Speak to your solicitor privately before any interview</li>
  <li><strong>Representation during interview</strong> – Have your solicitor present throughout questioning</li>
  <li><strong>Know the allegations</strong> – Be informed of what you're suspected of</li>
</ul>

<h2>Why Expert Representation Matters</h2>

<p>
  For matters involving ${topic.toLowerCase()}, having a qualified and experienced solicitor is crucial. 
  I have extensive experience handling cases involving ${primaryKeyword} throughout ${location}, 
  including at Medway, Maidstone, Canterbury, and Gravesend police stations.
</p>

<p>
  Unlike agency representatives, I am a fully qualified solicitor who can provide advice and representation 
  not just at the police station, but throughout any subsequent court proceedings if needed.
</p>

${includeInternalLinks ? `
<h2>Getting Help</h2>

<p>
  If you need assistance with ${topic.toLowerCase()} or any other police matter, don't hesitate to seek help. 
  Learn more about <a href="/services/police-station-representation">police station representation</a> or 
  <a href="/contact">contact me directly</a> for immediate assistance.
</p>
` : ''}

<h2>Contact for ${location} Police Station Representation</h2>

<p>
  I provide expert representation at all police stations in ${location} and surrounding areas. 
  Available from 9am to late, seven days a week, including bank holidays.
</p>

<p>
  <strong>Call 01732 247427</strong> for immediate assistance or 
  <strong>text 07535494446</strong> to request a duty solicitor.
</p>
`;

  const metaTitle = `${topic} | ${location} Duty Solicitor`.substring(0, 60);
  const metaDescription = `Expert guidance on ${topic.toLowerCase()} from qualified Duty Solicitor in ${location}. Free legal advice under PACE 1984. Call 01732 247427.`.substring(0, 155);
  const excerpt = `Understanding ${topic.toLowerCase()} is essential when facing police investigation. Get expert legal guidance from a qualified Duty Solicitor in ${location}.`;

  const faqs: Array<{ question: string; answer: string }> = includeFAQ ? [
    {
      question: `What should I know about ${topic.toLowerCase()}?`,
      answer: `${topic} is an important consideration in any police matter. You have the right to free legal advice from a qualified solicitor under PACE 1984, and it's strongly recommended to seek this advice before any police interview.`,
    },
    {
      question: `Can I get free legal advice for ${primaryKeyword}?`,
      answer: `Yes, legal advice at the police station is always free, regardless of your financial circumstances. This includes matters involving ${primaryKeyword}. I provide this service across all ${location} police stations.`,
    },
    {
      question: `How quickly can a solicitor help with ${topic.toLowerCase()} in ${location}?`,
      answer: `I aim to attend all ${location} custody suites promptly. I'm available from 9am to late, including weekends and bank holidays, covering Medway, Maidstone, Canterbury, Gravesend and all Kent police stations.`,
    },
    {
      question: `Why should I use a qualified Duty Solicitor rather than an agency representative?`,
      answer: `A Duty Solicitor is a fully qualified solicitor accredited under the Law Society scheme. I have Higher Rights of Audience (Criminal) and can represent you in court if needed. Agency representatives may not have these qualifications.`,
    },
  ] : [];

  return {
    title: topic,
    content: content.trim(),
    excerpt,
    metaTitle,
    metaDescription,
    faqs,
  };
}

/**
 * Generate the mandatory advert block HTML
 */
function generateAdvertBlock(): string {
  return `
<div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
  <h3 class="text-xl font-bold text-slate-900 mb-4">
    PoliceStationAgent.com - Expert Police Station Representation
  </h3>
  
  <p class="text-slate-700 mb-4">
    <strong>I am a qualified Police Station Duty Solicitor, not an agency or unregulated representative.</strong>
    With Higher Rights of Audience (Criminal) and extensive experience, I provide expert representation 
    across all Kent custody suites.
  </p>
  
  <p class="text-slate-700 mb-4">
    As an Accredited Duty Solicitor, I ensure your rights are protected under PACE 1984. My service covers 
    Medway, Maidstone, Canterbury, Gravesend, and all Kent police stations.
  </p>
  
  <div class="flex flex-col sm:flex-row gap-4 mt-6">
    <a href="mailto:robertcashman@defencelegalservices.co.uk" 
       class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors">
      Email for Police Station Representation
    </a>
    <a href="sms:07535494446?body=I need a duty solicitor" 
       class="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors">
      Send SMS to Request a Duty Solicitor
    </a>
  </div>
  
  <p class="text-sm text-slate-600 mt-4">
    <strong>Call 01732 247427</strong> - Available from 9am to late, including evenings, weekends, and bank holidays.
  </p>
</div>
`;
}

/**
 * Generate comprehensive schema.org structured data
 */
function generateSchema(
  title: string,
  metaDescription: string,
  slug: string,
  faqs: Array<{ question: string; answer: string }>,
  featuredImage: string | null,
  category: string,
  primaryKeyword: string,
  location: string
): any {
  const dateNow = new Date().toISOString();

  // Main Article schema
  const articleSchema: any = {
    '@type': 'Article',
    '@id': `${SITE_URL}/blog/${slug}#article`,
    headline: title,
    description: metaDescription,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#author`,
      name: 'Robert Cashman',
      jobTitle: 'Duty Solicitor & Higher Court Advocate',
      description: 'Qualified Police Station Duty Solicitor with Higher Rights of Audience (Criminal)',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'LegalService',
      '@id': `${SITE_URL}/#organization`,
      name: 'PoliceStationAgent.com',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      areaServed: {
        '@type': 'Place',
        name: location || 'Kent',
      },
      serviceType: 'Criminal Defence Solicitor',
    },
    datePublished: dateNow,
    dateModified: dateNow,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    keywords: primaryKeyword,
    articleSection: category,
    inLanguage: 'en-GB',
  };

  if (featuredImage) {
    articleSchema.image = {
      '@type': 'ImageObject',
      url: featuredImage.startsWith('http') ? featuredImage : `${SITE_URL}${featuredImage}`,
    };
  }

  // Build the graph
  const graph: any[] = [articleSchema];

  // Add FAQPage schema if FAQs exist
  if (faqs.length > 0) {
    const faqSchema = {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/blog/${slug}#faq`,
      mainEntity: faqs.map((faq, index) => ({
        '@type': 'Question',
        '@id': `${SITE_URL}/blog/${slug}#faq-${index + 1}`,
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
    graph.push(faqSchema);
  }

  // Add BreadcrumbList schema
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}/blog/${slug}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };
  graph.push(breadcrumbSchema);

  // Add LegalService schema for local SEO
  const legalServiceSchema = {
    '@type': 'LegalService',
    '@id': `${SITE_URL}/#legalservice`,
    name: 'PoliceStationAgent.com',
    description: 'Expert Police Station Representation by qualified Duty Solicitor',
    url: SITE_URL,
    telephone: '01732 247427',
    email: 'robertcashman@defencelegalservices.co.uk',
    areaServed: {
      '@type': 'Place',
      name: location || 'Kent',
    },
    serviceType: ['Criminal Defence', 'Police Station Representation', 'Duty Solicitor'],
    priceRange: 'Free (Legal Aid)',
  };
  graph.push(legalServiceSchema);

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Handle uploaded images - saves to public/blog-images directory
 */
async function handleUploadedImages(files: File[], slug: string): Promise<string[]> {
  const savedUrls: string[] = [];
  const uploadDir = path.join(process.cwd(), 'public', 'blog-images');
  
  await mkdir(uploadDir, { recursive: true });
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const seoFilename = `${slug}-${i + 1}.${ext}`;
    const filePath = path.join(uploadDir, seoFilename);
    
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));
    
    savedUrls.push(`/blog-images/${seoFilename}`);
  }
  
  return savedUrls;
}

/**
 * Generate an AI image (DALL·E) and persist it.
 *
 * Important: in serverless (e.g. Vercel) the filesystem is not durable, so this
 * will return null with an actionable error message.
 */
async function generateAiFeaturedImage(args: {
  topic: string;
  primaryKeyword: string;
  location: string;
  slug: string;
  correlationId: string;
}): Promise<{ url: string | null; error?: string }> {
  if (!OPENAI_API_KEY) {
    return { url: null, error: 'OPENAI_API_KEY not configured' };
  }

  const persistAsDataUrl = isServerlessRuntime();

  const prompt = [
    'Photorealistic editorial photograph.',
    'UK legal / police station theme, neutral and professional.',
    'No text, no logos, no watermarks, no identifiable faces.',
    `Concept: ${args.topic}.`,
    `SEO context: ${args.primaryKeyword}, ${args.location}.`,
    'Lighting: soft natural light. Composition: wide hero image.',
  ].join(' ');

  const callImages = async (model: string) =>
    fetchWithRetry(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          size: '1024x1024',
          response_format: 'b64_json',
        }),
      },
      { timeoutMs: 60000, maxAttempts: 3, correlationId: args.correlationId, stage: `generate_ai_image_${model}` }
    );

  let res = await callImages('gpt-image-1');

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error?.message || errMsg;
    } catch {
      // ignore
    }

    // Fallback for accounts that only have DALL·E 3 available.
    if (/model|gpt-image-1/i.test(errMsg)) {
      res = await callImages('dall-e-3');
      if (!res.ok) {
        try {
          const err2 = await res.json();
          errMsg = err2.error?.message || errMsg;
        } catch {
          // ignore
        }
      } else {
        errMsg = '';
      }
    }

    if (!res.ok) return { url: null, error: `OpenAI image API error: ${errMsg}` };
  }

  const json = (await res.json()) as any;
  const b64: string | undefined = json?.data?.[0]?.b64_json;
  const remoteUrl: string | undefined = json?.data?.[0]?.url;

  // If we didn't get base64 back, we can't persist it reliably.
  if (!b64) {
    return {
      url: null,
      error: remoteUrl
        ? 'OpenAI returned a temporary URL instead of image bytes; cannot persist without downloading.'
        : 'OpenAI response did not contain image bytes.',
    };
  }

  // Serverless fallback: return a data URL (no filesystem persistence required).
  // Note: this will not work for social previews (OpenGraph), but it will render in-page.
  if (persistAsDataUrl) {
    return { url: `data:image/png;base64,${b64}` };
  }

  const uploadDir = path.join(process.cwd(), 'public', 'blog-images');
  await mkdir(uploadDir, { recursive: true });

  const filename = `${args.slug}-ai-1.png`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, Buffer.from(b64, 'base64'));

  return { url: `/blog-images/${filename}` };
}

/**
 * POST handler for blog generation
 */
export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(
    request.headers.get('x-correlation-id') || request.headers.get('x-request-id')
  );

  try {
    const startedAt = Date.now();
    logJson('info', { stage: 'received', correlationId });

    // Verify admin session
    const session = await getAdminSession();

    if (!session) {
      logJson('warn', { stage: 'failed', correlationId, success: false, errorCode: 'UNAUTHORIZED' });
      return NextResponse.json(
        { error: 'Unauthorized', correlationId },
        { status: 401, headers: { 'x-correlation-id': correlationId } }
      );
    }

    let formData: any;
    let uploadedImageUrls: string[] = [];
    let aiImageUrl: string | null = null;
    let aiImageError: string | undefined;

    // Handle request format
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const multipartData = await request.formData();
      const jsonData = multipartData.get('data');
      if (typeof jsonData === 'string') {
        formData = JSON.parse(jsonData);
      } else {
        logJson('warn', { stage: 'failed', correlationId, success: false, errorCode: 'INVALID_FORM_DATA' });
        return NextResponse.json(
          { error: 'Invalid form data', correlationId },
          { status: 400, headers: { 'x-correlation-id': correlationId } }
        );
      }
      
      const files = multipartData.getAll('uploadedImages') as File[];
      if (files.length > 0) {
        const slug = generateSlug(formData.topic || formData.primaryKeyword);
        uploadedImageUrls = await handleUploadedImages(files, slug);
      }
    } else {
      formData = await request.json();
    }

    // Validate & normalize request
    logJson('info', { stage: 'validating_request', correlationId });
    const parsed = GenerateBlogRequestSchema.safeParse(formData);
    if (!parsed.success) {
      logJson('warn', {
        stage: 'failed',
        correlationId,
        success: false,
        errorCode: 'INVALID_REQUEST',
        errorMessage: parsed.error.message,
      });
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten(), correlationId },
        { status: 400, headers: { 'x-correlation-id': correlationId } }
      );
    }
    formData = parsed.data;

    // Create observability record (best-effort; do not block generation)
    try {
      createBlogGenerationRun({
        correlationId,
        status: 'queued',
        stage: 'received',
        requestJson: {
          ...formData,
          // Do not store raw image URLs in logs/runs if not necessary
          imageUrlsCount: Array.isArray(formData.imageUrls) ? formData.imageUrls.length : 0,
          imageUrls: undefined,
        },
      });
    } catch (e) {
      logJson('warn', {
        stage: 'failed',
        correlationId,
        success: false,
        errorCode: 'RUN_RECORD_CREATE_FAILED',
        errorMessage: e instanceof Error ? e.message : String(e),
      });
    }

    // Generate content - use AI if available, fallback otherwise
    let generatedContent;
    let usingAI = false;
    let aiStatus = '';

    if (OPENAI_API_KEY) {
      aiStatus = `OPENAI_API_KEY detected (${OPENAI_API_KEY.substring(0, 8)}...). `;
      try {
        try {
          updateBlogGenerationRun({ correlationId, status: 'generating_text', stage: 'generating_text' });
        } catch {}
        logJson('info', { stage: 'generating_text', correlationId });
        generatedContent = await generateAIContent(formData, correlationId);
        usingAI = true;
        aiStatus += 'AI generation succeeded.';
      } catch (aiError) {
        const message = aiError instanceof Error ? aiError.message : String(aiError);
        aiStatus += `AI generation failed: ${message}. Using template content.`;
        console.error('AI generation failed, using fallback:', aiError);
        generatedContent = generateFallbackContent(formData);
        try {
          updateBlogGenerationRun({
            correlationId,
            status: 'failed',
            stage: 'generating_text',
            errorCode: 'TEXT_GENERATION_FAILED',
            errorMessage: message,
          });
        } catch {}
      }
    } else {
      aiStatus = 'OPENAI_API_KEY not found; using template content.';
      console.log('No OPENAI_API_KEY configured, using fallback content generation');
      generatedContent = generateFallbackContent(formData);
    }

    const { title, content, excerpt, metaTitle, metaDescription, faqs } = generatedContent;
    const slug = generateSlug(formData.topic || formData.primaryKeyword);

    // Append mandatory advert block
    const contentWithAdvert = content + generateAdvertBlock();

    // Handle AI image generation (optional)
    if (formData.imageSource === 'ai') {
      try {
        try {
          updateBlogGenerationRun({ correlationId, status: 'generating_images', stage: 'generating_images' });
        } catch {}
        logJson('info', { stage: 'generating_images', correlationId });
        const img = await generateAiFeaturedImage({
          topic: formData.topic,
          primaryKeyword: formData.primaryKeyword,
          location: formData.location,
          slug,
          correlationId,
        });
        aiImageUrl = img.url;
        aiImageError = img.error;
        if (aiImageUrl) {
          aiStatus += ' AI image generation succeeded.';
        } else if (aiImageError) {
          aiStatus += ` AI image generation failed: ${aiImageError}`;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        aiImageError = msg;
        aiStatus += ` AI image generation failed: ${msg}`;
      }
    }

    // Handle images
    const allImageUrls = [
      ...uploadedImageUrls,
      ...(aiImageUrl ? [aiImageUrl] : []),
      ...(formData.imageUrls || []).filter((url: string) => url && url.trim()),
    ];

    let featuredImage: string | null = null;
    if (allImageUrls.length > 0) {
      const featuredIndex = formData.featuredImageIndex ?? 0;
      featuredImage = allImageUrls[featuredIndex] || allImageUrls[0] || null;
    }

    // Optionally embed featured image into HTML content so the public blog index
    // (which historically extracted images from content) can display it.
    let finalContent = contentWithAdvert;
    if (formData.includeInContentImages && featuredImage) {
      finalContent =
        `<p><img src="${featuredImage}" alt="${metaTitle || title}" /></p>` + finalContent;
    }

    // Generate comprehensive schema
    const schema = generateSchema(
      title,
      metaDescription,
      slug,
      faqs,
      featuredImage,
      formData.category,
      formData.primaryKeyword,
      formData.location
    );

    const responseBody = {
      title,
      slug,
      content: finalContent,
      excerpt,
      metaTitle,
      metaDescription,
      faqs,
      schema,
      image: featuredImage,
      imageUrls: allImageUrls,
      generatedWithAI: usingAI,
      aiStatus,
      aiImageGenerated: !!aiImageUrl,
      aiImageError: aiImageError || null,
      correlationId,
    };

    try {
      updateBlogGenerationRun({
        correlationId,
        status: 'saving',
        stage: 'assembling_preview',
        resultJson: {
          slug,
          generatedWithAI: usingAI,
          aiImageGenerated: !!aiImageUrl,
          image: featuredImage,
        },
      });
    } catch {}

    logJson('info', {
      stage: 'done',
      correlationId,
      success: true,
      durationMs: Date.now() - startedAt,
      usingAI,
      aiImageGenerated: !!aiImageUrl,
    });
    return NextResponse.json(responseBody, {
      headers: { 'x-correlation-id': correlationId },
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    try {
      updateBlogGenerationRun({
        correlationId,
        status: 'failed',
        stage: 'failed',
        errorCode: 'UNHANDLED',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } catch {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate blog post', correlationId },
      { status: 500, headers: { 'x-correlation-id': correlationId } }
    );
  }
}