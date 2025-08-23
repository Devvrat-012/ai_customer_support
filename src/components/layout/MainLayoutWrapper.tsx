"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutWrapperProps {
  children: ReactNode;
}

export function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  
  // Define routes that should not have Header/Footer
  const noLayoutRoutes: string[] = [
    // Add any routes that should not have global Header/Footer
    // Currently all routes should have the layout, but this allows for future flexibility
  ];
  
  // Define auth routes that should have a different header variant
  const authRoutes = ['/auth/login', '/auth/signup'];
  
  // Define dashboard routes
  const dashboardRoutes = ['/dashboard', '/inbox', '/knowledge-base', '/settings', '/teams'];
  
  // Check if current route should skip the global layout
  const shouldSkipLayout = noLayoutRoutes.some(route => pathname.startsWith(route));
  
  // Check if current route is an auth route
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Check if current route is a dashboard route
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));
  
  if (shouldSkipLayout) {
    return <>{children}</>;
  }
  
  // Determine header variant
  let headerVariant: 'default' | 'auth' | 'dashboard' = 'default';
  if (isAuthRoute) {
    headerVariant = 'auth';
  } else if (isDashboardRoute || user) {
    headerVariant = 'dashboard';
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSignIn={!isAuthRoute && !user} variant={headerVariant} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
