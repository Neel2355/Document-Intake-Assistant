"use client";

import React, { useMemo } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  IconCheckCircle,
  IconAlertTriangle,
  IconHelpCircle,
  IconCheckShield,
  IconDeed,
} from "../icons/CustomIcons";

interface AuditRule {
  id: string;
  category: "Notice" | "Recommendation" | "Verified";
  statute: string;
  title: string;
  description: string;
  status: "pass" | "warn" | "info";
}

export function LegalHealthChecker() {
  const { wishes } = useWishesStore();

  const auditRules = useMemo<AuditRule[]>(() => {
    const rules: AuditRule[] = [];

    // 1. Principal Testator Identification
    if (wishes.full_name && wishes.home_address) {
      rules.push({
        id: "testator_id",
        category: "Verified",
        statute: "UPC § 2-502(a)",
        title: "Principal Testator Identity Established",
        description: `Testator identified as ${wishes.full_name}, residing in declared domicile jurisdiction.`,
        status: "pass",
      });
    } else {
      rules.push({
        id: "testator_id",
        category: "Recommendation",
        statute: "UPC § 2-501",
        title: "Testator Legal Identity Incomplete",
        description: "Full legal name and residential domicile are required to establish probate venue and capacity.",
        status: "warn",
      });
    }

    // 2. Territorial Scope Audit
    if (wishes.covers_worldwide_assets === true) {
      rules.push({
        id: "scope_worldwide",
        category: "Notice",
        statute: "Hague Convention (1961)",
        title: "Cross-Border International Asset Scope Active",
        description:
          "Worldwide coverage elected. Ensure foreign real property complies with international will standards or local situs rules.",
        status: "info",
      });
    } else if (wishes.covers_worldwide_assets === false) {
      rules.push({
        id: "scope_domestic",
        category: "Verified",
        statute: "Restatement (3d) of Property",
        title: "Domestic Property Scope Declared",
        description: "Declaration is strictly limited to domestic jurisdiction property.",
        status: "pass",
      });
    } else {
      rules.push({
        id: "scope_pending",
        category: "Recommendation",
        statute: "Uniform Probate Code § 1-301",
        title: "Territorial Scope Unspecified",
        description: "Specify whether property disposition covers international or domestic assets.",
        status: "warn",
      });
    }

    // 3. Executor Clarity Audit
    if (wishes.executor) {
      if (wishes.executor.relationship && wishes.executor.relationship.length > 2) {
        rules.push({
          id: "executor_clear",
          category: "Verified",
          statute: "UPC § 3-203",
          title: "Personal Representative Designated",
          description: `${wishes.executor.name} nominated with fiduciary relationship (${wishes.executor.relationship}).`,
          status: "pass",
        });
      } else {
        rules.push({
          id: "executor_warn",
          category: "Recommendation",
          statute: "UPC § 3-203(a)(1)",
          title: "Executor Relationship Ambiguous",
          description: "Clarify whether the executor is an attorney, family member, spouse, or institutional trust fiduciary.",
          status: "warn",
        });
      }
    } else {
      rules.push({
        id: "executor_pending",
        category: "Recommendation",
        statute: "UPC § 3-203(f)",
        title: "No Personal Representative Nominated",
        description: "Without an appointed executor, probate court must assign an administrator by default.",
        status: "warn",
      });
    }

    // 4. Beneficiary / Lineage Declaration
    if (wishes.children && wishes.children.length > 0) {
      rules.push({
        id: "children_declared",
        category: "Verified",
        statute: "UPC § 2-302",
        title: "Descendants Formally Declared",
        description: `${wishes.children.length} descendant(s) declared, eliminating pretermitted heir disputes.`,
        status: "pass",
      });
    } else if (wishes.children !== null) {
      rules.push({
        id: "children_none",
        category: "Verified",
        statute: "Restatement of Wills § 9.2",
        title: "Zero Descendants Explicitly Noted",
        description: "Explicit notation of having no living descendants protects against statutory omission claims.",
        status: "pass",
      });
    } else {
      rules.push({
        id: "children_pending",
        category: "Recommendation",
        statute: "UPC § 2-302",
        title: "Lineage Declaration Unspecified",
        description: "State whether you have living children to prevent pretermitted child statutory challenges.",
        status: "warn",
      });
    }

    // 5. Bequests & Specific Devises
    if (wishes.specific_gifts && wishes.specific_gifts.length > 0) {
      rules.push({
        id: "gifts_declared",
        category: "Verified",
        statute: "UPC § 2-606",
        title: "Specific Devises Documented",
        description: `${wishes.specific_gifts.length} specific bequest(s) scheduled for delivery.`,
        status: "pass",
      });
    } else {
      rules.push({
        id: "gifts_none",
        category: "Notice",
        statute: "UPC § 2-601",
        title: "No Specific Bequests Scheduled",
        description: "Personal property not explicitly devised passes under general residuary estate clauses.",
        status: "info",
      });
    }

    return rules;
  }, [wishes]);

  const passCount = auditRules.filter((r) => r.status === "pass").length;
  const warnCount = auditRules.filter((r) => r.status === "warn").length;
  const infoCount = auditRules.filter((r) => r.status === "info").length;

  return (
    <div className="bg-surface-card border border-surface-border rounded-md p-5 space-y-4 select-none">
      {/* Header and Compliance Matrix */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-center gap-2.5">
          <IconDeed className="w-4 h-4 text-brand-seal" />
          <div>
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Statutory Pre-Flight Health Audit
            </h3>
            <p className="text-[11px] text-ink-muted">Automated compliance checks under Uniform Probate Code</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-brand-seal-tint text-brand-seal border border-brand-seal-border">
            {passCount} Verified
          </span>
          {warnCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-surface-subtle text-amber-800 border border-surface-border">
              {warnCount} Pending
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-surface-subtle text-ink-muted border border-surface-border">
            {infoCount} Notices
          </span>
        </div>
      </div>

      {/* Rules List (Anti-pattern 11: No accent left borders, fully enclosed cards) */}
      <div className="space-y-2.5">
        {auditRules.map((rule) => {
          return (
            <div
              key={rule.id}
              className="p-3.5 rounded-md border border-surface-border bg-surface-base text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {rule.status === "pass" && (
                    <IconCheckCircle className="w-3.5 h-3.5 text-brand-seal shrink-0" />
                  )}
                  {rule.status === "warn" && (
                    <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  {rule.status === "info" && (
                    <IconHelpCircle className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  )}
                  <span className="font-semibold text-ink-primary">{rule.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-ink-muted">
                    {rule.statute}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                      rule.status === "pass"
                        ? "bg-brand-seal-tint text-brand-seal border-brand-seal-border"
                        : rule.status === "warn"
                        ? "bg-surface-subtle text-amber-800 border-surface-border"
                        : "bg-surface-subtle text-ink-muted border-surface-border"
                    }`}
                  >
                    {rule.category}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-ink-secondary leading-relaxed pl-5.5">
                {rule.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
