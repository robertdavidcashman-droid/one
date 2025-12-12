import type { Metadata } from "next";
import "./globals.css";
import { inter } from './fonts';
import { SITE_URL } from '@/config/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

