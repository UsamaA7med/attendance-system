import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  title?: string;
  subtitle?: string;
  description?: React.ReactNode;
  itemName?: string;
  details?: React.ReactNode;
  warning?: React.ReactNode;
  consequences?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  deletingLabel?: string;
  children?: React.ReactNode;
}

/**
 * Shared confirmation modal for any destructive deletion operation.
 * Guarantees uniform design, typography, alert styling, ESC/backdrop dismissal, and disabled state without spinners.
 */
export const ConfirmDeleteModal = React.memo(function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Confirm Deletion",
  subtitle = "This action cannot be undone.",
  description,
  itemName,
  details,
  warning,
  consequences,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  deletingLabel = "Deleting...",
  children,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

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
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 disabled:opacity-50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-3">
          {description ? (
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              {description}
            </div>
          ) : itemName ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete{" "}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                "{itemName}"
              </strong>
              ?
            </p>
          ) : null}

          {details && (
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/50 p-3 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
              {details}
            </div>
          )}

          {warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs">
              {warning}
            </div>
          )}

          {consequences && consequences.length > 0 && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 border border-rose-200/50 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-semibold">⚠️ Deletion consequences:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {consequences.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-1.5"
          >
            {isDeleting ? deletingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});

export interface DeleteIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  isDeleting?: boolean;
}

/**
 * Standardized Delete / Trash icon button used across tables and list items.
 * Enforces unified Trash2 icon (h-4 w-4) and consistent rose color tokens across light & dark modes.
 */
export const DeleteIconButton = React.forwardRef<
  HTMLButtonElement,
  DeleteIconButtonProps
>(({ title = "Delete", isDeleting = false, className, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="sm"
    title={title}
    disabled={isDeleting || props.disabled}
    className={cn(
      "h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30 transition-colors",
      className
    )}
    {...props}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
));
DeleteIconButton.displayName = "DeleteIconButton";
