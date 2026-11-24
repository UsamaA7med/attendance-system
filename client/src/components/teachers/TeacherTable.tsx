import React from "react";
import type { Teacher } from "@/lib/teachers.api";
import { TeacherTableRow } from "./TeacherTableRow";
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
import { GraduationCap, Plus } from "lucide-react";

export interface TeacherTableProps {
  teachers: Teacher[];
  isLoading: boolean;
  searchQuery: string;
  pagination?: DataTablePaginationProps;
  onOpenAdd: () => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export const TeacherTable = React.memo(function TeacherTable({
  teachers,
  isLoading,
  searchQuery,
  pagination,
  onOpenAdd,
  onEdit,
  onDelete,
}: TeacherTableProps) {
  return (
    <DataTableContainer pagination={pagination}>
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Department & Phone</TableHead>
            <TableHead>Assigned Classes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={5} rows={pagination?.limit || 5} hasAvatar={true} />
          ) : teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                <GraduationCap className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {searchQuery ? "No matching teachers found" : "No teachers registered yet"}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? `No records found matching "${searchQuery}". Try adjusting your search query.`
                    : "Get started by adding your center's first instructor."}
                </p>
                {!searchQuery && (
                  <Button size="sm" onClick={onOpenAdd} className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add First Teacher
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher) => (
              <TeacherTableRow
                key={teacher.id}
                teacher={teacher}
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
