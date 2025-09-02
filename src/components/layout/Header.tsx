"use client";

import Link from 'next/link';
import { Bot, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { clearUser, setLoading } from '@/lib/store/authSlice';
import { addAlert } from '@/lib/store/alertSlice';
import { persistor } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  showSignIn?: boolean;
  variant?: 'default' | 'auth' | 'dashboard';
  isHydrated?: boolean;
}

export function Header({ showSignIn = true, variant = 'default', isHydrated = true }: HeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // const isAuthPage = variant === 'auth';
  const isDashboardPage = variant === 'dashboard';
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    dispatch(setLoading(true));
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        dispatch(clearUser());
        await persistor.purge();
        
        dispatch(addAlert({
          type: 'success',
          title: 'Success',
          message: 'Logged out successfully'
        }));
        
        router.push('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch {
      dispatch(addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to logout. Please try again.'
      }));
    } finally {
      setIsLoggingOut(false);
      dispatch(setLoading(false));
    }
  };
  
  return (
    <nav className={`border-b sticky top-0 z-50 border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={isDashboardPage ? "/dashboard" : "/"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                AI Customer Support
              </span>
              {isDashboardPage && isHydrated && user && (
                <span className="text-xs text-muted-foreground">Welcome back, {user.firstName}!</span>
              )}
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {isDashboardPage && isHydrated && user && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/customers" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Customers
                </Link>
              </nav>
            )}
            <ThemeSelector />
            {showSignIn && (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
            {isDashboardPage && isHydrated && user && (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                disabled={isLoggingOut}
                className="border-2 hover:bg-muted/50 transition-all duration-300"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
