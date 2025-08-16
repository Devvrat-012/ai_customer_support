"use client";

import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                AI Customer Support
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              Empower your customer support team with intelligent AI assistance that delivers 
              exceptional customer experiences around the clock.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Product</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <Link href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Company</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <Link href="/auth/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            &copy; 2025 AI Customer Support. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
