import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  // Optional legacy props
  limit?: number;
  total?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export const DataTablePagination = React.memo(function DataTablePagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  // Generate page numbers with an ellipsis window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const safeTotalPages = Math.max(1, totalPages || 1);
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", safeTotalPages);
      } else if (page >= safeTotalPages - 2) {
        pages.push(1, "...", safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", safeTotalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-end gap-1.5 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-xs">
      {/* Previous Page Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 gap-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage || isLoading}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((p, index) =>
          typeof p === "number" ? (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className={`h-8 min-w-8 px-2 text-xs font-medium transition-colors ${
                p === page
                  ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-xs"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
              }`}
              onClick={() => onPageChange(p)}
              disabled={isLoading || p === page}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-neutral-400 select-none text-xs"
            >
              {p}
            </span>
          )
        )}
      </div>

      {/* Next Page Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 gap-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage || isLoading}
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
