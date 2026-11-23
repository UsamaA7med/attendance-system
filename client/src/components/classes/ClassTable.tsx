import React from "react";
import type { ClassItem } from "@/lib/classes.api";
import { ClassTableRow } from "./ClassTableRow";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <CardTitle className="text-base">Classes Roster ({classes.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3.5">Class & Room</th>
                <th className="px-6 py-3.5">Assigned Teacher</th>
                <th className="px-6 py-3.5">Enrollments & Lectures</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
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
