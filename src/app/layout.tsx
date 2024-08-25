import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "JsonShift",
    template: "%s | JsonShift",
  },
  description:
    "Transform document into structured JSON data with JsonShift. Our AI-powered web service extracts and organizes information from a document.",
  keywords: [
    "JSON",
    "jsonshift",
    "data extraction",
    "web content to JSON",
    "LLM data processing",
    "website data extraction",
    "JSON generation",
    "web data to JSON",
  ],
  authors: [{ name: "Imam Septian" }],
  creator: "Imam Septian",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "black" },
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.BASE_URL,
    siteName: "JsonShift",
    title: "JsonShift",
    description:
      "Transform document into structured JSON data with JsonShift. Our AI-powered web service extracts and organizes information from a document.",
    images: [
      {
        url: `${env.BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JsonShift - Document to JSON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourTwitterHandle",
    title: "JsonShift",
    description:
      "Transform document into structured JSON data with JsonShift. Our AI-powered web service extracts and organizes information from a document.",
    images: [
      {
        url: `${env.BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JsonShift - Document to JSON",
      },
    ],
  },
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    languages: {
      "en-US": "/en-US",
      "es-ES": "/es-ES",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", inter.className)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto py-4">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
