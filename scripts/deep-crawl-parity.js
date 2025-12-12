const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const SOURCE_SITE = 'https://policestationagent.com';
const TARGET_SITE = 'https://criminaldefencekent.co.uk';

// Patterns to include
const INCLUDE_PATTERNS = [
  /\/blog\//,
  /\/post\//,
  /\/articles?\//,
  /\/information\//,
  /\/services\//,
  /\/contact\//,
  /\/about\//,
  /\/coverage\//,
  /police-station/,
  /station/,
  /fees/,
  /legal-aid/,
  /faq/,
  /voluntary-interview/,
  /rights/,
  /caution/,
  /refusing/,
  /solicitor/,
  /agent/,
  /rep/,
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  /\/admin/,
  /\/login/,
  /\/api\//,
  /\.(pdf|jpg|png|gif|svg|css|js)$/i,
  /#/,
  /mailto:/,
  /tel:/,
];

function shouldInclude(url) {
  const urlLower = url.toLowerCase();
  
  // Exclude patterns take precedence
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(urlLower)) return false;
  }
  
  // Include if matches any include pattern or is root
  if (urlLower === SOURCE_SITE || urlLower === SOURCE_SITE + '/' || 
      urlLower === TARGET_SITE || urlLower === TARGET_SITE + '/' ||
      urlLower.startsWith(SOURCE_SITE) || urlLower.startsWith(TARGET_SITE)) {
    // Additional check: exclude external links
    if (!urlLower.startsWith(SOURCE_SITE) && !urlLower.startsWith(TARGET_SITE)) {
      return false;
    }
    return true;
  }
  
  return false;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url;
  }
}

function normalizePath(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url;
  }
}

async function extractPageContent(page) {
  try {
    const content = await page.content();
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Extract title
    const title = document.querySelector('title')?.textContent?.trim() || '';
    
    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    
    // Extract canonical
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    
    // Extract H1
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    
    // Extract all visible text (body)
    const bodyText = document.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
    
    // Extract CTAs (phone, SMS, WhatsApp, email)
    const ctas = {
      phone: [],
      sms: [],
      whatsapp: [],
      email: [],
    };
    
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || '';
      
      if (href.startsWith('tel:')) {
        ctas.phone.push({ href, text });
      } else if (href.startsWith('sms:')) {
        ctas.sms.push({ href, text });
      } else if (href.includes('wa.me') || href.includes('whatsapp')) {
        ctas.whatsapp.push({ href, text });
      } else if (href.startsWith('mailto:')) {
        ctas.email.push({ href, text });
      }
    });
    
    // Extract FAQ blocks (common patterns)
    const faqs = [];
    document.querySelectorAll('[class*="faq"], [class*="accordion"], [id*="faq"]').forEach(el => {
      const question = el.querySelector('h2, h3, h4, [class*="question"]')?.textContent?.trim();
      const answer = el.textContent?.replace(question || '', '').trim();
      if (question && answer) {
        faqs.push({ question, answer: answer.substring(0, 500) });
      }
    });
    
    // Extract structured sections (hero, services, coverage, etc.)
    const sections = {};
    const sectionSelectors = {
      hero: '[class*="hero"], [id*="hero"]',
      services: '[class*="service"], [id*="service"]',
      coverage: '[class*="coverage"], [class*="station"], [id*="coverage"]',
      cta: '[class*="cta"], [class*="call-to-action"]',
    };
    
    for (const [name, selector] of Object.entries(sectionSelectors)) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        sections[name] = Array.from(elements).map(el => 
          el.textContent?.replace(/\s+/g, ' ').trim().substring(0, 500)
        ).filter(Boolean);
      }
    }
    
    // Extract internal links
    const internalLinks = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        internalLinks.push(href);
      }
    });
    
    return {
      title,
      metaDescription: metaDesc,
      canonical,
      h1,
      bodyText: bodyText.substring(0, 10000), // Limit to 10k chars
      ctas,
      faqs,
      sections,
      internalLinks: [...new Set(internalLinks)],
      hasContent: bodyText.length > 500,
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    return {
      title: '',
      metaDescription: '',
      canonical: '',
      h1: '',
      bodyText: '',
      ctas: { phone: [], sms: [], whatsapp: [], email: [] },
      faqs: [],
      sections: {},
      internalLinks: [],
      hasContent: false,
    };
  }
}

async function getSitemapUrls(browser, baseUrl) {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
  ];
  
  const urls = new Set();
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const page = await browser.newPage();
      await page.goto(sitemapUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      const content = await page.content();
      
      // Extract URLs from sitemap
      const urlMatches = content.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        urlMatches.forEach(match => {
          const url = match.replace(/<\/?loc>/g, '').trim();
          if (url.startsWith(baseUrl) && shouldInclude(url)) {
            urls.add(normalizeUrl(url));
          }
        });
      }
      await page.close();
    } catch (error) {
      // Sitemap not found or error - continue
    }
  }
  
  return Array.from(urls);
}

async function crawlSite(browser, baseUrl, maxDepth = 3) {
  const visited = new Set();
  const pages = [];
  
  // Start with sitemap URLs if available
  console.log(`  Checking for sitemap...`);
  const sitemapUrls = await getSitemapUrls(browser, baseUrl);
  console.log(`  Found ${sitemapUrls.length} URLs from sitemap`);
  
  const queue = [
    { url: baseUrl, depth: 0 },
    ...sitemapUrls.map(url => ({ url, depth: 1 }))
  ];

  while (queue.length > 0) {
    const { url, depth } = queue.shift();
    const normalized = normalizeUrl(url);

    if (visited.has(normalized) || depth > maxDepth) continue;
    if (!shouldInclude(normalized)) continue;

    visited.add(normalized);

    try {
      console.log(`  [Depth ${depth}] ${normalized}`);
      const page = await browser.newPage();
      
      try {
        await page.goto(normalized, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });

        // Wait for JS to render
        await new Promise(resolve => setTimeout(resolve, 2000));

        const content = await extractPageContent(page);

        const pageData = {
          url: normalized,
          path: normalizePath(normalized),
          depth,
          status: '200',
          ...content,
        };

        pages.push(pageData);

        // Find all links on the page
        const links = await page.evaluate((baseUrl) => {
          const anchors = Array.from(document.querySelectorAll('a[href]'));
          const found = new Set();
          
          anchors.forEach(a => {
            try {
              let href = a.getAttribute('href');
              if (!href) return;
              
              // Handle relative URLs
              if (href.startsWith('/')) {
                href = baseUrl + href;
              } else if (!href.startsWith('http')) {
                href = new URL(href, window.location.href).href;
              }
              
              // Only include same-origin URLs
              if (!href.startsWith(baseUrl)) return;
              
              // Remove fragments and query params for matching
              const url = new URL(href);
              url.hash = '';
              url.search = '';
              found.add(url.href);
            } catch (e) {
              // Skip invalid URLs
            }
          });
          
          return Array.from(found);
        }, baseUrl);

        // Add new links to queue
        for (const link of links) {
          const normalizedLink = normalizeUrl(link);
          if (!visited.has(normalizedLink) && 
              normalizedLink.startsWith(baseUrl) && 
              shouldInclude(normalizedLink)) {
            queue.push({ url: normalizedLink, depth: depth + 1 });
          }
        }

        await page.close();
      } catch (error) {
        console.error(`    Error: ${error.message}`);
        pages.push({
          url: normalized,
          path: normalizePath(normalized),
          depth,
          status: 'error',
          error: error.message,
        });
        await page.close();
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  Error processing ${normalized}:`, error.message);
    }
  }

  return pages;
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Word overlap
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

function matchPages(sourcePages, targetPages) {
  const matches = [];
  const matchedTargets = new Set();

  // First pass: exact path match
  const targetByPath = new Map();
  targetPages.forEach(p => {
    targetByPath.set(p.path.toLowerCase(), p);
  });

  sourcePages.forEach(source => {
    const targetPath = source.path.toLowerCase();
    const exactMatch = targetByPath.get(targetPath);
    
    if (exactMatch) {
      matches.push({
        source,
        target: exactMatch,
        matchType: 'exact_path',
        confidence: 1.0,
      });
      matchedTargets.add(exactMatch.path);
      return;
    }
  });

  // Second pass: title similarity
  sourcePages.forEach(source => {
    if (matches.find(m => m.source.url === source.url)) return;
    
    let bestMatch = null;
    let bestScore = 0;
    
    targetPages.forEach(target => {
      if (matchedTargets.has(target.path)) return;
      
      const titleScore = calculateSimilarity(source.title, target.title);
      const h1Score = calculateSimilarity(source.h1, target.h1);
      const combinedScore = Math.max(titleScore, h1Score * 0.9);
      
      if (combinedScore > bestScore && combinedScore > 0.6) {
        bestScore = combinedScore;
        bestMatch = target;
      }
    });
    
    if (bestMatch) {
      matches.push({
        source,
        target: bestMatch,
        matchType: 'title_h1_similarity',
        confidence: bestScore,
      });
      matchedTargets.add(bestMatch.path);
    } else {
      matches.push({
        source,
        target: null,
        matchType: 'missing',
        confidence: 0,
      });
    }
  });

  return matches;
}

function analyzeContentParity(matches) {
  const parity = [];

  matches.forEach(match => {
    const { source, target } = match;

    if (!target) {
      parity.push({
        sourceUrl: source.url,
        targetUrl: 'MISSING',
        section: 'ENTIRE_PAGE',
        sourceEvidence: `${source.title} | ${source.h1} | ${source.bodyText.substring(0, 200)}`,
        targetEvidence: 'not found',
        verdict: 'MISSING',
        action: 'CREATE_PAGE',
        notes: `Clone entire page from ${source.url}`,
      });
      return;
    }

    // Compare sections
    const sections = {
      title: { source: source.title, target: target.title },
      metaDescription: { source: source.metaDescription, target: target.metaDescription },
      h1: { source: source.h1, target: target.h1 },
      bodyText: { source: source.bodyText, target: target.bodyText },
      ctas: { source: source.ctas, target: target.ctas },
      faqs: { source: source.faqs, target: target.faqs },
    };

    for (const [sectionName, { source: src, target: tgt }] of Object.entries(sections)) {
      const srcText = typeof src === 'string' ? (src || '') : JSON.stringify(src || {});
      const tgtText = typeof tgt === 'string' ? (tgt || '') : JSON.stringify(tgt || {});
      
      const similarity = calculateSimilarity(srcText, tgtText);
      
      let verdict = 'OK';
      let action = 'NONE';
      
      if (similarity < 0.3) {
        verdict = 'MISSING';
        action = 'COPY_EXACT';
      } else if (similarity < 0.7) {
        verdict = 'PARTIAL';
        action = 'UPDATE_PARTIAL';
      }

      if (verdict !== 'OK' || sectionName === 'ENTIRE_PAGE') {
        const srcText = src ? (typeof src === 'string' ? src : JSON.stringify(src)) : '';
        const tgtText = tgt ? (typeof tgt === 'string' ? tgt : JSON.stringify(tgt)) : '';
        
        parity.push({
          sourceUrl: source.url,
          targetUrl: target.url,
          section: sectionName,
          sourceEvidence: srcText ? srcText.substring(0, 200) : 'not found',
          targetEvidence: tgtText ? tgtText.substring(0, 200) : 'not found',
          verdict,
          action,
          notes: `Similarity: ${(similarity * 100).toFixed(1)}%`,
        });
      }
    }
  });

  return parity;
}

async function generateReport(sourcePages, targetPages, matches, parity) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      sourcePages: sourcePages.length,
      targetPages: targetPages.length,
      matched: matches.filter(m => m.target).length,
      missing: matches.filter(m => !m.target).length,
      parityIssues: parity.length,
    },
    crawlMap: {
      source: sourcePages.map(p => ({
        url: p.url,
        path: p.path,
        status: p.status,
        title: p.title,
        h1: p.h1,
      })),
      target: targetPages.map(p => ({
        url: p.url,
        path: p.path,
        status: p.status,
        title: p.title,
        h1: p.h1,
      })),
    },
    routeMatrix: matches.map(m => ({
      sourceUrl: m.source.url,
      sourcePath: m.source.path,
      targetUrl: m.target?.url || 'MISSING',
      targetPath: m.target?.path || 'MISSING',
      matchType: m.matchType,
      confidence: m.confidence,
    })),
    contentParityMatrix: parity,
    topPriorityFixes: parity
      .filter(p => p.verdict === 'MISSING' && p.section === 'ENTIRE_PAGE')
      .slice(0, 10)
      .map(p => ({
        sourceUrl: p.sourceUrl,
        action: p.action,
        notes: p.notes,
      })),
  };

  const reportPath = path.join(__dirname, '..', 'CONTENT_PARITY_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 REPORT SUMMARY');
  console.log('==================');
  console.log(`Source pages crawled: ${sourcePages.length}`);
  console.log(`Target pages crawled: ${targetPages.length}`);
  console.log(`Matched pages: ${matches.filter(m => m.target).length}`);
  console.log(`Missing pages: ${matches.filter(m => !m.target).length}`);
  console.log(`Content parity issues: ${parity.length}`);
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('🚀 Starting deep crawl and content parity audit...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('📡 Crawling source site:', SOURCE_SITE);
    const sourcePages = await crawlSite(browser, SOURCE_SITE, 3);
    console.log(`✅ Crawled ${sourcePages.length} pages from source\n`);

    console.log('📡 Crawling target site:', TARGET_SITE);
    const targetPages = await crawlSite(browser, TARGET_SITE, 3);
    console.log(`✅ Crawled ${targetPages.length} pages from target\n`);

    console.log('🔍 Matching pages...');
    const matches = matchPages(sourcePages, targetPages);
    console.log(`✅ Matched ${matches.filter(m => m.target).length} pages\n`);

    console.log('📊 Analyzing content parity...');
    const parity = analyzeContentParity(matches);
    console.log(`✅ Found ${parity.length} parity issues\n`);

    console.log('📝 Generating report...');
    const report = await generateReport(sourcePages, targetPages, matches, parity);
    
    return report;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, crawlSite, matchPages, analyzeContentParity };
