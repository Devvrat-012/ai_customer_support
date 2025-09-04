"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle, ExternalLink, Code2, RefreshCw, AlertTriangle, Key, Globe, Sparkles, Zap, Play } from 'lucide-react';
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
  selectShouldFetchProfile,
  clearError
} from '@/lib/store/profileSlice';

export function WidgetManager() {
  const [loading, setLoading] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTech, setSelectedTech] = useState('html');
  const { toast } = useToast();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Redux selectors
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);
  const hasCompanyData = useAppSelector(selectHasCompanyData);
  const widgetKey = useAppSelector(selectWidgetKey);
  // const hasWidgetKey = useAppSelector(selectHasWidgetKey);
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

  const copyToClipboard = async (text: string, type: 'widget' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'widget') {
        setCopiedWidget(true);
        toast({
          title: "Copied!",
          description: "Widget key copied to clipboard",
        });
        setTimeout(() => setCopiedWidget(false), 2000);
      } else {
        setCopiedCode(true);
        toast({
          title: "Copied!",
          description: "Integration code copied to clipboard",
        });
        setTimeout(() => setCopiedCode(false), 2000);
      }
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    const integrationCodes = {
      html: `<!-- Add this code before the closing </body> tag -->
<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js"></script>
<div id="ai-support-chat"></div>`,

      react: `// React Component Integration

import { useEffect } from 'react';

const AISupportWidget = () => {
  useEffect(() => {
    // Configuration
    window.aiSupportConfig = {
      widgetKey: '${widgetKey}',
      theme: 'light',
      position: 'bottom-right'
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/widget/js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return <div id="ai-support-chat" />;
};

export default AISupportWidget;`,

      angular: `// Angular Component Integration

import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ai-support',
  template: '<div id="ai-support-chat"></div>'
})
export class AiSupportComponent implements OnInit, OnDestroy {
  private script?: HTMLScriptElement;

  ngOnInit() {
    // Configuration
    (window as any).aiSupportConfig = {
      widgetKey: '${widgetKey}',
      theme: 'light',
      position: 'bottom-right'
    };

    // Load widget script
    this.script = document.createElement('script');
    this.script.src = '${baseUrl}/api/widget/js';
    this.script.async = true;
    document.body.appendChild(this.script);
  }

  ngOnDestroy() {
    if (this.script) {
      document.body.removeChild(this.script);
    }
  }
}`,

      vue: `<!-- Vue.js Component -->
<template>
  <div id="ai-support-chat"></div>
</template>

<script>
export default {
  name: 'AiSupportWidget',
  mounted() {
    // Configuration
    window.aiSupportConfig = {
      widgetKey: '${widgetKey}',
      theme: 'light',
      position: 'bottom-right'
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/widget/js';
    script.async = true;
    document.body.appendChild(script);
    this.script = script;
  },
  beforeUnmount() {
    if (this.script) {
      document.body.removeChild(this.script);
    }
  }
};
</script>`,

      wordpress: `<!-- WordPress Plugin Integration -->
<!-- Add to your theme's functions.php or create a custom plugin -->

<?php
function add_ai_support_widget() {
    $widget_key = '${widgetKey}';
    ?>
    <script>
      window.aiSupportConfig = {
        widgetKey: '<?php echo esc_js($widget_key); ?>',
        theme: 'light',
        position: 'bottom-right'
      };
    </script>
    <script src="<?php echo esc_url('${baseUrl}/api/widget/js'); ?>" async></script>
    <div id="ai-support-chat"></div>
    <?php
}
add_action('wp_footer', 'add_ai_support_widget');
?>

<!-- Alternative: Add to your theme's footer.php -->
<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js" async></script>
<div id="ai-support-chat"></div>`,

      shopify: `<!-- Shopify Theme Integration -->
<!-- Add to theme.liquid before closing </body> tag -->

<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js" async></script>
<div id="ai-support-chat"></div>

<!-- For Shopify Plus with checkout.liquid -->
{% comment %} Add the same code to checkout.liquid for checkout support {% endcomment %}`,

      wix: `<!-- Wix Integration -->
<!-- Add via Wix Editor -> Add -> Embed -> Custom Embeds -> HTML iFrame -->

<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js" async></script>
<div id="ai-support-chat"></div>

<!-- Alternative: Add to Page Settings -> SEO -> Custom Code -> Body -->`,

      squarespace: `<!-- Squarespace Integration -->
<!-- Add via Settings -> Advanced -> Code Injection -> Footer -->

<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js" async></script>
<div id="ai-support-chat"></div>`,

      webflow: `<!-- Webflow Integration -->
<!-- Add via Project Settings -> Custom Code -> Footer Code -->

<script>
  window.aiSupportConfig = {
    widgetKey: '${widgetKey}',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="${baseUrl}/api/widget/js" async></script>
<div id="ai-support-chat"></div>

<!-- Or add via Page Settings -> Custom Code for specific pages -->`,

      nextjs: `// Next.js Integration
// Add to _app.js or _app.tsx

import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    window.aiSupportConfig = {
      widgetKey: '${widgetKey}',
      theme: 'light',
      position: 'bottom-right'
    };
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Script 
        src="${baseUrl}/api/widget/js" 
        strategy="lazyOnload"
      />
      <div id="ai-support-chat" />
    </>
  );
}

export default MyApp;`
    };

    return integrationCodes[selectedTech as keyof typeof integrationCodes] || integrationCodes.html;
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
    <div className="space-y-6">
      {/* Main Widget Manager Card */}
      <Card className="border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Widget Integration</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Deploy AI support on your website in minutes
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${hasCompanyData
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                {hasCompanyData ? '✓ Ready' : '⚠ Setup Required'}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {profileError && (
            <div className="p-4 rounded-lg border bg-red-50/50 border-red-200/50 text-red-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{profileError}</span>
              </div>
            </div>
          )}

          {/* Widget Key Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Widget Key</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unique identifier for your AI assistant</p>
              </div>
            </div>

            {widgetKey ? (
              <div className="space-y-4">
                <div className="group relative">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-blue-300 hover:border-blue-400 transition-colors dark:border-blue-600 dark:hover:border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">WIDGET KEY</Label>
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{widgetKey}</code>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(widgetKey, 'widget')}
                        variant="outline"
                        size="sm"
                        className="ml-3 h-8 w-8 p-0 border border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        {copiedWidget ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateNewKey}
                  disabled={loading || profileLoading}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Generate New Key
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-violet-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Ready to Get Started?</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Generate your widget key to start integrating AI support into your website
                </p>
                <Button
                  onClick={generateNewKey}
                  disabled={loading || profileLoading || !hasCompanyData}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Generate Widget Key
                    </>
                  )}
                </Button>

                {!hasCompanyData && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50/50 border border-amber-200/50">
                    <p className="text-sm text-amber-700 dark:text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Please upload company data first to generate your widget key
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Integration Code Section */}
          {widgetKey && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Integration Code</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Copy and paste into your website</p>
                  </div>
                </div>

                {/* Technology Selection */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform:</Label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md hover:border-violet-500 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-violet-400"
                  >
                    <option value="html">HTML/JavaScript</option>
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="angular">Angular</option>
                    <option value="vue">Vue.js</option>
                    <option value="wordpress">WordPress</option>
                    <option value="shopify">Shopify</option>
                    <option value="wix">Wix</option>
                    <option value="squarespace">Squarespace</option>
                    <option value="webflow">Webflow</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                  {selectedTech.toUpperCase()} INTEGRATION CODE
                </Label>
                <div className="relative group">
                  <Textarea
                    value={getIntegrationCode()}
                    readOnly
                    rows={selectedTech === 'html' ? 8 : 16}
                    className="font-mono text-xs bg-gray-50 dark:bg-gray-800/30 border-dashed border-emerald-300 hover:border-emerald-400 transition-colors resize-none pr-12 dark:border-emerald-600 dark:hover:border-emerald-500"
                  />
                  <Button
                    onClick={() => copyToClipboard(getIntegrationCode(), 'code')}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-600"
                  >
                    {copiedCode ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedTech === 'html' && 'Add this code before the closing </body> tag'}
                    {selectedTech === 'react' && 'Import and use this component in your React app'}
                    {selectedTech === 'nextjs' && 'Add to _app.js or _app.tsx in your Next.js project'}
                    {selectedTech === 'angular' && 'Create a component and add to your Angular module'}
                    {selectedTech === 'vue' && 'Use this component in your Vue.js app'}
                    {selectedTech === 'wordpress' && 'Add to functions.php or create a custom plugin'}
                    {selectedTech === 'shopify' && 'Add to theme.liquid before closing </body> tag'}
                    {selectedTech === 'wix' && 'Add via Custom Embeds in Wix Editor'}
                    {selectedTech === 'squarespace' && 'Add via Code Injection in Settings'}
                    {selectedTech === 'webflow' && 'Add via Project Settings Custom Code'}
                  </p>
                  <Button
                    onClick={() => window.open('/documentation', '_blank')}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Docs
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards */}
      {widgetKey && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demo Card */}
          <Card className="border group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={openDemo}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Live Preview</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Test your widget</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Copy Code Card */}
          <Card className="border group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => copyToClipboard(getIntegrationCode(), 'code')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {copiedCode ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Copy className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {copiedCode ? 'Integration code copied' : 'Get embed code'}
                    </p>
                  </div>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
