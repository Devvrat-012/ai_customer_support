"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // const isAuthPage = variant === 'auth';
  const isDashboardPage = variant === 'dashboard';

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);
    setShowLogoutDialog(false); // Close the dialog
    dispatch(setLoading(true));

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear Redux state
        dispatch(clearUser());

        // Clear persist storage
        await persistor.purge();

        // Also manually clear localStorage to be sure
        localStorage.removeItem('persist:root');
        localStorage.clear();

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

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  return (
    <nav className={`border-b sticky top-0 z-50 border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-900/70`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={isDashboardPage ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/Makora.png"
              alt="Makora Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Makora
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {isDashboardPage && isHydrated && user && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  href="/documentation"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Documentation
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/customers"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Customers
                </Link>
                <Link
                  href="/knowledge-base"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Knowledge Base
                </Link>
              </nav>
            )}
            {!user && showSignIn && (
              <nav className="hidden sm:flex items-center space-x-4">
                <Link
                  href="/documentation"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Documentation
                </Link>
              </nav>
            )}
            <ThemeSelector />
            {showSignIn && (
              <Button asChild className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
            {isDashboardPage && isHydrated && user && (
              <Button
                onClick={handleLogoutClick}
                variant="outline"
                size="sm"
                disabled={isLoggingOut}
                className="border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors"
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

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className=' hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors'>
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
