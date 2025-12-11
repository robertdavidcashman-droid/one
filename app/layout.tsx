import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';

export const metadata: Metadata = {
  title: "Police Station Agent - Expert Legal Representation",
  description: "Professional police station representation and legal services across the UK. Available 24/7 for urgent legal assistance.",
  keywords: "police station agent, legal representation, solicitor, criminal defense, UK",
  authors: [{ name: "Police Station Agent" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Police Station Agent - Expert Legal Representation",
    description: "Professional police station representation and legal services across the UK.",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

