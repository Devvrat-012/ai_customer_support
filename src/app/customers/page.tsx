"use client";

import { useState } from 'react';
import { CustomersTable } from '@/components/dashboard/CustomersTable';
import { ConversationsView } from '@/components/dashboard/ConversationsView';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';
import { type Customer } from '@/lib/store/customersSlice';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentView, setCurrentView] = useState<'table' | 'conversations'>('table');

  const { customers, conversations } = useAppSelector((state) => state.customers);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('conversations');
  };

  const handleBackToTable = () => {
    setSelectedCustomer(null);
    setCurrentView('table');
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const activeConversations = conversations.filter(conv => conv.status === 'ACTIVE').length;
  const totalSessions = customers.reduce((sum, customer: { sessionCount: number }) => sum + customer.sessionCount, 0);
  const recentCustomers = customers.filter((customer: { lastSeenAt?: string | null }) => {
    const lastSeen = customer.lastSeenAt ? new Date(customer.lastSeenAt) : null;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastSeen && lastSeen > oneDayAgo;
  }).length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentView === 'table' ? 'Customer Conversations' : 'Conversation Details'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentView === 'table'
                ? 'Monitor and manage all customer interactions from your widget'
                : `Viewing conversations for ${selectedCustomer?.customerName || selectedCustomer?.customerId}`
              }
            </p>
          </div>
          {currentView === 'conversations' && (
            <Button variant="outline" onClick={handleBackToTable}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          )}
        </div>

        {/* Stats Cards - Only show on table view */}
        {currentView === 'table' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCustomers}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Conversations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeConversations}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalSessions}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Recent (24h)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {recentCustomers}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {currentView === 'table' ? (
          <CustomersTable
            onCustomerClick={handleCustomerClick}
            onViewConversations={handleCustomerClick}
          />
        ) : (
          <ConversationsView
            customer={selectedCustomer || undefined}
            onBack={handleBackToTable}
          />
        )}

        {/* Widget Integration Guide - Only show on table view when no customers */}
        {currentView === 'table' && totalCustomers === 0 && (
          <Card className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="p-4 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start Tracking Your Customers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                To track individual customers and their conversations, you can set customer IDs in your widget code.
                This allows you to see detailed analytics and conversation history for each customer.
              </p>

              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-6 text-left max-w-4xl mx-auto border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold mb-3 text-foreground">How to add customer tracking:</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      1. Add the widget script to your website (if not already done):
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                      {`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/widget/js?key=YOUR_WIDGET_KEY"></script>`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      2. Set customer information when available (e.g., after user login):
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                      {`<script>
// Set customer ID and optional data
setAIChatCustomer('customer-123', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});
</script>`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      3. The customer ID can be any unique identifier from your system (user ID, email, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View Widget Setup Guide
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
