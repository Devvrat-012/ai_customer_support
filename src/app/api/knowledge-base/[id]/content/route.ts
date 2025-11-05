import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';

// GET - Get full content of a knowledge base by joining all chunks
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

    // Verify the knowledge base belongs to the user and get content
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        sourceType: true,
        sourceUrl: true,
        fileName: true,
      },
    });

    if (!knowledgeBase) {
      throw new ValidationError('Knowledge base not found or access denied');
    }

    let fullContent: string;
    let chunks: any[] = [];

    // Try to get stored content first (if the field exists in DB)
    try {
      // Use raw query to get content field (handles case where field doesn't exist yet)
      const contentResult = await prisma.$queryRaw<Array<{ content: string }>>`
        SELECT content FROM knowledge_bases WHERE id = ${knowledgeBaseId} AND user_id = ${userId}
      `;

      if (contentResult.length > 0 && contentResult[0].content) {
        fullContent = contentResult[0].content;
      } else {
        throw new Error('No stored content');
      }
    } catch {
      // Fall back to joining chunks (for backward compatibility)
      chunks = await prisma.knowledgeChunk.findMany({
        where: {
          knowledgeBaseId,
        },
        orderBy: {
          chunkIndex: 'asc',
        },
        select: {
          content: true,
          chunkIndex: true,
        },
      });

      // Join all chunks into full content
      fullContent = chunks
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map(chunk => chunk.content)
        .join('\n\n');

    }

    return createSuccessResponse({
      knowledgeBase: {
        id: knowledgeBase.id,
        name: knowledgeBase.name,
        description: knowledgeBase.description,
        sourceType: knowledgeBase.sourceType,
        sourceUrl: knowledgeBase.sourceUrl,
        fileName: knowledgeBase.fileName,
      },
      content: fullContent,
      totalChunks: chunks.length,
      retrievedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Knowledge base content retrieval error:', error);
    return handleApiError(error);
  }
}