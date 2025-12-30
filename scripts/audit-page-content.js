/**
 * Heuristic audit for "thin content" pages.
 *
 * Scans Next.js App Router page files (app/.../page.tsx) and estimates visible
 * on-page text by extracting:
 * - JSX text nodes: >text<
 * - dangerouslySetInnerHTML strings: __html: `...` or "__html: \"...\""
 *
 * Outputs a sorted report (lowest word count first).
 *
 * This is an approximation meant to catch obviously thin pages.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');

function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

function routeFromPageFile(pageFile) {
  const rel = path.relative(APP_DIR, pageFile);
  const parts = rel.split(path.sep);
  if (parts[parts.length - 1] !== 'page.tsx') return null;
  const dirParts = parts.slice(0, -1);
  const filtered = dirParts.filter((seg) => seg && !seg.startsWith('(') && !seg.endsWith(')'));
  return '/' + filtered.join('/');
}

function stripTags(html) {
  return String(html)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDangerousHtmlStrings(source) {
  /** @type {string[]} */
  const chunks = [];

  // __html: `...`
  const tpl = /__html\s*:\s*`([\s\S]*?)`/g;
  let m;
  while ((m = tpl.exec(source)) !== null) chunks.push(m[1]);

  // __html: "...." (single line-ish)
  const dbl = /__html\s*:\s*"([\s\S]*?)"\s*[,\}]/g;
  while ((m = dbl.exec(source)) !== null) chunks.push(m[1]);

  return chunks;
}

function extractJsxTextNodes(source) {
  /** @type {string[]} */
  const nodes = [];
  // Very rough JSX text node extractor: > some text <
  const re = />\s*([^<>{}][^<>]{1,2000}?)\s*</g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const text = m[1]
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;
    // ignore common junk
    if (text === '|' || text === '•' || text === '›') continue;
    nodes.push(text);
  }
  return nodes;
}

function countWords(text) {
  if (!text) return 0;
  const words = String(text)
    .replace(/[^A-Za-z0-9’'\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  return words.length;
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(`Missing app dir: ${APP_DIR}`);
    process.exit(1);
  }

  const pages = listFilesRecursive(APP_DIR).filter((f) => f.endsWith(`${path.sep}page.tsx`));

  /** @type {{route:string, file:string, words:number, hasDangerousHtml:boolean, hasH1ish:boolean}[]} */
  const report = [];

  for (const file of pages) {
    const route = routeFromPageFile(file);
    if (!route) continue;

    // Skip API/app routes not user-facing (but keep /admin/login etc. - still a page)
    if (route.startsWith('/api/')) continue;

    const src = fs.readFileSync(file, 'utf8');
    const dangerousChunks = extractDangerousHtmlStrings(src);
    const jsxNodes = extractJsxTextNodes(src);

    const dangerousText = stripTags(dangerousChunks.join('\n\n'));
    const jsxText = jsxNodes.join(' ');

    const combined = `${dangerousText} ${jsxText}`.trim();
    const words = countWords(combined);

    const hasDangerousHtml = dangerousChunks.length > 0;
    const hasH1ish = /<h1\b/i.test(src) || /text-4xl/.test(src) || /<h1/i.test(dangerousChunks.join(''));

    report.push({
      route,
      file: path.relative(ROOT, file),
      words,
      hasDangerousHtml,
      hasH1ish,
    });
  }

  report.sort((a, b) => a.words - b.words);

  const outPath = path.join(ROOT, 'playwright-results', 'page-content-audit.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), total: report.length, report }, null, 2) + '\n', 'utf8');

  console.log('--- Page content audit (heuristic) ---');
  console.log(`Pages scanned: ${report.length}`);
  console.log(`Report written: ${outPath}`);
  console.log('\nLowest word-count pages (top 30):');
  for (const r of report.slice(0, 30)) {
    console.log(`- ${String(r.words).padStart(5)} words  ${r.route}  (${r.file})`);
  }
}

main();

