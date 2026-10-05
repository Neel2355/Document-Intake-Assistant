"use client";

import React, { useMemo, useState } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import { WaitingPlaceholder } from "./WaitingPlaceholder";
import { ReadinessChecklist } from "./ReadinessChecklist";
import { LegalHealthChecker } from "./LegalHealthChecker";
import { EvaluationFixtures } from "./EvaluationFixtures";
import { PersonalWishes, Child } from "@/schema/wishes";
import {
  IconDeed,
  IconCode,
  IconDownload,
  IconEdit,
  IconCheck,
  IconPrinter,
  IconCheckShield,
  IconDomicile,
  IconGlobe,
  IconDescendants,
  IconFiduciary,
  IconBequest,
  IconDirectives,
  IconClose,
  IconPlus,
  IconTrash,
  IconSliders,
} from "../icons/CustomIcons";
import { downloadMarkdownFile } from "@/utils/exportMarkdown";

export function LivePreviewPane() {
  const {
    wishes,
    activeTab,
    setActiveTab,
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
  const [hasChildrenVal, setHasChildrenVal] = useState<boolean | null>(null);
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
    if (field === "has_children") setHasChildrenVal(wishes.has_children);
    if (field === "children") {
      setHasChildrenVal(wishes.has_children);
      setChildrenList(wishes.children || []);
    }
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
    } else if (modalField === "has_children") {
      manualEditField("has_children", hasChildrenVal);
      if (hasChildrenVal === false) {
        manualEditField("children", []);
      }
    } else if (modalField === "children") {
      manualEditField("children", childrenList.length > 0 ? childrenList : null);
      manualEditField("has_children", childrenList.length > 0 ? true : hasChildrenVal);
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
    <div className="flex flex-col h-full bg-surface-canvas border-l border-surface-border">
      {/* Pane Toolbar Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-surface-card border-b border-surface-border shrink-0 no-print select-none">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
                Personal Wishes Document
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary border border-surface-border">
                {filled}/{total} Clauses ({percentage}%)
              </span>
            </div>
            <p className="text-[11px] text-ink-muted font-serif">Fictional document preview (Not legal advice)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Edit Toggle */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isEditMode
                ? "bg-ink-primary text-white border-ink-primary"
                : "bg-surface-base text-ink-secondary border-surface-border hover:bg-surface-subtle hover:text-ink-primary"
            }`}
            title="Toggle direct clause editing escape hatch"
          >
            <IconEdit className="w-3.5 h-3.5" />
            <span>{isEditMode ? "Done Editing" : "Direct Edit"}</span>
          </button>

          {/* Navigation Tabs */}
          <div className="flex p-0.5 bg-surface-subtle rounded-md border border-surface-border text-xs">
            <button
              onClick={() => setActiveTab("document")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "document"
                  ? "bg-surface-card text-ink-primary border border-surface-border"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <IconDeed className="w-3.5 h-3.5" />
              <span>Document</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "audit"
                  ? "bg-surface-card text-ink-primary border border-surface-border"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <IconCheckShield className="w-3.5 h-3.5" />
              <span>Audit</span>
            </button>

            <button
              onClick={() => setActiveTab("fixtures")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "fixtures"
                  ? "bg-surface-card text-ink-primary border border-surface-border"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
              title="Test evaluation fixtures from specification slides"
            >
              <IconSliders className="w-3.5 h-3.5 text-brand-seal" />
              <span>Fixtures</span>
            </button>

            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "json"
                  ? "bg-surface-card text-ink-primary border border-surface-border"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <IconCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: FORMAL TESTAMENTARY DOCUMENT VIEW */}
        {activeTab === "document" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Direct Edit Notice Banner */}
            {isEditMode && (
              <div className="p-3 bg-surface-subtle border border-surface-border rounded-md text-xs text-ink-primary flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <IconEdit className="w-4 h-4 text-brand-seal" />
                  <span>Direct Edit Mode is active. Click any clause to modify its parameters.</span>
                </div>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="font-medium hover:underline cursor-pointer text-brand-seal"
                >
                  Exit Edit Mode
                </button>
              </div>
            )}

            {/* Official Legal Document Container */}
            <div className="bg-surface-card border border-surface-border rounded-md p-6 sm:p-10 text-ink-primary space-y-8 print-document">
              {/* Document Header */}
              <div className="text-center pb-6 border-b border-surface-border space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted block">
                  Fictional Document Intake Draft
                </span>
                <h1 className="text-xl sm:text-2xl font-legal-instrument font-semibold text-ink-primary tracking-tight">
                  Personal Wishes Document
                </h1>
                <p className="text-xs text-ink-muted font-legal-instrument italic">
                  Fictional Document — Not Legal Advice — Wenup Technical Specification
                </p>
              </div>

              {/* CLAUSE 1: PRINCIPAL IDENTIFICATION */}
              <section
                onClick={() => isEditMode && openEditModal("full_name")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("full_name")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconDeed className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article I: Testator Identification
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.full_name ? (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed">
                    I, <strong className="font-semibold">{wishes.full_name}</strong>, being of sound mind and
                    disposing memory, hereby declare this schedule as my testamentary intent and personal directives.
                  </p>
                ) : (
                  <WaitingPlaceholder label="Full Legal Name" />
                )}
              </section>

              {/* CLAUSE 2: RESIDENTIAL DOMICILE */}
              <section
                onClick={() => isEditMode && openEditModal("home_address")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("home_address")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconDomicile className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article II: Residential Domicile and Address
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.home_address ? (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed">
                    My primary residence and legal domicile is situated at:{" "}
                    <span className="font-medium underline decoration-surface-border underline-offset-4">
                      {wishes.home_address}
                    </span>
                    . The laws of this primary venue shall govern the administration of my personal wishes.
                  </p>
                ) : (
                  <WaitingPlaceholder label="Residential Address" />
                )}
              </section>

              {/* CLAUSE 3: TERRITORIAL ASSET SCOPE */}
              <section
                onClick={() => isEditMode && openEditModal("covers_worldwide_assets")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("covers_worldwide_assets")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconGlobe className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article III: Scope of Property Coverage
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.covers_worldwide_assets === null ? (
                  <WaitingPlaceholder label="Worldwide vs. Domestic Scope" />
                ) : wishes.covers_worldwide_assets === true ? (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed">
                    This declaration expressly extends to and governs{" "}
                    <strong className="font-semibold">all property and assets situated worldwide</strong>,
                    whether real, personal, tangible, or intangible, across all international jurisdictions.
                  </p>
                ) : (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed">
                    This declaration is expressly restricted to{" "}
                    <strong className="font-semibold">domestic assets situated within my primary jurisdiction</strong>.
                    Any real or personal property situated internationally shall be governed by separate local instruments.
                  </p>
                )}
              </section>

              {/* CLAUSE 4: DESCENDANTS AND LINEAGE (has_children & children) */}
              <section
                onClick={() => isEditMode && openEditModal("children")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("children")} ${getHighlightClass("has_children")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconDescendants className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article IV: Declaration of Children and Lineage
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.has_children === null && wishes.children === null ? (
                  <WaitingPlaceholder label="Children Declaration (has_children)" />
                ) : wishes.has_children === false || (wishes.children && wishes.children.length === 0) ? (
                  <p className="text-sm font-legal-instrument text-ink-secondary italic">
                    I state that I currently have no living children or descendants to declare.
                  </p>
                ) : wishes.children && wishes.children.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-legal-instrument text-ink-primary">
                      I declare that I have living children designated herein:
                    </p>
                    <ul className="list-disc list-inside text-sm font-legal-instrument text-ink-primary pl-2 space-y-1">
                      {wishes.children.map((c, i) => (
                        <li key={i}>
                          <span className="font-medium">{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm font-legal-instrument text-ink-primary">
                    Children confirmed; names pending specification.
                  </p>
                )}
              </section>

              {/* CLAUSE 5: EXECUTOR AND PERSONAL REPRESENTATIVE */}
              <section
                onClick={() => isEditMode && openEditModal("executor")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("executor")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconFiduciary className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article V: Personal Representative (Executor)
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.executor === null ? (
                  <WaitingPlaceholder label="Executor Name & Relationship" />
                ) : (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed">
                    I nominate and appoint{" "}
                    <strong className="font-semibold">{wishes.executor.name}</strong>{" "}
                    ({wishes.executor.relationship}) as the primary Executor and Personal Representative
                    of this declaration, with full administrative authority granted under statutory law.
                  </p>
                )}
              </section>

              {/* CLAUSE 6: SPECIFIC BEQUESTS */}
              <section
                onClick={() => isEditMode && openEditModal("specific_gifts")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("specific_gifts")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconBequest className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article VI: Specific Gifts and Bequests
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.specific_gifts === null ? (
                  <WaitingPlaceholder label="Specific Gifts / Bequests" />
                ) : wishes.specific_gifts.length === 0 ? (
                  <p className="text-sm font-legal-instrument text-ink-secondary italic">
                    No specific gifts scheduled. All personal effects pass under general estate disposition.
                  </p>
                ) : (
                  <ul className="list-disc list-inside text-sm font-legal-instrument text-ink-primary space-y-1.5 pl-2">
                    {wishes.specific_gifts.map((gift, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span>{gift}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* CLAUSE 7: ADDITIONAL DIRECTIVES */}
              <section
                onClick={() => isEditMode && openEditModal("additional_wishes")}
                className={`p-4 rounded-md border transition-all ${
                  isEditMode ? "cursor-pointer hover:border-ink-primary bg-surface-base" : "border-surface-border bg-surface-card"
                } ${getHighlightClass("additional_wishes")}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconDirectives className="w-4 h-4 text-brand-seal" />
                    <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                      Article VII: Additional Wishes and Directives
                    </h3>
                  </div>
                  {isEditMode && <span className="text-[10px] font-mono text-brand-seal">Click to Edit</span>}
                </div>
                {wishes.additional_wishes === null ? (
                  <WaitingPlaceholder label="Directives & Memorial Wishes" />
                ) : (
                  <p className="text-sm font-legal-instrument text-ink-primary leading-relaxed whitespace-pre-wrap">
                    {wishes.additional_wishes}
                  </p>
                )}
              </section>

              {/* FORMAL EXECUTION SIGNATURE BLOCKS */}
              <div className="pt-8 border-t border-surface-border space-y-8">
                <p className="text-xs font-legal-instrument italic text-ink-secondary text-center">
                  IN WITNESS WHEREOF, I have executed this instrument of personal wishes on this date.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-ink-primary pt-2 space-y-1">
                    <span className="text-[11px] font-mono text-ink-muted uppercase block">
                      Signature of Testator
                    </span>
                    <span className="text-sm font-medium text-ink-primary">
                      {wishes.full_name || "________________________"}
                    </span>
                  </div>

                  <div className="border-t border-ink-primary pt-2 space-y-1">
                    <span className="text-[11px] font-mono text-ink-muted uppercase block">
                      Date of Execution
                    </span>
                    <span className="text-sm font-mono text-ink-primary">
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* STATUTORY DISCLAIMER (Required by Prompt & Slide 5) */}
                <div className="p-4 bg-surface-subtle border border-surface-border rounded-md text-[11px] text-ink-secondary space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-ink-primary uppercase tracking-wider text-[10px]">
                    <IconCheckShield className="w-3.5 h-3.5 text-brand-seal" />
                    <span>Fictional Document & Legal Advice Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    This is a fictional Personal Wishes Document generated for demonstration purposes by Document Intake Assistant.
                    It does NOT constitute legal advice or a binding legal will. Please consult a qualified legal professional
                    to draft and formally execute an enforceable testamentary instrument.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATUTORY AUDIT & READINESS CHECKLIST */}
        {activeTab === "audit" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ReadinessChecklist onSelectField={openEditModal} />
            <LegalHealthChecker />
          </div>
        )}

        {/* TAB 3: TECHNICAL EVALUATION FIXTURES (Unique Feature) */}
        {activeTab === "fixtures" && (
          <div className="max-w-3xl mx-auto">
            <EvaluationFixtures />
          </div>
        )}

        {/* TAB 4: STRUCTURED JSON SCHEMA INSPECTOR */}
        {activeTab === "json" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-border bg-surface-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconCode className="w-4 h-4 text-brand-seal" />
                  <span className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                    Zod Schema State Tree (Source of Truth)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    validationResult.success
                      ? "bg-brand-seal-tint text-brand-seal border-brand-seal-border"
                      : "bg-surface-subtle text-amber-800 border-surface-border"
                  }`}
                >
                  {validationResult.success ? "Schema Validated" : "Validation Pending"}
                </span>
              </div>
              <div className="p-5 font-mono text-xs bg-surface-base overflow-x-auto text-ink-primary leading-relaxed">
                <pre>{JSON.stringify(wishes, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Direct Field Edit Modal (Escape Hatch) */}
      {modalField && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-md max-w-lg w-full border border-surface-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between bg-surface-base">
              <div className="flex items-center gap-2">
                <IconEdit className="w-4 h-4 text-brand-seal" />
                <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Direct Field Modification: {modalField.replace(/_/g, " ")}
                </h3>
              </div>
              <button
                onClick={() => setModalField(null)}
                className="p-1 text-ink-muted hover:text-ink-primary hover:bg-surface-subtle rounded transition-colors cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {modalField === "full_name" && (
                <div>
                  <label className="block font-medium text-ink-primary mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Enter complete legal name"
                    className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                  />
                </div>
              )}

              {modalField === "home_address" && (
                <div>
                  <label className="block font-medium text-ink-primary mb-1">Residential Domicile Address</label>
                  <input
                    type="text"
                    value={addrVal}
                    onChange={(e) => setAddrVal(e.target.value)}
                    placeholder="Street, City, State/Province, Postal Code"
                    className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                  />
                </div>
              )}

              {modalField === "covers_worldwide_assets" && (
                <div>
                  <label className="block font-medium text-ink-primary mb-2">Scope of Property Coverage</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-surface-border bg-surface-base cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={scopeVal === true}
                        onChange={() => setScopeVal(true)}
                        className="text-brand-seal"
                      />
                      <div>
                        <span className="font-medium text-ink-primary block">Worldwide Assets</span>
                        <span className="text-[11px] text-ink-muted">Governs both domestic and international property</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-surface-border bg-surface-base cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={scopeVal === false}
                        onChange={() => setScopeVal(false)}
                        className="text-brand-seal"
                      />
                      <div>
                        <span className="font-medium text-ink-primary block">Domestic Assets Only</span>
                        <span className="text-[11px] text-ink-muted">Restricted exclusively to home domicile jurisdiction</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-md border border-surface-border bg-surface-base cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={scopeVal === null}
                        onChange={() => setScopeVal(null)}
                      />
                      <span className="text-ink-secondary">Unspecified (Null)</span>
                    </label>
                  </div>
                </div>
              )}

              {modalField === "has_children" && (
                <div>
                  <label className="block font-medium text-ink-primary mb-2">Has Children (has_children)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-surface-border bg-surface-base cursor-pointer">
                      <input
                        type="radio"
                        name="has_children_radio"
                        checked={hasChildrenVal === true}
                        onChange={() => setHasChildrenVal(true)}
                        className="text-brand-seal"
                      />
                      <span className="font-medium text-ink-primary">Yes (User has children)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-surface-border bg-surface-base cursor-pointer">
                      <input
                        type="radio"
                        name="has_children_radio"
                        checked={hasChildrenVal === false}
                        onChange={() => setHasChildrenVal(false)}
                        className="text-brand-seal"
                      />
                      <span className="font-medium text-ink-primary">No (User has no children)</span>
                    </label>
                  </div>
                </div>
              )}

              {modalField === "children" && (
                <div className="space-y-3">
                  <label className="block font-medium text-ink-primary">Declared Children / Descendants</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={childInput}
                      onChange={(e) => setChildInput(e.target.value)}
                      placeholder="Child full legal name"
                      className="flex-1 px-3 py-1.5 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (childInput.trim()) {
                          setChildrenList([...childrenList, { name: childInput.trim() }]);
                          setChildInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-ink-primary text-white rounded-md text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-surface-border rounded-md p-2 bg-surface-base">
                    {childrenList.length === 0 ? (
                      <p className="text-ink-muted italic p-1">No children declared.</p>
                    ) : (
                      childrenList.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-surface-card border border-surface-border rounded">
                          <span className="font-medium text-ink-primary">{c.name}</span>
                          <button
                            type="button"
                            onClick={() => setChildrenList(childrenList.filter((_, idx) => idx !== i))}
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

              {modalField === "executor" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-ink-primary mb-1">Personal Representative Name</label>
                    <input
                      type="text"
                      value={execName}
                      onChange={(e) => setExecName(e.target.value)}
                      placeholder="Legal full name"
                      className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-ink-primary mb-1">Fiduciary Relationship</label>
                    <input
                      type="text"
                      value={execRel}
                      onChange={(e) => setExecRel(e.target.value)}
                      placeholder="e.g. Brother, Attorney, Sister"
                      className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                    />
                  </div>
                </div>
              )}

              {modalField === "specific_gifts" && (
                <div className="space-y-3">
                  <label className="block font-medium text-ink-primary">Specific Gifts and Bequests</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftInput}
                      onChange={(e) => setGiftInput(e.target.value)}
                      placeholder="e.g. Vintage pocket watch to brother"
                      className="flex-1 px-3 py-1.5 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (giftInput.trim()) {
                          setGiftsList([...giftsList, giftInput.trim()]);
                          setGiftInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-ink-primary text-white rounded-md text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-surface-border rounded-md p-2 bg-surface-base">
                    {giftsList.length === 0 ? (
                      <p className="text-ink-muted italic p-1">No specific gifts scheduled.</p>
                    ) : (
                      giftsList.map((g, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-surface-card border border-surface-border rounded">
                          <span className="text-ink-primary">{g}</span>
                          <button
                            type="button"
                            onClick={() => setGiftsList(giftsList.filter((_, idx) => idx !== i))}
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

              {modalField === "additional_wishes" && (
                <div>
                  <label className="block font-medium text-ink-primary mb-1">Additional Wishes and Directives</label>
                  <textarea
                    rows={4}
                    value={wishesVal}
                    onChange={(e) => setWishesVal(e.target.value)}
                    placeholder="Provide memorial directives, pet trusts, or special instructions..."
                    className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-md text-ink-primary focus:outline-none focus:border-ink-primary leading-relaxed"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-surface-border bg-surface-base flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalField(null)}
                className="px-3 py-1.5 text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-1.5 bg-ink-primary hover:bg-zinc-800 text-white rounded-md font-medium transition-colors cursor-pointer"
              >
                Apply Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
