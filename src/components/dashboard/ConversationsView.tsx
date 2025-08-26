"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  MessageSquare,
  User,
  Bot,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
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
      ACTIVE: { variant: 'default' as const, label: 'Active', icon: Clock },
      RESOLVED: { variant: 'secondary' as const, label: 'Resolved', icon: CheckCircle },
      CLOSED: { variant: 'outline' as const, label: 'Closed', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
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
      <Card className="p-8">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Customer Selected
          </h3>
          <p className="text-gray-500">
            Select a customer to view their conversations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {customer.customerName || customer.customerId}&apos;s Conversations
            </h2>
            <p className="text-gray-500">
              Customer ID: {customer.customerId} • {customer.sessionCount} total sessions
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div>{customer.customerName || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div>{customer.customerEmail || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Phone</div>
            <div>{customer.customerPhone || 'Not provided'}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Conversations</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {loading.conversations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedConversation?.id === conversation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Session: {conversation.sessionId}</span>
                    </div>
                    {getStatusBadge(conversation.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{conversation.messageCount || 0} messages</span>
                    <span>{formatDate(conversation.updatedAt)}</span>
                  </div>

                  {conversation.lastMessage && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {conversation.lastMessage.sender === 'CUSTOMER' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="font-medium">
                          {conversation.lastMessage.sender === 'CUSTOMER' ? 'Customer' : 'AI'}
                        </span>
                      </div>
                      <p className="truncate">
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
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No conversations found
                  </h3>
                  <p className="text-gray-500">
                    This customer hasn&apos;t started any conversations yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Conversation Messages */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Messages</h3>
          
          {selectedConversation ? (
            <div className="space-y-4">
              {loading.messages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'CUSTOMER'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'CUSTOMER' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'CUSTOMER' ? 'Customer' : 'AI'}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.aiModel && (
                          <div className="text-xs opacity-75 mt-1">
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
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to view messages.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
