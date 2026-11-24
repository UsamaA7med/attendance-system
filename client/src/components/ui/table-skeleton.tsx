import * as React from "react";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

export interface TableSkeletonRowsProps {
  columns?: number;
  rows?: number;
  hasAvatar?: boolean;
  hasActions?: boolean;
  className?: string;
}

export const TableSkeletonRows = React.memo(function TableSkeletonRows({
  columns = 5,
  rows = 5,
  hasAvatar = true,
  hasActions = true,
  className,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className={cn(
            "hover:bg-neutral-50/30 dark:hover:bg-neutral-900/30 transition-colors",
            className
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => {
            // First Column: Avatar/Icon + Title & Subtitle
            if (colIndex === 0 && hasAvatar) {
              return (
                <td key={colIndex} className="px-4 py-3.5 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
              );
            }

            // Last Column: Action Buttons aligned right
            if (colIndex === columns - 1 && hasActions) {
              return (
                <td key={colIndex} className="px-4 py-3.5 sm:px-6 sm:py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              );
            }

            // Status Badge column (usually second-to-last or middle)
            if (colIndex === columns - 2) {
              return (
                <td key={colIndex} className="px-4 py-3.5 sm:px-6 sm:py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
              );
            }

            // Standard Data Columns (date, department, enrollments, etc.)
            return (
              <td key={colIndex} className="px-4 py-3.5 sm:px-6 sm:py-4">
                <div className="space-y-1.5">
                  <Skeleton
                    className={cn(
                      "h-3.5",
                      colIndex % 2 === 0 ? "w-28" : "w-24"
                    )}
                  />
                  <Skeleton className="h-2.5 w-16 opacity-70" />
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
});
