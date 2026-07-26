import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Automatically remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  }, [removeToast]);

  const success = useCallback((message: string) => toast(message, 'success'), [toast]);
  const error = useCallback((message: string) => toast(message, 'error'), [toast]);
  const info = useCallback((message: string) => toast(message, 'info'), [toast]);

  const value = useMemo(() => ({ toast, success, error, info }), [toast, success, error, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Render Overlay */}
      <div 
        id="toast-container"
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3.5 w-full max-w-sm px-4 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            let bgClass = "bg-surface text-on-surface border-outline-variant/30";
            let Icon = Info;
            let iconColor = "text-primary";

            if (t.type === 'success') {
              bgClass = "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20";
              Icon = CheckCircle;
              iconColor = "text-tertiary";
            } else if (t.type === 'error') {
              bgClass = "bg-red-50 text-red-900 border-red-200";
              Icon = AlertCircle;
              iconColor = "text-red-600";
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md ${bgClass} transition-shadow duration-300 hover:shadow-xl`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className={`shrink-0 ${iconColor}`} />
                  <p className="text-xs font-semibold leading-relaxed">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="rounded-full p-1 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                  aria-label="Close notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
