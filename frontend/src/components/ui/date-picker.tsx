"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
}

export function DatePicker({ label, value, onChange, error, placeholder = "Select date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value + "T12:00:00") : undefined;
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

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

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange(format(date, "yyyy-MM-dd"));
        setOpen(false);
      }
    },
    [onChange]
  );

  const displayValue = selectedDate ? format(selectedDate, "MMM d, yyyy") : "";

  return (
    <div className="form-field relative" ref={panelRef}>
      {label && (
        <label htmlFor={inputId} className="text-label">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`form-input flex items-center gap-2 w-full cursor-pointer text-left ${
          !selectedDate ? "text-base-400" : ""
        } ${error ? "border-danger" : ""}`}
        style={{ borderRadius: "8px" }}
      >
        <CalendarIcon size={15} className="text-muted shrink-0" />
        <span className="flex-1">{displayValue || placeholder}</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {error && <p className="text-error mt-1">{error}</p>}

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-surface-border bg-surface shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ minWidth: "280px" }}
        >
          <div className="p-3">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={selectedDate || new Date()}
              classNames={{
                root: "!m-0 !w-full",
                months: "!flex !justify-center",
                month: "!w-full",
                caption: "!text-sm !font-bold !text-foreground !px-0 !py-2 !flex !justify-center",
                table: "!w-full",
                head_cell: "!text-[11px] !font-bold !uppercase !tracking-wider !text-muted !pb-2",
                day: "!h-9 !w-9 !text-sm !font-medium !rounded-full !transition-all !cursor-pointer",
                day_button: "!h-full !w-full !rounded-full !transition-all",
                day_selected: "!bg-primary !text-white !rounded-full",
                day_today: "!font-bold !text-primary",
                day_disabled: "!opacity-30 !cursor-not-allowed",
                nav: "!flex !gap-1 !absolute !right-0 !top-0",
                nav_button: "!h-7 !w-7 !rounded-lg !border !border-surface-border !bg-surface !text-muted hover:!bg-surface-hover hover:!text-foreground !transition-all !cursor-pointer",
                chevron: "!fill-muted !w-4 !h-4",
                month_grid: "!mt-2",
                week: "!mb-0.5",
              }}
              formatters={{
                formatCaption: (date: Date) => format(date, "MMMM yyyy"),
              }}
              disabled={[{ after: new Date() }]}
            />
          </div>

          {/* Quick action */}
          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs text-muted">
              {displayValue || "No date selected"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-xs font-semibold text-muted hover:text-foreground rounded-lg hover:bg-surface-hover transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
