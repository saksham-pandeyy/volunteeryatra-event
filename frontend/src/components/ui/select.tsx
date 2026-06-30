"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  error,
  className,
  icon,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleSelect = (val: string) => {
    if (onChange) onChange(val);
    setOpen(false);
  };

  return (
    <div className="form-field relative w-full" ref={containerRef}>
      {label && (
        <label className="text-label font-medium text-foreground">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          "form-input flex items-center gap-2 w-full cursor-pointer text-left",
          !value && "text-base-400",
          error && "border-danger focus:border-danger",
          className
        )}
        style={{ borderRadius: "8px" }}
      >
        {icon && <div className="shrink-0 text-muted">{icon}</div>}
        <span className="flex-1 text-[13px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={clsx(
            "text-muted transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>
      {error && <p className="text-error mt-1">{error}</p>}

      {open && (
        <div
          className={clsx(
            "absolute left-0 z-50 w-full rounded-lg border border-surface-border bg-surface p-1 shadow-xl max-h-52 overflow-y-auto scrollbar-thin animate-in fade-in duration-150",
            placement === "top"
              ? "bottom-full mb-1.5 slide-in-from-bottom-2"
              : "top-full mt-1.5 slide-in-from-top-2"
          )}
        >
          {options.length === 0 ? (
            <div className="py-2 px-3 text-xs text-muted text-center">No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={clsx(
                    "block w-full text-left py-2 px-3 text-xs rounded-md transition-colors cursor-pointer font-medium",
                    isSelected
                      ? "bg-primary-muted text-primary font-semibold"
                      : "text-foreground hover:bg-surface-hover"
                  )}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
