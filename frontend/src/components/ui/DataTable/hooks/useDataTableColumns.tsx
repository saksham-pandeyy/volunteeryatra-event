"use client";

import { useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { CellTooltip } from "../components/CellTooltip";

interface UseDataTableColumnsProps {
  userColumns: any[];
  copiedId: any;
  copyToClipboard: (text: string, id: any) => void;
}

export function useDataTableColumns({
  userColumns,
  copiedId,
  copyToClipboard
}: UseDataTableColumnsProps) {
  return useMemo(() => {
    return userColumns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      cell: (info: any) => {
        const value = info.getValue();
        const row = info.row.original;

        if (col.key === "actions") {
          return <div className="dt-actions">{col.render?.(value, row)}</div>;
        }

        let content;
        if (col.copyable && value) {
          content = (
            <div className="dt-copyable">
              <code className="dt-code">{value}</code>
              <button
                className="dt-action-btn dt-copy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(value, `${row.id}-${col.key}`);
                }}
              >
                {copiedId === `${row.id}-${col.key}` ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          );
        } else if (col.render) {
          content = col.render(value, row);
        } else {
          content = value ?? "—";
        }

        if (typeof content === "string" || typeof content === "number") {
          return <CellTooltip content={content} />;
        }
        return content;
      },
      enableSorting: col.sortable !== false && col.key !== "actions",
      enableResizing: col.resizable !== false && col.key !== "actions",
      size: col.width || 180,
      minSize: col.minWidth || 120,
      meta: { align: col.align },
    }));
  }, [userColumns, copiedId, copyToClipboard]);
}
