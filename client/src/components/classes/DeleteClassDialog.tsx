import React from "react";
import type { ClassItem } from "@/lib/classes.api";
import { ConfirmDeleteModal } from "@/components/common";

export interface DeleteClassDialogProps {
  cls: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteClassDialog = React.memo(function DeleteClassDialog({
  cls,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteClassDialogProps) {
  if (!cls) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Class"
      itemName={cls.name}
      consequences={[
        `All associated scheduled lectures (${cls.lecturesCount ?? 0}) will be removed.`,
        "Class enrollment records and attendance history will be deleted.",
        "This action is irreversible.",
      ]}
      confirmLabel="Delete Class"
    />
  );
});
