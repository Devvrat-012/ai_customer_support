import { NextRequest } from 'next/server';
import https from 'https';
import http from 'http';
import { createGunzip, createInflate } from 'zlib';
import { TextDecoder } from 'util';
import { getCurrentUser } from '@/lib/auth';
import { processDocument } from '@/lib/vector/knowledge';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

// Helper to detect charset from HTML meta tags
function extractCharsetFromHTML(html: string): string {
  // Try to find charset in meta tag
  const metaCharsetMatch = html.match(/<meta\s+charset=["']?([^"'>\s]+)/i);
  if (metaCharsetMatch) {
    return metaCharsetMatch[1];
  }
  
  // Try to find content-type meta tag
  const contentTypeMatch = html.match(/<meta\s+http-equiv=["']?content-type["']?\s+content=["']([^"']+)["']/i);
  if (contentTypeMatch) {
    const charsetMatch = contentTypeMatch[1].match(/charset=([^;\s]+)/i);
    if (charsetMatch) {
      return charsetMatch[1];
    }
  }
  
  return 'utf-8'; // Default
}

// Helper function to fetch with SSL bypass capability
async function fetchWithSSLBypass(url: string, options: RequestInit & { bypassSSL?: boolean } = {}): Promise<Response> {
  const { bypassSSL = false, ...fetchOptions } = options;
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  
  // For HTTPS URLs, always use the custom implementation to bypass SSL
  if (isHttps || bypassSSL) {
    return new Promise((resolve, reject) => {
      const client = isHttps ? https : http;
      
      const requestOptions: any = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          ...(options.headers as Record<string, string>),
          'Host': urlObj.hostname,
        },
      };
      
      // Bypass SSL verification for HTTPS
      if (isHttps) {
        requestOptions.rejectUnauthorized = false;
        requestOptions.agent = new https.Agent({ rejectUnauthorized: false });
      }
      
      let timeoutHandle: NodeJS.Timeout;
      const req = client.request(requestOptions, (res) => {
        const chunks: Buffer[] = [];
        const contentType = res.headers['content-type'] || '';
        const contentEncoding = (res.headers['content-encoding'] || '').toLowerCase();
        
        console.log(`[Website Extract] Content-Encoding: ${contentEncoding || 'none'}, Content-Type: ${contentType}`);
        
        // Set a timeout for reading the response
        timeoutHandle = setTimeout(() => {
          req.destroy();
          reject(new Error('Response timeout after 30 seconds'));
        }, 30000);
        
        // Handle compression
        let stream: NodeJS.ReadableStream = res;
        if (contentEncoding === 'gzip') {
          stream = res.pipe(createGunzip()) as NodeJS.ReadableStream;
        } else if (contentEncoding === 'deflate') {
          stream = res.pipe(createInflate()) as NodeJS.ReadableStream;
        }
        
        stream.on('data', chunk => {
          chunks.push(chunk);
        });
        
        stream.on('end', () => {
          clearTimeout(timeoutHandle);
          
          // Convert buffer to string with proper encoding
          const buffer = Buffer.concat(chunks);
          let data: string;
          
          // Check for charset in Content-Type header first
          let charset = 'utf-8';
          const charsetMatch = contentType.match(/charset=([^;\s]+)/i);
          if (charsetMatch) {
            charset = charsetMatch[1].trim().toLowerCase();
          }
          
          try {
            // Try to decode with detected charset
            data = buffer.toString(charset as BufferEncoding);
            console.log(`[Website Extract] Successfully decoded with charset: ${charset}`);
            
            // If it looks corrupted, also check HTML meta tags for charset
            if (data.includes('charset') && charset === 'utf-8') {
              const htmlCharset = extractCharsetFromHTML(data.substring(0, 5000));
              if (htmlCharset && htmlCharset !== charset) {
                console.log(`[Website Extract] Detected alternate charset in HTML: ${htmlCharset}`);
                data = buffer.toString(htmlCharset as BufferEncoding);
              }
            }
          } catch (error) {
            // Fallback to utf-8 if charset is invalid
            console.warn(`Invalid charset "${charset}", falling back to utf-8`);
            data = buffer.toString('utf-8');
          }
          
          const response = new Response(data, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: new Headers(res.headers as Record<string, string>),
          });
          resolve(response);
        });
        
        stream.on('error', (err) => {
          clearTimeout(timeoutHandle);
          reject(err);
        });
      });
      
      req.on('error', (err) => {
        clearTimeout(timeoutHandle);
        reject(err);
      });
      
      // Set timeout for the request itself
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }
  
  // For HTTP, use the standard fetch
  return fetch(url, fetchOptions);
}

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
      let response;
      try {
        console.log(`[Website Extract] Attempting to fetch: ${websiteUrl}`);
        response = await fetchWithSSLBypass(websiteUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        });
        console.log(`[Website Extract] Fetch successful, status: ${response.status}`);
      } catch (fetchError) {
        console.error(`[Website Extract] Fetch error for ${websiteUrl}:`, fetchError);
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        
        if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('ECONNREFUSED')) {
          throw new Error(`Website unreachable: ${websiteUrl} (DNS or connection error)`);
        } else if (errorMsg.includes('timeout') || errorMsg.includes('TimeoutError')) {
          throw new Error(`Request timed out after 30 seconds`);
        } else if (errorMsg.includes('getaddrinfo')) {
          throw new Error(`DNS lookup failed for ${websiteUrl}`);
        }
        throw new Error(`Network error: ${errorMsg}`);
      }

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
