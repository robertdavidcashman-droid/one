#!/usr/bin/env node
/**
 * Self-contained blog inventory extractor for all four sites.
 * No tsx/execSync — parses source files directly so it runs in any sandbox.
 *
 * Outputs:
 *   - policestationagent/docs/seo-inventory.json   (machine-readable, cross-site)
 *   - <repo>/docs/seo-inventory-table.md           (per-site markdown inventory table)
 *
 * Used to keep docs/seo-content-strategy.md inventory sections accurate.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { repoPaths } from './lib/workspaces-home.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PSA_ROOT = path.dirname(SCRIPT_DIR);
const REPOS = repoPaths(PSA_ROOT);

function readText(p) {
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8');
}
function readJson(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(readText(p));
}

/** Split a TS array source on a key, returning per-record substrings after the first marker. */
function recordsBy(text, marker) {
  return text.split(marker).slice(1);
}
function field(block, name) {
  const m = block.match(new RegExp(`${name}:\\s*["'\`]([^"'\`]+)["'\`]`));
  return m ? m[1] : '';
}
function arrayField(block, name) {
  const m = block.match(new RegExp(`${name}:\\s*\\[([^\\]]*)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/["'\`]([^"'\`]+)["'\`]/g)].map((x) => x[1]);
}

function repukInventory() {
  const dir = path.join(REPOS.repuk, 'lib/blog');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const text = readText(path.join(dir, `articles-batch-${i}.ts`));
    for (const block of recordsBy(text, 'slug:')) {
      const slug = (block.match(/^\s*["'`]([^"'`]+)["'`]/) || [])[1];
      if (!slug) continue;
      out.push({
        slug,
        title: field(block, 'title'),
        metaTitle: field(block, 'metaTitle'),
        metaDescription: field(block, 'metaDescription'),
        primaryKeyword: field(block, 'primaryKeyword'),
        categories: arrayField(block, 'categories'),
        published: field(block, 'published'),
      });
    }
  }
  return out;
}

function psaInventory() {
  const postsPath = path.join(REPOS.psa, 'public/blog-posts.json');
  if (!fs.existsSync(postsPath)) return [];
  return readJson(postsPath).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category || '',
    primaryKeyword: p.primaryKeyword || '',
    date: p.date || p.publishedAt || '',
  }));
}

function psrtrainInventory() {
  const dir = path.join(REPOS.psrtrain, 'lib/blog');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const file of ['content.ts', 'content-batch-2.ts', 'content-batch-3.ts']) {
    const text = readText(path.join(dir, file));
    for (const block of recordsBy(text, 'slug:')) {
      const slug = (block.match(/^\s*["'`]([^"'`]+)["'`]/) || [])[1];
      if (!slug) continue;
      out.push({
        slug,
        title: field(block, 'title'),
        category: field(block, 'category'),
        description: field(block, 'description'),
        keywords: arrayField(block, 'keywords'),
        published: field(block, 'published'),
        source: file,
      });
    }
  }
  return out;
}

function custodyInventory() {
  const out = [];
  const parseTs = (file, source) => {
    const filePath = path.join(REPOS.custodynote, file);
    if (!fs.existsSync(filePath)) return;
    const text = readText(filePath);
    for (const block of recordsBy(text, 'slug:')) {
      const slug = (block.match(/^\s*["'`]([^"'`]+)["'`]/) || [])[1];
      if (!slug || slug === 'string') continue;
      out.push({
        slug,
        title: field(block, 'title'),
        category: field(block, 'category'),
        source,
      });
    }
  };
  parseTs('lib/guides.ts', 'guides');
  parseTs('lib/staticBlogPosts.ts', 'static');
  const importsPath = path.join(REPOS.custodynote, 'data/blog-imports.json');
  const imports = readJson(importsPath);
  if (imports?.posts) {
    for (const p of imports.posts) {
    out.push({
      slug: p.slug,
      title: p.title,
      category: p.category || '',
      targetKeyword: p.targetKeyword || '',
      publishDate: p.publishDate || '',
      source: 'blog-imports',
    });
    }
  }
  return out;
}

function repoExists(repoPath) {
  return fs.existsSync(repoPath);
}

function safeInventory(name, fn) {
  try {
    return fn();
  } catch (err) {
    if (!repoExists(REPOS[name])) return [];
    throw err;
  }
}

const existingInventoryPath = path.join(REPOS.psa, 'docs/seo-inventory.json');
let previousInventory = null;
if (fs.existsSync(existingInventoryPath)) {
  try {
    previousInventory = JSON.parse(fs.readFileSync(existingInventoryPath, 'utf8'));
  } catch {
    previousInventory = null;
  }
}

function mergeInventory(key, fresh) {
  if (fresh.length > 0) return fresh;
  const cached = previousInventory?.[key];
  if (!repoExists(REPOS[key])) {
    if (Array.isArray(cached) && cached.length > 0) {
      console.warn(
        `preserving cached ${key} inventory (${cached.length} posts) — repo unavailable or unscannable`,
      );
      return cached;
    }
  }
  return fresh;
}

const inventory = {
  generatedAt: new Date().toISOString(),
  repuk: mergeInventory('repuk', safeInventory('repuk', repukInventory)),
  psa: mergeInventory('psa', safeInventory('psa', psaInventory)),
  psrtrain: mergeInventory('psrtrain', safeInventory('psrtrain', psrtrainInventory)),
  custodynote: mergeInventory('custodynote', safeInventory('custodynote', custodyInventory)),
};

function mdTable(rows, columns) {
  const header = `| ${columns.map((c) => c.label).join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${columns.map((c) => String(c.get(r) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)
    .join('\n');
  return [header, sep, body].join('\n');
}

function writeInventoryTable(repoKey, repoPath, rows, columns, heading) {
  if (!repoExists(repoPath)) {
    console.warn(`skip inventory table for ${repoKey}: ${repoPath} not found`);
    return;
  }
  const docsDir = path.join(repoPath, 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const md = `<!-- AUTO-GENERATED by policestationagent/scripts/generate-seo-strategy-inventory.mjs. Do not edit by hand. -->\n# ${heading}\n\n_${rows.length} published posts. Generated ${inventory.generatedAt}._\n\n${mdTable(rows, columns)}\n`;
  fs.writeFileSync(path.join(docsDir, 'seo-inventory-table.md'), md);
}

writeInventoryTable('repuk', REPOS.repuk, inventory.repuk, [
  { label: 'Slug', get: (r) => `\`${r.slug}\`` },
  { label: 'Title', get: (r) => r.title },
  { label: 'Categories', get: (r) => r.categories.join(', ') },
  { label: 'Primary keyword', get: (r) => r.primaryKeyword },
], 'policestationrepuk.org — Existing Content Inventory');

writeInventoryTable('psa', REPOS.psa, inventory.psa, [
  { label: 'Slug', get: (r) => `\`${r.slug}\`` },
  { label: 'Title', get: (r) => r.title },
  { label: 'Category', get: (r) => r.category },
  { label: 'Primary keyword', get: (r) => r.primaryKeyword },
], 'policestationagent.com — Existing Content Inventory');

writeInventoryTable('psrtrain', REPOS.psrtrain, inventory.psrtrain, [
  { label: 'Slug', get: (r) => `\`${r.slug}\`` },
  { label: 'Title', get: (r) => r.title },
  { label: 'Category', get: (r) => r.category },
  { label: 'Source', get: (r) => r.source },
], 'psrtrain.com — Existing Content Inventory');

writeInventoryTable('custodynote', REPOS.custodynote, inventory.custodynote, [
  { label: 'Slug', get: (r) => `\`${r.slug}\`` },
  { label: 'Title', get: (r) => r.title },
  { label: 'Store', get: (r) => r.source },
], 'custodynote.com — Existing Content Inventory');

const jsonPath = path.join(REPOS.psa, 'docs/seo-inventory.json');
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(inventory, null, 2));

console.log('Inventory written. Counts:', {
  repuk: inventory.repuk.length,
  psa: inventory.psa.length,
  psrtrain: inventory.psrtrain.length,
  custodynote: inventory.custodynote.length,
});
