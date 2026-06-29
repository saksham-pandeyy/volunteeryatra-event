"use client";

import { useMemo } from "react";

export type DateRangePreset = "7d" | "30d" | "90d" | "all";

interface DateRangePickerProps {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const options = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "all", label: "All time" },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-0.5 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            value === opt.value
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function getDateRangeLabel(preset: DateRangePreset): string {
  const labels: Record<DateRangePreset, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "all": "All time",
  };
  return labels[preset] || "All time";
}

export function useDateRangeLabel(preset: DateRangePreset): string {
  return useMemo(() => getDateRangeLabel(preset), [preset]);
}
