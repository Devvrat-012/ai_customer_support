import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// GET /api/customers/conversations/[id]/messages - Get conversation with messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = authResult.user;
    const { id: conversationId } = await context.params;

    if (!conversationId) {
      throw new ValidationError('Conversation ID is required');
    }

    // Get conversation with messages, ensuring it belongs to the authenticated user
    const conversation = await prisma.customerConversation.findFirst({
      where: {
        id: conversationId,
        customer: {
          companyUserId: user.id,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            customerMeta: true,
            sessionCount: true,
            lastSeenAt: true,
            createdAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation,
      },
    });

  } catch (error) {
    console.error('Conversation messages API error:', error);

    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { 
        status: error instanceof UnauthorizedError ? 401 : 
               error instanceof NotFoundError ? 404 : 400 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
