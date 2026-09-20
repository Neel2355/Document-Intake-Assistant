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

interface WishesStoreState {
  wishes: PersonalWishes;
  messages: ChatMessage[];
  activeTab: "document" | "schema" | "health";
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
  setChildren: (children: Child[] | null) => void;
  addChild: (name: string) => void;
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
  setActiveTab: (tab: "document" | "schema" | "health") => void;
  setIsDirectEditOpen: (open: boolean) => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "assistant",
    text: "Welcome to Personal Wishes. I will guide you step-by-step in documenting your testamentary wishes. All fields are verified against our legal schema. To start, what is your full legal name?",
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
          text: `[Reverted]: Restored document snapshot: "${last.description}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    });
    // Trigger visual diffing
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
    get().createSnapshot("AI Assistant update");
    set((state) => {
      const updated: PersonalWishes = { ...state.wishes };
      const updatedKeys: string[] = [];

      if (patch.full_name !== undefined) {
        updated.full_name = patch.full_name;
        updatedKeys.push("full_name");
      }
      if (patch.home_address !== undefined) {
        updated.home_address = patch.home_address;
        updatedKeys.push("home_address");
      }
      if (patch.covers_worldwide_assets !== undefined) {
        updated.covers_worldwide_assets = patch.covers_worldwide_assets;
        updatedKeys.push("covers_worldwide_assets");
      }
      if (patch.children !== undefined) {
        updated.children = patch.children;
        updatedKeys.push("children");
      }
      if (patch.executor !== undefined) {
        updated.executor = patch.executor;
        updatedKeys.push("executor");
      }
      if (patch.specific_gifts !== undefined) {
        updated.specific_gifts = patch.specific_gifts;
        updatedKeys.push("specific_gifts");
      }
      if (patch.additional_wishes !== undefined) {
        updated.additional_wishes = patch.additional_wishes;
        updatedKeys.push("additional_wishes");
      }

      setTimeout(() => {
        updatedKeys.forEach((key) => get().triggerFieldHighlight(key));
      }, 50);

      return { wishes: updated };
    });
  },

  manualEditField: (field, value) => {
    get().createSnapshot(`Manual edit ${field.replace(/_/g, " ")}`);
    get().triggerFieldHighlight(field as string);

    let formattedDisplay = "";
    if (value === null) {
      formattedDisplay = "Cleared (Waiting for input)";
    } else if (typeof value === "boolean") {
      formattedDisplay = value ? "Worldwide Assets" : "Domestic Only";
    } else if (Array.isArray(value)) {
      formattedDisplay = `${value.length} items`;
    } else if (typeof value === "object" && value !== null) {
      const exec = value as Executor;
      formattedDisplay = `${exec.name} (${exec.relationship})`;
    } else {
      formattedDisplay = String(value);
    }

    const readableField = (field as string).replace(/_/g, " ");

    set((state) => ({
      wishes: {
        ...state.wishes,
        [field]: value,
      },
      messages: [
        ...state.messages,
        {
          id: `manual-edit-${Date.now()}`,
          sender: "system",
          text: `[Manual Update]: Testator updated ${readableField} to: "${formattedDisplay}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
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

  setChildren: (children) => {
    get().createSnapshot("Updated Children List");
    get().triggerFieldHighlight("children");
    set((state) => ({
      wishes: { ...state.wishes, children },
    }));
  },

  addChild: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    get().createSnapshot("Added child");
    get().triggerFieldHighlight("children");
    set((state) => {
      const current = state.wishes.children || [];
      return {
        wishes: {
          ...state.wishes,
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
          text: "Loaded sample wishes document for Eleanor Vance-Sterling.",
          timestamp: "Just now",
        },
        {
          id: `sample-complete-${Date.now()}`,
          sender: "assistant",
          text: "Your sample document is completely loaded and ready to inspect, print, or export as Markdown.",
          timestamp: "Just now",
        },
      ],
    });
    [
      "full_name",
      "home_address",
      "covers_worldwide_assets",
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
      "children",
      "executor",
      "specific_gifts",
      "additional_wishes",
    ];
    const missing = fields.filter((f) => wishes[f] === null);
    const filled = fields.length - missing.length;
    const percentage = Math.round((filled / fields.length) * 100);

    return { percentage, filled, total: fields.length, missing };
  },

  sendUserMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...get().messages, userMsg];
    set({
      messages: updatedMessages,
      isStreaming: true,
      streamingText: "",
      activeToolName: null,
    });

    try {
      const payloadMessages = updatedMessages.map((m) => ({
        role: (m.sender === "user" ? "user" : m.sender === "assistant" ? "assistant" : "system") as "user" | "assistant" | "system",
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          currentState: get().wishes,
          apiKey: get().apiKey || undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat API responded with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";
      let invokedTool: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) continue;

          const jsonStr = trimmedLine.replace(/^data:\s*/, "");
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "text_delta") {
              accumulatedText += event.delta;
              set({ streamingText: accumulatedText });
            } else if (event.type === "tool_call" || event.type === "tool_start") {
              invokedTool = event.name;
              set({ activeToolName: event.name });
            } else if (event.type === "state_update") {
              get().applyStatePatch(event.patch);
            } else if (event.type === "telemetry") {
              const turnTelemetry: TurnTelemetry = {
                id: `tel-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                promptTokens: event.promptTokens,
                completionTokens: event.completionTokens,
                latencyMs: event.latencyMs,
                rawToolPayload: event.rawToolPayload,
              };
              set((state) => ({
                latestTelemetry: turnTelemetry,
                telemetryHistory: [turnTelemetry, ...state.telemetryHistory.slice(0, 9)],
              }));
            } else if (event.type === "self_correction_retry") {
              set((state) => ({
                correctionLog: [
                  ...state.correctionLog,
                  `Attempt ${event.attempt}: Schema self-correction: ${event.error}`,
                ],
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
          } catch {
            // Ignore non-json
          }
        }
      }

      if (accumulatedText.trim()) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: "assistant",
          text: accumulatedText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolCallName: invokedTool || undefined,
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          streamingText: "",
          isStreaming: false,
          activeToolName: null,
        }));
      } else {
        set({ isStreaming: false, streamingText: "", activeToolName: null });
      }
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      set((state) => ({
        isStreaming: false,
        streamingText: "",
        activeToolName: null,
        messages: [
          ...state.messages,
          {
            id: `err-${Date.now()}`,
            sender: "system",
            text: `Connection error: ${err.message || "Failed to reach AI intake engine."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setIsDirectEditOpen: (open) => {
    set({ isDirectEditOpen: open });
  },
}));
