import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processDocument } from '@/lib/vector/knowledge';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'text/html',
];

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Knowledge base name is required');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(`File type ${file.type} is not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // Read file content
    let content: string;
    try {
      content = await file.text();
    } catch (error) {
      console.error('Error reading file content:', error);
      throw new ValidationError('Failed to read file content. File may be corrupted or in an unsupported encoding.');
    }
    
    if (!content || content.trim().length === 0) {
      throw new ValidationError('File content is empty');
    }

    if (content.length < 50) {
      throw new ValidationError('File content is too short (minimum 50 characters)');
    }

    // Clean the content to remove any potential JSON-breaking characters
    const cleanContent = content
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .trim();

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      contentLength: cleanContent.length,
      contentPreview: cleanContent.substring(0, 200) + '...'
    });

    // Process the document
    const result = await processDocument(userId, cleanContent, {
      name: name.trim(),
      description: description?.trim() || undefined,
      sourceType: 'UPLOAD',
      fileName: file.name,
      chunkingOptions: {
        maxTokens: 512,
        overlapTokens: 50,
        preserveParagraphs: true,
        preserveSentences: true,
      },
    });

    if (result.status === 'ERROR') {
      throw new Error(result.error || 'Failed to process document');
    }

    return createSuccessResponse({
      message: 'Document uploaded and processed successfully',
      knowledgeBaseId: result.knowledgeBaseId,
      totalChunks: result.totalChunks,
      status: result.status,
      fileName: file.name,
      fileSize: file.size,
      contentLength: cleanContent.length,
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return handleApiError(error);
  }
}

// GET endpoint to retrieve upload status or list files
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('id');

    if (knowledgeBaseId) {
      // Get specific knowledge base details
      const { getKnowledgeBaseDetails } = await import('@/lib/vector/knowledge');
      const details = await getKnowledgeBaseDetails(currentUser.userId!, knowledgeBaseId);
      
      if (!details) {
        throw new ValidationError('Knowledge base not found');
      }

      return createSuccessResponse({
        knowledgeBase: details,
      });
    } else {
      // List all knowledge bases
      const { listKnowledgeBases } = await import('@/lib/vector/knowledge');
      const knowledgeBases = await listKnowledgeBases(currentUser.userId!);

      return createSuccessResponse({
        knowledgeBases,
        totalCount: knowledgeBases.length,
      });
    }

  } catch (error) {
    console.error('Knowledge base retrieval error:', error);
    return handleApiError(error);
  }
}
