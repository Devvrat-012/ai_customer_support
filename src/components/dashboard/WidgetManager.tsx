"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle, ExternalLink, Code, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { 
  fetchProfile, 
  generateWidgetKey, 
  selectProfileLoading, 
  selectProfileError, 
  selectHasCompanyData, 
  selectWidgetKey,
  selectHasWidgetKey,
  selectShouldFetchProfile,
  clearError
} from '@/lib/store/profileSlice';

export function WidgetManager() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);
  const hasCompanyData = useAppSelector(selectHasCompanyData);
  const widgetKey = useAppSelector(selectWidgetKey);
  const hasWidgetKey = useAppSelector(selectHasWidgetKey);
  const shouldFetchProfile = useAppSelector(selectShouldFetchProfile);

  // Load profile data when component mounts or user changes
  useEffect(() => {
    if (user && shouldFetchProfile) {
      dispatch(fetchProfile());
    }
  }, [user, shouldFetchProfile, dispatch]);

  // Clear errors when component unmounts or user changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const generateNewKey = async () => {
    // Use Redux action to generate widget key
    setLoading(true);
    
    try {
      await dispatch(generateWidgetKey()).unwrap();
      toast({
        title: "Widget key generated!",
        description: "Your unique widget key has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error as string,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Widget key copied to clipboard",
      });
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getIntegrationCode = () => {
    return `<!-- Add this code before the closing </body> tag of your website -->
<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${window.location.origin}/api/widget/js"></script>
<div id="ai-support-chat"></div>`;
  };

  const openDemo = () => {
    if (!widgetKey) {
      toast({
        title: "Widget key required",
        description: "Please generate a widget key first.",
        variant: "destructive"
      });
      return;
    }
    
    const demoUrl = `/widget-demo?key=${widgetKey}`;
    window.open(demoUrl, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Widget Manager
        </CardTitle>
        <CardDescription>
          Generate and manage your AI support widget for website integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {profileError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
            {profileError}
          </div>
        )}
        
        {/* Widget Key Section */}
        <div className="space-y-3">
          <Label>Widget Key</Label>
          
          {widgetKey ? (
            // Display existing widget key with copy functionality
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <code className="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                  {widgetKey}
                </code>
                <Button
                  onClick={() => copyToClipboard(widgetKey)}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateNewKey}
                  disabled={loading || profileLoading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Show generate button when no key exists
            <div className="space-y-2">
              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No widget key generated yet
                </p>
                <Button
                  onClick={generateNewKey}
                  disabled={loading || profileLoading || hasWidgetKey}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : hasWidgetKey ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Widget Key Already Generated
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Generate Widget Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This unique key identifies your website widget and connects it to your AI assistant
          </p>
          
          {/* Company Data Status */}
          {!profileLoading && (
            <div className={`flex items-center gap-2 text-xs ${hasCompanyData ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {hasCompanyData ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Company data available
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Company data required for widget generation
                </>
              )}
            </div>
          )}
        </div>

        {/* Integration Code Section */}
        {widgetKey && (
          <div className="space-y-3">
            <Label htmlFor="integration-code">Integration Code</Label>
            <div className="relative">
              <Textarea
                id="integration-code"
                value={getIntegrationCode()}
                readOnly
                rows={9}
                className="font-mono text-xs resize-none"
              />
              <Button
                onClick={() => copyToClipboard(getIntegrationCode())}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Copy and paste this code into your website&apos;s HTML before the closing &lt;/body&gt; tag
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {widgetKey && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={openDemo}
              disabled={!widgetKey}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Demo
            </Button>
            <Button
              onClick={() => copyToClipboard(getIntegrationCode())}
              disabled={!widgetKey}
              variant="outline"
              className="flex-1"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
