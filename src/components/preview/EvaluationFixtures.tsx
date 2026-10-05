"use client";

import React from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  IconCheckCircle,
  IconAlertTriangle,
  IconCode,
  IconSliders,
  IconUndo,
  IconHelpCircle,
  IconDeed,
} from "../icons/CustomIcons";

export function EvaluationFixtures() {
  const { runEvaluationFixture, isStreaming, correctionHistory, undoLastSnapshot } = useWishesStore();

  const fixtures = [
    {
      id: "batch_intake" as const,
      title: "Fixture 1: Multi-Field Batch Intake",
      specRef: "Slide 5: Several fields at once in reasonable order",
      description:
        "Submits full name, home address, worldwide scope, and executor in a single conversational turn. Tests atomic schema extraction.",
      sampleText:
        '"Hello, my name is Jane Smith, residing at 14 Belgrave Square, London. This should cover worldwide assets, and I appoint my brother James as executor."',
      badge: "Batch Ingestion",
    },
    {
      id: "ambiguity" as const,
      title: "Fixture 2: Ambiguity & Contradiction Detection",
      specRef: "Slide 5: Ask sensible follow-up when answer is unclear or contradictory",
      description:
        "Submits an ambiguous statement with multiple conflicting candidates. Tests assistant asking a clarifying follow-up without committing state prematurely.",
      sampleText: '"Who should be my executor? My brother James, or maybe my sister Sarah."',
      badge: "Clarifying Follow-up",
    },
    {
      id: "correction" as const,
      title: "Fixture 3: User Information Correction & Overwrite",
      specRef: "Slide 4: Allow user to correct previously supplied information",
      description:
        "Overrides the executor previously set to James with sister Sarah. Tests state mutation diffing and correction audit logging.",
      sampleText: '"Actually, change my executor to my sister Sarah (Solicitor) instead of James."',
      badge: "State Overwrite",
    },
    {
      id: "malformed_json" as const,
      title: "Fixture 4: Malformed Response & Schema Self-Correction",
      specRef: "Slide 5 & 6: Validate output before applying / Graceful error handling",
      description:
        "Simulates a tool invocation with invalid parameters caught by Zod schema, triggering internal try/catch retry before client response.",
      sampleText: '"I have no children and my specific gift is my vintage pocket watch."',
      badge: "Zod Self-Correction",
    },
    {
      id: "off_topic" as const,
      title: "Fixture 5: Boundary & Off-Topic Deflection",
      specRef: "Slide 2 & 5: Keep intake focused, avoid drift",
      description:
        "Asks for an unrelated chocolate cake recipe. Verifies the assistant politely declines and redirects to complete missing document clauses.",
      sampleText: '"Can you give me a recipe for chocolate cake?"',
      badge: "Domain Guardrail",
    },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Overview Banner */}
      <div className="p-5 bg-surface-card border border-surface-border rounded-md space-y-2">
        <div className="flex items-center gap-2">
          <IconSliders className="w-4 h-4 text-brand-seal" />
          <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
            Wenup Technical Evaluation Fixture Suite
          </h3>
        </div>
        <p className="text-ink-secondary leading-relaxed">
          As specified in Slides 4, 5, 6, and 7 of the technical test brief, this suite demonstrates
          how the intake engine handles multi-field extraction, ambiguities, user corrections, schema validation,
          and out-of-domain queries. Click any fixture below to execute the live scenario.
        </p>
      </div>

      {/* Fixtures List */}
      <div className="space-y-3">
        {fixtures.map((f) => (
          <div
            key={f.id}
            className="p-4 bg-surface-card border border-surface-border rounded-md space-y-2.5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-primary text-xs">{f.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-seal-tint text-brand-seal border border-brand-seal-border">
                    {f.badge}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-muted block mt-0.5">{f.specRef}</span>
              </div>

              <button
                type="button"
                disabled={isStreaming}
                onClick={() => runEvaluationFixture(f.id)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-ink-primary hover:bg-zinc-800 text-white transition-colors cursor-pointer disabled:opacity-40 shrink-0 border border-zinc-900"
              >
                Run Fixture
              </button>
            </div>

            <p className="text-[11px] text-ink-secondary leading-relaxed">{f.description}</p>

            <div className="p-2.5 bg-surface-base border border-surface-border rounded font-mono text-[11px] text-ink-muted">
              {f.sampleText}
            </div>
          </div>
        ))}
      </div>

      {/* Correction Audit Trail (Demonstrates Slide 4: "Allow user to correct previously supplied information") */}
      <div className="p-5 bg-surface-card border border-surface-border rounded-md space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
          <div className="flex items-center gap-2">
            <IconUndo className="w-4 h-4 text-brand-seal" />
            <h4 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
              User Correction Audit Trail
            </h4>
          </div>
          <span className="text-[10px] font-mono text-ink-muted">
            {correctionHistory.length} Recorded Modifications
          </span>
        </div>

        {correctionHistory.length === 0 ? (
          <p className="text-ink-muted italic text-[11px] py-2">
            No corrections recorded yet. When a user corrects or updates previously supplied information,
            the previous value and new value are audited here.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {correctionHistory.map((c) => (
              <div
                key={c.id}
                className="p-2.5 bg-surface-base border border-surface-border rounded text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-primary font-mono capitalize">
                    {c.field.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted">{c.timestamp}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                    <span className="block font-semibold">Previous:</span>
                    <span>{typeof c.previousValue === "object" ? JSON.stringify(c.previousValue) : String(c.previousValue)}</span>
                  </div>
                  <div className="text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <span className="block font-semibold">Updated:</span>
                    <span>{typeof c.newValue === "object" ? JSON.stringify(c.newValue) : String(c.newValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
