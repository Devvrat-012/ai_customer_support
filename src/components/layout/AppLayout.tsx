"use client";

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'auth' | 'dashboard';
  showHeader?: boolean;
  showFooter?: boolean;
  showSignIn?: boolean;
}

export function AppLayout({ 
  children, 
  variant = 'default', 
  showHeader = true, 
  showFooter = true,
  showSignIn = true 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header showSignIn={showSignIn} variant={variant} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
