"use client";

import type { ReactNode, ComponentType } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface BentoCardProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  children: ReactNode;
  action?: ReactNode;
  titleExtra?: ReactNode;
  className?: string;
  span?: number;
  delay?: number;
}

export function BentoCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
  titleExtra,
  className = "",
  span = 1,
  delay = 0,
}: BentoCardProps) {
  return (
    <motion.div
      className={clsx(
        "flex flex-col relative overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm hover:shadow-md transition-shadow duration-300",
        span === 1 ? "md:col-span-1" : span === 2 ? "md:col-span-2" : span === 3 ? "md:col-span-3" : span === 4 ? "md:col-span-4" : span === 5 ? "md:col-span-5" : "md:col-span-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border z-10 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <Icon size={18} strokeWidth={1.75} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground leading-none">{title}</h3>
              {titleExtra && <div className="flex items-center">{titleExtra}</div>}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted mt-1 leading-none">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="z-10">{action}</div>}
      </div>
      <div className="flex-1 p-5 z-10">
        {children}
      </div>
    </motion.div>
  );
}
