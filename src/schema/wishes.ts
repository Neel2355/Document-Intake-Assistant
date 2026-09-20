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
 * All fields are explicitly nullable by default as per specification:
 * - full_name (string)
 * - home_address (string)
 * - covers_worldwide_assets (boolean)
 * - children (array of objects with name)
 * - executor (object with name, relationship)
 * - specific_gifts (array of strings)
 * - additional_wishes (string)
 */
export const PersonalWishesSchema = z.object({
  full_name: z.string().nullable().default(null),
  home_address: z.string().nullable().default(null),
  covers_worldwide_assets: z.boolean().nullable().default(null),
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
            relationship: { type: "string", description: "Relationship or role (e.g. Sibling, Attorney)" },
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
  children: null,
  executor: null,
  specific_gifts: null,
  additional_wishes: null,
};

/**
 * Staff UX sample preset to demonstrate a completely filled legal wishes document.
 */
export const SAMPLE_PERSONAL_WISHES: PersonalWishes = {
  full_name: "Eleanor Vance-Sterling",
  home_address: "742 Evergreen Terrace, Suite 400, Seattle, WA 98101",
  covers_worldwide_assets: true,
  children: [
    { name: "Julian Sterling" },
    { name: "Clara Vance-Sterling" },
  ],
  executor: {
    name: "Marcus Aurelius Sterling",
    relationship: "Brother & Trusted Family Attorney",
  },
  specific_gifts: [
    "1968 Vintage Omega Seamaster watch to Julian Sterling",
    "Grand piano and sheet music archives to Clara Vance-Sterling",
    "Rare first-edition book collection to the Seattle Public Library Foundation",
  ],
  additional_wishes: "I request a modest celebration of life at the Puget Sound botanical conservatory. Any domestic pets under my care should be placed with Clara, accompanied by a $10,000 stipend for veterinary expenses. Please ensure digital photography archives are backed up to cold storage.",
};
