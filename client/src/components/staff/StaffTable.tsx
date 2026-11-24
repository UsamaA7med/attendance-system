import React from "react";
import type { Staff } from "@/lib/staff.api";
import { StaffTableRow } from "./StaffTableRow";
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
import { ShieldCheck, Plus } from "lucide-react";

export interface StaffTableProps {
  staff: Staff[];
  isLoading: boolean;
  searchQuery: string;
  pagination?: DataTablePaginationProps;
  onOpenAdd: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export const StaffTable = React.memo(function StaffTable({
  staff,
  isLoading,
  searchQuery,
  pagination,
  onOpenAdd,
  onEdit,
  onDelete,
}: StaffTableProps) {
  return (
    <DataTableContainer pagination={pagination}>
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Department & Position</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={6} rows={5} hasAvatar={true} />
          ) : staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                <ShieldCheck className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {searchQuery ? "No matching staff found" : "No staff members registered yet"}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? `No records found matching "${searchQuery}". Try adjusting your search query.`
                    : "Get started by registering your center's first operational staff member."}
                </p>
                {!searchQuery && (
                  <Button size="sm" onClick={onOpenAdd} className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Register First Staff
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member) => (
              <StaffTableRow
                key={member.id}
                staff={member}
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
