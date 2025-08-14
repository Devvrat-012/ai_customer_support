import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function createErrorResponse(
  error: string | Error,
  statusCode: number = 500
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return createErrorResponse(error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    return createErrorResponse(`Validation error: ${errorMessage}`, 400);
  }

  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }

  return createErrorResponse('An unexpected error occurred', 500);
}
