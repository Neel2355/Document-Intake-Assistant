"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ChatPane } from "@/components/chat/ChatPane";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { LegalFooter } from "@/components/LegalFooter";
import { IconMessage, IconDeed } from "@/components/icons/CustomIcons";

export default function HomePage() {
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-canvas">
      {/* Top Application Bar */}
      <Header />

      {/* Mobile Tab Selector (shown only on small screens) */}
      <div className="md:hidden flex items-center border-b border-surface-border bg-surface-base px-4 py-2 shrink-0 select-none">
        <div className="flex w-full p-1 bg-surface-subtle rounded-md border border-surface-border">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mobileTab === "chat"
                ? "bg-surface-card text-ink-primary border border-surface-border"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <IconMessage className="w-3.5 h-3.5 text-brand-seal" />
            <span>Chat Intake</span>
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mobileTab === "preview"
                ? "bg-surface-card text-ink-primary border border-surface-border"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <IconDeed className="w-3.5 h-3.5 text-brand-seal" />
            <span>Document Preview</span>
          </button>
        </div>
      </div>

      {/* Two-Pane Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Chat Interface */}
        <section
          aria-label="Chat Interface"
          className={`w-full md:w-1/2 h-full flex flex-col ${
            mobileTab === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatPane />
        </section>

        {/* Right Pane: Live Document Preview */}
        <section
          aria-label="Live Preview"
          className={`w-full md:w-1/2 h-full flex flex-col ${
            mobileTab === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <LivePreviewPane />
        </section>
      </main>

      {/* Institutional Legal Footer with Terms of Service and Privacy Policy */}
      <LegalFooter />
    </div>
  );
}
