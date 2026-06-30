"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format, subDays, isAfter, isBefore, isEqual, startOfDay, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export type DateRangePreset = "all" | "7d" | "14d" | "30d" | "90d" | "custom";

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
    value: "all",
    label: "All time",
    getRange: () => ({ from: new Date("2020-01-01"), to: new Date("2035-12-31") }),
  },
  {
    value: "7d",
    label: "Last 7 days",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: startOfDay(new Date()) }),
  },
  {
    value: "14d",
    label: "Last 14 days",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 13)), to: startOfDay(new Date()) }),
  },
  {
    value: "30d",
    label: "Last 30 days",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: startOfDay(new Date()) }),
  },
  {
    value: "90d",
    label: "Last 90 days",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 89)), to: startOfDay(new Date()) }),
  },
  {
    value: "custom",
    label: "Custom range",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: startOfDay(new Date()) }),
  },
];

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

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempPreset, setTempPreset] = useState<DateRangePreset>(value.preset);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(value.from);
  const [tempTo, setTempTo] = useState<Date | undefined>(value.to);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Navigation states based on the left month
  const [navYear, setNavYear] = useState<number>(() => (value.from || new Date()).getFullYear());
  const [navMonth, setNavMonth] = useState<number>(() => (value.from || new Date()).getMonth());
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [yearStart, setYearStart] = useState<number>(() => {
    const currentYear = (value.from || new Date()).getFullYear();
    return currentYear - (currentYear % 12);
  });

  const panelRef = useRef<HTMLDivElement>(null);

  // Sync temp state when picker opens
  useEffect(() => {
    if (open) {
      setTempPreset(value.preset);
      setTempFrom(value.from);
      setTempTo(value.to);
      const initialDate = value.from || new Date();
      setNavYear(initialDate.getFullYear());
      setNavMonth(initialDate.getMonth());
      setYearStart(initialDate.getFullYear() - (initialDate.getFullYear() % 12));
      setView("days");
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

  // Close on external scroll
  useEffect(() => {
    function handleScroll() {
      setOpen(false);
    }
    if (open) {
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [open]);

  const handlePresetClick = useCallback((p: PresetOption) => {
    setTempPreset(p.value);
    if (p.value !== "custom") {
      const { from, to } = p.getRange();
      setTempFrom(from);
      setTempTo(to);
      onChange({ preset: p.value, from, to });
      setOpen(false);
    }
  }, [onChange]);

  const handleApply = useCallback(() => {
    if (tempFrom && tempTo) {
      onChange({ preset: tempPreset, from: tempFrom, to: tempTo });
    }
    setOpen(false);
  }, [tempPreset, tempFrom, tempTo, onChange]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDayClick = (date: Date) => {
    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(date);
      setTempTo(undefined);
      setTempPreset("custom");
    } else {
      if (isBefore(date, tempFrom)) {
        setTempFrom(date);
        setTempTo(undefined);
      } else {
        setTempTo(date);
      }
    }
  };

  const handlePrevMonth = () => {
    if (view === "days") {
      if (navMonth === 0) {
        setNavMonth(11);
        setNavYear((prev) => prev - 1);
      } else {
        setNavMonth((prev) => prev - 1);
      }
    } else if (view === "years") {
      setYearStart((prev) => prev - 12);
    } else if (view === "months") {
      setNavYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (view === "days") {
      if (navMonth === 11) {
        setNavMonth(0);
        setNavYear((prev) => prev + 1);
      } else {
        setNavMonth((prev) => prev + 1);
      }
    } else if (view === "years") {
      setYearStart((prev) => prev + 12);
    } else if (view === "months") {
      setNavYear((prev) => prev + 1);
    }
  };

  const getDaysGrid = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: startOfDay(new Date(year, month - 1, prevMonthTotalDays - i)),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: startOfDay(new Date(year, month, i)),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid to 42
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: startOfDay(new Date(year, month + 1, i)),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Right calendar calculations
  const rightMonth = navMonth === 11 ? 0 : navMonth + 1;
  const rightYear = navMonth === 11 ? navYear + 1 : navYear;

  const isSelected = (date: Date) => {
    if (tempFrom && isEqual(date, tempFrom)) return true;
    if (tempTo && isEqual(date, tempTo)) return true;
    return false;
  };

  const isStart = (date: Date) => tempFrom && isEqual(date, tempFrom);
  const isEnd = (date: Date) => tempTo && isEqual(date, tempTo);

  const isInRange = (date: Date) => {
    if (tempFrom && tempTo) {
      return isAfter(date, tempFrom) && isBefore(date, tempTo);
    }
    if (tempFrom && hoveredDate && !tempTo) {
      return (isAfter(date, tempFrom) && isBefore(date, hoveredDate)) || isEqual(date, hoveredDate);
    }
    return false;
  };

  const isToday = (date: Date) => isEqual(date, startOfDay(new Date()));

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-surface-border bg-surface text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-surface-hover transition-all cursor-pointer shadow-sm select-none min-w-[180px]"
        style={{ borderRadius: "8px" }}
      >
        <span className="text-[13px] text-left">{getDateRangeLabel(value)}</span>
        <CalendarIcon size={15} className="text-muted shrink-0" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 flex flex-col md:flex-row rounded-lg border border-surface-border bg-surface shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ minWidth: "640px" }}
        >
          {/* Left Panel: Presets */}
          <div className="w-full md:w-44 border-r border-surface-border p-2.5 flex flex-col gap-0.5 bg-surface/50">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">Quick ranges</p>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetClick(p)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  tempPreset === p.value
                    ? "bg-primary-muted text-primary font-bold"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right Panel: Calendar Area */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            {/* Header: Controls */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border/50">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-surface-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (view === "days") setView("years");
                  else if (view === "months") setView("years");
                  else setView("days");
                }}
                className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-surface-hover"
              >
                {view === "days" && `${months[navMonth]} ${navYear} – ${months[rightMonth]} ${rightYear}`}
                {view === "months" && `${navYear}`}
                {view === "years" && `${yearStart} - ${yearStart + 11}`}
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="flex items-center justify-center h-7 w-7 rounded-lg border border-surface-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* View: DAYS */}
            {view === "days" && (
              <div className="flex gap-6">
                {/* Left Calendar Grid */}
                <div className="flex-1">
                  <p className="text-center text-xs font-bold text-foreground mb-3">{months[navMonth]} {navYear}</p>
                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {weekdays.map((wd) => (
                      <span key={wd} className="text-[10px] font-bold text-muted uppercase">
                        {wd}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1 text-center justify-items-center">
                    {getDaysGrid(navYear, navMonth).map((item, idx) => {
                      const selected = isSelected(item.date);
                      const activeRange = isInRange(item.date);
                      const isTodayDate = isToday(item.date);
                      const start = isStart(item.date);
                      const end = isEnd(item.date);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!item.isCurrentMonth}
                          onClick={() => handleDayClick(item.date)}
                          onMouseEnter={() => setHoveredDate(item.date)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={clsx(
                            "h-8 w-8 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative outline-none focus:outline-none",
                            !item.isCurrentMonth && "text-base-300 opacity-20 cursor-not-allowed",
                            item.isCurrentMonth && !selected && !activeRange && "text-foreground hover:bg-surface-hover rounded-full",
                            isTodayDate && !selected && "text-primary font-bold border border-primary/20 rounded-full",
                            activeRange && "bg-primary-muted text-primary",
                            selected && "bg-primary text-white font-bold rounded-full z-10",
                            start && tempTo && "rounded-r-none",
                            end && tempFrom && "rounded-l-none"
                          )}
                        >
                          {item.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Calendar Grid */}
                <div className="flex-1">
                  <p className="text-center text-xs font-bold text-foreground mb-3">{months[rightMonth]} {rightYear}</p>
                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {weekdays.map((wd) => (
                      <span key={wd} className="text-[10px] font-bold text-muted uppercase">
                        {wd}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1 text-center justify-items-center">
                    {getDaysGrid(rightYear, rightMonth).map((item, idx) => {
                      const selected = isSelected(item.date);
                      const activeRange = isInRange(item.date);
                      const isTodayDate = isToday(item.date);
                      const start = isStart(item.date);
                      const end = isEnd(item.date);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!item.isCurrentMonth}
                          onClick={() => handleDayClick(item.date)}
                          onMouseEnter={() => setHoveredDate(item.date)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={clsx(
                            "h-8 w-8 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative outline-none focus:outline-none",
                            !item.isCurrentMonth && "text-base-300 opacity-20 cursor-not-allowed",
                            item.isCurrentMonth && !selected && !activeRange && "text-foreground hover:bg-surface-hover rounded-full",
                            isTodayDate && !selected && "text-primary font-bold border border-primary/20 rounded-full",
                            activeRange && "bg-primary-muted text-primary",
                            selected && "bg-primary text-white font-bold rounded-full z-10",
                            start && tempTo && "rounded-r-none",
                            end && tempFrom && "rounded-l-none"
                          )}
                        >
                          {item.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View: MONTHS */}
            {view === "months" && (
              <div className="grid grid-cols-3 gap-2 py-2 text-center">
                {shortMonths.map((mName, mIdx) => {
                  const isSelected = navMonth === mIdx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setNavMonth(mIdx);
                        setView("days");
                      }}
                      className={clsx(
                        "py-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary-muted text-primary font-bold"
                          : "text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View: YEARS */}
            {view === "years" && (
              <div className="grid grid-cols-3 gap-2 py-2 text-center">
                {Array.from({ length: 12 }, (_, i) => yearStart + i).map((yr) => {
                  const isSelected = navYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setNavYear(yr);
                        setYearStart(yr - (yr % 12));
                        setView("months");
                      }}
                      className={clsx(
                        "py-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary-muted text-primary font-bold"
                          : "text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected range display */}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted justify-center border-t border-surface-border/50 pt-4">
              <span className="font-semibold text-foreground">
                {tempFrom ? format(tempFrom, "MMM d, yyyy") : "—"}
              </span>
              <span className="text-muted/60">→</span>
              <span className="font-semibold text-foreground">
                {tempTo ? format(tempTo, "MMM d, yyyy") : "—"}
              </span>
            </div>

            {/* Apply / Cancel */}
            <div className="flex items-center justify-end gap-2 mt-3 border-t border-surface-border/50 pt-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 text-xs font-bold text-muted hover:text-foreground rounded-lg hover:bg-surface-hover transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!tempFrom || !tempTo}
                className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
