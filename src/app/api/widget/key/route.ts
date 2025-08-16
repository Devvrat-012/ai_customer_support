import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Custom error class
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Generate a unique widget key
function generateWidgetKey(): string {
  const prefix = 'wgt';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`;
}

// GET - Get current widget key
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    console.log('Widget key API - Current user:', currentUser); // Debug log
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        debug: 'No current user found'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { 
        id: true, 
        widgetKey: true, 
        companyName: true,
        companyInfo: true 
      }
    });

    console.log('Widget key API - Found user:', user); // Debug log

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: 'User ID not found in database'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        widgetKey: user.widgetKey,
        hasCompanyInfo: !!user.companyInfo,
        companyName: user.companyName,
      },
      debug: `User ${user.id}, widget key: ${user.widgetKey || 'null'}`
    });

  } catch (error) {
    console.error('Get widget key error:', error);

    if (error instanceof AuthenticationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// POST - Generate new widget key
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const newWidgetKey = generateWidgetKey();

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: { widgetKey: newWidgetKey },
      select: { 
        id: true, 
        widgetKey: true, 
        companyName: true,
        companyInfo: true 
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        widgetKey: updatedUser.widgetKey,
        hasCompanyInfo: !!updatedUser.companyInfo,
        companyName: updatedUser.companyName,
        message: 'New widget key generated successfully'
      }
    });

  } catch (error) {
    console.error('Generate widget key error:', error);

    if (error instanceof AuthenticationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
