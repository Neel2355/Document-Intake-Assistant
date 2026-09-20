"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Code2,
  Copy,
  Check,
} from "lucide-react";

export function TelemetryDrawer() {
  const { latestTelemetry, isTelemetryOpen, setIsTelemetryOpen } = useWishesStore();
  const [copied, setCopied] = useState(false);

  if (!latestTelemetry) {
    return (
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-1.5 text-[11px] text-zinc-400 flex items-center justify-between select-none shrink-0 no-print">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-zinc-400" />
          <span>Observability: Awaiting first exchange</span>
        </div>
        <span className="font-mono text-[10px]">0 ms</span>
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

  return (
    <div className="border-t border-zinc-200 bg-zinc-50 shrink-0 transition-all no-print">
      {/* Drawer Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
        className="w-full px-4 py-1.5 flex items-center justify-between text-[11px] hover:bg-zinc-100/80 transition-colors cursor-pointer text-left"
        aria-expanded={isTelemetryOpen}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-600" />
          <span className="font-medium text-zinc-700">Observability Metrics</span>
          <span className="font-mono text-[10px] text-zinc-400">
            {latestTelemetry.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
            <Cpu className="w-3 h-3 text-zinc-400" />
            <span>
              {latestTelemetry.promptTokens} in / {latestTelemetry.completionTokens} out ({totalTokens} tok)
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700">
            <Clock className="w-2.5 h-2.5 text-zinc-500" />
            <span>{latestTelemetry.latencyMs}ms</span>
          </div>

          {isTelemetryOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Drawer Details */}
      {isTelemetryOpen && (
        <div className="px-4 pb-3 pt-1 space-y-2.5 text-xs border-t border-zinc-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2 bg-white border border-zinc-200 rounded-md">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Prompt Tokens</span>
              <span className="text-xs font-mono font-medium text-zinc-800">
                {latestTelemetry.promptTokens} tokens
              </span>
            </div>

            <div className="p-2 bg-white border border-zinc-200 rounded-md">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Completion Tokens</span>
              <span className="text-xs font-mono font-medium text-zinc-800">
                {latestTelemetry.completionTokens} tokens
              </span>
            </div>

            <div className="p-2 bg-white border border-zinc-200 rounded-md">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Round-Trip Latency</span>
              <span className="text-xs font-mono font-medium text-emerald-700">
                {latestTelemetry.latencyMs} milliseconds
              </span>
            </div>
          </div>

          {/* Raw JSON Tool Payload */}
          <div className="bg-zinc-900 rounded-md border border-zinc-800 text-zinc-100 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/80 border-b border-zinc-700/80 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Code2 className="w-3 h-3 text-emerald-400" />
                <span>Raw JSON Tool Payload (Pre-State Mutation)</span>
              </div>
              {latestTelemetry.rawToolPayload ? (
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[10px] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              ) : (
                <span className="text-zinc-500 italic">No tool payload emitted</span>
              )}
            </div>

            <div className="p-2.5 max-h-32 overflow-y-auto">
              {latestTelemetry.rawToolPayload ? (
                <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(latestTelemetry.rawToolPayload, null, 2)}
                </pre>
              ) : (
                <p className="text-zinc-500 italic text-[11px]">
                  Turn completed with text streaming.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
