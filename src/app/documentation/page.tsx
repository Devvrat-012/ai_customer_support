"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  
  Code2, 
  Globe, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Zap,
  Settings,
  Smartphone,
  Monitor,
  Palette,
  Shield,
  BookOpen,
  FileText,
  Rocket,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DocumentationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(null), 2000);
  } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const CodeBlock = ({ code, id, title }: { code: string; id: string; title: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <Button
          onClick={() => copyToClipboard(code, id)}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
        >
          {copiedCode === id ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <pre className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs overflow-x-auto">
        <code className="text-gray-900 dark:text-gray-100">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  AI Support Widget Documentation
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete integration guide for all platforms and frameworks
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              v2.0
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border sticky top-18">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <nav className="space-y-1">
                  <a href="#quick-start" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    Quick Start Guide
                  </a>
                  <a href="#platforms" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    Platform Integrations
                  </a>
                  <a href="#customization" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    Customization Options
                  </a>
                  <a href="#api" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    API Reference
                  </a>
                  <a href="#troubleshooting" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    Troubleshooting
                  </a>
                  <a href="#support" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                    Support & FAQ
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Start */}
            <section id="quick-start">
              <Card className="bg-white dark:bg-gray-800 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-green-600" />
                    </div>
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Get your AI support widget running in under 5 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-50 dark:bg-gray-800/30 border-dashed">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Generate Widget Key</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Create your unique widget identifier in the dashboard</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-50 dark:bg-gray-800/30 border-dashed">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Choose Platform</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Select your website platform from the dropdown</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-50 dark:bg-gray-800/30 border-dashed">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Add Code</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Copy and paste the integration code to your site</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Basic HTML Integration
                    </h4>
                    <CodeBlock
                      id="basic-html"
                      title="HTML/JavaScript"
                      code={`<!-- Add before closing </body> tag -->
<script>
  window.aiSupportConfig = {
    widgetKey: 'YOUR_WIDGET_KEY',
    theme: 'light',
    position: 'bottom-right'
  };
  
  // Optional: Set customer data for personalized support
  window.customerData = {
    customerId: 'unique-customer-id',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    metadata: {
      plan: 'premium',
      company: 'Acme Corp',
      role: 'admin'
    }
  };
</script>
<script src="\${process.env.NEXT_PUBLIC_APP_URL}/api/widget/js?key=YOUR_WIDGET_KEY"></script>
<div id="ai-support-chat"></div>`}
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50/50 border border-green-200/50 dark:bg-green-900/20 dark:border-green-800 mt-4">
                    <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Dynamic Customer Data
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      You can also set customer data dynamically after widget initialization:
                    </p>
                    <CodeBlock
                      id="dynamic-customer"
                      title="Dynamic Customer Setup"
                      code={`// Set customer data after user login
function setCustomerData(user) {
  if (window.setAIChatCustomer) {
    window.setAIChatCustomer(user.id, {
      name: user.name,
      email: user.email,
      phone: user.phone,
      metadata: {
        plan: user.subscriptionPlan,
        company: user.company,
        lastLogin: user.lastLogin
      }
    });
  }
}

// Clear customer data on logout
function clearCustomerData() {
  if (window.setAIChatCustomer) {
    window.setAIChatCustomer(null);
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Platform Integrations */}
            <section id="platforms">
              <Card className="bg-white dark:bg-gray-800 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    Platform Integrations
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Detailed integration guides for popular platforms and frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="react" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6">
                      <TabsTrigger value="react">React</TabsTrigger>
                      <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                      <TabsTrigger value="shopify">Shopify</TabsTrigger>
                      <TabsTrigger value="angular">Angular</TabsTrigger>
                      <TabsTrigger value="vue">Vue.js</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="react" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">React Component</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Create a reusable React component for your AI support widget.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">TypeScript Ready</Badge>
                          <Badge variant="outline">Hooks Compatible</Badge>
                        </div>
                      </div>
                      
                      <CodeBlock
                        id="react-component"
                        title="AISupportWidget.tsx"
                        code={`import { useEffect } from 'react';

interface CustomerData {
  customerId: string;
  name?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

interface AISupportWidgetProps {
  widgetKey: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  customerData?: CustomerData;
}

const AISupportWidget: React.FC<AISupportWidgetProps> = ({
  widgetKey,
  theme = 'light',
  position = 'bottom-right',
  customerData
}) => {
  useEffect(() => {
    // Configuration
    window.aiSupportConfig = {
      widgetKey,
      theme,
      position
    };

    // Set customer data if provided
    if (customerData) {
      window.customerData = customerData;
    }

    // Load widget script
    const script = document.createElement('script');
    script.src = \`\${baseUrl}/api/widget/js?key=\${widgetKey}\`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [widgetKey, theme, position, customerData]);

  return <div id="ai-support-chat" />;
};

export default AISupportWidget;`}
                      />
                      
                      <CodeBlock
                        id="react-usage"
                        title="Usage in App.tsx"
                        code={`import AISupportWidget from './components/AISupportWidget';
import { useAuth } from './hooks/useAuth'; // Your auth hook

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="App">
      {/* Your app content */}
      <AISupportWidget 
        widgetKey="your-widget-key"
        theme="light"
        position="bottom-right"
        customerData={isAuthenticated ? {
          customerId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          metadata: {
            plan: user.subscriptionPlan,
            company: user.company,
            registeredAt: user.createdAt
          }
        } : undefined}
      />
    </div>
  );
}`}
                      />
                      
                      <CodeBlock
                        id="react-hooks"
                        title="useAISupport Hook"
                        code={`import { useEffect, useCallback } from 'react';

export const useAISupport = () => {
  const setCustomer = useCallback((customerData: CustomerData) => {
    if (window.setAIChatCustomer) {
      const { customerId, ...data } = customerData;
      window.setAIChatCustomer(customerId, data);
    }
  }, []);

  const clearCustomer = useCallback(() => {
    if (window.setAIChatCustomer) {
      window.setAIChatCustomer(null);
    }
  }, []);

  return { setCustomer, clearCustomer };
};`}
                      />
                    </TabsContent>

                    <TabsContent value="wordpress" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">WordPress Integration</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Add AI support to your WordPress site via functions.php or custom plugin.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Plugin Ready</Badge>
                          <Badge variant="outline">Theme Compatible</Badge>
                        </div>
                      </div>
                      
                      <CodeBlock
                        id="wordpress-functions"
                        title="functions.php"
                        code={`<?php
// Add to your theme's functions.php file
function add_ai_support_widget() {
    $widget_key = 'YOUR_WIDGET_KEY'; // Replace with your actual key
    
    // Get current user data for logged-in users
    $current_user = wp_get_current_user();
    $customer_data = array();
    
    if ($current_user->ID) {
        $customer_data = array(
            'customerId' => (string)$current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'metadata' => array(
                'role' => implode(', ', $current_user->roles),
                'registeredAt' => $current_user->user_registered,
                'website' => get_site_url()
            )
        );
    }
    ?>
    <script>
      window.aiSupportConfig = {
        widgetKey: '<?php echo esc_js($widget_key); ?>',
        theme: 'light',
        position: 'bottom-right'
      };
      
      <?php if (!empty($customer_data)): ?>
      // Set customer data for logged-in users
      window.customerData = <?php echo json_encode($customer_data, JSON_HEX_TAG | JSON_HEX_AMP); ?>;
      <?php endif; ?>
    </script>
    <script src="<?php echo esc_url(get_option('ai_support_base_url', 'YOUR_DOMAIN') . '/api/widget/js?key=' . $widget_key); ?>" async></script>
    <div id="ai-support-chat"></div>
    <?php
}
add_action('wp_footer', 'add_ai_support_widget');

// Optional: Add admin settings
function ai_support_admin_menu() {
    add_options_page(
        'AI Support Settings',
        'AI Support',
        'manage_options',
        'ai-support',
        'ai_support_settings_page'
    );
}
add_action('admin_menu', 'ai_support_admin_menu');

// WooCommerce integration for customer data
function ai_support_woocommerce_customer_data($customer_data) {
    if (class_exists('WooCommerce') && is_user_logged_in()) {
        $user_id = get_current_user_id();
        $customer = new WC_Customer($user_id);
        
        if ($customer->get_id()) {
            $customer_data['phone'] = $customer->get_billing_phone();
            $customer_data['metadata']['billingCountry'] = $customer->get_billing_country();
            $customer_data['metadata']['totalOrders'] = wc_get_customer_order_count($user_id);
            $customer_data['metadata']['totalSpent'] = wc_get_customer_total_spent($user_id);
        }
    }
    return $customer_data;
}
?>`}
                      />
                      
                      <CodeBlock
                        id="wordpress-plugin"
                        title="Custom Plugin (ai-support-widget.php)"
                        code={`<?php
/**
 * Plugin Name: AI Support Widget
 * Description: Adds AI-powered customer support to your website
 * Version: 1.0
 * Author: Your Company
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AISupportWidget {
    private $widget_key;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_footer', array($this, 'render_widget'));
        add_action('admin_menu', array($this, 'admin_menu'));
    }
    
    public function init() {
        $this->widget_key = get_option('ai_support_widget_key', '');
    }
    
    public function render_widget() {
        if (empty($this->widget_key)) return;
        
        // Get customer data for logged-in users
        $customer_data = $this->get_customer_data();
        ?>
        <script>
          window.aiSupportConfig = {
            widgetKey: '<?php echo esc_js($this->widget_key); ?>',
            theme: '<?php echo esc_js(get_option('ai_support_theme', 'light')); ?>',
            position: '<?php echo esc_js(get_option('ai_support_position', 'bottom-right')); ?>'
          };
          
          <?php if (!empty($customer_data)): ?>
          // Set customer data for personalized support
          window.customerData = <?php echo json_encode($customer_data, JSON_HEX_TAG | JSON_HEX_AMP); ?>;
          <?php endif; ?>
        </script>
        <script src="<?php echo esc_url(get_option('ai_support_base_url', 'YOUR_DOMAIN') . '/api/widget/js?key=' . $this->widget_key); ?>" async></script>
        <div id="ai-support-chat"></div>
        <?php
    }
    
    private function get_customer_data() {
        if (!is_user_logged_in()) return array();
        
        $current_user = wp_get_current_user();
        $customer_data = array(
            'customerId' => (string)$current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'metadata' => array(
                'role' => implode(', ', $current_user->roles),
                'registeredAt' => $current_user->user_registered,
                'website' => get_site_url()
            )
        );
        
        // WooCommerce integration
        if (class_exists('WooCommerce')) {
            $customer = new WC_Customer($current_user->ID);
            if ($customer->get_id()) {
                $customer_data['phone'] = $customer->get_billing_phone();
                $customer_data['metadata']['totalOrders'] = wc_get_customer_order_count($current_user->ID);
                $customer_data['metadata']['totalSpent'] = wc_get_customer_total_spent($current_user->ID);
            }
        }
        
        return $customer_data;
    }
}

new AISupportWidget();
?>`}
                      />
                    </TabsContent>

                    <TabsContent value="shopify" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Shopify Integration</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Add AI support to your Shopify store theme for customer assistance.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Theme Compatible</Badge>
                          <Badge variant="outline">Checkout Ready</Badge>
                        </div>
                      </div>
                      
                      <CodeBlock
                        id="shopify-theme"
                        title="theme.liquid (before closing </body>)"
                        code={`<!-- Add to theme.liquid before closing </body> tag -->
<script>
  window.aiSupportConfig = {
    widgetKey: 'YOUR_WIDGET_KEY',
    theme: 'light',
    position: 'bottom-right',
    // Shopify-specific configurations
    shopInfo: {
      shopId: '{{ shop.id }}',
      currency: '{{ shop.currency }}',
      domain: '{{ shop.domain }}'
    }
  };
  
  {% if customer %}
  // Set customer data for logged-in users
  window.customerData = {
    customerId: '{{ customer.id }}',
    name: '{{ customer.first_name }} {{ customer.last_name }}',
    email: '{{ customer.email }}',
    {% if customer.phone %}phone: '{{ customer.phone }}',{% endif %}
    metadata: {
      acceptsMarketing: {{ customer.accepts_marketing }},
      createdAt: '{{ customer.created_at }}',
      ordersCount: {{ customer.orders_count }},
      totalSpent: '{{ customer.total_spent | money_without_currency }}',
      tags: [{% for tag in customer.tags %}'{{ tag }}'{% unless forloop.last %},{% endunless %}{% endfor %}],
      defaultAddress: {
        {% if customer.default_address %}
        city: '{{ customer.default_address.city }}',
        country: '{{ customer.default_address.country }}',
        province: '{{ customer.default_address.province }}'
        {% endif %}
      }
    }
  };
  {% endif %}
</script>
<script src="\${baseUrl}/api/widget/js?key=YOUR_WIDGET_KEY" async></script>
<div id="ai-support-chat"></div>`}
                      />
                      
                      <CodeBlock
                        id="shopify-checkout"
                        title="checkout.liquid (Shopify Plus)"
                        code={`<!-- For Shopify Plus: Add to checkout.liquid -->
<script>
  window.aiSupportConfig = {
    widgetKey: 'YOUR_WIDGET_KEY',
    theme: 'light',
    position: 'bottom-right',
    context: 'checkout'
  };
  
  {% if checkout %}
  // Set customer data during checkout
  window.customerData = {
    customerId: '{{ checkout.customer.id | default: "guest" }}',
    name: '{{ checkout.shipping_address.first_name }} {{ checkout.shipping_address.last_name }}',
    email: '{{ checkout.email }}',
    {% if checkout.shipping_address.phone %}phone: '{{ checkout.shipping_address.phone }}',{% endif %}
    metadata: {
      context: 'checkout',
      orderTotal: '{{ checkout.total_price | money_without_currency }}',
      currency: '{{ checkout.currency }}',
      itemCount: {{ checkout.line_items.size }},
      shippingAddress: {
        city: '{{ checkout.shipping_address.city }}',
        country: '{{ checkout.shipping_address.country }}',
        province: '{{ checkout.shipping_address.province }}'
      },
      items: [
        {% for line_item in checkout.line_items %}
        {
          name: '{{ line_item.title }}',
          quantity: {{ line_item.quantity }},
          price: '{{ line_item.price | money_without_currency }}'
        }{% unless forloop.last %},{% endunless %}
        {% endfor %}
      ]
    }
  };
  {% endif %}
</script>
<script src="\${baseUrl}/api/widget/js?key=YOUR_WIDGET_KEY" async></script>
<div id="ai-support-chat"></div>`}
                      />
                    </TabsContent>

                    <TabsContent value="angular" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Angular Integration</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Create an Angular component for seamless AI support integration.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Angular 12+</Badge>
                          <Badge variant="outline">TypeScript</Badge>
                        </div>
                      </div>
                      
                      <CodeBlock
                        id="angular-component"
                        title="ai-support.component.ts"
                        code={`import { Component, Input, OnInit, OnDestroy, Inject, Optional } from '@angular/core';

export interface CustomerData {
  customerId: string;
  name?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

@Component({
  selector: 'app-ai-support',
  template: '<div id="ai-support-chat"></div>'
})
export class AiSupportComponent implements OnInit, OnDestroy {
  @Input() widgetKey: string = '';
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() position: 'bottom-right' | 'bottom-left' = 'bottom-right';
  @Input() customerData?: CustomerData;
  
  private script?: HTMLScriptElement;

  constructor(
    @Optional() @Inject('AuthService') private authService?: any
  ) {}

  ngOnInit() {
    if (!this.widgetKey) {
      console.error('AI Support: Widget key is required');
      return;
    }

    this.initializeWidget();
  }

  private async initializeWidget() {
    // Get customer data from auth service if available
    const customer = this.customerData || await this.getCurrentCustomer();
    
    // Configuration
    (window as any).aiSupportConfig = {
      widgetKey: this.widgetKey,
      theme: this.theme,
      position: this.position
    };

    // Set customer data if available
    if (customer) {
      (window as any).customerData = customer;
    }

    // Load widget script
    this.script = document.createElement('script');
    this.script.src = \`\${environment.baseUrl}/api/widget/js?key=\${this.widgetKey}\`;
    this.script.async = true;
    document.body.appendChild(this.script);
  }

  private async getCurrentCustomer(): Promise<CustomerData | null> {
    if (!this.authService) return null;
    
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return null;

      return {
        customerId: user.id,
        name: user.name || \`\${user.firstName} \${user.lastName}\`.trim(),
        email: user.email,
        phone: user.phone,
        metadata: {
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          preferences: user.preferences
        }
      };
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  }

  ngOnDestroy() {
    if (this.script && document.body.contains(this.script)) {
      document.body.removeChild(this.script);
    }
  }
}`}
                      />
                      
                      <CodeBlock
                        id="angular-module"
                        title="app.module.ts"
                        code={`import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AiSupportComponent } from './ai-support.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    AiSupportComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`}
                      />
                      
                      <CodeBlock
                        id="angular-usage"
                        title="app.component.html & app.component.ts"
                        code={`<!-- app.component.html -->
<div class="app-container">
  <!-- Your app content -->
  
  <!-- Basic usage -->
  <app-ai-support 
    widgetKey="your-widget-key"
    theme="light"
    position="bottom-right">
  </app-ai-support>
  
  <!-- With customer data -->
  <app-ai-support 
    widgetKey="your-widget-key"
    theme="light"
    position="bottom-right"
    [customerData]="currentCustomer">
  </app-ai-support>
</div>

<!-- app.component.ts -->
import { Component, OnInit } from '@angular/core';
import { CustomerData } from './ai-support.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  currentCustomer?: CustomerData;

  ngOnInit() {
    // Set customer data from your auth system
    this.currentCustomer = {
      customerId: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      metadata: {
        accountType: 'premium',
        lastPurchase: '2024-01-15',
        totalOrders: 5
      }
    };
  }
}`}
                      />
                    </TabsContent>

                    <TabsContent value="vue" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Vue.js Integration</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Vue component for easy AI support integration with composition API support.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Vue 3</Badge>
                          <Badge variant="outline">Composition API</Badge>
                        </div>
                      </div>
                      
                      <CodeBlock
                        id="vue-component"
                        title="AiSupportWidget.vue"
                        code={`<template>
  <div id="ai-support-chat"></div>
</template>

<script>
import { onMounted, onUnmounted, ref, inject } from 'vue'

export default {
  name: 'AiSupportWidget',
  props: {
    widgetKey: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: (value) => ['bottom-right', 'bottom-left'].includes(value)
    },
    customerData: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const script = ref(null)
    const authStore = inject('authStore', null)

    const initializeWidget = async () => {
      // Get customer data from prop or auth store
      let customer = props.customerData
      
      if (!customer && authStore?.currentUser) {
        customer = {
          customerId: authStore.currentUser.id,
          name: authStore.currentUser.name,
          email: authStore.currentUser.email,
          phone: authStore.currentUser.phone,
          metadata: {
            role: authStore.currentUser.role,
            createdAt: authStore.currentUser.createdAt,
            preferences: authStore.currentUser.preferences
          }
        }
      }

      // Configuration
      window.aiSupportConfig = {
        widgetKey: props.widgetKey,
        theme: props.theme,
        position: props.position
      }

      // Set customer data if available
      if (customer) {
        window.customerData = customer
      }

      // Load widget script
      script.value = document.createElement('script')
      script.value.src = \`\${import.meta.env.VITE_BASE_URL || window.location.origin}/api/widget/js?key=\${props.widgetKey}\`
      script.value.async = true
      document.body.appendChild(script.value)
    }

    onMounted(() => {
      initializeWidget()
    })

    onUnmounted(() => {
      if (script.value && document.body.contains(script.value)) {
        document.body.removeChild(script.value)
      }
    })

    return {}
  }
}
</script>`}
                      />
                      
                      <CodeBlock
                        id="vue-usage"
                        title="App.vue"
                        code={`<template>
  <div id="app">
    <!-- Your app content -->
    
    <!-- Basic usage -->
    <AiSupportWidget 
      widget-key="your-widget-key"
      theme="light"
      position="bottom-right"
    />
    
    <!-- With customer data -->
    <AiSupportWidget 
      widget-key="your-widget-key"
      theme="light"
      position="bottom-right"
      :customer-data="currentCustomer"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import AiSupportWidget from './components/AiSupportWidget.vue'

export default {
  name: 'App',
  components: {
    AiSupportWidget
  },
  setup() {
    const currentCustomer = ref(null)

    onMounted(() => {
      // Set customer data from your auth system
      currentCustomer.value = {
        customerId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        metadata: {
          accountType: 'premium',
          lastPurchase: '2024-01-15',
          totalOrders: 5,
          favoriteCategories: ['electronics', 'books']
        }
      }
    })

    return {
      currentCustomer
    }
  }
}
</script>`}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* Customization */}
            <section id="customization">
              <Card className="bg-white dark:bg-gray-800 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-orange-600" />
                    </div>
                    Customization Options
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Customize the appearance and behavior of your AI support widget
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-100 dark:bg-gray-800/30 border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Theme & Styling
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">theme: &apos;light&apos; | &apos;dark&apos; | &apos;auto&apos;</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Set widget color scheme</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">primaryColor: &apos;#your-color&apos;</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Custom brand color</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">borderRadius: &apos;8px&apos;</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Widget border radius</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-100 dark:bg-gray-800/30 border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Position & Layout
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">position: &apos;bottom-right&apos; | &apos;bottom-left&apos;</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Widget position on screen</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">zIndex: 9999</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Widget stack order</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">minimized: true</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Start in minimized state</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-100 dark:bg-gray-800/30 border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Behavior Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">autoOpen: false</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Auto-open widget on page load</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">showBranding: true</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Display &quot;Powered by&quot; text</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">soundEnabled: true</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Enable notification sounds</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-100 dark:bg-gray-800/30 border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">mobileFullscreen: true</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Fullscreen on mobile devices</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">hideOnMobile: false</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Hide widget on mobile</p>
                        </div>
                        <div className="space-y-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">mobileBreakpoint: 768</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Mobile breakpoint in pixels</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <CodeBlock
                    id="full-config"
                    title="Complete Configuration Example"
                    code={`window.aiSupportConfig = {
  // Required
  widgetKey: 'your-widget-key',
  
  // Appearance
  theme: 'auto', // 'light' | 'dark' | 'auto'
  primaryColor: '#3b82f6',
  borderRadius: '12px',
  
  // Position & Layout
  position: 'bottom-right', // 'bottom-right' | 'bottom-left'
  zIndex: 9999,
  minimized: false,
  
  // Behavior
  autoOpen: false,
  showBranding: true,
  soundEnabled: true,
  
  // Mobile
  mobileFullscreen: true,
  hideOnMobile: false,
  mobileBreakpoint: 768,
  
  // Custom Messages
  welcomeMessage: 'Hello! How can I help you today?',
  placeholderText: 'Type your message...',
  
  // User Info (optional)
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  
  // Custom CSS (optional)
  customCSS: \`
    .ai-widget-bubble {
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
  \`
};`}
                  />
                </CardContent>
              </Card>
            </section>

            {/* API Reference */}
            <section id="api">
              <Card className="bg-white dark:bg-gray-800 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-blue-600" />
                    </div>
                    API Reference
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    JavaScript API methods and events for advanced integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Widget Methods</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">window.AiSupport.open()</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Open the chat widget</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">window.AiSupport.close()</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Close the chat widget</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">window.AiSupport.toggle()</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Toggle widget open/close</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">window.AiSupport.sendMessage(text)</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Send a message programmatically</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Events</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">ai-widget-ready</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Widget loaded and ready</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">ai-widget-opened</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Widget was opened</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">ai-widget-closed</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Widget was closed</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">ai-message-sent</code>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">User sent a message</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CodeBlock
                    id="api-example"
                    title="API Usage Examples"
                    code={`// Listen for widget events
document.addEventListener('ai-widget-ready', function() {
  console.log('AI Support widget is ready!');
});

document.addEventListener('ai-widget-opened', function() {
  // Track widget opens in analytics
  gtag('event', 'widget_opened', {
    event_category: 'ai_support'
  });
});

document.addEventListener('ai-message-sent', function(event) {
  console.log('Message sent:', event.detail.message);
});

// Programmatically control the widget
function openSupportChat() {
  window.AiSupport.open();
}

function sendWelcomeMessage() {
  window.AiSupport.sendMessage('Hello, I need help with my order');
}

// Open widget when user clicks a custom button
document.getElementById('help-button').addEventListener('click', function() {
  window.AiSupport.open();
});

// Update customer data dynamically
function updateCustomerData(customerData) {
  window.AiSupport.setCustomer(customerData);
}

// Example: Update customer after login
function onUserLogin(user) {
  updateCustomerData({
    customerId: user.id,
    name: user.name,
    email: user.email,
    metadata: {
      accountType: user.subscription,
      loginTime: new Date().toISOString()
    }
  });
}`}
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Data API</h3>
                    <div className="space-y-4">
                      <Card className="bg-blue-50/50 border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-blue-900 dark:text-blue-300">Customer Data Schema</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CodeBlock
                            id="customer-schema"
                            title="Customer Data Interface"
                            code={`interface CustomerData {
  customerId: string;          // Required: Unique customer identifier
  name?: string;               // Optional: Customer's full name
  email?: string;              // Optional: Customer's email address
  phone?: string;              // Optional: Customer's phone number
  metadata?: {                 // Optional: Additional customer information
    [key: string]: any;        // Any custom data relevant to your business
    
    // Common examples:
    accountType?: string;      // e.g., 'premium', 'basic', 'enterprise'
    registeredAt?: string;     // ISO date string
    lastLoginAt?: string;      // ISO date string
    totalOrders?: number;      // Total number of orders
    totalSpent?: number;       // Total amount spent
    preferences?: object;      // User preferences
    tags?: string[];           // Customer tags/categories
    location?: {               // Customer location data
      city?: string;
      country?: string;
      timezone?: string;
    };
  };
}

// Example customer data objects:
const basicCustomer = {
  customerId: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};

const detailedCustomer = {
  customerId: 'premium-user-456',
  name: 'Jane Smith',
  email: 'jane@company.com',
  phone: '+1-555-0123',
  metadata: {
    accountType: 'premium',
    registeredAt: '2023-01-15T10:30:00Z',
    totalOrders: 12,
    totalSpent: 2449.99,
    preferences: {
      newsletter: true,
      smsNotifications: false
    },
    tags: ['vip', 'enterprise'],
    location: {
      city: 'San Francisco',
      country: 'USA',
      timezone: 'America/Los_Angeles'
    }
  }
};`}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50/50 border-green-200/50 dark:bg-green-900/20 dark:border-green-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-green-900 dark:text-green-300">Dynamic Customer Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CodeBlock
                            id="dynamic-updates"
                            title="Updating Customer Data"
                            code={`// Method 1: Update via window.customerData
function updateCustomerData(newData) {
  window.customerData = {
    ...window.customerData,
    ...newData
  };
  
  // Notify widget of the update
  if (window.AiSupport) {
    window.AiSupport.updateCustomer(window.customerData);
  }
}

// Method 2: Direct API call
function setCustomerData(customerData) {
  if (window.AiSupport) {
    window.AiSupport.setCustomer(customerData);
  }
}

// Example: Update after user action
function onPurchaseComplete(orderData) {
  updateCustomerData({
    metadata: {
      ...window.customerData?.metadata,
      lastPurchase: new Date().toISOString(),
      totalOrders: (window.customerData?.metadata?.totalOrders || 0) + 1,
      recentOrder: {
        id: orderData.id,
        total: orderData.total,
        items: orderData.items.length
      }
    }
  });
}

// Example: Clear customer data on logout
function onUserLogout() {
  window.customerData = null;
  if (window.AiSupport) {
    window.AiSupport.clearCustomer();
  }
}`}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <Card className="bg-white dark:bg-gray-800 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    Troubleshooting
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Common issues and solutions for widget integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Card className="bg-red-50/50 border-red-200/50 dark:bg-red-900/20 dark:border-red-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-red-900 dark:text-red-300">Widget Not Loading</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-red-800 dark:text-red-400">
                          <strong>Symptoms:</strong> Widget doesn&apos;t appear on the page
                        </p>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                          <li>• Check if widget key is correct and valid</li>
                          <li>• Verify script URL is accessible</li>
                          <li>• Check browser console for JavaScript errors</li>
                          <li>• Ensure div with id=&quot;ai-support-chat&quot; exists</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-amber-900 dark:text-amber-300">Styling Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          <strong>Symptoms:</strong> Widget appears but styling is broken
                        </p>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 ml-4">
                          <li>• Check for CSS conflicts with your site styles</li>
                          <li>• Verify z-index is high enough (default: 9999)</li>
                          <li>• Check if Content Security Policy allows widget resources</li>
                          <li>• Try setting a custom container position</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-900 dark:text-blue-300">Mobile Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          <strong>Symptoms:</strong> Widget doesn&apos;t work properly on mobile devices
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                          <li>• Enable mobileFullscreen for better mobile experience</li>
                          <li>• Check viewport meta tag is properly set</li>
                          <li>• Verify touch events are not being blocked</li>
                          <li>• Test on actual devices, not just browser dev tools</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <CodeBlock
                    id="debug-code"
                    title="Debug Script"
                    code={`// Add this to your page to debug widget issues
window.aiSupportDebug = true;

// Check if widget is loaded
setTimeout(function() {
  if (typeof window.AiSupport !== 'undefined') {
    console.log('✅ AI Support widget loaded successfully');
    console.log('Widget version:', window.AiSupport.version);
    console.log('Configuration:', window.aiSupportConfig);
  } else {
    console.error('❌ AI Support widget failed to load');
    console.log('Check script URL and widget key');
  }
}, 3000);

// Monitor for common issues
if (!document.getElementById('ai-support-chat')) {
  console.warn('⚠️ Widget container div not found');
}

if (!window.aiSupportConfig || !window.aiSupportConfig.widgetKey) {
  console.error('❌ Widget configuration missing or invalid');
}`}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Support & FAQ */}
            <section id="support">
              <Card className="bg-gradient-to-r from-card to-card/50 border">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    Support & FAQ
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Get help and find answers to frequently asked questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h4>
                      <div className="space-y-3">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            Can I customize the widget appearance?
                          </summary>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                            Yes! You can customize colors, position, theme, and much more through the configuration options.
                          </p>
                        </details>
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            Does the widget work on mobile devices?
                          </summary>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                            Absolutely! The widget is fully responsive and includes special mobile optimizations.
                          </p>
                        </details>
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            How do I track widget usage?
                          </summary>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                            Use the JavaScript events (ai-widget-opened, ai-message-sent) to integrate with your analytics platform.
                          </p>
                        </details>
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            Can I use multiple widgets on one site?
                          </summary>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-4">
                            Each widget key is unique to one instance. Contact support for multi-widget scenarios.
                          </p>
                        </details>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Need More Help?</h4>
                      <div className="space-y-3">
                        <Card className="bg-gray-100 dark:bg-gray-800/30 border cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <ExternalLink className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Email Support</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">support@yourcompany.com</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gray-100 dark:bg-gray-800/30 border cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Live Chat</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gray-100 dark:bg-gray-800/30 border cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Knowledge Base</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Self-service articles</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
