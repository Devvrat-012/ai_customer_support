// Conditional import of tiktoken to handle WASM issues
let encoding_for_model: any = null;
let tiktoken_available = false;

async function initializeTiktoken() {
  try {
    const tiktoken = await import('tiktoken');
    encoding_for_model = tiktoken.encoding_for_model;
    tiktoken_available = true;
  } catch (error) {
    console.warn('Tiktoken not available, will use fallback chunking:', error);
  }
}

// Initialize tiktoken asynchronously
initializeTiktoken();

export interface TextChunk {
  content: string;
  index: number;
  tokenCount: number;
  metadata?: Record<string, any>;
}

export interface ChunkingOptions {
  maxTokens?: number;        // Maximum tokens per chunk (default: 512)
  overlapTokens?: number;    // Token overlap between chunks (default: 50)
  preserveParagraphs?: boolean; // Try to preserve paragraph boundaries (default: true)
  preserveSentences?: boolean;  // Try to preserve sentence boundaries (default: true)
}

const DEFAULT_CHUNKING_OPTIONS: Required<ChunkingOptions> = {
  maxTokens: 512,
  overlapTokens: 50,
  preserveParagraphs: true,
  preserveSentences: true,
};

/**
 * Split text into chunks suitable for embedding
 */
export function chunkText(text: string, options: ChunkingOptions = {}): TextChunk[] {
  // If tiktoken is not available, throw error to trigger fallback
  if (!tiktoken_available || !encoding_for_model) {
    throw new Error('Tiktoken not available, fallback needed');
  }

  const config = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
  
  let encoding;
  try {
    encoding = encoding_for_model('gpt-3.5-turbo'); // Using GPT tokenizer as approximation
  } catch (error: unknown) {
    console.error('Failed to get encoding:', error);
    throw new Error('Failed to get encoding, fallback needed');
  }
  
  // Clean and normalize the text
  const cleanText = text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Remove excessive newlines
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();

  if (!cleanText) {
    encoding?.free?.();
    return [];
  }

  // If text is small enough, return as single chunk
  const totalTokens = encoding.encode(cleanText).length;
  if (totalTokens <= config.maxTokens) {
    encoding.free();
    return [{
      content: cleanText,
      index: 0,
      tokenCount: totalTokens,
    }];
  }

  const chunks: TextChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < cleanText.length) {
    let chunkText = '';
    let chunkTokens = 0;
    
    // Find the end position for this chunk
    let endPosition = currentPosition;
    let tempText = '';
    
    // Build chunk character by character until we hit token limit
    while (endPosition < cleanText.length) {
      const nextChar = cleanText[endPosition];
      const testText = tempText + nextChar;
      const testTokens = encoding.encode(testText).length;
      
      if (testTokens > config.maxTokens && tempText.length > 0) {
        // We've hit the limit, try to find a good break point
        break;
      }
      
      tempText = testText;
      endPosition++;
    }

    chunkText = tempText;
    chunkTokens = encoding.encode(chunkText).length;

    // Try to find better break points if enabled
    if (endPosition < cleanText.length) {
      const remainingText = cleanText.slice(currentPosition, endPosition);
      
      if (config.preserveParagraphs) {
        const lastParagraphBreak = remainingText.lastIndexOf('\n\n');
        if (lastParagraphBreak > remainingText.length * 0.5) { // Only if we keep at least half
          const adjustedText = remainingText.slice(0, lastParagraphBreak + 2);
          const adjustedTokens = encoding.encode(adjustedText).length;
          if (adjustedTokens >= config.maxTokens * 0.3) { // Minimum 30% of max tokens
            chunkText = adjustedText;
            chunkTokens = adjustedTokens;
            endPosition = currentPosition + lastParagraphBreak + 2;
          }
        }
      }
      
      if (config.preserveSentences && chunkText === tempText) {
        // Look for sentence boundaries
        const sentenceEndings = /[.!?]\s+/g;
        let lastSentenceEnd = -1;
        let match;
        
        while ((match = sentenceEndings.exec(remainingText)) !== null) {
          const sentenceEndPos = match.index + match[0].length;
          const testText = remainingText.slice(0, sentenceEndPos);
          const testTokens = encoding.encode(testText).length;
          
          if (testTokens <= config.maxTokens) {
            lastSentenceEnd = sentenceEndPos;
          } else {
            break;
          }
        }
        
        if (lastSentenceEnd > remainingText.length * 0.3) { // Keep at least 30%
          const adjustedText = remainingText.slice(0, lastSentenceEnd);
          chunkText = adjustedText;
          chunkTokens = encoding.encode(adjustedText).length;
          endPosition = currentPosition + lastSentenceEnd;
        }
      }
    }

    // Add the chunk
    chunks.push({
      content: chunkText.trim(),
      index: chunkIndex,
      tokenCount: chunkTokens,
      metadata: {
        startPosition: currentPosition,
        endPosition: currentPosition + chunkText.length,
      }
    });

    // Calculate next position with overlap
    if (endPosition >= cleanText.length) {
      break;
    }

    // Calculate overlap position
    const overlapChars = Math.min(
      chunkText.length,
      Math.floor(chunkText.length * (config.overlapTokens / config.maxTokens))
    );
    
    currentPosition = endPosition - overlapChars;
    chunkIndex++;
  }

  encoding.free();
  return chunks;
}

/**
 * Extract text metadata (headings, structure, etc.)
 */
export function extractTextMetadata(text: string): Record<string, any> {
  // If tiktoken is not available, use fallback metadata
  if (!tiktoken_available || !encoding_for_model) {
    return {
      lineCount: text.split('\n').length,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      headings: [],
      estimatedTokens: Math.ceil(text.length / 4),
      usingFallback: true,
    };
  }

  const lines = text.split('\n');
  const headings: string[] = [];
  const metadata: Record<string, any> = {
    lineCount: lines.length,
    characterCount: text.length,
    headings: [],
  };

  // Extract headings (simple heuristic)
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for markdown-style headings
    if (trimmed.match(/^#{1,6}\s+/)) {
      headings.push(trimmed.replace(/^#+\s*/, ''));
    }
    // Check for title-case lines that might be headings
    else if (
      trimmed.length > 3 && 
      trimmed.length < 100 && 
      trimmed === trimmed.toUpperCase() &&
      !trimmed.includes('.')
    ) {
      headings.push(trimmed);
    }
    // Check for lines that end with a colon (section headers)
    else if (trimmed.endsWith(':') && trimmed.length < 100 && !trimmed.includes('.')) {
      headings.push(trimmed.slice(0, -1));
    }
  }

  metadata.headings = headings.slice(0, 10); // Limit to first 10 headings

  // Calculate readability stats
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  metadata.sentenceCount = sentences.length;
  metadata.wordCount = words.length;
  metadata.avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

  return metadata;
}

/**
 * Prepare document content for chunking (clean and structure)
 */
export function prepareDocumentForChunking(content: string, sourceType: 'website' | 'upload' | 'manual'): string {
  // If tiktoken is not available, throw error to trigger fallback
  if (!tiktoken_available) {
    throw new Error('Tiktoken not available, using fallback preparation');
  }

  let cleaned = content;

  if (sourceType === 'website') {
    // Remove common website artifacts
    cleaned = cleaned
      .replace(/Cookie Policy|Privacy Policy|Terms of Service/gi, '') // Remove policy links
      .replace(/Copyright \d{4}.*$/gim, '') // Remove copyright notices
      .replace(/All rights reserved\.?/gi, '') // Remove rights notices
      .replace(/Home\s+About\s+Contact\s+/gi, '') // Remove navigation patterns
      .replace(/\b(Menu|Navigation|Sidebar|Header|Footer)\b/gi, '') // Remove UI elements
      .replace(/\bclick here\b/gi, '') // Remove "click here" text
      .replace(/\bread more\b/gi, '') // Remove "read more" text
  }

  // General cleaning
  cleaned = cleaned
    .replace(/\s*\n\s*\n\s*/g, '\n\n') // Normalize paragraph breaks
    .replace(/[ \t]+/g, ' ') // Normalize whitespace
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .trim();

  return cleaned;
}
