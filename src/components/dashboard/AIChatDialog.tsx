"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bot, Send, User, Loader2, MessageCircle, Trash2, Copy, Edit, RefreshCw } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/hooks';
import { addAlert } from '@/lib/store/alertSlice';
import { incrementAiRepliesCount } from '@/lib/store/profileSlice';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isEditing?: boolean;
  editedContent?: string;
}

interface AIChatDialogProps {
  companyName?: string;
  userName?: string;
}

// Chat history utilities
const CHAT_HISTORY_KEY = 'ai-chat-history';
const MAX_HISTORY_DAYS = 7; // Keep history for 7 days

const saveChatHistory = (messages: Message[]) => {
  try {
    const historyData = {
      messages,
      timestamp: Date.now(),
      version: 1 // For future compatibility
    };
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.warn('Failed to save chat history:', error);
  }
};

const loadChatHistory = (): Message[] => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];

    const historyData = JSON.parse(stored);
    
    // Check if history is too old
    const daysSinceStored = (Date.now() - historyData.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceStored > MAX_HISTORY_DAYS) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      return [];
    }

    return Array.isArray(historyData.messages) ? historyData.messages : [];
  } catch (error) {
    console.warn('Failed to load chat history:', error);
    return [];
  }
};

const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.warn('Failed to clear chat history:', error);
  }
};

export function AIChatDialog({ companyName = 'our company', userName = 'there' }: AIChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = loadChatHistory();
    if (savedHistory.length > 0) {
      setMessages(savedHistory);
      setHasInitialized(true);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when dialog opens (only if no saved history)
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: `Hello ${userName}! I'm your AI customer support assistant for ${companyName}. I'm here to help you with any questions you might have. How can I assist you today?`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, companyName, userName]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      content: currentMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const result = await response.json();

      if (result.success) {
        const aiMessage: Message = {
          id: 'ai-' + Date.now(),
          content: result.data.message,
          role: 'assistant',
          timestamp: result.data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Increment AI replies count in Redux
        dispatch(incrementAiRepliesCount());
      } else {
        throw new Error(result.message || 'Failed to get AI response');
      }
    } catch (error) {
      let errorTitle = 'Chat Error';
      let errorMessage = 'Failed to send message';
      let chatErrorMessage = 'Sorry, I encountered an error. Please try again or contact support if the issue persists.';

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error types
        if (error.message.includes('overloaded') || error.message.includes('high traffic')) {
          errorTitle = 'Service Busy';
          errorMessage = 'The AI service is currently busy. Please try again in a few moments.';
          chatErrorMessage = '🔄 I\'m currently experiencing high demand. Please try sending your message again in a few moments.';
        } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          errorTitle = 'Rate Limited';
          errorMessage = 'Please wait a moment before sending another message.';
          chatErrorMessage = '⏱️ Please wait a moment before sending another message.';
        } else if (error.message.includes('configuration')) {
          errorTitle = 'Configuration Error';
          errorMessage = 'AI service configuration issue. Please contact support.';
          chatErrorMessage = '⚙️ There\'s a configuration issue with the AI service. Please contact support for assistance.';
        }
      }

      dispatch(addAlert({
        type: 'error',
        title: errorTitle,
        message: errorMessage
      }));
      
      // Add contextual error message to chat
      const errorChatMessage: Message = {
        id: 'error-' + Date.now(),
        content: chatErrorMessage,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message content to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      dispatch(addAlert({
        type: 'success',
        title: 'Copied!',
        message: 'Message copied to clipboard'
      }));
    } catch {
      dispatch(addAlert({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy message to clipboard'
      }));
    }
  };

  // Start editing a message
  const startEdit = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isEditing: true, editedContent: msg.content }
        : { ...msg, isEditing: false }
    ));
  };

  // Save edited message
  const saveEdit = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.editedContent || msg.content, isEditing: false, editedContent: undefined }
        : msg
    ));
    dispatch(addAlert({
      type: 'success',
      title: 'Message Updated',
      message: 'Message has been updated successfully'
    }));
  };

  // Cancel editing
  const cancelEdit = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isEditing: false, editedContent: undefined }
        : msg
    ));
  };

  // Update edited content
  const updateEditedContent = (messageId: string, content: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, editedContent: content }
        : msg
    ));
  };

  // Regenerate AI response for the same question
  const regenerateResponse = async (messageId: string) => {
    // Find the message and the previous user message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return;

    const userMessage = messages[userMessageIndex];
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the existing AI message with new response
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: result.data.message, timestamp: result.data.timestamp }
            : msg
        ));
        
        // Increment AI replies count in Redux
        dispatch(incrementAiRepliesCount());
        
        dispatch(addAlert({
          type: 'success',
          title: 'Response Regenerated',
          message: 'AI has generated a new response'
        }));
      } else {
        throw new Error(result.message || 'Failed to regenerate response');
      }
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Regeneration Failed',
        message: error instanceof Error ? error.message : 'Failed to regenerate response'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    // Don't reset chat state - keep history persistent
    setCurrentMessage(''); // Only clear current input
  };

  const clearChat = () => {
    setMessages([]);
    setHasInitialized(false);
    clearChatHistory();
    
    // Add welcome message again
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      content: `Hello ${userName}! I'm your AI customer support assistant for ${companyName}. I'm here to help you with any questions you might have. How can I assist you today?`,
      role: 'assistant',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setHasInitialized(true);

    dispatch(addAlert({
      type: 'success',
      title: 'Chat Cleared',
      message: 'Chat history has been cleared successfully'
    }));
  };

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Button 
        className="w-full" 
        size="sm"
        onClick={handleButtonClick}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Try AI Assistant
      </Button>

      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary text-white" />
              <div>
                <DialogTitle>AI Customer Support Assistant</DialogTitle>
                <DialogDescription>
                  Chat with our AI assistant for instant help and support
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="flex items-center gap-1 text-xs text-white mr-10"
              title="Clear chat history"
            >
              <Trash2 className="h-3 w-3" />
              Clear Chat
            </Button>
          </div>
        </DialogHeader>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[400px] max-h-[500px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-primary bg-white dark:bg-gray-700 rounded-full p-1" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white dark:bg-gray-700 border text-gray-900 dark:text-gray-100'
                }`}
              >
                {message.isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={message.editedContent || message.content}
                      onChange={(e) => updateEditedContent(message.id, e.target.value)}
                      className="text-sm min-h-[60px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => saveEdit(message.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => cancelEdit(message.id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap text-white">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70 text-white">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      {message.role === 'assistant' && (
                        <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => copyMessage(message.content)}
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => startEdit(message.id)}
                            title="Edit message"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => regenerateResponse(message.id)}
                            disabled={isLoading}
                            title="Regenerate response"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-white text-primary-foreground bg-primary rounded-full p-1" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-primary bg-white dark:bg-gray-700 rounded-full p-1" />
              </div>
              <div className="bg-white dark:bg-gray-700 border p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={sendMessage} className="flex gap-2 mt-4">
          <Input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            maxLength={1000}
            className="flex-1 text-white"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !currentMessage.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentMessage.length}/1000 characters
          </p>
          <p className="text-xs text-gray-50">
            {messages.length > 1 ? `${messages.length} messages • History saved` : 'New chat'}
          </p>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
