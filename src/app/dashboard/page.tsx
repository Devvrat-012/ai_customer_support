"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/authSlice';
import { addAlert } from '@/lib/store/alertSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Loader2, LogOut, Bot } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
          dispatch(setUser(result.data));
        } else {
          dispatch(clearUser());
          router.push('/auth/login');
        }
      } catch (error) {
        dispatch(clearUser());
        router.push('/auth/login');
      } finally {
        dispatch(setLoading(false));
      }
    };

    // Only check auth if mounted and we don't have a user
    if (mounted && !user && !isLoading) {
      checkAuth();
    }
  }, [dispatch, user, isLoading, router, mounted]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      dispatch(addAlert({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out',
      }));
      router.push('/auth/login');
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Logout failed',
        message: 'An error occurred while logging out',
      }));
    }
  };

  // Show loading during hydration
  if (!mounted || isLoading) {
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
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
                {user.companyInfo ? (
                  <p className="text-green-600 dark:text-green-400">✓ Company information uploaded</p>
                ) : (
                  <div>
                    <p className="text-amber-600 dark:text-amber-400 mb-2">No company information uploaded yet</p>
                    <Button size="sm">Upload Company Data</Button>
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
                  <Button className="w-full" size="sm">Try AI Assistant</Button>
                  <Button variant="outline" className="w-full" size="sm">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
      </main>
    </div>
  );
}
