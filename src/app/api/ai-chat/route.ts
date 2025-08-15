import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

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

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new ValidationError('Message is required');
    }

    if (message.length > 1000) {
      throw new ValidationError('Message is too long. Maximum 1000 characters allowed.');
    }

    // Get user's company data
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { 
        companyInfo: true,
        companyName: true,
        firstName: true 
      }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Prepare the context for AI
    const companyContext = user.companyInfo 
      ? `Company Information: ${user.companyInfo}`
      : 'No company information has been uploaded yet.';

    const companyName = user.companyName || 'the company';
    const userName = user.firstName || 'there';

    // Create a detailed system prompt
    const systemPrompt = `You are an AI customer support assistant for ${companyName}. Your role is to help customers with their questions and provide accurate, helpful responses based on the company information provided.

${companyContext}

Guidelines:
- Always be polite, professional, and helpful
- Use the company information provided to answer questions accurately
- If a question cannot be answered with the available company information, politely explain that you need more details or suggest contacting human support
- Keep responses concise but informative
- Address the user by their name (${userName}) when appropriate
- Stay focused on customer support topics related to ${companyName}
- If asked about topics unrelated to the company or customer support, politely redirect the conversation

Current user: ${userName}`;

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
          parts: [{ text: `Hello ${userName}! I'm your AI customer support assistant for ${companyName}. I'm here to help you with any questions you might have. How can I assist you today?` }],
        },
      ],
    });

    // Use retry wrapper for the API call
    const result = await retryApiCall(async () => {
      return await chat.sendMessage(message);
    });
    
    const response = await result.response;
    const aiResponse = response.text();

    return createSuccessResponse({
      message: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('AI Chat Error:', error);
    
    // Handle specific Google AI errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
      return Response.json({
        success: false,
        message: 'The AI service is currently experiencing high traffic. Please try again in a few moments.',
        error: 'SERVICE_OVERLOADED'
      }, { status: 503 });
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return Response.json({
        success: false,
        message: 'Too many requests. Please wait a moment before trying again.',
        error: 'RATE_LIMITED'
      }, { status: 429 });
    }
    
    if (errorMessage.includes('API key')) {
      return Response.json({
        success: false,
        message: 'AI service configuration error. Please contact support.',
        error: 'CONFIG_ERROR'
      }, { status: 500 });
    }
    
    return handleApiError(error);
  }
}
