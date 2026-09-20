"use client";

import React, { useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  User,
  Home,
  Globe,
  Users,
  UserCheck,
  Gift,
  ScrollText,
} from "lucide-react";

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
    { title: "Identity", icon: User },
    { title: "Asset Scope", icon: Globe },
    { title: "Children", icon: Users },
    { title: "Executor", icon: UserCheck },
    { title: "Gifts", icon: Gift },
    { title: "Wishes", icon: ScrollText },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Standard Manual Form</h2>
          <p className="text-[11px] text-zinc-500">Structured Multi-Step Intake Fallback</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Sample</span>
          </button>
          <button
            onClick={resetToEmpty}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setInputMode("chat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch to Chat</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="px-6 py-3 border-b border-zinc-200 bg-zinc-50/70 shrink-0">
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;

            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                    : isCompleted
                    ? "text-emerald-700 hover:bg-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-emerald-600" : ""}`} />
                <span className="hidden md:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step 0: Testator Identity */}
        {activeStep === 0 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 1: Testator Identity</h3>
              <p className="text-xs text-zinc-500">Provide legal identification details.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={wishes.full_name ?? ""}
                  onChange={(e) => setFullName(e.target.value || null)}
                  placeholder="e.g., Eleanor Vance-Sterling"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={wishes.home_address ?? ""}
                  onChange={(e) => setHomeAddress(e.target.value || null)}
                  placeholder="e.g., 742 Evergreen Terrace, Seattle, WA 98101"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Asset Scope */}
        {activeStep === 1 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 2: Territorial Scope</h3>
              <p className="text-xs text-zinc-500">
                Determine whether this document governs worldwide or domestic property.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label
                onClick={() => setWorldwideAssets(true)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  wishes.covers_worldwide_assets === true
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <input
                  type="radio"
                  checked={wishes.covers_worldwide_assets === true}
                  onChange={() => setWorldwideAssets(true)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold block text-sm">Cover Worldwide Assets</span>
                  <span className="text-zinc-500 text-xs mt-0.5 block">
                    Governs all real property, bank accounts, and digital assets worldwide.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setWorldwideAssets(false)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  wishes.covers_worldwide_assets === false
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <input
                  type="radio"
                  checked={wishes.covers_worldwide_assets === false}
                  onChange={() => setWorldwideAssets(false)}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold block text-sm">Domestic Jurisdiction Only</span>
                  <span className="text-zinc-500 text-xs mt-0.5 block">
                    Strictly limits the testamentary disposition to local jurisdiction assets.
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={() => setWorldwideAssets(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
              >
                Clear selection (Reset to null)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Children */}
        {activeStep === 2 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 3: Children & Descendants</h3>
              <p className="text-xs text-zinc-500">Add children names or declare none.</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={childInput}
                  onChange={(e) => setChildInput(e.target.value)}
                  placeholder="Child's full legal name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && childInput.trim()) {
                      e.preventDefault();
                      addChild(childInput);
                      setChildInput("");
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (childInput.trim()) {
                      addChild(childInput);
                      setChildInput("");
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Children List */}
              <div className="space-y-2 pt-1">
                {wishes.children && wishes.children.length > 0 ? (
                  wishes.children.map((child, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                    >
                      <span className="font-medium text-zinc-800">{child.name}</span>
                      <button
                        type="button"
                        onClick={() => removeChild(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                    {wishes.children === null
                      ? "Waiting for input... (Null by default)"
                      : "No children declared for this document."}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Executor */}
        {activeStep === 3 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 4: Personal Representative</h3>
              <p className="text-xs text-zinc-500">Designate the primary executor of your estate.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Executor Name</label>
                <input
                  type="text"
                  value={execName}
                  onChange={(e) => {
                    setExecName(e.target.value);
                    if (e.target.value.trim()) {
                      setExecutor({
                        name: e.target.value.trim(),
                        relationship: execRel.trim() || "Personal Representative",
                      });
                    } else {
                      setExecutor(null);
                    }
                  }}
                  placeholder="e.g. Marcus Aurelius Sterling"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Relationship / Title</label>
                <input
                  type="text"
                  value={execRel}
                  onChange={(e) => {
                    setExecRel(e.target.value);
                    if (execName.trim()) {
                      setExecutor({
                        name: execName.trim(),
                        relationship: e.target.value.trim() || "Personal Representative",
                      });
                    }
                  }}
                  placeholder="e.g. Brother & Family Attorney"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Specific Gifts */}
        {activeStep === 4 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 5: Specific Gifts</h3>
              <p className="text-xs text-zinc-500">Record specific bequests and sentimental items.</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={giftInput}
                  onChange={(e) => setGiftInput(e.target.value)}
                  placeholder="e.g. Vintage Omega watch to Julian Sterling"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && giftInput.trim()) {
                      e.preventDefault();
                      addSpecificGift(giftInput);
                      setGiftInput("");
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (giftInput.trim()) {
                      addSpecificGift(giftInput);
                      setGiftInput("");
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Gifts List */}
              <div className="space-y-2 pt-1">
                {wishes.specific_gifts && wishes.specific_gifts.length > 0 ? (
                  wishes.specific_gifts.map((gift, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                    >
                      <span className="text-zinc-800 leading-snug">{gift}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecificGift(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer shrink-0 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                    {wishes.specific_gifts === null
                      ? "Waiting for input... (Null by default)"
                      : "No specific gifts declared."}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Additional Wishes */}
        {activeStep === 5 && (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Step 6: Additional Wishes</h3>
              <p className="text-xs text-zinc-500">Memorial preferences, pet directives, digital assets.</p>
            </div>

            <div className="space-y-3 text-xs">
              <textarea
                rows={5}
                value={wishes.additional_wishes ?? ""}
                onChange={(e) => setAdditionalWishes(e.target.value || null)}
                placeholder="Detail any memorial desires, funeral arrangements, pet guardianship, or digital accounts disposition..."
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
        <button
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs text-zinc-500 font-mono">
          Step {activeStep + 1} of {steps.length}
        </span>

        {activeStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-xs cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setInputMode("chat")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish & View Chat
          </button>
        )}
      </div>
    </div>
  );
}
