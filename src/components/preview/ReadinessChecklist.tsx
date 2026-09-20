"use client";

import React from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { PersonalWishes } from "@/schema/wishes";
import { CheckCircle2, Circle, ArrowRight, ShieldCheck } from "lucide-react";

interface ChecklistItem {
  key: keyof PersonalWishes;
  label: string;
  description: string;
}

const CLAUSE_ITEMS: ChecklistItem[] = [
  { key: "full_name", label: "Principal Testator Name", description: "Legal name of the person declaring wishes" },
  { key: "home_address", label: "Residential Domicile", description: "Primary legal residence & jurisdiction" },
  { key: "covers_worldwide_assets", label: "Territorial Scope", description: "Declaration of worldwide vs. domestic property" },
  { key: "children", label: "Descendants & Lineage", description: "List of designated children or none declared" },
  { key: "executor", label: "Personal Representative", description: "Named executor and their fiduciary relationship" },
  { key: "specific_gifts", label: "Bequests & Sentimental Gifts", description: "Designated gifts, heirlooms, and allocations" },
  { key: "additional_wishes", label: "Directives & Sentiments", description: "Memorial wishes, pet care, digital assets" },
];

export function ReadinessChecklist({ onSelectField }: { onSelectField: (field: keyof PersonalWishes) => void }) {
  const { wishes, getReadiness } = useWishesStore();
  const { percentage, filled, total } = getReadiness();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-semibold text-zinc-900">Document Readiness Scoreboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-zinc-800">
            {filled} of {total} Clauses Complete
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-medium">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Clause Items */}
      <div className="space-y-2">
        {CLAUSE_ITEMS.map((item) => {
          const isComplete = wishes[item.key] !== null;

          return (
            <div
              key={item.key}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                isComplete
                  ? "bg-zinc-50/70 border-zinc-200/80 text-zinc-800"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-300 shrink-0" />
                )}
                <div>
                  <span className={`font-medium ${isComplete ? "text-zinc-900" : "text-zinc-600"}`}>
                    {item.label}
                  </span>
                  <p className="text-[11px] text-zinc-400">{item.description}</p>
                </div>
              </div>

              {!isComplete && (
                <button
                  type="button"
                  onClick={() => onSelectField(item.key)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <span>Complete</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
