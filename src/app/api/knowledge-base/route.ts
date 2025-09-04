import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/utils/api';
import { AuthenticationError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('id');

    if (knowledgeBaseId) {
      // Get specific knowledge base details
      const { getKnowledgeBaseDetails } = await import('@/lib/vector/knowledge');
      const details = await getKnowledgeBaseDetails(currentUser.userId!, knowledgeBaseId);
      
      if (!details) {
        return NextResponse.json({
          success: false,
          error: 'Knowledge base not found',
          knowledgeBase: null
        }, { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      return NextResponse.json({
        success: true,
        knowledgeBase: details,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } else {
      // List all knowledge bases
      const { listKnowledgeBases } = await import('@/lib/vector/knowledge');
      const knowledgeBases = await listKnowledgeBases(currentUser.userId!);

      return NextResponse.json({
        success: true,
        knowledgeBases: knowledgeBases || [],
        totalCount: knowledgeBases ? knowledgeBases.length : 0,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

  } catch (error) {
    console.error('Knowledge base retrieval error:', error);
    return handleApiError(error);
  }
}

// POST endpoint to create a new knowledge base (manual entry)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const body = await request.json();
    const { name, description, content } = body;

    if (!name || !content) {
      return NextResponse.json({
        success: false,
        error: 'Name and content are required'
      }, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Process the manual content
    const { processDocument } = await import('@/lib/vector/knowledge');
    const result = await processDocument(currentUser.userId!, content, {
      name: name.trim(),
      description: description?.trim() || undefined,
      sourceType: 'MANUAL',
      chunkingOptions: {
        maxTokens: 512,
        overlapTokens: 50,
        preserveParagraphs: true,
        preserveSentences: true,
      },
    });

    if (result.status === 'ERROR') {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to process content'
      }, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge base created successfully',
      knowledgeBaseId: result.knowledgeBaseId,
      totalChunks: result.totalChunks,
      status: result.status,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Knowledge base creation error:', error);
    return handleApiError(error);
  }
}
