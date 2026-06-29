"use client";

import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import { useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, type = "text", ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="text-label">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
          type={inputType}
          className={clsx(
            "form-input w-full",
            isPassword && "pr-12",
            error && "border-danger focus:border-danger focus:ring-danger-muted",
            className
          )}
          style={{ borderRadius: "8px" }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M21 21l-3.35-3.35m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 1 1 14.14 14.14M21 12a9.44 9.44 0 0 1-2.183 5.404m2.183-5.404a10.29 10.29 0 0 0-5.29-8.19M17 10a4 4 0 0 0-4-4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-error mt-1">{error}</p>}
    </div>
  );
}
