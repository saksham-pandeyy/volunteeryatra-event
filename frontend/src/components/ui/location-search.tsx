"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

// Simple debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function LocationSearch({
  label,
  value,
  onChange,
  error,
  placeholder = "Search location...",
}: LocationSearchProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  // Sync external value
  useEffect(() => {
    setInput(value);
  }, [value]);

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

  // Fetch suggestions from Nominatim
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setOpen(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    onChange(val);
    fetchSuggestions(val);
  };

  const handleSelect = (suggestion: Suggestion) => {
    // Extract city/place name from display_name for a cleaner value
    const parts = suggestion.display_name.split(",");
    const cleanName = parts[0]?.trim() || suggestion.display_name;
    setInput(cleanName);
    onChange(cleanName);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Highlight matching text in suggestion
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="text-foreground font-semibold">{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="form-field relative" ref={panelRef}>
      {label && (
        <label htmlFor={inputId} className="text-label">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`form-input w-full !pl-10 !pr-10 ${
            error ? "border-danger focus:border-danger focus:ring-danger-muted" : ""
          }`}
          style={{ borderRadius: "8px" }}
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted animate-spin" />
        )}
      </div>
      {error && <p className="text-error mt-1">{error}</p>}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 top-full mt-1 z-50 w-full rounded-xl border border-surface-border bg-surface shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: "260px", overflowY: "auto" }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all cursor-pointer ${
                index === activeIndex
                  ? "bg-primary/5 text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
              style={{ background: "none", border: "none", borderBottom: index < suggestions.length - 1 ? "1px solid var(--color-surface-border)" : "none" }}
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-sm leading-snug">
                {highlightMatch(suggestion.display_name, input)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
