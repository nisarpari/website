import { Cormorant_Garamond, Montserrat, Plus_Jakarta_Sans } from 'next/font/google';

// Display font for headings - elegant serif
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
  fallback: ['Georgia', 'serif'],
});

// Body font - clean sans-serif
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', 'sans-serif'],
});

// Product names - modern sans
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-product',
  fallback: ['system-ui', 'sans-serif'],
});

// Combined font class names for the html element
export const fontVariables = `${cormorantGaramond.variable} ${montserrat.variable} ${plusJakartaSans.variable}`;
