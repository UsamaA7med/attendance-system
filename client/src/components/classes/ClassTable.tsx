import React from "react";
import type { ClassItem } from "@/lib/classes.api";
import { ClassTableRow } from "./ClassTableRow";
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
import { BookOpen, Plus } from "lucide-react";

export interface ClassTableProps {
  classes: ClassItem[];
  isLoading: boolean;
  searchQuery: string;
  pagination?: DataTablePaginationProps;
  onOpenAdd: () => void;
  onEdit: (cls: ClassItem) => void;
  onDelete: (cls: ClassItem) => void;
}

export const ClassTable = React.memo(function ClassTable({
  classes,
  isLoading,
  searchQuery,
  pagination,
  onOpenAdd,
  onEdit,
  onDelete,
}: ClassTableProps) {
  return (
    <DataTableContainer pagination={pagination}>
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>Class & Room</TableHead>
            <TableHead>Assigned Teacher</TableHead>
            <TableHead>Enrollments & Lectures</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={5} rows={5} hasAvatar={true} />
          ) : classes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                <BookOpen className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {searchQuery ? "No matching classes found" : "No classes registered yet"}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? `No records found matching "${searchQuery}". Try adjusting your filters.`
                    : "Get started by adding your center's first educational class."}
                </p>
                {!searchQuery && (
                  <Button size="sm" onClick={onOpenAdd} className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add First Class
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            classes.map((cls) => (
              <ClassTableRow
                key={cls.id}
                cls={cls}
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
