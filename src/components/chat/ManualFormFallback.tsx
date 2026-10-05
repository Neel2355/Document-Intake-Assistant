"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  IconMessage,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconReset,
  IconUser,
  IconDomicile,
  IconGlobe,
  IconDescendants,
  IconFiduciary,
  IconBequest,
  IconDirectives,
  IconDocumentSeal,
} from "../icons/CustomIcons";

export function ManualFormFallback() {
  const {
    wishes,
    setInputMode,
    setFullName,
    setHomeAddress,
    setWorldwideAssets,
    addChild,
    removeChild,
    setExecutor,
    addSpecificGift,
    removeSpecificGift,
    setAdditionalWishes,
    loadSampleData,
    resetToEmpty,
  } = useWishesStore();

  const [activeStep, setActiveStep] = useState(0);
  const [childInput, setChildInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [execName, setExecName] = useState(wishes.executor?.name || "");
  const [execRel, setExecRel] = useState(wishes.executor?.relationship || "");

  const steps = [
    { title: "Identity", icon: IconUser },
    { title: "Domicile", icon: IconDomicile },
    { title: "Asset Scope", icon: IconGlobe },
    { title: "Lineage", icon: IconDescendants },
    { title: "Executor", icon: IconFiduciary },
    { title: "Bequests", icon: IconBequest },
    { title: "Directives", icon: IconDirectives },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-base select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-surface-border shrink-0 bg-surface-card">
        <div>
          <h2 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            Structured Multi-Step Intake
          </h2>
          <p className="text-[11px] text-ink-muted">Manual Schema Fallback</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary bg-surface-base hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
          >
            <IconDocumentSeal className="w-3.5 h-3.5 text-brand-seal" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>
          <button
            onClick={resetToEmpty}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
            title="Reset form"
          >
            <IconReset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setInputMode("chat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-ink-primary hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-900"
          >
            <IconMessage className="w-3.5 h-3.5" />
            <span>Switch to Conversational</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="px-6 py-3 border-b border-surface-border bg-surface-card shrink-0">
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;

            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                  isCurrent
                    ? "bg-ink-primary text-white border-ink-primary"
                    : isCompleted
                    ? "bg-brand-seal-tint text-brand-seal border-brand-seal-border"
                    : "bg-surface-base text-ink-muted border-surface-border hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full text-xs">
        {/* STEP 0: IDENTITY */}
        {activeStep === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article I: Principal Testator Identity
              </h3>
              <p className="text-ink-muted">Enter your full legal name as recorded on official identification.</p>
            </div>

            <div>
              <label className="block font-medium text-ink-primary mb-1">Full Legal Name</label>
              <input
                type="text"
                value={wishes.full_name ?? ""}
                onChange={(e) => setFullName(e.target.value || null)}
                placeholder="e.g. Eleanor Vance-Sterling"
                className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 1: RESIDENTIAL DOMICILE */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article II: Residential Domicile
              </h3>
              <p className="text-ink-muted">
                Your primary residential location establishes governing probate jurisdiction and venue.
              </p>
            </div>

            <div>
              <label className="block font-medium text-ink-primary mb-1">Domicile Address</label>
              <input
                type="text"
                value={wishes.home_address ?? ""}
                onChange={(e) => setHomeAddress(e.target.value || null)}
                placeholder="e.g. 742 Evergreen Terrace, Suite 400, Seattle, WA 98101"
                className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 2: ASSET SCOPE */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article III: Territorial Scope of Property
              </h3>
              <p className="text-ink-muted">Specify whether this instrument governs international property or domestic assets.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-md border border-surface-border bg-surface-card cursor-pointer">
                <input
                  type="radio"
                  name="worldwide"
                  checked={wishes.covers_worldwide_assets === true}
                  onChange={() => setWorldwideAssets(true)}
                  className="text-brand-seal"
                />
                <div>
                  <span className="font-semibold text-ink-primary block">Include Worldwide Assets</span>
                  <span className="text-[11px] text-ink-muted">Governs real and personal property across foreign jurisdictions</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-md border border-surface-border bg-surface-card cursor-pointer">
                <input
                  type="radio"
                  name="worldwide"
                  checked={wishes.covers_worldwide_assets === false}
                  onChange={() => setWorldwideAssets(false)}
                  className="text-brand-seal"
                />
                <div>
                  <span className="font-semibold text-ink-primary block">Domestic Assets Only</span>
                  <span className="text-[11px] text-ink-muted">Restricted exclusively to home domicile jurisdiction</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-md border border-surface-border bg-surface-card cursor-pointer">
                <input
                  type="radio"
                  name="worldwide"
                  checked={wishes.covers_worldwide_assets === null}
                  onChange={() => setWorldwideAssets(null)}
                />
                <span className="text-ink-secondary">Unspecified (Null)</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: DESCENDANTS / LINEAGE */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article IV: Descendants and Lineage
              </h3>
              <p className="text-ink-muted">Itemize all living children to prevent pretermitted heir disputes.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={childInput}
                onChange={(e) => setChildInput(e.target.value)}
                placeholder="Child legal name"
                className="flex-1 px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (childInput.trim()) {
                    addChild({ name: childInput.trim() });
                    setChildInput("");
                  }
                }}
                className="px-3.5 py-2 bg-ink-primary text-white rounded-md font-medium cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 border border-surface-border rounded-md p-2 bg-surface-card">
              {!wishes.children || wishes.children.length === 0 ? (
                <p className="text-ink-muted italic p-2">No children declared.</p>
              ) : (
                wishes.children.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-surface-base border border-surface-border rounded">
                    <span className="font-medium text-ink-primary">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeChild(i)}
                      className="p-1 text-ink-muted hover:text-red-700 cursor-pointer"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 4: EXECUTOR */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article V: Personal Representative (Executor)
              </h3>
              <p className="text-ink-muted">Nominate your primary fiduciary to administer estate directives.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-ink-primary mb-1">Representative Legal Name</label>
                <input
                  type="text"
                  value={execName}
                  onChange={(e) => {
                    setExecName(e.target.value);
                    setExecutor(e.target.value ? { name: e.target.value, relationship: execRel || "Fiduciary" } : null);
                  }}
                  placeholder="Legal full name"
                  className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1">Relationship</label>
                <input
                  type="text"
                  value={execRel}
                  onChange={(e) => {
                    setExecRel(e.target.value);
                    if (execName) {
                      setExecutor({ name: execName, relationship: e.target.value || "Representative" });
                    }
                  }}
                  placeholder="e.g. Brother, Attorney, Corporate Trustee"
                  className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: BEQUESTS */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article VI: Specific Gifts and Bequests
              </h3>
              <p className="text-ink-muted">Itemize specific real or personal property to be gifted.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={giftInput}
                onChange={(e) => setGiftInput(e.target.value)}
                placeholder="e.g. Art collection to daughter"
                className="flex-1 px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (giftInput.trim()) {
                    addSpecificGift(giftInput.trim());
                    setGiftInput("");
                  }
                }}
                className="px-3.5 py-2 bg-ink-primary text-white rounded-md font-medium cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 border border-surface-border rounded-md p-2 bg-surface-card">
              {!wishes.specific_gifts || wishes.specific_gifts.length === 0 ? (
                <p className="text-ink-muted italic p-2">No specific gifts scheduled.</p>
              ) : (
                wishes.specific_gifts.map((g, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-surface-base border border-surface-border rounded">
                    <span className="text-ink-primary">{g}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecificGift(i)}
                      className="p-1 text-ink-muted hover:text-red-700 cursor-pointer"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 6: DIRECTIVES */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider mb-1">
                Article VII: Directives and Memorial Wishes
              </h3>
              <p className="text-ink-muted">Detail memorial directives, pet trusts, digital accounts, or special requests.</p>
            </div>

            <div>
              <textarea
                rows={5}
                value={wishes.additional_wishes ?? ""}
                onChange={(e) => setAdditionalWishes(e.target.value || null)}
                placeholder="State your memorial requests, anatomical donations, or digital asset directives..."
                className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary text-xs leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation Footer */}
      <div className="px-6 py-3 border-t border-surface-border bg-surface-card flex items-center justify-between shrink-0">
        <button
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep(activeStep - 1)}
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary bg-surface-base hover:bg-surface-subtle border border-surface-border disabled:opacity-40 cursor-pointer transition-colors"
        >
          Previous
        </button>

        <span className="text-[11px] font-mono text-ink-muted">
          Step {activeStep + 1} of {steps.length}
        </span>

        {activeStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveStep(activeStep + 1)}
            className="flex items-center gap-1 px-4 py-1.5 rounded-md text-xs font-medium text-white bg-ink-primary hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <span>Next</span>
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setInputMode("chat")}
            className="px-4 py-1.5 rounded-md text-xs font-medium text-white bg-brand-seal hover:bg-emerald-950 cursor-pointer transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
