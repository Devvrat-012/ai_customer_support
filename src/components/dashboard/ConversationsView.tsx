"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  MessageSquare,
  User,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { 
  fetchConversations,
  fetchConversationMessages,
  updateConversationStatus,
  type Customer,
  type CustomerConversation
} from '@/lib/store/customersSlice';
import { addAlert } from '@/lib/store/alertSlice';

interface ConversationsViewProps {
  customer?: Customer;
  onBack?: () => void;
}

export function ConversationsView({ customer, onBack }: ConversationsViewProps) {
  const dispatch = useAppDispatch();
  const { 
    conversations, 
    selectedConversation,
    loading, 
    error
  } = useAppSelector((state) => state.customers);

  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (customer) {
      dispatch(fetchConversations({ 
        customerId: customer.id,
        page: 1,
        limit: 50,
        filters: { status: statusFilter !== 'ALL' ? statusFilter as 'ACTIVE' | 'RESOLVED' | 'CLOSED' : undefined }
      }));
    }
  }, [dispatch, customer, statusFilter]);

  useEffect(() => {
    if (error.conversations) {
      dispatch(addAlert({
        type: 'error',
        title: 'Error',
        message: error.conversations
      }));
    }
  }, [error.conversations, dispatch]);

  const handleConversationClick = (conversation: CustomerConversation) => {
    dispatch(fetchConversationMessages(conversation.id));
  };

  const handleStatusUpdate = async (conversationId: string, status: string) => {
    try {
      await dispatch(updateConversationStatus({ conversationId, status })).unwrap();
      dispatch(addAlert({
        type: 'success',
        title: 'Success',
        message: 'Conversation status updated successfully'
      }));
    } catch {
      dispatch(addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update conversation status'
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        variant: 'default' as const, 
        label: 'Active', 
        icon: Clock,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      },
      RESOLVED: { 
        variant: 'secondary' as const, 
        label: 'Resolved', 
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      },
      CLOSED: { 
        variant: 'outline' as const, 
        label: 'Closed', 
        icon: XCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!customer) {
    return (
  <Card className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Customer Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a customer to view their conversations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
  <Card className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 shadow-md">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              {customer.customerName || customer.customerId}&apos;s Conversations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Customer ID: {customer.customerId} • {customer.sessionCount} total sessions
            </p>
          </div>
        </div>

        {/* Customer Info */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-lg backdrop-blur-sm">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</div>
            <div className="text-gray-900 dark:text-gray-100">{customer.customerName || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</div>
            <div className="text-gray-900 dark:text-gray-100">{customer.customerEmail || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</div>
            <div className="text-gray-900 dark:text-gray-100">{customer.customerPhone || 'Not provided'}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
  <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Conversations</h3>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md text-sm hover:border-blue-500 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {loading.conversations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/50 ${
                    selectedConversation?.id === conversation.id 
                      ? 'ring-2 ring-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md' 
                      : 'hover:border-primary/30'
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-1.5 rounded-lg">
                        <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-foreground">Session: {conversation.sessionId}</span>
                    </div>
                    {getStatusBadge(conversation.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
                      {conversation.messageCount || 0} messages
                    </span>
                    <span>{formatDate(conversation.updatedAt)}</span>
                  </div>

                  {conversation.lastMessage && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {conversation.lastMessage.sender === 'CUSTOMER' ? (
                          <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-1 rounded-full">
                            <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-1 rounded-full">
                            <Image 
                              src="/Makora.png" 
                              alt="Makora Logo" 
                              width={12} 
                              height={12} 
                              className="rounded-full"
                            />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {conversation.lastMessage.sender === 'CUSTOMER' ? 'Customer' : 'AI'}
                        </span>
                      </div>
                      <p className="truncate text-gray-600 dark:text-gray-400">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex gap-2 mt-3">
                    {conversation.status === 'ACTIVE' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(conversation.id, 'RESOLVED');
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(conversation.id, 'CLOSED');
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Close
                        </Button>
                      </>
                    )}
                    {conversation.status === 'RESOLVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(conversation.id, 'CLOSED');
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    )}
                    {conversation.status === 'CLOSED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(conversation.id, 'ACTIVE');
                        }}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No conversations found
                  </h3>
                  <p className="text-muted-foreground">
                    This customer hasn&apos;t started any conversations yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Conversation Messages */}
  <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Messages</h3>
          </div>
          
          {selectedConversation ? (
            <div className="space-y-4">
              {loading.messages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender === 'CUSTOMER'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-800/30 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.sender === 'CUSTOMER' ? (
                            <div className="bg-white/20 p-1 rounded-full">
                              <User className="h-3 w-3" />
                            </div>
                          ) : (
                            <div className="bg-primary/20 p-1 rounded-full">
                              <Image 
                                src="/Makora.png" 
                                alt="Makora Logo" 
                                width={12} 
                                height={12} 
                                className="rounded-full"
                              />
                            </div>
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'CUSTOMER' ? 'Customer' : 'AI'}
                          </span>
                          <span className="text-xs opacity-75 text-gray-600 dark:text-gray-400">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.aiModel && (
                          <div className="text-xs opacity-75 mt-2 bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
                            Model: {message.aiModel}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a conversation from the list to view messages.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
