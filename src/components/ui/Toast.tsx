import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles = {
    success: 'bg-emerald-900/90 text-white border-emerald-700/50',
    error: 'bg-rose-900/90 text-white border-rose-700/50',
    info: 'bg-slate-900/90 text-white border-slate-700/50',
  }[toast.type];

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-200 transform translate-y-0 ${bgStyles}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold leading-5 text-white">{toast.title}</h4>
        {toast.message && <p className="text-xs text-white/80 mt-0.5 leading-4">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-white/60 hover:text-white transition-colors p-1 rounded-md"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
