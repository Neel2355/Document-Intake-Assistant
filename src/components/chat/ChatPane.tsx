"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { TelemetryDrawer } from "./TelemetryDrawer";
import { ManualFormFallback } from "./ManualFormFallback";
import { LegalSkeletonLoader } from "./LegalSkeletonLoader";
import {
  IconSend,
  IconSliders,
  IconForm,
  IconUser,
  IconDeed,
  IconAlertTriangle,
  IconClose,
} from "../icons/CustomIcons";

export function ChatPane() {
  const {
    wishes,
    messages,
    isStreaming,
    streamingText,
    activeToolName,
    correctionLog,
    inputMode,
    setInputMode,
    sendUserMessage,
    setFullName,
    setHomeAddress,
    setWorldwideAssets,
    setExecutor,
    isDirectEditOpen,
    setIsDirectEditOpen,
  } = useWishesStore();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingText, activeToolName]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;
    const msg = inputVal;
    setInputVal("");
    sendUserMessage(msg);
  };

  if (inputMode === "form") {
    return <ManualFormFallback />;
  }

  return (
    <div className="flex flex-col h-full bg-surface-base no-print">
      {/* Chat Pane Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border shrink-0 select-none bg-surface-card">
        <div>
          <h2 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            Conversational Intake Engine
          </h2>
          <p className="text-[11px] text-ink-muted">Guidance for Testamentary Wishes</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setInputMode("form")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary bg-surface-base hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
            title="Switch to Structured Step Form"
          >
            <IconForm className="w-3.5 h-3.5 text-ink-muted" />
            <span>Structured Form</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDirectEditOpen(!isDirectEditOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isDirectEditOpen
                ? "bg-ink-primary text-white border-ink-primary"
                : "bg-surface-base text-ink-secondary border-surface-border hover:bg-surface-subtle hover:text-ink-primary"
            }`}
            title="Toggle Direct Schema Drawer"
          >
            <IconSliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Direct Schema</span>
          </button>
        </div>
      </div>

      {/* Direct Schema Form Drawer (Escape Hatch) */}
      {isDirectEditOpen && (
        <div className="p-4 bg-surface-subtle border-b border-surface-border space-y-3 shrink-0 max-h-56 overflow-y-auto text-xs">
          <div className="flex items-center justify-between font-semibold text-ink-primary pb-1.5 border-b border-surface-border uppercase tracking-wider text-[11px]">
            <span>Direct Schema Editor</span>
            <button
              onClick={() => setIsDirectEditOpen(false)}
              className="p-1 text-ink-muted hover:text-ink-primary cursor-pointer transition-colors"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={wishes.full_name ?? ""}
                onChange={(e) => setFullName(e.target.value || null)}
                placeholder="Awaiting input"
                className="w-full px-2.5 py-1.5 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                Residential Domicile
              </label>
              <input
                type="text"
                value={wishes.home_address ?? ""}
                onChange={(e) => setHomeAddress(e.target.value || null)}
                placeholder="Awaiting input"
                className="w-full px-2.5 py-1.5 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                Territorial Scope
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(true)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-colors ${
                    wishes.covers_worldwide_assets === true
                      ? "bg-brand-seal text-white border-brand-seal"
                      : "bg-surface-card text-ink-secondary border-surface-border hover:bg-surface-subtle"
                  }`}
                >
                  Worldwide
                </button>
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(false)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-colors ${
                    wishes.covers_worldwide_assets === false
                      ? "bg-ink-primary text-white border-ink-primary"
                      : "bg-surface-card text-ink-secondary border-surface-border hover:bg-surface-subtle"
                  }`}
                >
                  Domestic
                </button>
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(null)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-colors ${
                    wishes.covers_worldwide_assets === null
                      ? "bg-surface-border text-ink-primary border-surface-border"
                      : "bg-surface-card text-ink-muted border-surface-border"
                  }`}
                >
                  Null
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                Personal Representative / Executor
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={wishes.executor?.name ?? ""}
                  onChange={(e) =>
                    setExecutor(
                      e.target.value
                        ? { name: e.target.value, relationship: wishes.executor?.relationship || "Representative" }
                        : null
                    )
                  }
                  placeholder="Legal Name"
                  className="w-1/2 px-2.5 py-1 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                />
                <input
                  type="text"
                  value={wishes.executor?.relationship ?? ""}
                  onChange={(e) =>
                    setExecutor(
                      wishes.executor?.name
                        ? { name: wishes.executor.name, relationship: e.target.value }
                        : null
                    )
                  }
                  placeholder="Relationship"
                  className="w-1/2 px-2.5 py-1 bg-surface-card border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream Container */}
      <div
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                msg.sender === "user"
                  ? "bg-ink-primary text-white border-zinc-800"
                  : msg.sender === "system"
                  ? "bg-surface-subtle text-ink-primary border-surface-border"
                  : "bg-surface-card text-brand-seal border-surface-border"
              }`}
            >
              {msg.sender === "user" ? (
                <IconUser className="w-3.5 h-3.5" />
              ) : msg.sender === "system" ? (
                <IconAlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <IconDeed className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-md px-4 py-2.5 text-xs sm:text-sm border transition-colors ${
                msg.sender === "user"
                  ? "bg-ink-primary text-white border-zinc-800"
                  : msg.sender === "system"
                  ? "bg-surface-card text-ink-secondary border-surface-border"
                  : "bg-surface-card text-ink-primary border-surface-border"
              }`}
            >
              {msg.toolCallName && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-subtle text-ink-secondary text-[10px] font-mono mb-1.5 border border-surface-border">
                  <IconDeed className="w-3 h-3 text-brand-seal" />
                  <span>Schema Mutated: {msg.toolCallName}</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`block text-[10px] font-mono mt-1.5 ${
                  msg.sender === "user" ? "text-zinc-400 text-right" : "text-ink-muted"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Live SSE Streaming Bubble with Legal Skeleton Loader */}
        {isStreaming && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-surface-card text-brand-seal flex items-center justify-center shrink-0 border border-surface-border">
              <IconDeed className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] w-full rounded-md px-4 py-2.5 bg-surface-card border border-surface-border space-y-2">
              {activeToolName && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-seal-tint text-brand-seal text-[10px] font-mono border border-brand-seal-border">
                  <span>Executing Tool: {activeToolName}</span>
                </div>
              )}

              {streamingText ? (
                <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm text-ink-primary">
                  {streamingText}
                  <span className="inline-block w-1.5 h-3.5 bg-brand-seal ml-1 animate-pulse align-middle" />
                </p>
              ) : (
                <LegalSkeletonLoader />
              )}
            </div>
          </div>
        )}

        {/* Self-Correction Audit Log */}
        {correctionLog.length > 0 && (
          <div className="p-3 bg-surface-card border border-surface-border rounded-md text-xs text-ink-secondary space-y-1">
            <div className="flex items-center gap-2 font-medium text-ink-primary">
              <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="uppercase text-[11px] tracking-wider">Automated Zod Schema Self-Correction</span>
            </div>
            {correctionLog.map((log, idx) => (
              <p key={idx} className="font-mono text-[11px] text-ink-muted pl-5">
                {log}
              </p>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Realistic Legal Scenario Chips (Anti-patterns 15 & 18) */}
      <div className="px-5 py-2.5 bg-surface-card border-t border-surface-border shrink-0 select-none">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              sendUserMessage("742 Evergreen Terrace, Suite 400, Seattle, WA 98101")
            }
            className="px-2.5 py-1 text-[11px] bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-md text-ink-secondary hover:text-ink-primary cursor-pointer disabled:opacity-40 transition-colors"
          >
            Seattle Domicile Address
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() => sendUserMessage("Yes, this document should cover my worldwide assets.")}
            className="px-2.5 py-1 text-[11px] bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-md text-ink-secondary hover:text-ink-primary cursor-pointer disabled:opacity-40 transition-colors"
          >
            Worldwide Asset Scope
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() => sendUserMessage("I have two children: Julian Sterling and Clara Sterling.")}
            className="px-2.5 py-1 text-[11px] bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-md text-ink-secondary hover:text-ink-primary cursor-pointer disabled:opacity-40 transition-colors"
          >
            Julian & Clara Sterling
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              sendUserMessage("I appoint Marcus Aurelius Sterling (Brother & Attorney) as Executor.")
            }
            className="px-2.5 py-1 text-[11px] bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-md text-ink-secondary hover:text-ink-primary cursor-pointer disabled:opacity-40 transition-colors"
          >
            Appoint Marcus Sterling
          </button>
        </div>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-4 bg-surface-card border-t border-surface-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isStreaming}
            placeholder={
              isStreaming ? "Intake engine processing response..." : "Provide your full legal name, domicile, or testamentary instructions..."
            }
            className="flex-1 px-3.5 py-2 bg-surface-base border border-surface-border rounded-md text-xs sm:text-sm text-ink-primary placeholder-ink-faint focus:outline-none focus:border-ink-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isStreaming}
            className="px-3.5 py-2 rounded-md bg-ink-primary text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border border-zinc-900 flex items-center justify-center"
            title="Submit Response"
          >
            <IconSend className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Observability Telemetry Drawer */}
      <TelemetryDrawer />
    </div>
  );
}
