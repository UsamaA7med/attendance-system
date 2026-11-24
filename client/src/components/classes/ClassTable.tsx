import React from "react";
import type { ClassItem } from "@/lib/classes.api";
import { ClassTableRow } from "./ClassTableRow";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface ClassTableProps {
  classes: ClassItem[];
  isLoading: boolean;
  searchQuery: string;
  onOpenAdd: () => void;
  onEdit: (cls: ClassItem) => void;
  onDelete: (cls: ClassItem) => void;
  onAddLecture: (cls: ClassItem) => void;
}

export const ClassTable = React.memo(function ClassTable({
  classes,
  isLoading,
  searchQuery,
  onOpenAdd,
  onEdit,
  onDelete,
  onAddLecture,
}: ClassTableProps) {
  return (
    <Card className="shadow-xs overflow-hidden">
      <div className="sm:hidden px-4 py-1.5 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
        <span>Swipe horizontally to view all details</span>
        <span className="text-neutral-400 font-bold">⇄</span>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">Class & Room</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">Assigned Teacher</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">Enrollments & Lectures</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <TableSkeletonRows columns={5} rows={5} hasAvatar={true} />
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
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
                        Create Class
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <ClassTableRow
                    key={cls.id}
                    cls={cls}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddLecture={onAddLecture}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
