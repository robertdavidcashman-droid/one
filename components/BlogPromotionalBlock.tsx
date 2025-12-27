import Link from 'next/link';

/**
 * Promotional block component for blog posts
 * Displays information about CriminalDefenceKent.co.uk services
 * Must be clearly separated from editorial content
 */
export default function BlogPromotionalBlock() {
  return (
    <div className="mt-16 pt-8 border-t-2 border-slate-200">
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8 border border-blue-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Police Station Advice & Representation
        </h2>
        <p className="text-slate-700 mb-6 leading-relaxed">
          CriminalDefenceKent.co.uk provides expert police station representation and legal services 
          across Kent and the UK. Our accredited duty solicitor, Robert Cashman, offers free legal 
          advice under Legal Aid for police station interviews, voluntary attendances, and custody 
          matters. Available during extended hours for urgent legal assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://criminaldefencekent.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            Visit CriminalDefenceKent.co.uk
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Contact Us
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Free legal advice applies to police station interviews only – either in custody or voluntary 
          interviews under caution. Subject to availability and Legal Aid eligibility.
        </p>
      </div>
    </div>
  );
}


























