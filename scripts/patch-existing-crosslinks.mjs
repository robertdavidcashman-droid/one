#!/usr/bin/env node
/** Insert Related guides in Kent crosslink block into existing top-performer blog posts. */
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "data", "blog-posts");

const ALL_NEW = [
  { slug: "voluntary-interview-letter-kent-what-to-do", title: "Voluntary Police Interview Letter in Kent" },
  { slug: "is-police-station-legal-advice-free-kent", title: "Is Police Station Legal Advice Free in Kent?" },
  { slug: "police-station-rep-near-me-kent", title: "Police Station Rep Near Me in Kent" },
  { slug: "maidstone-voluntary-interview-mid-kent-legal-advice", title: "Maidstone Voluntary Interviews (Custody Closed)" },
  { slug: "canterbury-custody-legal-advice-kent", title: "Canterbury Custody Legal Advice" },
  { slug: "sevenoaks-voluntary-interview-legal-advice-kent", title: "Sevenoaks Voluntary Interview Advice" },
  { slug: "folkestone-custody-legal-advice-kent", title: "Folkestone Custody Legal Advice" },
  { slug: "qualified-duty-solicitor-vs-police-station-rep-kent", title: "Qualified Duty Solicitor vs Police Station Rep" },
  { slug: "police-warrant-arrest-kent-what-to-do", title: "Police Warrant or Arrest in Kent" },
  { slug: "no-further-action-after-police-interview-kent", title: "No Further Action After Police Interview" },
];

const EXISTING = [
  { slug: "north-kent-gravesend-custody-legal-advice", title: "North Kent (Gravesend) custody advice" },
  { slug: "tonbridge-police-station-custody-and-interviews", title: "Tonbridge custody and interviews" },
  { slug: "legal-advice-medway-custody-kent", title: "Medway custody legal advice" },
  { slug: "kent-custody-after-arrest-process", title: "Kent custody after arrest" },
  { slug: "released-under-investigation-kent-plain-english", title: "Released under investigation (RUI)" },
  { slug: "when-to-ask-for-solicitor-kent-police-station", title: "When to ask for a solicitor" },
  { slug: "arrange-solicitor-someone-in-custody", title: "Arrange a solicitor in custody" },
  { slug: "immediate-family-instruct-police-station-solicitor", title: "Immediate family instruction" },
];

const TARGET_FILES = {
  "north-kent-gravesend-custody-legal-advice": "2026-06-12-north-kent-gravesend-custody-legal-advice.json",
  "tonbridge-police-station-custody-and-interviews": "2026-06-12-tonbridge-police-station-custody-and-interviews.json",
  "legal-advice-medway-custody-kent": "2026-06-12-police-station-cover-firms-kent-medway.json",
  "kent-custody-after-arrest-process": "2026-05-30-kent-custody-after-arrest.json",
  "released-under-investigation-kent-plain-english": "2026-05-30-rui-kent-plain-english.json",
  "when-to-ask-for-solicitor-kent-police-station": "2026-06-12-when-to-instruct-police-station-agent.json",
  "arrange-solicitor-someone-in-custody": "2026-06-12-instructing-a-police-station-representative.json",
  "immediate-family-instruct-police-station-solicitor": "2026-05-30-immediate-family-instruct-solicitor.json",
};

function relatedBlock(currentSlug) {
  const newLinks = ALL_NEW.filter((p) => p.slug !== currentSlug)
    .map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`)
    .join("\n  ");
  const existingLinks = EXISTING.filter((p) => p.slug !== currentSlug)
    .map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`)
    .join("\n  ");
  return `<h2>Related guides in Kent</h2>
<ul>
  ${newLinks}
  ${existingLinks}
</ul>`;
}

const MARKER = '<h2>Related guides in Kent</h2>';
const INSERT_BEFORE = /<div class="advert-cta"/;

let patched = 0;
for (const [slug, file] of Object.entries(TARGET_FILES)) {
  const fp = path.join(DIR, file);
  const post = JSON.parse(fs.readFileSync(fp, "utf8"));
  if (post.contentHtml.includes(MARKER)) {
    console.log("Skip (already has crosslinks):", slug);
    continue;
  }
  const block = relatedBlock(slug);
  if (!INSERT_BEFORE.test(post.contentHtml)) {
    console.error("No CTA anchor found in", file);
    process.exit(1);
  }
  post.contentHtml = post.contentHtml.replace(INSERT_BEFORE, `${block}\n\n$&`);
  fs.writeFileSync(fp, JSON.stringify(post, null, 2) + "\n");
  console.log("Patched crosslinks:", slug);
  patched++;
}

console.log(`\nDone: ${patched} post(s) crosslinked.`);
