"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { TelemetryDrawer } from "./TelemetryDrawer";
import { ManualFormFallback } from "./ManualFormFallback";
import {
  Send,
  SlidersHorizontal,
  Wrench,
  AlertTriangle,
  Loader2,
  FormInput,
  Bot,
  User,
} from "lucide-react";

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
    <div className="flex flex-col h-full bg-white no-print">
      {/* Chat Pane Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Intake Conversation
          </h2>
          <p className="text-[11px] text-zinc-500">Guided Estate Assistant</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setInputMode("form")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors cursor-pointer"
            title="Switch to Standard Multi-Step Form"
          >
            <FormInput className="w-3.5 h-3.5 text-zinc-500" />
            <span>Manual Form</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDirectEditOpen(!isDirectEditOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDirectEditOpen
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
            }`}
            title="Quick Fields Editor"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fields</span>
          </button>
        </div>
      </div>

      {/* Direct Schema Form Drawer */}
      {isDirectEditOpen && (
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-3 shrink-0 max-h-56 overflow-y-auto text-xs">
          <div className="flex items-center justify-between font-medium text-zinc-900 pb-1 border-b border-zinc-200">
            <span>Direct Schema Editor</span>
            <button
              onClick={() => setIsDirectEditOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">Full Name</label>
              <input
                type="text"
                value={wishes.full_name ?? ""}
                onChange={(e) => setFullName(e.target.value || null)}
                placeholder="Null (Waiting for input)"
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">Home Address</label>
              <input
                type="text"
                value={wishes.home_address ?? ""}
                onChange={(e) => setHomeAddress(e.target.value || null)}
                placeholder="Null (Waiting for input)"
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">Worldwide Assets</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(true)}
                  className={`px-2 py-1 rounded text-xs border cursor-pointer ${
                    wishes.covers_worldwide_assets === true
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-zinc-700 border-zinc-200"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(false)}
                  className={`px-2 py-1 rounded text-xs border cursor-pointer ${
                    wishes.covers_worldwide_assets === false
                      ? "bg-zinc-800 text-white border-zinc-800"
                      : "bg-white text-zinc-700 border-zinc-200"
                  }`}
                >
                  No (Domestic)
                </button>
                <button
                  type="button"
                  onClick={() => setWorldwideAssets(null)}
                  className={`px-2 py-1 rounded text-xs border cursor-pointer ${
                    wishes.covers_worldwide_assets === null
                      ? "bg-zinc-300 text-zinc-800 border-zinc-300"
                      : "bg-white text-zinc-400 border-zinc-200"
                  }`}
                >
                  Null
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">Executor</label>
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
                  placeholder="Name"
                  className="w-1/2 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-900"
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
                  className="w-1/2 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-900"
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
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white"
                  : msg.sender === "system"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-3 h-3" />
              ) : msg.sender === "system" ? (
                <span>!</span>
              ) : (
                <Bot className="w-3 h-3" />
              )}
            </div>

            <div
              className={`max-w-[84%] rounded-xl px-3.5 py-2 text-xs sm:text-sm ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white rounded-tr-none"
                  : msg.sender === "system"
                  ? "bg-amber-50/80 text-amber-900 border border-amber-200/80 rounded-tl-none text-xs"
                  : "bg-zinc-100/90 text-zinc-800 rounded-tl-none border border-zinc-200/60"
              }`}
            >
              {msg.toolCallName && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono mb-1">
                  <Wrench className="w-2.5 h-2.5 text-zinc-500" />
                  <span>updated: {msg.toolCallName}</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`block text-[10px] mt-1 ${
                  msg.sender === "user" ? "text-zinc-400 text-right" : "text-zinc-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Live SSE Streaming Bubble */}
        {isStreaming && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 animate-pulse" />
            </div>
            <div className="max-w-[84%] rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200/60 space-y-1.5">
              {activeToolName && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Processing: {activeToolName}</span>
                </div>
              )}

              {streamingText ? (
                <p className="leading-relaxed whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-1.5 h-3 bg-zinc-700 ml-1 animate-pulse align-middle" />
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 italic py-0.5">
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                  <span>Assistant responding...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Self-Correction Log */}
        {correctionLog.length > 0 && (
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Schema Self-Correction:</span>
            </div>
            {correctionLog.map((log, idx) => (
              <p key={idx} className="font-mono text-[10px] text-amber-800 pl-4">
                {log}
              </p>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Quick Input Chips */}
      <div className="px-5 py-2 bg-zinc-50/80 border-t border-zinc-200 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              sendUserMessage("742 Evergreen Terrace, Suite 400, Seattle, WA 98101")
            }
            className="px-2.5 py-1 text-[11px] bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-pointer disabled:opacity-40"
          >
            Seattle, WA Address
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() => sendUserMessage("Yes, this document should cover my worldwide assets.")}
            className="px-2.5 py-1 text-[11px] bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-pointer disabled:opacity-40"
          >
            Cover Worldwide Assets
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() => sendUserMessage("I have two children: Julian Sterling and Clara Sterling.")}
            className="px-2.5 py-1 text-[11px] bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-pointer disabled:opacity-40"
          >
            Julian & Clara Sterling
          </button>

          <button
            type="button"
            disabled={isStreaming}
            onClick={() =>
              sendUserMessage("I appoint Marcus Aurelius Sterling (Brother & Attorney) as Executor.")
            }
            className="px-2.5 py-1 text-[11px] bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-pointer disabled:opacity-40"
          >
            Appoint Marcus Sterling
          </button>
        </div>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-zinc-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isStreaming}
            placeholder={
              isStreaming ? "Assistant is typing..." : "Type response, address, or details..."
            }
            className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isStreaming}
            className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Send"
          >
            {isStreaming ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      {/* Observability Telemetry Drawer */}
      <TelemetryDrawer />
    </div>
  );
}
