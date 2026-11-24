import React from "react";
import type { StudentItem } from "@/lib/students.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/common";
import { Phone, User, Edit, BookOpen } from "lucide-react";

interface StudentTableRowProps {
  student: StudentItem;
  onEdit: (student: StudentItem) => void;
  onDelete: (student: StudentItem) => void;
  readOnly?: boolean;
}

export const StudentTableRow = React.memo(function StudentTableRow({
  student,
  onEdit,
  onDelete,
  readOnly = false,
}: StudentTableRowProps) {
  const activeEnrollments = student.enrollments?.filter((e) => e.status === "ACTIVE") || [];

  return (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
      {/* Student Info */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase shadow-xs">
            {student.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-xs sm:text-sm">
              {student.fullName}
            </div>
            {student.phone ? (
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                {student.phone}
              </div>
            ) : (
              <div className="text-[11px] text-neutral-400 italic">No personal phone</div>
            )}
          </div>
        </div>
      </td>

      {/* Guardian / Parent Info */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 font-medium text-neutral-800 dark:text-neutral-200">
            <User className="h-3 w-3 text-neutral-400" />
            {student.parentName}
          </span>
          <div className="text-neutral-500 flex items-center gap-1 text-[11px]">
            <Phone className="h-3 w-3 text-neutral-400" />
            {student.parentPhone}
          </div>
        </div>
      </td>

      {/* Enrolled Classes */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
        {activeEnrollments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {activeEnrollments.map((enr) => (
              <span
                key={enr.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
              >
                <BookOpen className="h-2.5 w-2.5" />
                {enr.className}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-neutral-400 text-xs italic">Not enrolled in any class</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
        <Badge
          variant={student.isActive ? "default" : "secondary"}
          className={`text-[11px] font-medium ${
            student.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {student.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>

      {/* Action Buttons */}
      {!readOnly && (
        <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(student)}
              className="h-8 px-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              title="Edit Student"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <DeleteIconButton
              onClick={() => onDelete(student)}
              title="Delete Student"
            />
          </div>
        </td>
      )}
    </tr>
  );
});
