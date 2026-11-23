import { Button } from "@/components/ui/button";
import type { ClassItem } from "@/lib/classes.api";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import React, { useEffect } from "react";

interface DeleteClassDialogProps {
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
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen || !cls) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, cls, isDeleting, onClose]);

  if (!isOpen || !cls) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              Delete Class
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Are you sure you want to delete{" "}
            <strong className="text-neutral-900 dark:text-white font-semibold">
              "{cls.name}"
            </strong>
            ?
          </p>

          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 border border-rose-200/50 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-semibold">⚠️ Deletion consequences:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>
                All associated scheduled lectures ({cls.lecturesCount ?? 0}) will be removed.
              </li>
              <li>
                Class enrollment records and attendance history will be deleted.
              </li>
              <li>This action is irreversible.</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-1.5"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Class</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
