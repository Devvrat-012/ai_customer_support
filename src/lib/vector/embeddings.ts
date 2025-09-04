import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface EmbeddingResult {
  embedding: number[];
  tokenCount?: number;
}

export interface EmbeddingBatch {
  embeddings: number[][];
  tokenCount?: number;
}

/**
 * Generate embedding for a single text using Gemini
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent(text);
    
    return {
      embedding: result.embedding.values,
      tokenCount: text.split(/\s+/).length, // Rough estimation
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingBatch> {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    // Process in parallel with rate limiting
    const batchSize = 5; // Limit concurrent requests
    const embeddings: number[][] = [];
    let totalTokens = 0;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (text) => {
        try {
          const result = await model.embedContent(text);
          totalTokens += text.split(/\s+/).length;
          return result.embedding.values;
        } catch (error) {
          console.error(`Error embedding text at index ${i}:`, error);
          throw error;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);

      // Add small delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return {
      embeddings,
      tokenCount: totalTokens,
    };
  } catch (error) {
    console.error('Error generating embeddings batch:', error);
    throw new Error(`Failed to generate embeddings batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find the most similar embeddings using cosine similarity
 */
export function findMostSimilar(
  queryEmbedding: number[],
  embeddings: { embedding: number[]; id: string; score?: number }[],
  topK: number = 5
): Array<{ id: string; score: number; embedding: number[] }> {
  const similarities = embeddings.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Validate embedding vector
 */
export function validateEmbedding(embedding: number[]): boolean {
  if (!Array.isArray(embedding)) {
    return false;
  }

  if (embedding.length === 0) {
    return false;
  }

  // Check if all values are numbers and finite
  return embedding.every(value => 
    typeof value === 'number' && 
    isFinite(value) && 
    !isNaN(value)
  );
}

/**
 * Normalize embedding vector to unit length
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude === 0) {
    return embedding;
  }

  return embedding.map(val => val / magnitude);
}
