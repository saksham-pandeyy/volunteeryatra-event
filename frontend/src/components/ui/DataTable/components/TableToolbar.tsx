"use client";

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
  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const data = rows.map((r: any) => r.original);
    if (data.length === 0) return;

    const visibleCols = table.getVisibleLeafColumns().filter((c: any) => c.id !== "actions");
    const headers = visibleCols.map((c: any) => c.columnDef.header || c.id).join(",");
    
    const csvRows = data.map((row: any) =>
      visibleCols
        .map((col: any) => {
          const val = row[col.id];
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
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="toolbar-right">
        {filters && <div className="toolbar-filters">{filters}</div>}

        <div className="toolbar-actions">
          <ColumnVisibilityDropdown table={table} columns={columns} />

          <button
            type="button"
            className="toolbar-btn toolbar-btn--pdf"
            onClick={handleExportCSV}
            title="Download CSV"
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
