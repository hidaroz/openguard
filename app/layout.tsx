import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "OpenGuard - AI-Powered Cybersecurity for Non-Profits",
  description:
    "Your fractional CISO. OpenGuard interviews your organization and generates custom, plain-English security policies you can actually use.",
  keywords: [
    "cybersecurity",
    "non-profit security",
    "privacy policy",
    "CISO",
    "security assessment",
    "AI security advisor",
  ],
  authors: [{ name: "OpenGuard" }],
  openGraph: {
    title: "OpenGuard - AI-Powered Cybersecurity for Non-Profits",
    description:
      "Your fractional CISO. Get custom security policies through a simple conversation.",
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
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
