"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowUpDown } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onDateFilter?: (date: string) => void;
  onSortToggle?: () => void;
  sortLabel?: string;
  showDateFilter?: boolean;
  showSort?: boolean;
  debounceMs?: number;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  onDateFilter,
  onSortToggle,
  sortLabel,
  showDateFilter = false,
  showSort = false,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <Search size={16} strokeWidth={1.75} />
        </div>
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="form-input w-full pl-9 pr-9"
          style={{ borderRadius: "8px" }}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
            style={{ background: "none", border: "none", padding: 0, display: "flex" }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {showDateFilter && onDateFilter && (
        <input
          type="date"
          onChange={(e) => onDateFilter(e.target.value)}
          className="form-input max-w-[150px]"
          style={{ borderRadius: "8px" }}
        />
      )}

      {showSort && onSortToggle && (
        <button
          onClick={onSortToggle}
          className="form-input flex items-center gap-2 cursor-pointer hover:bg-surface-hover transition-colors"
          style={{ borderRadius: "8px", padding: "0.65rem 1rem", background: "none", border: "1.5px solid var(--color-surface-border)" }}
        >
          <ArrowUpDown size={14} strokeWidth={1.75} />
          <span className="text-sm font-medium">{sortLabel || "Sort"}</span>
        </button>
      )}
    </div>
  );
}
