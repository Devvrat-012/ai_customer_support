import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AlertProvider } from "@/components/common/AlertProvider";
import { Toaster } from "@/components/common/Toaster";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { DevNotice } from "@/components/common/DevNotice";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://makora.live'),
  title: "Makora - Intelligent Support Solutions",
  description: "Transform your customer support with AI-powered intelligent responses. Reduce response times by 90%, increase satisfaction, and scale your support team effortlessly. Start your free trial today.",
  keywords: [
    "AI customer support", 
    "intelligent support", 
    "customer service automation", 
    "AI chatbot", 
    "customer support software",
    "automated responses",
    "customer satisfaction",
    "support analytics"
  ],
  authors: [{ name: "Makora Team" }],
  creator: "Makora",
  publisher: "Makora",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://makora.live',
    title: 'Makora - Intelligent Support Solutions',
    description: 'Transform your customer support with AI-powered intelligent responses. Reduce response times by 90% and increase customer satisfaction.',
    siteName: 'Makora',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Makora Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Makora - Intelligent Support Solutions',
    description: 'Transform your customer support with AI-powered intelligent responses. Start your free trial today.',
    images: ['/og-image.jpg'],
    creator: '@makora',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <AlertProvider />
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
            <Toaster />
            <DevNotice />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
