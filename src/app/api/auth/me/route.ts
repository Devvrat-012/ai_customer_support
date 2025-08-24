import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError, NotFoundError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated');
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return createSuccessResponse(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}
