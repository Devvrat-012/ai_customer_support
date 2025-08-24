import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Custom error classes
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// POST - Increment AI replies count
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { 
        id: currentUser.userId 
      },
      select: {
        id: true,
        _count: {
          select: { aiReplies: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create a new AI reply record to increment the count
    await prisma.aiReply.create({
      data: {
        userId: currentUser.userId,
        question: '', // Empty question as we're just tracking count
        response: '', // Empty response as we're just tracking count
      }
    });

    // Get updated count
    const updatedUser = await prisma.user.findUnique({
      where: { 
        id: currentUser.userId 
      },
      select: {
        _count: {
          select: { aiReplies: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        count: updatedUser?._count.aiReplies || 0
      }
    });

  } catch (error: unknown) {
    console.error('Increment AI replies API error:', error);
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 401 });
    }
    
    if (error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
