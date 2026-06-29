"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

interface AuthAlertProps {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
}

export function AuthAlert({ type, message, className }: AuthAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message || !visible) return null;

  const inlineStyles = {
    success: {
      backgroundColor: "var(--color-success-muted, rgba(34, 197, 94, 0.12))",
      color: "var(--color-success, #22c55e)",
      borderColor: "rgba(34, 197, 94, 0.3)",
    },
    error: {
      backgroundColor: "var(--color-danger-muted, rgba(244, 63, 94, 0.12))",
      color: "var(--color-danger, #f43f5e)",
      borderColor: "rgba(244, 63, 94, 0.3)",
    },
    info: {
      backgroundColor: "var(--color-info-muted, rgba(59, 130, 246, 0.12))",
      color: "var(--color-info, #3b82f6)",
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 flex-shrink-0" style={{ color: "inherit" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 flex-shrink-0" style={{ color: "inherit" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 flex-shrink-0" style={{ color: "inherit" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-3 text-sm font-medium mb-4 transition-all duration-200 ease-in-out shadow-sm",
        className
      )}
      style={{
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1px solid transparent",
        ...inlineStyles[type],
        borderColor: "transparent",
      }}
    >
      {icons[type]}
      <span className="leading-tight flex-1" style={{ color: "inherit" }}>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="cursor-pointer focus:outline-none transition-colors p-0.5 opacity-60 hover:opacity-100 flex items-center justify-center"
        style={{ color: "inherit" }}
        aria-label="Dismiss alert"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
