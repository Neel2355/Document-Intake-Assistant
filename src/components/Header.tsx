"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { downloadMarkdownFile, generateMarkdown } from "@/utils/exportMarkdown";
import {
  IconDeed,
  IconPrinter,
  IconUndo,
  IconReset,
  IconKey,
  IconEye,
  IconDownload,
  IconCopy,
  IconCheck,
  IconClose,
  IconDocumentSeal,
  IconChevronDown,
  IconSliders,
} from "./icons/CustomIcons";

export function Header() {
  const {
    wishes,
    apiKey,
    setApiKey,
    loadSampleData,
    resetToEmpty,
    validateDocument,
    getReadiness,
    snapshots,
    undoLastSnapshot,
    applyStatePatch,
    setActiveTab,
  } = useWishesStore();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [copied, setCopied] = useState(false);

  const validation = validateDocument();
  const { percentage, filled, total } = getReadiness();

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(wishes);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempApiKey);
    setIsApiKeyModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const loadScenario = (type: "jane_smith" | "single_parent" | "cross_border") => {
    setIsScenarioMenuOpen(false);
    if (type === "jane_smith") {
      loadSampleData();
    } else if (type === "single_parent") {
      applyStatePatch({
        full_name: "Margaret Lin Chen",
        home_address: "1842 Hawthorne Boulevard, Portland, OR 97214",
        covers_worldwide_assets: false,
        has_children: true,
        children: [{ name: "Benjamin Chen" }, { name: "Chloe Chen" }],
        executor: { name: "David Wei Chen", relationship: "Brother" },
        specific_gifts: [
          "Family heirloom jade pendant to daughter Chloe Chen",
          "Grand piano to son Benjamin Chen",
        ],
        additional_wishes:
          "Nominate sister Susan Lin as legal guardian for minor children. Request sustainable green burial at River View Cemetery.",
      });
    } else if (type === "cross_border") {
      applyStatePatch({
        full_name: "Alexander von Bergmann",
        home_address: "740 Park Avenue, Apt 11B, New York, NY 10021",
        covers_worldwide_assets: true,
        has_children: false,
        children: [],
        executor: { name: "Hélène Renaud", relationship: "Legal Fiduciary & Solicitor" },
        specific_gifts: [
          "Art collection and private gallery archives to Klara von Bergmann",
          "Historical library to Munich Institute of Philosophy",
        ],
        additional_wishes:
          "Cross-border real property in Zurich to be administered pursuant to Swiss civil code and Hague testamentary convention rules.",
      });
    }
  };

  return (
    <>
      <header className="h-14 bg-surface-base border-b border-surface-border px-5 flex items-center justify-between shrink-0 z-10 no-print select-none">
        {/* Left: Official App Title & Wenup Engineering Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-ink-primary text-white flex items-center justify-center border border-zinc-800">
            <IconDeed className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xs uppercase tracking-wider text-ink-primary">
                Document Intake Assistant
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary border border-surface-border">
                Wenup Technical Test
              </span>
            </div>
            <p className="text-[11px] text-ink-muted hidden sm:block font-serif">
              Conversational interview & structured state generation (September 2026)
            </p>
          </div>
        </div>

        {/* Center: Readiness Scoreboard Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-surface-card border border-surface-border text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-seal" />
          <span className="font-medium text-ink-primary">
            Readiness: {percentage}% ({filled}/{total} Clauses)
          </span>
          <span className="text-surface-border">•</span>
          <span className="text-ink-muted text-[11px] font-mono">
            {validation.success ? "Schema Validated" : "Intake in Progress"}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Evaluation Fixtures Button (Unique Feature) */}
          <button
            onClick={() => setActiveTab("fixtures")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-brand-seal bg-brand-seal-tint hover:bg-emerald-100 border border-brand-seal-border transition-colors cursor-pointer"
            title="Open Wenup Technical Evaluation Fixtures"
          >
            <IconSliders className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Test Fixtures</span>
          </button>

          {/* Undo Snapshot Button */}
          {snapshots.length > 0 && (
            <button
              onClick={undoLastSnapshot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
              title={`Undo revision: ${snapshots[0]?.description}`}
            >
              <IconUndo className="w-3.5 h-3.5 text-ink-muted" />
              <span className="hidden lg:inline">Undo</span>
            </button>
          )}

          {/* 1-Click Print & PDF View */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
            title="Print or Save as Official PDF"
          >
            <IconPrinter className="w-3.5 h-3.5 text-ink-muted" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Realistic Scenario Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
              title="Load realistic sample scenario"
            >
              <IconDocumentSeal className="w-3.5 h-3.5 text-brand-seal" />
              <span className="hidden sm:inline">Scenarios</span>
              <IconChevronDown className="w-3 h-3 text-ink-muted" />
            </button>

            {isScenarioMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-surface-border rounded-md shadow-lg py-1 z-20 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-mono text-ink-muted uppercase tracking-wider border-b border-surface-border">
                  Scenario Presets
                </div>
                <button
                  onClick={() => loadScenario("jane_smith")}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle text-ink-primary cursor-pointer"
                >
                  <p className="font-medium">Jane Smith (Wenup Slide 4 Spec)</p>
                  <p className="text-[11px] text-ink-muted">Worldwide assets, brother James executor</p>
                </button>
                <button
                  onClick={() => loadScenario("single_parent")}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle text-ink-primary cursor-pointer border-t border-surface-border"
                >
                  <p className="font-medium">Single Parent Estate</p>
                  <p className="text-[11px] text-ink-muted">Guardian clause, domestic assets, 2 minors</p>
                </button>
                <button
                  onClick={() => loadScenario("cross_border")}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle text-ink-primary cursor-pointer border-t border-surface-border"
                >
                  <p className="font-medium">Cross-Border High Net Worth</p>
                  <p className="text-[11px] text-ink-muted">No children, worldwide scope, art bequests</p>
                </button>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToEmpty}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
            title="Reset document to empty state"
          >
            <IconReset className="w-3.5 h-3.5" />
          </button>

          {/* Provider Config */}
          <button
            onClick={() => {
              setTempApiKey(apiKey);
              setIsApiKeyModalOpen(true);
            }}
            className={`p-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              apiKey
                ? "bg-brand-seal-tint text-brand-seal border-brand-seal-border"
                : "text-ink-muted hover:text-ink-primary hover:bg-surface-subtle border-surface-border"
            }`}
            title="Model Inference Configuration (Optional - Simulator is active by default)"
          >
            <IconKey className="w-3.5 h-3.5" />
          </button>

          {/* Inspect Markdown */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
            title="Inspect Raw Markdown"
          >
            <IconEye className="w-3.5 h-3.5 text-ink-muted" />
            <span className="hidden md:inline">Inspect</span>
          </button>

          {/* Primary Export Markdown Button */}
          <button
            onClick={() => downloadMarkdownFile(wishes)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-ink-primary hover:bg-zinc-800 text-white transition-colors cursor-pointer border border-zinc-900"
            title="Download Personal Wishes document as Markdown"
          >
            <IconDownload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export .md</span>
          </button>
        </div>
      </header>

      {/* Model Inference Settings Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-md max-w-md w-full border border-surface-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between bg-surface-base">
              <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                Language Model Provider Configuration
              </h3>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-surface-subtle rounded border border-surface-border text-ink-secondary leading-relaxed">
                <strong>Slide 7 Notice:</strong> Access to a paid LLM API is not required. By default, the application
                runs on a deterministic context-aware simulation engine. You may optionally supply an OpenAI (gpt-4o-mini)
                or Gemini API key below.
              </div>

              <div>
                <label className="block font-medium text-ink-primary mb-1">Inference API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-... or AIzaSy..."
                  className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md font-mono text-ink-primary focus:outline-none focus:border-ink-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey("");
                    setApiKey("");
                    setIsApiKeyModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-primary cursor-pointer transition-colors"
                >
                  Use Built-in Simulator
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-ink-primary hover:bg-zinc-800 text-white rounded-md font-medium transition-colors cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Markdown Inspection Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-md max-w-3xl w-full max-h-[85vh] flex flex-col border border-surface-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between bg-surface-base">
              <div className="flex items-center gap-2">
                <IconDeed className="w-4 h-4 text-brand-seal" />
                <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Draft Personal Wishes Document (Markdown)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-border text-ink-primary text-xs transition-colors cursor-pointer border border-surface-border"
                >
                  {copied ? <IconCheck className="w-3.5 h-3.5 text-brand-seal" /> : <IconCopy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-surface-base font-mono text-xs text-ink-primary whitespace-pre-wrap leading-relaxed">
              {generateMarkdown(wishes)}
            </div>

            <div className="px-5 py-3 border-t border-surface-border bg-surface-base flex items-center justify-between">
              <span className="text-[11px] text-ink-muted font-sans">
                Clearly labeled as fictional and not legal advice pursuant to brief requirements.
              </span>
              <button
                onClick={() => downloadMarkdownFile(wishes)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-ink-primary hover:bg-zinc-800 text-white transition-colors cursor-pointer"
              >
                <IconDownload className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
