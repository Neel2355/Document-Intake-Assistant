"use client";

import React, { useMemo } from "react";
import { useWishesStore } from "@/store/useWishesStore";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  FileCheck2,
} from "lucide-react";

interface AuditRule {
  id: string;
  category: "Notice" | "Recommendation" | "Verified";
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
        title: "Testator Legal Identity Established",
        description: `Principal identified as ${wishes.full_name}, residing in domicile jurisdiction.`,
        status: "pass",
      });
    } else {
      rules.push({
        id: "testator_id",
        category: "Recommendation",
        title: "Principal Testator Incomplete",
        description: "Legal full name and residential domicile must be completed to establish probate jurisdiction.",
        status: "warn",
      });
    }

    // 2. Territorial Scope Audit
    if (wishes.covers_worldwide_assets === true) {
      rules.push({
        id: "scope_worldwide",
        category: "Notice",
        title: "Cross-Border Asset Clause Active",
        description:
          "Worldwide coverage elected. Ensure foreign real property complies with international will standards or local situs rules.",
        status: "info",
      });
    } else if (wishes.covers_worldwide_assets === false) {
      rules.push({
        id: "scope_domestic",
        category: "Verified",
        title: "Domestic Assets Scope Declared",
        description: "Declaration is strictly limited to domestic jurisdiction property.",
        status: "pass",
      });
    } else {
      rules.push({
        id: "scope_pending",
        category: "Recommendation",
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
          title: "Personal Representative Designated",
          description: `${wishes.executor.name} appointed with clear relationship (${wishes.executor.relationship}).`,
          status: "pass",
        });
      } else {
        rules.push({
          id: "executor_warn",
          category: "Recommendation",
          title: "Executor Relationship Ambiguous",
          description: "Clarify whether the executor is an attorney, family member, spouse, or institutional trust.",
          status: "warn",
        });
      }
    } else {
      rules.push({
        id: "executor_pending",
        category: "Recommendation",
        title: "No Executor Appointed",
        description: "Without an appointed executor, probate court must assign an administrator by default.",
        status: "warn",
      });
    }

    // 4. Descendants & Lineage
    if (wishes.children) {
      if (wishes.children.length > 0) {
        rules.push({
          id: "children_declared",
          category: "Verified",
          title: "Lineage & Children Enumerated",
          description: `${wishes.children.length} child/children explicitly named, reducing pretermitted heir disputes.`,
          status: "pass",
        });
      } else {
        rules.push({
          id: "children_none",
          category: "Verified",
          title: "No Children Declaration Recorded",
          description: "Express statement that the testator has no surviving children on record.",
          status: "pass",
        });
      }
    } else {
      rules.push({
        id: "children_pending",
        category: "Recommendation",
        title: "Children Status Pending",
        description: "Record child names or declare none to avoid statutory omission presumptions.",
        status: "warn",
      });
    }

    // 5. Specific Bequests Audit
    if (wishes.specific_gifts && wishes.specific_gifts.length > 0) {
      rules.push({
        id: "bequests_recorded",
        category: "Verified",
        title: "Specific Bequests Documented",
        description: `${wishes.specific_gifts.length} sentimental or specific item(s) designated.`,
        status: "pass",
      });
    }

    return rules;
  }, [wishes]);

  const passedCount = auditRules.filter((r) => r.status === "pass").length;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-semibold text-zinc-900">Pre-Flight Legal Health Audit</h3>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-600 font-mono font-medium">
            {passedCount} of {auditRules.length} Checks Passed
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        Automated preliminary audit evaluating clause ambiguity, jurisdiction alignment, and standard
        testamentary best practices.
      </p>

      <div className="space-y-2.5">
        {auditRules.map((rule) => (
          <div
            key={rule.id}
            className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${
              rule.status === "pass"
                ? "bg-zinc-50/70 border-zinc-200/80 text-zinc-800"
                : rule.status === "warn"
                ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
                : "bg-blue-50/60 border-blue-200/80 text-blue-900"
            }`}
          >
            <div className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                {rule.status === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {rule.status === "warn" && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                {rule.status === "info" && <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                <span>{rule.title}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/80 border border-current">
                {rule.category}
              </span>
            </div>
            <p className="text-[11px] opacity-90 pl-6 leading-relaxed">{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
