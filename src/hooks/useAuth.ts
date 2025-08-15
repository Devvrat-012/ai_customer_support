import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/authSlice';

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authCheckRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (authCheckRef.current) return;
      authCheckRef.current = true;

      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
          dispatch(setUser(result.data));
        } else {
          dispatch(clearUser());
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(clearUser());
        router.push('/auth/login');
      } finally {
        dispatch(setLoading(false));
      }
    };

    // Only check auth if we don't have a user and haven't checked yet
    if (!user && !isAuthenticated && !authCheckRef.current) {
      checkAuth();
    }
  }, [user, isAuthenticated, dispatch, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
