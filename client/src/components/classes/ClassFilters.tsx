import { Input } from "@/components/ui/input";
import type { Teacher } from "@/lib/teachers.api";
import { Filter, Search, UserCheck } from "lucide-react";
import React from "react";

export type StatusFilterOption = "all" | "active" | "inactive";

interface ClassFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusChange: (status: StatusFilterOption) => void;
  teacherFilter: string;
  onTeacherChange: (teacherId: string) => void;
  teachers: Teacher[];
}

export const ClassFilters = React.memo(function ClassFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  teacherFilter,
  onTeacherChange,
  teachers,
}: ClassFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search by class name, room, or teacher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Teacher Filter */}
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:w-48">
          <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <select
            value={teacherFilter}
            onChange={(e) => onTeacherChange(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
          >
            <option value="all">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-36">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilterOption)}
            className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>
    </div>
  );
});
