import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Customer Support - Transform Your Customer Service with AI',
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
    canonical: 'https://ai-customer-support.com',
  },
  openGraph: {
    title: 'AI Customer Support - Transform Your Customer Service with AI',
    description: 'Reduce response times by 90% with AI-powered customer support. Deliver instant, intelligent responses that increase customer satisfaction.',
    url: 'https://ai-customer-support.com',
    siteName: 'AI Customer Support',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://ai-customer-support.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Customer Support Platform - Transform Your Customer Service',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Customer Support - Transform Your Customer Service with AI',
    description: 'Reduce response times by 90% with AI-powered customer support. Start your free trial today.',
    images: ['https://ai-customer-support.com/og-image.jpg'],
    creator: '@aicustomersupport',
    site: '@aicustomersupport',
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
