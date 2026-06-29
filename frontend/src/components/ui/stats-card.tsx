"use client";

import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./card";
import { SkeletonText } from "./skeleton";
import type { ComponentType, ReactNode } from "react";

export interface TrendData {
  direction: "up" | "down" | "neutral";
  value: string;
}

interface StatsCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtext?: string;
  description?: string;
  trend?: TrendData | string;
  accentColor?: string;
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  isPositive?: boolean;
  loading?: boolean;
}

export const StatsCard = memo(function StatsCard({
  label,
  title,
  value,
  subtext,
  description,
  trend,
  isPositive = true,
  icon: Icon,
  accentColor = "var(--color-primary)",
  loading = false,
}: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />;

  const cardTitle = title || label || "";
  const cardDescription = description || subtext || "";
  
  let cardTrend: string | undefined = undefined;
  let cardPositive = isPositive;

  if (trend) {
    if (typeof trend === "object") {
      cardTrend = trend.value;
      cardPositive = trend.direction === "up";
    } else {
      cardTrend = String(trend);
    }
  }

  return (
    <Card className="relative overflow-hidden border border-surface-border bg-surface p-5 transition-all hover:border-primary/30 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md">
      {/* Header — title + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">
          {cardTitle}
        </span>
        {Icon && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 bg-primary/10"
          >
            <Icon size={15} strokeWidth={2} className="text-primary" />
          </div>
        )}
      </div>

      {/* Value & description/trend */}
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-black leading-none tracking-tight text-foreground">
          {value}
        </h3>

        {(cardTrend || cardDescription) && (
          <div className="flex items-center gap-2 mt-1">
            {cardTrend && (
              <div className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${cardPositive ? "text-green-600" : "text-rose-600"}`}>
                {cardPositive ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                {cardTrend}
              </div>
            )}
            {cardDescription && (
              <span className="text-[10px] text-muted font-medium">{cardDescription}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

export function StatsCardSkeleton() {
  return (
    <div className="flex flex-col justify-between min-h-[140px] p-5 rounded-xl border border-surface-border bg-surface shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <SkeletonText className="w-[55%] h-3" />
        <SkeletonText className="w-8 h-8 rounded-xl" />
      </div>
      <SkeletonText className="w-[35%] h-7 mb-4" />
      <SkeletonText className="w-[50%] h-2.5" />
    </div>
  );
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
}: any) {
  return (
    <div
      className={`col-span-1 md:col-span-${span} rounded-xl border border-surface-border bg-surface flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border z-10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-all">
              <Icon size={17} strokeWidth={1.5} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
              {titleExtra && <div className="flex items-center">{titleExtra}</div>}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted mt-0.5 leading-none">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="header-action">{action}</div>}
      </div>
      <div className="flex-1 p-5 z-10">
        {children}
      </div>
    </div>
  );
}

export function StatsGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-6 ${className}`}>
      {children}
    </div>
  );
}
