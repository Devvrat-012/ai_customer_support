import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processDocument } from '@/lib/vector/knowledge';
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

    const { websiteUrl, name, description } = await request.json();

    if (!websiteUrl || typeof websiteUrl !== 'string') {
      throw new ValidationError('Website URL is required');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Knowledge base name is required');
    }

    // Validate URL format
    try {
      const url = new URL(websiteUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      throw new ValidationError('Please provide a valid HTTP/HTTPS URL');
    }

    // Import website extraction logic
    const cheerio = await import('cheerio');
    
    let extractedContent: string;
    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error('URL does not return HTML content');
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .menu, .navigation, .sidebar, .ads, .advertisement, .cookie-banner, .popup').remove();
      
      // Extract metadata
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Focus on main content areas
      const contentSelectors = [
        'main', '[role="main"]', '.content', '.main-content', '.page-content',
        'article', '.article-content', 'section', '.container'
      ];
      
      let bestContent = '';
      let maxLength = 0;
      
      // Try to find the best main content
      for (const selector of contentSelectors) {
        const elements = $(selector);
        elements.each((_, element) => {
          const text = $(element).text().trim();
          if (text.length > maxLength && text.length > 200) {
            maxLength = text.length;
            bestContent = text;
          }
        });
      }
      
      // Use best content if found, otherwise fallback to body
      const mainContent = bestContent || $('body').text();
      
      // Extract headings for better structure
      const headings: string[] = [];
      $('h1, h2, h3').each((_, element) => {
        const headingText = $(element).text().trim();
        if (headingText && headingText.length < 200) {
          headings.push(headingText);
        }
      });
      
      // Clean up the text
      const cleanText = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .replace(/[\r\n\t]+/g, ' ')
        .trim();
      
      // Construct final content with metadata
      let finalContent = '';
      
      if (title) {
        finalContent += `Page Title: ${title}\n\n`;
      }
      
      if (metaDescription) {
        finalContent += `Description: ${metaDescription}\n\n`;
      }
      
      if (headings.length > 0) {
        finalContent += `Main Headings:\n${headings.slice(0, 10).map(h => `- ${h}`).join('\n')}\n\n`;
      }
      
      finalContent += `Main Content:\n${cleanText}`;
      
      extractedContent = finalContent.substring(0, 100000); // Limit to 100KB
      
    } catch (error) {
      throw new ValidationError(`Failed to extract content from website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!extractedContent || extractedContent.trim().length < 100) {
      throw new ValidationError('Insufficient content found on the website');
    }

    // Process the extracted content
    const result = await processDocument(userId, extractedContent, {
      name: name.trim(),
      description: description?.trim() || `Content extracted from ${websiteUrl}`,
      sourceType: 'WEBSITE',
      sourceUrl: websiteUrl,
      chunkingOptions: {
        maxTokens: 512,
        overlapTokens: 50,
        preserveParagraphs: true,
        preserveSentences: true,
      },
    });

    if (result.status === 'ERROR') {
      throw new Error(result.error || 'Failed to process website content');
    }

    return createSuccessResponse({
      message: 'Website content extracted and processed successfully',
      knowledgeBaseId: result.knowledgeBaseId,
      totalChunks: result.totalChunks,
      status: result.status,
      websiteUrl,
      extractedAt: new Date().toISOString(),
      contentLength: extractedContent.length,
    });

  } catch (error) {
    console.error('Website knowledge base creation error:', error);
    return handleApiError(error);
  }
}
