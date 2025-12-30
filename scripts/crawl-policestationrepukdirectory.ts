#!/usr/bin/env node
/**
 * Crawl policestationrepukdirectory.com (TypeScript source).
 *
 * This repo's tsconfig has "noEmit", so run the JS entrypoint:
 *   node scripts/crawl-policestationrepukdirectory.js
 *
 * Sitemap-first usage:
 *   node scripts/crawl-policestationrepukdirectory.js --from-sitemap
 *   node scripts/crawl-policestationrepukdirectory.js --from-sitemap --follow-links=false
 *
 * Output:
 *   data/crawled-urls.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { parseStringPromise } from 'xml2js';

type CrawlRecord = {
  url: string;
  title?: string;
  h1?: string;
};

type CrawlOutput = {
  startUrl: string;
  crawledAt: string;
  totalUniqueUrls: number;
  urls: CrawlRecord[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripWww(hostname: string): string {
  return hostname.toLowerCase().startsWith('www.') ? hostname.toLowerCase().slice(4) : hostname.toLowerCase();
}

function normalizeUrl(rawUrl: string, base?: string): string | null {
  try {
    const u = base ? new URL(rawUrl, base) : new URL(rawUrl);

    // Only http(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

    // Ignore query strings and hashes
    u.search = '';
    u.hash = '';

    // Normalize hostname and protocol casing
    u.hostname = u.hostname.toLowerCase();

    // Collapse multiple slashes in pathname (conservatively)
    u.pathname = u.pathname.replace(/\/{2,}/g, '/');

    // Trim trailing slash except root
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }

    // Drop default ports
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) {
      u.port = '';
    }

    return u.toString();
  } catch {
    return null;
  }
}

function isInternalUrl(candidateUrl: string, startUrl: string): boolean {
  try {
    const start = new URL(startUrl);
    const cand = new URL(candidateUrl);
    return stripWww(cand.hostname) === stripWww(start.hostname);
  } catch {
    return false;
  }
}

function parseArgs(argv: string[]) {
  const get = (key: string): string | undefined => {
    const prefix = `--${key}=`;
    const hit = argv.find((a) => a.startsWith(prefix));
    return hit ? hit.slice(prefix.length) : undefined;
  };

  const hasFlag = (flag: string): boolean => argv.includes(`--${flag}`);

  const startUrl = get('start') ?? 'https://policestationrepukdirectory.com/';
  const outFile = get('out') ?? path.join(__dirname, '..', 'data', 'crawled-urls.json');
  const delayMs = Number(get('delay-ms') ?? process.env.CRAWL_DELAY_MS ?? '750');
  const concurrency = Number(get('concurrency') ?? process.env.CRAWL_CONCURRENCY ?? '2');
  const maxPages = Number(get('max-pages') ?? process.env.CRAWL_MAX_PAGES ?? '0'); // 0 = unlimited
  const timeoutMs = Number(get('timeout-ms') ?? process.env.CRAWL_TIMEOUT_MS ?? '15000');
  const fromSitemap = hasFlag('from-sitemap') || process.env.CRAWL_FROM_SITEMAP === 'true';
  const followLinksRaw = get('follow-links') ?? process.env.CRAWL_FOLLOW_LINKS ?? 'true';
  const followLinks = String(followLinksRaw).toLowerCase() !== 'false';

  return {
    startUrl,
    outFile,
    delayMs: Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 750,
    concurrency: Number.isFinite(concurrency) && concurrency >= 1 ? Math.floor(concurrency) : 2,
    maxPages: Number.isFinite(maxPages) && maxPages >= 0 ? Math.floor(maxPages) : 0,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs >= 1000 ? Math.floor(timeoutMs) : 15000,
    fromSitemap,
    followLinks,
  };
}

async function fetchText(url: string, timeoutMs: number): Promise<{ finalUrl: string; text: string; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'polite-crawler/1.0 (+https://policestationrepukdirectory.com)',
        accept: 'text/plain,text/xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    return { finalUrl: res.url || url, text: await res.text(), status: res.status };
  } catch {
    return { finalUrl: url, text: '', status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchHtml(url: string, timeoutMs: number): Promise<{ finalUrl: string; html: string | null; contentType?: string; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Identify as a crawler, but keep it simple and honest.
        'user-agent': 'polite-crawler/1.0 (+https://policestationrepukdirectory.com)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const contentType = res.headers.get('content-type') ?? undefined;
    const isHtml = !!contentType && contentType.toLowerCase().includes('text/html');
    const html = isHtml ? await res.text() : null;

    return { finalUrl: res.url || url, html, contentType, status: res.status };
  } catch (e: any) {
    return { finalUrl: url, html: null, status: 0, contentType: undefined };
  } finally {
    clearTimeout(timeout);
  }
}

function extractTitleAndH1(html: string): { title?: string; h1?: string; links: string[] } {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const title = document.querySelector('title')?.textContent?.trim() || undefined;
  const h1 = document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ')?.trim() || undefined;

  const links: string[] = [];
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    links.push(href);
  });

  return { title, h1, links };
}

function extractSitemapLocs(xmlObj: any): string[] {
  const locs: string[] = [];

  const urlset = xmlObj?.urlset;
  if (urlset?.url && Array.isArray(urlset.url)) {
    for (const u of urlset.url) {
      const loc = u?.loc?.[0];
      if (typeof loc === 'string') locs.push(loc.trim());
    }
  }

  const sitemapindex = xmlObj?.sitemapindex;
  if (sitemapindex?.sitemap && Array.isArray(sitemapindex.sitemap)) {
    for (const sm of sitemapindex.sitemap) {
      const loc = sm?.loc?.[0];
      if (typeof loc === 'string') locs.push(loc.trim());
    }
  }

  return locs;
}

async function getSitemapUrlsFromRobots(startUrl: string, timeoutMs: number): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const robotsUrl = `${origin}/robots.txt`;
  const { text } = await fetchText(robotsUrl, timeoutMs);
  const lines = String(text || '').split(/\r?\n/);
  const sitemapUrls: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*Sitemap:\s*(\S+)\s*$/i);
    if (m?.[1]) sitemapUrls.push(m[1].trim());
  }
  return sitemapUrls;
}

async function collectAllSitemapLocs(startUrl: string, timeoutMs: number): Promise<{ sitemapUrls: string[]; pageUrls: string[] }> {
  const seedSitemaps = await getSitemapUrlsFromRobots(startUrl, timeoutMs);
  if (seedSitemaps.length === 0) return { sitemapUrls: [], pageUrls: [] };

  const sitemapQueue = [...seedSitemaps];
  const seenSitemaps = new Set<string>();
  const pageUrls = new Set<string>();

  while (sitemapQueue.length) {
    const nextSitemap = sitemapQueue.shift();
    if (!nextSitemap) continue;
    const normalizedSitemap = normalizeUrl(nextSitemap);
    const sitemapKey = normalizedSitemap ?? nextSitemap;
    if (seenSitemaps.has(sitemapKey)) continue;
    seenSitemaps.add(sitemapKey);

    const { text } = await fetchText(nextSitemap, timeoutMs);
    if (!text) continue;

    let parsed: any;
    try {
      parsed = await parseStringPromise(text);
    } catch {
      continue;
    }

    const locs = extractSitemapLocs(parsed);
    for (const loc of locs) {
      if (loc.toLowerCase().includes('.xml')) {
        if (!seenSitemaps.has(loc)) sitemapQueue.push(loc);
      } else {
        pageUrls.add(loc);
      }
    }
  }

  return { sitemapUrls: Array.from(seenSitemaps), pageUrls: Array.from(pageUrls) };
}

async function crawl(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const normalizedStart = normalizeUrl(args.startUrl);
  if (!normalizedStart) {
    throw new Error(`Invalid --start URL: ${args.startUrl}`);
  }

  const startHost = stripWww(new URL(normalizedStart).hostname);
  const outAbs = path.isAbsolute(args.outFile) ? args.outFile : path.join(process.cwd(), args.outFile);

  // Ensure output directory exists
  const outDir = path.dirname(outAbs);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const queue: string[] = [];
  const enqueued = new Set<string>();
  const visited = new Set<string>();
  const records = new Map<string, CrawlRecord>();

  if (args.fromSitemap) {
    console.log('Seeding crawl from sitemap(s) listed in robots.txt ...');
    const { sitemapUrls, pageUrls } = await collectAllSitemapLocs(normalizedStart, args.timeoutMs);
    console.log(`Found ${sitemapUrls.length} sitemap file(s), ${pageUrls.length} URL(s) in sitemap(s).`);

    for (const raw of pageUrls) {
      const normalized = normalizeUrl(raw);
      if (!normalized) continue;
      if (!isInternalUrl(normalized, normalizedStart)) continue;
      if (stripWww(new URL(normalized).hostname) !== startHost) continue;
      if (!enqueued.has(normalized)) {
        enqueued.add(normalized);
        queue.push(normalized);
      }
    }
  } else {
    queue.push(normalizedStart);
    enqueued.add(normalizedStart);
  }

  let inFlight = 0;

  async function worker(workerId: number) {
    while (true) {
      const next = queue.shift();
      if (!next) return;

      if (args.maxPages > 0 && visited.size >= args.maxPages) return;
      if (visited.has(next)) continue;

      visited.add(next);
      inFlight += 1;

      try {
        // Polite delay per request (per worker)
        await sleep(args.delayMs);

        const res = await fetchHtml(next, args.timeoutMs);
        const normalizedFinal = normalizeUrl(res.finalUrl) ?? next;

        // If we got redirected to a different URL within the same host, ensure it's tracked too.
        if (normalizedFinal !== next && isInternalUrl(normalizedFinal, normalizedStart)) {
          if (!visited.has(normalizedFinal)) visited.add(normalizedFinal);
        }

        if (!records.has(normalizedFinal)) {
          records.set(normalizedFinal, { url: normalizedFinal });
        }

        // Only parse HTML for title/h1 and outbound links.
        if (res.html) {
          const { title, h1, links } = extractTitleAndH1(res.html);

          const existing = records.get(normalizedFinal)!;
          if (title && !existing.title) existing.title = title;
          if (h1 && !existing.h1) existing.h1 = h1;

          if (!args.followLinks) continue;

          for (const href of links) {
            // Skip common non-HTTP schemes early
            const hrefTrimmed = href.trim();
            if (!hrefTrimmed) continue;
            if (/^(mailto|tel|javascript):/i.test(hrefTrimmed)) continue;

            const normalized = normalizeUrl(hrefTrimmed, normalizedFinal);
            if (!normalized) continue;

            // Internal links only (same host, ignoring www)
            if (!isInternalUrl(normalized, normalizedStart)) continue;

            // Ignore query strings is already handled by normalizeUrl
            const host = stripWww(new URL(normalized).hostname);
            if (host !== startHost) continue;

            if (!enqueued.has(normalized) && !visited.has(normalized)) {
              enqueued.add(normalized);
              queue.push(normalized);
            }
          }
        }

        if (visited.size % 25 === 0) {
          console.log(`[progress] visited=${visited.size} queued=${queue.length} unique=${records.size}`);
        }
      } finally {
        inFlight -= 1;
      }
    }
  }

  console.log(`Starting crawl from: ${normalizedStart}`);
  console.log(`Internal host: ${startHost}`);
  console.log(`Seed mode: ${args.fromSitemap ? 'sitemap' : 'homepage'}, Follow links: ${args.followLinks ? 'yes' : 'no'}`);
  console.log(`Concurrency: ${args.concurrency}, Delay: ${args.delayMs}ms, Max pages: ${args.maxPages || 'unlimited'}`);
  console.log(`Output: ${outAbs}\n`);

  const workers = Array.from({ length: args.concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  if (args.maxPages > 0 && visited.size >= args.maxPages) {
    console.log(`Stopped after reaching max-pages=${args.maxPages}`);
  }

  const urls = Array.from(records.values())
    .sort((a, b) => a.url.localeCompare(b.url));

  const out: CrawlOutput = {
    startUrl: normalizedStart,
    crawledAt: new Date().toISOString(),
    totalUniqueUrls: urls.length,
    urls,
  };

  fs.writeFileSync(outAbs, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`\nDone. Found ${urls.length} unique URL(s). Wrote: ${outAbs}`);
}

if (require.main === module) {
  crawl().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

