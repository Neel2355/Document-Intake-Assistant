"use client";

import React from "react";
import { Clock } from "lucide-react";

interface WaitingPlaceholderProps {
  label?: string;
  inline?: boolean;
}

/**
 * Visual indicator rendering the exact required text:
 * "Waiting for input..." styled in a sleek, muted gray state.
 */
export function WaitingPlaceholder({ label, inline = false }: WaitingPlaceholderProps) {
  if (inline) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-400 border border-zinc-200/80 italic select-none"
        title={label ? `Waiting for ${label}` : "Waiting for input..."}
      >
        <Clock className="w-3 h-3 text-zinc-400 animate-pulse" />
        Waiting for input...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 text-zinc-400 italic text-sm select-none transition-all">
      <Clock className="w-4 h-4 text-zinc-400 shrink-0 animate-pulse" />
      <span>Waiting for input...</span>
      {label && <span className="text-xs text-zinc-400 not-italic ml-auto font-sans">({label})</span>}
    </div>
  );
}
