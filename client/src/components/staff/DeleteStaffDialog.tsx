import React from "react";
import type { Staff } from "@/lib/staff.api";
import { ConfirmDeleteModal } from "@/components/common";

export interface DeleteStaffDialogProps {
  staff: Staff | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteStaffDialog = React.memo(function DeleteStaffDialog({
  staff,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteStaffDialogProps) {
  if (!staff) return null;

  const hasActivity = (staff.markedAttendancesCount ?? 0) > 0;

  return (
    <ConfirmDeleteModal
      isOpen={Boolean(staff)}
      onClose={onClose}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Staff Member"
      description={
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Are you sure you want to permanently remove{" "}
          <strong className="text-neutral-900 dark:text-white font-semibold">
            {staff.name}
          </strong>{" "}
          ({staff.email})?
        </p>
      }
      warning={
        hasActivity ? (
          <div>
            <strong>Warning:</strong> This staff member has recorded{" "}
            <strong>{staff.markedAttendancesCount} attendance records</strong>. Due to database
            referential integrity, deletion will be blocked if attendance or lecture
            history remains linked. You should deactivate this account instead.
          </div>
        ) : undefined
      }
      confirmLabel="Delete Staff"
    />
  );
});
