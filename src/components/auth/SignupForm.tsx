"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser } from '@/lib/store/authSlice';
import { addAlert } from '@/lib/store/alertSlice';
import { signupSchema, type SignupData } from '@/lib/db/schema';
import { gradients, shadows, typography } from '@/lib/design-system';
import { Bot } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        dispatch(setUser(result.data));
        dispatch(addAlert({
          type: 'success',
          title: 'Account Created',
          message: result.message,
        }));
        
        onSuccess?.();
        router.push('/dashboard');
      } else {
        dispatch(addAlert({
          type: 'error',
          title: 'Signup Failed',
          message: result.error,
        }));
      }
    } catch {
      dispatch(addAlert({
        type: 'error',
        title: 'Signup Failed',
        message: 'An unexpected error occurred',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${shadows.cardLarge} border-0 bg-white dark:bg-gray-900 backdrop-blur-sm`}>
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className={`p-3 ${gradients.primary} rounded-xl ${shadows.card}`}>
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>
  <CardTitle className={`${typography.heading2} text-gray-900 dark:text-gray-100`}>Create your account</CardTitle>
  <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Enter your information to get started with AI Customer Support
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-900 dark:text-gray-100">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className={`${errors.firstName ? 'border-destructive' : ''} transition-colors`}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className={`${errors.lastName ? 'border-destructive' : ''} transition-colors`}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              {...register('email')}
              className={`${errors.email ? 'border-destructive' : ''} transition-colors`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-900 dark:text-gray-100">Company Name (Optional)</Label>
            <Input
              id="companyName"
              placeholder="Your Company Inc."
              {...register('companyName')}
              className={`${errors.companyName ? 'border-destructive' : ''} transition-colors`}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...register('password')}
                className={`${errors.password ? 'border-destructive pr-10' : 'pr-10'} transition-colors`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className={`w-full ${gradients.primary} ${gradients.primaryHover} text-white ${shadows.button} transition-all duration-300 transform hover:scale-105`} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className={`text-primary hover:underline font-medium`}>
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
