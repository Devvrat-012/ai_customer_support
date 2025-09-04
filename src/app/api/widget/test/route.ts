import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const widgetKey = searchParams.get('key');
  const customerDataParam = searchParams.get('customer');
  
  if (!widgetKey) {
    return new NextResponse('Widget key is required', { status: 400 });
  }

  let customerData = null;
  if (customerDataParam) {
    try {
      customerData = JSON.parse(decodeURIComponent(customerDataParam));
    } catch (error) {
      console.warn('Failed to parse customer data:', error);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Support Widget Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2d3748;
            text-align: center;
            margin-bottom: 32px;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .info-card {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
        }
        .info-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 500;
            color: #4a5568;
        }
        .info-value {
            color: #2d3748;
            font-family: monospace;
            background: #edf2f7;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        .test-content {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
        }
        .test-content h2 {
            color: #2d3748;
            margin-bottom: 16px;
            font-size: 1.5rem;
        }
        .test-content p {
            color: #6b7280;
            font-size: 1.125rem;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .bubble-indicator {
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .status-indicator {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
        }
        .instructions strong {
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Support Widget Test</h1>
        
        <div class="info-card">
            <div class="info-title">Widget Configuration</div>
            <div class="info-item">
                <span class="info-label">Widget Key:</span>
                <span class="info-value">${widgetKey}</span>
            </div>
            ${customerData ? `
            <div class="info-item">
                <span class="info-label">Customer ID:</span>
                <span class="info-value">${customerData.customerId || 'Not set'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Customer Name:</span>
                <span class="info-value">${customerData.name || 'Not set'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Customer Email:</span>
                <span class="info-value">${customerData.email || 'Not set'}</span>
            </div>
            ` : `
            <div class="info-item">
                <span class="info-label">Customer Data:</span>
                <span class="info-value">Not configured</span>
            </div>
            `}
        </div>

        <div class="test-content">
            <h2>Widget Test Environment</h2>
            <p>This page loads your AI support widget with the configured settings. Look for the chat bubble in the bottom-right corner of the page.</p>
            
            <div class="bubble-indicator">
                <div class="status-indicator"></div>
                Widget Active - Look for chat bubble below →
            </div>

            <div class="instructions">
                <strong>How to test:</strong> 
                <ol style="text-align: left; margin: 8px 0 0 0; padding-left: 20px;">
                    <li>Look for the blue chat bubble in the bottom-right corner</li>
                    <li>Click the chat bubble to open the widget</li>
                    <li>Type a message to test the AI responses</li>
                    <li>Check if customer data is properly loaded</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p>This is a test environment for your AI Support Widget.</p>
            <p>Close this window when you're done testing.</p>
        </div>
    </div>

    <!-- Widget Configuration Script -->
    <script>
        window.aiSupportConfig = {
            widgetKey: '${widgetKey}',
            theme: 'light',
            position: 'bottom-right'
        };
        
        ${customerData ? `
        // Set customer data for personalized support
        window.customerData = ${JSON.stringify(customerData, null, 2)};
        ` : ''}
    </script>
    
    <!-- Load AI Support Widget -->
    <script src="${baseUrl}/api/widget/js?key=${widgetKey}" async></script>
    <div id="ai-support-chat"></div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
