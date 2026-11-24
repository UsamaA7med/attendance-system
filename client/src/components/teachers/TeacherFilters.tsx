import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type StatusFilterOption = "all" | "active" | "inactive";

interface TeacherFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (status: StatusFilterOption) => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export const TeacherFilters = React.memo(function TeacherFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  activeCount,
  inactiveCount,
}: TeacherFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search by name, email, department, or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white dark:bg-neutral-900"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full self-start sm:self-auto bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => onStatusFilterChange("all")}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange("active")}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === "active"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange("inactive")}
          className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors ${
            statusFilter === "inactive"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          Inactive ({inactiveCount})
        </button>
      </div>
    </div>
  );
});
