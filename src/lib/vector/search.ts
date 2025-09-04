import { prisma } from '@/lib/db';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: any;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  sourceType: string;
  sourceUrl?: string;
  fileName?: string;
}

export interface SearchOptions {
  limit?: number;              // Maximum number of results (default: 10)
  minSimilarity?: number;      // Minimum similarity threshold (default: 0.7)
  knowledgeBaseIds?: string[]; // Filter by specific knowledge bases
  sourceTypes?: string[];      // Filter by source type
}

const DEFAULT_SEARCH_OPTIONS: Required<Omit<SearchOptions, 'knowledgeBaseIds' | 'sourceTypes'>> = {
  limit: 10,
  minSimilarity: 0.7,
};

/**
 * Search for relevant knowledge chunks using vector similarity
 */
export async function searchKnowledgeBase(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const config = { ...DEFAULT_SEARCH_OPTIONS, ...options };

  try {
    // Generate embedding for the query
    const { embedding: queryEmbedding } = await generateEmbedding(query);

    // Build the vector array string for PostgreSQL
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Build filters
    const filters: string[] = [`kb."userId" = $1`];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (config.knowledgeBaseIds && config.knowledgeBaseIds.length > 0) {
      filters.push(`kb.id = ANY($${paramIndex})`);
      params.push(config.knowledgeBaseIds);
      paramIndex++;
    }

    if (config.sourceTypes && config.sourceTypes.length > 0) {
      filters.push(`kb."sourceType" = ANY($${paramIndex})`);
      params.push(config.sourceTypes);
      paramIndex++;
    }

    // Add status filter to only search ready knowledge bases
    filters.push(`kb.status = 'READY'`);

    const whereClause = filters.join(' AND ');

    // Perform vector similarity search using raw SQL
    const query_sql = `
      SELECT 
        kc.id,
        kc.content,
        kc.metadata,
        kc."chunkIndex",
        kb.id as "knowledgeBaseId",
        kb.name as "knowledgeBaseName",
        kb."sourceType",
        kb."sourceUrl",
        kb."fileName",
        (1 - (kc.embedding <=> $${paramIndex}::vector)) as similarity
      FROM "knowledge_chunks" kc
      JOIN "knowledge_bases" kb ON kc."knowledgeBaseId" = kb.id
      WHERE ${whereClause}
        AND kc.embedding IS NOT NULL
        AND (1 - (kc.embedding <=> $${paramIndex}::vector)) >= $${paramIndex + 1}
      ORDER BY kc.embedding <=> $${paramIndex}::vector
      LIMIT $${paramIndex + 2}
    `;

    params.push(vectorString, config.minSimilarity, config.limit);

    const results = await prisma.$queryRawUnsafe(query_sql, ...params) as any[];

    return results.map(row => ({
      id: row.id,
      content: row.content,
      similarity: parseFloat(row.similarity),
      metadata: row.metadata,
      knowledgeBaseId: row.knowledgeBaseId,
      knowledgeBaseName: row.knowledgeBaseName,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      fileName: row.fileName,
    }));

  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw new Error(`Failed to search knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get knowledge base statistics for a user
 */
export async function getKnowledgeBaseStats(userId: string) {
  try {
    const stats = await prisma.knowledgeBase.groupBy({
      by: ['status', 'sourceType'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    const totalChunks = await prisma.knowledgeChunk.count({
      where: {
        knowledgeBase: {
          userId,
        },
      },
    });

    const readyKnowledgeBases = await prisma.knowledgeBase.count({
      where: {
        userId,
        status: 'READY',
      },
    });

    return {
      totalKnowledgeBases: stats.reduce((acc, stat) => acc + stat._count.id, 0),
      readyKnowledgeBases,
      totalChunks,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = (acc[stat.status] || 0) + stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      bySourceType: stats.reduce((acc, stat) => {
        acc[stat.sourceType] = (acc[stat.sourceType] || 0) + stat._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('Error getting knowledge base stats:', error);
    throw new Error(`Failed to get knowledge base stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search with enhanced context - includes surrounding chunks
 */
export async function searchWithContext(
  userId: string,
  query: string,
  options: SearchOptions & { includeContext?: boolean } = {}
): Promise<SearchResult[]> {
  const results = await searchKnowledgeBase(userId, query, options);

  if (!options.includeContext) {
    return results;
  }

  // For each result, try to get surrounding chunks for better context
  const enhancedResults = await Promise.all(
    results.map(async (result) => {
      try {
        // Get chunks before and after this one
        const contextChunks = await prisma.knowledgeChunk.findMany({
          where: {
            knowledgeBaseId: result.knowledgeBaseId,
            chunkIndex: {
              gte: Math.max(0, (result.metadata?.chunkIndex || 0) - 1),
              lte: (result.metadata?.chunkIndex || 0) + 1,
            },
          },
          orderBy: {
            chunkIndex: 'asc',
          },
        });

        // Combine chunks into a single content string
        const combinedContent = contextChunks
          .map(chunk => chunk.content)
          .join('\n\n');

        return {
          ...result,
          content: combinedContent || result.content,
          metadata: {
            ...result.metadata,
            contextChunks: contextChunks.length,
            hasContext: contextChunks.length > 1,
          },
        };
      } catch (error) {
        console.error('Error getting context for chunk:', error);
        return result; // Return original result if context retrieval fails
      }
    })
  );

  return enhancedResults;
}

/**
 * Hybrid search combining vector similarity and text search
 */
export async function hybridSearch(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Get vector search results
  const vectorResults = await searchKnowledgeBase(userId, query, {
    ...options,
    limit: Math.ceil((options.limit || 10) * 0.7), // 70% from vector search
  });

  // Get text search results using PostgreSQL full-text search
  const textSearchLimit = Math.floor((options.limit || 10) * 0.3); // 30% from text search
  
  if (textSearchLimit > 0) {
    try {
      const textResults = await prisma.knowledgeChunk.findMany({
        where: {
          knowledgeBase: {
            userId,
            status: 'READY',
            ...(options.knowledgeBaseIds && {
              id: { in: options.knowledgeBaseIds },
            }),
            ...(options.sourceTypes && {
              sourceType: { in: options.sourceTypes as any[] },
            }),
          },
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          knowledgeBase: true,
        },
        take: textSearchLimit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Convert text results to SearchResult format
      const formattedTextResults: SearchResult[] = textResults.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        similarity: 0.5, // Default similarity for text matches
        metadata: chunk.metadata,
        knowledgeBaseId: chunk.knowledgeBase.id,
        knowledgeBaseName: chunk.knowledgeBase.name,
        sourceType: chunk.knowledgeBase.sourceType,
        sourceUrl: chunk.knowledgeBase.sourceUrl || undefined,
        fileName: chunk.knowledgeBase.fileName || undefined,
      }));

      // Merge and deduplicate results
      const allResults = [...vectorResults, ...formattedTextResults];
      const uniqueResults = allResults.filter(
        (result, index, array) => 
          array.findIndex(r => r.id === result.id) === index
      );

      // Sort by similarity (vector results will naturally rank higher)
      return uniqueResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.limit || 10);

    } catch (error) {
      console.error('Error in text search, falling back to vector search only:', error);
      return vectorResults;
    }
  }

  return vectorResults;
}
