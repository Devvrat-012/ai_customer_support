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
    const knowledgeBaseData: any = {
      userId,
      name: options.name,
      description: options.description,
      sourceType: options.sourceType,
      sourceUrl: options.sourceUrl,
      fileName: options.fileName,
      metadata: {},
      status: 'PROCESSING',
    };

    // Add content field if it exists in the schema (for backward compatibility)
    try {
      // Try to include content - will work if field exists
      knowledgeBaseData.content = content;
    } catch {
      // Content field doesn't exist yet, skip it
    }

    const knowledgeBase = await prisma.knowledgeBase.create({
      data: knowledgeBaseData,
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

        console.log('✅ Using advanced chunking with tiktoken');
        console.log('📊 Tokenization Details (Advanced):', {
          method: 'tiktoken',
          chunkCount: chunks.length,
          chunks: chunks.slice(0, 3).map((c) => ({
            index: c.index,
            tokens: c.tokenCount,
            contentLength: c.content.length,
            preview: c.content.substring(0, 100).replace(/\n/g, ' ') + '...'
          })),
          ...(chunks.length > 3 && {
            moreChunks: `${chunks.length - 3} more chunks`,
            totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0)
          })
        });
      } catch (tiktokenError) {
        console.warn('⚠️ Tiktoken failed, falling back to simple chunking:', tiktokenError instanceof Error ? tiktokenError.message : tiktokenError);

        // Fallback to simple chunking
        preparedContent = simplePrepareDocs(content, options.sourceType);
        documentMetadata = simpleExtractMetadata(preparedContent);
        chunks = simpleChunkText(preparedContent, options.chunkingOptions);

        console.log('✅ Using simple chunking fallback');
        console.log('📊 Tokenization Details (Fallback):', {
          method: 'simple-chunking',
          chunkCount: chunks.length,
          chunks: chunks.slice(0, 3).map((c) => ({
            index: c.index,
            tokens: c.tokenCount,
            contentLength: c.content.length,
            preview: c.content.substring(0, 100).replace(/\n/g, ' ') + '...'
          })),
          ...(chunks.length > 3 && {
            moreChunks: `${chunks.length - 3} more chunks`,
            totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0)
          })
        });
      }

      if (!preparedContent.trim()) {
        throw new Error('Document content is empty after processing');
      }

      const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
      const avgTokensPerChunk = chunks.length > 0 ? Math.round(totalTokens / chunks.length) : 0;

      console.log('📈 Document Preparation Summary:', {
        originalLength: content.length,
        preparedLength: preparedContent.length,
        compressionRatio: ((1 - preparedContent.length / content.length) * 100).toFixed(2) + '%',
        totalChunks: chunks.length,
        totalTokens: totalTokens,
        avgTokensPerChunk: avgTokensPerChunk,
        minTokens: Math.min(...chunks.map(c => c.tokenCount)),
        maxTokens: Math.max(...chunks.map(c => c.tokenCount))
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
      console.log('🔄 Generating embeddings for', chunkContents.length, 'chunks');
      console.log('📍 Chunk sizes for embedding:', {
        chunks: chunkContents.slice(0, 5).map((content, i) => ({
          index: i,
          contentLength: content.length,
          preview: content.substring(0, 80).replace(/\n/g, ' ') + '...'
        })),
        ...(chunkContents.length > 5 && { moreChunks: `${chunkContents.length - 5} more chunks` })
      });

      const embeddingResult = await generateEmbeddingsBatch(chunkContents);
      embeddings = embeddingResult.embeddings;
      tokenCount = embeddingResult.tokenCount || 0;

      console.log('✅ Embeddings Generated Successfully:', {
        embeddingCount: embeddings.length,
        tokenCount: tokenCount,
        embeddingDimension: embeddings[0]?.length || 0,
        embeddingsStatus: embeddings.map((emb, i) => ({
          index: i,
          dimension: emb.length,
          hasValidValues: emb.every(v => typeof v === 'number' && !isNaN(v) && isFinite(v)),
          sample: emb.slice(0, 3).map(v => v.toFixed(6))
        })).slice(0, 3),
        ...(embeddings.length > 3 && { moreEmbeddings: `${embeddings.length - 3} more` })
      });

    } catch (error) {
      console.error('❌ Error generating embeddings:', error);
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
    // Reduce batch size in production to avoid transaction timeouts
    const isProduction = process.env.NODE_ENV === 'production';
    const batchSize = isProduction ? 10 : 50; // Smaller batches for production
    console.log('💾 Starting chunk insertion into database:', {
      totalChunks: chunkData.length,
      batchSize: batchSize,
      totalBatches: Math.ceil(chunkData.length / batchSize)
    });

    // Helper function to insert a chunk with retry logic
    const insertChunkWithRetry = async (tx: any, chunk: any, batchNumber: number, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Ensure embedding is a valid array of numbers
          const validEmbedding = Array.isArray(chunk.embedding)
            ? chunk.embedding.map((n: any) => Number(n)).filter((n: number) => !isNaN(n))
            : [];

          if (validEmbedding.length === 0) {
            throw new Error(`Invalid embedding for chunk ${chunk.chunkIndex} - no valid numbers found`);
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

          console.log(`  ✅ Chunk ${chunk.chunkIndex} stored (attempt ${attempt}):`, {
            contentLength: chunk.content.length,
            embeddingDimension: validEmbedding.length,
            tokenCount: chunk.metadata?.tokenCount,
            embeddingPreview: validEmbedding.slice(0, 3).map((v: number) => v.toFixed(6))
          });

          return; // Success, exit retry loop

        } catch (error) {
          console.error(`  ❌ Error inserting chunk ${chunk.chunkIndex} (attempt ${attempt}/${maxRetries}):`, error);

          if (attempt === maxRetries) {
            throw new Error(`Failed to store chunk ${chunk.chunkIndex} after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    };

    for (let i = 0; i < chunkData.length; i += batchSize) {
      const batch = chunkData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`📦 Processing batch ${batchNumber}/${Math.ceil(chunkData.length / batchSize)}:`, {
        batchStartIndex: i,
        batchSize: batch.length,
        chunkIndices: batch.map(c => c.chunkIndex)
      });

      await prisma.$transaction(async (tx) => {
        for (const chunk of batch) {
          await insertChunkWithRetry(tx, chunk, batchNumber);
        }
      }, {
        timeout: 30000, // 30 second timeout for production
      });

      console.log(`✅ Batch ${batchNumber} completed successfully`);
    }

    console.log('🎉 All chunks inserted successfully');

    // Update knowledge base status to READY
    const finalMetadata = {
      ...documentMetadata,
      originalLength: content.length,
      processedLength: preparedContent.length,
      processedAt: new Date().toISOString(),
      totalChunks: chunks.length,
      totalTokens: tokenCount,
      embeddingsGenerated: embeddings.length,
    };

    console.log('📋 Final Knowledge Base Metadata:', {
      totalChunks: chunks.length,
      totalTokens: tokenCount,
      embeddingCount: embeddings.length,
      averageTokensPerChunk: Math.round(tokenCount / chunks.length),
      originalContentLength: content.length,
      processedContentLength: preparedContent.length,
      compressionRatio: `${((1 - preparedContent.length / content.length) * 100).toFixed(1)}%`
    });

    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        status: 'READY',
        metadata: finalMetadata,
      },
    });

    console.log('✨ Knowledge base processing completed successfully!', {
      knowledgeBaseId,
      status: 'READY',
      readyTime: new Date().toISOString()
    });

    return {
      knowledgeBaseId,
      totalChunks: chunks.length,
      status: 'READY',
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('❌ Error processing document:', {
      errorMessage,
      errorStack,
      knowledgeBaseId,
      errorTime: new Date().toISOString()
    });

    // Update knowledge base status to ERROR if it was created
    if (knowledgeBaseId) {
      try {
        console.log('🔄 Updating knowledge base status to ERROR...');
        await prisma.knowledgeBase.update({
          where: { id: knowledgeBaseId },
          data: {
            status: 'ERROR',
            metadata: {
              error: errorMessage,
              erroredAt: new Date().toISOString(),
            },
          },
        });
        console.log('✅ Knowledge base status updated to ERROR');
      } catch (updateError) {
        const updateErrorMsg = updateError instanceof Error ? updateError.message : 'Unknown error';
        console.error('❌ Error updating knowledge base status:', updateErrorMsg);
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
