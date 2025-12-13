import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { SITE_DOMAIN } from '@/config/site';

export const metadata: Metadata = {
  title: "Police Station Interviews in Kent: Your Rights and What to Expect | Criminal Defence Kent",
  description: "Complete guide to police station interviews in Kent. Understand your rights under PACE 1984, what happens during interview, and why legal advice is essential. FREE legal aid available 24/7.",
  alternates: {
    canonical: `https://${SITE_DOMAIN}/police-station-interviews-kent-rights`,
  },
  openGraph: {
    title: "Police Station Interviews in Kent: Your Rights and What to Expect",
    description: "Complete guide to police station interviews in Kent. Understand your rights under PACE 1984, what happens during interview, and why legal advice is essential.",
    url: `https://${SITE_DOMAIN}/police-station-interviews-kent-rights`,
    siteName: 'Criminal Defence Kent',
    type: 'article',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I have the right to a solicitor at a police station?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Under section 58 of the Police and Criminal Evidence Act 1984 (PACE), everyone arrested or invited for a voluntary interview has the right to free legal advice at the police station. This right is not means-tested and applies regardless of your financial circumstances."
      }
    },
    {
      "@type": "Question",
      "name": "Is police station advice free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Legal advice at the police station is free under the Legal Aid scheme. This applies whether you are in custody or attending a voluntary interview. There is no charge for police station representation under legal aid."
      }
    },
    {
      "@type": "Question",
      "name": "Can I refuse a police interview?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If you are under arrest, you cannot refuse to be interviewed, though you can exercise your right to silence. For voluntary interviews, you can technically refuse, but refusal may lead to arrest. It is strongly recommended to attend with legal representation rather than refuse."
      }
    },
    {
      "@type": "Question",
      "name": "What does \"no comment\" mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "\"No comment\" means you are exercising your right to silence during a police interview. While you have this right, courts may draw adverse inferences from silence in certain circumstances under the Criminal Justice and Public Order Act 1994. Your solicitor will advise whether this is the appropriate strategy for your case."
      }
    }
  ]
};

export default function Page() {
  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return (
    <>
      <JsonLd data={faqSchema} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
          <div className="bg-slate-50 min-h-screen">
            <div 
              className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
              dangerouslySetInnerHTML={{ __html: `
                <div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v5.1.0 — ${currentDate}</div>
                <div class="bg-slate-50">
                  <div class="max-w-6xl mx-auto px-4 py-16">
                    <div class="text-center mb-12">
                      <div class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-blue-100 text-blue-800 mb-4">Complete Guide</div>
                      <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-6">Police Station Interviews in Kent: Your Rights and What to Expect</h1>
                      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">A comprehensive guide to understanding police station interviews, your legal rights under PACE 1984, and what happens during the interview process in Kent.</p>
                    </div>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-card text-card-foreground border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-slate-900">What a Police Station Interview Is</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-4 text-slate-700 leading-relaxed">
                          <p>A police station interview is a formal questioning session conducted by police officers under the Police and Criminal Evidence Act 1984 (PACE). It occurs when you are suspected of committing a criminal offence.</p>
                          <p>Interviews can take place in two circumstances:</p>
                          <ul class="list-disc pl-6 space-y-2">
                            <li><strong>After arrest:</strong> You are in police custody and being questioned about the offence for which you were arrested.</li>
                            <li><strong>Voluntary interview:</strong> You attend the police station by appointment without being under arrest, but you are still being questioned under caution about a suspected offence.</li>
                          </ul>
                          <p>Both types of interview are recorded (audio or video) and anything you say can be used as evidence in court. The interview is conducted under caution, meaning you are informed of your right to silence and the potential consequences of remaining silent.</p>
                          <p class="text-sm text-slate-600 italic mt-4">Reference: Police and Criminal Evidence Act 1984, Code C (2023) - Code of Practice for the Detention, Treatment and Questioning of Persons by Police Officers.</p>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-card text-card-foreground border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-slate-900">Arrest vs Voluntary Interview</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-4 text-slate-700 leading-relaxed">
                          <p>Understanding the difference between arrest and voluntary interview is important for knowing your rights and what to expect.</p>
                          
                          <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div class="rounded-lg bg-red-50 border border-red-200 p-6">
                              <h3 class="font-bold text-red-900 mb-3">After Arrest</h3>
                              <ul class="space-y-2 text-sm text-red-800">
                                <li>• You are in police custody</li>
                                <li>• You cannot leave until released or charged</li>
                                <li>• Interview typically happens within 24 hours</li>
                                <li>• You have the right to free legal advice</li>
                                <li>• You can be detained for up to 24 hours (extendable to 36 or 96 hours in serious cases)</li>
                              </ul>
                            </div>
                            <div class="rounded-lg bg-blue-50 border border-blue-200 p-6">
                              <h3 class="font-bold text-blue-900 mb-3">Voluntary Interview</h3>
                              <ul class="space-y-2 text-sm text-blue-800">
                                <li>• You attend by appointment</li>
                                <li>• You are not under arrest (technically free to leave)</li>
                                <li>• Still conducted under caution</li>
                                <li>• Still recorded and can be used in evidence</li>
                                <li>• You still have the right to free legal advice</li>
                                <li>• Refusal may lead to arrest</li>
                              </ul>
                            </div>
                          </div>
                          
                          <p class="mt-6"><strong>Important:</strong> Despite being called "voluntary", these interviews are just as serious as custody interviews. Anything you say can be used in evidence, and you should always have legal representation.</p>
                          <p class="text-sm text-slate-600 italic mt-4">Reference: Police and Criminal Evidence Act 1984, Code C, Paragraph 3.21 - Voluntary interviews.</p>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-white">Right to Legal Advice at the Police Station</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-4 text-green-50 leading-relaxed">
                          <p><strong class="text-white">Everyone has the right to free legal advice at the police station.</strong> This is a fundamental right protected by section 58 of the Police and Criminal Evidence Act 1984 (PACE).</p>
                          
                          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-6">
                            <h3 class="font-bold text-white mb-4 text-lg">Key Points:</h3>
                            <ul class="space-y-3">
                              <li class="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle w-5 h-5 text-green-300 flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span><strong class="text-white">Free of charge:</strong> Legal advice at the police station is free under the Legal Aid scheme. There is no means test.</span>
                              </li>
                              <li class="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle w-5 h-5 text-green-300 flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span><strong class="text-white">Available 24/7:</strong> Duty solicitors are available around the clock, including weekends and bank holidays.</span>
                              </li>
                              <li class="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle w-5 h-5 text-green-300 flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span><strong class="text-white">Private consultation:</strong> You have the right to speak to your solicitor in private before and during the interview.</span>
                              </li>
                              <li class="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle w-5 h-5 text-green-300 flex-shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span><strong class="text-white">Cannot be delayed:</strong> Police cannot unreasonably delay your access to legal advice, except in very limited exceptional circumstances.</span>
                              </li>
                            </ul>
                          </div>
                          
                          <p class="mt-6"><strong class="text-white">How to request a solicitor:</strong> Simply tell the custody officer or interviewing officer that you want legal advice. You can ask for a duty solicitor (free and independent) or request a specific solicitor or firm. In Kent, you can ask for Robert Cashman or Tuckers Solicitors.</p>
                          <p class="text-sm text-green-100 italic mt-4">Reference: Police and Criminal Evidence Act 1984, Section 58 - Right to have someone informed when arrested and right to consult a solicitor.</p>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-card text-card-foreground border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-slate-900">What Happens During Interview</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-6 text-slate-700 leading-relaxed">
                          <p>Understanding the interview process helps you prepare and know what to expect. Here is a step-by-step guide:</p>
                          
                          <div class="space-y-6 mt-6">
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 1: Private Consultation</h3>
                              <p>Before the interview begins, you have the right to a private consultation with your solicitor. This is confidential and legally privileged. During this consultation:</p>
                              <ul class="list-disc pl-6 mt-2 space-y-1">
                                <li>Your solicitor will explain what you are suspected of</li>
                                <li>They will request and review disclosure (evidence the police have)</li>
                                <li>They will explain your rights and options</li>
                                <li>They will advise on interview strategy</li>
                                <li>They will prepare you for what to expect</li>
                              </ul>
                            </div>
                            
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 2: The Caution</h3>
                              <p>The interview begins with the police caution:</p>
                              <div class="bg-slate-100 rounded-lg p-4 my-3 italic">
                                <p class="font-medium">"You do not have to say anything. But it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence."</p>
                              </div>
                              <p>This caution informs you of your right to silence and the potential consequences of remaining silent. Your solicitor will explain what this means in practical terms.</p>
                            </div>
                            
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 3: Recording</h3>
                              <p>Interviews at Kent police stations are recorded – either audio (PACE Code E) or video (PACE Code F). This creates an objective record that protects both you and the police.</p>
                            </div>
                            
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 4: Questioning</h3>
                              <p>Police will ask questions about the suspected offence. Your solicitor will be present throughout and can:</p>
                              <ul class="list-disc pl-6 mt-2 space-y-1">
                                <li>Object to improper or leading questions</li>
                                <li>Request clarification if questions are unclear</li>
                                <li>Advise you privately (the interview can be paused)</li>
                                <li>Intervene if police act improperly</li>
                                <li>Take detailed notes of everything said</li>
                              </ul>
                            </div>
                            
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 5: Your Response Options</h3>
                              <p>You have several options for responding during interview:</p>
                              <ul class="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Answer questions:</strong> Provide full answers to police questions</li>
                                <li><strong>Prepared statement:</strong> Read a prepared statement then exercise your right to silence</li>
                                <li><strong>No comment:</strong> Exercise complete silence throughout</li>
                              </ul>
                              <p class="mt-3"><strong>Important:</strong> Each approach has different implications. Your solicitor will advise which strategy is most appropriate for your specific situation based on the evidence disclosed and the nature of the allegation.</p>
                            </div>
                            
                            <div class="border-l-4 border-blue-600 pl-6">
                              <h3 class="font-bold text-slate-900 mb-2">Step 6: After the Interview</h3>
                              <p>Following the interview, police will decide on next steps. You may be:</p>
                              <ul class="list-disc pl-6 mt-2 space-y-1">
                                <li>Released without charge</li>
                                <li>Released under investigation (RUI)</li>
                                <li>Bailed with conditions to return</li>
                                <li>Charged with an offence</li>
                                <li>Given a caution (if you admit the offence)</li>
                              </ul>
                              <p class="mt-3">Your solicitor will explain what each outcome means and what happens next.</p>
                            </div>
                          </div>
                          
                          <p class="text-sm text-slate-600 italic mt-6">Reference: Police and Criminal Evidence Act 1984, Code C (2023) - Code of Practice for the Detention, Treatment and Questioning of Persons by Police Officers, Paragraphs 10-13.</p>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-card text-card-foreground border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-slate-900">The Role of a Police Station Solicitor</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-4 text-slate-700 leading-relaxed">
                          <p>A police station solicitor (also called a duty solicitor) is a qualified legal professional who represents you during police interviews. Their role is crucial in protecting your rights and ensuring you receive fair treatment.</p>
                          
                          <div class="grid md:grid-cols-2 gap-6 mt-6">
                            <div class="bg-blue-50 rounded-lg p-6">
                              <h3 class="font-bold text-blue-900 mb-3">Before the Interview</h3>
                              <ul class="space-y-2 text-sm text-blue-800">
                                <li>• Explain the allegation and evidence</li>
                                <li>• Review disclosure from police</li>
                                <li>• Advise on interview strategy</li>
                                <li>• Prepare you for questioning</li>
                                <li>• Answer your questions</li>
                              </ul>
                            </div>
                            <div class="bg-green-50 rounded-lg p-6">
                              <h3 class="font-bold text-green-900 mb-3">During the Interview</h3>
                              <ul class="space-y-2 text-sm text-green-800">
                                <li>• Be present throughout</li>
                                <li>• Object to improper questions</li>
                                <li>• Request clarification</li>
                                <li>• Advise you privately if needed</li>
                                <li>• Take detailed notes</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div class="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
                            <h3 class="font-bold text-amber-900 mb-3">Important Points:</h3>
                            <ul class="space-y-2 text-sm text-amber-800">
                              <li><strong>Confidentiality:</strong> Everything you tell your solicitor is legally privileged and confidential. They cannot be forced to reveal what you tell them.</li>
                              <li><strong>Independence:</strong> Duty solicitors are independent of the police and work solely in your interests.</li>
                              <li><strong>Experience:</strong> Police station solicitors are trained and experienced in criminal defence and understand police procedures.</li>
                              <li><strong>Free service:</strong> Legal advice at the police station is free under Legal Aid, regardless of your financial circumstances.</li>
                            </ul>
                          </div>
                          
                          <p class="mt-6"><strong>Why you should always have a solicitor:</strong> Police interviews are designed to gather evidence. Having a solicitor ensures your rights are protected, you understand the process, and you make informed decisions about how to respond. Studies show that people with legal representation are more likely to achieve better outcomes.</p>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-card text-card-foreground border-0 shadow-xl">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-3xl font-black text-slate-900">Common Questions and Concerns</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-6">
                          <div class="border-b border-slate-200 pb-6">
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">Will having a solicitor make me look guilty?</h3>
                            <p class="text-slate-700">No. Having a solicitor is a fundamental right, not an admission of guilt. Police officers understand this, and courts cannot draw negative inferences from exercising your right to legal advice. In fact, having representation often leads to better outcomes.</p>
                          </div>
                          
                          <div class="border-b border-slate-200 pb-6">
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">How long will I have to wait for a solicitor?</h3>
                            <p class="text-slate-700">Duty solicitors typically attend within 45 minutes to an hour at Kent police stations. In urgent cases, they may attend sooner. Police should not unreasonably delay your access to legal advice.</p>
                          </div>
                          
                          <div class="border-b border-slate-200 pb-6">
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">What if I can't afford a solicitor?</h3>
                            <p class="text-slate-700">You don't need to worry about cost. Legal advice at the police station is free under the Legal Aid scheme. There is no means test - everyone is entitled to free representation regardless of income or savings.</p>
                          </div>
                          
                          <div class="border-b border-slate-200 pb-6">
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">Can I change my mind during the interview?</h3>
                            <p class="text-slate-700">Yes. You can pause the interview at any time to speak privately with your solicitor. You can also change your approach - for example, if you started answering questions, you can decide to exercise your right to silence after consulting with your solicitor.</p>
                          </div>
                          
                          <div class="border-b border-slate-200 pb-6">
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">What if I make a mistake or say something wrong?</h3>
                            <p class="text-slate-700">If you realise you've made an error or want to clarify something, you can do so. Your solicitor can help you make corrections or clarifications. This is one reason why having legal representation is so important.</p>
                          </div>
                          
                          <div>
                            <h3 class="font-bold text-slate-900 mb-2 text-lg">Will the interview be used in court?</h3>
                            <p class="text-slate-700">Yes. The interview recording can be played in court as evidence. This is why it's crucial to have legal advice before and during the interview - what you say (or don't say) can have significant consequences for your case.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-slate-100 border-slate-200 shadow-lg">
                        <div class="flex flex-col space-y-1.5 p-6">
                          <h2 class="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
                        </div>
                        <div class="p-6 pt-0 space-y-6">
                          <div class="bg-white rounded-lg p-6">
                            <h3 class="font-bold text-slate-900 mb-2">Do I have the right to a solicitor at a police station?</h3>
                            <p class="text-slate-700">Yes. Under section 58 of the Police and Criminal Evidence Act 1984 (PACE), everyone arrested or invited for a voluntary interview has the right to free legal advice at the police station. This right is not means-tested and applies regardless of your financial circumstances.</p>
                          </div>
                          
                          <div class="bg-white rounded-lg p-6">
                            <h3 class="font-bold text-slate-900 mb-2">Is police station advice free?</h3>
                            <p class="text-slate-700">Yes. Legal advice at the police station is free under the Legal Aid scheme. This applies whether you are in custody or attending a voluntary interview. There is no charge for police station representation under legal aid.</p>
                          </div>
                          
                          <div class="bg-white rounded-lg p-6">
                            <h3 class="font-bold text-slate-900 mb-2">Can I refuse a police interview?</h3>
                            <p class="text-slate-700">If you are under arrest, you cannot refuse to be interviewed, though you can exercise your right to silence. For voluntary interviews, you can technically refuse, but refusal may lead to arrest. It is strongly recommended to attend with legal representation rather than refuse.</p>
                          </div>
                          
                          <div class="bg-white rounded-lg p-6">
                            <h3 class="font-bold text-slate-900 mb-2">What does "no comment" mean?</h3>
                            <p class="text-slate-700">"No comment" means you are exercising your right to silence during a police interview. While you have this right, courts may draw adverse inferences from silence in certain circumstances under the Criminal Justice and Public Order Act 1994. Your solicitor will advise whether this is the appropriate strategy for your case.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl border bg-slate-800 text-white shadow-xl">
                        <div class="p-8">
                          <h2 class="text-2xl font-bold text-white mb-6">Sources and Legal References</h2>
                          <div class="space-y-3 text-sm text-slate-300">
                            <p><strong class="text-white">Police and Criminal Evidence Act 1984 (PACE):</strong> The primary legislation governing police powers and procedures in England and Wales.</p>
                            <p><strong class="text-white">PACE Code C (2023):</strong> Code of Practice for the Detention, Treatment and Questioning of Persons by Police Officers. Available at: <a href="https://www.gov.uk/government/publications/pace-code-c-2023" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">www.gov.uk</a></p>
                            <p><strong class="text-white">PACE Code E (2018):</strong> Code of Practice on Audio Recording Interviews with Suspects. Available at: <a href="https://www.gov.uk/government/publications/pace-code-e-2018" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">www.gov.uk</a></p>
                            <p><strong class="text-white">PACE Code F (2018):</strong> Code of Practice on Visual Recording with Sound of Interviews with Suspects. Available at: <a href="https://www.gov.uk/government/publications/pace-code-f-2018" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">www.gov.uk</a></p>
                            <p><strong class="text-white">Criminal Justice and Public Order Act 1994, Sections 34-37:</strong> Provisions relating to inferences from silence. Available at: <a href="https://www.legislation.gov.uk/ukpga/1994/33/contents" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">www.legislation.gov.uk</a></p>
                            <p><strong class="text-white">Legal Aid Agency:</strong> Information about free legal advice at police stations. Available at: <a href="https://www.gov.uk/legal-aid" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">www.gov.uk/legal-aid</a></p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section class="mb-12">
                      <div class="rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white shadow-2xl border-0">
                        <div class="p-8 md:p-12 text-center">
                          <h3 class="text-3xl md:text-4xl font-black text-white mb-4">Need Legal Advice at a Kent Police Station?</h3>
                          <p class="text-xl text-red-100 mb-8 max-w-2xl mx-auto">FREE legal advice available 24/7 at all Kent police stations. Call now for immediate assistance.</p>
                          <div class="flex flex-col sm:flex-row justify-center gap-4">
                            <a href="tel:01732247427" class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 rounded-md px-8 bg-white text-red-600 hover:bg-red-50 font-black text-lg shadow-xl flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call: 01732 247427
                            </a>
                            <a href="sms:07535494446?text=I need police station advice" class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 rounded-md px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle w-6 h-6"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg> Text: 07535 494446
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div class="border-t border-slate-200 pt-8 mt-12">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-slate-600">
                        <div>
                          <p class="font-semibold text-slate-900 mb-1">Written by Robert Cashman</p>
                          <p>Criminal Defence Solicitor</p>
                        </div>
                        <div>
                          <p class="text-slate-500">Last updated: ${currentDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ` }}
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

