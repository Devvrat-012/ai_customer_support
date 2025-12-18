import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchKnowledgeBase } from '@/lib/vector/search';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RAGChatOptions {
  maxContextChunks?: number;     // Maximum knowledge chunks to include (default: 5)
  minSimilarity?: number;        // Minimum similarity for knowledge chunks (default: 0.7)
  includeKnowledgeInfo?: boolean; // Include info about knowledge sources in response (default: true)
  searchType?: 'vector' | 'hybrid' | 'context'; // Type of search to use (default: 'vector')
  fallbackToRegular?: boolean;   // Fallback to regular chat if no knowledge found (default: true)
}

export interface RAGChatResponse {
  response: string;
  knowledgeUsed: boolean;
  knowledgeSources: {
    id: string;
    name: string;
    similarity: number;
    sourceType: string;
  }[];
  totalKnowledgeChunks: number;
  searchQuery?: string;
  responseGenerated: string;
}

const DEFAULT_RAG_OPTIONS: Required<RAGChatOptions> = {
  maxContextChunks: 5,
  minSimilarity: 0.3, // Lowered from 0.7 to 0.3 for better matching
  includeKnowledgeInfo: true,
  searchType: 'vector',
  fallbackToRegular: true,
};

/**
 * Generate an AI response using RAG (Retrieval-Augmented Generation)
 */
export async function generateRAGResponse(
  userId: string,
  userMessage: string,
  userContext: {
    firstName?: string;
    companyName?: string;
    companyInfo?: string;
  },
  options: RAGChatOptions = {}
): Promise<RAGChatResponse> {
  const config = { ...DEFAULT_RAG_OPTIONS, ...options };

  try {
    // Search for relevant knowledge
    const knowledgeResults = await searchKnowledgeBase(userId, userMessage, {
      limit: config.maxContextChunks,
      minSimilarity: config.minSimilarity,
    });

    console.log('🔍 Knowledge search results:', {
      query: userMessage,
      resultsFound: knowledgeResults.length,
      minSimilarity: config.minSimilarity,
      results: knowledgeResults.map(r => ({
        similarity: r.similarity,
        contentPreview: r.content.substring(0, 100) + '...',
        knowledgeBaseName: r.knowledgeBaseName
      }))
    });

    const knowledgeUsed = knowledgeResults.length > 0;
    let contextInfo = '';
    let knowledgeSources: RAGChatResponse['knowledgeSources'] = [];

    if (knowledgeUsed) {
      // Build context from knowledge chunks
      const knowledgeContext = knowledgeResults
        .map((result, index) => {
          return `[Knowledge Source ${index + 1}]:\n${result.content}\n`;
        })
        .join('\n');

      contextInfo = `\n\nRELEVANT COMPANY KNOWLEDGE:\n${knowledgeContext}\n`;

      // Track knowledge sources
      knowledgeSources = knowledgeResults.map(result => ({
        id: result.id,
        name: result.knowledgeBaseName,
        similarity: result.similarity,
        sourceType: result.sourceType,
      }));
    }

    // Build the enhanced system prompt
    const companyName = userContext.companyName || 'the company';
    const userName = userContext.firstName || 'there';
    
    const baseCompanyInfo = userContext.companyInfo 
      ? `Base Company Information: ${userContext.companyInfo}\n` 
      : '';

    const systemPrompt = `You are an AI customer support assistant for ${companyName}. Your role is to help customers with their questions and provide accurate, helpful responses based on the company information provided.

${baseCompanyInfo}${contextInfo}

Guidelines:
- Always be polite, professional, and helpful
- Use the company knowledge provided above to answer questions accurately
- When referencing information, prioritize the knowledge sources over the base company information
- If a question cannot be answered with the available information, politely explain that you need more details or suggest contacting human support
- Keep responses concise but informative
- Address the user by their name (${userName}) when appropriate
- Stay focused on customer support topics related to ${companyName}
- If asked about topics unrelated to the company or customer support, politely redirect the conversation
${config.includeKnowledgeInfo && knowledgeUsed ? '- When appropriate, mention that your response is based on the latest company documentation/knowledge base' : ''}

Current user: ${userName}
User's question: ${userMessage}

Please provide a helpful response based on the available information.`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    return {
      response: aiResponse,
      knowledgeUsed,
      knowledgeSources,
      totalKnowledgeChunks: knowledgeResults.length,
      searchQuery: userMessage,
      responseGenerated: new Date().toISOString(),
    };

  } catch (error) {
    console.error('RAG response generation error:', error);
    
    // Fallback to regular chat if enabled
    if (config.fallbackToRegular) {
      try {
        const fallbackResponse = await generateRegularChatResponse(userMessage, userContext);
        return {
          response: fallbackResponse,
          knowledgeUsed: false,
          knowledgeSources: [],
          totalKnowledgeChunks: 0,
          responseGenerated: new Date().toISOString(),
        };
      } catch (fallbackError) {
        console.error('Fallback response generation error:', fallbackError);
        throw new Error('Failed to generate response');
      }
    }
    
    throw error;
  }
}

/**
 * Generate a regular AI response without RAG
 */
async function generateRegularChatResponse(
  userMessage: string,
  userContext: {
    firstName?: string;
    companyName?: string;
    companyInfo?: string;
  }
): Promise<string> {
  const companyName = userContext.companyName || 'the company';
  const userName = userContext.firstName || 'there';
  
  const companyContext = userContext.companyInfo 
    ? `Company Information: ${userContext.companyInfo}` 
    : 'No company information has been uploaded yet.';

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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

/**
 * Enhance search query for better knowledge retrieval
 */
export function enhanceSearchQuery(userMessage: string): string {
  // Remove common question words and enhance for better search
  const enhanced = userMessage
    .toLowerCase()
    .replace(/^(how|what|where|when|why|who|can|could|would|should|is|are|do|does|did|will)\s+/i, '')
    .replace(/\?+$/, '')
    .replace(/\bplease\b/gi, '')
    .replace(/\bi\b/gi, '')
    .replace(/\bmy\b/gi, '')
    .trim();

  return enhanced || userMessage;
}

/**
 * Determine if a message likely needs knowledge base search
 */
export function shouldUseRAG(userMessage: string): boolean {
  const message = userMessage.toLowerCase();
  
  // Keywords that suggest knowledge base search would be helpful
  const knowledgeKeywords = [
    'how', 'what', 'where', 'when', 'why', 'explain', 'tell me about',
    'information', 'details', 'help', 'support', 'documentation',
    'features', 'pricing', 'policy', 'terms', 'service', 'product',
    'account', 'billing', 'technical', 'issue', 'problem', 'error',
    'guide', 'tutorial', 'setup', 'configure', 'install'
  ];

  // Greetings and small talk that don't need knowledge search
  const smallTalkKeywords = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    'thanks', 'thank you', 'bye', 'goodbye', 'see you'
  ];

  // Check for small talk first
  if (smallTalkKeywords.some(keyword => message.includes(keyword))) {
    return false;
  }

  // Check for knowledge-seeking patterns
  return knowledgeKeywords.some(keyword => message.includes(keyword)) || 
         message.includes('?') || 
         message.length > 20; // Longer messages are more likely to need knowledge
}
