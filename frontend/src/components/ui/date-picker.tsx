"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface DatePickerProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = "Select date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [view, setView] = useState<"days" | "months" | "years">("days");
  
  // Navigation states
  const [navYear, setNavYear] = useState<number>(() => {
    if (value) {
      const y = parseInt(value.split("-")[0], 10);
      if (!isNaN(y)) return y;
    }
    return new Date().getFullYear();
  });
  const [navMonth, setNavMonth] = useState<number>(() => {
    if (value) {
      const m = parseInt(value.split("-")[1], 10);
      if (!isNaN(m)) return m - 1; // 0-indexed
    }
    return new Date().getMonth();
  });
  
  // Starting year for the 12-year grid
  const [yearStart, setYearStart] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    return currentYear - (currentYear % 12);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync nav month/year when value changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m)) {
        setNavYear(y);
        setNavMonth(m - 1);
        setYearStart(y - (y % 12));
      }
    }
  }, [value]);

  // Handle dynamic placement based on space
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 330; // height of redesigned datepicker
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper: Format selected date to display
  let displayValue = "";
  if (value) {
    const [yStr, mStr, dStr] = value.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      displayValue = `${shortMonths[m - 1]} ${d}, ${y}`;
    }
  }

  // Prev/Next handlers based on current view
  const handlePrev = () => {
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

  const handleNext = () => {
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

  // Generate days in grid
  const getDaysGrid = () => {
    const firstDayIndex = new Date(navYear, navMonth, 1).getDay();
    const totalDays = new Date(navYear, navMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(navYear, navMonth, 0).getDate();

    const days = [];
    
    // Blank padding or previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateString: "",
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(navMonth + 1).padStart(2, "0");
      const dStr = String(i).padStart(2, "0");
      days.push({
        day: i,
        isCurrentMonth: true,
        dateString: `${navYear}-${mStr}-${dStr}`,
      });
    }

    return days;
  };

  const selectDay = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  const selectYear = (yr: number) => {
    setNavYear(yr);
    setYearStart(yr - (yr % 12));
    setView("months");
  };

  const selectMonth = (mIdx: number) => {
    setNavMonth(mIdx);
    setView("days");
  };

  const id = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="form-field relative w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-label font-medium text-foreground">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => {
          setOpen(!open);
          setView("days");
        }}
        className={clsx(
          "form-input flex items-center justify-between gap-2 w-full cursor-pointer text-left",
          !value && "text-base-400",
          error && "border-danger focus:border-danger"
        )}
        style={{ borderRadius: "8px" }}
      >
        <span className="flex-1 text-[13px]">{displayValue || placeholder}</span>
        <CalendarIcon size={15} className="text-muted shrink-0 ml-auto" />
      </button>
      {error && <p className="text-error mt-1">{error}</p>}

      {open && (
        <div
          className={clsx(
            "absolute left-0 z-50 w-[280px] rounded-lg border border-surface-border bg-surface p-4 shadow-xl select-none animate-in fade-in duration-150",
            placement === "top"
              ? "bottom-full mb-1.5 slide-in-from-bottom-2"
              : "top-full mt-1.5 slide-in-from-top-2"
          )}
        >
          {/* Redesigned Calendar Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-border/50">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-surface-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Click to change views */}
            <button
              type="button"
              onClick={() => {
                if (view === "days") setView("years");
                else if (view === "months") setView("years");
                else setView("days");
              }}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-surface-hover"
            >
              {view === "days" && `${months[navMonth]} ${navYear}`}
              {view === "months" && `${navYear}`}
              {view === "years" && `${yearStart} - ${yearStart + 11}`}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-surface-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* VIEW: DAYS */}
          {view === "days" && (
            <div>
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {weekdays.map((wd) => (
                  <span key={wd} className="text-[10px] font-bold text-muted uppercase">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
                {getDaysGrid().map((item, idx) => {
                  const isSelected = value && item.dateString === value;
                  const isToday = !isSelected && item.dateString === new Date().toISOString().split("T")[0];

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!item.isCurrentMonth}
                      onClick={() => selectDay(item.dateString)}
                      className={clsx(
                        "h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all cursor-pointer",
                        !item.isCurrentMonth && "text-base-300 opacity-20 cursor-not-allowed",
                        item.isCurrentMonth && !isSelected && "text-foreground hover:bg-surface-hover",
                        isToday && "text-primary font-bold border border-primary/20",
                        isSelected && "bg-primary-muted text-primary font-bold"
                      )}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: MONTHS */}
          {view === "months" && (
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              {shortMonths.map((mName, mIdx) => {
                const isSelected = navMonth === mIdx;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => selectMonth(mIdx)}
                    className={clsx(
                      "py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary-muted text-primary"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW: YEARS */}
          {view === "years" && (
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              {Array.from({ length: 12 }, (_, i) => yearStart + i).map((yr) => {
                const isSelected = navYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => selectYear(yr)}
                    className={clsx(
                      "py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary-muted text-primary"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
