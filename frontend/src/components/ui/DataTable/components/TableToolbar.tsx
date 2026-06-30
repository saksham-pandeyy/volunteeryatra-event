"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, FileDown, Search } from "lucide-react";
import { ColumnVisibilityDropdown } from "./ColumnVisibilityDropdown";

interface TableToolbarProps {
  table: any;
  columns?: any[];
  fileName?: string;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  loading?: boolean;
  filters?: React.ReactNode;
  title?: string;
}

export function TableToolbar({
  table,
  columns = [],
  fileName = "data",
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  loading = false,
  filters,
}: TableToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external search prop if it changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(val);
    }, 300);
  }, [onSearchChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const data = rows.map((r: any) => r.original);
    if (data.length === 0) return;

    // Include ALL relevant data columns from the raw data (not just visible table columns)
    const csvFields = [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "date", label: "Date" },
      { key: "location", label: "Location" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "max_participants", label: "Max Participants" },
      { key: "registration_deadline", label: "Registration Deadline" },
      { key: "start_time", label: "Start Time" },
      { key: "end_time", label: "End Time" },
      { key: "created_at", label: "Created At" },
      { key: "updated_at", label: "Updated At" },
    ];

    const headers = csvFields.map((f) => f.label).join(",");

    const csvRows = data.map((row: any) =>
      csvFields
        .map((f) => {
          let val = row[f.key];
          if (val === null || val === undefined) val = "";
          // Format date fields
          if ((f.key === "date" || f.key === "registration_deadline" || f.key === "created_at" || f.key === "updated_at") && val) {
            try {
              val = new Date(val).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              });
            } catch {}
          }
          return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-toolbar">
      <div className="toolbar-left">
        {onSearchChange && (
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4.5 w-4.5 text-muted/65" strokeWidth={2.2} />
            </div>
            <input
              type="text"
              className="form-input block w-full rounded-lg border border-surface-border bg-surface pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleChange}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        )}
      </div>

      <div className="toolbar-right">
        {filters && <div className="toolbar-filters">{filters}</div>}

        <div className="toolbar-actions">
          <button
            type="button"
            className="toolbar-btn toolbar-btn--download"
            onClick={handleExportCSV}
            title="Download CSV"
            style={{ marginLeft: "8px" }}
          >
            <FileDown size={18} strokeWidth={1.8} />
          </button>

          {onRefresh && (
            <button
              type="button"
              className="toolbar-btn toolbar-btn--refresh"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Data"
            >
              <RefreshCw size={18} strokeWidth={1.8} className={loading ? "spinning" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
