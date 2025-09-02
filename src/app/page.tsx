"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { structuredData } from '@/lib/seo';
import { gradients, featureColors, animations, spacing, typography, shadows } from '@/lib/design-system';

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return; // wait for persist rehydration
    
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router, mounted]);

  // Show loading state while checking auth
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Loading state while redirecting authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function LandingPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([structuredData.homepage, structuredData.organization])
        }}
      />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${spacing.section} sm:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950`}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className={`absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 ${animations.blob}`}></div>
        <div className={`absolute top-0 right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 ${animations.blob} ${animations.delayShort}`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 ${animations.blob} ${animations.delayLong}`}></div>
        
        <div className={`${spacing.container} relative`}>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className={`${typography.heading1} ${gradients.hero}`}>
              Transform Your Customer Support with AI
            </h1>
            <p className={`mt-6 ${typography.body} text-gray-600 dark:text-gray-300 max-w-2xl mx-auto`}>
              Deliver instant, intelligent, and personalized customer support responses with our advanced AI assistant. 
              Reduce response times and increase customer satisfaction effortlessly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className={`h-12 px-8 ${gradients.primary} ${gradients.primaryHover} text-white ${shadows.button} transition-all duration-300 transform hover:scale-105`}>
                <Link href="/auth/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 border-2 border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${spacing.section} ${gradients.features}`}>
        <div className={spacing.container}>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className={`${typography.heading2} ${gradients.text}`}>
              Everything you need for exceptional customer support
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our AI-powered platform provides all the tools you need to deliver outstanding customer experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.instant.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.instant.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Zap className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">Instant Responses</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Generate intelligent replies in seconds, ensuring your customers never wait for answers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.ai.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.ai.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Bot className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">AI-Powered Intelligence</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Advanced AI understands context and provides personalized, accurate responses every time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.secure.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.secure.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Shield className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">Secure & Reliable</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Enterprise-grade security ensures your customer data is always protected and compliant.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.available.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.available.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Clock className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">24/7 Availability</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Never miss a customer inquiry with round-the-clock AI assistance that works when you sleep.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.analytics.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.analytics.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <BarChart3 className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">Analytics & Insights</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Track performance metrics and gain valuable insights to continuously improve your support quality.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-2 ${featureColors.collaboration.card}`}>
              <CardHeader>
                <div className={`${spacing.iconContainer} ${featureColors.collaboration.icon} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Users className={`${spacing.iconSize} text-white`} />
                </div>
                <CardTitle className="text-gray-800 dark:text-gray-100">Team Collaboration</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Seamlessly collaborate with your team and manage customer interactions across all channels.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`${spacing.section} ${gradients.benefits}`}>
        <div className={spacing.container}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`${typography.heading2} mb-6 bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-300 bg-clip-text text-transparent`}>
                Why choose our AI Customer Support?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reduce Response Time by 90%</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Instantly generate contextual replies that address customer concerns effectively.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Increase Customer Satisfaction</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Consistent, helpful responses that keep your customers happy and engaged.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Scale Your Support Team</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Handle more inquiries without hiring additional staff or compromising quality.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Easy Integration</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get started in minutes with our simple setup and intuitive interface.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:pl-8">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">What our customers say</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <blockquote className="text-lg italic text-gray-600 dark:text-gray-300 mb-4">
                    &ldquo;This AI customer support tool has transformed our business. We&rsquo;ve seen a 95% reduction in response times 
                    and our customer satisfaction scores have never been higher.&rdquo;
                  </blockquote>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Sarah Johnson</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Customer Success Manager</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="w-full h-full bg-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to revolutionize your customer support?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our AI-powered customer support assistant.
          </p>
          <Button size="lg" variant="secondary" asChild className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Link href="/auth/login">
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
