#!/usr/bin/env node
/**
 * Sync shared cross-site assets from policestationagent (canonical) to sister repos.
 *
 * Copies identical docs/lib files and refreshes @robertcashman/firm-outreach-core where present.
 * Regenerates seo-first-12-articles.md and per-site seo-inventory tables.
 *
 * Usage:
 *   node scripts/update-all-workspaces.mjs           # dry-run (default)
 *   node scripts/update-all-workspaces.mjs --apply     # write files + rebuild core packages
 *
 * Env:
 *   WORKSPACES_HOME — directory containing sister repos (auto-detected; see workspaces-home.mjs)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoPaths, WORKSPACE_REPOS } from './lib/workspaces-home.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PSA_ROOT = path.resolve(SCRIPT_DIR, '..');
const APPLY = process.argv.includes('--apply');

const SHARED_FILES = [
  'docs/seo-cross-site-strategy.md',
  'docs/site-standards.md',
  'lib/utm.ts',
];

const CORE_FILES = ['package.json', 'tsconfig.json'];

function listFiles(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push(path.relative(base, full));
    }
  }
  return out.sort();
}

function copyFile(from, to, targetRoot, changes) {
  const src = fs.readFileSync(from);
  const destExists = fs.existsSync(to);
  const dest = destExists ? fs.readFileSync(to) : null;
  if (dest && src.equals(dest)) return;
  const rel = path.relative(targetRoot, to);
  changes.push(`${destExists ? 'update' : 'add'}: ${rel}`);
  if (APPLY) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function syncSharedFiles(targetRoot, repoKey, changes) {
  for (const rel of SHARED_FILES) {
    const from = path.join(PSA_ROOT, rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(targetRoot, rel);
    copyFile(from, to, targetRoot, changes);
  }
}

function syncFirmOutreachCore(targetRoot, changes) {
  const srcRoot = path.join(PSA_ROOT, 'packages/firm-outreach-core');
  const destRoot = path.join(targetRoot, 'packages/firm-outreach-core');
  if (!fs.existsSync(srcRoot)) return;

  for (const rel of CORE_FILES) {
    copyFile(path.join(srcRoot, rel), path.join(destRoot, rel), targetRoot, changes);
  }

  const srcDir = path.join(srcRoot, 'src');
  for (const rel of listFiles(srcDir)) {
    copyFile(path.join(srcDir, rel), path.join(destRoot, 'src', rel), targetRoot, changes);
  }

  const distDir = path.join(srcRoot, 'dist');
  if (fs.existsSync(distDir)) {
    for (const rel of listFiles(distDir)) {
      copyFile(path.join(distDir, rel), path.join(destRoot, 'dist', rel), targetRoot, changes);
    }
  }
}

function main() {
  const repos = repoPaths(PSA_ROOT);
  const summary = [];

  console.log(`Canonical repo: ${PSA_ROOT}`);
  console.log(`Workspaces home: ${path.dirname(repos.repuk)}`);
  console.log(APPLY ? 'Mode: apply\n' : 'Mode: dry-run\n');

  for (const [key, cfg] of Object.entries(WORKSPACE_REPOS)) {
    const target = repos[key];
    if (key === 'psa') continue;
    if (!fs.existsSync(target)) {
      console.log(`skip ${cfg.label}: not found at ${target}`);
      summary.push({ key, label: cfg.label, status: 'missing', changes: 0 });
      continue;
    }

    const changes = [];
    syncSharedFiles(target, key, changes);
    if (cfg.syncCore) syncFirmOutreachCore(target, changes);

    console.log(
      `${cfg.label}: ${changes.length ? changes.length + ' file(s)' : 'already in sync'}`,
    );
    for (const line of changes) console.log(`  ${line}`);
    summary.push({ key, label: cfg.label, status: 'ok', changes: changes.length });
  }

  if (APPLY) {
    console.log('\nRegenerating cross-repo docs…');
    const node = process.execPath;
    execSync(`${node} scripts/generate-first-12-doc.mjs`, { cwd: PSA_ROOT, stdio: 'inherit' });
    execSync(`${node} scripts/generate-seo-strategy-inventory.mjs`, { cwd: PSA_ROOT, stdio: 'inherit' });
  }

  const hasChanges = summary.some((s) => s.changes > 0);
  const hasMissing = summary.some((s) => s.status === 'missing');
  if (!APPLY && hasChanges) {
    console.log('\nRe-run with --apply to copy files and rebuild firm-outreach-core packages.');
  } else if (APPLY) {
    console.log('\nDone. Review diffs in each repo and commit.');
  } else if (hasMissing) {
    console.log(
      '\nNo shared-file changes detected in the repos that were found, but one or more workspaces were missing (skipped).',
    );
  } else {
    console.log('\nAll workspaces already in sync for shared files.');
  }
}

main();
