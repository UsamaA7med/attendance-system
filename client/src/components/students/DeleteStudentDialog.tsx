import React from "react";
import type { StudentItem } from "@/lib/students.api";
import { ConfirmDeleteModal } from "@/components/common";

export interface DeleteStudentDialogProps {
  student: StudentItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteStudentDialog = React.memo(function DeleteStudentDialog({
  student,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteStudentDialogProps) {
  if (!student) return null;

  const enrollmentsCount = student.enrollments?.length || 0;

  return (
    <ConfirmDeleteModal
      isOpen={Boolean(student)}
      onClose={onClose}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Student"
      description={
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Are you sure you want to permanently remove{" "}
          <strong className="text-neutral-900 dark:text-white font-semibold">
            {student.fullName}
          </strong>{" "}
          (Guardian: {student.parentName})?
        </p>
      }
      warning={
        enrollmentsCount > 0 ? (
          <div>
            <strong>Warning:</strong> This student is actively enrolled in{" "}
            <strong>{enrollmentsCount} class(es)</strong>. Deleting will remove their
            enrollments and attendance history permanently.
          </div>
        ) : undefined
      }
      confirmLabel="Delete Student"
    />
  );
});
