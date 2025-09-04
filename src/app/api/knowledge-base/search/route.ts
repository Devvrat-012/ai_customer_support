import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { searchKnowledgeBase, hybridSearch, searchWithContext } from '@/lib/vector/search';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const userId = currentUser.userId;
    if (!userId) {
      throw new AuthenticationError('Invalid user token');
    }

    const { 
      query, 
      limit, 
      minSimilarity, 
      knowledgeBaseIds, 
      sourceTypes,
      searchType = 'vector',  // 'vector', 'hybrid', or 'context'
      includeContext = false 
    } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new ValidationError('Search query is required');
    }

    if (query.length > 1000) {
      throw new ValidationError('Search query is too long (maximum 1000 characters)');
    }

    const searchOptions = {
      limit: limit && typeof limit === 'number' ? Math.min(limit, 50) : 10, // Cap at 50 results
      minSimilarity: minSimilarity && typeof minSimilarity === 'number' ? minSimilarity : 0.7,
      knowledgeBaseIds: Array.isArray(knowledgeBaseIds) ? knowledgeBaseIds : undefined,
      sourceTypes: Array.isArray(sourceTypes) ? sourceTypes : undefined,
    };

    let results;

    switch (searchType) {
      case 'hybrid':
        results = await hybridSearch(userId, query.trim(), searchOptions);
        break;
      case 'context':
        results = await searchWithContext(userId, query.trim(), { 
          ...searchOptions, 
          includeContext: includeContext 
        });
        break;
      case 'vector':
      default:
        results = await searchKnowledgeBase(userId, query.trim(), searchOptions);
        break;
    }

    return createSuccessResponse({
      query: query.trim(),
      results,
      totalResults: results.length,
      searchType,
      searchOptions,
      searchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Knowledge base search error:', error);
    return handleApiError(error);
  }
}

// GET endpoint for search suggestions or analytics
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get knowledge base statistics
      const { getKnowledgeBaseStats } = await import('@/lib/vector/search');
      const stats = await getKnowledgeBaseStats(currentUser.userId!);

      return createSuccessResponse({
        stats,
        retrievedAt: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      // List available knowledge bases for filtering
      const { listKnowledgeBases } = await import('@/lib/vector/knowledge');
      const knowledgeBases = await listKnowledgeBases(currentUser.userId!);

      const simplified = knowledgeBases.map(kb => ({
        id: kb.id,
        name: kb.name,
        sourceType: kb.sourceType,
        status: kb.status,
        chunkCount: kb.chunkCount,
        createdAt: kb.createdAt,
      }));

      return createSuccessResponse({
        knowledgeBases: simplified,
        totalCount: simplified.length,
      });
    }

    throw new ValidationError('Invalid action parameter');

  } catch (error) {
    console.error('Knowledge base search GET error:', error);
    return handleApiError(error);
  }
}
