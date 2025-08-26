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

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// GET /api/customers/conversations - Get paginated list of conversations
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status') || 'ALL';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const whereClause: {
      customer: {
        companyUserId: string;
        id?: string;
      };
      status?: 'ACTIVE' | 'RESOLVED' | 'CLOSED';
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      customer: {
        companyUserId: user.id,
      },
    };

    // Add customer filter
    if (customerId) {
      whereClause.customer.id = customerId;
    }

    // Add status filter
    if (status !== 'ALL') {
      whereClause.status = status as 'ACTIVE' | 'RESOLVED' | 'CLOSED';
    }

    // Add date filters
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Get total count
    const totalCount = await prisma.customerConversation.count({
      where: whereClause,
    });

    // Get paginated conversations
    const conversations = await prisma.customerConversation.findMany({
      where: whereClause,
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
        messages: {
          select: {
            id: true,
            sender: true,
            content: true,
            messageType: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest message
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data to include message stats
    const transformedConversations = conversations.map((conversation: {
      id: string;
      customerId: string;
      sessionId: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      customer: {
        id: string;
        customerId: string;
        customerName?: string | null;
        customerEmail?: string | null;
        customerPhone?: string | null;
        sessionCount: number;
        lastSeenAt?: Date | null;
        createdAt: Date;
      };
      messages: Array<{
        id: string;
        sender: string;
        content: string;
        messageType: string;
        createdAt: Date;
      }>;
      _count: { messages: number };
    }) => ({
      ...conversation,
      messageCount: conversation._count.messages,
      lastMessage: conversation.messages[0] || null,
      messages: undefined, // Remove from response
      _count: undefined, // Remove from response
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        conversations: transformedConversations,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      },
    });

  } catch (error) {
    console.error('Conversations API error:', error);

    if (error instanceof ValidationError || error instanceof UnauthorizedError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { 
        status: error instanceof UnauthorizedError ? 401 : 400 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
