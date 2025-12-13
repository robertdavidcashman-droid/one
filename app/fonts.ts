/**
 * Font optimization using next/font
 * Replaces blocking Google Fonts import
 */
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});



