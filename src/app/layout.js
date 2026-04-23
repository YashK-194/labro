import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/layout/ClientLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Labro - Find Local Services & Workers in Your Area",
    template: "%s | Labro",
  },
  description:
    "Connect with skilled local workers and service providers near you. Find trusted plumbers, electricians, carpenters, maids, painters, and more professional services in your area. Our platform makes it easy to discover, connect, and hire qualified professionals for all your home improvement, repair, and maintenance needs. Whether you need emergency repairs, regular maintenance, or specialized services, Labro helps you find the right person for the job quickly and efficiently.",
  keywords: [
    "local services",
    "home services",
    "plumber",
    "electrician",
    "carpenter",
    "painter",
    "maid",
    "labor",
    "worker",
    "handyman",
    "repair services",
    "home improvement",
    "skilled workers",
    "service providers",
    "India",
    "local workers",
  ],
  authors: [{ name: "Labro Team" }],
  creator: "Labro",
  publisher: "Labro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://labro.app",
    title: "Labro - Find Local Services & Workers in Your Area",
    description:
      "Connect with skilled local workers and service providers near you. Find trusted plumbers, electricians, carpenters, maids, painters, and more professional services in your area. Our platform makes it easy to discover, connect, and hire qualified professionals for all your home improvement, repair, and maintenance needs.",
    siteName: "Labro",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Labro - Local Services Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Labro - Find Local Services & Workers in Your Area",
    description:
      "Connect with skilled local workers and service providers near you. Find trusted professionals for all your home service needs.",
    creator: "@labroapp",
    images: ["/api/og"],
  },
  verification: {
    google: "google-site-verification-token",
    yandex: "yandex-verification-token",
    yahoo: "yahoo-site-verification-token",
  },
  alternates: {
    canonical: "https://labro.app",
  },
  category: "business",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0d9488" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Labro",
              description:
                "Connect with skilled local workers and service providers near you",
              url: "https://labro.app",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              author: {
                "@type": "Organization",
                name: "Labro",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Pass control to the client-side layout */}
        <ClientLayout>{children}</ClientLayout>

        {/* Vercel Analytics & Speed Insights */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
