import React from "react";
import type { Teacher } from "@/lib/teachers.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/common";
import {
  Mail,
  Building,
  Phone,
  BookOpen,
  Edit,
} from "lucide-react";

interface TeacherTableRowProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export const TeacherTableRow = React.memo(function TeacherTableRow({
  teacher,
  onEdit,
  onDelete,
}: TeacherTableRowProps) {
  return (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
      {/* Teacher Info */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase shadow-sm">
            {teacher.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {teacher.name}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {teacher.email}
            </div>
          </div>
        </div>
      </td>

      {/* Department & Phone */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 font-medium text-neutral-800 dark:text-neutral-200">
            <Building className="h-3 w-3 text-neutral-400" />
            {teacher.department || "General"}
          </span>
          {teacher.phone ? (
            <div className="text-neutral-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {teacher.phone}
            </div>
          ) : (
            <div className="text-neutral-400 italic">No phone</div>
          )}
        </div>
      </td>

      {/* Classes Taught */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
        {teacher.classes && teacher.classes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {teacher.classes.map((cls) => (
              <span
                key={cls.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60"
                title={`Class: ${cls.name}${cls.room ? ` (${cls.room})` : ""}`}
              >
                <BookOpen className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[120px]">{cls.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic whitespace-nowrap">No classes assigned</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
        {teacher.isActive ? (
          <Badge
            variant="default"
            className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold hover:bg-emerald-600/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Active
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-[11px] font-semibold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 mr-1.5" />
            Inactive
          </Badge>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(teacher)}
            title="Edit teacher"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <DeleteIconButton
            onClick={() => onDelete(teacher)}
            title="Delete teacher"
          />
        </div>
      </td>
    </tr>
  );
});
