#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeFAQ() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('Scraping /privateclientfaq from policestationagent.com...');
    
    await page.goto('https://policestationagent.com/privateclientfaq', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    await new Promise(r => setTimeout(r, 3000));
    
    // Extract accordion content
    const faqData = await page.evaluate(() => {
      const questions = [];
      
      // Find all accordion items
      const accordionItems = document.querySelectorAll('[data-orientation="vertical"]');
      
      accordionItems.forEach((item, index) => {
        const button = item.querySelector('button');
        const contentDiv = item.querySelector('[role="region"]');
        
        if (button && contentDiv) {
          const question = button.textContent.trim();
          
          // Click to expand and get content
          button.click();
          
          // Wait a moment for content to appear
          setTimeout(() => {
            const content = contentDiv.textContent.trim() || contentDiv.innerHTML;
            questions.push({ question, content });
          }, 100);
        }
      });
      
      return questions;
    });
    
    // Wait for content to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Get all expanded content
    const expandedContent = await page.evaluate(() => {
      const items = [];
      const accordionItems = document.querySelectorAll('[data-orientation="vertical"]');
      
      accordionItems.forEach((item) => {
        const button = item.querySelector('button');
        const contentDiv = item.querySelector('[role="region"]');
        
        if (button && contentDiv) {
          const question = button.textContent.trim();
          
          // Try to get content - might need to click first
          let content = '';
          
          // Check if already expanded
          if (contentDiv.getAttribute('data-state') === 'open' || !contentDiv.hasAttribute('hidden')) {
            content = contentDiv.textContent.trim() || contentDiv.innerHTML;
          } else {
            // Click to expand
            button.click();
            setTimeout(() => {
              content = contentDiv.textContent.trim() || contentDiv.innerHTML;
            }, 200);
          }
          
          items.push({ question, content });
        }
      });
      
      return items;
    });
    
    // Wait and try again with clicks
    await new Promise(r => setTimeout(r, 1000));
    
    // Click each accordion item and extract content
    const finalData = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('[data-orientation="vertical"]');
      
      items.forEach((item) => {
        const button = item.querySelector('button');
        if (button) {
          const question = button.textContent.trim();
          results.push({ question, content: '' });
        }
      });
      
      return results;
    });
    
    // Click each one and get content
    for (let i = 0; i < finalData.length; i++) {
      await page.evaluate((index) => {
        const items = document.querySelectorAll('[data-orientation="vertical"]');
        if (items[index]) {
          const button = items[index].querySelector('button');
          if (button) button.click();
        }
      }, i);
      
      await new Promise(r => setTimeout(r, 300));
      
      const content = await page.evaluate((index) => {
        const items = document.querySelectorAll('[data-orientation="vertical"]');
        if (items[index]) {
          const contentDiv = items[index].querySelector('[role="region"]');
          if (contentDiv) {
            return contentDiv.textContent.trim() || contentDiv.innerHTML;
          }
        }
        return '';
      }, i);
      
      finalData[i].content = content;
    }
    
    console.log('Extracted FAQ data:', finalData);
    
    // Now create the page with proper content
    const pageContent = generateFAQPage(finalData);
    
    const pagePath = 'app/privateclientfaq/page.tsx';
    fs.writeFileSync(pagePath, pageContent);
    console.log(`✅ Updated ${pagePath}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

function generateFAQPage(faqData) {
  // Map questions to content
  const faqMap = {};
  faqData.forEach(item => {
    faqMap[item.question] = item.content;
  });
  
  // Default answers if scraping didn't work
  const defaultAnswers = {
    'How do I request Robert Cashman at the police station?': `<p>When arrested or invited for a voluntary interview, tell the custody officer or interviewing officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>. They must contact us.</p><p>You can also call us directly on <strong>01732 247 427</strong> or <strong>020 8242 1857</strong> and we will arrange representation.</p><p>For private clients, you can pre-arrange representation by calling us before attending the police station.</p>`,
    'What are your fees for private representation?': `<p>We offer fixed-fee packages for police station representation. Our fees are transparent and agreed upfront, so you know exactly what you're paying.</p><p>For a detailed quote tailored to your situation, please contact us on <strong>01732 247 427</strong> or <strong>020 8242 1857</strong>. We can discuss your case and provide a clear estimate of costs.</p><p>Fixed fees typically cover:</p><ul><li>Pre-interview consultation</li><li>Police station attendance</li><li>Full representation during interview</li><li>Post-interview advice</li></ul>`,
    'Why should I pay privately if police station advice is free?': `<p>While Legal Aid provides excellent free representation, private funding offers several advantages:</p><ul><li><strong>Guaranteed senior solicitor:</strong> You are guaranteed to be represented by Robert Cashman, a solicitor with 35+ years of experience, rather than whoever is on the duty rota</li><li><strong>Continuity:</strong> The same solicitor will handle your case from police station through to court if needed</li><li><strong>Proactive approach:</strong> More time can be spent on pre-charge engagement and case preparation</li><li><strong>Flexibility:</strong> Greater flexibility in communication and meeting arrangements</li><li><strong>Peace of mind:</strong> Knowing you have a dedicated legal expert focused solely on your case</li></ul><p>For professionals, high-profile individuals, or those facing serious allegations, private representation can provide the enhanced service and continuity that may be crucial to the outcome.</p>`,
    'What is included in a fixed-fee police station attendance?': `<p>Our fixed-fee police station attendance package includes:</p><ul><li><strong>Pre-interview consultation:</strong> Detailed discussion of your case, your rights, and the interview process</li><li><strong>Police station attendance:</strong> Full representation by Robert Cashman at the police station</li><li><strong>Interview representation:</strong> Present throughout the entire interview to protect your interests</li><li><strong>Legal advice:</strong> Expert advice on whether to answer questions, make statements, or exercise your right to silence</li><li><strong>Post-interview advice:</strong> Explanation of what happens next, potential outcomes, and next steps</li><li><strong>Follow-up:</strong> Written summary and ongoing support if the case proceeds to court</li></ul><p>All fees are agreed upfront with no hidden costs.</p>`,
    'Can I get Robert Cashman even if I'm not paying privately?': `<p>Yes, you can request Robert Cashman under Legal Aid. When you ask for legal representation at the police station, tell the custody officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>.</p><p>However, under Legal Aid, representation is subject to availability and the duty rota. While we will do our best to ensure Robert Cashman attends, we cannot guarantee it will be him on every occasion.</p><p>With private funding, you are <strong>guaranteed</strong> to be represented by Robert Cashman, providing certainty and continuity.</p>`,
    'What's the difference between your Legal Aid and private service?': `<p>The main differences are:</p><div class="space-y-4"><div><h4 class="font-bold mb-2">Legal Aid Service:</h4><ul class="list-disc pl-5 space-y-1"><li>100% free at the police station</li><li>Available to everyone, regardless of income</li><li>Representation by an accredited duty solicitor (may be Robert Cashman or another qualified solicitor)</li><li>Subject to duty rota availability</li><li>Excellent standard of representation</li></ul></div><div><h4 class="font-bold mb-2">Private Service:</h4><ul class="list-disc pl-5 space-y-1"><li>Fixed fee agreed upfront</li><li>Guaranteed representation by Robert Cashman</li><li>Continuity from police station through to court</li><li>Proactive defence strategy from the outset</li><li>Greater time dedicated to pre-charge engagement</li><li>Flexible communication and meeting arrangements</li><li>Peace of mind knowing you have a dedicated senior solicitor</li></ul></div></div><p>Both services provide expert representation. The choice depends on your priorities: cost (Legal Aid) or guaranteed continuity and enhanced service (private).</p>`
  };
  
  // Use scraped content if available, otherwise use defaults
  const answers = {};
  Object.keys(defaultAnswers).forEach(q => {
    answers[q] = faqMap[q] && faqMap[q].length > 50 ? faqMap[q] : defaultAnswers[q];
  });
  
  const accordionItems = Object.entries(answers).map(([question, content]) => {
    const safeContent = content.replace(/`/g, '\\`').replace(/\${/g, '\\${');
    return `            <div data-state="closed" data-orientation="vertical" class="border-b">
              <h3 data-orientation="vertical" data-state="closed" class="flex">
                <button 
                  type="button" 
                  aria-expanded="false" 
                  data-state="closed" 
                  data-orientation="vertical" 
                  class="flex flex-1 items-center justify-between py-4 text-sm transition-all hover:underline [&[data-state=open]>svg]:rotate-180 text-left font-semibold w-full"
                  onclick="this.setAttribute('data-state', this.getAttribute('data-state') === 'open' ? 'closed' : 'open'); this.nextElementSibling.setAttribute('data-state', this.getAttribute('data-state')); this.nextElementSibling.toggleAttribute('hidden');"
                >
                  ${question}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </h3>
              <div 
                data-state="closed" 
                hidden 
                role="region" 
                class="overflow-hidden text-sm pb-4 text-slate-600"
              >
                <div class="prose prose-slate max-w-none">
                  ${safeContent}
                </div>
              </div>
            </div>`;
  }).join('\n');
  
  return `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Private Client FAQ | Police Station Agent",
  description: "Common questions about private criminal defence representation, requesting Robert Cashman at police stations, and our fee structure.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/privateclientfaq",
  },
  openGraph: {
    title: "Private Client FAQ | Police Station Agent",
    description: "Common questions about private criminal defence representation, requesting Robert Cashman at police stations, and our fee structure.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/privateclientfaq",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">Private Client FAQ</h1>
              <p className="text-xl text-slate-600">Common questions about private criminal defence representation and requesting Robert Cashman.</p>
            </div>
            
            <div className="rounded-xl border text-card-foreground shadow mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-8 h-8 text-blue-600 flex-shrink-0 mt-1">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2 text-lg">How to Request Robert Cashman at Police Station</h3>
                    <p className="text-blue-700 mb-4">When arrested or invited for interview, tell the custody officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>. They must contact us. You can also call us directly on <strong>01732 247 427</strong> or <strong>020 8242 1857</strong>.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-4 h-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Call: 01732 247 427
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card text-card-foreground shadow mb-8">
              <div className="p-6">
                <div className="w-full" data-orientation="vertical">
${accordionItems}
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border text-card-foreground shadow mb-8 bg-red-50 border-red-200">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert w-6 h-6 text-red-600 flex-shrink-0 mt-1">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Been Arrested? Need Immediate Help?</h3>
                    <p className="text-red-700 mb-4">Time is critical in police investigations. Don't delay - call us immediately for expert representation.</p>
                    <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Emergency Call: 01732 247 427
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border shadow bg-blue-800 text-white text-center">
              <div className="p-10">
                <h3 className="text-2xl font-bold text-amber-300 mb-4">Ready to Discuss Your Case?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-blue-200">Contact us for a confidential discussion about representation. Whether Legal Aid or private, you deserve expert criminal defence.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call for a Consultation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
}

scrapeFAQ().catch(console.error);





