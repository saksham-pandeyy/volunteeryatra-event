import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface text-foreground hover:bg-surface-hover border border-surface-border",
  danger: "bg-danger text-white hover:bg-danger-hover",
  ghost: "text-foreground hover:bg-surface-hover",
};

const sizeStyles = { sm: "px-3 text-xs", md: "px-4 text-sm", lg: "px-6 text-base" };

export function Button({ variant = "primary", size = "md", loading = false, disabled, children, className, ...props }: ButtonProps) {
  return (
    <button className={clsx(
      "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variantStyles[variant], sizeStyles[size], className
    )} style={{ paddingTop: "0.65rem", paddingBottom: "0.65rem", borderRadius: "8px" }} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
