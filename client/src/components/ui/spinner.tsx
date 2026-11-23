import * as React from "react";
import { cn } from "cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-4",
};

export const Spinner = React.memo(function Spinner({
  size = "md",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-solid border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

export interface LoadingSpinnerProps extends SpinnerProps {
  label?: string;
  fullPage?: boolean;
  fullScreen?: boolean;
}

export const LoadingSpinner = React.memo(function LoadingSpinner({
  label,
  fullPage = false,
  fullScreen = false,
  size = "md",
  className,
  ...props
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size={size} className={className} {...props} />
      {label && (
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  if (fullPage) {
    return (
      <div className="flex h-64 sm:h-96 w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
});
