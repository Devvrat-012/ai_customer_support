import React from 'react';
import Link from 'next/link';
import { spacing, typography, gradients, shadows } from '@/lib/design-system';
import { Bot } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className={`py-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen`}>
      <div className={`${spacing.container}`}>
        <header className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.heading1} ${gradients.hero}`}>About Us</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Building delightful support experiences with AI.</p>
        </header>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg ${shadows.card}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Our Mission</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-200">We help teams deliver fast, accurate, and empathetic customer support using AI. Our focus is on practical tools that save time and improve customer satisfaction.</p>

            <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-gray-100">Our Values</h3>
            <ul className="mt-3 space-y-2 text-gray-700 dark:text-gray-200">
              <li>Customer-first: We design features that benefit end-users and support teams.</li>
              <li>Privacy by design: We minimize data collection and protect user information.</li>
              <li>Continuous improvement: We iterate quickly based on feedback and metrics.</li>
            </ul>
          </div>

          <aside className={`bg-white dark:bg-gray-800 p-6 rounded-lg ${shadows.card}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Founded</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">2025</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Team</h4>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">A small team of engineers, designers, and customer advocates building AI tools for support.</p>
            </div>

            <div className="mt-6">
              <Link href="/contact" className="inline-block px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors">Contact Us</Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
