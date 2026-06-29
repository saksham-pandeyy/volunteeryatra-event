"use client";

import { flexRender } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import clsx from "clsx";
const cn = clsx;

export const SortIcon = ({ isSorted, isSortedDesc, isSorting }: any) => (
  <div className={cn("dt-sort-indicator", isSorted && "is-active", isSorting && "is-sorting")}>
    {isSorting ? (
      <Loader2 size={12} className="dt-sort-spinner animate-spin" />
    ) : (
      <>
        <ArrowUp
          size={12}
          className={cn(
            "dt-arrow dt-arrow-up",
            isSorted && !isSortedDesc && "active",
          )}
        />
        <ArrowDown
          size={12}
          className={cn(
            "dt-arrow dt-arrow-down",
            isSorted && isSortedDesc && "active",
          )}
        />
      </>
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

            return (
              <th
                key={header.id}
                className={cn(
                  "dt-th",
                  isFirst && "dt-th--sticky-left",
                  isLast && "dt-th--sticky-right",
                  header.column.getCanSort() && "dt-th--sortable",
                )}
                style={{
                  width: header.getSize(),
                  minWidth: header.getSize(),
                }}
              >
                <div className="dt-th-content">
                  <div
                    className={cn(
                      "dt-th-group",
                      header.column.getCanSort() && "dt-th--sortable",
                    )}
                  >
                    <span
                      className="dt-label"
                      onClick={header.column.getToggleSortingHandler()}
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
                          header.column.getCanResize() && "dt-resizer",
                        )}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <SortIcon
                          isSorted={header.column.getIsSorted()}
                          isSortedDesc={header.column.getIsSorted() === "desc"}
                          isSorting={isSorting && !!header.column.getIsSorted()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};
