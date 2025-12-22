/**
 * One-off codemod: standardize canonical domain in code.
 *
 * Rewrites hard-coded policestationagent.com URLs to criminaldefencekent.co.uk
 * across selected source folders (app/, components/, config/, lib/).
 *
 * Usage:
 *   node scripts/fix-canonical-domain.js
 */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

const TARGET_DIRS = [
  path.join(WORKSPACE_ROOT, 'app'),
  path.join(WORKSPACE_ROOT, 'components'),
  path.join(WORKSPACE_ROOT, 'config'),
  path.join(WORKSPACE_ROOT, 'lib'),
];

const EXTENSIONS = new Set(['.ts', '.tsx', '.js']);

const REPLACEMENTS = [
  // Protocol-prefixed URLs
  ['https://www.policestationagent.com', 'https://criminaldefencekent.co.uk'],
  ['http://www.policestationagent.com', 'https://criminaldefencekent.co.uk'],
  ['https://policestationagent.com', 'https://criminaldefencekent.co.uk'],
  ['http://policestationagent.com', 'https://criminaldefencekent.co.uk'],

  // Bare domains (rare in code, but present in config/constants)
  ['www.policestationagent.com', 'criminaldefencekent.co.uk'],
  ['policestationagent.com', 'criminaldefencekent.co.uk'],

  // Human-facing branded domain text
  ['PoliceStationAgent.com', 'CriminalDefenceKent.co.uk'],
];

function walk(dir, outFiles) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    // Skip generated / irrelevant folders if they exist under targets.
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.next' || ent.name === 'playwright-report') continue;
      walk(path.join(dir, ent.name), outFiles);
      continue;
    }
    const ext = path.extname(ent.name);
    if (!EXTENSIONS.has(ext)) continue;
    outFiles.push(path.join(dir, ent.name));
  }
}

function applyReplacements(text) {
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

function main() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) continue;
    walk(dir, files);
  }

  let changedFiles = 0;
  let changedTotal = 0;

  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    const after = applyReplacements(before);
    if (after === before) continue;
    fs.writeFileSync(file, after, 'utf8');
    changedFiles += 1;
    changedTotal += 1;
  }

  console.log(`✅ Done. Updated ${changedFiles} files.`);
}

if (require.main === module) {
  main();
}

