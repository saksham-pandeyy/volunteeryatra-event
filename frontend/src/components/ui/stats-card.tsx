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
    <Card className="relative overflow-hidden border border-surface-border bg-surface p-5 transition-all hover:border-primary/30 flex flex-col justify-between min-h-[130px] shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
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

      <div className="mt-2 space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </h3>

        {(cardTrend || cardDescription) && (
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-muted">
            {cardTrend && (
              <span className={`inline-flex items-center gap-1 font-semibold ${cardPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {cardPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {cardTrend}
              </span>
            )}
            {cardTrend && cardDescription && <span className="text-base-300">•</span>}
            {cardDescription && (
              <span className="font-normal text-muted">{cardDescription}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

export function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border border-surface-border bg-surface p-5 flex flex-col justify-between min-h-[140px] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <SkeletonText className="w-16 h-3" />
        <div className="w-8 h-8 rounded-xl skeleton shrink-0" />
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonText className="w-16 h-8" />
        <SkeletonText className="w-32 h-3 mt-1" />
      </div>
    </Card>
  );
}

export function StatsGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}
