#!/usr/bin/env node
/**
 * Generate 10 SEO click-driving public blog posts with images for Buffer OG previews.
 */
import fs from "fs";
import path from "path";
import { EXPANSIONS } from "./blog-post-expansions.mjs";
import { EXPANSIONS_EXTRA, EXPANSIONS_FINAL } from "./blog-post-expansions-extra.mjs";

const OUT = path.join(process.cwd(), "data", "blog-posts");
const DATE = "2026-06-14";

const NOT_KENT =
  "<p>Police Station Agent is a private defence website operated by Robert Cashman — <strong>NOT Kent Police</strong>. Legal services are delivered through Tuckers Solicitors LLP (SRA ID: 127795).</p>";

const BASE_EXTERNAL = [
  { url: "https://www.gov.uk/arrested-your-rights", label: "GOV.UK — If you're arrested: your rights" },
  {
    url: "https://www.legislation.gov.uk/ukpga/1984/60/section/58",
    label: "PACE 1984, section 58",
    note: "right to legal advice",
  },
  {
    url: "https://www.sra.org.uk/consumers/register/organisation/?sraNumber=127795",
    label: "SRA register — Tuckers Solicitors LLP (127795)",
  },
];

const ALL_NEW_SLUGS = [
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

const EXISTING_GUIDES = [
  { slug: "north-kent-gravesend-custody-legal-advice", title: "North Kent (Gravesend) custody advice" },
  { slug: "tonbridge-police-station-custody-and-interviews", title: "Tonbridge custody and interviews" },
  { slug: "legal-advice-medway-custody-kent", title: "Medway custody legal advice" },
  { slug: "kent-custody-after-arrest-process", title: "Kent custody after arrest" },
  { slug: "released-under-investigation-kent-plain-english", title: "Released under investigation (RUI)" },
  { slug: "when-to-ask-for-solicitor-kent-police-station", title: "When to ask for a solicitor" },
  { slug: "arrange-solicitor-someone-in-custody", title: "Arrange a solicitor in custody" },
  { slug: "immediate-family-instruct-police-station-solicitor", title: "Immediate family instruction" },
];

function figure(image, alt) {
  return `<figure class="blog-image">
  <img src="${image}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" width="800" height="400" />
  <figcaption>${alt}</figcaption>
</figure>`;
}

function takeaways(items) {
  const lis = items.map((i) => `<li>${i}</li>`).join("\n    ");
  return `<div class="key-takeaways" style="background-color: #e8f4fd; border-left: 4px solid #2563eb; padding: 1rem; margin: 1.25rem 0 1.5rem;">
  <h2 style="margin-top: 0; color: #1e40af; font-size: 1.1rem;">Key takeaways</h2>
  <ul style="margin-bottom: 0;">${lis}</ul>
</div>`;
}

function cta() {
  return `<div class="advert-cta" style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
  <h2 style="margin-top: 0; color: #991b1b; font-size: 1.25rem;">Need legal advice at a Kent police station?</h2>
  <p style="margin: 0.75rem 0;">Call <strong>01732 247427</strong> for current custody or a booked voluntary interview. If you cannot call, text <strong>07535 494446</strong>.</p>
  <p style="margin: 0.75rem 0;">Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong> — the DSCC have our details. Legal services are provided by Tuckers Solicitors LLP (SRA ID: 127795).</p>
  <p style="margin: 0.75rem 0 0;"><a href="/contact">Contact Police Station Agent</a> · <a href="/start/in-custody">Someone in custody now</a> · <a href="/free-police-station-advice-kent">Free police station advice in Kent</a></p>
</div>`;
}

function sources(external, internal) {
  const ext = external.map((e) => `<li><a href="${e.url}" rel="noopener noreferrer">${e.label}</a>${e.note ? ` — ${e.note}` : ""}</li>`).join("\n  ");
  const int = internal.map((e) => `<li><a href="${e.url}">${e.label}</a> (Police Station Agent)</li>`).join("\n  ");
  return `<h2>Sources</h2>
<ul>
  ${ext}
  ${int}
</ul>`;
}

function relatedGuides(currentSlug) {
  const newLinks = ALL_NEW_SLUGS.filter((p) => p.slug !== currentSlug)
    .map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`)
    .join("\n  ");
  const existingLinks = EXISTING_GUIDES.map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`).join("\n  ");
  return `<h2>Related guides in Kent</h2>
<ul>
  ${newLinks}
  ${existingLinks}
</ul>`;
}

function wrap(intro, image, alt, takeawaysHtml, body, conclusion, sourceExternal, sourceInternal, currentSlug) {
  return `<div class="blog-content">
<h2>Introduction</h2>
${intro}
${NOT_KENT}

${figure(image, alt)}

${takeawaysHtml}

${body}

${relatedGuides(currentSlug)}

${cta()}

<h2>Conclusion</h2>
${conclusion}

${sources(sourceExternal, sourceInternal)}

<p><em>General information only — not legal advice about any individual case. Legal services are provided by Tuckers Solicitors LLP (SRA ID: 127795).</em></p>
</div>`;
}

function buildPost(def) {
  const body = def.body + (EXPANSIONS[def.slug] || "") + (EXPANSIONS_EXTRA[def.slug] || "") + (EXPANSIONS_FINAL[def.slug] || "");
  const contentHtml = wrap(
    def.intro,
    def.image,
    def.imageAlt,
    takeaways(def.takeaways),
    body,
    def.conclusion,
    def.external || BASE_EXTERNAL,
    def.internal,
    def.slug,
  );
  return {
    id: `${DATE}-${def.slug}`,
    title: def.title,
    slug: def.slug,
    date: DATE,
    category: "Police Station Advice",
    primaryKeyword: def.primaryKeyword,
    secondaryKeywords: def.secondaryKeywords,
    location: def.location || "Kent",
    metaTitle: def.metaTitle,
    metaDescription: def.metaDescription,
    featuredImage: def.image,
    featuredImageAlt: def.imageAlt,
    contentHtml,
    faq: def.faq,
    author: "Robert Cashman",
    status: "published",
  };
}

const posts = [
  {
    slug: "voluntary-interview-letter-kent-what-to-do",
    title: "Received a Voluntary Police Interview Letter in Kent? What to Do Before You Attend",
    metaTitle: "Voluntary Police Interview Letter Kent — What to Do",
    metaDescription:
      "Received a voluntary police interview letter in Kent? Steps before you attend, free legal advice, and why not to discuss the allegation before speaking to a solicitor. Call 01732 247427.",
    primaryKeyword: "voluntary police interview letter kent",
    secondaryKeywords: ["police interview letter", "voluntary attendance", "PACE caution"],
    image: "/blog-images/blog-listing-1.png",
    imageAlt: "Voluntary police interview letter advice for Kent",
    takeaways: [
      "A <strong>voluntary interview letter</strong> usually means you are invited to attend under caution — it is a formal interview, not an informal chat.",
      "You are entitled to <strong>free legal advice</strong> before and during the interview under the duty solicitor scheme.",
      "Do <strong>not discuss the allegation</strong> with police, witnesses, or on social media before receiving legal advice.",
      "Arrange a solicitor <strong>before the interview date</strong> — attending alone carries the same legal risks as a custody interview.",
    ],
    intro: `<p>If you have received a <strong>letter or call from Kent Police</strong> inviting you to a voluntary police interview, you may be anxious about what happens next. A voluntary interview under caution is a formal procedure — not a casual conversation. This guide explains what the letter usually means, what to do before you attend, and how to arrange free legal advice in Kent.</p>`,
    body: `<h2>1) What does a voluntary interview letter mean?</h2>
<p>A voluntary police interview (sometimes called a voluntary attendance) is an interview under caution that takes place without you being under arrest. You are typically invited by letter, telephone, or email to attend a police station on a set date and time. The police caution applies: anything you say may be used in evidence.</p>
<p>Voluntary interviews happen at stations across Kent — including Maidstone, Sevenoaks, Dartford, Canterbury, Tonbridge and others. The letter should state the station, date, time, and often the investigating officer. If you are unsure whether attendance is mandatory, speak to a solicitor before deciding how to respond.</p>
<p>See our full guide: <a href="/voluntary-police-interview">voluntary police interview advice</a> and <a href="/blog/how-digital-evidence-voluntary-police-interview">digital evidence in voluntary interviews</a>.</p>

<h2>2) What to do as soon as you receive the letter</h2>
<ol>
<li><strong>Do not discuss the allegation</strong> with anyone except a solicitor — including family, colleagues, or online.</li>
<li><strong>Note the date, time, and station</strong> on the letter. Check whether you need to confirm attendance.</li>
<li><strong>Contact a solicitor immediately</strong> — free legal advice is available under the duty solicitor scheme for most voluntary interviews.</li>
<li><strong>Gather basic documents</strong> the solicitor may need: the letter itself, any paperwork from police, and your own account of events (for the solicitor only).</li>
<li><strong>Do not delay</strong> — solicitors need time to review disclosure and advise you properly before the interview.</li>
</ol>
<p>Call <strong>01732 247427</strong> or see <a href="/blog/when-to-ask-for-solicitor-kent-police-station">when to ask for a solicitor at a Kent police station</a>.</p>

<h2>3) Is a voluntary interview less serious than arrest?</h2>
<p>No. The interview is recorded and carries the same legal weight as an interview in custody. You can be charged on the basis of what you say. Many people assume that because they are not in handcuffs the process is informal — that is a dangerous misconception.</p>
<p>The police may have significant evidence before inviting you. Disclosure at the interview stage may still be limited, which is one reason legal advice before you attend matters. Read <a href="/voluntary-police-interview-risks">risks of attending a voluntary interview alone</a>.</p>

<h2>4) Can I rearrange or not attend?</h2>
<p>Failing to attend a voluntary interview without good reason can have serious consequences — the police may arrest you, obtain a warrant, or proceed with the investigation without your account. If you cannot attend on the date given, contact the investigating officer promptly and seek legal advice about rearranging.</p>
<p>Do not simply ignore the letter. See <a href="/blog/police-warrant-arrest-kent-what-to-do">police warrant or arrest in Kent — what to do</a> if you are concerned about failure to attend.</p>

<h2>5) What happens at the interview?</h2>
<p>You will be cautioned, the interview will be audio and video recorded, and questions will be put about the allegation. Your solicitor can request disclosure beforehand, advise you in private, and sit with you throughout. Options include answering questions, making no comment, or reading a prepared statement — advice depends on the individual case.</p>
<p>See <a href="/no-comment-interview">no comment interview advice</a> and <a href="/pace-code-c">PACE Code C explained</a>.</p>

<h2>6) Free legal advice for voluntary interviews in Kent</h2>
<p>Legal advice at the police station under Legal Aid is <strong>free for most people being interviewed</strong> — voluntary or in custody. It is not means-tested at this stage. Your solicitor is independent of the police.</p>
<p>Robert Cashman attends voluntary interviews across Kent through Tuckers Solicitors LLP. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong> when you call. See <a href="/blog/is-police-station-legal-advice-free-kent">is police station legal advice really free in Kent?</a></p>

<h2>7) After the interview</h2>
<p>Common outcomes include no further action, release under investigation, police bail with conditions, or charge. Each has different implications. See <a href="/blog/no-further-action-after-police-interview-kent">no further action after a police interview</a> and <a href="/blog/released-under-investigation-kent-plain-english">RUI explained in plain English</a>.</p>`,
    conclusion: `<p>If you have received a voluntary interview letter in Kent, arrange legal advice before you attend. Call <strong>01732 247427</strong> or text <strong>07535 494446</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>. Do not discuss the allegation until you have spoken to a solicitor.</p>`,
    internal: [
      { url: "/voluntary-police-interview", label: "Voluntary police interview advice" },
      { url: "/voluntary-police-interview-risks", label: "Risks of attending alone" },
      { url: "/contact", label: "Contact" },
    ],
    faq: [
      { q: "Do I have to attend a voluntary police interview in Kent?", a: "Ignoring a voluntary interview invitation can lead to arrest or a warrant. Seek legal advice before deciding whether or how to attend. This is general information only." },
      { q: "Is legal advice free for a voluntary interview?", a: "Yes — legal advice under the duty solicitor scheme is free for most people being interviewed at a police station, including voluntary interviews." },
      { q: "Can I take a solicitor to a voluntary interview?", a: "Yes. Your solicitor can attend with you, request disclosure, advise you in private, and remain during the interview." },
      { q: "What if I cannot make the date on the letter?", a: "Contact the investigating officer promptly and seek legal advice about rearranging. Do not ignore the letter." },
    ],
  },
  {
    slug: "is-police-station-legal-advice-free-kent",
    title: "Is Police Station Legal Advice Really Free in Kent?",
    metaTitle: "Is Police Station Legal Advice Free in Kent?",
    metaDescription:
      "Is police station legal advice really free in Kent? PACE rights, Legal Aid at custody, common myths, and qualified duty solicitor representation. Call 01732 247427.",
    primaryKeyword: "free police station advice kent",
    secondaryKeywords: ["duty solicitor free", "legal aid police station", "PACE section 58"],
    image: "/blog-images/blog-listing-0.jpg",
    imageAlt: "Free police station legal advice under the duty solicitor scheme in Kent",
    takeaways: [
      "<strong>Yes — for most people being interviewed</strong>, legal advice at the police station is free under the duty solicitor scheme.",
      "It is <strong>not means-tested</strong> at the police station stage in the way court Legal Aid can be.",
      "Your solicitor is <strong>independent of the police</strong> — Legal Aid funds your representation, not the police.",
      "Robert Cashman is a <strong>qualified duty solicitor</strong>, not an unregulated call-centre representative.",
    ],
    intro: `<p>Many people asked to attend a Kent police station — whether in custody or for a voluntary interview — wonder whether legal advice is truly free or whether there is a catch. This guide explains how free police station advice works in Kent, dispels common myths, and explains the difference between a qualified duty solicitor and other representatives.</p>`,
    body: `<h2>1) The legal right to free advice</h2>
<p>Under PACE 1984, section 58, everyone held in police custody has the right to consult a solicitor privately. For most detainees being interviewed, that advice is provided free under the Legal Aid duty solicitor scheme. The same scheme generally covers voluntary interviews under caution.</p>
<p>See <a href="/free-police-station-advice-kent">free police station advice in Kent</a> and <a href="/your-rights-in-custody">your rights in custody</a>.</p>

<h2>2) Common myths about cost</h2>
<ul>
<li><strong>"The police pay for my solicitor"</strong> — No. The police do not choose or pay for your solicitor. Legal Aid funds independent advice.</li>
<li><strong>"I will be charged if I am not convicted"</strong> — Police station advice under the duty scheme is free for most interviews regardless of outcome.</li>
<li><strong>"Free advice means poor advice"</strong> — Duty solicitors are qualified lawyers regulated by the Solicitors Regulation Authority (SRA).</li>
<li><strong>"I only get free advice if I am on benefits"</strong> — Police station advice is not means-tested in the same way as court Legal Aid for most interviews.</li>
</ul>

<h2>3) When might advice not be free?</h2>
<p>There are limited exceptions — for example, some non-interview attendances or subsequent privately funded work at court. For a standard police interview under caution in custody or voluntary attendance, advice is typically free. If you are unsure, ask your solicitor to confirm at the outset.</p>
<p>See <a href="/fees">fees and Legal Aid guidance</a>.</p>

<h2>4) Qualified duty solicitor vs police station rep</h2>
<p>A <strong>qualified solicitor</strong> has completed legal training, a training contract, and is regulated by the SRA. An <strong>accredited police station representative</strong> is a non-solicitor who has passed the Police Station Qualification. Both may attend under the duty scheme, but qualifications differ.</p>
<p>Robert Cashman is a <strong>qualified solicitor and accredited duty solicitor</strong> with 35+ years of experience — not a call-centre intermediary or unregulated agent. See <a href="/blog/qualified-duty-solicitor-vs-police-station-rep-kent">qualified duty solicitor vs police station rep in Kent</a> and <a href="/blog/who-attends-police-station-legal-advice">who attends when you ask for legal advice</a>.</p>

<h2>5) How to request free advice in Kent</h2>
<p>Tell the custody officer you want legal advice, or contact us before a voluntary interview. The Defence Solicitor Call Centre (DSCC) can allocate a duty solicitor. You may request <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>
<p>Call <strong>01732 247427</strong> or text <strong>07535 494446</strong>. See <a href="/blog/police-station-rep-near-me-kent">police station rep near me in Kent</a> and <a href="/start/in-custody">someone in custody now</a>.</p>

<h2>6) What free advice includes</h2>
<p>Your solicitor will usually review disclosure, advise you in private consultation, attend the interview with you, and take notes of the outcome. This applies at custody suites including Medway, North Kent (Gravesend), Tonbridge, Canterbury, Folkestone and voluntary interview stations across the county.</p>
<p>See <a href="/blog/kent-custody-after-arrest-process">Kent custody after arrest</a> and <a href="/kent-police-station-reps">Kent police station reps hub</a>.</p>`,
    conclusion: `<p>Police station legal advice is free for most people being interviewed in Kent. Call <strong>01732 247427</strong> before your interview. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/free-police-station-advice-kent", label: "Free police station advice in Kent" },
      { url: "/fees", label: "Fees and Legal Aid" },
      { url: "/services/police-station-representation", label: "Police station representation" },
    ],
    faq: [
      { q: "Is police station legal advice free in Kent?", a: "Yes — for most people being interviewed under caution, legal advice at the police station is free under the duty solicitor scheme." },
      { q: "Does free advice mean the solicitor works for the police?", a: "No. Your solicitor is independent. Legal Aid funds representation; the police do not control your advice." },
      { q: "Can I request a specific duty solicitor?", a: "You may request a named duty solicitor where the scheme allows. Ask for Robert Cashman, Tuckers Duty Solicitor." },
      { q: "Is Robert Cashman a qualified solicitor?", a: "Yes. Robert Cashman is a qualified solicitor and accredited duty solicitor practising through Tuckers Solicitors LLP (SRA ID 127795)." },
    ],
  },
  {
    slug: "police-station-rep-near-me-kent",
    title: "Police Station Rep Near Me in Kent: How to Get Free Legal Advice Fast",
    metaTitle: "Police Station Rep Near Me Kent | Free Legal Advice",
    metaDescription:
      "Need a police station rep near you in Kent? How the duty solicitor scheme works, all Kent custody suites, and how to get free legal advice fast. Call 01732 247427.",
    primaryKeyword: "police station rep near me kent",
    secondaryKeywords: ["duty solicitor near me", "kent custody suites", "police station solicitor kent"],
    image: "/blog-images/types-of-offences-police-station-featured.jpg",
    imageAlt: "Police station representation available across Kent custody suites",
    takeaways: [
      "Searching <strong>police station rep near me</strong> in Kent should lead you to the <strong>duty solicitor scheme</strong> — free advice for most interviews.",
      "Kent has multiple <strong>24-hour custody suites</strong> including Medway, North Kent (Gravesend), Tonbridge, Canterbury, and Folkestone.",
      "Voluntary interviews take place at local stations such as Maidstone, Sevenoaks, Dartford, and Swanley.",
      "Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong> — qualified solicitor cover across Kent.",
    ],
    intro: `<p>If you search for a <strong>police station rep near me</strong> in Kent, you need someone who can attend quickly — whether you are in custody now or have a booked voluntary interview. This guide explains how to find representation across Kent, which custody suites operate 24 hours, and how free legal advice works.</p>`,
    body: `<h2>1) How to get a police station rep in Kent quickly</h2>
<p>If you are in <strong>current custody</strong>, tell the custody officer you want legal advice and ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>. Immediate family may also contact us on your behalf — see <a href="/blog/immediate-family-instruct-police-station-solicitor">immediate family instruction</a>.</p>
<p>For a <strong>booked voluntary interview</strong>, call us as soon as you receive the date. Do not wait until the day of the interview.</p>
<p>Telephone <strong>01732 247427</strong> · Text <strong>07535 494446</strong> · <a href="/start/in-custody">Someone in custody now</a></p>

<h2>2) Kent 24-hour custody suites</h2>
<p>Main Kent custody facilities include:</p>
<ul>
<li><strong>Medway</strong> (Gillingham) — serving Medway towns</li>
<li><strong>North Kent</strong> (Gravesend, Thames Way) — north Kent including Dartford and Gravesend</li>
<li><strong>Tonbridge</strong> — west Kent 24-hour suite</li>
<li><strong>Canterbury</strong> — east Kent</li>
<li><strong>Folkestone</strong> — coastal east Kent</li>
</ul>
<p>Operational routing can vary. A person arrested in one area may be detained at another suite depending on capacity. See <a href="/kent-police-station-reps">Kent police station reps hub</a> and <a href="/locations">all locations</a>.</p>

<h2>3) Voluntary interview stations</h2>
<p>Many Kent towns host voluntary interviews without custody facilities — including <strong>Maidstone</strong> (custody closed; voluntary interviews at Palace Avenue), <strong>Sevenoaks</strong>, <strong>Dartford</strong>, <strong>Swanley</strong>, and <strong>Tunbridge Wells</strong>. Free legal advice applies equally to voluntary interviews.</p>
<p>See <a href="/blog/maidstone-voluntary-interview-mid-kent-legal-advice">Maidstone voluntary interviews</a> and <a href="/blog/sevenoaks-voluntary-interview-legal-advice-kent">Sevenoaks voluntary interviews</a>.</p>

<h2>4) Qualified solicitor — not a call centre</h2>
<p>When searching online you may find call-centre style agencies. Robert Cashman is a <strong>qualified duty solicitor</strong> practising through Tuckers Solicitors LLP (SRA ID 127795) — regulated, insured, and independent of the police.</p>
<p>See <a href="/blog/qualified-duty-solicitor-vs-police-station-rep-kent">qualified duty solicitor vs police station rep</a>.</p>

<h2>5) Town and area guides</h2>
<ul>
<li><a href="/blog/north-kent-gravesend-custody-legal-advice">North Kent (Gravesend) custody</a></li>
<li><a href="/blog/tonbridge-police-station-custody-and-interviews">Tonbridge custody and interviews</a></li>
<li><a href="/blog/legal-advice-medway-custody-kent">Medway custody</a></li>
<li><a href="/blog/canterbury-custody-legal-advice-kent">Canterbury custody</a></li>
<li><a href="/blog/folkestone-custody-legal-advice-kent">Folkestone custody</a></li>
</ul>

<h2>6) What information helps us attend</h2>
<p>Full name, date of birth, which station or custody suite, custody record number if known, and interview date/time for voluntary attendances. See <a href="/blog/custody-record-number-dscc-reference">custody record and DSCC references</a>.</p>`,
    conclusion: `<p>For a police station rep near you in Kent, call <strong>01732 247427</strong> now. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>. Free legal advice is available for most police station interviews.</p>`,
    internal: [
      { url: "/kent-police-station-reps", label: "Kent police station reps" },
      { url: "/locations", label: "All locations" },
      { url: "/start/in-custody", label: "Someone in custody now" },
    ],
    faq: [
      { q: "How do I find a police station rep near me in Kent?", a: "Call 01732 247427 for current custody or a booked voluntary interview. Ask for Robert Cashman, Tuckers Duty Solicitor. Legal advice is free for most interviews." },
      { q: "Which Kent towns do you cover?", a: "We attend custody suites and voluntary interviews across Kent including Medway, Gravesend, Tonbridge, Canterbury, Folkestone, Maidstone, Sevenoaks, and Dartford, subject to availability." },
      { q: "Is a police station rep the same as a duty solicitor?", a: "A duty solicitor is a qualified solicitor. Some attendances are by accredited representatives. Robert Cashman is a qualified solicitor and duty solicitor." },
      { q: "Can family find a rep for someone in custody?", a: "Immediate family may contact us to help arrange a solicitor when someone is in current custody, subject to the detainee confirming they want advice." },
    ],
  },
  {
    slug: "maidstone-voluntary-interview-mid-kent-legal-advice",
    title: "Maidstone Police Station Voluntary Interviews: Mid-Kent Legal Advice (Custody Closed)",
    metaTitle: "Maidstone Voluntary Interview Legal Advice | Mid-Kent",
    metaDescription:
      "Maidstone police station hosts voluntary interviews — custody suite closed. Mid-Kent arrest routing, free legal advice, and how to arrange a solicitor. Call 01732 247427.",
    primaryKeyword: "maidstone police station voluntary interview",
    secondaryKeywords: ["mid kent police station", "maidstone solicitor", "custody closed maidstone"],
    image: "/blog-images/blog-listing-5.png",
    imageAlt: "Voluntary police interview advice at Maidstone police station mid-Kent",
    takeaways: [
      "<strong>Maidstone custody has closed</strong> — there is no custody suite at Maidstone police station.",
      "<strong>Voluntary interviews</strong> still take place at Maidstone police station, Palace Avenue, ME15 6NF.",
      "If <strong>arrested in mid-Kent</strong>, detainees are usually taken to another Kent suite such as Medway, Canterbury, or Tonbridge.",
      "Free legal advice applies to <strong>voluntary interviews and custody</strong> elsewhere in Kent.",
    ],
    intro: `<p>Maidstone is central to mid-Kent, but <strong>Maidstone police station no longer operates a custody suite</strong>. Voluntary interviews under caution still take place at the station on Palace Avenue. If you or someone you know is arrested in the Maidstone area, detainees are typically routed to other Kent custody facilities. This guide explains how legal advice works for both situations.</p>`,
    body: `<h2>1) Maidstone police station — voluntary interviews only</h2>
<p>Maidstone police station at <strong>Palace Avenue, Maidstone ME15 6NF</strong> is used for voluntary police interviews. If you receive a letter or call to attend Maidstone for an interview under caution, you are entitled to free legal advice — the interview is formal and recorded.</p>
<p>See <a href="/police-station-rep-maidstone">police station cover — Maidstone</a> and <a href="/blog/voluntary-interview-letter-kent-what-to-do">voluntary interview letter — what to do</a>.</p>

<h2>2) Is there custody at Maidstone?</h2>
<p><strong>No.</strong> Maidstone custody suite has closed. If someone is arrested in Maidstone, Bearsted, Maidstone borough, or wider mid-Kent, police usually detain them at another Kent custody suite. Common routing includes <strong>Medway</strong>, <strong>Canterbury</strong>, or <strong>Tonbridge</strong>, depending on operational capacity — routing is a police decision and can vary.</p>
<p>Ask custody staff which suite is holding the detainee. See <a href="/blog/legal-advice-medway-custody-kent">Medway custody advice</a>, <a href="/blog/canterbury-custody-legal-advice-kent">Canterbury custody</a>, and <a href="/blog/tonbridge-police-station-custody-and-interviews">Tonbridge custody</a>.</p>

<h2>3) Arranging a solicitor for mid-Kent</h2>
<p><strong>Voluntary interview at Maidstone:</strong> contact us before the interview date with the date, time, and offence summary if known.</p>
<p><strong>Arrest in mid-Kent:</strong> the detainee should ask custody staff for legal advice at whichever suite they are taken to. Immediate family may help arrange a solicitor — see <a href="/blog/arrange-solicitor-someone-in-custody">arrange a solicitor in custody</a>.</p>
<p>Call <strong>01732 247427</strong> · Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong></p>

<h2>4) What to expect at a Maidstone voluntary interview</h2>
<p>The process mirrors any voluntary interview in Kent: caution, disclosure (which may be limited), private consultation with your solicitor, and a recorded interview. Your solicitor can advise on whether to answer questions, make no comment, or read a prepared statement.</p>
<p>See <a href="/voluntary-police-interview">voluntary police interview guide</a> and <a href="/no-comment-interview">no comment interview advice</a>.</p>

<h2>5) Mid-Kent areas covered</h2>
<p>We attend Maidstone voluntary interviews and custody suites used by mid-Kent arrests — including Medway, Canterbury, and Tonbridge — subject to availability. See <a href="/blog/police-station-rep-near-me-kent">police station rep near me in Kent</a>.</p>`,
    conclusion: `<p>Maidstone hosts voluntary interviews but not custody. For either a Maidstone interview or custody elsewhere after a mid-Kent arrest, call <strong>01732 247427</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/police-station-rep-maidstone", label: "Maidstone cover" },
      { url: "/police-station-rep-medway", label: "Medway cover" },
      { url: "/voluntary-police-interview", label: "Voluntary interview advice" },
    ],
    faq: [
      { q: "Is there custody at Maidstone police station?", a: "No. Maidstone custody has closed. Voluntary interviews still take place at Maidstone police station on Palace Avenue." },
      { q: "Where do Maidstone arrests go?", a: "Detainees are usually taken to another Kent custody suite such as Medway, Canterbury, or Tonbridge, depending on operational routing." },
      { q: "Is legal advice free at a Maidstone voluntary interview?", a: "Yes — legal advice under the duty solicitor scheme is free for most voluntary interviews under caution." },
      { q: "How do I arrange a solicitor for Maidstone?", a: "Call 01732 247427 before your interview date with the time, date, and station details. Ask for Robert Cashman, Tuckers Duty Solicitor." },
    ],
  },
  {
    slug: "canterbury-custody-legal-advice-kent",
    title: "Legal Advice at Canterbury Custody Suite: What Families Should Know",
    metaTitle: "Canterbury Custody Legal Advice | East Kent",
    metaDescription:
      "Free legal advice at Canterbury custody suite for East Kent arrests. What families should know, voluntary interviews, and how to arrange a solicitor. Call 01732 247427.",
    primaryKeyword: "canterbury police station custody solicitor",
    secondaryKeywords: ["east kent custody", "canterbury police station rep", "free legal advice canterbury"],
    image: "/blog-images/domestic-allegations-police-stage-featured.jpg",
    imageAlt: "Legal advice at Canterbury custody suite East Kent",
    takeaways: [
      "<strong>Canterbury custody suite</strong> serves east Kent including Canterbury, Herne Bay, Whitstable, and surrounding areas.",
      "<strong>Free legal advice</strong> at the police station is available for most detainees being interviewed.",
      "<strong>Immediate family</strong> may help arrange a solicitor when someone is in current custody.",
      "Voluntary interviews also take place at Canterbury and other east Kent stations.",
    ],
    intro: `<p>If someone is detained at the <strong>Canterbury custody suite</strong> or facing a voluntary interview in east Kent, they are entitled to free legal advice at the police station. This guide explains what families should know, how the Canterbury custody process typically works, and how to arrange representation through Robert Cashman and Tuckers Solicitors LLP.</p>`,
    body: `<h2>1) Canterbury custody suite</h2>
<p>Canterbury is a main custody facility for east Kent. Detainees from Canterbury, Herne Bay, Whitstable, Faversham, and surrounding areas may be brought there after arrest. The custody officer should explain PACE rights including the right to free legal advice.</p>
<p>See <a href="/police-station-rep-canterbury">police station cover — Canterbury</a> and <a href="/canterbury-police-station">Canterbury police station information</a>.</p>

<h2>2) After arrest in east Kent</h2>
<p>After arrest, a person is booked into custody, property may be recorded, and a custody record is created. Reviews of detention should take place at intervals prescribed by PACE. The detainee should be told the reason for arrest and the grounds for detention.</p>
<p>For a general overview see <a href="/blog/kent-custody-after-arrest-process">Kent custody after arrest</a> and <a href="/custody-time-limits">custody time limits</a>.</p>

<h2>3) Your right to a solicitor</h2>
<p>PACE section 58 gives the right to consult a solicitor privately. Legal advice under Legal Aid is free for most detainees being interviewed. Your solicitor is independent of the police and bound by confidentiality.</p>
<p>See <a href="/blog/is-police-station-legal-advice-free-kent">is police station advice really free?</a> and <a href="/pace-code-c">PACE Code C</a>.</p>

<h2>4) How family can help</h2>
<p>Immediate family (parent, spouse, civil partner, child, or sibling) may contact us when someone is in <strong>current</strong> custody. The detainee must confirm they want legal advice. Call <strong>01732 247427</strong> or see <a href="/blog/immediate-family-instruct-police-station-solicitor">immediate family instruction</a>.</p>

<h2>5) Voluntary interviews in east Kent</h2>
<p>Not every police contact involves custody. Voluntary interviews may be scheduled at Canterbury or other east Kent stations. The same right to free legal advice applies. See <a href="/blog/voluntary-interview-letter-kent-what-to-do">voluntary interview letter — what to do</a>.</p>

<h2>6) Interview outcomes</h2>
<p>After interview, outcomes may include charge, release under investigation, police bail, or no further action. See <a href="/blog/no-further-action-after-police-interview-kent">no further action explained</a> and <a href="/blog/released-under-investigation-kent-plain-english">RUI in plain English</a>.</p>

<h2>7) East Kent — wider cover</h2>
<p>We also attend <a href="/blog/folkestone-custody-legal-advice-kent">Folkestone custody</a> and voluntary interviews across east Kent. See <a href="/blog/police-station-rep-near-me-kent">police station rep near me in Kent</a>.</p>`,
    conclusion: `<p>For Canterbury custody or an east Kent voluntary interview, call <strong>01732 247427</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>. Attendance is subject to availability.</p>`,
    internal: [
      { url: "/police-station-rep-canterbury", label: "Canterbury cover" },
      { url: "/start/in-custody", label: "Someone in custody now" },
      { url: "/your-rights-in-custody", label: "Your rights in custody" },
    ],
    faq: [
      { q: "Is legal advice free at Canterbury custody?", a: "Yes — legal advice under the duty solicitor scheme is free for most detainees being interviewed at the police station." },
      { q: "Can family arrange a solicitor at Canterbury?", a: "Immediate family may contact us to help arrange a solicitor when someone is in current custody, subject to the detainee confirming instruction." },
      { q: "Does Canterbury have a 24-hour custody suite?", a: "Canterbury operates as a main east Kent custody facility. Confirm the exact suite with custody staff when arranging attendance." },
      { q: "Do you cover areas outside Canterbury?", a: "Yes. We attend custody suites and voluntary interviews across Kent including Folkestone, Medway, and north Kent, subject to availability." },
    ],
  },
  {
    slug: "sevenoaks-voluntary-interview-legal-advice-kent",
    title: "Voluntary Police Interviews at Sevenoaks: West Kent Legal Advice",
    metaTitle: "Sevenoaks Voluntary Interview Legal Advice | West Kent",
    metaDescription:
      "Voluntary police interviews at Sevenoaks police station — free legal advice, west Kent custody routing, and how to arrange a solicitor. Call 01732 247427.",
    primaryKeyword: "sevenoaks voluntary police interview solicitor",
    secondaryKeywords: ["west kent police station", "sevenoaks police station rep", "tonbridge custody"],
    image: "/blog-images/blog-listing-4.png",
    imageAlt: "Voluntary police interview advice at Sevenoaks west Kent",
    takeaways: [
      "<strong>Sevenoaks police station</strong> is primarily used for voluntary interviews under caution.",
      "Custody for west Kent arrests is usually at <strong>Tonbridge</strong> or another Kent suite.",
      "<strong>Free legal advice</strong> applies to Sevenoaks voluntary interviews.",
      "Robert Cashman covers Sevenoaks interviews and west Kent custody attendance.",
    ],
    intro: `<p><strong>Sevenoaks police station</strong> is commonly used for voluntary police interviews in west Kent. If you have received an interview letter for Sevenoaks, or someone has been arrested in the Sevenoaks area, this guide explains how legal advice works and where custody matters are usually dealt with.</p>`,
    body: `<h2>1) Sevenoaks — voluntary interviews</h2>
<p>Voluntary interviews under caution at Sevenoaks are formal recorded interviews. You should not attend without legal advice. Arrange a solicitor before the interview date.</p>
<p>See <a href="/police-station-rep-sevenoaks">police station cover — Sevenoaks</a> and <a href="/blog/voluntary-interview-letter-kent-what-to-do">voluntary interview letter advice</a>.</p>

<h2>2) Custody and west Kent routing</h2>
<p>Sevenoaks does not operate the main 24-hour west Kent custody suite — that role is filled by <strong>Tonbridge</strong>. If someone is arrested in Sevenoaks, Oxted, Edenbridge, or surrounding areas, they may be detained at Tonbridge, Medway, Gravesend, or another suite depending on demand.</p>
<p>See <a href="/blog/tonbridge-police-station-custody-and-interviews">Tonbridge custody and interviews</a>.</p>

<h2>3) Free legal advice at Sevenoaks</h2>
<p>Legal advice under the duty solicitor scheme is free for most voluntary interviews. Your solicitor can request disclosure, advise you in private, and attend the interview with you.</p>
<p>See <a href="/blog/is-police-station-legal-advice-free-kent">is police station advice free?</a></p>

<h2>4) West Kent towns covered</h2>
<p>Sevenoaks, Tunbridge Wells, Edenbridge, and west Kent villages may use Sevenoaks for voluntary interviews and Tonbridge for custody. See <a href="/police-station-rep-tunbridge-wells">Tunbridge Wells cover</a> and <a href="/coverage/areas/west-kent">west Kent area hub</a>.</p>

<h2>5) How to contact us</h2>
<p>Call <strong>01732 247427</strong> with the interview date, time, and Sevenoaks station details. For current custody, see <a href="/start/in-custody">someone in custody now</a>.</p>`,
    conclusion: `<p>For a Sevenoaks voluntary interview or west Kent custody, call <strong>01732 247427</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/police-station-rep-sevenoaks", label: "Sevenoaks cover" },
      { url: "/police-station-rep-tonbridge", label: "Tonbridge cover" },
      { url: "/voluntary-police-interview", label: "Voluntary interview advice" },
    ],
    faq: [
      { q: "Does Sevenoaks have a custody suite?", a: "Sevenoaks is primarily used for voluntary interviews. Custody for west Kent is usually at Tonbridge or another Kent suite." },
      { q: "Is legal advice free for a Sevenoaks voluntary interview?", a: "Yes — for most voluntary interviews under caution, legal advice at the police station is free under the duty solicitor scheme." },
      { q: "How quickly can a solicitor attend Sevenoaks?", a: "Contact us as soon as you receive the interview date. Early instruction allows time for disclosure and advice before attendance." },
      { q: "Can I request Robert Cashman at Sevenoaks?", a: "You may request Robert Cashman, Tuckers Duty Solicitor, when arranging advice, subject to availability." },
    ],
  },
  {
    slug: "folkestone-custody-legal-advice-kent",
    title: "Legal Advice at Folkestone Custody Suite: East Kent Guide",
    metaTitle: "Folkestone Custody Legal Advice | East Kent",
    metaDescription:
      "Free legal advice at Folkestone custody suite for coastal east Kent arrests. Custody process, family help, and voluntary interviews. Call 01732 247427.",
    primaryKeyword: "folkestone police station custody solicitor",
    secondaryKeywords: ["east kent custody", "folkestone police station rep", "dover folkestone legal advice"],
    image: "/blog-images/drug-allegations-police-stage-featured.jpg",
    imageAlt: "Legal advice at Folkestone custody suite coastal east Kent",
    takeaways: [
      "<strong>Folkestone custody suite</strong> serves coastal east Kent including Folkestone, Dover, and Hythe areas.",
      "<strong>Free legal advice</strong> is available for most detainees being interviewed under caution.",
      "Voluntary interviews also take place at Folkestone and nearby stations.",
      "Immediate family may help arrange a solicitor for someone in current custody.",
    ],
    intro: `<p>The <strong>Folkestone custody suite</strong> is a key detention facility for coastal east Kent. If someone is detained there after arrest, or has a voluntary interview scheduled in the Folkestone area, they are entitled to free legal advice at the police station. This guide explains the process for detainees and families.</p>`,
    body: `<h2>1) Folkestone custody suite</h2>
<p>Folkestone handles custody matters for east Kent coastal areas. After arrest, detainees are booked in, rights under PACE are explained, and the right to legal advice must be offered.</p>
<p>See <a href="/police-station-rep-folkestone">police station cover — Folkestone</a> and <a href="/folkestone-police-station">Folkestone police station</a>.</p>

<h2>2) Coastal east Kent coverage</h2>
<p>Detainees from Folkestone, Dover, Hythe, and surrounding coastal towns may be brought to Folkestone custody. Routing can vary — confirm the suite with custody staff.</p>
<p>See also <a href="/blog/canterbury-custody-legal-advice-kent">Canterbury custody advice</a> for wider east Kent.</p>

<h2>3) Right to a solicitor</h2>
<p>PACE section 58 — free legal advice for most interviews. Your solicitor is independent of the police. See <a href="/blog/qualified-duty-solicitor-vs-police-station-rep-kent">qualified duty solicitor vs rep</a>.</p>

<h2>4) Family assistance</h2>
<p>Immediate family may contact us for someone in current custody. Call <strong>01732 247427</strong>. See <a href="/blog/arrange-solicitor-someone-in-custody">arrange a solicitor in custody</a>.</p>

<h2>5) Voluntary interviews at Folkestone</h2>
<p>Voluntary interviews under caution may be scheduled at Folkestone. Arrange advice before attending. See <a href="/voluntary-police-interview">voluntary interview guide</a>.</p>

<h2>6) Outcomes after interview</h2>
<p>Charge, RUI, bail, or no further action — see <a href="/blog/no-further-action-after-police-interview-kent">no further action</a> and <a href="/released-under-investigation">RUI guide</a>.</p>`,
    conclusion: `<p>For Folkestone custody or a coastal east Kent interview, call <strong>01732 247427</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/police-station-rep-folkestone", label: "Folkestone cover" },
      { url: "/police-station-rep-dover", label: "Dover cover" },
      { url: "/start/in-custody", label: "Someone in custody now" },
    ],
    faq: [
      { q: "Is legal advice free at Folkestone custody?", a: "Yes — for most detainees being interviewed, legal advice at the police station is free under the duty solicitor scheme." },
      { q: "Do you cover Dover and Hythe?", a: "We attend Folkestone custody and voluntary interviews across coastal east Kent, subject to availability." },
      { q: "Can family instruct for Folkestone custody?", a: "Immediate family may help arrange a solicitor when someone is in current custody, subject to the detainee confirming they want advice." },
      { q: "What if I have a voluntary interview at Folkestone?", a: "Contact us before the interview date. Free legal advice is available for most voluntary interviews under caution." },
    ],
  },
  {
    slug: "qualified-duty-solicitor-vs-police-station-rep-kent",
    title: "Qualified Duty Solicitor vs Police Station Rep in Kent: What Is the Difference?",
    metaTitle: "Duty Solicitor vs Police Station Rep Kent",
    metaDescription:
      "Qualified duty solicitor vs accredited police station rep in Kent — qualifications, regulation, and why it matters when you need police station advice. Call 01732 247427.",
    primaryKeyword: "duty solicitor vs police station rep kent",
    secondaryKeywords: ["qualified solicitor police station", "accredited representative", "duty solicitor kent"],
    image: "/blog-images/blog-listing-7.png",
    imageAlt: "Qualified duty solicitor versus police station representative in Kent",
    takeaways: [
      "A <strong>qualified solicitor</strong> is fully trained and regulated by the SRA.",
      "An <strong>accredited police station rep</strong> has passed the Police Station Qualification but is not a solicitor.",
      "Both may attend under the <strong>duty solicitor scheme</strong> — qualifications differ.",
      "Robert Cashman is a <strong>qualified solicitor and duty solicitor</strong> with 35+ years of experience.",
    ],
    intro: `<p>When you ask for legal advice at a Kent police station, you may be visited by a duty solicitor or an accredited police station representative. Understanding the difference matters — especially when online searches show call-centre style agencies and unregulated intermediaries. This guide explains qualifications, regulation, and what you should expect in Kent.</p>`,
    body: `<h2>1) What is a qualified duty solicitor?</h2>
<p>A duty solicitor is a qualified solicitor on the Legal Aid duty rota. They have completed a law degree or equivalent, the Legal Practice Course, a training contract, and are admitted by the SRA. Robert Cashman is a qualified solicitor, accredited duty solicitor, and Higher Court Advocate with 35+ years of criminal defence experience.</p>
<p>See <a href="/about">about Robert Cashman</a> and <a href="/services/police-station-representation">police station representation</a>.</p>

<h2>2) What is a police station rep?</h2>
<p>An accredited police station representative (sometimes called a police station agent or rep) is a non-solicitor who has passed the Police Station Qualification. They may attend on behalf of a solicitor's firm under the duty scheme. They are not the same as a qualified solicitor, though many are experienced.</p>
<p>See <a href="/blog/who-attends-police-station-legal-advice">who attends when you ask for legal advice</a>.</p>

<h2>3) Call centres and unregulated intermediaries</h2>
<p>Some websites offer to "find you a rep" but are not law firms and not regulated by the SRA. Robert Cashman practises through <strong>Tuckers Solicitors LLP</strong> (SRA ID 127795) — a regulated firm with professional indemnity insurance. You should know who is actually attending and which firm is responsible.</p>

<h2>4) Does it affect whether advice is free?</h2>
<p>Legal advice at the police station is free for most interviews whether a solicitor or accredited rep attends — the duty scheme funds attendance. The question is the <strong>qualification and experience</strong> of who advises you.</p>
<p>See <a href="/blog/is-police-station-legal-advice-free-kent">is police station advice really free?</a></p>

<h2>5) Why qualifications matter at interview</h2>
<p>Police station interviews can lead to charge, custody time limits, bail conditions, or court proceedings. Advice on disclosure, no comment, prepared statements, and interview strategy requires criminal law expertise. A qualified solicitor brings training in evidence, procedure, and advocacy.</p>
<p>See <a href="/no-comment-interview">no comment interview</a> and <a href="/blog/kent-custody-after-arrest-process">Kent custody process</a>.</p>

<h2>6) How to request Robert Cashman in Kent</h2>
<p>Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong> when speaking to custody staff or when calling us before a voluntary interview. Call <strong>01732 247427</strong>.</p>
<p>See <a href="/blog/police-station-rep-near-me-kent">police station rep near me in Kent</a>.</p>`,
    conclusion: `<p>For a qualified duty solicitor at a Kent police station, call <strong>01732 247427</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong> through Tuckers Solicitors LLP.</p>`,
    internal: [
      { url: "/services/police-station-representation", label: "Police station representation" },
      { url: "/about", label: "About Robert Cashman" },
      { url: "/free-police-station-advice-kent", label: "Free police station advice" },
    ],
    faq: [
      { q: "Is a police station rep a solicitor?", a: "Not necessarily. An accredited representative is not a qualified solicitor. A duty solicitor is a qualified solicitor. Robert Cashman is a qualified solicitor." },
      { q: "Is Robert Cashman a qualified solicitor?", a: "Yes. Robert Cashman is a qualified solicitor, accredited duty solicitor, and Higher Court Advocate practising through Tuckers Solicitors LLP (SRA ID 127795)." },
      { q: "Does it cost more to have a solicitor than a rep?", a: "At the police station stage, advice is free for most interviews under the duty scheme regardless of whether a solicitor or accredited rep attends." },
      { q: "How do I avoid call-centre agencies?", a: "Ask which law firm is attending, check the SRA register, and request a named duty solicitor such as Robert Cashman, Tuckers Duty Solicitor." },
    ],
  },
  {
    slug: "police-warrant-arrest-kent-what-to-do",
    title: "Police Warrant or Arrest in Kent: What to Do First",
    metaTitle: "Police Warrant or Arrest in Kent — What to Do",
    metaDescription:
      "Police warrant or arrest in Kent — what to do first. PACE rights, free legal advice, failure to attend court, and arranging a solicitor. Call 01732 247427.",
    primaryKeyword: "police warrant arrest kent what to do",
    secondaryKeywords: ["arrest warrant kent", "failure to attend court", "police station warrant"],
    image: "/blog-images/violence-public-order-featured.jpg",
    imageAlt: "Police warrant or arrest in Kent — first steps and legal advice",
    takeaways: [
      "If you discover a <strong>warrant</strong> or are <strong>arrested</strong>, ask for a solicitor immediately.",
      "<strong>Free legal advice</strong> at the police station applies to most custody interviews.",
      "Do <strong>not ignore</strong> a voluntary interview letter — failure to attend can lead to arrest.",
      "Robert Cashman attends custody suites across Kent subject to availability.",
    ],
    intro: `<p>Discovering there is a <strong>warrant in your name</strong>, being arrested by Kent Police, or fearing arrest after missing a court date is frightening. This guide explains the first practical steps, your right to free legal advice, and how to arrange a solicitor at a Kent police station.</p>`,
    body: `<h2>1) If you are arrested in Kent</h2>
<p>You will usually be taken to a custody suite. Ask for a solicitor immediately — do not answer questions about the offence until you have received advice. The custody officer must explain your rights under PACE.</p>
<p>See <a href="/arrested-what-to-do">arrested in Kent — what to do</a> and <a href="/blog/kent-custody-after-arrest-process">Kent custody after arrest</a>.</p>

<h2>2) If there is a warrant</h2>
<p>Warrants can arise from failure to attend court, breach of bail, or ongoing investigations. Do not attempt to handle this alone. Contact a solicitor immediately to understand the warrant type and next steps. If police attend your address, you still have the right to legal advice if taken to a station.</p>

<h2>3) Failure to attend a voluntary interview</h2>
<p>Ignoring a voluntary interview invitation can result in arrest or a warrant. If you missed an interview or cannot attend, seek legal advice urgently. See <a href="/blog/voluntary-interview-letter-kent-what-to-do">voluntary interview letter — what to do</a>.</p>

<h2>4) Which custody suite?</h2>
<p>Kent detainees may be held at Medway, North Kent (Gravesend), Tonbridge, Canterbury, Folkestone, or other suites. Confirm location with custody staff. See <a href="/blog/police-station-rep-near-me-kent">police station rep near me</a>.</p>

<h2>5) Free legal advice</h2>
<p>PACE section 58 — free advice for most custody interviews. Call <strong>01732 247427</strong> if a family member is in custody. See <a href="/blog/is-police-station-legal-advice-free-kent">is advice really free?</a></p>

<h2>6) Family members</h2>
<p>Immediate family may help arrange a solicitor for someone in current custody. See <a href="/blog/immediate-family-instruct-police-station-solicitor">immediate family instruction</a> and <a href="/what-to-do-if-a-loved-one-is-arrested">loved one arrested</a>.</p>`,
    conclusion: `<p>If you face a warrant or arrest in Kent, ask for a solicitor immediately. Call <strong>01732 247427</strong> or text <strong>07535 494446</strong>. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/arrested-what-to-do", label: "Arrested in Kent — what to do" },
      { url: "/start/in-custody", label: "Someone in custody now" },
      { url: "/your-rights-in-custody", label: "Your rights in custody" },
    ],
    faq: [
      { q: "What should I do if there is a warrant for my arrest in Kent?", a: "Contact a solicitor immediately. Do not ignore the warrant. If arrested, ask for legal advice at the police station before answering questions." },
      { q: "Is legal advice free if I am arrested on a warrant?", a: "Yes — for most custody interviews, legal advice at the police station is free under the duty solicitor scheme." },
      { q: "Can family help if someone is arrested in Kent?", a: "Immediate family may contact us to help arrange a solicitor when someone is in current custody, subject to the detainee confirming they want advice." },
      { q: "What if I missed a voluntary police interview?", a: "Seek legal advice urgently. Failure to attend can lead to arrest. Do not ignore police correspondence." },
    ],
  },
  {
    slug: "no-further-action-after-police-interview-kent",
    title: "No Further Action After a Kent Police Interview: What It Means",
    metaTitle: "No Further Action After Police Interview Kent",
    metaDescription:
      "No further action (NFA) after a Kent police interview — what it means, how it differs from RUI, and whether the case can reopen. General information. Call 01732 247427.",
    primaryKeyword: "no further action police interview kent",
    secondaryKeywords: ["NFA police interview", "no further action meaning", "after police interview kent"],
    image: "/blog-images/blog-listing-2.png",
    imageAlt: "No further action after a Kent police interview explained",
    takeaways: [
      "<strong>No further action (NFA)</strong> usually means the police are not taking further steps at this time.",
      "NFA is <strong>not always permanent</strong> — investigations can reopen if new evidence emerges.",
      "NFA differs from <strong>release under investigation (RUI)</strong> and police bail.",
      "Keep any paperwork and attendance notes from your solicitor.",
    ],
    intro: `<p>After a police station interview in Kent, you may be told the matter is ending with <strong>no further action</strong> (NFA). That can be a relief, but it is important to understand what NFA means, how it differs from other outcomes, and what you should do next. This guide explains in plain English for anyone who has attended a Kent police station.</p>`,
    body: `<h2>1) What does no further action mean?</h2>
<p>No further action generally means the police are not proceeding further at this stage — you may be free to leave without charge, bail, or release under investigation. The wording and procedure can vary. Your solicitor's attendance notes should record the outcome clearly.</p>
<p>See <a href="/blog/police-station-attendance-notes">what your solicitor records after a police station visit</a>.</p>

<h2>2) NFA vs release under investigation</h2>
<p><strong>RUI</strong> means the investigation continues without bail conditions. <strong>NFA</strong> suggests the police are not taking further action now. The practical difference matters for your peace of mind and record-keeping. See <a href="/blog/released-under-investigation-kent-plain-english">RUI explained in plain English</a> and <a href="/released-under-investigation">RUI guide</a>.</p>

<h2>3) NFA vs police bail</h2>
<p>Police bail imposes conditions and a return date. NFA typically means no bail conditions are imposed. See <a href="/police-bail-explained">police bail explained</a>.</p>

<h2>4) Can NFA be reversed?</h2>
<p>Investigations can reopen if new evidence comes to light. NFA does not mean proceedings can never follow in future. Keep your solicitor's contact details and attendance notes. This is general information — not advice about any specific case.</p>

<h2>5) After NFA — practical steps</h2>
<ul>
<li>Keep any paperwork or custody records</li>
<li>Retain your solicitor's attendance notes</li>
<li>Do not discuss the allegation on social media</li>
<li>Contact your solicitor if police contact you again</li>
</ul>

<h2>6) If you are awaiting an outcome</h2>
<p>If you have not yet been interviewed, arrange legal advice before attendance. See <a href="/blog/voluntary-interview-letter-kent-what-to-do">voluntary interview letter advice</a> and <a href="/blog/when-to-ask-for-solicitor-kent-police-station">when to ask for a solicitor</a>.</p>

<h2>7) Kent police station outcomes</h2>
<p>Outcomes after interview at Medway, Gravesend, Tonbridge, Canterbury, Folkestone, or voluntary interview stations follow the same broad principles. See <a href="/blog/police-station-rep-near-me-kent">Kent police station rep guide</a>.</p>`,
    conclusion: `<p>If you are facing a police interview or waiting for an outcome in Kent, call <strong>01732 247427</strong> for advice before or after attendance. Ask for <strong>Robert Cashman, Tuckers Duty Solicitor</strong>.</p>`,
    internal: [
      { url: "/released-under-investigation", label: "Released under investigation" },
      { url: "/police-bail-explained", label: "Police bail explained" },
      { url: "/contact", label: "Contact" },
    ],
    faq: [
      { q: "What does no further action mean after a police interview?", a: "It generally means the police are not taking further action at this time. It is not always permanent and investigations can reopen. This is general information only." },
      { q: "Is NFA the same as release under investigation?", a: "No. RUI means the investigation continues without bail. NFA usually means no further steps at this stage." },
      { q: "Should I keep records after NFA?", a: "Yes. Keep attendance notes, paperwork, and your solicitor's contact details in case police contact you again." },
      { q: "Can police reopen an NFA case?", a: "Investigations can reopen if new evidence emerges. This is general information — not advice about a specific case." },
    ],
  },
];

fs.mkdirSync(OUT, { recursive: true });

let written = 0;
for (const def of posts) {
  const file = path.join(OUT, `${DATE}-${def.slug}.json`);
  const json = buildPost(def);
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
  const words = json.contentHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`Wrote ${file} (${words} words, image: ${def.image})`);
  written++;
}

console.log(`\nDone: ${written} click-driving blog posts.`);
