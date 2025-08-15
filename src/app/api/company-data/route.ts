import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { companyData } = await request.json();

    if (!companyData || typeof companyData !== 'string') {
      throw new ValidationError('Company data is required and must be a string');
    }

    if (companyData.length > 50000) { // 50KB limit
      throw new ValidationError('Company data is too large. Maximum size is 50KB');
    }

    // Update user's company info
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: { companyInfo: companyData.trim() }
    });

    return createSuccessResponse(
      { 
        companyInfo: updatedUser.companyInfo,
        message: 'Company data uploaded successfully'
      },
      'Company data uploaded successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { companyInfo: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return createSuccessResponse({
      companyInfo: user.companyInfo || null
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    const { companyData } = await request.json();

    if (!companyData || typeof companyData !== 'string') {
      throw new ValidationError('Company data is required and must be a string');
    }

    if (companyData.length > 50000) { // 50KB limit
      throw new ValidationError('Company data is too large. Maximum size is 50KB');
    }

    // Update user's company info
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: { companyInfo: companyData.trim() }
    });

    return createSuccessResponse(
      { 
        companyInfo: updatedUser.companyInfo,
        message: 'Company data updated successfully'
      },
      'Company data updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    // Remove user's company info
    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { companyInfo: null }
    });

    return createSuccessResponse(
      { message: 'Company data deleted successfully' },
      'Company data deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
