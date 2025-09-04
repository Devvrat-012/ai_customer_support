import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const generatePageMetadata = (
  title: string,
  description: string,
  path: string = '',
  additionalMetadata: Partial<Metadata> = {}
): Metadata => {
  const fullUrl = `${baseUrl}${path}`;
  
  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      type: 'website',
      locale: 'en_US',
      siteName: 'AI Customer Support',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
      creator: '@aicustomersupport',
    },
    ...additionalMetadata,
  };
};

export const structuredData = {
  homepage: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Customer Support',
    description: 'Transform your customer support with AI-powered intelligent responses. Reduce response times by 90%, increase satisfaction, and scale your support team effortlessly.',
    url: baseUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free trial available',
    },
    creator: {
      '@type': 'Organization',
      name: 'AI Customer Support',
      url: baseUrl,
    },
    featureList: [
      'AI-powered instant responses',
      '24/7 availability',
      'Analytics and insights',
      'Team collaboration',
      'Secure and reliable',
      'Easy integration',
    ],
    screenshot: 'https://ai-customer-support.com/screenshot.jpg',
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Customer Support',
    url: 'https://ai-customer-support.com',
    logo: 'https://ai-customer-support.com/logo.png',
    description: 'Leading provider of AI-powered customer support solutions',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@ai-customer-support.com',
    },
  },
};
