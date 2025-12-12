// Script to create initial draft content for admin system
// Run with: node scripts/seed-draft-content.js

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Get first admin user ID (or use 1 as default)
const adminUser = db.prepare('SELECT id FROM users LIMIT 1').get();
const authorId = adminUser ? adminUser.id : 1;

const draftPosts = [
  {
    title: 'What Happens at a Police Station Interview in Kent',
    slug: 'what-happens-at-a-police-station-interview-in-kent',
    content: `<h2>Understanding Police Station Interviews in Kent</h2>
<p>If you are arrested or invited for a voluntary interview at a police station in Kent, understanding the process can help you protect your rights. This guide explains what happens during a police station interview under the Police and Criminal Evidence Act 1984 (PACE).</p>

<h3>The Interview Process</h3>
<p>When you arrive at a Kent police station, you will be:</p>
<ul>
<li>Informed of your rights, including the right to free legal advice</li>
<li>Given the opportunity to consult with a solicitor before the interview</li>
<li>Interviewed under caution, meaning everything you say is recorded</li>
<li>Provided with disclosure about the allegations against you</li>
</ul>

<h3>Your Rights During Interview</h3>
<p>Under PACE 1984, you have several important rights:</p>
<ul>
<li><strong>Right to free legal advice:</strong> This is not means-tested and is available to everyone</li>
<li><strong>Right to remain silent:</strong> You do not have to answer questions, though there are some circumstances where silence may be commented on in court</li>
<li><strong>Right to an interpreter:</strong> If English is not your first language</li>
<li><strong>Right to medical attention:</strong> If you need it</li>
</ul>

<h3>Why Legal Representation Matters</h3>
<p>Having a solicitor present during a police interview in Kent ensures:</p>
<ul>
<li>You understand the allegations and evidence</li>
<li>Questions are fair and properly put</li>
<li>Your rights are protected throughout</li>
<li>You receive advice on whether to answer questions or remain silent</li>
</ul>

<p>All police station legal advice in Kent is free under Legal Aid, regardless of your financial circumstances.</p>`,
    excerpt: 'A guide to what happens during a police station interview in Kent, including your rights under PACE 1984 and why legal representation is important.',
    faq_content: `<h3>Do I have to answer police questions in Kent?</h3>
<p>No. You have the right to remain silent during a police interview. However, in some circumstances, a court may draw inferences from silence. A solicitor can advise you on the best approach for your specific situation.</p>

<h3>Is legal advice really free at Kent police stations?</h3>
<p>Yes. Under the Police and Criminal Evidence Act 1984, everyone has the right to free legal advice at a police station. This is not means-tested and is available regardless of your income or savings.</p>

<h3>How long can I be held at a Kent police station?</h3>
<p>Generally, you can be held for up to 24 hours without charge. This can be extended to 36 hours with authorisation from a senior officer, and up to 96 hours with court approval for serious offences.</p>

<h3>What happens after the interview?</h3>
<p>After the interview, police may:</p>
<ul>
<li>Release you with no further action</li>
<li>Release you on bail to return at a later date</li>
<li>Charge you and either release you on bail or keep you in custody for court</li>
</ul>`,
    location: 'Kent',
    published: false,
  },
  {
    title: 'Do I Need a Solicitor at a Police Station Interview?',
    slug: 'do-i-need-a-solicitor-at-a-police-station-interview',
    content: `<h2>Why You Should Have a Solicitor at a Police Station Interview</h2>
<p>If you are arrested or invited for a voluntary interview at a police station in Kent, you have the right to free legal advice. This guide explains why exercising this right is important.</p>

<h3>Your Right to Free Legal Advice</h3>
<p>Under the Police and Criminal Evidence Act 1984 (PACE), everyone has the right to free, independent legal advice at a police station. This right is:</p>
<ul>
<li>Not means-tested - available regardless of your financial situation</li>
<li>Available 24 hours a day, 7 days a week</li>
<li>Independent of the police</li>
<li>Confidential and protected by legal professional privilege</li>
</ul>

<h3>What a Solicitor Does During Interview</h3>
<p>A solicitor attending a police station interview in Kent will:</p>
<ul>
<li>Obtain disclosure about the allegations and evidence against you</li>
<li>Explain the legal process and your rights</li>
<li>Advise you on whether to answer questions or remain silent</li>
<li>Ensure questions are fair and properly put</li>
<li>Intervene if the interview becomes unfair or inappropriate</li>
<li>Provide advice on bail conditions if you are charged</li>
</ul>

<h3>Common Misconceptions</h3>
<p><strong>"Asking for a solicitor makes me look guilty"</strong></p>
<p>This is not true. Requesting legal advice is a fundamental right and shows you are taking the situation seriously. Police cannot use your request for a solicitor against you.</p>

<p><strong>"I can explain everything and clear it up"</strong></p>
<p>While this may seem logical, police interviews are designed to gather evidence. Without legal advice, you may unintentionally say something that harms your case. A solicitor can help you present your case effectively.</p>

<p><strong>"I only need a solicitor if I'm guilty"</strong></p>
<p>Everyone benefits from legal advice, regardless of whether they are innocent or guilty. A solicitor ensures your rights are protected and helps you make informed decisions.</p>

<h3>Voluntary Interviews</h3>
<p>Even if you are invited for a "voluntary" interview (also called a "caution plus 3" interview), you should still have a solicitor present. These interviews:</p>
<ul>
<li>Are conducted under caution</li>
<li>Are recorded and can be used as evidence</li>
<li>Have the same legal consequences as interviews after arrest</li>
<li>Still entitle you to free legal advice</li>
</ul>

<p>If you are invited for a voluntary interview at a Kent police station, contact us on 0333 0497 036 for free legal advice.</p>`,
    excerpt: 'Why you should have a solicitor present at a police station interview in Kent. Your right to free legal advice under PACE 1984 and what a solicitor does.',
    faq_content: `<h3>Is it really free to have a solicitor at a Kent police station?</h3>
<p>Yes. Legal advice at police stations is free under Legal Aid and is not means-tested. You do not need to provide financial information or pay anything.</p>

<h3>Will the police think I'm guilty if I ask for a solicitor?</h3>
<p>No. Requesting legal advice is a fundamental right and cannot be used against you. Police are trained to understand that everyone has the right to legal representation.</p>

<h3>How quickly can a solicitor attend a Kent police station?</h3>
<p>We aim to attend any Kent police station within 45 minutes of being notified that police are ready to interview. We are available 24/7 including weekends and bank holidays.</p>

<h3>What if I've already started the interview without a solicitor?</h3>
<p>You can request a solicitor at any time during the interview process. The interview should be paused to allow you to consult with a solicitor.</p>`,
    location: 'Kent',
    published: false,
  },
  {
    title: 'What Is Police Station Representation?',
    slug: 'what-is-police-station-representation',
    content: `<h2>Understanding Police Station Representation</h2>
<p>Police station representation is the legal service provided by solicitors and accredited representatives when someone is arrested or invited for a voluntary interview at a police station in Kent or elsewhere in England and Wales.</p>

<h3>What Police Station Representation Involves</h3>
<p>Police station representation includes:</p>
<ul>
<li><strong>Pre-interview consultation:</strong> A private meeting with your solicitor to discuss the allegations, review disclosure, and plan your approach</li>
<li><strong>Interview attendance:</strong> Your solicitor sits with you during the interview to ensure it is conducted fairly</li>
<li><strong>Legal advice:</strong> Guidance on whether to answer questions or exercise your right to remain silent</li>
<li><strong>Post-interview advice:</strong> Explanation of what happens next, whether that's release, bail, or charge</li>
</ul>

<h3>Who Provides Police Station Representation?</h3>
<p>In Kent, police station representation can be provided by:</p>
<ul>
<li><strong>Duty Solicitors:</strong> Qualified solicitors on the Legal Aid duty rota, available 24/7</li>
<li><strong>Accredited Police Station Representatives:</strong> Qualified representatives who can attend on behalf of a solicitor's firm</li>
<li><strong>Your Own Solicitor:</strong> A solicitor you have instructed privately</li>
</ul>

<p>All must be accredited by the Solicitors Regulation Authority or approved by the Legal Aid Agency.</p>

<h3>Legal Framework</h3>
<p>Police station representation is governed by:</p>
<ul>
<li><strong>Police and Criminal Evidence Act 1984 (PACE):</strong> Sets out your rights and the procedures police must follow</li>
<li><strong>PACE Codes of Practice:</strong> Detailed rules about how interviews should be conducted</li>
<li><strong>Legal Aid Agency:</strong> Administers the scheme that provides free legal advice</li>
</ul>

<h3>When Representation Is Available</h3>
<p>You have the right to free legal representation at a police station when:</p>
<ul>
<li>You are arrested and taken into custody</li>
<li>You are invited for a voluntary interview under caution</li>
<li>You are questioned about a criminal offence</li>
</ul>

<p>This right applies regardless of your financial circumstances and is available 24 hours a day, 7 days a week at all Kent police stations.</p>

<h3>Why Representation Matters</h3>
<p>Police station representation is important because:</p>
<ul>
<li>Early legal advice can significantly impact the outcome of your case</li>
<li>Your solicitor can identify weaknesses in the prosecution case</li>
<li>Proper representation can prevent charges or secure better outcomes</li>
<li>Your rights are protected throughout the process</li>
</ul>

<p>If you need police station representation in Kent, call us on 0333 0497 036. We are available 24/7.</p>`,
    excerpt: 'An explanation of police station representation in Kent, including what it involves, who provides it, and your rights under PACE 1984.',
    faq_content: `<h3>What is the difference between a duty solicitor and a police station representative?</h3>
<p>A duty solicitor is a qualified solicitor on the Legal Aid duty rota. A police station representative is an accredited person who can attend on behalf of a solicitor's firm. Both can provide legal advice and representation at police stations.</p>

<h3>How do I get a solicitor at a Kent police station?</h3>
<p>You can:</p>
<ul>
<li>Ask the custody officer to contact the duty solicitor scheme</li>
<li>Call us directly on 0333 0497 036</li>
<li>Ask a friend or family member to contact us on your behalf</li>
</ul>

<h3>Is police station representation really free?</h3>
<p>Yes. Legal advice and representation at police stations is free under Legal Aid and is not means-tested. You do not need to provide financial information.</p>

<h3>Can I choose my own solicitor?</h3>
<p>Yes. You can request a specific solicitor or firm. If they are available, they will attend. Otherwise, the duty solicitor scheme will arrange representation.</p>`,
    location: 'Kent',
    published: false,
  },
];

console.log('Creating draft content...');

draftPosts.forEach((post, index) => {
  try {
    // Check if post already exists
    const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(post.slug);
    
    if (existing) {
      console.log(`✓ Post "${post.title}" already exists, skipping...`);
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO blog_posts 
      (title, slug, content, excerpt, published, author_id, faq_content, location, meta_title, meta_description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // Auto-generate SEO fields
    const metaTitle = `${post.title} | Police Station Solicitor ${post.location}`;
    const metaDescription = post.excerpt || `${post.title}. Expert police station representation in ${post.location}. Available 24/7.`;

    stmt.run(
      post.title,
      post.slug,
      post.content,
      post.excerpt,
      post.published ? 1 : 0,
      authorId,
      post.faq_content,
      post.location,
      metaTitle,
      metaDescription
    );

    console.log(`✓ Created draft: "${post.title}"`);
  } catch (error) {
    console.error(`✗ Error creating "${post.title}":`, error.message);
  }
});

console.log('\nDraft content creation complete!');
console.log('These posts are saved as DRAFTS and will not appear on the public site until published.');
console.log('To publish, log into the admin area and edit each post to check the "Published" checkbox.');

db.close();

