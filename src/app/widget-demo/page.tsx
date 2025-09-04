'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Code2, 
  Settings, 
  Key,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function WidgetDemoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  // Use window.location.origin in browser, fallback to env var
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const [widgetKey, setWidgetKey] = useState('');
  const [customerData, setCustomerData] = useState({
    customerId: 'demo-user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123'
  });
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load existing widget key
  useEffect(() => {
    const checkAuthAndLoadKey = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        // Try to get existing widget key
        const response = await fetch('/api/widget/key');
        const result = await response.json();
        
        if (result.success && result.data.widgetKey) {
          setWidgetKey(result.data.widgetKey);
        }

        // Set customer data based on logged-in user
        if (user) {
          setCustomerData({
            customerId: user.id || 'demo-user-123',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Demo User',
            email: user.email || 'demo@example.com',
            phone: '+1-555-0123'
          });
        }
      } catch (error) {
        console.warn('Failed to load existing widget key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadKey();
  }, [user, router]);

  // Generate a real widget key using the API
  const generateWidgetKey = async () => {
    setIsGeneratingKey(true);
    try {
      const response = await fetch('/api/widget/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to generate widget key. Please ensure you have company data configured.",
          variant: "destructive",
        });
        return;
      }

      setWidgetKey(result.data.widgetKey);
      toast({
        title: "Widget Key Generated",
        description: "Your widget key has been created successfully!",
      });
    } catch (error: unknown) {
      console.error('Failed to generate widget key:', error);
      toast({
        title: "Error",
        description: "Failed to generate widget key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${description} copied to clipboard`,
      });
    } catch (error: unknown) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Generate integration code
  const generateIntegrationCode = () => {
    const customerDataCode = `window.customerData = ${JSON.stringify(customerData, null, 2)};`;
    
    return `<!-- Add this before closing </body> tag -->
<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
  
  ${customerDataCode}
</script>
<script src="${baseUrl}/api/widget/js?key=${widgetKey}" async></script>
<div id="ai-support-chat"></div>`;
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading widget demo...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Widget Demo & Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test your AI support widget and generate integration code
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-gray-700 text-green-700 dark:text-green-300 border-green-200">
              Live Preview
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 border-blue-200">
              Code Generation
            </Badge>
            <Badge variant="outline" className="bg-purple-50 dark:bg-gray-700 text-purple-700 dark:text-purple-300 border-purple-200">
              Customer Data
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Widget Key Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Widget Key
                </CardTitle>
                <CardDescription>
                  Generate a widget key to test the integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={widgetKey}
                    placeholder="Generate a widget key to get started"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={generateWidgetKey}
                    disabled={isGeneratingKey}
                    size="sm"
                  >
                    {isGeneratingKey ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    {isGeneratingKey ? 'Generating...' : widgetKey ? 'Regenerate' : 'Generate Key'}
                  </Button>
                </div>
                {widgetKey && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      ✅ Widget key ready! You can now test the integration.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Data Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Data
                </CardTitle>
                <CardDescription>
                  Configure customer information for personalized support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input
                      id="customerId"
                      value={customerData.customerId}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, customerId: e.target.value }))}
                      placeholder="demo-user-123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName">Name</Label>
                    <Input
                      id="customerName"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Integration Code
                </CardTitle>
                <CardDescription>
                  Copy this code to integrate the widget into your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                {widgetKey ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generateIntegrationCode()}
                      readOnly
                      className="font-mono text-sm h-40"
                    />
                    <Button
                      onClick={() => copyToClipboard(generateIntegrationCode(), "Integration code")}
                      className="w-full"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Integration Code
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Generate a widget key first to see the integration code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Test Widget Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Test Your Widget
                </CardTitle>
                <CardDescription>
                  Try your widget with a live chat bubble on a test page
                </CardDescription>
              </CardHeader>
              <CardContent>
                {widgetKey ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Widget Ready for Testing
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Your widget is configured with customer data for {customerData.name}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => {
                        // Navigate to a test page with the widget
                        const testUrl = `/api/widget/test?key=${widgetKey}&customer=${encodeURIComponent(JSON.stringify(customerData))}`;
                        window.open(testUrl, '_blank', 'width=1200,height=800');
                      }}
                      className="w-full h-16 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <MessageSquare className="h-6 w-6 mr-3" />
                      Open Widget Test Page
                      <ExternalLink className="h-4 w-4 ml-3" />
                    </Button>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      Opens in a new window with a live chat bubble for testing
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <Settings className="h-12 w-12 mx-auto mb-2 opacity-50 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate a widget key first to test your widget
                    </p>
                    <Button
                      onClick={generateWidgetKey}
                      disabled={isGeneratingKey}
                      variant="outline"
                    >
                      {isGeneratingKey ? (
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      {isGeneratingKey ? 'Generating...' : 'Generate Key'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Follow these steps to integrate the widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Generate Widget Key</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click &ldquo;Generate Key&rdquo; to create your unique widget identifier
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Configure Customer Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set up customer information for personalized support
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Copy Integration Code</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add the generated code to your website before the closing &lt;/body&gt; tag
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Test & Deploy</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test the widget on your staging site, then deploy to production
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
