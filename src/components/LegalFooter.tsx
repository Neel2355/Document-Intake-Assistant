"use client";

import React, { useState } from "react";
import { TermsOfServiceModal, PrivacyPolicyModal } from "./LegalComplianceModals";
import { IconCheckShield } from "./icons/CustomIcons";

export function LegalFooter() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="h-8 bg-surface-base border-t border-surface-border px-5 flex items-center justify-between shrink-0 text-[11px] text-ink-muted no-print select-none">
        {/* Left: Verifiable Institutional Trust Highlights */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-brand-seal font-medium">
            <IconCheckShield className="w-3.5 h-3.5" />
            <span>Local Memory Isolated</span>
          </div>
          <span className="text-surface-border">•</span>
          <span className="hidden sm:inline">Deterministic Zod v4 Engine</span>
          <span className="text-surface-border hidden sm:inline">•</span>
          <span className="hidden md:inline">7 Statutory Audit Verifications</span>
        </div>

        {/* Right: Direct Compliance Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTermsOpen(true)}
            className="hover:text-ink-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
          >
            Terms of Service
          </button>
          <span className="text-surface-border">/</span>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-ink-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      {/* Compliance Modals */}
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}
