import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { LegalFooter } from "@/components/LegalFooter";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const newsreaderSerif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Document Intake Assistant: Wenup LLM Application Technical Test",
  description:
    "A conversational intake web application that conducts an interview, maintains structured state, and generates a draft Personal Wishes Document. Built for the Wenup Engineering Candidate Technical Test (September 2026).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${newsreaderSerif.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-surface-canvas text-ink-primary overflow-hidden font-sans">
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
        <LegalFooter />
      </body>
    </html>
  );
}
