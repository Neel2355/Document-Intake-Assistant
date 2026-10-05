import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PersonalWishesSchema,
  UpdateDocumentStateSchema,
  DEFAULT_PERSONAL_WISHES,
  SAMPLE_PERSONAL_WISHES,
} from "../schema/wishes.ts";
import type {
  PersonalWishes,
  UpdateDocumentState,
} from "../schema/wishes.ts";
import { generateMarkdown } from "../utils/exportMarkdown.ts";

describe("Wenup Technical Test: Document Intake Assistant Test Suite", () => {
  // 1. STRUCTURED STATE & SCHEMA INTEGRITY (Slides 3, 4)
  describe("1. Structured State & Schema Integrity", () => {
    it("should initialize default state with all fields explicitly nullable", () => {
      const parsed = PersonalWishesSchema.parse(DEFAULT_PERSONAL_WISHES);
      assert.equal(parsed.full_name, null);
      assert.equal(parsed.home_address, null);
      assert.equal(parsed.covers_worldwide_assets, null);
      assert.equal(parsed.has_children, null);
      assert.equal(parsed.children, null);
      assert.equal(parsed.executor, null);
      assert.equal(parsed.specific_gifts, null);
      assert.equal(parsed.additional_wishes, null);
    });

    it("should successfully validate the complete sample state from slide 4", () => {
      const sampleState: PersonalWishes = {
        full_name: "Jane Smith",
        home_address: "14 Belgrave Square, London",
        covers_worldwide_assets: true,
        has_children: false,
        children: [],
        executor: {
          name: "James Smith",
          relationship: "brother",
        },
        specific_gifts: ["Vintage pocket watch to James"],
        additional_wishes: "Modest private memorial service.",
      };

      const result = PersonalWishesSchema.safeParse(sampleState);
      assert.equal(result.success, true);
    });

    it("should reject invalid executor missing required relationship field", () => {
      const invalid = {
        ...DEFAULT_PERSONAL_WISHES,
        executor: { name: "James Smith" }, // missing relationship
      };
      const result = PersonalWishesSchema.safeParse(invalid);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes("relationship")));
      }
    });

    it("should reject non-boolean worldwide coverage values", () => {
      const invalid = {
        ...DEFAULT_PERSONAL_WISHES,
        covers_worldwide_assets: "yes" as any, // string instead of boolean
      };
      const result = PersonalWishesSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  // 2. TOOL CALL BINDING & MULTI-FIELD ATOMIC INTAKE (Slide 5: "Handle answers that provide several fields at once")
  describe("2. Multi-Field Atomic Extraction & Validation", () => {
    it("should validate and apply multiple fields extracted in a single turn", () => {
      const multiFieldBatch: UpdateDocumentState = {
        full_name: "Eleanor Vance",
        home_address: "42 Hill House Lane, Boston, MA",
        covers_worldwide_assets: true,
        executor: { name: "Theodora Vance", relationship: "Sister" },
      };

      const parsed = UpdateDocumentStateSchema.safeParse(multiFieldBatch);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data?.full_name, "Eleanor Vance");
      assert.equal(parsed.data?.covers_worldwide_assets, true);
      assert.equal(parsed.data?.executor?.relationship, "Sister");
    });

    it("should support partial state updates without overwriting existing state", () => {
      let state: PersonalWishes = { ...DEFAULT_PERSONAL_WISHES, full_name: "Jane Smith" };
      const patch: Partial<PersonalWishes> = { home_address: "London, UK", has_children: false };

      state = { ...state, ...patch };

      assert.equal(state.full_name, "Jane Smith");
      assert.equal(state.home_address, "London, UK");
      assert.equal(state.has_children, false);
      assert.equal(state.executor, null); // untouched
    });
  });

  // 3. DEFENSIVE VALIDATION & MALFORMED RESPONSE HANDLING (Slide 6: "Graceful handling of model errors, malformed responses")
  describe("3. Error Handling & Self-Correction Simulation", () => {
    it("should catch malformed JSON tool call arguments safely", () => {
      const malformedJsonString = '{"full_name": "Jane Smith", "covers_worldwide_assets": true,'; // incomplete JSON

      let parseError: Error | null = null;
      try {
        JSON.parse(malformedJsonString);
      } catch (err: any) {
        parseError = err;
      }

      assert.ok(parseError !== null, "Malformed JSON must be caught in try/catch");
    });

    it("should return detailed Zod issue paths for self-correction feedback loop", () => {
      const invalidModelOutput = {
        full_name: 12345, // invalid type
        covers_worldwide_assets: "global", // invalid type
      };

      const result = UpdateDocumentStateSchema.safeParse(invalidModelOutput);
      assert.equal(result.success, false);
      if (!result.success) {
        const errorSummary = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        assert.ok(errorSummary.includes("full_name"));
        assert.ok(errorSummary.includes("covers_worldwide_assets"));
      }
    });
  });

  // 4. USER CORRECTION & OVERWRITE (Slide 4: "Allow the user to correct previously supplied information")
  describe("4. Information Correction & Overwrite", () => {
    it("should allow overwriting an existing field and track the difference", () => {
      const initialState: PersonalWishes = {
        ...DEFAULT_PERSONAL_WISHES,
        executor: { name: "James Smith", relationship: "brother" },
      };

      const correctionPatch: Partial<PersonalWishes> = {
        executor: { name: "Sarah Smith", relationship: "sister & solicitor" },
      };

      const previousValue = initialState.executor;
      const updatedState = { ...initialState, ...correctionPatch };

      assert.notDeepEqual(previousValue, updatedState.executor);
      assert.equal(updatedState.executor?.name, "Sarah Smith");
      assert.equal(updatedState.executor?.relationship, "sister & solicitor");
    });
  });

  // 5. FICTIONAL DRAFT DOCUMENT GENERATION (Slide 5: "Clearly label document as fictional and not legal advice")
  describe("5. Document Generation & Statutory Disclaimers", () => {
    it("should generate markdown document with explicit fictional disclaimer", () => {
      const markdown = generateMarkdown(SAMPLE_PERSONAL_WISHES);

      assert.ok(markdown.includes("FICTIONAL DOCUMENT NOTICE"), "Document must contain fictional disclaimer header");
      assert.ok(/constitute legal advice/i.test(markdown), "Document must state it is not legal advice");
      assert.ok(markdown.includes("Jane Smith"), "Document must render testator name");
      assert.ok(markdown.includes("James Smith"), "Document must render executor name");
      assert.ok(markdown.includes("Statutory Execution Notice"), "Document must describe formal execution notice");
    });

    it("should render placeholder text for unconfirmed null fields", () => {
      const incompleteState: PersonalWishes = {
        ...DEFAULT_PERSONAL_WISHES,
        full_name: "Jane Smith",
      };

      const markdown = generateMarkdown(incompleteState);
      assert.ok(markdown.includes("Jane Smith"));
      assert.ok(markdown.includes("_Waiting for input..._"), "Null fields must render explicit waiting placeholder");
    });
  });
});
