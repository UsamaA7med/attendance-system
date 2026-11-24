import React from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ClassItem } from "@/lib/classes.api";

export type StudentStatusOption = "all" | "active" | "inactive";

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
  return (
    <Card className="shadow-xs">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by student name, guardian, or phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filters: Class and Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Class filter */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <select
                value={classFilter}
                onChange={(e) => onClassChange(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value as StudentStatusOption)}
                className="h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
