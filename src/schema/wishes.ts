import { z } from "zod";

/**
 * Child schema representing a child's name.
 */
export const ChildSchema = z.object({
  name: z.string().min(1, "Child name is required"),
});

/**
 * Executor schema representing the personal representative and their relationship.
 */
export const ExecutorSchema = z.object({
  name: z.string().min(1, "Executor name is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

/**
 * Strict Zod schema for the PersonalWishes document.
 * Aligned with the Wenup Document Intake Assistant Technical Specification:
 * - full_name (string | null)
 * - home_address (string | null)
 * - covers_worldwide_assets (boolean | null)
 * - has_children (boolean | null)
 * - children (array of objects with name | null)
 * - executor (object with name, relationship | null)
 * - specific_gifts (array of strings | null)
 * - additional_wishes (string | null)
 */
export const PersonalWishesSchema = z.object({
  full_name: z.string().nullable().default(null),
  home_address: z.string().nullable().default(null),
  covers_worldwide_assets: z.boolean().nullable().default(null),
  has_children: z.boolean().nullable().default(null),
  children: z.array(ChildSchema).nullable().default(null),
  executor: ExecutorSchema.nullable().default(null),
  specific_gifts: z.array(z.string().min(1, "Gift description cannot be empty")).nullable().default(null),
  additional_wishes: z.string().nullable().default(null),
});

/**
 * Schema for the update_document_state tool call.
 * Allows updating one or more fields of the document simultaneously.
 */
export const UpdateDocumentStateSchema = z.object({
  full_name: z.string().nullable().optional(),
  home_address: z.string().nullable().optional(),
  covers_worldwide_assets: z.boolean().nullable().optional(),
  has_children: z.boolean().nullable().optional(),
  children: z.array(ChildSchema).nullable().optional(),
  executor: ExecutorSchema.nullable().optional(),
  specific_gifts: z.array(z.string().min(1, "Gift description cannot be empty")).nullable().optional(),
  additional_wishes: z.string().nullable().optional(),
});

export type Child = z.infer<typeof ChildSchema>;
export type Executor = z.infer<typeof ExecutorSchema>;
export type PersonalWishes = z.infer<typeof PersonalWishesSchema>;
export type UpdateDocumentState = z.infer<typeof UpdateDocumentStateSchema>;

/**
 * OpenAI / Gemini tool definition for update_document_state bound to our Zod schema.
 */
export const UPDATE_DOCUMENT_STATE_TOOL = {
  type: "function" as const,
  function: {
    name: "update_document_state",
    description:
      "Updates one or more fields in the PersonalWishes document state when the user provides personal wish information. Extract all provided fields in a single call.",
    parameters: {
      type: "object",
      properties: {
        full_name: {
          type: ["string", "null"],
          description: "The testator's full legal name, or null.",
        },
        home_address: {
          type: ["string", "null"],
          description: "Primary residential address including street, city, state/country.",
        },
        covers_worldwide_assets: {
          type: ["boolean", "null"],
          description: "True if covering worldwide assets; false if strictly domestic.",
        },
        has_children: {
          type: ["boolean", "null"],
          description: "True if the user has children; false if the user has no children; null if unconfirmed.",
        },
        children: {
          type: ["array", "null"],
          description: "Array of child objects with 'name' property, or null if no children.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the child" },
            },
            required: ["name"],
          },
        },
        executor: {
          type: ["object", "null"],
          description: "Designated executor / personal representative, or null.",
          properties: {
            name: { type: "string", description: "Full name of the executor" },
            relationship: { type: "string", description: "Relationship or role (e.g. brother, attorney)" },
          },
          required: ["name", "relationship"],
        },
        specific_gifts: {
          type: ["array", "null"],
          description: "List of specific gifts/bequests, or null.",
          items: { type: "string" },
        },
        additional_wishes: {
          type: ["string", "null"],
          description: "Additional directives, funeral wishes, pet instructions, or null.",
        },
      },
      additionalProperties: false,
    },
  },
};

/**
 * Default empty state where every field is explicitly null.
 */
export const DEFAULT_PERSONAL_WISHES: PersonalWishes = {
  full_name: null,
  home_address: null,
  covers_worldwide_assets: null,
  has_children: null,
  children: null,
  executor: null,
  specific_gifts: null,
  additional_wishes: null,
};

/**
 * Wenup test sample preset matching the specification slides.
 */
export const SAMPLE_PERSONAL_WISHES: PersonalWishes = {
  full_name: "Jane Smith",
  home_address: "14 Belgrave Square, London SW1X 8PS, United Kingdom",
  covers_worldwide_assets: true,
  has_children: true,
  children: [
    { name: "Julian Smith" },
    { name: "Clara Smith" },
  ],
  executor: {
    name: "James Smith",
    relationship: "brother",
  },
  specific_gifts: [
    "Vintage pocket watch to brother James Smith",
    "Family art collection to Julian and Clara Smith",
  ],
  additional_wishes: "I request a modest private memorial service. All digital files and photographs should be transferred to my brother James.",
};
