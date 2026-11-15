import React, { createContext, useContext, useState, useCallback } from 'react';
import { sound } from '../../services/sound';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  code?: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (msg: Omit<ToastMessage, 'id'>) => void;
  showError: (err: any, fallbackMessage?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (errOrMessage: any, fallbackMessage?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...msg, id };
    setToasts((prev) => [...prev, newToast]);
    if (msg.type === 'error') {
      sound.err();
    } else if (msg.type === 'success') {
      sound.win();
    } else {
      sound.blip();
    }
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const showError = useCallback((err: any, fallbackMessage = 'An unexpected error occurred') => {
    const body = err?.body;
    const code = body?.code || (err?.status ? `HTTP-${err.status}` : undefined);
    const message = body?.detail || body?.message || err?.message || fallbackMessage;
    const title = body?.title || (code ? `Error ${code}` : 'Error');
    showToast({
      type: 'error',
      title,
      message,
      code,
    });
  }, [showToast]);

  const showSuccess = useCallback((message: string, title = 'Success') => {
    showToast({
      type: 'success',
      title,
      message,
    });
  }, [showToast]);

  const success = showSuccess;

  const error = useCallback((errOrMessage: any, fallbackMessage?: string) => {
    if (typeof errOrMessage === 'string') {
      showToast({
        type: 'error',
        title: 'Error',
        message: errOrMessage,
      });
    } else {
      showError(errOrMessage, fallbackMessage);
    }
  }, [showToast, showError]);

  const info = useCallback((message: string, title = 'Notice') => {
    showToast({
      type: 'info',
      title,
      message,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, showError, showSuccess, success, error, info, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const bg =
            toast.type === 'error'
              ? 'bg-[#FF4D3D] text-[#FFF8DC]'
              : toast.type === 'success'
              ? 'bg-[#43D17A] text-[#1B1530]'
              : toast.type === 'warning'
              ? 'bg-[#FFD84D] text-[#1B1530]'
              : 'bg-[#59C9F5] text-[#1B1530]';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-[3px] border-[#0B071E] shadow-[4px_4px_0_#0B071E] p-3 ${bg} flex flex-col gap-1 transition-all`}
              role="alert"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  {toast.code ? `[${toast.code}] ` : ''}
                  {toast.title || toast.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="font-mono font-bold text-xs px-1.5 border border-[#0B071E] bg-white/20 hover:bg-white/40 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="font-mono text-xs leading-snug break-words">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
