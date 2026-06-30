"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface TimePickerProps {
  label?: string;
  value: string; // "HH:MM" in 24h format
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TimePicker({
  label,
  value,
  onChange,
  error,
  placeholder = "Select time",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Parse value "HH:MM" to 12h format values
  let selectedHour = "12";
  let selectedMinute = "00";
  let selectedPeriod = "AM";

  if (value && value.includes(":")) {
    const [hStr, mStr] = value.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    
    if (!isNaN(h) && !isNaN(m)) {
      selectedMinute = mStr.padStart(2, "0");
      if (h >= 12) {
        selectedPeriod = "PM";
        selectedHour = h === 12 ? "12" : String(h - 12);
      } else {
        selectedPeriod = "AM";
        selectedHour = h === 0 ? "12" : String(h);
      }
    }
  }

  // Display value in 12h format
  const displayValue = value ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : "";

  // Convert selected 12h pieces back to "HH:MM" 24h format
  const handleSelect = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    
    const hStr = String(h).padStart(2, "0");
    const mStr = minute.padStart(2, "0");
    onChange(`${hStr}:${mStr}`);
  };

  // Close dropdown on click outside
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

  // Handle dynamic placement based on space
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 220; // max height of dropdown + padding
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
    }
  }, [open]);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
  const periods = ["AM", "PM"];

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
        onClick={() => setOpen(!open)}
        className={`form-input flex items-center gap-2 w-full cursor-pointer text-left ${
          !value ? "text-base-400" : ""
        } ${error ? "border-danger focus:border-danger" : ""}`}
        style={{ borderRadius: "8px" }}
      >
        <Clock size={15} className="text-muted shrink-0" />
        <span className="flex-1 text-[13px]">{displayValue || placeholder}</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {error && <p className="text-error mt-1">{error}</p>}

      {open && (
        <div
          className={`absolute left-0 z-50 w-full min-w-[200px] rounded-xl border border-surface-border bg-surface p-3 shadow-xl overflow-hidden animate-in fade-in duration-150 ${
            placement === "top"
              ? "bottom-full mb-1.5 slide-in-from-bottom-2"
              : "top-full mt-1.5 slide-in-from-top-2"
          }`}
        >
          <div className="grid grid-cols-3 gap-1 h-44 text-center">
            {/* Hours Column */}
            <div className="overflow-y-auto pr-0.5 border-r border-surface-border/50 scrollbar-thin">
              <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5 sticky top-0 bg-surface py-0.5">
                Hrs
              </div>
              <div className="space-y-1">
                {hours.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelect(h, selectedMinute, selectedPeriod)}
                      className={`block w-full py-1 text-xs rounded-md transition-colors cursor-pointer font-medium ${
                        isSelected
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="overflow-y-auto pr-0.5 border-r border-surface-border/50 scrollbar-thin">
              <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5 sticky top-0 bg-surface py-0.5">
                Min
              </div>
              <div className="space-y-1">
                {minutes.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelect(selectedHour, m, selectedPeriod)}
                      className={`block w-full py-1 text-xs rounded-md transition-colors cursor-pointer font-medium ${
                        isSelected
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="flex flex-col justify-center gap-2">
              <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">
                Am/Pm
              </div>
              {periods.map((p) => {
                const isSelected = selectedPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelect(selectedHour, selectedMinute, p)}
                    className={`py-2 text-xs rounded-md transition-colors cursor-pointer font-semibold ${
                      isSelected
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
