"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { flexRender } from "@tanstack/react-table";
import { SkeletonText } from "../../skeleton";
import clsx from "clsx";
const cn = clsx;

const Skeleton = ({ className = "", width, height, borderRadius }: any) => (
  <SkeletonText className={className} style={{ width, height, borderRadius }} />
);

export const TableBody = ({
  table,
  loading,
  onRowClick,
  handleRowClick,
  stickyFirstColumn,
  stickyLastColumn,
  rowClassName,
}: any) => {
  const [tooltip, setTooltip] = useState<any>(null);

  const handleMouseOver = (e: any) => {
    const target = e.target;
    if (!target) return;

    const hasOverflow = target.scrollWidth > target.clientWidth;
    if (!hasOverflow) {
      setTooltip(null);
      return;
    }

    const text = target.textContent;
    if (!text || text === "—" || text.trim().length === 0) {
      setTooltip(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setTooltip({
      text,
      top: rect.top - 2,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (loading) {
    return (
      <tbody>
        {Array.from({ length: 8 }).map((_, rIdx) => (
          <tr key={rIdx} className="dt-row dt-row--skeleton">
            {table.getVisibleLeafColumns().map((col: any, cIdx: number) => (
              <td
                key={cIdx}
                className={cn(
                  "dt-td",
                  cIdx === 0 && stickyFirstColumn && "dt-td--sticky-left",
                  col.id === "actions" &&
                  stickyLastColumn &&
                  "dt-td--sticky-right",
                )}
              >
                {col.id === "actions" ? (
                  <div className="dt-actions">
                    <Skeleton
                      width="80px"
                      height="32px"
                      borderRadius="var(--radius-sm)"
                    />
                    <Skeleton
                      width="80px"
                      height="32px"
                      borderRadius="var(--radius-sm)"
                    />
                  </div>
                ) : (
                  <Skeleton width="80%" height="18px" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return null;
  }

  return (
    <tbody>
      {table.getRowModel().rows.map((row: any) => (
        <tr
          key={row.id}
          className={cn("dt-row", onRowClick && "dt-row--clickable", rowClassName)}
          onClick={(e) => handleRowClick(row.original, e)}
        >
          {row.getVisibleCells().map((cell: any, colIdx: number) => (
            <td
              key={cell.id}
              className={cn(
                "dt-td",
                colIdx === 0 && stickyFirstColumn && "dt-td--sticky-left",
                cell.column.id === "actions" &&
                stickyLastColumn &&
                "dt-td--sticky-right",
                cell.column.columnDef.meta?.align &&
                `dt-td--${cell.column.columnDef.meta.align}`,
              )}
              style={{
                width: cell.column.getSize(),
                minWidth: cell.column.getSize(),
                maxWidth: cell.column.getSize(),
              }}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
      {tooltip && createPortal(
        <div className="dt-tooltip-portal"
          style={{
            top: tooltip.top,
            left: tooltip.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="animate-fade-in">
            <div className="dt-tooltip-content">
              {tooltip.text}
              <div className="dt-tooltip-arrow" />
            </div>
          </div>
        </div>,
        document.fullscreenElement || document.body
      )}
    </tbody>
  );
};
