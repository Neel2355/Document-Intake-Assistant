"use client";

import React from "react";
import { IconClock } from "../icons/CustomIcons";

interface WaitingPlaceholderProps {
  label?: string;
  inline?: boolean;
}

/**
 * Visual indicator rendering the exact required legal specification text:
 * "Waiting for input..." styled in an architectural, restrained state.
 */
export function WaitingPlaceholder({ label, inline = false }: WaitingPlaceholderProps) {
  if (inline) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-surface-subtle text-ink-muted border border-surface-border select-none"
        title={label ? `Awaiting ${label}` : "Waiting for input..."}
      >
        <IconClock className="w-3 h-3 text-ink-muted" />
        <span>Waiting for input...</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2.5 p-3 rounded-md border border-dashed border-surface-border bg-surface-base text-ink-muted text-xs font-mono select-none">
      <IconClock className="w-3.5 h-3.5 text-ink-muted shrink-0" />
      <span>Waiting for input...</span>
      {label && <span className="text-[11px] text-ink-faint ml-auto font-sans">({label})</span>}
    </div>
  );
}
