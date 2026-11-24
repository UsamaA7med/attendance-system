import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Reusable Filter Select Dropdown Component
// ============================================================================
export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export const FilterSelect = React.memo(function FilterSelect({
  value,
  onChange,
  options,
  icon,
  className,
  ariaLabel,
}: FilterSelectProps) {
  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(
          "h-9 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 transition-colors cursor-pointer",
          icon ? "pl-8 pr-3" : "px-3"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// ============================================================================
// Pre-configured Status Filter Select Component
// ============================================================================
export type StatusFilterOption = "all" | "active" | "inactive";

export interface StatusFilterSelectProps {
  value: StatusFilterOption;
  onChange: (value: StatusFilterOption) => void;
  className?: string;
  allLabel?: string;
}

export const StatusFilterSelect = React.memo(function StatusFilterSelect({
  value,
  onChange,
  className,
  allLabel = "All Status",
}: StatusFilterSelectProps) {
  const options: FilterSelectOption[] = [
    { value: "all", label: allLabel },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive Only" },
  ];

  return (
    <FilterSelect
      icon={<Filter className="h-3.5 w-3.5" />}
      value={value}
      onChange={(v) => onChange(v as StatusFilterOption)}
      options={options}
      ariaLabel="Filter by status"
      className={className}
    />
  );
});

// ============================================================================
// Main Shared DataTableFilterBar Component
// ============================================================================
export interface DataTableFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchMaxWidth?: string;
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  className?: string;
}

export const DataTableFilterBar = React.memo(function DataTableFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  searchMaxWidth = "max-w-md",
  children,
  leftContent,
  className,
}: DataTableFilterBarProps) {
  return (
    <Card
      className={cn(
        "shadow-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left Area: Search input and/or custom left content */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {leftContent}

            {onSearchChange !== undefined && (
              <div className={cn("relative flex-1 min-w-[200px]", searchMaxWidth)}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-neutral-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Area: Filter dropdowns and controls */}
          {children && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
