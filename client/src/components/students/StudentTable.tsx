import React from "react";
import type { StudentItem } from "@/lib/students.api";
import { StudentTableRow } from "./StudentTableRow";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DataTableContainer,
  type DataTablePaginationProps,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export interface StudentTableProps {
  students: StudentItem[];
  isLoading: boolean;
  searchQuery: string;
  pagination?: DataTablePaginationProps;
  onOpenAdd: () => void;
  onEdit: (student: StudentItem) => void;
  onDelete: (student: StudentItem) => void;
}

export const StudentTable = React.memo(function StudentTable({
  students,
  isLoading,
  searchQuery,
  pagination,
  onOpenAdd,
  onEdit,
  onDelete,
}: StudentTableProps) {
  return (
    <DataTableContainer pagination={pagination}>
      <Table className="min-w-[750px]">
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Guardian & Phone</TableHead>
            <TableHead>Enrolled Classes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={5} rows={pagination?.limit || 5} hasAvatar={true} />
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                <Users className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {searchQuery ? "No matching students found" : "No students registered yet"}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? "Try adjusting your search keywords or clear filters."
                    : "Start onboarding students and enrolling them into classes."}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={onOpenAdd}
                  >
                    <Plus className="h-4 w-4" />
                    Add First Student
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <StudentTableRow
                key={student.id}
                student={student}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </DataTableContainer>
  );
});
