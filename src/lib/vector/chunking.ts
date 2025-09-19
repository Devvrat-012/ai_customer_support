// Conditional import of tiktoken to handle WASM issues
let encoding_for_model: any = null;
let tiktoken_available = false;

const isServer = typeof window === 'undefined';

async function initializeTiktoken() {
  if (!isServer) {
    // Do not try to load WASM-based tiktoken in the browser; use fallback.
    return;
  }
  try {
    const tiktoken = await import('tiktoken');
    encoding_for_model = tiktoken.encoding_for_model;
    tiktoken_available = true;
  } catch {
    // Silently fall back; no noisy logs on production
    tiktoken_available = false;
  }
}

// Initialize tiktoken asynchronously (server only)
void initializeTiktoken();

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
  model?: string;            // Model name for tokenizer when using tiktoken (default: 'gpt-3.5-turbo')
}

const DEFAULT_CHUNKING_OPTIONS: Required<ChunkingOptions> = {
  maxTokens: 512,
  overlapTokens: 50,
  preserveParagraphs: true,
  preserveSentences: true,
  model: 'gpt-3.5-turbo',
};

// --- Fallback helpers (no WASM) ---
function approxTokenCount(s: string): number {
  // Rough approximation used widely: ~4 characters per token
  return Math.max(1, Math.ceil(s.length / 4));
}

function fallbackChunkText(text: string, options: Required<ChunkingOptions>): TextChunk[] {
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return [];

  const totalApprox = approxTokenCount(cleanText);
  if (totalApprox <= options.maxTokens) {
    return [{ content: cleanText, index: 0, tokenCount: totalApprox }];
  }

  const chunks: TextChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < cleanText.length) {

    // Start by trying to take as many characters as roughly equal to maxTokens
    // Convert tokens->chars using 4 chars per token rule, then adjust at boundaries.
    const targetChars = options.maxTokens * 4;
    let endPosition = Math.min(cleanText.length, currentPosition + targetChars);
    let candidate = cleanText.slice(currentPosition, endPosition);

    // Try to improve breakpoints
    if (options.preserveParagraphs) {
      const lastParaBreak = candidate.lastIndexOf('\n\n');
      if (lastParaBreak > candidate.length * 0.5) {
        candidate = candidate.slice(0, lastParaBreak + 2);
        endPosition = currentPosition + candidate.length;
      }
    }

    if (options.preserveSentences) {
      const sentenceEndings = /[.!?]\s+/g;
      let match: RegExpExecArray | null;
      let lastSentenceEnd = -1;
      while ((match = sentenceEndings.exec(candidate)) !== null) {
        lastSentenceEnd = match.index + match[0].length;
      }
      if (lastSentenceEnd > candidate.length * 0.3) {
        candidate = candidate.slice(0, lastSentenceEnd);
        endPosition = currentPosition + candidate.length;
      }
    }

    const tokenCount = approxTokenCount(candidate);
    chunks.push({
      content: candidate.trim(),
      index: chunkIndex,
      tokenCount,
      metadata: {
        startPosition: currentPosition,
        endPosition: endPosition,
      },
    });

    if (endPosition >= cleanText.length) break;

    const overlapChars = Math.min(
      candidate.length,
      Math.floor(candidate.length * (options.overlapTokens / options.maxTokens))
    );
    currentPosition = endPosition - overlapChars;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Split text into chunks suitable for embedding
 */
export function chunkText(text: string, options: ChunkingOptions = {}): TextChunk[] {
  const config = { ...DEFAULT_CHUNKING_OPTIONS, model: 'gpt-3.5-turbo', ...options } as Required<ChunkingOptions>;

  // If tiktoken is not available, use robust fallback (no throwing)
  if (!tiktoken_available || !encoding_for_model) {
    return fallbackChunkText(text, config);
  }
  
  let encoding: any;
  // Clean and normalize the text once
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return [];

  try {
    encoding = encoding_for_model(config.model);
  } catch (_error: unknown) {
    return fallbackChunkText(cleanText, config);
  }

  try {
    const tokenIds: number[] = encoding.encode(cleanText);
    const totalTokens = tokenIds.length;
    if (totalTokens <= config.maxTokens) {
      const content = encoding.decode(tokenIds);
      return [{ content, index: 0, tokenCount: totalTokens, metadata: { tokenStartIndex: 0, tokenEndIndex: totalTokens } }];
    }

    const chunks: TextChunk[] = [];
    let start = 0;
    let index = 0;
    const overlap = Math.max(0, Math.min(config.overlapTokens, config.maxTokens - 1));

    while (start < totalTokens) {
      const end = Math.min(start + config.maxTokens, totalTokens);
      const window = tokenIds.slice(start, end);
      const content = encoding.decode(window);
      chunks.push({
        content: content.trim(),
        index,
        tokenCount: window.length,
        metadata: { tokenStartIndex: start, tokenEndIndex: end },
      });

      if (end >= totalTokens) break;
      start = end - overlap;
      index++;
    }
    return chunks;
  } finally {
    try {
      encoding?.free?.();
    } catch {
      // ignore
    }
  }
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
