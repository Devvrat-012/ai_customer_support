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

// PATCH /api/customers/conversations/[id]/status - Update conversation status
export async function PATCH(
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

    const body = await request.json();
    const { status } = body;

    if (!status || !['ACTIVE', 'RESOLVED', 'CLOSED'].includes(status)) {
      throw new ValidationError('Valid status is required (ACTIVE, RESOLVED, CLOSED)');
    }

    // Verify conversation belongs to the user
    const existingConversation = await prisma.customerConversation.findFirst({
      where: {
        id: conversationId,
        customer: {
          companyUserId: user.id,
        },
      },
    });

    if (!existingConversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Update conversation status
    const updatedConversation = await prisma.customerConversation.update({
      where: { id: conversationId },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            sessionCount: true,
            lastSeenAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          ...updatedConversation,
          messageCount: updatedConversation._count.messages,
          _count: undefined,
        },
      },
      message: 'Conversation status updated successfully',
    });

  } catch (error) {
    console.error('Update conversation status API error:', error);

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
