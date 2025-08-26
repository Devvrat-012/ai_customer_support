import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const widgetKey = searchParams.get('key');
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Widget JavaScript code
  const widgetScript = `
(function() {
  'use strict';
  
  // Configuration
  const WIDGET_CONFIG = {
    apiUrl: '${apiUrl}',
    widgetKey: '${widgetKey || 'demo-key'}',
    customerId: null, // Will be set via setCustomerId function
    customerData: {}, // Additional customer data
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px'
  };

  // Prevent multiple widget instances
  if (window.aiChatWidget) {
    console.warn('AI Chat Widget is already initialized');
    // Clear existing widget to allow reinitialization with new key
    if (window.aiChatWidget.widget) {
      window.aiChatWidget.widget.remove();
    }
    window.aiChatWidget = null;
  }

  class AIChatWidget {
    constructor(config) {
      this.config = config;
      this.isOpen = false;
      this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      this.messages = [];
      this.isLoading = false;
      
      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.bindEvents();
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = \`
        .ai-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .ai-chat-bubble {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, \${this.config.primaryColor}, \${this.config.accentColor});
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .ai-chat-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .ai-chat-bubble svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        .ai-chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: \${this.config.backgroundColor};
          border-radius: \${this.config.borderRadius};
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        
        .ai-chat-window.open {
          display: flex;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ai-chat-header {
          background: linear-gradient(135deg, \${this.config.primaryColor}, \${this.config.accentColor});
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .ai-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .ai-chat-header p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }
        
        .ai-chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .ai-chat-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #F9FAFB;
        }
        
        .ai-chat-message {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .ai-chat-message.user {
          flex-direction: row-reverse;
        }
        
        .ai-chat-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .ai-chat-message.user .ai-chat-message-content {
          background: \${this.config.primaryColor};
          color: white;
        }
        
        .ai-chat-message.bot .ai-chat-message-content {
          background: white;
          color: \${this.config.textColor};
          border: 1px solid #E5E7EB;
        }
        
        .ai-chat-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .ai-chat-avatar.user {
          background: #6B7280;
          color: white;
        }
        
        .ai-chat-avatar.bot {
          background: \${this.config.primaryColor};
          color: white;
        }
        
        .ai-chat-input-area {
          padding: 16px;
          border-top: 1px solid #E5E7EB;
          background: white;
        }
        
        .ai-chat-input-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .ai-chat-input {
          flex: 1;
          border: 1px solid #D1D5DB;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .ai-chat-input:focus {
          border-color: \${this.config.primaryColor};
        }
        
        .ai-chat-send {
          background: \${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .ai-chat-send:hover:not(:disabled) {
          background: \${this.config.accentColor};
          transform: scale(1.05);
        }
        
        .ai-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .ai-chat-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 18px;
          border: 1px solid #E5E7EB;
          max-width: 80px;
        }
        
        .ai-chat-typing-dot {
          width: 8px;
          height: 8px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .ai-chat-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .ai-chat-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @media (max-width: 480px) {
          .ai-chat-window {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 80px;
            right: 20px;
          }
        }
      \`;
      document.head.appendChild(style);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.className = 'ai-chat-widget';
      widget.innerHTML = \`
        <div class="ai-chat-bubble" id="ai-chat-bubble">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 4-4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        
        <div class="ai-chat-window" id="ai-chat-window">
          <div class="ai-chat-header">
            <div>
              <h3>Chat Support</h3>
              <p>We're here to help!</p>
            </div>
            <button class="ai-chat-close" id="ai-chat-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="ai-chat-messages" id="ai-chat-messages">
            <div class="ai-chat-message bot">
              <div class="ai-chat-avatar bot">AI</div>
              <div class="ai-chat-message-content">
                Hello! 👋 How can I help you today?
              </div>
            </div>
          </div>
          
          <div class="ai-chat-input-area">
            <div class="ai-chat-input-container">
              <input 
                type="text" 
                class="ai-chat-input" 
                id="ai-chat-input" 
                placeholder="Type your message..."
                maxlength="500"
              />
              <button class="ai-chat-send" id="ai-chat-send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      \`;
      
      document.body.appendChild(widget);
      this.widget = widget;
    }

    bindEvents() {
      const bubble = document.getElementById('ai-chat-bubble');
      const closeBtn = document.getElementById('ai-chat-close');
      const input = document.getElementById('ai-chat-input');
      const sendBtn = document.getElementById('ai-chat-send');

      bubble.addEventListener('click', () => this.toggleChat());
      closeBtn.addEventListener('click', () => this.closeChat());
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    toggleChat() {
      const window = document.getElementById('ai-chat-window');
      if (this.isOpen) {
        this.closeChat();
      } else {
        window.classList.add('open');
        this.isOpen = true;
        document.getElementById('ai-chat-input').focus();
      }
    }

    closeChat() {
      const window = document.getElementById('ai-chat-window');
      window.classList.remove('open');
      this.isOpen = false;
    }

    async sendMessage() {
      const input = document.getElementById('ai-chat-input');
      const message = input.value.trim();
      
      if (!message || this.isLoading) return;
      
      this.isLoading = true;
      input.value = '';
      
      // Add user message
      this.addMessage(message, 'user');
      
      // Show typing indicator
      this.showTyping();
      
      try {
        const response = await fetch(\`\${this.config.apiUrl}/api/widget/chat\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Widget-Key': this.config.widgetKey,
          },
          body: JSON.stringify({
            message: message,
            sessionId: this.sessionId,
            customerId: this.config.customerId,
            customerData: this.config.customerData,
          }),
        });
        
        const data = await response.json();
        
        this.hideTyping();
        
        if (data.success) {
          this.addMessage(data.data.message, 'bot');
        } else {
          this.addMessage('Sorry, I encountered an error. Please try again or contact support.', 'bot');
        }
      } catch (error) {
        console.error('Chat error:', error);
        this.hideTyping();
        this.addMessage('Sorry, I am unable to respond right now. Please try again later.', 'bot');
      }
      
      this.isLoading = false;
    }

    // Customer management methods
    setCustomerId(customerId) {
      this.config.customerId = customerId;
    }

    setCustomerData(customerData) {
      this.config.customerData = { ...this.config.customerData, ...customerData };
    }

    getCustomerId() {
      return this.config.customerId;
    }

    getCustomerData() {
      return this.config.customerData;
    }

    addMessage(content, sender) {
      const messagesContainer = document.getElementById('ai-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = \`ai-chat-message \${sender}\`;
      
      const avatar = sender === 'user' ? 'You' : 'AI';
      const avatarClass = sender === 'user' ? 'user' : 'bot';
      
      messageDiv.innerHTML = \`
        <div class="ai-chat-avatar \${avatarClass}">\${avatar === 'You' ? '👤' : '🤖'}</div>
        <div class="ai-chat-message-content">\${this.escapeHtml(content)}</div>
      \`;
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      this.messages.push({ content, sender, timestamp: new Date() });
    }

    showTyping() {
      const messagesContainer = document.getElementById('ai-chat-messages');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-chat-message bot';
      typingDiv.id = 'ai-chat-typing-indicator';
      typingDiv.innerHTML = \`
        <div class="ai-chat-avatar bot">🤖</div>
        <div class="ai-chat-typing">
          <div class="ai-chat-typing-dot"></div>
          <div class="ai-chat-typing-dot"></div>
          <div class="ai-chat-typing-dot"></div>
        </div>
      \`;
      
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
      const typingIndicator = document.getElementById('ai-chat-typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize widget when DOM is ready
  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.aiChatWidget = new AIChatWidget(WIDGET_CONFIG);
      });
    } else {
      window.aiChatWidget = new AIChatWidget(WIDGET_CONFIG);
    }
  }

  // Global methods for customer management
  window.setAIChatCustomer = function(customerId, customerData = {}) {
    if (window.aiChatWidget) {
      window.aiChatWidget.setCustomerId(customerId);
      window.aiChatWidget.setCustomerData(customerData);
    } else {
      // If widget not ready, store for later
      window._aiChatPendingCustomer = { customerId, customerData };
    }
  };

  window.getAIChatCustomer = function() {
    if (window.aiChatWidget) {
      return {
        customerId: window.aiChatWidget.getCustomerId(),
        customerData: window.aiChatWidget.getCustomerData()
      };
    }
    return null;
  };

  // Apply pending customer data if it exists
  function applyPendingCustomerData() {
    if (window._aiChatPendingCustomer && window.aiChatWidget) {
      const { customerId, customerData } = window._aiChatPendingCustomer;
      window.aiChatWidget.setCustomerId(customerId);
      window.aiChatWidget.setCustomerData(customerData);
      delete window._aiChatPendingCustomer;
    }
  }

  // Enhanced initialization with customer data support
  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.aiChatWidget = new AIChatWidget(WIDGET_CONFIG);
        applyPendingCustomerData();
      });
    } else {
      window.aiChatWidget = new AIChatWidget(WIDGET_CONFIG);
      applyPendingCustomerData();
    }
  }

  initWidget();
})();
`;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
