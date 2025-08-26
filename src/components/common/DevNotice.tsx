"use client";

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Wrench, Lightbulb, Bug } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DevNotice() {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development mode
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Check if user has dismissed the notice in this session
    const isDismissed = sessionStorage.getItem('dev-notice-dismissed');
    if (!isDismissed && isDev) {
      setIsVisible(true);
    }
  }, [isDev]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('dev-notice-dismissed', 'true');
  };

  if (!isVisible || !isDev) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <Card className="
        w-80 bg-gradient-to-br from-orange-50 to-red-50 
        dark:from-orange-950/90 dark:to-red-950/90 
        border-orange-200 dark:border-orange-800 
        shadow-lg backdrop-blur-sm
      ">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-500 rounded-full">
              <Wrench className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Development Mode
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
          >
            <X className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                This website is under active development
              </p>
              <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3" />
                  <span>Light theme styling issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bug className="h-3 w-3" />
                  <span>Some features may not work perfectly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="h-3 w-3" />
                  <span>UI improvements in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Data may be reset during updates</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
              Thank you for your patience! 🚧
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
