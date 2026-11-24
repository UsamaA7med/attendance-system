import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTablePagination,
  type DataTablePaginationProps,
} from "./DataTablePagination";
import { cn } from "@/lib/utils";

export interface DataTableContainerProps {
  children: React.ReactNode;
  pagination?: DataTablePaginationProps;
  minWidth?: string;
  swipeHint?: string;
  className?: string;
}

export const DataTableContainer = React.memo(function DataTableContainer({
  children,
  pagination,
  swipeHint = "Swipe horizontally to view all details",
  className,
}: DataTableContainerProps) {
  return (
    <Card className={cn("shadow-xs overflow-hidden border border-neutral-200 dark:border-neutral-800", className)}>
      {swipeHint && (
        <div className="sm:hidden px-4 py-1.5 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>{swipeHint}</span>
          <span className="text-neutral-400 font-bold">⇄</span>
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          {children}
        </div>
        {pagination && <DataTablePagination {...pagination} />}
      </CardContent>
    </Card>
  );
});
