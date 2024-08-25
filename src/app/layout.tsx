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
    default  : "JsonShift | AI-Powered Web Data Extraction to JSON",
    template : "%s | JsonShift",
  },
  description:
    "JsonShift utilizes scraping, embedding , and LLM technologies to extract and convert web content into structured JSON format based on user inputs. Simplify data extraction with our powerful tools.",
  keywords: [
    "JSON",
    "data extraction",
    "AI-powered data extraction",
    "web scraping",
    "groq",
    "gemini",
    "cohere",
    "embedding",
    "scraper",
    'langchain',
    "jsonshift",
    "data extraction",
    "web content to JSON",
    "LLM data processing",
    "website data extraction",
    "JSON generation",
    "web data to JSON",
    "structured data",
    "data transformation",
  ],
  authors    : [{ name: "Imam Septian Adi Wijaya" }],
  creator    : "Imam Septian Adi Wijaya",
  themeColor : [
    { media: "(prefers-color-scheme: dark)", color: "black" },
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
  openGraph: {
    type     : "website",
    locale   : "en_US",
    url      : env.BASE_URL,
    siteName : "JsonShift",
    title    : "JsonShift | AI-Powered Web Data Extraction to JSON",
    description:
      "Experience the power of AI and advanced scraping with JsonShift to transform web content into customizable JSON outputs. Efficiently extract data tailored to your needs.",
    images: [
      {
        url    : `${env.BASE_URL}/og-image.png`,
        width  : 1200,
        height : 630,
        alt    : "JsonShift - AI-Powered Data Extraction",
      },
    ],
  },
  twitter: {
    card  : "summary_large_image",
    site  : "@yourTwitterHandle",
    title : "JsonShift | AI-Powered Web Data Extraction to JSON",
    description:
      "Transform web content into structured JSON outputs with JsonShift's AI-powered tools. Extract data quickly and accurately based on user-defined inputs.",
    images: [
      {
        url    : `${env.BASE_URL}/og-image.png`,
        width  : 1200,
        height : 630,
        alt    : "JsonShift - AI-Powered Data Extraction",
      },
    ],
  },
  robots: {
    index     : true,
    follow    : true,
    googleBot : {
      index               : true,
      follow              : true,
      "max-video-preview" : -1,
      "max-image-preview" : "large",
      "max-snippet"       : -1,
    },
  },
  icons: {
    icon     : "/favicon.ico",
    shortcut : "/favicon-16x16.png",
    apple    : "/apple-touch-icon.png",
  },
  alternates: {
    languages: {
      "en-US" : "/en-US",
      "es-ES" : "/es-ES",
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
        className={ cn("bg-background font-sans antialiased", inter.className) }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-2 py-4">{ children }</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
