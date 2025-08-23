import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/db/schema';
import { verifyPassword, setAuthCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { AuthenticationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Set auth cookie
  await setAuthCookie({
      userId: user.id,
      email: user.email,
    });

    // Return user data without password
    const { password: _password, ...userWithoutPassword } = user;

    return createSuccessResponse(
      userWithoutPassword,
      'Login successful'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
