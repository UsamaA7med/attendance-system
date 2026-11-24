import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
  isLoading?: boolean;
}

export const DataTablePagination = React.memo(function DataTablePagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  isLoading = false,
}: DataTablePaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers with ellipsis window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400">
      {/* Left: Summary and Limit Selector */}
      <div className="flex items-center gap-4 order-2 sm:order-1">
        <div>
          {total === 0 ? (
            <span>No records found</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{startItem}</span> to{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{endItem}</span> of{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{total}</span> results
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="rows-per-page" className="hidden md:inline text-neutral-500 text-xs">
            Rows:
          </label>
          <select
            id="rows-per-page"
            aria-label="Rows per page"
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1); // Reset to first page on page size change
            }}
            disabled={isLoading}
            className="h-7 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 px-2 py-0 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span className="sr-only">First Page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="sr-only">Previous Page</span>
        </Button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, index) =>
            typeof p === "number" ? (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={`h-7 min-w-7 px-2 text-xs ${
                  p === page
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
              >
                {p}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-1 text-neutral-400 select-none">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="sr-only">Next Page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onPageChange(totalPages || 1)}
          disabled={!hasNextPage || isLoading}
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          <span className="sr-only">Last Page</span>
        </Button>
      </div>
    </div>
  );
});
