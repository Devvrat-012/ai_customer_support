import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteKnowledgeBase, reprocessKnowledgeBase, getKnowledgeBaseDetails } from '@/lib/vector/knowledge';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

// GET - Get knowledge base details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const userId = currentUser.userId;
    if (!userId) {
      throw new AuthenticationError('Invalid user token');
    }

    const params = await context.params;
    const knowledgeBaseId = params.id;
    if (!knowledgeBaseId) {
      throw new ValidationError('Knowledge base ID is required');
    }

    const details = await getKnowledgeBaseDetails(userId, knowledgeBaseId);

    if (!details) {
      throw new ValidationError('Knowledge base not found or access denied');
    }

    return createSuccessResponse({
      knowledgeBase: details,
    });

  } catch (error) {
    console.error('Knowledge base details error:', error);
    return handleApiError(error);
  }
}

// DELETE - Delete knowledge base
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const userId = currentUser.userId;
    if (!userId) {
      throw new AuthenticationError('Invalid user token');
    }

    const params = await context.params;
    const knowledgeBaseId = params.id;
    if (!knowledgeBaseId) {
      throw new ValidationError('Knowledge base ID is required');
    }

    const success = await deleteKnowledgeBase(userId, knowledgeBaseId);

    if (!success) {
      throw new ValidationError('Failed to delete knowledge base or access denied');
    }

    return createSuccessResponse({
      message: 'Knowledge base deleted successfully',
      deletedId: knowledgeBaseId,
      deletedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Knowledge base deletion error:', error);
    return handleApiError(error);
  }
}

// PUT - Update or reprocess knowledge base
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const userId = currentUser.userId;
    if (!userId) {
      throw new AuthenticationError('Invalid user token');
    }

    const params = await context.params;

    const knowledgeBaseId = params.id;
    if (!knowledgeBaseId) {
      throw new ValidationError('Knowledge base ID is required');
    }

    const { action, chunkingOptions } = await request.json();

    if (action === 'reprocess') {
      // Reprocess with new chunking options
      const result = await reprocessKnowledgeBase(userId, knowledgeBaseId, chunkingOptions);

      if (result.status === 'ERROR') {
        throw new Error(result.error || 'Failed to reprocess knowledge base');
      }

      return createSuccessResponse({
        message: 'Knowledge base reprocessed successfully',
        knowledgeBaseId: result.knowledgeBaseId,
        totalChunks: result.totalChunks,
        status: result.status,
        reprocessedAt: new Date().toISOString(),
      });
    }

    // For other updates (name, description, etc.)
    const { name, description } = await request.json();
    
    if (name || description) {
      const { prisma } = await import('@/lib/db');
      
      // Verify ownership first
      const existing = await prisma.knowledgeBase.findFirst({
        where: {
          id: knowledgeBaseId,
          userId,
        },
      });

      if (!existing) {
        throw new ValidationError('Knowledge base not found or access denied');
      }

      const updated = await prisma.knowledgeBase.update({
        where: { id: knowledgeBaseId },
        data: {
          ...(name && { name: name.trim() }),
          ...(description && { description: description.trim() }),
          updatedAt: new Date(),
        },
      });

      return createSuccessResponse({
        message: 'Knowledge base updated successfully',
        knowledgeBase: updated,
        updatedAt: new Date().toISOString(),
      });
    }

    throw new ValidationError('No valid action or update data provided');

  } catch (error) {
    console.error('Knowledge base update error:', error);
    return handleApiError(error);
  }
}
