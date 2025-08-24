"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProfile, selectHasCompanyData, selectShouldFetchProfile, selectAiRepliesCount } from '@/lib/store/profileSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CompanyDataViewer } from '@/components/dashboard/CompanyDataViewer';
import { AIChatDialog } from '@/components/dashboard/AIChatDialog';
import { WebsiteExtractor } from '@/components/dashboard/WebsiteExtractor';
import { WidgetManager } from '@/components/dashboard/WidgetManager';
import { gradients, featureColors, animations, spacing, typography, shadows } from '@/lib/design-system';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  
  // Use Redux for all state management
  const hasCompanyData = useAppSelector(selectHasCompanyData);
  const shouldFetchProfile = useAppSelector(selectShouldFetchProfile);
  const aiRepliesCount = useAppSelector(selectAiRepliesCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch profile data when user is available and should fetch
  useEffect(() => {
    if (user && shouldFetchProfile) {
      dispatch(fetchProfile());
    }
  }, [user, shouldFetchProfile, dispatch]);

  const handleDataUpdated = async () => {
    // Instead of making a new API call, refresh the profile data via Redux
    if (user) {
      dispatch(fetchProfile());
    }
  };

  // Show loading during hydration
  if (!mounted || isLoading) {
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
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`${gradients.surface} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
      <div className={`absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob}`}></div>
      <div className={`absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob} ${animations.delayShort}`}></div>
      
      <div className={`${spacing.container} ${spacing.section} relative z-10`}>
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
                {hasCompanyData ? (
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
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{aiRepliesCount}</p>
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
      </div>
    </div>
  );
}
