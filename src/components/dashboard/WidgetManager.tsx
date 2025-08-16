"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle, ExternalLink, Code, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WidgetManager() {
  const [widgetKey, setWidgetKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [hasCompanyData, setHasCompanyData] = useState(false);
  const [checkingCompanyData, setCheckingCompanyData] = useState(false);
  const { toast } = useToast();

  const checkCompanyData = async () => {
    setCheckingCompanyData(true);
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();
      
      if (result.success && result.data) {
        const hasData = !!(result.data.companyInfo && result.data.companyInfo.trim().length > 0);
        setHasCompanyData(hasData);
        return hasData;
      }
      return false;
    } catch (err) {
      console.error('Failed to check company data:', err);
      return false;
    } finally {
      setCheckingCompanyData(false);
    }
  };

  const fetchWidgetKey = async () => {
    try {
      const response = await fetch('/api/widget/key');
      const result = await response.json();
      
      console.log('Fetch widget key response:', result); // Debug log
      
      if (result.success) {
        const key = result.data?.widgetKey || '';
        console.log('Setting widget key:', key); // Debug log
        setWidgetKey(key);
      } else {
        setError(result.error || 'Failed to fetch widget key');
      }
    } catch (err) {
      setError('Failed to fetch widget key');
      console.error('Fetch error:', err);
    }
  };

  const generateNewKey = async () => {
    // Check company data first
    const hasData = await checkCompanyData();
    if (!hasData) {
      toast({
        title: "Company data required",
        description: "Please upload your company data first before generating a widget key.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/widget/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      console.log('Generate widget key response:', result); // Debug log
      
      if (result.success) {
        const key = result.data?.widgetKey || '';
        console.log('Setting new widget key:', key); // Debug log
        setWidgetKey(key);
        toast({
          title: "Widget key generated!",
          description: "Your unique widget key has been created successfully.",
        });
      } else {
        setError(result.error || 'Failed to generate widget key');
        toast({
          title: "Generation failed",
          description: result.error || 'Failed to generate widget key',
          variant: "destructive"
        });
      }
    } catch (err) {
      setError('Failed to generate widget key');
      console.error('Generate error:', err);
      toast({
        title: "Generation failed",
        description: 'Failed to generate widget key. Please try again.',
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getIntegrationCode = () => {
    if (!widgetKey) return '';
    
    return `<!-- AI Customer Support Widget -->
<script>
  window.AISupportConfig = {
    widgetKey: '${widgetKey}',
    apiUrl: '${window.location.origin}',
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

    if (!hasCompanyData) {
      toast({
        title: "Company data required",
        description: "Please upload your company data first before testing the widget.",
        variant: "destructive"
      });
      return;
    }
    
    const demoUrl = `/widget-demo?key=${widgetKey}`;
    window.open(demoUrl, '_blank');
  };

  useEffect(() => {
    // Only check company data on mount, don't auto-fetch widget key
    checkCompanyData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Website Widget
        </CardTitle>
        <CardDescription>
          Embed our AI chat widget on your website to provide instant customer support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Widget Key Section */}
        <div className="space-y-3">
          <Label htmlFor="widget-key">Widget Key</Label>
          <div className="flex gap-2">
            <Input
              id="widget-key"
              value={widgetKey || ''}
              readOnly
              placeholder={!widgetKey ? "Click generate to create a widget key" : ""}
              className="font-mono text-sm"
            />
            <Button
              onClick={generateNewKey}
              disabled={loading || checkingCompanyData}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This unique key identifies your website widget and connects it to your AI assistant
          </p>
          
          {/* Company Data Status */}
          {!checkingCompanyData && (
            <div className={`flex items-center gap-2 text-xs ${hasCompanyData ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {hasCompanyData ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Company data available</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>Upload company data first</span>
                </>
              )}
            </div>
          )}
          
          {/* Debug info */}
          <div className="text-xs text-gray-500">
            Debug: widgetKey = "{widgetKey || 'empty'}", length = {widgetKey?.length || 0}
          </div>
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
              Copy and paste this code into your website's HTML before the closing &lt;/body&gt; tag
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={openDemo}
            disabled={!widgetKey || !hasCompanyData || checkingCompanyData}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Widget
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

        {/* Features List */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 text-sm">Widget Features:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Floating chat bubble</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Mobile responsive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>AI-powered responses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Customizable theme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Real-time chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Easy integration</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
