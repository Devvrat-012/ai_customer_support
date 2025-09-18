import React from 'react';
import Link from 'next/link';
import { spacing, typography, gradients, shadows } from '@/lib/design-system';

export default function PrivacyPage() {
  return (
    <main className={`py-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen`}> 
      <div className={`${spacing.container}`}> 
        <header className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.heading1} ${gradients.hero}`}>Privacy Policy</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            We value your privacy. This page explains what data we collect, how we use it, and how you can manage it.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className={`col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg ${shadows.card}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Key Privacy Points</h2>
            <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-200">
              <li>
                <strong>Data We Collect:</strong> We collect only what is necessary to provide the service: account information (email, name), usage analytics, and knowledge-base content you upload.
              </li>
              <li>
                <strong>Why We Collect Data:</strong> To operate and improve the product, personalize your experience, and provide customer support.
              </li>
              <li>
                <strong>How We Use Data:</strong> Data is used for authentication, storing your settings and content, generating AI responses, and improving models. We never sell your personal data.
              </li>
              <li>
                <strong>Data Security:</strong> We protect data using industry-standard encryption in transit and at rest. Access is restricted to authorized personnel.
              </li>
              <li>
                <strong>Third Parties:</strong> We may use third-party services (e.g., analytics, hosting). We review vendors for security and privacy compliance.
              </li>
              <li>
                <strong>Your Choices:</strong> You can export or delete your company data from the dashboard. For account deletion, contact support.
              </li>
            </ul>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Data Retention</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-200">We retain data as long as needed to provide the service or as required by law. You may request deletion at any time.</p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contact</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-200">Questions or requests about privacy can be sent to <a href="mailto:privacy@makora.example" className="text-primary underline">privacy@makora.example</a>.</p>
            </div>
          </section>

          <aside className={`bg-white dark:bg-gray-800 p-6 rounded-lg ${shadows.card}`}>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Privacy Controls</h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Manage your company data and export or delete content from the dashboard.</p>
              <div className="mt-4">
                <Link href="/auth/login" className="inline-block px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors">
                  Manage Data
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-4 text-sm text-gray-600 dark:text-gray-300">
              <strong>Quick Links</strong>
              <ul className="mt-2 space-y-2">
                <li><Link href="/about" className="text-primary underline">About</Link></li>
                <li><Link href="/contact" className="text-primary underline">Contact</Link></li>
                <li><Link href="/privacy" className="text-primary underline">Privacy</Link></li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Last updated: September 16, 2025</p>
        </div>
      </div>
    </main>
  );
}
