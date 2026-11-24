import React from "react";
import {
  DataTableFilterBar,
  StatusFilterSelect,
  type StatusFilterOption,
} from "@/components/common";

export type { StatusFilterOption };

interface TeacherFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (status: StatusFilterOption) => void;
  totalCount?: number;
  activeCount?: number;
  inactiveCount?: number;
}

export const TeacherFilters = React.memo(function TeacherFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TeacherFiltersProps) {
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
