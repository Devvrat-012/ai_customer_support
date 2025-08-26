import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/db/schema';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api';
import { ConflictError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, companyName } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        companyName,
      }
    });

    // Set auth cookie
    await setAuthCookie({
      userId: newUser.id,
      email: newUser.email,
      id: newUser.id, // Add id field for compatibility
    });

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;

    return createSuccessResponse(
      userWithoutPassword,
      'Account created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
