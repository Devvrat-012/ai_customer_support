"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { clearUser, setLoading, setUser } from '@/lib/store/authSlice';
import { addAlert } from '@/lib/store/alertSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Loader2, LogOut, Bot } from 'lucide-react';
import { persistor } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { CompanyDataUpload } from '@/components/dashboard/CompanyDataUpload';
import { CompanyDataViewer } from '@/components/dashboard/CompanyDataViewer';
import { AIChatDialog } from '@/components/dashboard/AIChatDialog';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [companyDataExists, setCompanyDataExists] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has company data and update state
    if (user?.companyInfo) {
      setCompanyDataExists(true);
    } else {
      setCompanyDataExists(false);
    }
  }, [user]);

  const handleDataUpdated = async () => {
    // Refresh user data to update company info status
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        dispatch(setUser(result.data));
        // Update local state based on new user data
        setCompanyDataExists(!!result.data.companyInfo);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Fallback to page reload if API call fails
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    dispatch(setLoading(true));
    
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      });
      
      // Clear user state and purge persisted store
      dispatch(clearUser());
      await persistor.purge(); // Clear persisted state
      
      if (response.ok) {
        dispatch(addAlert({
          type: 'success',
          title: 'Logged out',
          message: 'You have been successfully logged out',
        }));
      }
      
      // Small delay to ensure state is cleared
      setTimeout(() => {
        router.replace('/auth/login');
      }, 100);
      
    } catch (error) {
      // Even if logout API fails, clear user state and redirect
      dispatch(clearUser());
      await persistor.purge();
      dispatch(addAlert({
        type: 'error',
        title: 'Logout failed',
        message: 'An error occurred while logging out, but you have been signed out locally',
      }));
      setTimeout(() => {
        router.replace('/auth/login');
      }, 100);
    } finally {
      setIsLoggingOut(false);
      dispatch(setLoading(false));
    }
  };

  // Show loading during hydration or logout
  if (!mounted || isLoading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-lg font-bold">AI Customer Support</span>
                <span className="text-xs text-muted-foreground">Welcome back, {user.firstName}!</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.companyName && (
                    <p><strong>Company:</strong> {user.companyName}</p>
                  )}
                  <p><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Upload your company data for AI training</CardDescription>
              </CardHeader>
              <CardContent>
                {companyDataExists ? (
                  <div className="space-y-2">
                    <p className="text-green-600 dark:text-green-400">✓ Company information uploaded</p>
                    <div className="flex gap-2">
                      <CompanyDataViewer onDataUpdated={handleDataUpdated} />
                      <CompanyDataUpload hasExistingData={true} onDataUpdated={handleDataUpdated} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-amber-600 dark:text-amber-400 mb-2">No company information uploaded yet</p>
                    <CompanyDataUpload hasExistingData={false} onDataUpdated={handleDataUpdated} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get started with AI Customer Support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AIChatDialog 
                    companyName={user.companyName || undefined}
                    userName={user.firstName || undefined}
                  />
                  <Button variant="outline" className="w-full" size="sm">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
      </main>
    </div>
  );
}
