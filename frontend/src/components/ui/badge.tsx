import clsx from "clsx";

interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning";
  children: string;
  className?: string;
}

const badgeVariants = {
  default: "bg-surface text-foreground",
  success: "bg-success-muted text-success",
  danger: "bg-danger-muted text-danger",
  warning: "bg-warning-muted text-warning",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
