import React from "react";
import type { Teacher } from "@/lib/teachers.api";
import { ConfirmDeleteModal } from "@/components/common";

export interface DeleteTeacherDialogProps {
  teacher: Teacher | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteTeacherDialog = React.memo(function DeleteTeacherDialog({
  teacher,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTeacherDialogProps) {
  if (!teacher) return null;

  return (
    <ConfirmDeleteModal
      isOpen={Boolean(teacher)}
      onClose={onClose}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Teacher"
      description={
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Are you sure you want to permanently remove{" "}
          <strong className="text-neutral-900 dark:text-white font-semibold">
            {teacher.name}
          </strong>{" "}
          ({teacher.email})?
        </p>
      }
      warning={
        teacher.classesCount > 0 ? (
          <div>
            <strong>Warning:</strong> This teacher is assigned to{" "}
            <strong>{teacher.classesCount} class(es)</strong>. Due to database
            referential integrity, deletion will be blocked if active classes
            remain linked. You should reassign those classes first or deactivate
            this teacher instead.
          </div>
        ) : undefined
      }
      confirmLabel="Delete Teacher"
    />
  );
});
