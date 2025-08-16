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
import { loginSchema, type LoginData } from '@/lib/db/schema';
import { gradients, shadows, typography } from '@/lib/design-system';
import { Bot } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
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
          title: 'Welcome back!',
          message: result.message,
        }));
        
        onSuccess?.();
        router.push('/dashboard');
      } else {
        dispatch(addAlert({
          type: 'error',
          title: 'Login Failed',
          message: result.error,
        }));
      }
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Login Failed',
        message: 'An unexpected error occurred',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${shadows.cardLarge} border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}>
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className={`p-3 ${gradients.primary} rounded-xl ${shadows.card}`}>
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className={`${typography.heading2} ${gradients.text}`}>Welcome back</CardTitle>
        <CardDescription className="text-center text-gray-100">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={`${errors.email ? 'border-destructive' : 'border-gray-200 focus:border-purple-300 focus:ring-purple-200'} transition-colors`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`${errors.password ? 'border-destructive pr-10' : 'pr-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200'} transition-colors`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className={`${gradients.text} hover:underline font-medium`}>
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
