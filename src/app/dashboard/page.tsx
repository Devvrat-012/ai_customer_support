"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProfile, selectHasCompanyData, selectShouldFetchProfile, selectAiRepliesCount } from '@/lib/store/profileSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, User, Building2, BarChart3, Activity, TrendingUp, Calendar, Settings, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CompanyDataViewer } from '@/components/dashboard/CompanyDataViewer';
import { AIChatDialog } from '@/components/dashboard/AIChatDialog';
import { WebsiteExtractor } from '@/components/dashboard/WebsiteExtractor';
import { WidgetManager } from '@/components/dashboard/WidgetManager';

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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center relative">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
            <div className="absolute inset-0 bg-violet-50 dark:bg-violet-900/20 rounded-2xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here&apos;s what&apos;s happening with your AI customer support today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                onClick={() => window.open('/documentation', '_blank')}
              >
                <BarChart3 className="h-4 w-4" />
                Documentation
              </Button>
              <AIChatDialog 
                companyName={user.companyName || undefined}
                userName={user.firstName || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Replies Card */}
          <Card className="border relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Replies Generated</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{aiRepliesCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+12% from last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Company Status Card */}
          <Card className="border relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Data</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {hasCompanyData ? 'Active' : 'Setup Required'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${hasCompanyData ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasCompanyData ? 'Ready for AI training' : 'Upload company info'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="border relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Professional</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Card */}
          <Card className="border relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Actions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Get Started</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Setup & Configure</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Company */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Information */}
            <Card className="border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Profile Details</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Your account information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Name</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                  {user.companyName && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Company</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{user.companyName}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Company Data Section */}
            <Card className="border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Company Setup</CardTitle>
                    <CardDescription className="text-muted-foreground">Configure your AI knowledge base</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasCompanyData ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-green-700/30 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Data Configured</span>
                      </div>
                      <p className="text-sm text-green-600">Your AI assistant is ready to help customers</p>
                    </div>
                    <div className="space-y-2">
                      <CompanyDataViewer onDataUpdated={handleDataUpdated} />
                      <WebsiteExtractor hasExistingData={true} onDataUpdated={handleDataUpdated} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-amber-50/50 border-amber-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-amber-700">Setup Required</span>
                      </div>
                      <p className="text-sm text-amber-600">Upload company data to train your AI assistant</p>
                    </div>
                    <WebsiteExtractor hasExistingData={false} onDataUpdated={handleDataUpdated} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Widget Manager */}
          <div className="lg:col-span-2">
            <WidgetManager />
          </div>
        </div>
      </div>
    </div>
  );
}
