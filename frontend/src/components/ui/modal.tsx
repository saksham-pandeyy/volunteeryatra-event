import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "secondary" | "danger" | "ghost";
  confirmLoading?: boolean;
}

export function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  className, 
  icon,
  confirmText,
  cancelText,
  onConfirm,
  confirmVariant = "primary",
  confirmLoading = false
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-200"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className={clsx(
          "bg-white rounded-[12px] shadow-xl w-full max-w-sm p-6 relative border border-slate-100 transform transition-all duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          {icon && (
            <div className="mb-4">
              {icon}
            </div>
          )}
          {title && (
            <h2 className="text-xl font-bold text-slate-800 mb-3">{title}</h2>
          )}
          <div className="w-full">
            {children}
          </div>

          {onConfirm && (
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full"
              >
                {cancelText || "Cancel"}
              </Button>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                loading={confirmLoading}
                className="w-full"
              >
                {confirmText || "Confirm"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
