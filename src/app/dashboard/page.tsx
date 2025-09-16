"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProfile, selectHasCompanyData, selectAiRepliesCount } from '@/lib/store/profileSlice';
import { 
  fetchKnowledgeBases, 
  selectKnowledgeBaseStats, 
  selectKnowledgeBaseStatus,
} from '@/lib/store/knowledgeBaseSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, User, BarChart3, Activity, TrendingUp, Calendar, Settings, Zap, Sparkles, Database, ExternalLink, Play, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AIChatDialog } from '@/components/dashboard/AIChatDialog';
import KnowledgeBaseManager from '@/components/dashboard/KnowledgeBaseManager';
import { AutoMigrate } from '@/components/dashboard/AutoMigrate';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  
  // Use Redux for all state management
  const hasCompanyData = useAppSelector(selectHasCompanyData);
  const aiRepliesCount = useAppSelector(selectAiRepliesCount);
  const knowledgeBaseStats = useAppSelector(selectKnowledgeBaseStats);
  const knowledgeBaseStatus = useAppSelector(selectKnowledgeBaseStatus);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch profile data and knowledge base data when user is available
  useEffect(() => {
    if (user) {
      // Always fetch profile
      dispatch(fetchProfile());
      
      // Only fetch knowledge base data if we don't already have it
      if (knowledgeBaseStatus === 'idle' || 
          (knowledgeBaseStatus === 'failed' && knowledgeBaseStats.totalKnowledgeBases === 0)) {
        dispatch(fetchKnowledgeBases());
      }
    }
  }, [user, dispatch, knowledgeBaseStatus, knowledgeBaseStats.totalKnowledgeBases]);

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
      {/* Auto-migrate component - runs silently in background */}
      <AutoMigrate user={user} hasCompanyData={hasCompanyData} />
      
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

          {/* Knowledge Base Stats Card */}
          <Card className="border relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Knowledge Base</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{knowledgeBaseStats.totalKnowledgeBases}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${knowledgeBaseStats.readyKnowledgeBases > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {knowledgeBaseStats.readyKnowledgeBases} ready, {knowledgeBaseStats.totalChunks} chunks
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile & Knowledge Base */}
          <div className="space-y-6">
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

            {/* Widget Integration Quick Actions */}
            <Card className="border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Widget Integration</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Get started with your AI chatbot</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    disabled={isLoading}
                    onClick={() => {
                      if (knowledgeBaseStats.totalKnowledgeBases === 0) {
                        // Show inline error message instead of alert
                        const errorDiv = document.getElementById('demo-error');
                        if (errorDiv) {
                          errorDiv.style.display = 'block';
                          setTimeout(() => {
                            errorDiv.style.display = 'none';
                          }, 5000);
                        }
                        return;
                      }
                      router.push('/widget-demo');
                    }}
                    className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Play className="h-4 w-4" />
                    Try Widget Demo
                  </Button>
                  
                  {/* Error message for no knowledge base */}
                  <div id="demo-error" style={{ display: 'none' }} className="text-xs text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    ⚠️ Please upload at least one knowledge base before trying the widget demo.
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/documentation', '_blank')}
                    className="w-full gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Start Integration
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-600">
                  Set up your knowledge base first, then integrate the widget
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Knowledge Base (Expanded) */}
          <div className="space-y-6">
            <Card className="border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Knowledge Base Management</CardTitle>
                    <CardDescription className="text-muted-foreground">Upload and manage your AI training data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <KnowledgeBaseManager />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
