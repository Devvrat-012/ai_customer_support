import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { prisma } from '@/lib/db';

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
    const { message, sessionId } = body;
    
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
          select: { aiReplies: true }
        }
      }
    });

    console.log('Widget chat - Found user:', user ? 'Yes' : 'No', user?.id); // Debug log

    if (!user) {
      console.log('Widget chat - No user found for key:', widgetKey); // Debug log
      throw new NotFoundError('Invalid widget key');
    }

    // Check if user has company data
    if (!user.companyInfo) {
      return NextResponse.json({
        success: false,
        error: 'Company information not configured. Please contact support.',
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Generate AI response using Gemini
    const aiResponse = await generateAIResponse(message, user);

    // Track the AI reply for billing
    await prisma.aiReply.create({
      data: {
        userId: user.id,
        question: message,
        response: aiResponse,
        model: 'gemini-1.5-flash-widget',
        tokensUsed: Math.floor(message.length / 4) + Math.floor(aiResponse.length / 4), // Rough estimation
      }
    });

    // Log the conversation (optional - you might want to store widget conversations)
    console.log(`Widget conversation for ${user.companyName}: Q: ${message} | A: ${aiResponse.substring(0, 100)}...`);

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        companyName: user.companyName,
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

// Type for user data
interface UserData {
  companyInfo?: string | null;
  companyName?: string | null;
}

// Generate AI response using Gemini
async function generateAIResponse(message: string, user: UserData): Promise<string> {
  try {
    // Prepare the context for AI
    const companyContext = user.companyInfo 
      ? `Company Information: ${user.companyInfo}`
      : 'No company information has been uploaded yet.';

    const companyName = user.companyName || 'the company';

    // Create a detailed system prompt for widget chat
    const systemPrompt = `You are an AI customer support assistant for ${companyName}'s website chat widget. Your role is to help website visitors with their questions and provide accurate, helpful responses based on the company information provided.

${companyContext}

Guidelines:
- Always be polite, professional, and helpful
- Use the company information provided to answer questions accurately
- If a question cannot be answered with the available company information, politely explain that you need more details or suggest contacting the company directly
- Keep responses concise but informative (aim for 1-3 sentences for most responses)
- Stay focused on customer support topics related to ${companyName}
- If asked about topics unrelated to the company or customer support, politely redirect the conversation
- You are representing ${companyName} to their website visitors
- Always try to be helpful and guide visitors toward getting the assistance they need

Remember: You are embedded on ${companyName}'s website to help their visitors.`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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


