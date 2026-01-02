import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutWrapper } from "@/components/layout";
import SmoothScroll from "@/components/SmoothScroll";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Bella Bathwares | Luxury Bathroom Solutions",
    template: "%s | Bella Bathwares",
  },
  description:
    "Premium Italian-designed sanitaryware. Jacuzzis, faucets, basins & more. Discover luxury bathroom solutions at Bella Bathwares.",
  keywords: [
    "bathroom fixtures",
    "luxury bathroom",
    "sanitaryware",
    "jacuzzi",
    "faucets",
    "basins",
    "Oman",
    "GCC",
  ],
  authors: [{ name: "Bella Bathwares" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bellabathwares.com",
    siteName: "Bella Bathwares",
    title: "Bella Bathwares | Luxury Bathroom Solutions",
    description:
      "Premium Italian-designed sanitaryware. Jacuzzis, faucets, basins & more.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bella Bathwares",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bella Bathwares | Luxury Bathroom Solutions",
    description:
      "Premium Italian-designed sanitaryware. Jacuzzis, faucets, basins & more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <link id="favicon" rel="icon" href="/favicon-light.ico" />
      </head>
      <body className="font-body antialiased overflow-x-hidden">
        <Providers>
          <SmoothScroll />
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html >
  );
}
