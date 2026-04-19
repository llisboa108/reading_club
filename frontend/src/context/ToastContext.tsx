import { createContext, useContext, useState, ReactNode } from "react";
import { registerToast } from "../utils/toast";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (
    variant: ToastVariant,
    title: string,
    message?: string
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    variant: ToastVariant,
    title: string,
    message?: string
  ) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, variant, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };
  
  registerToast(showToast);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-999999 w-full max-w-md px-4 space-y-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ variant, title, message }: Toast) {
  const colors = {
    success: "border-success-500 bg-success-50",
    error: "border-error-500 bg-error-50",
    warning: "border-warning-500 bg-warning-50",
    info: "border-blue-500 bg-blue-50",
  };

  return (
    <div
      className={`border rounded-xl p-4 shadow-lg animate-slide-in ${colors[variant]}`}
    >
      <h4 className="text-sm font-semibold">{title}</h4>

      {message && (
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      )}
    </div>
  );
}