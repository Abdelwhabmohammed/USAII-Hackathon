import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "HomePath AI — From housing crisis to clear next steps",
  description:
    "An AI-powered Housing Stability Guide that helps families facing eviction understand their options, identify programs they may qualify for, and receive actionable next steps.",
  keywords: [
    "HomePath AI",
    "housing stability",
    "eviction support",
    "rental assistance",
    "AI navigator",
    "USAII Hackathon 2026",
  ],
  authors: [{ name: "HomePath AI Team" }],
  openGraph: {
    title: "HomePath AI",
    description:
      "From housing crisis to clear next steps. AI-powered guidance for families facing eviction.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
