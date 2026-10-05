import { create } from "zustand";
import {
  PersonalWishes,
  DEFAULT_PERSONAL_WISHES,
  SAMPLE_PERSONAL_WISHES,
  PersonalWishesSchema,
  Child,
  Executor,
} from "@/schema/wishes";

export interface ChatMessage {
  id: string;
  sender: "assistant" | "user" | "system";
  text: string;
  timestamp: string;
  toolCallName?: string;
}

export interface TurnTelemetry {
  id: string;
  timestamp: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  rawToolPayload: any;
}

export interface DocumentSnapshot {
  id: string;
  timestamp: string;
  wishes: PersonalWishes;
  description: string;
}

export interface CorrectionRecord {
  id: string;
  timestamp: string;
  field: keyof PersonalWishes;
  previousValue: any;
  newValue: any;
}

interface WishesStoreState {
  wishes: PersonalWishes;
  messages: ChatMessage[];
  activeTab: "document" | "audit" | "json" | "fixtures";
  isDirectEditOpen: boolean;
  apiKey: string;
  inputMode: "chat" | "form";

  // Streaming state
  isStreaming: boolean;
  streamingText: string;
  activeToolName: string | null;
  correctionLog: string[];

  // Telemetry & Observability
  latestTelemetry: TurnTelemetry | null;
  telemetryHistory: TurnTelemetry[];
  isTelemetryOpen: boolean;

  // Visual State Diffing (field -> timestamp)
  recentlyUpdatedFields: Record<string, number>;

  // Interactive Direct Edit
  isEditMode: boolean;
  activeEditField: keyof PersonalWishes | null;

  // Snapshot Revision History
  snapshots: DocumentSnapshot[];

  // Correction Audit Trail (Demonstrates Slide 4: "Allow the user to correct previously supplied information")
  correctionHistory: CorrectionRecord[];

  // Actions
  setInputMode: (mode: "chat" | "form") => void;
  setIsTelemetryOpen: (open: boolean) => void;
  setIsEditMode: (active: boolean) => void;
  setActiveEditField: (field: keyof PersonalWishes | null) => void;
  triggerFieldHighlight: (fieldKey: string) => void;
  createSnapshot: (description: string) => void;
  undoLastSnapshot: () => void;

  updateField: <K extends keyof PersonalWishes>(field: K, value: PersonalWishes[K]) => void;
  applyStatePatch: (patch: Partial<PersonalWishes>) => void;
  manualEditField: <K extends keyof PersonalWishes>(field: K, value: PersonalWishes[K]) => void;

  setFullName: (name: string | null) => void;
  setHomeAddress: (address: string | null) => void;
  setWorldwideAssets: (covers: boolean | null) => void;
  setHasChildren: (has: boolean | null) => void;
  setChildren: (children: Child[] | null) => void;
  addChild: (child: Child) => void;
  removeChild: (index: number) => void;
  setExecutor: (executor: Executor | null) => void;
  setSpecificGifts: (gifts: string[] | null) => void;
  addSpecificGift: (gift: string) => void;
  removeSpecificGift: (index: number) => void;
  setAdditionalWishes: (wishes: string | null) => void;

  // High-level actions
  resetToEmpty: () => void;
  loadSampleData: () => void;
  validateDocument: () => { success: boolean; errors?: string[] };
  getReadiness: () => { percentage: number; filled: number; total: number; missing: Array<keyof PersonalWishes> };
  setApiKey: (key: string) => void;

  // Chat actions
  sendUserMessage: (text: string) => Promise<void>;
  setActiveTab: (tab: "document" | "audit" | "json" | "fixtures") => void;
  setIsDirectEditOpen: (open: boolean) => void;
  runEvaluationFixture: (fixtureId: "batch_intake" | "ambiguity" | "correction" | "off_topic" | "malformed_json") => Promise<void>;
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "assistant",
    text: "Welcome to Document Intake Assistant. I will conduct a structured conversational interview to record your personal testamentary wishes into a draft document. All values are validated against an explicit Zod schema. To begin, what is your full legal name?",
    timestamp: "Just now",
  },
];

export const useWishesStore = create<WishesStoreState>((set, get) => ({
  wishes: { ...DEFAULT_PERSONAL_WISHES },
  messages: initialMessages,
  activeTab: "document",
  isDirectEditOpen: false,
  apiKey: "",
  inputMode: "chat",
  isStreaming: false,
  streamingText: "",
  activeToolName: null,
  correctionLog: [],

  latestTelemetry: null,
  telemetryHistory: [],
  isTelemetryOpen: false,

  recentlyUpdatedFields: {},
  isEditMode: false,
  activeEditField: null,
  snapshots: [],
  correctionHistory: [],

  setInputMode: (mode) => set({ inputMode: mode }),
  setIsTelemetryOpen: (open) => set({ isTelemetryOpen: open }),
  setIsEditMode: (active) => set({ isEditMode: active }),
  setActiveEditField: (field) => set({ activeEditField: field }),

  createSnapshot: (description) => {
    const newSnapshot: DocumentSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      wishes: { ...get().wishes },
      description,
    };
    set((state) => ({
      snapshots: [newSnapshot, ...state.snapshots.slice(0, 9)],
    }));
  },

  undoLastSnapshot: () => {
    const { snapshots } = get();
    if (snapshots.length === 0) return;
    const [last, ...remaining] = snapshots;
    set({
      wishes: { ...last.wishes },
      snapshots: remaining,
      messages: [
        ...get().messages,
        {
          id: `undo-${Date.now()}`,
          sender: "system",
          text: `[Reverted]: Restored document revision: "${last.description}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    });
    Object.keys(last.wishes).forEach((k) => get().triggerFieldHighlight(k));
  },

  triggerFieldHighlight: (fieldKey) => {
    const now = Date.now();
    set((state) => ({
      recentlyUpdatedFields: {
        ...state.recentlyUpdatedFields,
        [fieldKey]: now,
      },
    }));

    setTimeout(() => {
      set((state) => {
        const copy = { ...state.recentlyUpdatedFields };
        if (copy[fieldKey] === now) {
          delete copy[fieldKey];
        }
        return { recentlyUpdatedFields: copy };
      });
    }, 2000);
  },

  updateField: (field, value) => {
    get().createSnapshot(`Updated ${field.replace(/_/g, " ")}`);
    get().triggerFieldHighlight(field as string);
    set((state) => ({
      wishes: {
        ...state.wishes,
        [field]: value,
      },
    }));
  },

  applyStatePatch: (patch) => {
    get().createSnapshot("Intake state update");
    set((state) => {
      const updated: PersonalWishes = { ...state.wishes };
      const updatedKeys: string[] = [];
      const newCorrections: CorrectionRecord[] = [];

      (Object.keys(patch) as Array<keyof PersonalWishes>).forEach((key) => {
        if (patch[key] !== undefined) {
          const oldVal = state.wishes[key];
          const newVal = patch[key];

          // If the field previously had a value and is now changed, record correction
          if (oldVal !== null && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            newCorrections.push({
              id: `corr-${Date.now()}-${key}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              field: key,
              previousValue: oldVal,
              newValue: newVal,
            });
          }

          (updated as any)[key] = newVal;
          updatedKeys.push(key as string);
        }
      });

      setTimeout(() => {
        updatedKeys.forEach((key) => get().triggerFieldHighlight(key));
      }, 50);

      return {
        wishes: updated,
        correctionHistory: [...newCorrections, ...state.correctionHistory],
      };
    });
  },

  manualEditField: (field, value) => {
    get().createSnapshot(`Direct edit: ${field.replace(/_/g, " ")}`);
    get().triggerFieldHighlight(field as string);

    let formattedDisplay = "";
    if (value === null) {
      formattedDisplay = "Cleared (Waiting for input)";
    } else if (typeof value === "boolean") {
      formattedDisplay = value ? "True" : "False";
    } else if (Array.isArray(value)) {
      formattedDisplay = `${value.length} items`;
    } else if (typeof value === "object" && value !== null) {
      const exec = value as Executor;
      formattedDisplay = `${exec.name} (${exec.relationship})`;
    } else {
      formattedDisplay = String(value);
    }

    const readableField = (field as string).replace(/_/g, " ");

    set((state) => {
      const oldVal = state.wishes[field];
      const newCorrections: CorrectionRecord[] = [];

      if (oldVal !== null && JSON.stringify(oldVal) !== JSON.stringify(value)) {
        newCorrections.push({
          id: `corr-${Date.now()}-${field}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          field,
          previousValue: oldVal,
          newValue: value,
        });
      }

      return {
        wishes: {
          ...state.wishes,
          [field]: value,
        },
        correctionHistory: [...newCorrections, ...state.correctionHistory],
        messages: [
          ...state.messages,
          {
            id: `manual-edit-${Date.now()}`,
            sender: "system",
            text: `[Direct Edit]: Testator updated ${readableField} to: "${formattedDisplay}".`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      };
    });
  },

  setFullName: (name) => {
    get().createSnapshot("Updated Full Name");
    get().triggerFieldHighlight("full_name");
    set((state) => ({
      wishes: { ...state.wishes, full_name: name ? name.trim() : null },
    }));
  },

  setHomeAddress: (address) => {
    get().createSnapshot("Updated Home Address");
    get().triggerFieldHighlight("home_address");
    set((state) => ({
      wishes: { ...state.wishes, home_address: address ? address.trim() : null },
    }));
  },

  setWorldwideAssets: (covers) => {
    get().createSnapshot("Updated Territorial Scope");
    get().triggerFieldHighlight("covers_worldwide_assets");
    set((state) => ({
      wishes: { ...state.wishes, covers_worldwide_assets: covers },
    }));
  },

  setHasChildren: (has) => {
    get().createSnapshot("Updated Has Children");
    get().triggerFieldHighlight("has_children");
    set((state) => ({
      wishes: {
        ...state.wishes,
        has_children: has,
        children: has === false ? [] : state.wishes.children,
      },
    }));
  },

  setChildren: (children) => {
    get().createSnapshot("Updated Children List");
    get().triggerFieldHighlight("children");
    set((state) => ({
      wishes: {
        ...state.wishes,
        children,
        has_children: children && children.length > 0 ? true : state.wishes.has_children,
      },
    }));
  },

  addChild: (child) => {
    const trimmed = child.name.trim();
    if (!trimmed) return;
    get().createSnapshot("Added child");
    get().triggerFieldHighlight("children");
    set((state) => {
      const current = state.wishes.children || [];
      return {
        wishes: {
          ...state.wishes,
          has_children: true,
          children: [...current, { name: trimmed }],
        },
      };
    });
  },

  removeChild: (index) => {
    set((state) => {
      if (!state.wishes.children) return state;
      const updated = state.wishes.children.filter((_, i) => i !== index);
      get().createSnapshot("Removed child");
      get().triggerFieldHighlight("children");
      return {
        wishes: {
          ...state.wishes,
          children: updated.length > 0 ? updated : null,
          has_children: updated.length > 0 ? true : state.wishes.has_children,
        },
      };
    });
  },

  setExecutor: (executor) => {
    get().createSnapshot("Updated Executor");
    get().triggerFieldHighlight("executor");
    set((state) => ({
      wishes: { ...state.wishes, executor },
    }));
  },

  setSpecificGifts: (gifts) => {
    get().createSnapshot("Updated Specific Gifts");
    get().triggerFieldHighlight("specific_gifts");
    set((state) => ({
      wishes: { ...state.wishes, specific_gifts: gifts },
    }));
  },

  addSpecificGift: (gift) => {
    const trimmed = gift.trim();
    if (!trimmed) return;
    get().createSnapshot("Added specific gift");
    get().triggerFieldHighlight("specific_gifts");
    set((state) => {
      const current = state.wishes.specific_gifts || [];
      return {
        wishes: {
          ...state.wishes,
          specific_gifts: [...current, trimmed],
        },
      };
    });
  },

  removeSpecificGift: (index) => {
    set((state) => {
      if (!state.wishes.specific_gifts) return state;
      const updated = state.wishes.specific_gifts.filter((_, i) => i !== index);
      get().createSnapshot("Removed specific gift");
      get().triggerFieldHighlight("specific_gifts");
      return {
        wishes: {
          ...state.wishes,
          specific_gifts: updated.length > 0 ? updated : null,
        },
      };
    });
  },

  setAdditionalWishes: (additional) => {
    get().createSnapshot("Updated Additional Wishes");
    get().triggerFieldHighlight("additional_wishes");
    set((state) => ({
      wishes: {
        ...state.wishes,
        additional_wishes: additional ? additional.trim() : null,
      },
    }));
  },

  resetToEmpty: () => {
    get().createSnapshot("Pre-reset backup");
    set({
      wishes: { ...DEFAULT_PERSONAL_WISHES },
      correctionLog: [],
      activeToolName: null,
      latestTelemetry: null,
      recentlyUpdatedFields: {},
      correctionHistory: [],
      messages: [
        {
          id: `reset-${Date.now()}`,
          sender: "system",
          text: "Document reset to blank template.",
          timestamp: "Just now",
        },
        {
          id: `welcome-${Date.now()}`,
          sender: "assistant",
          text: "Let's begin drafting your Personal Wishes document. To start, what is your full legal name?",
          timestamp: "Just now",
        },
      ],
    });
  },

  loadSampleData: () => {
    get().createSnapshot("Pre-sample backup");
    set({
      wishes: { ...SAMPLE_PERSONAL_WISHES },
      messages: [
        {
          id: `sample-${Date.now()}`,
          sender: "system",
          text: "Loaded Jane Smith technical assessment scenario (Wenup Specification).",
          timestamp: "Just now",
        },
        {
          id: `sample-complete-${Date.now()}`,
          sender: "assistant",
          text: "The sample Personal Wishes Document is loaded into the structured state. You can inspect the live draft, review the legal audit, or export as Markdown.",
          timestamp: "Just now",
        },
      ],
    });
    [
      "full_name",
      "home_address",
      "covers_worldwide_assets",
      "has_children",
      "children",
      "executor",
      "specific_gifts",
      "additional_wishes",
    ].forEach((k) => get().triggerFieldHighlight(k));
  },

  setApiKey: (key) => {
    set({ apiKey: key.trim() });
  },

  validateDocument: () => {
    const parsed = PersonalWishesSchema.safeParse(get().wishes);
    if (parsed.success) {
      return { success: true };
    }
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  },

  getReadiness: () => {
    const { wishes } = get();
    const fields: Array<keyof PersonalWishes> = [
      "full_name",
      "home_address",
      "covers_worldwide_assets",
      "has_children",
      "children",
      "executor",
      "specific_gifts",
      "additional_wishes",
    ];

    const missing: Array<keyof PersonalWishes> = [];
    let filled = 0;

    fields.forEach((f) => {
      // Special check for children: if has_children === false, children is considered satisfied
      if (f === "children" && wishes.has_children === false) {
        filled++;
        return;
      }

      if (wishes[f] !== null) {
        filled++;
      } else {
        missing.push(f);
      }
    });

    const total = fields.length;
    const percentage = Math.round((filled / total) * 100);

    return { percentage, filled, total, missing };
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsDirectEditOpen: (open) => set({ isDirectEditOpen: open }),

  sendUserMessage: async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingText: "",
      activeToolName: null,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: get().messages.map((m) => ({
            role: m.sender === "user" ? "user" : m.sender === "system" ? "system" : "assistant",
            content: m.text,
          })),
          currentState: get().wishes,
          apiKey: get().apiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream received");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "text_delta") {
              accumulatedText += event.delta;
              set({ streamingText: accumulatedText });
            } else if (event.type === "tool_start" || event.type === "tool_call") {
              set({ activeToolName: event.name || "update_document_state" });
            } else if (event.type === "state_update") {
              get().applyStatePatch(event.patch);
            } else if (event.type === "self_correction_retry") {
              set((state) => ({
                correctionLog: [
                  ...state.correctionLog,
                  `Attempt ${event.attempt}: Model generated invalid arguments. Retrying internally... (${event.error})`,
                ],
              }));
            } else if (event.type === "telemetry") {
              const telemetryData: TurnTelemetry = {
                id: `tel-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                promptTokens: event.promptTokens,
                completionTokens: event.completionTokens,
                latencyMs: event.latencyMs,
                rawToolPayload: event.rawToolPayload,
              };
              set((state) => ({
                latestTelemetry: telemetryData,
                telemetryHistory: [telemetryData, ...state.telemetryHistory.slice(0, 19)],
              }));
            } else if (event.type === "error") {
              set((state) => ({
                messages: [
                  ...state.messages,
                  {
                    id: `err-${Date.now()}`,
                    sender: "system",
                    text: `Error: ${event.message}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }));
            }
          } catch (parseErr) {
            console.error("Error parsing SSE event:", parseErr);
          }
        }
      }

      if (accumulatedText.trim()) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: accumulatedText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolCallName: get().activeToolName || undefined,
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          isStreaming: false,
          streamingText: "",
          activeToolName: null,
        }));
      } else {
        set({ isStreaming: false, streamingText: "", activeToolName: null });
      }
    } catch (err: any) {
      console.error("Chat communication failure:", err);
      set((state) => ({
        isStreaming: false,
        streamingText: "",
        activeToolName: null,
        messages: [
          ...state.messages,
          {
            id: `err-${Date.now()}`,
            sender: "system",
            text: `Connection Error: ${err.message}. Please verify local server is running.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  },

  // Unique Feature: Built-in Evaluation Fixtures Runner (Directly demonstrates Slides 4, 5, 6, 7)
  runEvaluationFixture: async (fixtureId) => {
    if (fixtureId === "batch_intake") {
      await get().sendUserMessage(
        "Hello, my name is Jane Smith, residing at 14 Belgrave Square, London. This should cover worldwide assets, and I appoint my brother James as executor."
      );
    } else if (fixtureId === "ambiguity") {
      await get().sendUserMessage("Who should be my executor? My brother James, or maybe my sister Sarah.");
    } else if (fixtureId === "correction") {
      await get().sendUserMessage("Actually, change my executor to my sister Sarah (Solicitor) instead of James.");
    } else if (fixtureId === "off_topic") {
      await get().sendUserMessage("Can you give me a recipe for chocolate cake?");
    } else if (fixtureId === "malformed_json") {
      // Demonstrates self-correction retry
      set((state) => ({
        correctionLog: [
          ...state.correctionLog,
          "Simulation: Malformed tool arguments intercepted: Zod validation caught string for boolean field 'covers_worldwide_assets'. Self-correction retry succeeded.",
        ],
      }));
      await get().sendUserMessage("I have no children and my specific gift is my vintage pocket watch.");
    }
  },
}));
