import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { processQuery, calculateSearchScore } from '@/lib/chatbot-utils';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function isGenuineLegalClient(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // EXCLUDE: Third-party queries (asking about others)
  const thirdPartyIndicators = [
    'someone', 'friend', 'family', 'relative', 'loved one', 'partner',
    'they', 'them', 'their', 'person', 'he', 'she', 'his', 'her',
    'find out about', 'information about', 'get information',
    'someone in custody', 'friend arrested', 'family member arrested'
  ];
  
  if (thirdPartyIndicators.some(ind => lowerQuery.includes(ind))) {
    return false;
  }
  
  // EXCLUDE: Crime reporting
  const crimeReportingIndicators = [
    'report a crime', 'report an incident', 'make a report',
    'been a victim', 'report to police', 'file a report'
  ];
  
  if (crimeReportingIndicators.some(ind => lowerQuery.includes(ind))) {
    return false;
  }
  
  // EXCLUDE: Pure informational/educational queries
  const informationalIndicators = [
    'what is', 'what are', 'how does', 'how long', 'explain',
    'tell me about', 'which police stations', 'do you cover',
    'is legal advice free', 'how much does', 'what happens if'
  ];
  
  // Only exclude if purely informational (no action words)
  const hasActionWords = ['need', 'want', 'should i', 'going to'].some(w => lowerQuery.includes(w));
  
  if (informationalIndicators.some(ind => lowerQuery.includes(ind)) && !hasActionWords) {
    return false;
  }
  
  // INCLUDE: First-person with immediate legal need
  const firstPersonIndicators = [
    ' i ', ' me ', ' my ', 'myself', "i've", "i have", "i need", "i want", "i'm", " i am"
  ];
  
  const immediateLegalNeedIndicators = [
    'voluntary interview', 'police interview', 'been arrested', 'arrested me',
    'interview coming', 'interview next', 'going to be interviewed',
    'need a solicitor', 'need representation', 'need legal advice',
    'what should i do', 'contacted by police', 'police want to interview',
    'going to police station', 'interview under caution'
  ];
  
  const isFirstPerson = firstPersonIndicators.some(ind => lowerQuery.includes(ind));
  const hasImmediateNeed = immediateLegalNeedIndicators.some(ind => lowerQuery.includes(ind));
  
  return isFirstPerson && hasImmediateNeed;
}

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 300
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

function stripHTML(html: string): string {
  if (!html) return '';
  let text = html.replace(/<[^>]*>/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&hellip;/g, '...');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Load FAQ from FAQContent.tsx
function loadFAQContent() {
  try {
    const faqPath = path.join(process.cwd(), 'app', 'faq', 'FAQContent.tsx');
    const faqContent = fs.readFileSync(faqPath, 'utf8');
    
    const faqItems: Array<{ question: string; answer: string }> = [];
    const faqPattern = /question:\s*['"`]([^'"`]+)['"`]\s*,\s*answer:\s*['"`]([\s\S]*?)['"`]/g;
    let match;
    
    while ((match = faqPattern.exec(faqContent)) !== null) {
      const question = match[1].trim();
      let answer = match[2].trim();
      answer = answer.replace(/\\n/g, ' ').replace(/\\'/g, "'").replace(/\\"/g, '"');
      
      if (question && answer) {
        faqItems.push({ question, answer });
      }
    }
    
    return faqItems;
  } catch (error) {
    console.error('Error loading FAQ:', error);
    return [];
  }
}

// Load blog posts
function loadBlogPosts() {
  try {
    const blogPath = path.join(process.cwd(), 'data', 'blog-posts-full.json');
    if (fs.existsSync(blogPath)) {
      const blogData = fs.readFileSync(blogPath, 'utf8');
      const posts = JSON.parse(blogData);
      return posts.map((post: any) => ({
        title: post.title,
        content: stripHTML(post.content || post.excerpt || ''),
        slug: post.slug
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

// Crawl all app pages for content
function crawlAllPages() {
  const pages: Array<{ title: string; content: string; url: string }> = [];
  
  try {
    const appDir = path.join(process.cwd(), 'app');
    const directories = fs.readdirSync(appDir, { withFileTypes: true });
    
    for (const dir of directories) {
      if (dir.isDirectory()) {
        const pagePath = path.join(appDir, dir.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          try {
            const pageContent = fs.readFileSync(pagePath, 'utf8');
            
            // Extract dangerouslySetInnerHTML content
            const htmlMatch = pageContent.match(/dangerouslySetInnerHTML=\{\s*\{\s*__html:\s*`([^`]+)`/);
            if (htmlMatch) {
              const htmlContent = stripHTML(htmlMatch[1]);
              const cleanContent = htmlContent.substring(0, 5000); // Limit to 5000 chars per page
              
              // Get page URL
              const url = dir.name === 'home' ? '/' : `/${dir.name}`;
              
              // Extract title from content or use directory name
              const titleMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              const title = titleMatch ? titleMatch[1] : dir.name.replace(/-/g, ' ');
              
              if (cleanContent.length > 100) {
                pages.push({
                  title: title,
                  content: cleanContent,
                  url: url
                });
              }
            }
          } catch (err) {
            // Skip pages that can't be read
          }
        }
      }
    }
  } catch (error) {
    console.error('Error crawling pages:', error);
  }
  
  return pages;
}

export async function POST(request: NextRequest) {
  try {
    const { query, conversationHistory } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const { normalized: searchQuery } = processQuery(query);
    
    const results: Array<{
      type: 'faq' | 'blog' | 'page';
      title: string;
      content: string;
      url: string;
      score: number;
    }> = [];
    
    // Search FAQ
    const faqContent = loadFAQContent();
    faqContent.forEach(item => {
      const questionScore = calculateSearchScore(searchQuery, item.question, true, true);
      const answerScore = calculateSearchScore(searchQuery, item.answer, false, false);
      
      let boost = 0;
      const queryLower = searchQuery.toLowerCase();
      const questionLower = item.question.toLowerCase();
      
      if ((queryLower.includes('find') || queryLower.includes('information') || queryLower.includes('someone') || queryLower.includes('custody')) &&
          (questionLower.includes('information') || questionLower.includes('someone') || questionLower.includes('arrested') || questionLower.includes('confidential'))) {
        boost = 15;
      }
      
      if (queryLower === questionLower || questionLower.includes(queryLower) || queryLower.includes(questionLower.substring(0, 20))) {
        boost += 20;
      }
      
      const totalScore = questionScore * 2.5 + answerScore + boost;
      
      if (totalScore > 10) {
        results.push({
          type: 'faq',
          title: item.question,
          content: item.answer,
          url: '/faq',
          score: totalScore
        });
      }
    });

    // Search blog posts
    const blogPosts = loadBlogPosts();
    blogPosts.forEach((post: any) => {
      const titleScore = calculateSearchScore(searchQuery, post.title, true, false);
      const contentScore = calculateSearchScore(searchQuery, post.content, false, false);
      const totalScore = titleScore * 2.5 + contentScore;
      
      if (totalScore > 10) {
        const excerpt = post.content.length > 600 ? post.content.substring(0, 600) + '...' : post.content;
        
        results.push({
          type: 'blog',
          title: post.title,
          content: excerpt,
          url: `/blog/${post.slug}`,
          score: totalScore
        });
      }
    });
    
    // Search ALL website pages
    const allPages = crawlAllPages();
    allPages.forEach(page => {
      const titleScore = calculateSearchScore(searchQuery, page.title, true, false);
      const contentScore = calculateSearchScore(searchQuery, page.content, false, false);
      const totalScore = titleScore * 2 + contentScore;
      
      if (totalScore > 8) {
        const excerpt = page.content.length > 600 ? page.content.substring(0, 600) + '...' : page.content;
        
        results.push({
          type: 'page',
          title: page.title,
          content: excerpt,
          url: page.url,
          score: totalScore
        });
      }
    });
    
    // Sort by score, prioritize FAQ
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.type === 'faq') return -1;
      if (b.type === 'faq') return 1;
      return 0;
    });
    const topResults = results.slice(0, 7);

    // Special handling for "find out about someone in custody"
    const queryLower = query.toLowerCase();
    if ((queryLower.includes('find') || queryLower.includes('find out')) && 
        (queryLower.includes('someone') || queryLower.includes('person')) && 
        (queryLower.includes('custody') || queryLower.includes('arrested'))) {
      const confidentialityFAQ = results.find(r => 
        r.type === 'faq' && 
        (r.title.toLowerCase().includes('information') || 
         r.title.toLowerCase().includes('someone') || 
         r.title.toLowerCase().includes('confidential'))
      );
      
      if (confidentialityFAQ) {
        return NextResponse.json({
          answer: `I understand you want to find out about someone in custody. ${stripHTML(confidentialityFAQ.content)}`,
          sources: [{
            type: confidentialityFAQ.type,
            title: confidentialityFAQ.title,
            url: confidentialityFAQ.url
          }],
          usedAI: false
        });
      }
    }
    
    let answer = '';
    let usedAI = false;
    
    if (topResults.length > 0) {
      if (OPENAI_API_KEY && topResults[0].score > 10) {
        try {
          // Build context from top 7 results, 600 chars each
          const context = topResults.slice(0, 7).map(r => {
            return `Source: ${r.title} (${r.type})\n${stripHTML(r.content)}`;
          }).join('\n\n---\n\n');
          
          const conversationContext = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.slice(-3).map((msg: any) => 
                `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
              ).join('\n')
            : '';

          const systemPrompt = `You are a helpful legal assistant for Police Station Agent (criminaldefencekent.co.uk), a Kent police station duty solicitor service.

CRITICAL RULES:
1. Answer questions based STRICTLY on the provided context from our website ONLY
2. Do NOT use general legal knowledge - only use information from the provided context
3. If the context doesn't contain relevant information, say "I don't have specific information about that on our website. Please check our [FAQ page](/faq) or [contact us](/contact) for more details."
4. Be specific and directly relevant to the question asked
5. Reference specific details from the website content (locations, services, procedures mentioned)
6. Maximum 100 words
7. Use simple, clear language
8. Use markdown: **bold** for key points

Focus on providing accurate, site-specific information that directly answers the user's question.`;

          const userPrompt = conversationContext
            ? `Previous conversation:\n${conversationContext}\n\nQuestion: ${query}\n\nWebsite Context:\n${context}`
            : `Question: ${query}\n\nWebsite Context:\n${context}`;

          const aiAnswer = await callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], 200);
          
          if (aiAnswer && aiAnswer.trim().length > 20) {
            // Remove phone message - users can find contact info elsewhere
            answer = aiAnswer.trim();
            usedAI = true;
          }
        } catch (error) {
          console.error('OpenAI failed:', error);
        }
      }
      
      if (!usedAI) {
        const topResult = topResults[0];
        const cleanContent = stripHTML(topResult.content);
        const displayContent = topResult.type === 'faq' 
          ? cleanContent 
          : cleanContent.length > 200 ? cleanContent.substring(0, 200) + '...' : cleanContent;
        
        // Remove phone message - users can find contact info elsewhere
        
        if (topResult.type === 'faq') {
          answer = displayContent;
        } else {
          answer = `Based on "${topResult.title}": ${displayContent}`;
        }
        
        if (topResults.length > 1 && topResults[1].score > 10) {
          answer += `\n\nSee also: [${topResults[1].title}](${topResults[1].url})`;
        }
      }
    } else {
      // When no results found, don't use general AI knowledge - only reference site resources
      answer = `I don't have specific information about that on our website. Please check our [FAQ page](/faq), [blog articles](/blog), or [contact us](/contact) for more details about police station representation in Kent.`;
    }
    
    return NextResponse.json({
      answer,
      sources: topResults.slice(0, 3).map(r => ({
        type: r.type,
        title: r.title,
        url: r.url
      })),
      usedAI
    });
  } catch (error) {
    console.error('Error in chatbot search:', error);
    return NextResponse.json(
      { error: 'An error occurred', answer: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
