"use client";

import { useState, useRef, useEffect } from "react";
import { Columns } from "lucide-react";

interface ColumnVisibilityDropdownProps {
  table: any;
  columns: any[];
}

export function ColumnVisibilityDropdown({ table, columns }: ColumnVisibilityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close, true);
    return () => document.removeEventListener("mousedown", close, true);
  }, [isOpen]);

  const allCols = table.getAllLeafColumns();
  const visibleMap = table.getState().columnVisibility;

  const colDefs = columns.filter((c) => c.key && c.key !== "actions");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="toolbar-btn toolbar-btn--columns"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Columns"
      >
        <Columns size={18} strokeWidth={1.8} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-[100] min-w-[200px] rounded-xl border border-surface-border bg-surface shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 pb-1.5 mb-1 border-b border-surface-border">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
              Toggle Columns
            </span>
          </div>
          {colDefs.map((col) => {
            const tableCol = allCols.find(
              (c: any) => c.id === col.key || c.id === col.accessorKey,
            );
            const isVisible = tableCol
              ? tableCol.getIsVisible()
              : visibleMap[col.key] !== false;
            return (
              <label
                key={col.key}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => tableCol?.toggleVisibility()}
                  className="w-3.5 h-3.5 rounded border-surface-border text-primary focus:ring-primary-ring"
                />
                <span className="text-xs font-medium text-foreground select-none">
                  {col.label || col.header || col.key}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
