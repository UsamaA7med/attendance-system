import React from "react";
import { UserCheck } from "lucide-react";
import type { Teacher } from "@/lib/teachers.api";
import {
  DataTableFilterBar,
  FilterSelect,
  StatusFilterSelect,
  type StatusFilterOption,
} from "@/components/common";

export type { StatusFilterOption };

interface ClassFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusChange: (status: StatusFilterOption) => void;
  teacherFilter: string;
  onTeacherChange: (teacherId: string) => void;
  teachers: Teacher[];
  showTeacherFilter?: boolean;
}

export const ClassFilters = React.memo(function ClassFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  teacherFilter,
  onTeacherChange,
  teachers,
  showTeacherFilter = true,
}: ClassFiltersProps) {
  const teacherOptions = React.useMemo(
    () => [
      { value: "all", label: "All Teachers" },
      ...teachers.map((t) => ({ value: t.id, label: t.name })),
    ],
    [teachers]
  );

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by class name, room, or teacher..."
    >
      {showTeacherFilter && (
        <FilterSelect
          icon={<UserCheck className="h-3.5 w-3.5" />}
          value={teacherFilter}
          onChange={onTeacherChange}
          options={teacherOptions}
          ariaLabel="Filter by teacher"
        />
      )}
      <StatusFilterSelect
        value={statusFilter}
        onChange={onStatusChange}
      />
    </DataTableFilterBar>
  );
});
