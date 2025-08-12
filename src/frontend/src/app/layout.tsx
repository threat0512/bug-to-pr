import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  icons: {
    icon: "/assets/icon.svg",
    shortcut: "/assets/icon.svg",
    apple: "/assets/icon.svg",
  },
  title: "BugToPR",
  description: "AI-powered tool that converts GitHub issues into structured pull request plans with commit strategies, file modifications, and code snippets.",
  keywords: ["GitHub", "Pull Request", "AI", "Code Generation", "Development", "Issue Tracking"],
  authors: [{ name: "BugToPR Team" }],
  creator: "BugToPR",
  publisher: "BugToPR",
  robots: "index, follow",
  openGraph: {
    title: "BugToPR",
    description: "AI-powered tool that converts GitHub issues into structured pull request plans with commit strategies, file modifications, and code snippets.",
    url: "https://bugtopr.com",
    siteName: "BugToPR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BugToPR",
    description: "AI-powered tool that converts GitHub issues into structured pull request plans with commit strategies, file modifications, and code snippets.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
