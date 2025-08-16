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
import { CompanyDataViewer } from '@/components/dashboard/CompanyDataViewer';
import { AIChatDialog } from '@/components/dashboard/AIChatDialog';
import { WebsiteExtractor } from '@/components/dashboard/WebsiteExtractor';
import { WidgetManager } from '@/components/dashboard/WidgetManager';
import { gradients, featureColors, animations, spacing, typography, shadows } from '@/lib/design-system';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [companyDataExists, setCompanyDataExists] = useState(false);
  const [totalReplies, setTotalReplies] = useState(0);

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

  const handleReplyCountChange = (count: number) => {
    setTotalReplies(count);
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
        router.replace('/');
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
        router.replace('/');
      }, 100);
    } finally {
      setIsLoggingOut(false);
      dispatch(setLoading(false));
    }
  };

  // Show loading during hydration or logout
  if (!mounted || isLoading || isLoggingOut) {
    return (
      <div className={`min-h-screen ${gradients.surface} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className={`absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob}`}></div>
        <div className={`absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob} ${animations.delayShort}`}></div>
        <div className="relative z-10 text-center">
          <div className={`p-4 ${gradients.primary} rounded-2xl ${shadows.card} mb-4 inline-block`}>
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className={`${typography.body} ${gradients.text}`}>
            {isLoggingOut ? 'Logging out...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${gradients.surface} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
      <div className={`absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob}`}></div>
      <div className={`absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob} ${animations.delayShort}`}></div>
      
      <nav className={`border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50 border-gray-200 dark:border-gray-700`}>
        <div className={spacing.container}>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${gradients.primary} rounded-xl ${shadows.card}`}>
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-bold ${gradients.text}`}>AI Customer Support</span>
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
                className="border-2 border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300"
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

      <main className={`${spacing.container} ${spacing.section} relative z-10`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-1 ${featureColors.ai.card} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`${spacing.iconContainer} ${featureColors.ai.icon} rounded-lg flex items-center justify-center ${shadows.card}`}>
                    <Bot className={`${spacing.iconSize} text-white`} />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Profile Information</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Your account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm"><strong className="text-blue-700 dark:text-blue-300">Name:</strong> {user.firstName} {user.lastName}</p>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm"><strong className="text-blue-700 dark:text-blue-300">Email:</strong> {user.email}</p>
                  </div>
                  {user.companyName && (
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm"><strong className="text-blue-700 dark:text-blue-300">Company:</strong> {user.companyName}</p>
                    </div>
                  )}
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm"><strong className="text-blue-700 dark:text-blue-300">Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-1 ${featureColors.secure.card} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`${spacing.iconContainer} ${featureColors.secure.icon} rounded-lg flex items-center justify-center ${shadows.card}`}>
                    <Bot className={`${spacing.iconSize} text-white`} />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Company Information</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Upload your company data for AI training</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {companyDataExists ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-300 font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Company information uploaded
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <CompanyDataViewer onDataUpdated={handleDataUpdated} />
                      <WebsiteExtractor hasExistingData={true} onDataUpdated={handleDataUpdated} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-amber-700 dark:text-amber-300 font-medium flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        No company information uploaded yet
                      </p>
                    </div>
                    <WebsiteExtractor hasExistingData={false} onDataUpdated={handleDataUpdated} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-1 ${featureColors.instant.card} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`${spacing.iconContainer} ${featureColors.instant.icon} rounded-lg flex items-center justify-center ${shadows.card}`}>
                    <Bot className={`${spacing.iconSize} text-white`} />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Quick Start</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Get started with AI Customer Support</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AIChatDialog 
                    companyName={user.companyName || undefined}
                    userName={user.firstName || undefined}
                    onReplyCountChange={handleReplyCountChange}
                  />
                  <Button variant="outline" className="w-full border-2 border-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-300" size="sm">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 ${shadows.card} transition-all duration-300 transform hover:-translate-y-1 ${featureColors.analytics.card} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`${spacing.iconContainer} ${featureColors.analytics.icon} rounded-lg flex items-center justify-center ${shadows.card}`}>
                    <Bot className={`${spacing.iconSize} text-white`} />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800 dark:text-gray-100">AI Usage</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Track your AI assistant usage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Replies Generated</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalReplies}</p>
                      </div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    This count helps track usage for billing purposes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Widget Manager Section */}
        <div className="mt-8">
          <WidgetManager />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
