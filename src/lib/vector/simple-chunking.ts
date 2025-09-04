// Simple text chunking without tiktoken dependency
// This is a fallback when tiktoken has WASM issues

export interface SimpleTextChunk {
  content: string;
  index: number;
  tokenCount: number;
}

export interface SimpleChunkingOptions {
  maxTokens?: number;
  overlapTokens?: number;
  preserveParagraphs?: boolean;
  preserveSentences?: boolean;
}

/**
 * Simple token estimation (roughly 4 characters per token)
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Simple text chunking without tiktoken dependency
 */
export function simpleChunkText(
  text: string,
  options: SimpleChunkingOptions = {}
): SimpleTextChunk[] {
  const config = {
    maxTokens: 512,
    overlapTokens: 50,
    preserveParagraphs: true,
    preserveSentences: true,
    ...options,
  };

  // Clean the text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanText) {
    return [];
  }

  // If text is small enough, return as single chunk
  const totalTokens = estimateTokenCount(cleanText);
  if (totalTokens <= config.maxTokens) {
    return [{
      content: cleanText,
      index: 0,
      tokenCount: totalTokens,
    }];
  }

  const chunks: SimpleTextChunk[] = [];
  const maxChars = config.maxTokens * 4; // Rough conversion
  const overlapChars = config.overlapTokens * 4;

  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < cleanText.length) {
    let endPosition = Math.min(currentPosition + maxChars, cleanText.length);
    
    // Try to break at sentence or paragraph boundaries
    if (endPosition < cleanText.length) {
      let breakPoint = endPosition;
      
      if (config.preserveParagraphs) {
        const paragraphBreak = cleanText.lastIndexOf('\n\n', endPosition);
        if (paragraphBreak > currentPosition + maxChars * 0.5) {
          breakPoint = paragraphBreak;
        }
      }
      
      if (config.preserveSentences && breakPoint === endPosition) {
        const sentenceBreak = cleanText.lastIndexOf('.', endPosition);
        if (sentenceBreak > currentPosition + maxChars * 0.5) {
          breakPoint = sentenceBreak + 1;
        }
      }
      
      // If no good break point, break at word boundary
      if (breakPoint === endPosition) {
        const wordBreak = cleanText.lastIndexOf(' ', endPosition);
        if (wordBreak > currentPosition + maxChars * 0.5) {
          breakPoint = wordBreak;
        }
      }
      
      endPosition = breakPoint;
    }

    const chunkContent = cleanText.slice(currentPosition, endPosition).trim();
    
    if (chunkContent.length > 0) {
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        tokenCount: estimateTokenCount(chunkContent),
      });
      chunkIndex++;
    }

    // Move position with overlap
    currentPosition = Math.max(endPosition - overlapChars, endPosition);
    
    // Avoid infinite loop
    if (currentPosition >= cleanText.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Simple document preparation
 */
export function simplePrepareDocs(content: string, _sourceType?: string) {
  // Basic text cleanup
  return content
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/ {2,}/g, ' ') // Collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim();
}

/**
 * Simple metadata extraction
 */
export function simpleExtractMetadata(content: string) {
  const lines = content.split('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  return {
    wordCount: words.length,
    lineCount: lines.length,
    charCount: content.length,
    avgWordsPerLine: Math.round(words.length / lines.length),
    estimatedTokens: estimateTokenCount(content),
  };
}
