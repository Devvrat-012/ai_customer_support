"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Code, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { generateWidgetKey as generateWidgetKeyAction, selectWidgetKey, selectHasWidgetKey } from '@/lib/store/profileSlice';

export default function WidgetDemoPage() {
  const [demoHtml, setDemoHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const dispatch = useAppDispatch();
  const reduxWidgetKey = useAppSelector(selectWidgetKey);
  const hasWidgetKey = useAppSelector(selectHasWidgetKey);
  const [localWidgetKey, setLocalWidgetKey] = useState('');

  // Use Redux widget key if available, otherwise use local state
  const widgetKey = reduxWidgetKey || localWidgetKey;

  const generateWidgetKey = useCallback(async () => {
    setGenerating(true);
    try {
      // Check if we have a key from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const keyFromUrl = urlParams.get('key');
      
      if (keyFromUrl) {
        setLocalWidgetKey(keyFromUrl);
        updateDemoHtml(keyFromUrl);
        setGenerating(false);
        return;
      }

      // Generate a new key using Redux action
      const result = await dispatch(generateWidgetKeyAction()).unwrap();
      updateDemoHtml(result);
    } catch {
      alert('Error generating widget key. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [dispatch]);

  const updateDemoHtml = (key: string) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website - AI Customer Support Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .demo-content {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 40px 20px;
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; opacity: 0.9; }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .customer-demo {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        .btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .btn:hover { background: #3730a3; }
    </style>
</head>
<body>
    <div class="demo-content">
        <h1>🚀 Your Company Website</h1>
        <p>This is a demo website showing how the AI Customer Support widget works.</p>
        <p><strong>Try the chat widget in the bottom-right corner!</strong></p>
        
        <div class="features">
            <div class="feature">
                <h3>💬 Instant Support</h3>
                <p>Get immediate answers to customer questions</p>
            </div>
            <div class="feature">
                <h3>🤖 AI-Powered</h3>
                <p>Smart responses based on your company data</p>
            </div>
            <div class="feature">
                <h3>📱 Mobile Friendly</h3>
                <p>Works perfectly on all devices</p>
            </div>
            <div class="feature">
                <h3>👥 Customer Tracking</h3>
                <p>Track individual customer conversations</p>
            </div>
        </div>

        <div class="customer-demo">
            <h3>🔍 Customer Tracking Demo</h3>
            <p>Test the customer tracking feature by setting different customer identities:</p>
            <button class="btn" onclick="setCustomer('customer-001', {name: 'John Doe', email: 'john@example.com'})">
                Set as John Doe
            </button>
            <button class="btn" onclick="setCustomer('customer-002', {name: 'Jane Smith', email: 'jane@example.com'})">
                Set as Jane Smith
            </button>
            <button class="btn" onclick="setCustomer('customer-003', {name: 'Bob Johnson', email: 'bob@example.com'})">
                Set as Bob Johnson
            </button>
            <button class="btn" onclick="clearCustomer()">
                Clear Customer ID
            </button>
            <p><small>Current Customer: <span id="current-customer">None</span></small></p>
        </div>
    </div>

    <!-- AI Customer Support Widget -->
    <script>
        // Customer management functions
        function setCustomer(customerId, customerData) {
            if (window.setAIChatCustomer) {
                window.setAIChatCustomer(customerId, customerData);
                document.getElementById('current-customer').textContent = 
                    customerData.name + ' (' + customerId + ')';
            } else {
                console.log('Widget not ready yet');
            }
        }

        function clearCustomer() {
            if (window.setAIChatCustomer) {
                window.setAIChatCustomer(null);
                document.getElementById('current-customer').textContent = 'None';
            }
        }

        // Get current customer info
        function getCurrentCustomer() {
            if (window.getAIChatCustomer) {
                return window.getAIChatCustomer();
            }
            return null;
        }
    </script>
    <script src="${process.env.NEXT_PUBLIC_APP_URL}/api/widget/js?key=${key}&t=${Date.now()}"></script>
    <div id="ai-support-chat"></div>
</body>
</html>`;
    setDemoHtml(html);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(demoHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openDemo = () => {
    const blob = new Blob([demoHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  useEffect(() => {
    // Auto-generate widget key on page load for demo purposes
    generateWidgetKey();
  }, [generateWidgetKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 AI Customer Support Widget Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Test and integrate our chat widget into your website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Widget Configuration
              </CardTitle>
              <CardDescription>
                Generate your widget key and get the integration code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Widget Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={widgetKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Generate a widget key first"
                  />
                  <Button onClick={generateWidgetKey} disabled={generating || hasWidgetKey}>
                    {generating ? 'Generating...' : hasWidgetKey ? 'Key Generated' : 'Generate'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Basic Integration Code</label>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono overflow-x-auto">
                  <div>{`<!-- Basic widget integration -->`}</div>
                  <div>{`<script src="https://yourapp.com/api/widget/js?key=${widgetKey || 'YOUR_WIDGET_KEY'}"></script>`}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Advanced Integration with Customer Tracking</label>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono overflow-x-auto">
                  <div>{`<!-- Advanced integration with customer tracking -->`}</div>
                  <div>{`<script src="https://yourapp.com/api/widget/js?key=${widgetKey || 'YOUR_WIDGET_KEY'}"></script>`}</div>
                  <div className="mt-2">{`<script>`}</div>
                  <div className="ml-4">{`// Set customer information when available`}</div>
                  <div className="ml-4">{`setAIChatCustomer('customer-123', {`}</div>
                  <div className="ml-8">{`name: 'John Doe',`}</div>
                  <div className="ml-8">{`email: 'john@example.com',`}</div>
                  <div className="ml-8">{`phone: '+1234567890'`}</div>
                  <div className="ml-4">{`});`}</div>
                  <div>{`</script>`}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={openDemo} disabled={!widgetKey} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Live Demo
                </Button>
                <Button variant="outline" onClick={copyToClipboard} disabled={!demoHtml}>
                  {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Website Preview</CardTitle>
              <CardDescription>
                See how the widget looks on a sample website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="text-2xl">🌐</div>
                  <h3 className="text-lg font-semibold">Your Website</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    The chat widget will appear as a floating bubble in the bottom-right corner
                  </p>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full inline-block text-sm">
                    💬 Chat with us!
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Floating chat bubble</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI-powered responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Easy integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo HTML Code */}
        {demoHtml && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Complete Demo HTML</CardTitle>
              <CardDescription>
                Full HTML code for testing the widget integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={demoHtml}
                readOnly
                className="min-h-96 font-mono text-sm"
                placeholder="Generate a widget key to see the demo HTML"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
