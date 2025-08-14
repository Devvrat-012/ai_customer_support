import { removeAuthCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';

export async function POST() {
  try {
    await removeAuthCookie();
    return createSuccessResponse(null, 'Logged out successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
