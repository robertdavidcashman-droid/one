/**
 * Blog Content Generation API
 * 
 * DESIGN PRINCIPLES:
 * - Uses OpenAI for content generation only
 * - No image generation (DALL-E removed)
 * - No file uploads at this stage
 * - Returns structured content for preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/blog-persistence';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// =============================================================================
// OPENAI API CALL
// =============================================================================

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 2000
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// =============================================================================
// AI CONTENT GENERATION
// =============================================================================

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  faqs: Array<{ question: string; answer: string }>;
}

async function generateAIContent(formData: {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords?: string;
  location?: string;
  category?: string;
  seoLength?: string;
  includeFAQ?: boolean;
  includeInternalLinks?: boolean;
}): Promise<GeneratedContent> {
  const {
    topic,
    primaryKeyword,
    secondaryKeywords = '',
    location = 'Kent',
    category = 'Police Station Advice',
    seoLength = 'optimal',
    includeFAQ = true,
    includeInternalLinks = true,
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
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  // Build content prompt
  const contentPrompt = `You are an expert legal content writer specialising in UK criminal law, specifically police station representation and PACE 1984 rights.

Write a comprehensive, SEO-optimized blog article for CriminalDefenceKent.co.uk about:

**Topic:** ${topic}
**Primary Keyword:** ${primaryKeyword}
**Secondary Keywords:** ${secondaryKeywordsList.join(', ') || 'duty solicitor, PACE rights, police station representation'}
**Target Location:** ${location}
**Target Word Count:** ${targetWords} words
**Category:** ${category}

**REQUIREMENTS:**

1. **Content Focus:** Write specifically about "${topic}" - the content must be directly relevant.

2. **SEO Optimization:**
   - Use the primary keyword "${primaryKeyword}" naturally 3-5 times
   - Include secondary keywords where relevant
   - Use proper heading structure (H2, H3)
   - Include the location "${location}" naturally

3. **Legal Accuracy:**
   - Reference PACE 1984 and relevant UK law accurately
   - Mention specific rights and procedures
   - Be authoritative but accessible

4. **Structure:**
   - Engaging introduction addressing the reader's concern
   - Clear H2 headings to organize content
   - Practical advice and actionable information
   - Clear call to action

5. **Author Context:**
   - Robert Cashman, qualified Duty Solicitor with Higher Rights of Audience (Criminal)
   - Covers all ${location} custody suites including Medway, Maidstone, Canterbury, and Gravesend
   - Available 9am to late, including weekends and bank holidays
   - Phone: 01732 247427

${includeInternalLinks ? `6. **Internal Links:** Include 2-3 relevant internal links to:
   - /services/police-station-representation
   - /services/arrest-advice
   - /services/bail-advice
   - /contact` : ''}

**OUTPUT FORMAT:**
Return ONLY HTML content (no markdown). Use: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">.
Do NOT include <h1>. Do NOT include preamble.`;

  // Generate content
  let content = await callOpenAI([
    { role: 'system', content: 'You are a professional legal content writer for UK criminal defence. Write in British English. Be authoritative, helpful, and SEO-optimized.' },
    { role: 'user', content: contentPrompt },
  ], 3000);

  // Clean markdown artifacts
  content = content
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/gm, '')
    .replace(/```$/gm, '')
    .trim();

  // Add mandatory advert block
  content += generateAdvertBlock();

  // Generate meta elements
  const metaPrompt = `For this blog post about "${topic}" targeting "${primaryKeyword}" in ${location}:

Generate:
1. SEO Title (max 60 characters, include primary keyword)
2. Meta Description (max 155 characters, compelling and includes primary keyword)
3. Excerpt (2-3 sentences summarizing the article)

Format EXACTLY like this:
TITLE: [your title here]
META: [your meta description here]
EXCERPT: [your excerpt here]`;

  const metaResponse = await callOpenAI([
    { role: 'system', content: 'You are an SEO specialist. Be concise and follow character limits exactly.' },
    { role: 'user', content: metaPrompt },
  ], 500);

  // Parse meta response
  const titleMatch = metaResponse.match(/TITLE:\s*(.+?)(?:\n|$)/i);
  const metaMatch = metaResponse.match(/META:\s*(.+?)(?:\n|$)/i);
  const excerptMatch = metaResponse.match(/EXCERPT:\s*(.+?)(?:\n|$)/i);

  const metaTitle = titleMatch?.[1]?.trim().substring(0, 60) || `${topic} | ${location} Duty Solicitor`;
  const metaDescription = metaMatch?.[1]?.trim().substring(0, 155) || `Expert guidance on ${topic.toLowerCase()} from qualified Duty Solicitor in ${location}. PACE-compliant police station representation.`;
  const excerpt = excerptMatch?.[1]?.trim() || metaDescription;

  // Generate FAQs
  let faqs: Array<{ question: string; answer: string }> = [];
  if (includeFAQ) {
    const faqPrompt = `Generate 4-5 FAQ questions and answers about "${topic}" for someone in ${location} searching for "${primaryKeyword}".

Each FAQ should:
- Address a real concern about this topic
- Be specific to "${topic}"
- Reference UK law (PACE 1984) where relevant
- Be helpful and informative

Format EXACTLY like this:
Q: [Question here]
A: [Answer here - 2-3 sentences]

Q: [Question here]
A: [Answer here - 2-3 sentences]`;

    const faqResponse = await callOpenAI([
      { role: 'system', content: 'You are a legal FAQ writer. Create clear, helpful FAQs about UK criminal law.' },
      { role: 'user', content: faqPrompt },
    ], 1500);

    // Parse FAQs
    const faqPairs = faqResponse.split(/Q:\s*/i).filter(Boolean);
    for (const pair of faqPairs) {
      const parts = pair.split(/A:\s*/i);
      if (parts.length >= 2) {
        const question = parts[0].trim().replace(/\??\s*$/, '?');
        const answer = parts[1].trim().split(/\n\nQ:/i)[0].trim();
        if (question && answer && question.length > 10) {
          faqs.push({ question, answer });
        }
      }
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

// =============================================================================
// FALLBACK CONTENT (NO AI)
// =============================================================================

function generateFallbackContent(formData: {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords?: string;
  location?: string;
  includeFAQ?: boolean;
  includeInternalLinks?: boolean;
}): GeneratedContent {
  const {
    topic,
    primaryKeyword,
    secondaryKeywords = '',
    location = 'Kent',
    includeFAQ = true,
    includeInternalLinks = true,
  } = formData;

  const secondaryList = secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean);

  const content = `
<p>
  ${topic} is an important topic for anyone facing police investigation in ${location}. 
  Understanding your rights and options is essential for protecting your interests.
</p>

<h2>Understanding ${topic}</h2>

<p>
  When it comes to ${primaryKeyword}, having expert legal guidance can make a significant difference. 
  Under the Police and Criminal Evidence Act 1984 (PACE), you have fundamental rights when dealing with the police, 
  including the right to free and independent legal advice.
</p>

<p>
  ${secondaryList.length > 0 ? `Related matters such as ${secondaryList.slice(0, 2).join(' and ')} are also important considerations. ` : ''}
  As a qualified Duty Solicitor with Higher Rights of Audience (Criminal), I provide expert representation 
  across all ${location} custody suites.
</p>

<h2>Your Rights and Options</h2>

<p>Whether you're attending a voluntary interview or have been arrested, you have the right to:</p>

<ul>
  <li><strong>Free legal advice</strong> – Available from a qualified solicitor at any police station</li>
  <li><strong>Private consultation</strong> – Speak to your solicitor privately before any interview</li>
  <li><strong>Representation during interview</strong> – Have your solicitor present throughout questioning</li>
  <li><strong>Know the allegations</strong> – Be informed of what you're suspected of</li>
</ul>

<h2>Why Expert Representation Matters</h2>

<p>
  For matters involving ${topic.toLowerCase()}, having a qualified solicitor is crucial. 
  I have extensive experience handling cases involving ${primaryKeyword} throughout ${location}, 
  including at Medway, Maidstone, Canterbury, and Gravesend police stations.
</p>

${includeInternalLinks ? `
<h2>Getting Help</h2>

<p>
  If you need assistance with ${topic.toLowerCase()}, don't hesitate to seek help. 
  Learn more about <a href="/services/police-station-representation">police station representation</a> or 
  <a href="/contact">contact me directly</a>.
</p>
` : ''}

<h2>Contact for ${location} Police Station Representation</h2>

<p>
  I provide expert representation at all police stations in ${location} and surrounding areas. 
  Available from 9am to late, seven days a week, including bank holidays.
</p>

<p>
  <strong>Call 01732 247427</strong> for immediate assistance.
</p>
` + generateAdvertBlock();

  const metaTitle = `${topic} | ${location} Duty Solicitor`.substring(0, 60);
  const metaDescription = `Expert guidance on ${topic.toLowerCase()} from qualified Duty Solicitor in ${location}. Free legal advice under PACE 1984.`.substring(0, 155);
  const excerpt = `Understanding ${topic.toLowerCase()} is essential when facing police investigation. Get expert legal guidance from a qualified Duty Solicitor in ${location}.`;

  const faqs: Array<{ question: string; answer: string }> = includeFAQ ? [
    {
      question: `What should I know about ${topic.toLowerCase()}?`,
      answer: `${topic} is an important consideration in any police matter. You have the right to free legal advice under PACE 1984.`,
    },
    {
      question: `Can I get free legal advice for ${primaryKeyword}?`,
      answer: `Yes, legal advice at the police station is always free. I provide this service across all ${location} police stations.`,
    },
    {
      question: `How quickly can a solicitor help in ${location}?`,
      answer: `I aim to attend all ${location} custody suites promptly. Available 9am to late, including weekends and bank holidays.`,
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

// =============================================================================
// ADVERT BLOCK
// =============================================================================

function generateAdvertBlock(): string {
  return `
<div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
  <h3 class="text-xl font-bold text-slate-900 mb-4">
    CriminalDefenceKent.co.uk - Expert Police Station Representation
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
       class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
      Email for Police Station Representation
    </a>
    <a href="sms:07535494446?body=I need a duty solicitor" 
       class="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold">
      Send SMS to Request a Duty Solicitor
    </a>
  </div>
  
  <p class="text-sm text-slate-600 mt-4">
    <strong>Call 01732 247427</strong> - Available from 9am to late, including evenings, weekends, and bank holidays.
  </p>
</div>
`;
}

// =============================================================================
// POST HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const formData = await request.json();

    if (!formData.topic || !formData.primaryKeyword) {
      return NextResponse.json(
        { error: 'topic and primaryKeyword are required' },
        { status: 400 }
      );
    }

    // Generate content
    let generatedContent: GeneratedContent;

    if (OPENAI_API_KEY) {
      try {
        generatedContent = await generateAIContent(formData);
      } catch (aiError) {
        console.error('AI generation failed, using fallback:', aiError);
        generatedContent = generateFallbackContent(formData);
      }
    } else {
      generatedContent = generateFallbackContent(formData);
    }

    // Generate slug
    const slug = generateSlug(formData.topic);

    return NextResponse.json({
      title: generatedContent.title,
      slug,
      content: generatedContent.content,
      metaTitle: generatedContent.metaTitle,
      metaDescription: generatedContent.metaDescription,
      faqs: generatedContent.faqs,
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}
