import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Omit<Alert, 'id'>>) => {
      const alert: Alert = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        duration: action.payload.duration ?? 5000,
      };
      state.alerts.push(alert);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { addAlert, removeAlert, clearAlerts } = alertSlice.actions;
export default alertSlice.reducer;
