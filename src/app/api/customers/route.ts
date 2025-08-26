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

// GET /api/customers - Get paginated list of customers
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
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'lastSeenAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const whereClause: {
      companyUserId: string;
      OR?: Array<{
        customerId?: { contains: string; mode: 'insensitive' };
        customerName?: { contains: string; mode: 'insensitive' };
        customerEmail?: { contains: string; mode: 'insensitive' };
        customerPhone?: { contains: string; mode: 'insensitive' };
      }>;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      companyUserId: user.id,
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { customerId: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
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
    const totalCount = await prisma.customer.count({
      where: whereClause,
    });

    // Get paginated customers
    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        conversations: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 1, // Get latest conversation
        },
        _count: {
          select: { conversations: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data to include conversation stats
    const transformedCustomers = customers.map((customer: {
      id: string;
      customerId: string;
      customerName?: string | null;
      customerEmail?: string | null;
      customerPhone?: string | null;
      sessionCount: number;
      lastSeenAt?: Date | null;
      createdAt: Date;
      conversations: Array<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        _count: { messages: number };
      }>;
      _count: { conversations: number };
    }) => ({
      ...customer,
      conversationCount: customer._count.conversations,
      latestConversation: customer.conversations[0] || null,
      conversations: undefined, // Remove from response
      _count: undefined, // Remove from response
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      },
    });

  } catch (error) {
    console.error('Customers API error:', error);

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
