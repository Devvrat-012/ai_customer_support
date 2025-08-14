import { z } from 'zod';

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
  companyInfo: z.string().optional(),
});

export const selectUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().nullable(),
  companyInfo: z.string().nullable(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  companyName: true,
});

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
