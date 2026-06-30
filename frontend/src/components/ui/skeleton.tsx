import clsx from "clsx";
import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

function SkeletonBase({ className, style }: SkeletonProps) {
  return <div className={clsx("skeleton", className)} style={style} />;
}

export function SkeletonText({ className }: SkeletonProps) {
  return <SkeletonBase className={clsx("h-4 w-full", className)} />;
}

export function SkeletonHeading({ className }: SkeletonProps) {
  return <SkeletonBase className={clsx("h-6 w-48", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={clsx("rounded-xl border border-surface-border bg-surface p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <SkeletonText className="w-24" />
        <SkeletonBase className="h-4 w-4 rounded-full" />
      </div>
      <SkeletonHeading className="w-32 mb-2" />
      <SkeletonText className="w-40" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-surface-border overflow-hidden">
      <div className="bg-surface border-b border-surface-border px-4 py-3">
        <div className="flex gap-8">
          <SkeletonText className="w-48" />
          <SkeletonText className="w-32" />
          <SkeletonText className="w-32" />
          <SkeletonText className="w-24" />
          <SkeletonText className="w-20" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-8 px-4 py-3 border-b border-surface-border last:border-0">
          <SkeletonText className="w-48" />
          <SkeletonText className="w-32" />
          <SkeletonText className="w-32" />
          <SkeletonText className="w-24" />
          <SkeletonBase className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonProps) {
  const barHeights = [35, 55, 45, 75, 60, 85];
  return (
    <div className={clsx("rounded-xl border border-surface-border bg-surface p-5", className)}>
      <div className="flex items-center justify-between mb-6">
        <SkeletonText className="w-32" />
        <SkeletonBase className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {barHeights.map((h, i) => (
          <SkeletonBase key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonPieChart({ className }: SkeletonProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center h-full py-6", className)}>
      {/* Donut chart skeleton — only the ring animates, background stays clean */}
      <div className="relative w-32 h-32 mb-5">
        {/* Base ring with skeleton animation */}
        <div className="absolute inset-0 rounded-full skeleton" />
        {/* Inner hole — matches surface bg */}
        <div className="absolute inset-[20px] rounded-full bg-surface" />
        {/* Segment overlays with conic slices to simulate pie chart */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 0,
            background: 'conic-gradient(rgba(255,255,255,0.25) 0deg 130deg, transparent 130deg 360deg)',
            mask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
            WebkitMask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            inset: 0,
            background: 'conic-gradient(rgba(255,255,255,0.15) 200deg 280deg, transparent 280deg 360deg)',
            mask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
            WebkitMask: 'radial-gradient(circle at center, transparent 45%, black 45%)',
          }}
        />
      </div>
      {/* Legend skeleton — rows of dots + lines */}
      <div className="flex items-center gap-5">
        {[
          { dotClass: "bg-surface-border", textClass: "w-14" },
          { dotClass: "bg-surface-border", textClass: "w-16" },
          { dotClass: "bg-surface-border", textClass: "w-12" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={clsx("w-2.5 h-2.5 rounded-full", item.dotClass)} />
            <div className={clsx("skeleton h-3 rounded", item.textClass)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <SkeletonBase className={clsx("h-8 w-8 rounded-full", className)} />;
}

export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div className={clsx("relative overflow-hidden border border-surface-border bg-surface p-5 flex flex-col justify-between min-h-[140px] shadow-sm rounded-xl", className)}>
      <div className="flex items-center justify-between mb-3">
        <SkeletonText className="w-24 h-3" />
        <SkeletonBase className="w-8 h-8 rounded-xl shrink-0" />
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonText className="w-16 h-8" />
        <SkeletonText className="w-32 h-3 mt-1" />
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <SkeletonText className="w-16 mb-1.5" />
          <SkeletonBase className="h-10 w-full rounded-md" />
        </div>
      ))}
      <SkeletonBase className="h-10 w-32 rounded-md mt-6" />
    </div>
  );
}
