'use client';

import { useState } from 'react';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I request Robert Cashman at the police station?",
      answer: `<p>When arrested or invited for a voluntary interview, tell the custody officer or interviewing officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>. They must contact us.</p>
<p>You can also call us directly on <strong>0333 049 7036</strong> or <strong>020 8242 1857</strong> and we will arrange representation.</p>
<p>For private clients, you can pre-arrange representation by calling us before attending the police station. Simply tell the police when you arrive that you have already instructed Robert Cashman.</p>`
    },
    {
      question: "What are your fees for private representation?",
      answer: `<p>We offer fixed-fee packages for police station representation. Our fees are transparent and agreed upfront, so you know exactly what you're paying.</p>
<p>For a detailed quote tailored to your situation, please contact us on <strong>0333 049 7036</strong> or <strong>020 8242 1857</strong>. We can discuss your case and provide a clear estimate of costs.</p>
<p><strong>Fixed fees typically cover:</strong></p>
<ul>
<li>Pre-interview consultation</li>
<li>Police station attendance</li>
<li>Full representation during interview</li>
<li>Post-interview advice</li>
<li>Written summary of attendance</li>
</ul>
<p>All fees are agreed upfront with no hidden costs.</p>`
    },
    {
      question: "Why should I pay privately if police station advice is free?",
      answer: `<p>While Legal Aid provides excellent free representation, private funding offers several advantages:</p>
<ul>
<li><strong>Guaranteed senior solicitor:</strong> You are guaranteed to be represented by Robert Cashman, a solicitor with 35+ years of experience, rather than whoever is on the duty rota</li>
<li><strong>Continuity:</strong> The same solicitor will handle your case from police station through to court if needed</li>
<li><strong>Proactive approach:</strong> More time can be spent on pre-charge engagement and case preparation</li>
<li><strong>Flexibility:</strong> Greater flexibility in communication and meeting arrangements</li>
<li><strong>Peace of mind:</strong> Knowing you have a dedicated legal expert focused solely on your case</li>
</ul>
<p>For professionals, high-profile individuals, or those facing serious allegations, private representation can provide the enhanced service and continuity that may be crucial to the outcome.</p>`
    },
    {
      question: "What is included in a fixed-fee police station attendance?",
      answer: `<p>Our fixed-fee police station attendance package includes:</p>
<ul>
<li><strong>Pre-interview consultation:</strong> Detailed discussion of your case, your rights, and the interview process</li>
<li><strong>Police station attendance:</strong> Full representation by Robert Cashman at the police station</li>
<li><strong>Interview representation:</strong> Present throughout the entire interview to protect your interests</li>
<li><strong>Legal advice:</strong> Expert advice on whether to answer questions, make statements, or exercise your right to silence</li>
<li><strong>Post-interview advice:</strong> Explanation of what happens next, potential outcomes, and next steps</li>
<li><strong>Follow-up:</strong> Written summary and ongoing support if the case proceeds to court</li>
</ul>
<p>All fees are agreed upfront with no hidden costs.</p>`
    },
    {
      question: "Can I get Robert Cashman even if I'm not paying privately?",
      answer: `<p>Yes, you can request Robert Cashman under Legal Aid. When you ask for legal representation at the police station, tell the custody officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>.</p>
<p>However, under Legal Aid, representation is subject to availability and the duty rota. While we will do our best to ensure Robert Cashman attends, we cannot guarantee it will be him on every occasion.</p>
<p>With private funding, you are <strong>guaranteed</strong> to be represented by Robert Cashman, providing certainty and continuity.</p>
<p>If you specifically want Robert Cashman and want to ensure he attends, private funding is the way to guarantee this.</p>`
    },
    {
      question: "What's the difference between your Legal Aid and private service?",
      answer: `<p>The main differences are:</p>
<div class="space-y-4 my-4">
<div>
<h4 class="font-bold mb-2 text-slate-900">Legal Aid Service:</h4>
<ul class="list-disc pl-5 space-y-1 text-slate-600">
<li>100% free at the police station</li>
<li>Available to everyone, regardless of income</li>
<li>Representation by an accredited duty solicitor (may be Robert Cashman or another qualified solicitor)</li>
<li>Subject to duty rota availability</li>
<li>Excellent standard of representation</li>
</ul>
</div>
<div>
<h4 class="font-bold mb-2 text-slate-900">Private Service:</h4>
<ul class="list-disc pl-5 space-y-1 text-slate-600">
<li>Fixed fee agreed upfront</li>
<li>Guaranteed representation by Robert Cashman</li>
<li>Continuity from police station through to court</li>
<li>Proactive defence strategy from the outset</li>
<li>Greater time dedicated to pre-charge engagement</li>
<li>Flexible communication and meeting arrangements</li>
<li>Peace of mind knowing you have a dedicated senior solicitor</li>
</ul>
</div>
</div>
<p>Both services provide expert representation. The choice depends on your priorities: cost (Legal Aid) or guaranteed continuity and enhanced service (private).</p>`
    }
  ];

  return (
    <div className="rounded-xl border bg-white text-slate-900 shadow mb-8">
      <div className="p-6">
        <div className="w-full space-y-0">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex flex-1 items-center justify-between py-4 text-sm transition-all hover:underline w-full text-left font-semibold"
              >
                <span>{faq.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`lucide lucide-chevron-down h-4 w-4 shrink-0 text-blue-600 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {openIndex === index && (
                <div className="overflow-hidden pb-4 text-slate-800">
                  <div 
                    className="prose prose-slate max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

