"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, subDays, subMonths, startOfYear, startOfMonth, endOfMonth, isAfter, isBefore, isEqual, startOfDay } from "date-fns";
import "react-day-picker/style.css";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

export type DateRangePreset = "7d" | "14d" | "30d" | "90d" | "custom";

export interface DateRangeValue {
  preset: DateRangePreset;
  from: Date;
  to: Date;
}

interface PresetOption {
  value: DateRangePreset;
  label: string;
  getRange: () => { from: Date; to: Date };
}

const presets: PresetOption[] = [
  {
    value: "7d",
    label: "Last 7 days",
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    value: "14d",
    label: "Last 14 days",
    getRange: () => ({ from: subDays(new Date(), 13), to: new Date() }),
  },
  {
    value: "30d",
    label: "Last 30 days",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    value: "90d",
    label: "Last 90 days",
    getRange: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    value: "custom",
    label: "Custom range",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
];

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

function getInitialRange(preset: DateRangePreset): DateRangeValue {
  const p = presets.find((pr) => pr.value === preset) || presets[0];
  const { from, to } = p.getRange();
  return { preset, from, to };
}

export function getDateRangeLabel(value: DateRangeValue): string {
  if (value.preset === "custom") {
    return `${format(value.from, "MMM d, yyyy")} – ${format(value.to, "MMM d, yyyy")}`;
  }
  const p = presets.find((pr) => pr.value === value.preset);
  return p?.label || "Custom range";
}

export function useDateRangeLabel(value: DateRangeValue): string {
  return getDateRangeLabel(value);
}

export { getInitialRange };

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempPreset, setTempPreset] = useState<DateRangePreset>(value.preset);
  const [tempRange, setTempRange] = useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync temp state when picker opens
  useEffect(() => {
    if (open) {
      setTempPreset(value.preset);
      setTempRange({ from: value.from, to: value.to });
    }
  }, [open, value]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handlePresetClick = useCallback((p: PresetOption) => {
    setTempPreset(p.value);
    if (p.value !== "custom") {
      const { from, to } = p.getRange();
      setTempRange({ from, to });
    }
  }, []);

  const handleApply = useCallback(() => {
    if (tempPreset === "custom" && tempRange?.from && tempRange?.to) {
      onChange({ preset: "custom", from: tempRange.from, to: tempRange.to });
    } else if (tempPreset !== "custom") {
      const p = presets.find((pr) => pr.value === tempPreset)!;
      const { from, to } = p.getRange();
      onChange({ preset: tempPreset, from, to });
    }
    setOpen(false);
  }, [tempPreset, tempRange, onChange]);

  const handleCancel = useCallback(() => {
    setTempPreset(value.preset);
    setTempRange({ from: value.from, to: value.to });
    setOpen(false);
  }, [value]);

  const handleSelect = useCallback((range: DateRange | undefined) => {
    if (!range) return;
    setTempRange(range);
    if (range.from && range.to) {
      setTempPreset("custom");
    }
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-surface-border bg-surface text-sm font-medium text-foreground hover:border-primary/40 hover:bg-surface-hover transition-all cursor-pointer shadow-sm"
      >
        <CalendarIcon size={15} className="text-muted" />
        <span className="min-w-[120px] text-left">{getDateRangeLabel(value)}</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 flex rounded-xl border border-surface-border bg-surface shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ minWidth: "580px" }}
        >
          {/* Left: Presets */}
          <div className="w-44 border-r border-surface-border p-2 flex flex-col gap-0.5 bg-surface/50">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">Quick ranges</p>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetClick(p)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  tempPreset === p.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right: Calendar */}
          <div className="flex-1 p-4">
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              defaultMonth={tempRange?.from || new Date()}
              max={365}
              classNames={{
                root: "!m-0 !w-full",
                months: "!flex !gap-4",
                month: "!flex-1",
                caption: "!text-sm !font-bold !text-foreground !px-0 !py-2",
                table: "!w-full",
                head_cell: "!text-[11px] !font-bold !uppercase !tracking-wider !text-muted !pb-2",
                day: "!h-9 !w-9 !text-sm !font-medium !rounded-full !transition-all !cursor-pointer",
                day_button: "!h-full !w-full !rounded-full !transition-all",
                day_selected: "!bg-primary !text-white !rounded-full",
                day_range_start: "!bg-primary !text-white !rounded-full",
                day_range_end: "!bg-primary !text-white !rounded-full",
                day_range_middle: "!bg-primary/10 !text-foreground !rounded-none",
                day_today: "!font-bold !text-primary",
                day_disabled: "!opacity-30 !cursor-not-allowed",
                nav: "!flex !gap-1",
                nav_button: "!h-7 !w-7 !rounded-lg !border !border-surface-border !bg-surface !text-muted hover:!bg-surface-hover hover:!text-foreground !transition-all !cursor-pointer",
                chevron: "!fill-muted !w-4 !h-4",
                month_grid: "!mt-2",
                week: "!mb-0.5",
              }}
              formatters={{
                formatCaption: (date: Date) => format(date, "MMMM yyyy"),
              }}
              disabled={[
                { after: new Date() },
              ]}
            />

            {/* Selected range display */}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted justify-center border-t border-surface-border pt-3">
              <span className="font-medium text-foreground">
                {tempRange?.from ? format(tempRange.from, "MMM d, yyyy") : "—"}
              </span>
              <span className="text-muted">→</span>
              <span className="font-medium text-foreground">
                {tempRange?.to ? format(tempRange.to, "MMM d, yyyy") : "—"}
              </span>
            </div>

            {/* Apply / Cancel */}
            <div className="flex items-center justify-end gap-2 mt-3 border-t border-surface-border pt-3">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-xs font-semibold text-muted hover:text-foreground rounded-lg hover:bg-surface-hover transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!tempRange?.from}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
