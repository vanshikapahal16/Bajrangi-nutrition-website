import type { Metadata } from "next";
import "./globals.css";
import ScrollProvider from "../components/ScrollProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import Analytics from "../components/Analytics";
import StructuredDataProvider from "../components/StructuredDataProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Bajrangi Nutrition Kurukshetra | Premium Proteins, Supplements & Vitamins",
  description: "Shop 100% authentic whey proteins, pre-workouts, creatine, vitamins, and fitness supplements at Bajrangi Nutrition Kurukshetra. Fast delivery and best prices.",
  keywords: ["Bajrangi Nutrition", "Kurukshetra", "protein shop", "whey isolate", "creatine", "pre-workout", "vitamins", "supplements Haryana"],
  openGraph: {
    title: "Bajrangi Nutrition Kurukshetra | Authentic Supplements",
    description: "Get 100% authentic proteins, pre-workouts, and vitamins direct from brands. Free delivery in Kurukshetra.",
    type: "website",
    images: [{ url: "/assets/logo.png" }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-text-main font-sans min-h-screen antialiased noise-bg">
        <Analytics />
        <StructuredDataProvider />
        <ErrorBoundary>
          <ScrollProvider>
            {children}
          </ScrollProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
