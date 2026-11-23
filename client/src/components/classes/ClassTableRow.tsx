import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClassItem } from "@/lib/classes.api";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Edit,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";
import React from "react";

interface ClassTableRowProps {
  cls: ClassItem;
  onEdit: (cls: ClassItem) => void;
  onDelete: (cls: ClassItem) => void;
  onAddLecture: (cls: ClassItem) => void;
}

export const ClassTableRow = React.memo(function ClassTableRow({
  cls,
  onEdit,
  onDelete,
  onAddLecture,
}: ClassTableRowProps) {
  return (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
      {/* Class Name & Room */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-2">
              <span>{cls.name}</span>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 truncate">
              {cls.room ? (
                <span className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                  <MapPin className="h-3 w-3 text-neutral-400" />
                  {cls.room}
                </span>
              ) : (
                <span className="text-neutral-400 italic">No room specified</span>
              )}
              {cls.description && (
                <span className="truncate max-w-xs text-neutral-400">
                  • {cls.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Assigned Teacher */}
      <td className="px-6 py-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold text-[11px]">
            {cls.teacher?.name ? cls.teacher.name.charAt(0) : "T"}
          </div>
          <div>
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              {cls.teacher?.name || "Unassigned"}
            </div>
            <div className="text-[11px] text-neutral-400">
              {cls.teacher?.department || "Instructor"}
            </div>
          </div>
        </div>
      </td>

      {/* Enrollments & Scheduled Lectures */}
      <td className="px-6 py-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <span>
              <strong className="font-semibold">{cls.enrollmentsCount}</strong> students enrolled
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
            <span>
              <strong className="font-semibold">{cls.lecturesCount}</strong> lectures scheduled
            </span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {cls.isActive ? (
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

      {/* Quick Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs gap-1"
            onClick={() => onAddLecture(cls)}
            title="Schedule a lecture for this class"
          >
            <Clock className="h-3.5 w-3.5 text-neutral-500" />
            <span>+Lecture</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            onClick={() => onEdit(cls)}
            title="Edit class details"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => onDelete(cls)}
            title="Delete class"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});
