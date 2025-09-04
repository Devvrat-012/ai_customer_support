import { prisma } from '@/lib/db';
import { chunkText, prepareDocumentForChunking, extractTextMetadata } from './chunking';
import { simpleChunkText, simplePrepareDocs, simpleExtractMetadata } from './simple-chunking';
import { generateEmbeddingsBatch } from './embeddings';

export interface ProcessDocumentOptions {
  name: string;
  description?: string;
  sourceType: 'UPLOAD' | 'WEBSITE' | 'MANUAL';
  sourceUrl?: string;
  fileName?: string;
  chunkingOptions?: {
    maxTokens?: number;
    overlapTokens?: number;
    preserveParagraphs?: boolean;
    preserveSentences?: boolean;
  };
}

export interface ProcessingResult {
  knowledgeBaseId: string;
  totalChunks: number;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  error?: string;
}

/**
 * Process a document and store it in the knowledge base
 */
export async function processDocument(
  userId: string,
  content: string,
  options: ProcessDocumentOptions
): Promise<ProcessingResult> {
  let knowledgeBaseId: string | null = null;

  try {
    // Create the knowledge base entry
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        userId,
        name: options.name,
        description: options.description,
        sourceType: options.sourceType,
        sourceUrl: options.sourceUrl,
        fileName: options.fileName,
        metadata: {},
        status: 'PROCESSING',
      },
    });

    knowledgeBaseId = knowledgeBase.id;

    // Prepare and chunk the content
    let preparedContent: string;
    let documentMetadata: any;
    let chunks: any[];

    try {
      // Try the advanced chunking first
      try {
        preparedContent = prepareDocumentForChunking(
          content, 
          options.sourceType.toLowerCase() as 'website' | 'upload' | 'manual'
        );
        documentMetadata = extractTextMetadata(preparedContent);
        chunks = chunkText(preparedContent, options.chunkingOptions);
        
        console.log('Using advanced chunking with tiktoken');
      } catch (tiktokenError) {
        console.warn('Tiktoken failed, falling back to simple chunking:', tiktokenError);
        
        // Fallback to simple chunking
        preparedContent = simplePrepareDocs(content, options.sourceType);
        documentMetadata = simpleExtractMetadata(preparedContent);
        chunks = simpleChunkText(preparedContent, options.chunkingOptions);
        
        console.log('Using simple chunking fallback');
      }

      if (!preparedContent.trim()) {
        throw new Error('Document content is empty after processing');
      }

      console.log('Document prepared:', {
        originalLength: content.length,
        preparedLength: preparedContent.length,
        chunkingMethod: chunks.length > 0 ? (chunks[0].tokenCount ? 'advanced' : 'simple') : 'unknown'
      });

      console.log('Document chunked:', {
        totalChunks: chunks.length,
        avgTokensPerChunk: chunks.length > 0 ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / chunks.length) : 0
      });

    } catch (error) {
      console.error('Error preparing/chunking document:', error);
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (chunks.length === 0) {
      throw new Error('No chunks generated from document content');
    }

    // Update knowledge base with metadata
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        metadata: {
          ...documentMetadata,
          originalLength: content.length,
          processedLength: preparedContent.length,
          processedAt: new Date().toISOString(),
          totalChunks: chunks.length,
        },
      },
    });

    // Generate embeddings for all chunks
    let embeddings: number[][];
    let tokenCount: number;

    try {
      const chunkContents = chunks.map(chunk => chunk.content);
      console.log('Generating embeddings for', chunkContents.length, 'chunks');
      
      const embeddingResult = await generateEmbeddingsBatch(chunkContents);
      embeddings = embeddingResult.embeddings;
      tokenCount = embeddingResult.tokenCount || 0;

      console.log('Embeddings generated:', {
        embeddingCount: embeddings.length,
        tokenCount,
        embeddingDimension: embeddings[0]?.length || 0
      });

    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (embeddings.length !== chunks.length) {
      throw new Error(`Mismatch between chunks (${chunks.length}) and embeddings (${embeddings.length}) count`);
    }

    // Store chunks and embeddings in database
    const chunkData = chunks.map((chunk, index) => ({
      knowledgeBaseId,
      content: chunk.content,
      chunkIndex: chunk.index,
      metadata: {
        ...chunk.metadata,
        tokenCount: chunk.tokenCount,
        embeddingGenerated: true,
      },
      // Store embedding as array for pgvector
      embedding: embeddings[index],
    }));

    // Insert chunks in batches to avoid query size limits
    const batchSize = 50;
    for (let i = 0; i < chunkData.length; i += batchSize) {
      const batch = chunkData.slice(i, i + batchSize);
      
      await prisma.$transaction(async (tx) => {
        for (const chunk of batch) {
          try {
            // Ensure embedding is a valid array of numbers
            const validEmbedding = Array.isArray(chunk.embedding) 
              ? chunk.embedding.map(n => Number(n)).filter(n => !isNaN(n))
              : [];
            
            if (validEmbedding.length === 0) {
              throw new Error(`Invalid embedding for chunk ${chunk.chunkIndex}`);
            }

            await tx.$executeRaw`
              INSERT INTO "knowledge_chunks" (
                id, "knowledge_base_id", content, "chunk_index", metadata, embedding, "created_at"
              ) VALUES (
                gen_random_uuid()::text,
                ${chunk.knowledgeBaseId},
                ${chunk.content},
                ${chunk.chunkIndex},
                ${JSON.stringify(chunk.metadata)}::jsonb,
                ${JSON.stringify(validEmbedding)}::vector,
                NOW()
              )
            `;
          } catch (error) {
            console.error(`Error inserting chunk ${chunk.chunkIndex}:`, error);
            throw new Error(`Failed to store chunk ${chunk.chunkIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      });
    }

    // Update knowledge base status to READY
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        status: 'READY',
        metadata: {
          ...documentMetadata,
          originalLength: content.length,
          processedLength: preparedContent.length,
          processedAt: new Date().toISOString(),
          totalChunks: chunks.length,
          totalTokens: tokenCount,
          embeddingsGenerated: embeddings.length,
        },
      },
    });

    return {
      knowledgeBaseId,
      totalChunks: chunks.length,
      status: 'READY',
    };

  } catch (error) {
    console.error('Error processing document:', error);

    // Update knowledge base status to ERROR if it was created
    if (knowledgeBaseId) {
      try {
        await prisma.knowledgeBase.update({
          where: { id: knowledgeBaseId },
          data: {
            status: 'ERROR',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              erroredAt: new Date().toISOString(),
            },
          },
        });
      } catch (updateError) {
        console.error('Error updating knowledge base status:', updateError);
      }
    }

    return {
      knowledgeBaseId: knowledgeBaseId || '',
      totalChunks: 0,
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a knowledge base and all its chunks
 */
export async function deleteKnowledgeBase(userId: string, knowledgeBaseId: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Verify ownership
      const knowledgeBase = await tx.knowledgeBase.findFirst({
        where: {
          id: knowledgeBaseId,
          userId,
        },
      });

      if (!knowledgeBase) {
        throw new Error('Knowledge base not found or access denied');
      }

      // Delete chunks first (due to foreign key constraints)
      await tx.knowledgeChunk.deleteMany({
        where: {
          knowledgeBaseId,
        },
      });

      // Delete knowledge base
      await tx.knowledgeBase.delete({
        where: {
          id: knowledgeBaseId,
        },
      });
    });

    return true;
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return false;
  }
}

/**
 * Get knowledge base details with chunk count
 */
export async function getKnowledgeBaseDetails(userId: string, knowledgeBaseId: string) {
  try {
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        userId,
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
    });

    if (!knowledgeBase) {
      return null;
    }

    return {
      ...knowledgeBase,
      chunkCount: knowledgeBase._count.chunks,
    };
  } catch (error) {
    console.error('Error getting knowledge base details:', error);
    return null;
  }
}

/**
 * List all knowledge bases for a user
 */
export async function listKnowledgeBases(userId: string) {
  try {
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return knowledgeBases.map(kb => ({
      ...kb,
      chunkCount: kb._count.chunks,
    }));
  } catch (error) {
    console.error('Error listing knowledge bases:', error);
    return [];
  }
}

/**
 * Reprocess a knowledge base (re-chunk and re-embed)
 */
export async function reprocessKnowledgeBase(
  userId: string,
  knowledgeBaseId: string,
  newChunkingOptions?: ProcessDocumentOptions['chunkingOptions']
): Promise<ProcessingResult> {
  try {
    // Get the knowledge base
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        userId,
      },
    });

    if (!knowledgeBase) {
      throw new Error('Knowledge base not found or access denied');
    }

    // If we don't have the original content, we can't reprocess
    if (!knowledgeBase.metadata || typeof knowledgeBase.metadata !== 'object') {
      throw new Error('Cannot reprocess: original content metadata not found');
    }

    const metadata = knowledgeBase.metadata as any;
    if (!metadata.originalContent) {
      throw new Error('Cannot reprocess: original content not stored');
    }

    // Update status to processing
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { status: 'PROCESSING' },
    });

    // Delete existing chunks
    await prisma.knowledgeChunk.deleteMany({
      where: { knowledgeBaseId },
    });

    // Reprocess with new options
    return await processDocument(userId, metadata.originalContent, {
      name: knowledgeBase.name,
      description: knowledgeBase.description || undefined,
      sourceType: knowledgeBase.sourceType as any,
      sourceUrl: knowledgeBase.sourceUrl || undefined,
      fileName: knowledgeBase.fileName || undefined,
      chunkingOptions: newChunkingOptions,
    });

  } catch (error) {
    console.error('Error reprocessing knowledge base:', error);
    
    // Update status to error
    if (knowledgeBaseId) {
      try {
        await prisma.knowledgeBase.update({
          where: { id: knowledgeBaseId },
          data: {
            status: 'ERROR',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              erroredAt: new Date().toISOString(),
            },
          },
        });
      } catch (updateError) {
        console.error('Error updating knowledge base status:', updateError);
      }
    }

    return {
      knowledgeBaseId,
      totalChunks: 0,
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
