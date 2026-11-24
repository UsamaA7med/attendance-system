import React from "react";
import type { Staff } from "@/lib/staff.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/common";
import {
  Mail,
  Building,
  Phone,
  ClipboardCheck,
  Edit,
} from "lucide-react";

interface StaffTableRowProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export const StaffTableRow = React.memo(function StaffTableRow({
  staff,
  onEdit,
  onDelete,
}: StaffTableRowProps) {
  return (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
      {/* Staff Member Info */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase shadow-sm">
            {staff.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {staff.name}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {staff.email}
            </div>
          </div>
        </div>
      </td>

      {/* Department & Position */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 font-medium text-neutral-800 dark:text-neutral-200">
            <Building className="h-3 w-3 text-neutral-400" />
            {staff.department || "Operations"}
          </span>
          <div className="text-neutral-500 text-[11px]">
            {staff.position || "Staff"}
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
        {staff.phone ? (
          <div className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {staff.phone}
          </div>
        ) : (
          <div className="text-neutral-400 italic">No phone</div>
        )}
      </td>

      {/* Activity / Roll Calls Recorded */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
        {(staff.markedAttendancesCount ?? 0) > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
            <ClipboardCheck className="h-3 w-3 shrink-0" />
            <span>{staff.markedAttendancesCount} records</span>
          </span>
        ) : (
          <span className="text-xs text-neutral-400 italic">No attendance records</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
        {staff.isActive ? (
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
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(staff)}
            className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
            title="Edit staff member"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          <DeleteIconButton
            onClick={() => onDelete(staff)}
            title="Delete staff member"
          />
        </div>
      </td>
    </tr>
  );
});
