import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, ValidationError } from '@/lib/utils/errors';

// Rate limiting and security
const MAX_CONTENT_LENGTH = 100000; // 100KB max content
const TIMEOUT_MS = 30000; // 30 seconds timeout

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Helper function to clean and extract text content
const extractTextContent = (html: string): string => {
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script, style, nav, header, footer, aside, .menu, .navigation, .sidebar, .ads, .advertisement, .cookie-banner, .popup').remove();
  
  // Extract metadata
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  
  // Focus on main content areas with priority
  const contentSelectors = [
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    '.page-content',
    'article',
    '.article-content',
    'section',
    '.container',
    'div.content'
  ];
  
  let extractedText = '';
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
  extractedText = bestContent || $('body').text();
  
  // Extract headings for better structure
  const headings: string[] = [];
  $('h1, h2, h3').each((_, element) => {
    const headingText = $(element).text().trim();
    if (headingText && headingText.length < 200) {
      headings.push(headingText);
    }
  });
  
  // Clean up the text
  const cleanText = extractedText
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/[\r\n\t]+/g, ' ') // Replace tabs and newlines with spaces
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
  
  return finalContent.substring(0, MAX_CONTENT_LENGTH);
};

// Helper function to fetch page content with timeout
const fetchWithTimeout = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error('URL does not return HTML content');
    }
    
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Main function to extract website data
const extractWebsiteData = async (baseUrl: string): Promise<string> => {
  if (!isValidUrl(baseUrl)) {
    throw new ValidationError('Invalid URL provided');
  }
  
  try {
    const html = await fetchWithTimeout(baseUrl);
        // Extract text content
    const textContent = extractTextContent(html);
    
    if (textContent.length < 100) {
      throw new ValidationError('Insufficient content found on the website');
    }
    
    return textContent;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error(`Failed to extract website content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { websiteUrl } = await request.json();

    if (!websiteUrl || typeof websiteUrl !== 'string') {
      throw new ValidationError('Website URL is required');
    }

    // Validate URL format
    if (!isValidUrl(websiteUrl)) {
      throw new ValidationError('Please provide a valid HTTP/HTTPS URL');
    }

    // Extract website data
    const extractedContent = await extractWebsiteData(websiteUrl);
    
    // Get user data to update
    const userId = currentUser.userId;
    if (!userId) {
      throw new AuthenticationError('Invalid user token');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Format the content with metadata
    const formattedContent = `Website Data from: ${websiteUrl}
Extracted on: ${new Date().toISOString()}
Content Length: ${extractedContent.length} characters

=== WEBSITE CONTENT ===
${extractedContent}

=== END WEBSITE CONTENT ===`;

    // Get current user's company info to append to existing content
    const userWithCompanyInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyInfo: true }
    });

    let updatedCompanyInfo = formattedContent;

    // If there's existing content, append the new content with a separator
    if (userWithCompanyInfo?.companyInfo && userWithCompanyInfo.companyInfo.trim()) {
      updatedCompanyInfo = `${userWithCompanyInfo.companyInfo}

${'='.repeat(80)}
ADDITIONAL WEBSITE EXTRACTION
${'='.repeat(80)}

${formattedContent}`;
    }

    // Update user's company info with combined content
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyInfo: updatedCompanyInfo
      }
    });

    return createSuccessResponse({
      message: userWithCompanyInfo?.companyInfo ? 
        'Website data extracted and appended to existing company information' : 
        'Website data extracted and saved successfully',
      contentLength: extractedContent.length,
      totalContentLength: updatedCompanyInfo.length,
      websiteUrl,
      extractedAt: new Date().toISOString(),
      isAppended: !!userWithCompanyInfo?.companyInfo
    });

  } catch (error) {
    console.error('Website extraction error:', error);
    return handleApiError(error);
  }
}
