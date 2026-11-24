import React from "react";
import type { LectureItem } from "@/lib/lectures.api";
import { ConfirmDeleteModal } from "@/components/common";

export interface DeleteLectureDialogProps {
  lecture: LectureItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteLectureDialog = React.memo(function DeleteLectureDialog({
  lecture,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteLectureDialogProps) {
  if (!lecture) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Lecture"
      description={
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Are you sure you want to delete this lecture for{" "}
          <strong className="text-neutral-900 dark:text-white font-semibold">
            "{lecture.class?.name || "Class"}"
          </strong>
          ?
        </p>
      }
      details={
        <>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Date:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {lecture.date}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Start Time:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {lecture.startTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Teacher:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {lecture.class?.teacher?.name || "Unassigned"}
            </span>
          </div>
        </>
      }
      consequences={[
        "All associated roll call attendance records will be permanently deleted.",
        "This action is irreversible.",
      ]}
      confirmLabel="Delete Lecture"
    />
  );
});
