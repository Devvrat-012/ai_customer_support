import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AlertProvider } from "@/components/common/AlertProvider";
import { Toaster } from "@/components/common/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-customer-support.com'),
  title: "AI Customer Support - Intelligent Support Solutions",
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
  authors: [{ name: "AI Customer Support Team" }],
  creator: "AI Customer Support",
  publisher: "AI Customer Support",
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
    url: 'https://ai-customer-support.com',
    title: 'AI Customer Support - Intelligent Support Solutions',
    description: 'Transform your customer support with AI-powered intelligent responses. Reduce response times by 90% and increase customer satisfaction.',
    siteName: 'AI Customer Support',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Customer Support Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Customer Support - Intelligent Support Solutions',
    description: 'Transform your customer support with AI-powered intelligent responses. Start your free trial today.',
    images: ['/og-image.jpg'],
    creator: '@aicustomersupport',
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <AlertProvider />
            {children}
            <Toaster />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
