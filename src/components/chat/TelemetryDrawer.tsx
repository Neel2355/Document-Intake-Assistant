"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  IconActivity,
  IconChevronDown,
  IconChevronUp,
  IconCpu,
  IconClock,
  IconCode,
  IconCopy,
  IconCheck,
} from "../icons/CustomIcons";

export function TelemetryDrawer() {
  const { latestTelemetry, isTelemetryOpen, setIsTelemetryOpen } = useWishesStore();
  const [copied, setCopied] = useState(false);

  if (!latestTelemetry) {
    return (
      <div className="border-t border-surface-border bg-surface-base px-5 py-2 text-[11px] text-ink-muted flex items-center justify-between select-none shrink-0 no-print">
        <div className="flex items-center gap-2">
          <IconActivity className="w-3.5 h-3.5 text-ink-muted" />
          <span className="font-mono uppercase tracking-wider text-[10px]">Observability Engine</span>
          <span className="text-surface-border">•</span>
          <span>Awaiting initial dialogue exchange</span>
        </div>
        <span className="font-mono text-[10px] text-ink-muted">0 ms</span>
      </div>
    );
  }

  const handleCopyPayload = () => {
    if (!latestTelemetry.rawToolPayload) return;
    navigator.clipboard.writeText(JSON.stringify(latestTelemetry.rawToolPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalTokens = latestTelemetry.promptTokens + latestTelemetry.completionTokens;
  const promptPct = Math.round((latestTelemetry.promptTokens / totalTokens) * 100);

  return (
    <div className="border-t border-surface-border bg-surface-base shrink-0 transition-colors no-print">
      {/* Drawer Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
        className="w-full px-5 py-2 flex items-center justify-between text-xs hover:bg-surface-subtle transition-colors cursor-pointer text-left select-none"
        aria-expanded={isTelemetryOpen}
      >
        <div className="flex items-center gap-2.5">
          <IconActivity className="w-3.5 h-3.5 text-brand-seal" />
          <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
            Inference Telemetry
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            {latestTelemetry.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary">
            <IconCpu className="w-3.5 h-3.5 text-ink-muted" />
            <span>{totalTokens} tok</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-surface-subtle text-ink-primary border border-surface-border">
            <IconClock className="w-3 h-3 text-ink-muted" />
            <span>{latestTelemetry.latencyMs}ms</span>
          </div>

          {isTelemetryOpen ? (
            <IconChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          ) : (
            <IconChevronUp className="w-3.5 h-3.5 text-ink-muted" />
          )}
        </div>
      </button>

      {/* Asymmetric Content-Driven Observability Layout (Anti-patterns 6 & 14) */}
      {isTelemetryOpen && (
        <div className="px-5 pb-4 pt-1 space-y-3 text-xs border-t border-surface-border-subtle">
          {/* Asymmetric Telemetry Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Primary Column: Token Allocation Ratio */}
            <div className="md:col-span-7 p-3 bg-surface-card border border-surface-border rounded-md space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-ink-muted">
                <span>Token Distribution</span>
                <span>Prompt {promptPct}% / Completion {100 - promptPct}%</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded overflow-hidden flex">
                <div className="bg-ink-primary h-full transition-all" style={{ width: `${promptPct}%` }} />
                <div className="bg-brand-seal h-full transition-all" style={{ width: `${100 - promptPct}%` }} />
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-ink-secondary pt-0.5">
                <span>Inbound: {latestTelemetry.promptTokens} tokens</span>
                <span>Generated: {latestTelemetry.completionTokens} tokens</span>
              </div>
            </div>

            {/* Secondary Column: Round-Trip Latency Metric */}
            <div className="md:col-span-5 p-3 bg-surface-card border border-surface-border rounded-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-ink-muted">
                <span>Server Processing</span>
                <span className="text-brand-seal font-medium">Optimal</span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-lg font-mono font-semibold text-ink-primary">
                  {latestTelemetry.latencyMs}
                </span>
                <span className="text-xs text-ink-muted font-mono">ms round-trip</span>
              </div>
              <p className="text-[10px] text-ink-muted pt-1">
                Streamed via Next.js Node.js runtime pipeline
              </p>
            </div>
          </div>

          {/* Structured Inspection Panel (Replaces decorative fake terminal window) */}
          <div className="bg-surface-card rounded-md border border-surface-border overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 bg-surface-subtle border-b border-surface-border text-[11px]">
              <div className="flex items-center gap-2 text-ink-primary font-medium">
                <IconCode className="w-3.5 h-3.5 text-brand-seal" />
                <span>Extracted Zod Tool Arguments</span>
              </div>
              {latestTelemetry.rawToolPayload ? (
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-card hover:bg-surface-border text-ink-secondary text-[11px] transition-colors cursor-pointer border border-surface-border"
                >
                  {copied ? <IconCheck className="w-3 h-3 text-brand-seal" /> : <IconCopy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Payload"}</span>
                </button>
              ) : (
                <span className="text-ink-muted italic text-[11px]">No mutation emitted</span>
              )}
            </div>

            <div className="p-3 max-h-36 overflow-y-auto bg-surface-base font-mono text-xs">
              {latestTelemetry.rawToolPayload ? (
                <pre className="text-ink-primary whitespace-pre-wrap leading-relaxed text-[11px]">
                  {JSON.stringify(latestTelemetry.rawToolPayload, null, 2)}
                </pre>
              ) : (
                <p className="text-ink-muted italic text-[11px]">
                  Conversational query processed without document state mutation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
