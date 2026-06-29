"use client";

import { memo, useCallback, useState, useRef, useEffect, useMemo } from "react";
import { SearchX, Search, FilterX } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { SkeletonText } from "../skeleton";
const Skeleton = ({ className = "", width, height, borderRadius }: any) => (
  <SkeletonText className={className} style={{ width, height, borderRadius }} />
);
import { TableToolbar } from "./components/TableToolbar";
import { TableHead } from "./components/TableHead";
import { TableBody } from "./components/TableBody";
import { TablePagination } from "./components/TablePagination";
import { useDataTableColumns } from "./hooks/useDataTableColumns";
import clsx from "clsx";
const cn = clsx;

import { EmptyState } from "../empty-state";
import "./styles/index.css";

interface DataTableProps {
  columns: any[];
  data?: any[];
  loading?: boolean;
  isSorting?: boolean;
  emptyIcon?: any;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: any) => void;
  stickyFirstColumn?: boolean;
  stickyLastColumn?: boolean;
  storageKey?: string | null;
  title?: string;
  showToolbar?: boolean;
  fileName?: string;
  search?: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  filters?: React.ReactNode;
  pagination?: any;
  page?: number;
  onPageChange?: (page: number, limit: number) => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  rowClassName?: string;
  
  // Legacy / Compatibility props
  filterColumn?: string;
  filterPlaceholder?: string;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableResizing?: boolean;
}

const DataTable = memo(function DataTable({
  columns: userColumns,
  data = [],
  loading = false,
  isSorting = false,
  emptyIcon,
  emptyTitle = "No data found",
  emptyDescription = "Adjust your filters or try a different search.",
  onRowClick,
  stickyFirstColumn = true,
  stickyLastColumn = true,
  storageKey,
  title,
  showToolbar = false,
  fileName,
  search: externalSearch,
  onSearchChange: externalOnSearchChange,
  onRefresh,
  filters,
  pagination,
  page = 1,
  onPageChange,
  isFiltered: userIsFiltered,
  onClearFilters,
  rowClassName,

  filterColumn,
  filterPlaceholder = "Search...",
  enableFiltering = true,
  enableSorting = true,
  enableResizing = true,
}: DataTableProps) {
  const [copiedId, copyToClipboard] = useCopyToClipboard();

  const [columnVisibility, setColumnVisibility] = useLocalStorage<any>(
    storageKey ? `dt-cols-${storageKey}` : null,
    {},
  );

  const [columnSizing, setColumnSizing] = useLocalStorage<any>(
    storageKey ? `dt-widths-${storageKey}` : null,
    {},
  );

  // Handle local searching state for backward compatibility
  const [localSearch, setLocalSearch] = useState("");
  const search = externalSearch !== undefined ? externalSearch : localSearch;
  const onSearchChange = externalOnSearchChange || setLocalSearch;

  // Filter data locally if legacy filterColumn is specified
  const filteredData = useMemo(() => {
    if (!search || !filterColumn) return data;
    const term = search.toLowerCase();
    return data.filter((item: any) =>
      String(item[filterColumn] || "").toLowerCase().includes(term)
    );
  }, [data, search, filterColumn]);

  const [sorting, setSorting] = useState<any>([]);
  const [internalSorting, setInternalSorting] = useState(false);
  const sortTimerRef = useRef<any>(null);

  const columns = useDataTableColumns({
    userColumns,
    copiedId,
    copyToClipboard,
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: (updater: any) => {
      setSorting(updater);
      setInternalSorting(true);
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
      sortTimerRef.current = setTimeout(() => {
        setInternalSorting(false);
      }, 300);
    },
    state: {
      sorting,
      columnVisibility,
      columnSizing,
    },
    enableColumnResizing: enableResizing,
    columnResizeMode: "onChange",
  });

  useEffect(() => {
    return () => {
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    };
  }, []);

  const showSortingSpinner = isSorting || internalSorting || false;

  const handleRowClick = useCallback(
    (row: any, e: any) => {
      const target = e.target;
      if (target.closest(".dt-actions") || target.closest("button")) return;
      onRowClick?.(row);
    },
    [onRowClick],
  );

  const isSearching = !!search;
  const hasFilters = !!userIsFiltered;
  const showFilteredEmpty = hasFilters && !isSearching;

  function renderTableHead() {
    if (loading) {
      const visibleColumns = table.getVisibleLeafColumns();
      return (
        <thead className="dt-head-skeleton">
          <tr>
            {visibleColumns.map(function (col: any, idx: number) {
              const thClassName = cn(
                "dt-th",
                idx === 0 && stickyFirstColumn && "dt-th--sticky-left",
                col.id === "actions" && stickyLastColumn && "dt-th--sticky-right",
              );
              return (
                <th
                  key={col.id}
                  className={thClassName}
                  style={{ width: col.getSize(), minWidth: col.getSize() }}
                >
                  <div className="dt-th-content">
                    <Skeleton width="60%" height="14px" borderRadius="4px" />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
      );
    }
    return (
      <TableHead
        table={table}
        stickyFirstColumn={stickyFirstColumn}
        stickyLastColumn={stickyLastColumn}
        isSorting={showSortingSpinner}
      />
    );
  }

  // Determine if toolbar should be displayed (either explicitly requested, or if search filtering is configured)
  const shouldShowToolbar = showToolbar || (enableFiltering && !!filterColumn);

  return (
    <div className="dt-root">
      {shouldShowToolbar && (
        <TableToolbar
          title={title}
          table={table}
          columns={userColumns}
          onRefresh={onRefresh}
          loading={loading}
          filters={filters}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={filterPlaceholder}
          fileName={fileName}
        />
      )}

      <div className="dt-container">
        {table.getRowModel().rows.length === 0 && !loading ? (
          <div className="py-12 border-t border-border-base bg-surface-subtle/20">
            <EmptyState
              message={
                isSearching
                  ? `Search Not Found: We couldn't find any results matching "${search}".`
                  : showFilteredEmpty
                    ? "Filters Not Found: The current criteria do not match any records."
                    : emptyTitle
              }
              description={
                isSearching
                  ? "Please check your spelling or try different keywords."
                  : showFilteredEmpty
                    ? "Adjust the date range or status to see more results."
                    : emptyDescription
              }
            />
            {(isSearching || showFilteredEmpty) && (
              <div className="flex justify-center pb-8 bg-surface-subtle/20">
                {isSearching ? (
                  <button className="dt-empty-clear-btn" onClick={() => onSearchChange("")}>
                    Clear Search Query
                  </button>
                ) : showFilteredEmpty && onClearFilters ? (
                  <button className="dt-empty-clear-btn" onClick={onClearFilters}>
                    Reset All Filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="dt-wrapper">
            <table className="dt-table">
              {renderTableHead()}
              <TableBody
                table={table}
                loading={loading}
                onRowClick={onRowClick}
                handleRowClick={handleRowClick}
                stickyFirstColumn={stickyFirstColumn}
                stickyLastColumn={stickyLastColumn}
                rowClassName={rowClassName}
              />
            </table>
          </div>
        )}
      </div>

      {pagination && onPageChange && pagination.total > 0 && (
        <TablePagination
          pagination={pagination}
          page={page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
});

export default DataTable;
