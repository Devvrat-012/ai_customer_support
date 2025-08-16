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

// GET - Get current user profile
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Authentication required');
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { 
        id: currentUser.userId 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyName: true,
        companyInfo: true,
        widgetKey: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { aiReplies: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: unknown) {
    console.error('Profile API error:', error);
    
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
