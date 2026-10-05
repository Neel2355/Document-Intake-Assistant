"use client";

import React from "react";
import { IconClose, IconCheckShield, IconDeed } from "./icons/CustomIcons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-md max-w-2xl w-full max-h-[85vh] flex flex-col border border-surface-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-base">
          <div className="flex items-center gap-2.5">
            <IconDeed className="w-4 h-4 text-brand-seal" />
            <div>
              <h2 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Terms of Service and Statutory Disclaimers
              </h2>
              <p className="text-[11px] text-ink-muted">Effective Date: October 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close Terms modal"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-ink-secondary leading-relaxed font-sans">
          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              1. Non-Attorney Representation Notice
            </h3>
            <p>
              Personal Wishes Studio provides an automated software system designed solely to record testamentary intent, 
              wishes, and personal asset instructions. This service does NOT constitute legal advice, nor does it establish 
              an attorney-client relationship under any jurisdiction.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              2. Formal Will Execution Requirements
            </h3>
            <p>
              Depending on your state or national domicile, a valid Last Will and Testament requires strict execution formalities, 
              typically including two competent witnesses present at the time of signing, self-proving affidavits, and notary acknowledgment. 
              This document serves as an intake schedule of personal wishes and must be reviewed by qualified legal counsel.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              3. Jurisdictional Limitations
            </h3>
            <p>
              Statutory probate codes vary between jurisdictions. Cross-border assets situated outside your primary domicile 
              may require separate situs wills under international private law (such as the Hague Convention on the Form of 
              Testamentary Dispositions).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              4. Disclaimer of Warranty
            </h3>
            <p>
              The platform and exported documents are provided on an &quot;as-is&quot; basis without warranty of merchantability or 
              probate admissibility. Users assume all responsibility for verifying estate plans with a licensed attorney.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-base flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-ink-primary hover:bg-zinc-800 text-white transition-colors cursor-pointer"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-md max-w-2xl w-full max-h-[85vh] flex flex-col border border-surface-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-base">
          <div className="flex items-center gap-2.5">
            <IconCheckShield className="w-4 h-4 text-brand-seal" />
            <div>
              <h2 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Client Privacy and Data Retention Policy
              </h2>
              <p className="text-[11px] text-ink-muted">Zero Cloud Persistence Guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close Privacy modal"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-ink-secondary leading-relaxed font-sans">
          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              1. Local-First Client Architecture
            </h3>
            <p>
              Your personal data, including full legal names, beneficiary identities, residential domiciles, and bequest details, 
              reside exclusively in memory on your client device. No relational database, server-side session, or tracking cookies 
              store your testamentary data.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              2. Ephemeral Inference
            </h3>
            <p>
              When conversational intake inference occurs, only the immediate conversational window and structured schema are 
              processed to extract clauses. Prompts are never cached or used to train public foundational models.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              3. Telemetry and Audit Logs
            </h3>
            <p>
              System observability metrics (token counts, millisecond latency, raw schema payloads) are rendered locally in 
              the developer inspection drawer and are never transmitted to external telemetry brokers or third-party analytics.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              4. Immediate Data Erasure
            </h3>
            <p>
              Clicking the &quot;Reset Document&quot; button permanently purges the local Zustand memory store and snapshots. 
              Closing the browser tab terminates all active state immediately.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-border bg-surface-base flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-ink-primary hover:bg-zinc-800 text-white transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
