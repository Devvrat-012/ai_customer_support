import { ReactNode } from 'react';
import { ThemeSelector } from '@/components/ui/theme-selector';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      {/* Theme Selector */}
      <div className="absolute top-4 right-4">
        <ThemeSelector />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Customer Support
          </h1>
          <p className="text-muted-foreground">
            Intelligent customer support solutions for your business
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
