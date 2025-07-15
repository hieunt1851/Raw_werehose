'use client';

import { useState, useCallback } from 'react';
import { Toast } from './Toast';
import { ToastMessage, ToastType } from '@/types';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast globally
  if (typeof window !== 'undefined') {
    (window as any).showToast = addToast;
  }

  return (
    <div className="fixed bottom-0 right-0 p-3 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast} onClose={removeToast} />
      ))}
    </div>
  );
} 