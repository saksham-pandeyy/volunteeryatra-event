"use client";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import clsx from "clsx";
const cn = clsx;

interface PaginationData {
  total: number;
  limit: number;
  pages: number;
}

interface TablePaginationProps {
  pagination: PaginationData;
  page: number;
  onPageChange: (page: number, limit: number) => void;
}

export const TablePagination = ({
  pagination,
  page,
  onPageChange,
}: TablePaginationProps) => {
  if (!pagination || !onPageChange || pagination.total === 0) return null;

  const handleRowsChange = (newLimit: number) => {
    onPageChange(1, newLimit);
  };

  return (
    <div className="dt-pagination">
      <div className="dt-pagination__left">
        <div className="dt-rows-per-page">
          <span className="dt-rows-per-page__label">Rows:</span>
          <div className="dt-rows-select-wrapper">
            <select
              value={pagination.limit}
              onChange={(e) => handleRowsChange(Number(e.target.value))}
              className="dt-rows-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <svg className="dt-rows-select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        <div className="dt-pagination__info">
          Showing{" "}
          <span className="dt-pagination__info--bold">
            {(page - 1) * pagination.limit + 1}
          </span>{" "}
          -{" "}
          <span className="dt-pagination__info--bold">
            {Math.min(page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="dt-pagination__info--bold">{pagination.total}</span>
        </div>
      </div>

      <div className="dt-pagination__right">
        <nav className="dt-pagination__nav">
          <button
            className="dt-nav-btn"
            disabled={page === 1}
            onClick={() => onPageChange(1, pagination.limit)}
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className="dt-nav-btn"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1, pagination.limit)}
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="dt-page-numbers">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === pagination.pages || Math.abs(p - page) <= 1,
              )
              .reduce((acc: (number | string)[], p) => {
                const prev = acc[acc.length - 1];
                if (prev && typeof prev === "number" && p - prev > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ell-${i}`} className="dt-page-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={cn(
                      "dt-page-btn",
                      page === p && "dt-page-btn--active",
                    )}
                    onClick={() => onPageChange(Number(p), pagination.limit)}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <button
            className="dt-nav-btn"
            disabled={page === pagination.pages}
            onClick={() => onPageChange(page + 1, pagination.limit)}
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="dt-nav-btn"
            disabled={page === pagination.pages}
            onClick={() => onPageChange(pagination.pages, pagination.limit)}
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </nav>
      </div>
    </div>
  );
};
