"use client";

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { removeAlert } from '@/lib/store/alertSlice';
import { useToast } from '@/hooks/use-toast';

export function AlertProvider() {
  const alerts = useAppSelector((state) => state.alert.alerts);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  useEffect(() => {
    alerts.forEach((alert) => {
      toast({
        title: alert.title,
        description: alert.message,
        variant: alert.type === 'error' ? 'destructive' : 'default',
      });

      // Auto remove alert after showing toast
      setTimeout(() => {
        dispatch(removeAlert(alert.id));
      }, alert.duration || 5000);
    });
  }, [alerts, dispatch, toast]);

  return null;
}
