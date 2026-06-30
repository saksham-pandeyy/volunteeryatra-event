"use client";

import { flexRender } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import clsx from "clsx";
const cn = clsx;

export const SortIcon = ({ isSorted, isSortedDesc, isSorting }: any) => (
  <div className={cn("dt-sort-indicator", isSorted && "is-active", isSorting && "is-sorting")}>
    {isSorting ? (
      <Loader2 size={14} className="dt-sort-spinner animate-spin text-primary" />
    ) : (
      <div className="dt-sort-arrows">
        <ArrowUp
          size={11}
          className={cn(
            "dt-arrow dt-arrow-up",
            isSorted && !isSortedDesc && "active",
          )}
        />
        <ArrowDown
          size={11}
          className={cn(
            "dt-arrow dt-arrow-down",
            isSorted && isSortedDesc && "active",
          )}
        />
      </div>
    )}
  </div>
);

export const TableHead = ({ table, stickyFirstColumn, stickyLastColumn, isSorting }: any) => {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup: any) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header: any, idx: number) => {
            const isFirst = idx === 0 && stickyFirstColumn;
            const isLast = header.column.id === "actions" && stickyLastColumn;
            const isSorted = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                className={cn(
                  "dt-th",
                  isFirst && "dt-th--sticky-left",
                  isLast && "dt-th--sticky-right",
                  header.column.getCanSort() && "dt-th--sortable",
                  isSorted && "dt-th--sorted",
                )}
                style={{
                  width: header.getSize(),
                  minWidth: header.getSize(),
                }}
              >
                <div className="dt-th-content">
                  <span
                    className="dt-label"
                    onClick={header.column.getToggleSortingHandler()}
                    title={header.column.getCanSort() ? `Sort by ${flexRender(header.column.columnDef.header, header.getContext())}` : undefined}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>

                  {header.column.getCanSort() && (
                    <div
                      className={cn(
                        "dt-header-actions",
                        isSorted && "dt-header-actions--active",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <SortIcon
                        isSorted={isSorted}
                        isSortedDesc={isSorted === "desc"}
                        isSorting={isSorting && !!isSorted}
                      />
                    </div>
                  )}
                </div>

                {header.column.getCanResize() && (
                  <div
                    className="dt-resize-handle"
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                  />
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};
