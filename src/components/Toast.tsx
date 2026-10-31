import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast: ToastMessage = {
    id: `toast_${Date.now()}_${Math.random()}`,
    type,
    message
  };
  toastListeners.forEach(fn => fn(toast));
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (newToast: ToastMessage) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== handler);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
            toast.type === 'success'
              ? 'bg-[#102019]/95 border-[#D4AF37]/50 text-[#F5F5F0]'
              : toast.type === 'error'
              ? 'bg-[#1a0e10]/95 border-[#D94B4B]/60 text-[#F5F5F0]'
              : 'bg-[#15291F]/95 border-[#263B30] text-[#F5F5F0]'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#D94B4B] shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#A5B2A9] shrink-0" />}
          
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#A5B2A9] hover:text-[#F5F5F0] transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
