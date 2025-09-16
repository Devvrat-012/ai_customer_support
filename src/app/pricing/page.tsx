import React from 'react';
import Link from 'next/link';
import { spacing, typography, gradients, shadows } from '@/lib/design-system';

export default function PricingPage() {
  const plans = [
    { name: 'Free', price: '$0', perks: ['Up to 3 agents', 'Basic analytics'], featured: false },
    { name: 'Pro', price: '$10', perks: ['Unlimited agents', 'Advanced analytics', 'Priority support'], featured: true },
    { name: 'Enterprise', price: 'Contact', perks: ['SLA', 'Custom integrations', 'Dedicated support'], featured: false },
  ];

  return (
    <main className={`py-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen`}>
      <div className={`${spacing.container}`}>
        <header className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.heading1} ${gradients.hero}`}>Pricing</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Simple, transparent pricing for teams of all sizes.</p>
        </header>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`p-6 rounded-lg bg-white dark:bg-gray-800 ${shadows.card} ${p.featured ? 'border-2 border-blue-500' : ''}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{p.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-200">
                {p.perks.map((perk) => <li key={perk}>• {perk}</li>)}
              </ul>
              <div className="mt-6">
                <Link href="/auth/login" className={`inline-block px-4 py-2 rounded-md ${p.featured ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                  {p.featured ? 'Get Started' : 'Choose'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
