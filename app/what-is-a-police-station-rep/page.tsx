import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What is a Police Station Rep | Police Station Agent",
  description: "",
  keywords: undefined,
  alternates: {
    canonical: "https://policestationagent.com/what-is-a-police-station-rep",
  },
  openGraph: {
    title: "\n   Police Station Agent\n  ",
    description: "",
    type: 'website',
    url: "https://policestationagent.com/what-is-a-police-station-rep",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: `<!-- Header -->\n  <h1 style="text-align:center; color:#003366; margin-bottom: 5px; font-size: 2em;">\n    Police Station Rep Registration\n  </h1>\n  <p style="text-align:center; font-size: 1.1em; color:#444; margin-bottom: 25px;">\n    Join the UK's leading directory for Police Station Representatives – <strong>free of charge</strong>.\n  </p>\n\n  <!-- Benefits -->\n  <div style="background:#f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #d0d7de;">\n    <h2 style="margin-top: 0; color:#003366;">Why Register?</h2>\n    <ul style="margin: 0; padding-left: 20px;">\n      <li>Free personal profile page</li>\n      <li>Featured advert for your services</li>\n      <li>Advanced search visibility</li>\n      <li>Top placement in listings</li>\n      <li>Instant exposure to law firms and solicitors</li>\n    </ul>\n  </div>\n\n  <!-- Registration Form -->\n  <h2 style="color:#003366; margin-bottom: 10px;">Register Now – It’s Free</h2>\n  <form>\n    <label>First Name*</label>\n    <input type="text" name="first_name" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>Last Name*</label>\n    <input type="text" name="last_name" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>First Two Lines of Address*</label>\n    <input type="text" name="address" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>City*</label>\n    <input type="text" name="city" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>County*</label>\n    <input type="text" name="county" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>Postcode*</label>\n    <input type="text" name="postcode" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>Contact Number*</label>\n    <input type="tel" name="phone" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>Email Address*</label>\n    <input type="email" name="email" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>DSCC PIN*</label>\n    <input type="text" name="dscc_pin" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <label>Police Stations Covered*</label>\n    <textarea name="stations" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;" rows="3"></textarea>\n\n    <label>Availability*</label>\n    <input type="text" name="availability" style="width:100%; padding:10px; margin:6px 0 15px; border:1px solid #ccc; border-radius:4px;">\n\n    <p style="font-size:0.95em; color:#555;">\n      <input type="checkbox" name="accredited"> I confirm I am a fully accredited Police Station Representative.\n    </p>\n\n    <button type="submit" style="background:#003366; color:#fff; padding:12px 20px; border:none; border-radius:5px; font-size:1em; cursor:pointer;">\n      Register Now\n    </button>\n  </form>\n\n  <!-- Accreditation Warning -->\n  <div style="margin-top:25px; background:#fff3f3; padding:15px; border-left:5px solid #cc0000; border-radius:4px;">\n    <strong style="color:#cc0000;">Important:</strong> You must be fully accredited. Fraudulent claims will be reported to the authorities and may result in prosecution.\n  </div>\n\n  <!-- Contact Help Section -->\n  <div style="margin-top:25px; background:#f0f4f8; padding:20px; border-radius:8px; border: 1px solid #d0d7de;">\n    <h3 style="margin-top:0; color:#003366;">Need Help Registering?</h3>\n    <p>📞 Call/Text: <strong>07535 494446</strong></p>\n    <p>✉️ Email: <a href="mailto:info@policestationrepuk.com" style="color:#003366; text-decoration:none;">info@policestationrepuk.com</a></p>\n    <p>We can register you manually in minutes.</p>\n  </div>` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
