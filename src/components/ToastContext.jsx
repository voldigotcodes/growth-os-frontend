import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({ addToast: () => {} });

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, variant = 'success') => {
    toastCounter += 1;
    const id = toastCounter;
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-[9999] flex w-80 flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'pointer-events-auto overflow-hidden rounded-lg border px-4 py-3 shadow-lg backdrop-blur-xl transition-all duration-300',
              toast.variant === 'error'
                ? 'border-rose-400/50 bg-rose-500/20 text-rose-100'
                : 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
