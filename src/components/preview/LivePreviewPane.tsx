"use client";

import React, { useMemo, useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { WaitingPlaceholder } from "./WaitingPlaceholder";
import { ReadinessChecklist } from "./ReadinessChecklist";
import { LegalHealthChecker } from "./LegalHealthChecker";
import { PersonalWishes, Child, Executor } from "@/schema/wishes";
import {
  FileText,
  Code2,
  Download,
  CheckCircle2,
  Globe2,
  Home,
  Users,
  UserCheck,
  Gift,
  ScrollText,
  ShieldAlert,
  Edit3,
  Check,
  Printer,
  ShieldCheck,
  CheckSquare,
} from "lucide-react";
import { downloadMarkdownFile } from "@/utils/exportMarkdown";

export function LivePreviewPane() {
  const {
    wishes,
    activeTab,
    setActiveTab,
    loadSampleData,
    resetToEmpty,
    validateDocument,
    recentlyUpdatedFields,
    isEditMode,
    setIsEditMode,
    manualEditField,
    getReadiness,
  } = useWishesStore();

  const [modalField, setModalField] = useState<keyof PersonalWishes | null>(null);

  // Modal edit state
  const [nameVal, setNameVal] = useState("");
  const [addrVal, setAddrVal] = useState("");
  const [scopeVal, setScopeVal] = useState<boolean | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [childInput, setChildInput] = useState("");
  const [execName, setExecName] = useState("");
  const [execRel, setExecRel] = useState("");
  const [giftsList, setGiftsList] = useState<string[]>([]);
  const [giftInput, setGiftInput] = useState("");
  const [wishesVal, setWishesVal] = useState("");

  const validationResult = useMemo(() => validateDocument(), [wishes, validateDocument]);
  const { percentage, filled, total } = getReadiness();

  const openEditModal = (field: keyof PersonalWishes) => {
    setModalField(field);
    if (field === "full_name") setNameVal(wishes.full_name || "");
    if (field === "home_address") setAddrVal(wishes.home_address || "");
    if (field === "covers_worldwide_assets") setScopeVal(wishes.covers_worldwide_assets);
    if (field === "children") setChildrenList(wishes.children || []);
    if (field === "executor") {
      setExecName(wishes.executor?.name || "");
      setExecRel(wishes.executor?.relationship || "");
    }
    if (field === "specific_gifts") setGiftsList(wishes.specific_gifts || []);
    if (field === "additional_wishes") setWishesVal(wishes.additional_wishes || "");
  };

  const handleSaveModal = () => {
    if (!modalField) return;

    if (modalField === "full_name") {
      manualEditField("full_name", nameVal.trim() || null);
    } else if (modalField === "home_address") {
      manualEditField("home_address", addrVal.trim() || null);
    } else if (modalField === "covers_worldwide_assets") {
      manualEditField("covers_worldwide_assets", scopeVal);
    } else if (modalField === "children") {
      manualEditField("children", childrenList.length > 0 ? childrenList : null);
    } else if (modalField === "executor") {
      manualEditField(
        "executor",
        execName.trim()
          ? { name: execName.trim(), relationship: execRel.trim() || "Personal Representative" }
          : null
      );
    } else if (modalField === "specific_gifts") {
      manualEditField("specific_gifts", giftsList.length > 0 ? giftsList : null);
    } else if (modalField === "additional_wishes") {
      manualEditField("additional_wishes", wishesVal.trim() || null);
    }

    setModalField(null);
  };

  const getHighlightClass = (key: keyof PersonalWishes) => {
    return recentlyUpdatedFields[key] ? "highlight-updated" : "";
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 border-l border-zinc-200">
      {/* Pane Toolbar Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-zinc-200 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                Document Preview
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {filled}/{total} Clauses ({percentage}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Formal Testamentary Instrument</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Edit Toggle */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isEditMode
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
            title="Toggle direct clause editing"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? "Done Editing" : "Direct Edit"}</span>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("document")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "document"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("health")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "health"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schema")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "schema"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pane Content Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {activeTab === "document" ? (
          /* Formal Legal Document Parchment */
          <div className="max-w-2xl mx-auto bg-white border border-zinc-200 shadow-xs rounded-lg p-8 sm:p-10 space-y-7 font-sans text-zinc-900 print-document transition-all">
            {/* Formal Document Title */}
            <div className="text-center pb-5 border-b border-zinc-200 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">
                Last Will & Testamentary Intent Declaration
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-semibold text-zinc-900 tracking-tight">
                DECLARATION OF PERSONAL WISHES
              </h1>
              <p className="text-xs text-zinc-400">
                Instrument Date:{" "}
                <span className="font-mono text-zinc-600">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>

            {/* Clause 1: Principal Testator */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "full_name"
              )} ${getHighlightClass("home_address")}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Home className="w-3.5 h-3.5 text-zinc-400" />
                  <span>1. Principal Testator</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("full_name")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-0.5">
                  <span className="text-xs text-zinc-400 min-w-32">Full Legal Name:</span>
                  <div className="flex-1 text-right sm:text-left font-medium">
                    {wishes.full_name !== null ? (
                      <span className="font-serif text-base text-zinc-900">{wishes.full_name}</span>
                    ) : (
                      <WaitingPlaceholder inline label="Full Name" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-0.5">
                  <span className="text-xs text-zinc-400 min-w-32">Residential Domicile:</span>
                  <div className="flex-1 text-right sm:text-left text-zinc-700">
                    {wishes.home_address !== null ? (
                      <span>{wishes.home_address}</span>
                    ) : (
                      <WaitingPlaceholder inline label="Home Address" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 2: Territorial Scope */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "covers_worldwide_assets"
              )}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Globe2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. Territorial Scope & Asset Jurisdiction</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("covers_worldwide_assets")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div>
                {wishes.covers_worldwide_assets === null ? (
                  <WaitingPlaceholder label="Territorial Scope" />
                ) : wishes.covers_worldwide_assets === true ? (
                  <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm space-y-1">
                    <p className="font-medium text-xs text-zinc-900">
                      Worldwide Asset Scope Declared
                    </p>
                    <p className="text-zinc-600 text-xs leading-relaxed">
                      This declaration expressly applies to all personal belongings, real property, financial accounts, and digital assets situated globally across any domestic or international jurisdiction.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm space-y-1">
                    <p className="font-medium text-xs text-zinc-900">
                      Domestic Jurisdiction Only
                    </p>
                    <p className="text-zinc-600 text-xs leading-relaxed">
                      This declaration is strictly limited to domestic assets situated within the primary domicile jurisdiction.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Clause 3: Children & Descendants */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "children"
              )}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>3. Children & Descendants</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("children")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div>
                {wishes.children === null ? (
                  <WaitingPlaceholder label="Children & Descendants" />
                ) : wishes.children.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-2.5 bg-zinc-50 rounded-md border border-zinc-200">
                    The testator declares no surviving children or descendants for this instrument.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {wishes.children.map((child, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs sm:text-sm text-zinc-800"
                      >
                        <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-medium">{child.name}</span>
                        <span className="text-[10px] text-zinc-400 ml-auto uppercase font-mono">
                          Child
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Clause 4: Executor */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "executor"
              )}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>4. Personal Representative / Executor</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("executor")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div>
                {wishes.executor === null ? (
                  <WaitingPlaceholder label="Designated Executor" />
                ) : (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs">Designated Executor:</span>
                      <span className="font-serif font-medium text-zinc-900">
                        {wishes.executor.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs">Relationship / Title:</span>
                      <span className="text-xs px-2 py-0.5 bg-zinc-200/70 text-zinc-800 rounded">
                        {wishes.executor.relationship}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Clause 5: Specific Gifts */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "specific_gifts"
              )}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Gift className="w-3.5 h-3.5 text-zinc-400" />
                  <span>5. Specific Gifts & Bequests</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("specific_gifts")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div>
                {wishes.specific_gifts === null ? (
                  <WaitingPlaceholder label="Specific Gifts" />
                ) : wishes.specific_gifts.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-2 bg-zinc-50 rounded-md border border-zinc-200">
                    No specific gifts or individual bequests declared.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {wishes.specific_gifts.map((gift, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs sm:text-sm text-zinc-800"
                      >
                        <Gift className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">{gift}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Clause 6: Additional Wishes */}
            <section
              className={`p-3 rounded-lg border border-transparent transition-all ${getHighlightClass(
                "additional_wishes"
              )}`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <ScrollText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>6. Additional Directives & Sentiments</span>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => openEditModal("additional_wishes")}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              <div>
                {wishes.additional_wishes === null ? (
                  <WaitingPlaceholder label="Additional Directives" />
                ) : (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs sm:text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {wishes.additional_wishes}
                  </div>
                )}
              </div>
            </section>

            {/* Formal Signature Lines (Shows up on print/PDF as well) */}
            <div className="pt-6 border-t border-zinc-200 space-y-6">
              <div className="grid grid-cols-2 gap-8 text-xs pt-4">
                <div className="space-y-4">
                  <div className="border-b border-zinc-400 h-8" />
                  <p className="text-zinc-600 font-medium">Testator Signature</p>
                  <p className="text-[11px] text-zinc-400">Date: _______________</p>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-zinc-400 h-8" />
                  <p className="text-zinc-600 font-medium">Attesting Witness / Notary</p>
                  <p className="text-[11px] text-zinc-400">Date: _______________</p>
                </div>
              </div>

              {/* Statutory Notice */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-500 text-[11px] leading-relaxed">
                <strong>Legal Notice:</strong> This is a fictional document generated for demonstration,
                intake, and planning purposes only. It does not constitute formal legal advice or create
                an attorney-client relationship. Please consult a licensed attorney in your jurisdiction.
              </div>
            </div>
          </div>
        ) : activeTab === "health" ? (
          /* Legal Health Audit & Readiness Checklist View */
          <div className="max-w-2xl mx-auto space-y-5">
            <ReadinessChecklist onSelectField={(field) => openEditModal(field)} />
            <LegalHealthChecker />
          </div>
        ) : (
          /* Zod Schema & JSON View */
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 bg-white border border-zinc-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  Zod Contract Validation
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                    validationResult.success
                      ? "bg-zinc-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {validationResult.success ? "VALID: PersonalWishesSchema" : "VALIDATION ISSUES"}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Schema defines explicit nullable defaults for all 7 fields.
              </p>
            </div>

            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>PersonalWishes State (JSON)</span>
                <span>Reactive</span>
              </div>
              <pre className="text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                {JSON.stringify(wishes, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Direct Edit Modal */}
      {modalField && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-zinc-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                Edit Clause: {modalField.replace(/_/g, " ")}
              </h3>
              <button
                onClick={() => setModalField(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {modalField === "full_name" && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Enter full legal name"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              )}

              {modalField === "home_address" && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Residential Address</label>
                  <textarea
                    rows={3}
                    value={addrVal}
                    onChange={(e) => setAddrVal(e.target.value)}
                    placeholder="Enter residential address"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              )}

              {modalField === "covers_worldwide_assets" && (
                <div className="space-y-2">
                  <label className="block font-medium text-zinc-700 mb-1">Territorial Scope</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setScopeVal(true)}
                      className={`p-2 rounded-lg border text-xs font-medium cursor-pointer ${
                        scopeVal === true
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Worldwide
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeVal(false)}
                      className={`p-2 rounded-lg border text-xs font-medium cursor-pointer ${
                        scopeVal === false
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Domestic Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeVal(null)}
                      className={`p-2 rounded-lg border text-xs font-medium cursor-pointer ${
                        scopeVal === null
                          ? "bg-zinc-300 text-zinc-800 border-zinc-300"
                          : "bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Null
                    </button>
                  </div>
                </div>
              )}

              {modalField === "children" && (
                <div className="space-y-2.5">
                  <label className="block font-medium text-zinc-700 mb-1">Children & Descendants</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={childInput}
                      onChange={(e) => setChildInput(e.target.value)}
                      placeholder="Child name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && childInput.trim()) {
                          e.preventDefault();
                          setChildrenList([...childrenList, { name: childInput.trim() }]);
                          setChildInput("");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (childInput.trim()) {
                          setChildrenList([...childrenList, { name: childInput.trim() }]);
                          setChildInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {childrenList.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
                      >
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenList(childrenList.filter((_, idx) => idx !== i))}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {childrenList.length === 0 && (
                      <p className="text-zinc-400 italic text-xs">No children specified</p>
                    )}
                  </div>
                </div>
              )}

              {modalField === "executor" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Executor Name</label>
                    <input
                      type="text"
                      value={execName}
                      onChange={(e) => setExecName(e.target.value)}
                      placeholder="Executor legal name"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Relationship / Title</label>
                    <input
                      type="text"
                      value={execRel}
                      onChange={(e) => setExecRel(e.target.value)}
                      placeholder="e.g. Brother, Attorney, Friend"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {modalField === "specific_gifts" && (
                <div className="space-y-2.5">
                  <label className="block font-medium text-zinc-700 mb-1">Specific Gifts</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftInput}
                      onChange={(e) => setGiftInput(e.target.value)}
                      placeholder="e.g. Vintage watch to Julian"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && giftInput.trim()) {
                          e.preventDefault();
                          setGiftsList([...giftsList, giftInput.trim()]);
                          setGiftInput("");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (giftInput.trim()) {
                          setGiftsList([...giftsList, giftInput.trim()]);
                          setGiftInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {giftsList.map((g, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
                      >
                        <span className="leading-snug">{g}</span>
                        <button
                          type="button"
                          onClick={() => setGiftsList(giftsList.filter((_, idx) => idx !== i))}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {giftsList.length === 0 && (
                      <p className="text-zinc-400 italic text-xs">No specific gifts</p>
                    )}
                  </div>
                </div>
              )}

              {modalField === "additional_wishes" && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Additional Directives</label>
                  <textarea
                    rows={4}
                    value={wishesVal}
                    onChange={(e) => setWishesVal(e.target.value)}
                    placeholder="Enter additional directives..."
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalField(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save Clause
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
