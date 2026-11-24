import React from "react";
import { BookOpen } from "lucide-react";
import type { ClassItem } from "@/lib/classes.api";
import {
  DataTableFilterBar,
  FilterSelect,
  StatusFilterSelect,
  type StatusFilterOption,
} from "@/components/common";

export type StudentStatusOption = StatusFilterOption;

interface StudentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StudentStatusOption;
  onStatusChange: (status: StudentStatusOption) => void;
  classFilter: string;
  onClassChange: (classId: string) => void;
  classes: ClassItem[];
}

export const StudentFilters = React.memo(function StudentFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  classFilter,
  onClassChange,
  classes,
}: StudentFiltersProps) {
  const classOptions = React.useMemo(
    () => [
      { value: "all", label: "All Classes" },
      ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
    ],
    [classes]
  );

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by student name, guardian, or phone..."
    >
      <FilterSelect
        icon={<BookOpen className="h-3.5 w-3.5" />}
        value={classFilter}
        onChange={onClassChange}
        options={classOptions}
        ariaLabel="Filter by class"
      />
      <StatusFilterSelect
        value={statusFilter}
        onChange={onStatusChange}
      />
    </DataTableFilterBar>
  );
});
