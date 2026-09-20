"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ChatPane } from "@/components/chat/ChatPane";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { MessageSquare, FileText } from "lucide-react";

export default function HomePage() {
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100">
      {/* Top Application Bar */}
      <Header />

      {/* Mobile Tab Selector (shown only on small screens) */}
      <div className="md:hidden flex items-center border-b border-zinc-200 bg-white px-4 py-2 shrink-0">
        <div className="flex w-full p-1 bg-zinc-100 rounded-lg">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mobileTab === "chat"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Chat Intake
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mobileTab === "preview"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Live Preview
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
    </div>
  );
}
