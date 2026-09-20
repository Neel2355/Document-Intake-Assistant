import { PersonalWishes } from "@/schema/wishes";

/**
 * Converts the current PersonalWishes state into a formatted Markdown document,
 * explicitly appending the required legal disclaimer.
 */
export function generateMarkdown(wishes: PersonalWishes): string {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const childrenSection =
    wishes.children && wishes.children.length > 0
      ? wishes.children.map((c, i) => `${i + 1}. **${c.name}**`).join("\n")
      : wishes.children === null
      ? "_Waiting for input..._"
      : "_None specified_";

  const executorSection =
    wishes.executor
      ? `- **Designated Executor:** ${wishes.executor.name}\n- **Relationship / Role:** ${wishes.executor.relationship}`
      : "_Waiting for input..._";

  const giftsSection =
    wishes.specific_gifts && wishes.specific_gifts.length > 0
      ? wishes.specific_gifts.map((g, i) => `${i + 1}. ${g}`).join("\n")
      : wishes.specific_gifts === null
      ? "_Waiting for input..._"
      : "_None specified_";

  let worldwideCoverageStr = "_Waiting for input..._";
  if (wishes.covers_worldwide_assets === true) {
    worldwideCoverageStr = "Yes — This declaration expressly covers all assets worldwide.";
  } else if (wishes.covers_worldwide_assets === false) {
    worldwideCoverageStr = "No — This declaration is strictly limited to domestic/local assets.";
  }

  return `# DECLARATION OF PERSONAL WISHES & TESTAMENTARY INTENT

**Document Date:** ${generatedDate}  
**Status:** ${wishes.full_name ? "Draft Prepared" : "Initial Draft"}  
**Schema Standard:** PersonalWishes.v1 (Strict Zod Validated)

---

## 1. Principal Testator Identification
- **Full Legal Name:** ${wishes.full_name ?? "_Waiting for input..._"}
- **Primary Residence:** ${wishes.home_address ?? "_Waiting for input..._"}

---

## 2. Territorial & Asset Scope
- **Covers Worldwide Assets:** ${worldwideCoverageStr}

---

## 3. Children & Descendants
${childrenSection}

---

## 4. Personal Representative / Executor
${executorSection}

---

## 5. Specific Gifts & Bequests
${giftsSection}

---

## 6. Additional Wishes & Directives
${wishes.additional_wishes ? wishes.additional_wishes : "_Waiting for input..._"}

---

## ⚠️ LEGAL DISCLAIMER & NOTICE
> **IMPORTANT NOTICE:** This is a fictional document created for demonstration, educational, and preliminary organizational purposes only. It does **NOT** constitute legal advice, a binding last will and testament, or an attorney-client relationship. Laws governing wills, estates, probate, and testamentary dispositions vary significantly across jurisdictions. Please consult a qualified, licensed attorney in your relevant jurisdiction before taking any legal action or executing testamentary instruments.
`;
}

/**
 * Triggers a browser file download for the generated Markdown document.
 */
export function downloadMarkdownFile(wishes: PersonalWishes, filename?: string): void {
  const content = generateMarkdown(wishes);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const sanitizedName = wishes.full_name
    ? wishes.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "personal-wishes";
  const finalFilename = filename || `${sanitizedName}-draft.md`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
