import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Makora - Transform Your Customer Service with AI',
  description: 'Reduce response times by 90% with our AI-powered customer support assistant. Deliver instant, intelligent responses that increase customer satisfaction. Start your free trial today.',
  keywords: [
    'AI customer support',
    'customer service automation', 
    'AI chatbot',
    'customer support software',
    'automated responses',
    'instant customer replies',
    'customer satisfaction',
    'support analytics',
    'team collaboration',
    '24/7 customer support'
  ],
  alternates: {
    canonical: 'https://makora.live',
  },
  openGraph: {
    title: 'Makora - Transform Your Customer Service with AI',
    description: 'Reduce response times by 90% with AI-powered customer support. Deliver instant, intelligent responses that increase customer satisfaction.',
    url: 'https://makora.live',
    siteName: 'Makora',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://makora.live/Makora.png',
        width: 1200,
        height: 630,
        alt: 'Makora Platform - Transform Your Customer Service',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Makora - Transform Your Customer Service with AI',
    description: 'Reduce response times by 90% with AI-powered customer support. Start your free trial today.',
    images: ['https://makora.live/Makora.png'],
    creator: '@makora',
    site: '@makora',
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
  category: 'technology',
};
