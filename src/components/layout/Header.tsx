"use client";

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/ui/theme-selector';

interface HeaderProps {
  showSignIn?: boolean;
  variant?: 'default' | 'auth';
}

export function Header({ showSignIn = true, variant = 'default' }: HeaderProps) {
  const isAuthPage = variant === 'auth';
  
  return (
    <nav className={`border-b sticky top-0 z-50 border-gray-200 dark:border-gray-700 ${
      isAuthPage 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60'
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              AI Customer Support
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeSelector />
            {showSignIn && (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
