import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// Lazy secret accessor to allow setting process.env.JWT_SECRET in tests after module import.
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}
const COOKIE_NAME = process.env.COOKIE_NAME || 'auth-token';
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE || '604800'); // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  // Standard claims can exist (exp, iat) but are inferred
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const secretKey = getSecretKey();
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ['HS256'],
  });
  // Basic shape assurance
  if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload');
  }
  return payload as JWTPayload;
}

export async function setAuthCookie(payload: JWTPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value || null;
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    return await verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}
