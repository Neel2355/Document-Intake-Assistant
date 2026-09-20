"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { downloadMarkdownFile, generateMarkdown } from "@/utils/exportMarkdown";
import {
  FileDown,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldAlert,
  Copy,
  Check,
  KeyRound,
  History,
  FileText,
} from "lucide-react";

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
  } = useWishesStore();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
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

  return (
    <>
      <header className="h-14 bg-white border-b border-zinc-200 px-5 flex items-center justify-between shrink-0 z-10 no-print">
        {/* Left: Clean Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-medium text-sm text-zinc-900 tracking-tight">
                Personal Wishes Studio
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-sans border border-zinc-200">
                Estate Intake
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Testamentary Intent & Directives Builder
            </p>
          </div>
        </div>

        {/* Center: Readiness Scoreboard Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-zinc-800">
            Readiness: {percentage}% ({filled}/{total} Clauses)
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-500 text-[11px]">
            {validation.success ? "Schema Valid" : "Clauses Pending"}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Undo Snapshot Button */}
          {snapshots.length > 0 && (
            <button
              onClick={undoLastSnapshot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
              title={`Undo: ${snapshots[0]?.description}`}
            >
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden lg:inline">Undo</span>
            </button>
          )}

          {/* 1-Click Print & PDF View */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Sample Data Loader */}
          <button
            onClick={loadSampleData}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
            title="Fill with Eleanor Vance-Sterling sample"
          >
            <span>Sample</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={resetToEmpty}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
            title="Reset document"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Provider Config */}
          <button
            onClick={() => {
              setTempApiKey(apiKey);
              setIsApiKeyModalOpen(true);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              apiKey
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 border-zinc-200"
            }`}
            title="LLM Settings"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Inspect Markdown */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs transition-colors cursor-pointer"
            title="Inspect Raw Markdown"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Inspect</span>
          </button>

          {/* Primary Export Markdown Button */}
          <button
            onClick={() => downloadMarkdownFile(wishes)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-colors cursor-pointer"
            title="Download Personal Wishes as formatted Markdown file"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export .md</span>
          </button>
        </div>
      </header>

      {/* LLM Settings Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-zinc-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                Language Model Provider Configuration
              </h3>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="p-5 space-y-4 text-xs">
              <p className="text-zinc-500 leading-relaxed">
                By default, the intake runs on an intelligent internal engine. You can optionally supply an
                OpenAI (<code>sk-...</code>) or Gemini (<code>AIzaSy...</code>) API key for live external inference.
              </p>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey("");
                    setApiKey("");
                    setIsApiKeyModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-800 cursor-pointer"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium shadow-xs cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Markdown Inspection Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                  Formatted Markdown Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-5 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2 text-xs text-zinc-600">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Includes standard statutory disclaimer regarding fictional document status.</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-zinc-900 text-zinc-200 text-xs font-mono leading-relaxed">
              <pre className="whitespace-pre-wrap">{generateMarkdown(wishes)}</pre>
            </div>

            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadMarkdownFile(wishes);
                  setIsPreviewModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                Download .md
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
