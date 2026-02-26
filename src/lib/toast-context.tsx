import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  show: (title: string, message: string, type?: Toast['type']) => void;
  remove: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  }, []);

  const show = useCallback((title: string, message: string, type: Toast['type'] = 'success') => {
    const id = ++counter;
    setToasts(t => [...t, { id, title, message, type }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toasts, show, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastCustom() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastCustom must be used within ToastProvider');
  return ctx;
}
