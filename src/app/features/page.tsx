import React from 'react';
import Link from 'next/link';
import { spacing, typography, gradients, featureColors, shadows } from '@/lib/design-system';
import { Zap, Bot, Users, BarChart3 } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    { title: 'Instant Responses', desc: 'Generate contextual replies in seconds.', icon: Zap, color: featureColors.instant },
    { title: 'AI Intelligence', desc: 'Context-aware replies using advanced models.', icon: Bot, color: featureColors.ai },
    { title: 'Team Collaboration', desc: 'Assign and track conversations across your team.', icon: Users, color: featureColors.collaboration },
    { title: 'Analytics & Insights', desc: 'Actionable metrics to improve performance.', icon: BarChart3, color: featureColors.analytics },
  ];

  return (
    <main className={`py-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen`}>
      <div className={`${spacing.container}`}>
        <header className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.heading1} ${gradients.hero}`}>Features</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Everything you need for exceptional customer support.</p>
        </header>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f) => (
            <article key={f.title} className={`p-6 rounded-lg bg-white dark:bg-gray-800 ${shadows.card}`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-md mb-4 ${f.color.icon}`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{f.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/auth/login" className="inline-block px-6 py-3 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors">Get Started</Link>
        </div>
      </div>
    </main>
  );
}
