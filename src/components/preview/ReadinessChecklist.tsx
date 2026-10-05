"use client";

import React from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { PersonalWishes } from "@/schema/wishes";
import {
  IconCheckShield,
  IconCheckCircle,
  IconCircle,
  IconChevronRight,
} from "../icons/CustomIcons";

interface ChecklistItem {
  key: keyof PersonalWishes;
  article: string;
  label: string;
  purpose: string;
}

const CLAUSE_ITEMS: ChecklistItem[] = [
  { key: "full_name", article: "Art. I", label: "Principal Testator Identity", purpose: "Establish legal identity and testamentary capacity" },
  { key: "home_address", article: "Art. II", label: "Residential Domicile", purpose: "Define governing jurisdiction and venue for probate" },
  { key: "covers_worldwide_assets", article: "Art. III", label: "Territorial Property Scope", purpose: "Delineate domestic vs. cross-border estate reach" },
  { key: "children", article: "Art. IV", label: "Descendants and Lineage", purpose: "Designate lineal beneficiaries and eliminate omission claims" },
  { key: "executor", article: "Art. V", label: "Personal Representative", purpose: "Nominate fiduciary with powers of administration" },
  { key: "specific_gifts", article: "Art. VI", label: "Bequests and Special Devises", purpose: "Itemize specific real and personal property gifts" },
  { key: "additional_wishes", article: "Art. VII", label: "Directives and Sentiments", purpose: "Specify memorial wishes, pet trusts, and digital property" },
];

export function ReadinessChecklist({ onSelectField }: { onSelectField: (field: keyof PersonalWishes) => void }) {
  const { wishes, getReadiness } = useWishesStore();
  const { percentage, filled, total } = getReadiness();

  return (
    <div className="bg-surface-card border border-surface-border rounded-md p-5 space-y-4 select-none">
      {/* Header and Progress Ratio */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-center gap-2.5">
          <IconCheckShield className="w-4 h-4 text-brand-seal" />
          <div>
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Statutory Clause Audit Schedule
            </h3>
            <p className="text-[11px] text-ink-muted">7-point verification audit for probate completeness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-ink-primary">
            {filled} of {total} Complete
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-brand-seal-tint text-brand-seal border border-brand-seal-border font-mono font-medium">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar (Restrained Deep Seal Forest) */}
      <div className="w-full bg-surface-subtle h-1.5 rounded overflow-hidden">
        <div
          className="bg-brand-seal h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tabular Clause Audit Schedule (Anti-pattern 16) */}
      <div className="divide-y divide-surface-border border border-surface-border rounded-md overflow-hidden text-xs">
        {CLAUSE_ITEMS.map((item) => {
          const isComplete = wishes[item.key] !== null;

          return (
            <div
              key={item.key}
              className={`flex items-center justify-between p-3 transition-colors ${
                isComplete ? "bg-surface-base hover:bg-surface-subtle" : "bg-surface-card hover:bg-surface-base"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-ink-muted w-10 shrink-0">
                  {item.article}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {isComplete ? (
                    <IconCheckCircle className="w-3.5 h-3.5 text-brand-seal shrink-0" />
                  ) : (
                    <IconCircle className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isComplete ? "text-ink-primary" : "text-ink-secondary"}`}>
                      {item.label}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                        isComplete
                          ? "bg-brand-seal-tint text-brand-seal border-brand-seal-border"
                          : "bg-surface-subtle text-ink-muted border-surface-border"
                      }`}
                    >
                      {isComplete ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted">{item.purpose}</p>
                </div>
              </div>

              {!isComplete && (
                <button
                  type="button"
                  onClick={() => onSelectField(item.key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-base hover:bg-surface-subtle text-ink-primary text-[11px] font-medium transition-colors cursor-pointer border border-surface-border shrink-0 ml-3"
                >
                  <span>Draft</span>
                  <IconChevronRight className="w-3 h-3 text-ink-muted" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
