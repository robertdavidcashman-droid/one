#!/usr/bin/env node
/**
 * Render docs/seo-first-12-articles.json into a readable markdown brief and
 * copy it into every repo's docs/ (like the cross-site master doc).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { repoPaths } from './lib/workspaces-home.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PSA_ROOT = path.dirname(SCRIPT_DIR);
const REPOS = repoPaths(PSA_ROOT);

const REPO_DOCS = [
  path.join(REPOS.psa, 'docs'),
  path.join(REPOS.repuk, 'docs'),
  path.join(REPOS.psrtrain, 'docs'),
  path.join(REPOS.custodynote, 'docs'),
].filter((docsDir) => {
  const repoRoot = path.dirname(docsDir);
  return repoRoot === REPOS.psa || fs.existsSync(repoRoot);
});

const data = JSON.parse(
  fs.readFileSync(path.join(PSA_ROOT, 'docs/seo-first-12-articles.json'), 'utf-8'),
);

const SITE_LABEL = {
  policestationagent: 'policestationagent.com',
  policestationrepuk: 'policestationrepuk.org',
  psrtrain: 'psrtrain.com',
  custodynote: 'custodynote.com',
};

function renderArticle(a) {
  const disclaimer = data.disclaimerDefaults[a.disclaimerKey];
  const body = a.sections
    .map((s) => `#### ${s.heading}\n\n${s.paragraphs.join('\n\n')}`)
    .join('\n\n');
  const internal = a.internalLinks.map((l) => `\`${l}\``).join(', ') || '—';
  const cross =
    a.crossSiteLinks.map((c) => `[${c.label}](${c.url})`).join(', ') || '—';
  const sources = a.externalSources.map((s) => `- ${s}`).join('\n');
  return `## ${a.n}. ${a.h1}

- **Site (owner):** ${SITE_LABEL[a.site]} — owns *${a.ownerConcept}* (${a.verdict})
- **Slug:** \`${a.slug}\`
- **Category:** ${a.category} · **Primary keyword:** ${a.primaryKeyword}
- **Schema:** ${a.schemaType}
- **Meta title:** ${a.metaTitle}
- **Meta description:** ${a.metaDescription}

${body}

**Internal links:** ${internal}

**Cross-site links:** ${cross}

**CTA:** ${a.cta}

**Disclaimer:** ${disclaimer}

**Sources:**
${sources}

**Buffer social copy**

- **LinkedIn:**
> ${a.bufferCopy.linkedin.replace(/\n/g, '\n> ')}

- **Facebook:** ${a.bufferCopy.facebook}
- **X/Twitter:** ${a.bufferCopy.twitter}
- **Short:** ${a.bufferCopy.short}
`;
}

const md = `# Four-Site SEO — First 12 Articles (Phase 4 Drafts)

> ${data.note}
>
> One canonical owner per article (see \`seo-cross-site-strategy.md\`). Each draft has SEO metadata, body, internal + cross-site links, a CTA, a disclaimer, a sources list, and Buffer social copy for LinkedIn / Facebook / X / short. Review and verify cited figures before publishing, then schedule a single test Buffer post (\`/api/buffer/schedule?slug=<slug>\`) before site-wide enable.

${data.articles.map(renderArticle).join('\n---\n\n')}
`;

let written = 0;
for (const docs of REPO_DOCS) {
  if (!fs.existsSync(path.dirname(docs))) continue;
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, 'seo-first-12-articles.md'), md);
  written += 1;
}

console.log(`Wrote first-12 brief to ${written} repo(s) (${data.articles.length} articles).`);
