import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Portal AI untuk artikel, bansos AI, dan marketplace token.";

const adsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "WangLinS — Portal AI",
    template: "%s · WangLinS",
  },
  description: siteDescription,
  applicationName: "WangLinS",
  keywords: ["WangLinS", "Portal AI", "artikel", "bansos AI", "marketplace", "token"],
  manifest: "/site.webmanifest",
  // favicon.ico comes from src/app/favicon.ico (file convention) — do not redeclare
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "WangLinS",
    title: "WangLinS — Portal AI",
    description: siteDescription,
    images: [{ url: "/wanglins.webp", width: 1254, height: 1254, alt: "WangLinS" }],
  },
  twitter: {
    card: "summary",
    title: "WangLinS — Portal AI",
    description: siteDescription,
    images: ["/wanglins.webp"],
  },
  other: {
    "google-adsense-account": adsensePubId,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
