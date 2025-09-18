import React from 'react';
import { spacing, typography, gradients, shadows } from '@/lib/design-system';

export default function ContactPage() {
  return (
  <main className={`${spacing.section} bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen`}>
      <div className={`${spacing.container}`}>
        <header className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.heading1} ${gradients.hero}`}>Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">We&apos;re here to help — reach out for support, sales, or press inquiries.</p>
        </header>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`bg-white dark:bg-gray-800 p-8 rounded-lg ${shadows.card}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Get in touch</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-200">Email: <a href="mailto:help@makora.example" className="text-primary underline">help@makora.example</a></p>
            <p className="mt-2 text-gray-700 dark:text-gray-200">Phone: +1 (555) 123-4567</p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">For enterprise or press inquiries, please include your company name and a brief description.</p>
          </div>

          <form className={`bg-white dark:bg-gray-800 p-8 rounded-lg ${shadows.card}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Your email</label>
              <input type="email" required className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Message</label>
              <textarea required rows={6} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"></textarea>
            </div>
            <div className="mt-4 text-right">
              <button className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
