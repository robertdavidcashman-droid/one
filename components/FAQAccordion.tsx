'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  sections: FAQSection[];
}

export default function FAQAccordion({ sections }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-16">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${section.iconBg}`}>
              <div className={section.iconColor}>
                {section.icon}
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.items.map((item, itemIndex) => {
              const key = `${sectionIndex}-${itemIndex}`;
              const isOpen = openItems.has(key);
              return (
                <div
                  key={itemIndex}
                  className="rounded-xl bg-white text-slate-900 shadow border-2 transition-all duration-300 border-slate-200 hover:border-slate-300"
                >
                  <button
                    className="w-full text-left p-6 flex items-start justify-between gap-4"
                    onClick={() => toggleItem(sectionIndex, itemIndex)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{item.question}</h3>
                    </div>
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
                      className={`lucide lucide-chevron-down w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="prose prose-sm max-w-none text-slate-800">
                        <p className="leading-relaxed whitespace-pre-line">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}




