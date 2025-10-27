import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { prisma } from '@/lib/db';
import { generateRAGResponse, shouldUseRAG } from '@/lib/ai/rag-chat';
import { searchKnowledgeBase } from '@/lib/vector/search';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for API calls
const retryApiCall = async (apiCall: () => Promise<GenerateContentResult>, retries = MAX_RETRIES): Promise<GenerateContentResult> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isOverloaded = errorMessage.includes('overloaded') || errorMessage.includes('503');
      const isRateLimited = errorMessage.includes('429') || errorMessage.includes('rate limit');
      
      if ((isOverloaded || isRateLimited) && attempt < retries) {
        console.log(`API call failed (attempt ${attempt}/${retries}), retrying in ${RETRY_DELAY * attempt}ms...`);
        await sleep(RETRY_DELAY * attempt); // Exponential backoff
        continue;
      }
      
      // If not a retryable error or final attempt, throw the error
      throw error;
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Retry attempts exhausted');
};

// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Handle CORS for the widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Widget-Key',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    // Get widget key from headers or body
    const widgetKey = request.headers.get('X-Widget-Key');
    
    // Parse request body
    const body = await request.json();
    const { message, sessionId, customerId, customerData } = body;
    
    if (!widgetKey) {
      throw new ValidationError('Widget key is required');
    }

    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required and must be a string');
    }

    console.log('Widget chat - Looking for widget key:', widgetKey); // Debug log

    // Find the company by widget key
    const user = await prisma.user.findFirst({
      where: { 
        widgetKey: widgetKey 
      },
      include: {
        _count: {
          select: { 
            aiReplies: true,
            knowledgeBases: true 
          }
        },
        knowledgeBases: {
          select: {
            id: true,
            name: true,
            createdAt: true
          },
          take: 1 // Just to check if any exist
        }
      }
    });

    console.log('Widget chat - Found user:', user ? 'Yes' : 'No', user?.id); // Debug log
    console.log('Widget chat - User details:', {
      userId: user?.id,
      widgetKey: user?.widgetKey,
      companyName: user?.companyName,
      knowledgeBaseCount: user?._count?.knowledgeBases,
      knowledgeBases: user?.knowledgeBases
    }); // Debug log

    if (!user) {
      console.log('Widget chat - No user found for key:', widgetKey); // Debug log
      throw new NotFoundError('Invalid widget key');
    }

    // Check if user has knowledge base data (new requirement)
    const hasKnowledgeBase = user._count.knowledgeBases > 0;
    console.log('Widget chat - Knowledge base check:', hasKnowledgeBase, 'KB count:', user._count.knowledgeBases); // Debug log
    if (!hasKnowledgeBase) {
      console.log('Widget chat - No knowledge base found, returning error'); // Debug log
      return NextResponse.json({
        success: false,
        error: 'Knowledge base not configured. Please upload knowledge base content before using the widget.',
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Handle customer tracking if customerId is provided
    let customer = null;
    let conversation = null;
    
    if (customerId) {
      try {
        // Find or create customer
        customer = await prisma.customer.upsert({
          where: {
            customerId_companyUserId: {
              customerId: customerId,
              companyUserId: user.id,
            },
          },
          update: {
            lastSeenAt: new Date(),
            sessionCount: {
              increment: 1,
            },
            // Update customer data if provided
            ...(customerData?.name && { customerName: customerData.name }),
            ...(customerData?.email && { customerEmail: customerData.email }),
            ...(customerData?.phone && { customerPhone: customerData.phone }),
            ...(customerData && { customerMeta: customerData }),
          },
          create: {
            customerId: customerId,
            companyUserId: user.id,
            customerName: customerData?.name || null,
            customerEmail: customerData?.email || null,
            customerPhone: customerData?.phone || null,
            customerMeta: customerData || null,
            sessionCount: 1,
            lastSeenAt: new Date(),
          },
        });

        // Find or create conversation for this session
        conversation = await prisma.customerConversation.upsert({
          where: {
            customerId_sessionId: {
              customerId: customer.id,
              sessionId: sessionId || `session_${Date.now()}`,
            },
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            customerId: customer.id,
            sessionId: sessionId || `session_${Date.now()}`,
            status: 'ACTIVE',
          },
        });
      } catch (error) {
        console.error('Customer tracking error:', error);
        // Continue without customer tracking if there's an error
      }
    }

    // Generate AI response using RAG if suitable, otherwise fallback to regular
    const shouldEnableRAG = shouldUseRAG(message);
    let aiResponse: string;
    let knowledgeInfo: any = null;

    if (shouldEnableRAG) {
      try {
        // Use RAG-enhanced response for widget
        const ragResult = await generateRAGResponse(
          user.id,
          message,
          {
            companyName: user.companyName || undefined,
            companyInfo: user.companyInfo || undefined,
          },
          {
            maxContextChunks: 3, // Fewer chunks for widget to keep responses concise
            minSimilarity: 0.75, // Higher threshold for widget
            includeKnowledgeInfo: false, // Don't mention knowledge sources in widget
            fallbackToRegular: true,
          }
        );

        aiResponse = ragResult.response;
        knowledgeInfo = {
          knowledgeUsed: ragResult.knowledgeUsed,
          totalChunks: ragResult.totalKnowledgeChunks,
        };

      } catch (ragError) {
        console.error('Widget RAG generation failed, falling back to regular chat:', ragError);
        aiResponse = await generateAIResponse(message, user);
        knowledgeInfo = {
          knowledgeUsed: false,
          fallbackUsed: true,
        };
      }
    } else {
      // Use regular response for simple queries
      aiResponse = await generateAIResponse(message, user);
      knowledgeInfo = {
        knowledgeUsed: false,
        ragSkipped: true,
      };
    }

    // Track the AI reply for billing (existing functionality)
    await prisma.aiReply.create({
      data: {
        userId: user.id,
        question: message,
        response: aiResponse,
        model: knowledgeInfo?.knowledgeUsed ? 'gemini-1.5-flash-widget-rag' : 'gemini-1.5-flash-widget',
        tokensUsed: Math.floor(message.length / 4) + Math.floor(aiResponse.length / 4), // Rough estimation
      }
    });

    // Track customer messages if customer tracking is enabled
    if (conversation) {
      try {
        // Save customer message
        await prisma.customerMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'CUSTOMER',
            content: message,
            messageType: 'TEXT',
          },
        });

        // Save AI response
        await prisma.customerMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'AI',
            content: aiResponse,
            messageType: 'TEXT',
            aiModel: knowledgeInfo?.knowledgeUsed ? 'gemini-1.5-flash-widget-rag' : 'gemini-1.5-flash-widget',
            tokensUsed: Math.floor(message.length / 4) + Math.floor(aiResponse.length / 4),
          },
        });
      } catch (error) {
        console.error('Customer message tracking error:', error);
        // Continue even if message tracking fails
      }
    }

    // Log the conversation (optional - you might want to store widget conversations)
    console.log(`Widget conversation for ${user.companyName}: Q: ${message} | A: ${aiResponse.substring(0, 100)}...`);

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        companyName: user.companyName,
        ragEnabled: shouldEnableRAG,
        knowledgeUsed: knowledgeInfo?.knowledgeUsed || false,
        ...(customer && { 
          customerId: customer.customerId,
          customerTrackingEnabled: true 
        }),
      }
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Widget API error:', error);

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { 
        status: error instanceof NotFoundError ? 404 : 400,
        headers: corsHeaders 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.',
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// Type for user data with knowledge base
interface UserData {
  id: string;
  companyName?: string | null;
  knowledgeBases?: Array<{
    id: string;
    name: string;
    createdAt: Date;
  }>;
}

// Generate AI response using knowledge base and Gemini
async function generateAIResponse(message: string, user: UserData): Promise<string> {
  try {
    // Search knowledge base for relevant information
    let knowledgeContext = '';
    
    try {
      // Use the knowledge base search function directly
      const searchResult = await searchKnowledgeBase(message, user.id, {
        limit: 3,
        minSimilarity: 0.6 // Slightly lower threshold for widget responses
      });
      
      if (searchResult && searchResult.length > 0) {
        knowledgeContext = searchResult
          .map((result: any) => result.content)
          .join('\n\n');
      }
    } catch (error) {
      console.warn('Failed to search knowledge base:', error);
      knowledgeContext = 'Knowledge base search temporarily unavailable.';
    }

    const companyName = user.companyName || 'the company';
    
    // Prepare context based on available knowledge
    const contextInfo = knowledgeContext 
      ? `Relevant Information from Knowledge Base:\n${knowledgeContext}`
      : 'No specific information found in the knowledge base for this query.';

    // Create a detailed system prompt for widget chat
    const systemPrompt = `You are an AI customer support assistant for ${companyName}'s website chat widget. Your role is to help website visitors with their questions and provide accurate, helpful responses based on the knowledge base information provided.

${contextInfo}

Guidelines:
- Always be polite, professional, and helpful
- Use the knowledge base information provided to answer questions accurately
- If a question cannot be answered with the available knowledge base information, politely explain that you need more details or suggest contacting the company directly
- Keep responses concise but informative (aim for 1-3 sentences for most responses)
- Stay focused on customer support topics related to ${companyName}
- If asked about topics unrelated to the company or customer support, politely redirect the conversation
- You are representing ${companyName} to their website visitors
- Always try to be helpful and guide visitors toward getting the assistance they need
- When you have relevant information from the knowledge base, use it to provide specific and accurate answers

Remember: You are embedded on ${companyName}'s website to help their visitors based on the company's knowledge base.`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Generate response with retry logic
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: `Hello! I'm here to help you with any questions about ${companyName}. How can I assist you today?` }],
        },
      ],
    });

    // Use retry wrapper for the API call
    const result = await retryApiCall(async () => {
      return await chat.sendMessage(message);
    });
    
    const response = await result.response;
    return response.text();

  } catch (error: unknown) {
    console.error('Widget AI Error:', error);
    
    // Handle specific Google AI errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
      return 'I apologize, but our AI service is currently experiencing high traffic. Please try again in a few moments or contact our support team directly.';
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return 'I need a moment to process your request. Please try again shortly.';
    }
    
    // Generic fallback response
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team for immediate assistance.';
  }
}


