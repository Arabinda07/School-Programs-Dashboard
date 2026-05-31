import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Warning, WarningCircle, Info, X } from '@phosphor-icons/react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const getToastStyles = (type: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50 border-emerald-100/80', iconColor: 'text-emerald-600', Icon: CheckCircle };
      case 'error': return { bg: 'bg-rose-50 border-rose-100/80', iconColor: 'text-rose-600', Icon: WarningCircle };
      case 'warning': return { bg: 'bg-amber-50 border-amber-100/80', iconColor: 'text-amber-600', Icon: Warning };
      default: return { bg: 'bg-indigo-50 border-indigo-100/80', iconColor: 'text-indigo-600', Icon: Info };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-150 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const { bg, iconColor, Icon } = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 ${bg} border rounded-xl p-4 shadow-xl min-w-[280px] max-w-md bg-white`}
              >
                <div className={`p-1.5 rounded-lg bg-white shadow-sm flex-shrink-0 ${iconColor}`}>
                  <Icon size={18} weight="fill" />
                </div>
                <div className="flex-1 text-sm font-medium py-1 text-slate-700">{toast.message}</div>
                <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-100/60 cursor-pointer">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
