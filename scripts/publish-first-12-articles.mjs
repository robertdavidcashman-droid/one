#!/usr/bin/env node
/**
 * Verify / report first-12 article publish status across four sites.
 *
 * Usage:
 *   node scripts/publish-first-12-articles.mjs --dry-run
 *   node scripts/publish-first-12-articles.mjs --site=psa|psrtrain|custodynote|repuk
 *   node scripts/publish-first-12-articles.mjs --write-psa-buffer
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { repoPaths } from './lib/workspaces-home.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PSA_ROOT = path.dirname(SCRIPT_DIR);
const REPOS = repoPaths(PSA_ROOT);

const data = JSON.parse(
  fs.readFileSync(path.join(PSA_ROOT, 'docs/seo-first-12-articles.json'), 'utf-8'),
);

const DRY = process.argv.includes('--dry-run');
const WRITE_BUFFER = process.argv.includes('--write-psa-buffer');
const VERIFY_REPUK_CI =
  process.argv.includes('--verify-repuk-ci') ||
  (!process.argv.includes('--skip-repuk-ci') && !DRY);
const siteArg = process.argv.find((a) => a.startsWith('--site='))?.slice('--site='.length);

const PUBLISH_DATES = {
  'first-hour-after-arrest-kent': '2026-06-26',
  'out-of-hours-solicitor-kent-custody': '2026-06-27',
  'private-police-station-solicitor-cost-kent': '2026-06-28',
  'psras-exam-format-pass-mark-2026': '2026-06-26',
  'how-to-pass-critical-incidents-test': '2026-06-27',
  'free-psras-practice-questions': '2026-06-28',
  'attendance-note-template-guide': '2026-06-26',
  'laa-audit-proof-attendance-notes': '2026-06-27',
  'handwritten-vs-digital-custody-notes': '2026-06-28',
  'how-to-become-police-station-representative-2026': '2026-06-26',
  'freelance-rep-day-rate-2026': '2026-06-27',
  'building-firm-panel-freelance-reps': '2026-06-28',
};

function psaSlugExists(slug) {
  const dir = path.join(REPOS.psa, 'data/blog-posts');
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((f) => f.includes(slug) && f.endsWith('.json'));
}

function psrtrainSlugExists(slug) {
  const files = ['lib/blog/content.ts', 'lib/blog/content-batch-2.ts', 'lib/blog/content-batch-3.ts'];
  return files.some((f) => {
    const p = path.join(REPOS.psrtrain, f);
    return fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes(`slug: '${slug}'`);
  });
}

function custodynoteSlugExists(slug) {
  const guides = path.join(REPOS.custodynote, 'lib/guides.ts');
  return fs.existsSync(guides) && fs.readFileSync(guides, 'utf8').includes(`slug: "${slug}"`);
}

function repukSlugExists(slug) {
  const dir = path.join(REPOS.repuk, 'lib/blog');
  return fs.readdirSync(dir).some((f) => {
    if (!f.endsWith('.ts')) return false;
    return fs.readFileSync(path.join(dir, f), 'utf8').includes(`slug: '${slug}'`);
  });
}

const checkers = {
  policestationagent: psaSlugExists,
  psrtrain: psrtrainSlugExists,
  custodynote: custodynoteSlugExists,
  policestationrepuk: repukSlugExists,
};

function appendPsaBufferEntries() {
  const bufferPath = path.join(PSA_ROOT, 'seo-growth-police-station-agent/buffer/buffer-posts.json');
  const posts = JSON.parse(fs.readFileSync(bufferPath, 'utf-8'));
  const psaArticles = data.articles.filter((a) => a.site === 'policestationagent');
  let added = 0;
  for (const a of psaArticles) {
    const url = `https://www.policestationagent.com/blog/${a.slug}?utm_source=buffer&utm_medium=social&utm_campaign=click_blog_${a.slug}`;
    const exists = posts.some((p) => p.slug === a.slug && p.url.includes(a.slug));
    if (exists) continue;
    const date = PUBLISH_DATES[a.slug] ?? '2026-06-26';
    posts.push({
      date,
      type: 'blog',
      slug: a.slug,
      url,
      text: `${a.bufferCopy.short} Free legal advice at Kent police stations — NOT Kent Police. ${url}`,
      hashtags: '#Kent #PoliceStation #LegalAdvice #DutySolicitor',
      image: `https://www.policestationagent.com/blog-images/${a.slug}-featured.png`,
    });
    added++;
  }
  posts.sort((x, y) => x.date.localeCompare(y.date));
  if (!DRY) fs.writeFileSync(bufferPath, `${JSON.stringify(posts, null, 2)}\n`);
  console.log(`${DRY ? '[dry-run] would add' : 'added'} ${added} PSA buffer entries`);
}

const articles = siteArg
  ? data.articles.filter((a) => {
      const map = { psa: 'policestationagent', psrtrain: 'psrtrain', custodynote: 'custodynote', repuk: 'policestationrepuk' };
      return a.site === map[siteArg];
    })
  : data.articles;

console.log(DRY ? 'First-12 publish check (DRY RUN)' : 'First-12 publish check');
let missing = 0;
for (const a of articles) {
  const fn = checkers[a.site];
  const ok = fn?.(a.slug);
  const date = PUBLISH_DATES[a.slug] ?? '?';
  console.log(`${ok ? '✓' : '✗'} ${a.site.padEnd(20)} ${a.slug} (publish ${date})`);
  if (!ok) missing++;
}

if (WRITE_BUFFER || (DRY && process.argv.includes('--write-psa-buffer'))) {
  appendPsaBufferEntries();
}

if (missing > 0) {
  console.log(`\n${missing} article(s) not yet published in repo.`);
  process.exit(DRY ? 0 : 1);
}
console.log('\nAll checked articles are present.');

if (VERIFY_REPUK_CI && fs.existsSync(REPOS.repuk)) {
  console.log('\nRunning REPUK blog CI gates (audit:blog-seo, audit:blog-orphans)…');
  execSync('npm run verify:blog-ci', { cwd: REPOS.repuk, stdio: 'inherit' });
  console.log('REPUK blog CI gates passed.');
}
