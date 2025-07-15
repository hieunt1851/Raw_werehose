'use client';

import { useEffect, useState } from 'react';
import { ToastMessage, ToastType } from '@/types';
import { X } from 'lucide-react';

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300);
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgClass = {
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }[message.type] || 'bg-gray-500';

  return (
    <div className={`toast align-items-center text-white ${bgClass} border-0 rounded-lg shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="d-flex items-center justify-between p-3">
        <div className="toast-body">{message.message}</div>
        <button 
          type="button" 
          className="btn-close btn-close-white ms-2" 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(message.id), 300);
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
} 