import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AnalyticsTracker from "./components/AnalyticsTracker";
import SiteHeader from "./components/SiteHeader";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
} from "./lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: "da_DK",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_ORIGIN,
      inLanguage: "da-DK",
      description: SITE_DESCRIPTION,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SiteHeader />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
