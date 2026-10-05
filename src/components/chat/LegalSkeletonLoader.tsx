import React from "react";

export function LegalSkeletonLoader() {
  return (
    <div className="w-full space-y-2 py-1 select-none" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-seal animate-pulse" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Drafting Testamentary Clause
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="h-3 w-11/12 rounded legal-skeleton-shimmer" />
        <div className="h-3 w-4/5 rounded legal-skeleton-shimmer" />
        <div className="h-3 w-3/5 rounded legal-skeleton-shimmer" />
      </div>
    </div>
  );
}
