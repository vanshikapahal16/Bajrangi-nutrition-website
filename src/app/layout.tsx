import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bajrangi Nutrition Kurukshetra | Premium Proteins, Supplements & Vitamins",
  description: "Shop 100% authentic whey proteins, pre-workouts, creatine, vitamins, and fitness supplements at Bajrangi Nutrition Kurukshetra. Fast delivery and best prices.",
  keywords: ["Bajrangi Nutrition", "Kurukshetra", "protein shop", "whey isolate", "creatine", "pre-workout", "vitamins", "supplements Haryana"],
  openGraph: {
    title: "Bajrangi Nutrition Kurukshetra | Authentic Supplements",
    description: "Get 100% authentic proteins, pre-workouts, and vitamins direct from brands. Free delivery in Kurukshetra.",
    type: "website",
    images: [{ url: "/assets/logo.png" }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-bg-light text-text-main font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
