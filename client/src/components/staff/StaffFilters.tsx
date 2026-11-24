import React from "react";
import {
  DataTableFilterBar,
  StatusFilterSelect,
  type StatusFilterOption,
} from "@/components/common";

export type { StatusFilterOption };

interface StaffFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (status: StatusFilterOption) => void;
  totalCount?: number;
  activeCount?: number;
  inactiveCount?: number;
}

export const StaffFilters = React.memo(function StaffFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: StaffFiltersProps) {
  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, email, department, or phone..."
    >
      <StatusFilterSelect
        value={statusFilter}
        onChange={onStatusFilterChange}
      />
    </DataTableFilterBar>
  );
});
