import type { Teacher } from "@/lib/teachers.api";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DeleteTeacherDialogProps {
  teacher: Teacher | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteTeacherDialog({
  teacher,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTeacherDialogProps) {
  if (!teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              Delete Teacher
            </h3>
            <p className="text-xs text-neutral-500">Action cannot be undone.</p>
          </div>
        </div>

        <div className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <p>
            Are you sure you want to permanently remove <strong>{teacher.name}</strong> ({teacher.email})?
          </p>

          {teacher.classesCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Warning:</strong> This teacher is assigned to <strong>{teacher.classesCount} class(es)</strong>.
              Due to database referential integrity, deletion will be blocked if active classes remain linked. You should reassign those classes first or deactivate this teacher instead.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-1.5"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Teacher"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
