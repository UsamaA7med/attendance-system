import * as React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useLoadingStore } from "@/store/useLoadingStore";
import { Spinner } from "@/components/ui/spinner";

export const GlobalLoadingIndicator = React.memo(function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isLoading: isManualLoading, message: manualMessage } = useLoadingStore();

  const isBackgroundBusy = isFetching > 0 || isMutating > 0;

  return (
    <>
      {/* 1. Top Viewport Indeterminate Progress Bar */}
      {isBackgroundBusy && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] h-0.5 overflow-hidden bg-neutral-200/50 dark:bg-neutral-800/50"
          role="progressbar"
          aria-label="Application loading data"
        >
          <div className="h-full w-full bg-neutral-900 dark:bg-white animate-pulse origin-left" />
        </div>
      )}

      {/* 2. Full-Screen Blocking Loading Modal (when imperatively requested via useLoadingStore) */}
      {isManualLoading && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 px-6 py-5 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <Spinner size="lg" />
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 animate-pulse">
              {manualMessage || "Loading, please wait..."}
            </p>
          </div>
        </div>
      )}
    </>
  );
});
