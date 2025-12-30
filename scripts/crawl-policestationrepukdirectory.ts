#!/usr/bin/env node
/**
 * Crawl policestationrepukdirectory.com (TypeScript source).
 *
 * This repo's tsconfig has "noEmit", so run the JS entrypoint:
 *   node scripts/crawl-policestationrepukdirectory.js
 *
 * Output:
 *   data/crawled-urls.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

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

  const startUrl = get('start') ?? 'https://policestationrepukdirectory.com/';
  const outFile = get('out') ?? path.join(__dirname, '..', 'data', 'crawled-urls.json');
  const delayMs = Number(get('delay-ms') ?? process.env.CRAWL_DELAY_MS ?? '750');
  const concurrency = Number(get('concurrency') ?? process.env.CRAWL_CONCURRENCY ?? '2');
  const maxPages = Number(get('max-pages') ?? process.env.CRAWL_MAX_PAGES ?? '0'); // 0 = unlimited
  const timeoutMs = Number(get('timeout-ms') ?? process.env.CRAWL_TIMEOUT_MS ?? '15000');

  return {
    startUrl,
    outFile,
    delayMs: Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 750,
    concurrency: Number.isFinite(concurrency) && concurrency >= 1 ? Math.floor(concurrency) : 2,
    maxPages: Number.isFinite(maxPages) && maxPages >= 0 ? Math.floor(maxPages) : 0,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs >= 1000 ? Math.floor(timeoutMs) : 15000,
  };
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

  const queue: string[] = [normalizedStart];
  const enqueued = new Set<string>([normalizedStart]);
  const visited = new Set<string>();
  const records = new Map<string, CrawlRecord>();

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
  console.log(`Concurrency: ${args.concurrency}, Delay: ${args.delayMs}ms, Max pages: ${args.maxPages || 'unlimited'}`);
  console.log(`Output: ${outAbs}\n`);

  const workers = Array.from({ length: args.concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Drain any remaining queued items if workers ended due to maxPages
  if (args.maxPages > 0) {
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

