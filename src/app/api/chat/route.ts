import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  PersonalWishes,
  UpdateDocumentStateSchema,
  UPDATE_DOCUMENT_STATE_TOOL,
  UpdateDocumentState,
} from "@/schema/wishes";

export const runtime = "nodejs";

interface ChatRequestPayload {
  messages: Array<{
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  currentState: PersonalWishes;
  apiKey?: string;
}

/**
 * Builds the Master System Instruction embedding CURRENT_STATE
 * and strict legal intake behavioral rules for the Wenup Document Intake Assistant.
 */
function buildMasterSystemPrompt(currentState: PersonalWishes): string {
  return `You are the Document Intake Assistant (Wenup Engineering Technical Assessment).
Your task is to conduct a conversational interview to create a fictional Personal Wishes Document.

CURRENT_STATE of the document:
${JSON.stringify(currentState, null, 2)}

Strict Behavioral Rules:
1. NEVER repeatedly ask for information already captured in CURRENT_STATE (where value is not null).
2. Ask sensible, concise follow-up questions when an answer is missing, unclear, or contradictory.
3. Do NOT invent facts. Represent unknown or unconfirmed values explicitly as null.
4. Handle answers that provide several fields at once, in any reasonable order, extracting ALL in a single tool call.
5. If the user corrects previously supplied information (e.g., "Actually, change my executor to Sarah"), immediately update the structured state.
6. If an answer is ambiguous or contradictory (e.g., "My brother James, or maybe my sister Sarah"), ask a clarifying question before mutating state.
7. If the user goes off-topic or asks about unrelated matters (e.g., weather, recipes, code), politely decline and redirect them to complete their Personal Wishes Document.
8. Whenever personal wishes data is confirmed, invoke the 'update_document_state' tool with the exact extracted data.
9. Values must strictly match the schema:
   - full_name: string or null
   - home_address: string or null
   - covers_worldwide_assets: boolean or null
   - has_children: boolean or null (true if children exist, false if none)
   - children: array of { name: string } or null
   - executor: object { name: string, relationship: string } or null
   - specific_gifts: array of strings or null
   - additional_wishes: string or null
10. Maintain a professional, reassuring, and attentive conversational tone.`;
}

/**
 * Resilient context-aware simulation engine.
 * Inspects dialogue context, handles ambiguities, multi-field inputs, and corrections.
 */
async function runSimulatedEngine(
  slidingWindow: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  currentState: PersonalWishes,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  startTime: number
) {
  const lastUserMsg = [...slidingWindow].reverse().find((m) => m.role === "user")?.content || "";
  const lastAssistantMsg = [...slidingWindow].reverse().find((m) => m.role === "assistant")?.content || "";
  const lower = lastUserMsg.toLowerCase().trim();
  const assistantLower = lastAssistantMsg.toLowerCase();

  let accumulatedText = "";

  const streamText = async (text: string) => {
    accumulatedText += text;
    const tokens = text.split(" ");
    for (let i = 0; i < tokens.length; i++) {
      const delta = (i === 0 ? "" : " ") + tokens[i];
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: "text_delta", delta })}\n\n`)
      );
      await new Promise((r) => setTimeout(r, 12));
    }
  };

  const emitTelemetry = async (rawToolPayload: any = null) => {
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const promptTokens = Math.max(
      32,
      Math.round(JSON.stringify(slidingWindow).length / 3.8) +
        Math.round(JSON.stringify(currentState).length / 4) +
        110
    );
    const completionTokens = Math.max(
      8,
      Math.round(accumulatedText.length / 3.8) +
        (rawToolPayload ? Math.round(JSON.stringify(rawToolPayload).length / 3.8) : 0)
    );

    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "telemetry",
          promptTokens,
          completionTokens,
          latencyMs,
          rawToolPayload,
        })}\n\n`
      )
    );
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
    await writer.close();
  };

  // Rule: Ambiguity and Contradiction detection (e.g., "James, or maybe Sarah", "not sure whether")
  const isAmbiguous =
    lower.includes("or maybe") ||
    lower.includes("not sure whether") ||
    lower.includes("either") ||
    lower.includes("i don't know whether") ||
    (lower.includes("or ") && !lower.includes("world") && !lower.includes("domestic") && !lower.includes("suite"));

  if (isAmbiguous) {
    await streamText(
      "It sounds like there might be multiple possibilities or an unconfirmed choice. Could you clarify your final preference so I can record it accurately?"
    );
    await emitTelemetry(null);
    return;
  }

  // Rule: Off-topic deflection
  const offTopicKeywords = [
    "weather",
    "recipe",
    "bake a cake",
    "capital of",
    "write python",
    "write code",
    "who is the president",
    "tell me a joke",
    "stock price",
    "bitcoin",
  ];
  if (offTopicKeywords.some((kw) => lower.includes(kw))) {
    await streamText(
      "I am specialized solely as your Document Intake Assistant for recording your Personal Wishes and testamentary intent. Let's return to completing your document."
    );
    if (!currentState.full_name) {
      await streamText(" Could you please provide your full legal name?");
    } else if (!currentState.home_address) {
      await streamText(" What is your current residential domicile address?");
    } else if (currentState.covers_worldwide_assets === null) {
      await streamText(" Should this declaration govern your worldwide assets or domestic assets only?");
    } else if (currentState.has_children === null && currentState.children === null) {
      await streamText(" Do you have any living children you would like to declare?");
    } else if (!currentState.executor) {
      await streamText(" Who would you like to appoint as your Executor or Personal Representative?");
    } else {
      await streamText(" Do you have any specific bequests or additional wishes to record?");
    }
    await emitTelemetry(null);
    return;
  }

  // Multi-field extraction buffer
  const extractedPatch: Partial<UpdateDocumentState> = {};
  let detectedInformation = false;

  // Context-Aware Guidance Detection: What was the assistant asking?
  const isPromptedForAddress =
    assistantLower.includes("address") ||
    assistantLower.includes("residence") ||
    assistantLower.includes("domicile") ||
    (Boolean(currentState.full_name) && !currentState.home_address);

  const isPromptedForName =
    !currentState.full_name ||
    assistantLower.includes("legal name") ||
    assistantLower.includes("your name");

  const isPromptedForWorldwide =
    assistantLower.includes("worldwide") ||
    assistantLower.includes("scope") ||
    (Boolean(currentState.full_name) && Boolean(currentState.home_address) && currentState.covers_worldwide_assets === null);

  const isPromptedForChildren =
    assistantLower.includes("children") ||
    assistantLower.includes("descendant");

  const isPromptedForExecutor =
    assistantLower.includes("executor") ||
    assistantLower.includes("representative");

  const isPromptedForGifts =
    assistantLower.includes("gift") ||
    assistantLower.includes("bequest") ||
    assistantLower.includes("heirloom");

  const isPromptedForWishes =
    assistantLower.includes("additional wishes") ||
    assistantLower.includes("directives") ||
    assistantLower.includes("memorial");

  // Rule: Correction handling (e.g. "actually my address is...", "change executor to...")
  const isCorrection =
    lower.startsWith("actually") ||
    lower.includes("correction") ||
    lower.includes("change my") ||
    lower.includes("update my") ||
    lower.includes("instead of");

  // 1. Full Legal Name Extraction
  if (!currentState.full_name || isCorrection) {
    const nameMatch =
      lastUserMsg.match(/(?:my name is|i am|call me|name:)\s+([A-Z][a-zA-Z\s'-]+?)(?=[,\.\n]|\s+(?:and|i live|my address|living)|$)/i) ||
      lastUserMsg.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/);

    if (nameMatch && nameMatch[1]) {
      extractedPatch.full_name = nameMatch[1].trim();
      detectedInformation = true;
    } else if (isPromptedForName && !lastUserMsg.includes(",") && lastUserMsg.split(" ").length <= 4) {
      const cleanName = lastUserMsg.replace(/^(?:my name is|i'm|name:?|it is|it's)\s+/i, "").trim();
      if (cleanName.length >= 2 && !cleanName.toLowerCase().startsWith("no") && !cleanName.toLowerCase().startsWith("yes")) {
        extractedPatch.full_name = cleanName;
        detectedInformation = true;
      }
    }
  }

  // 2. Home Address Extraction
  if (!currentState.home_address || isCorrection) {
    const explicitAddrMatch =
      lastUserMsg.match(/(?:i live at|address is|residing at|residence:?|address:?)\s+([^.\n]+)/i) ||
      lastUserMsg.match(/(\d+\s+[\w\s.,#-]+?(?:Street|St|Avenue|Ave|Road|Rd|Way|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Suite|Ste|Apt|Unit)[\w\s.,#-]*)/i);

    if (explicitAddrMatch && explicitAddrMatch[1]) {
      extractedPatch.home_address = explicitAddrMatch[1].trim();
      detectedInformation = true;
    } else if (isPromptedForAddress && !extractedPatch.full_name) {
      const cleanAddr = lastUserMsg
        .replace(/^(?:my address is|i live at|living at|address is|address:?|my residence is|residing at|it is|it's|at)\s+/i, "")
        .replace(/[.]+$/, "")
        .trim();

      if (cleanAddr.length >= 3 && !lower.includes("yes") && !lower.includes("worldwide")) {
        extractedPatch.home_address = cleanAddr;
        detectedInformation = true;
      }
    }
  }

  // 3. Worldwide Assets Scope
  if (currentState.covers_worldwide_assets === null || isCorrection) {
    if (
      lower.includes("worldwide") ||
      lower.includes("global") ||
      lower.includes("all assets") ||
      lower.includes("yes, cover") ||
      (isPromptedForWorldwide && (lower === "yes" || lower.startsWith("y") || lower.includes("worldwide")))
    ) {
      extractedPatch.covers_worldwide_assets = true;
      detectedInformation = true;
    } else if (
      lower.includes("domestic only") ||
      lower.includes("local only") ||
      lower.includes("strictly domestic") ||
      (isPromptedForWorldwide && (lower === "no" || lower.startsWith("n") || lower.includes("domestic")))
    ) {
      extractedPatch.covers_worldwide_assets = false;
      detectedInformation = true;
    }
  }

  // 4. Children & Lineage Extraction (handles both has_children and children array)
  if (currentState.has_children === null || currentState.children === null || isCorrection) {
    if (
      lower.includes("no children") ||
      lower.includes("none") ||
      lower.includes("don't have children") ||
      lower.includes("do not have children") ||
      lower.includes("have no children") ||
      (isPromptedForChildren && (lower === "no" || lower.includes("skip")))
    ) {
      extractedPatch.has_children = false;
      extractedPatch.children = [];
      detectedInformation = true;
    } else {
      const childMatch = lastUserMsg.match(/(?:children are|child is|children:|kids:?|add child|have\s+(?:two|three|four|\d+)?\s*children:?)\s+([^.\n]+)/i);
      if (childMatch && childMatch[1]) {
        const names = childMatch[1].split(/,|and/).map((s) => s.trim()).filter(Boolean);
        if (names.length > 0) {
          extractedPatch.has_children = true;
          extractedPatch.children = names.map((name) => ({ name }));
          detectedInformation = true;
        }
      } else if (isPromptedForChildren && !lower.includes("worldwide") && !lower.includes("address")) {
        const cleanNames = lastUserMsg
          .replace(/^(?:my children are|their names are|names?:?|i have)\s+/i, "")
          .split(/,|and/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (cleanNames.length > 0) {
          extractedPatch.has_children = true;
          extractedPatch.children = cleanNames.map((name) => ({ name }));
          detectedInformation = true;
        }
      }
    }
  }

  // 5. Executor & Relationship Extraction
  if (!currentState.executor || isCorrection) {
    const execMatch =
      lastUserMsg.match(/(?:executor is|appoint|executor:)\s+([A-Za-z\s]+?)(?:\s*(?:\(|,|\sas\s)\s*([A-Za-z\s&]+)\)?)?$/i) ||
      lastUserMsg.match(/^([A-Za-z\s]+)\s*\(([^)]+)\)$/);

    if (execMatch && execMatch[1]) {
      extractedPatch.executor = {
        name: execMatch[1].trim(),
        relationship: execMatch[2] ? execMatch[2].trim() : "Personal Representative",
      };
      detectedInformation = true;
    } else if (isPromptedForExecutor) {
      const parts = lastUserMsg
        .replace(/^(?:i appoint|executor is|appoint|executor:?|my)\s+/i, "")
        .split(/[,(]/);

      const name = parts[0]?.trim();
      const rel = parts[1]?.replace(/[)]/g, "").trim() || "Personal Representative";

      if (name && name.length >= 2) {
        extractedPatch.executor = { name, relationship: rel };
        detectedInformation = true;
      }
    }
  }

  // 6. Specific Gifts
  if (currentState.specific_gifts === null || isCorrection) {
    if (lower.includes("no gifts") || lower.includes("no specific gifts") || lower.includes("skip") || (isPromptedForGifts && lower === "none")) {
      extractedPatch.specific_gifts = [];
      detectedInformation = true;
    } else if (
      lower.includes("watch") ||
      lower.includes("piano") ||
      lower.includes("gift") ||
      lower.includes("give ") ||
      lower.includes("leave my") ||
      isPromptedForGifts
    ) {
      const giftClean = lastUserMsg.replace(/^(?:add gift|my specific gifts are|specific gifts?:?)\s*/i, "").trim();
      if (giftClean.length >= 3) {
        extractedPatch.specific_gifts = [giftClean];
        detectedInformation = true;
      }
    }
  }

  // 7. Additional Wishes
  if (!currentState.additional_wishes || isCorrection) {
    if (lower.includes("wish") || lower.includes("memorial") || lower.includes("funeral") || lower.includes("pet") || isPromptedForWishes) {
      const cleanWishes = lastUserMsg.replace(/^(?:my wishes are|additional wishes?:?)\s*/i, "").trim();
      if (cleanWishes.length >= 3) {
        extractedPatch.additional_wishes = cleanWishes;
        detectedInformation = true;
      }
    }
  }

  // If information was extracted, validate through strict Zod schema and emit
  if (detectedInformation && Object.keys(extractedPatch).length > 0) {
    const zodValidation = UpdateDocumentStateSchema.safeParse(extractedPatch);

    if (zodValidation.success) {
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "tool_call",
            name: "update_document_state",
            args: zodValidation.data,
          })}\n\n`
        )
      );

      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "state_update",
            patch: zodValidation.data,
          })}\n\n`
        )
      );

      const updatedKeys = Object.keys(zodValidation.data);
      const friendlyLabels = updatedKeys.map((k) => k.replace(/_/g, " "));
      await streamText(`I have recorded your ${friendlyLabels.join(" and ")}. `);

      const nextState = { ...currentState, ...zodValidation.data };
      if (!nextState.full_name) {
        await streamText("To begin, what is your full legal name?");
      } else if (!nextState.home_address) {
        await streamText("What is your primary residential address?");
      } else if (nextState.covers_worldwide_assets === null) {
        await streamText("Should this personal wishes declaration govern your worldwide assets, or domestic assets only?");
      } else if (nextState.has_children === null && nextState.children === null) {
        await streamText("Do you have any living children, or would you like to declare none?");
      } else if (!nextState.executor) {
        await streamText("Who would you like to appoint as your Executor or Personal Representative, and what is their relationship to you?");
      } else if (nextState.specific_gifts === null) {
        await streamText("Are there any specific heirlooms, sentimental items, or gifts you would like to designate?");
      } else if (!nextState.additional_wishes) {
        await streamText("Do you have any additional wishes or memorial directives to include?");
      } else {
        await streamText("All sections of your Personal Wishes document are complete. You can inspect the live draft on the right, run health audits, or export it.");
      }

      await emitTelemetry(zodValidation.data);
      return;
    } else {
      await streamText(
        `Please verify that input: ${zodValidation.error.issues.map((i) => i.message).join(", ")}. Let's try again.`
      );
      await emitTelemetry(null);
      return;
    }
  }

  // Fallback next missing field prompt
  await streamText("Let's continue drafting your Personal Wishes document. ");
  if (!currentState.full_name) {
    await streamText("Could you please provide your full legal name?");
  } else if (!currentState.home_address) {
    await streamText("What is your current residential address?");
  } else if (currentState.covers_worldwide_assets === null) {
    await streamText("Should this document govern worldwide assets or domestic assets only?");
  } else if (currentState.has_children === null && currentState.children === null) {
    await streamText("Do you have any children you would like to list, or declare none?");
  } else if (!currentState.executor) {
    await streamText("Who would you like to appoint as your Executor or Personal Representative?");
  } else if (currentState.specific_gifts === null) {
    await streamText("Do you have any specific gifts to designate?");
  } else if (!currentState.additional_wishes) {
    await streamText("Do you have any additional wishes or directives?");
  } else {
    await streamText("Your Personal Wishes draft is fully complete and ready for review.");
  }

  await emitTelemetry(null);
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const payload: ChatRequestPayload = await req.json();
    const { messages = [], currentState = { ...DEFAULT_PERSONAL_WISHES_FALLBACK }, apiKey } = payload;

    const last5Messages = messages.slice(-5);
    const slidingWindow = last5Messages.map((m) => ({
      role: m.role || (m as any).sender || "user",
      content: m.content || (m as any).text || "",
    }));

    const masterSystemPrompt = buildMasterSystemPrompt(currentState);
    const activeApiKey = apiKey?.trim() || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        if (!activeApiKey) {
          await runSimulatedEngine(slidingWindow, currentState, writer, encoder, startTime);
          return;
        }

        const isGemini = activeApiKey.startsWith("AIzaSy");
        const openai = new OpenAI({
          apiKey: activeApiKey,
          baseURL: isGemini ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined,
        });

        const modelName = isGemini ? "gemini-1.5-flash" : process.env.OPENAI_MODEL || "gpt-4o-mini";

        let conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: masterSystemPrompt },
          ...slidingWindow.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ];

        const MAX_RETRIES = 2;
        let attempt = 0;
        let successfulResolution = false;
        let lastRawToolPayload: any = null;
        let totalAssistantTokens = 0;

        while (attempt <= MAX_RETRIES && !successfulResolution) {
          attempt++;

          const llmStream = await openai.chat.completions.create({
            model: modelName,
            messages: conversation,
            tools: [UPDATE_DOCUMENT_STATE_TOOL],
            tool_choice: "auto",
            stream: true,
          });

          let assistantText = "";
          let toolCallId = "";
          let toolCallName = "";
          let toolCallArgs = "";

          for await (const chunk of llmStream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              assistantText += delta.content;
              totalAssistantTokens += Math.ceil(delta.content.length / 3.8);
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text_delta", delta: delta.content })}\n\n`
                )
              );
            }

            if (delta?.tool_calls && delta.tool_calls.length > 0) {
              const tc = delta.tool_calls[0];
              if (tc.id) toolCallId = tc.id;
              if (tc.function?.name) toolCallName = tc.function.name;
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
            }
          }

          if (!toolCallName) {
            successfulResolution = true;
            break;
          }

          if (toolCallName === "update_document_state") {
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({ type: "tool_start", name: toolCallName })}\n\n`
              )
            );

            let parsedArgs: any = null;
            let validationErrorMessage: string | null = null;

            try {
              parsedArgs = JSON.parse(toolCallArgs);
              lastRawToolPayload = parsedArgs;
            } catch (jsonErr: any) {
              validationErrorMessage = `Malformed JSON: ${jsonErr.message}`;
            }

            let validatedPatch: UpdateDocumentState | null = null;
            if (!validationErrorMessage) {
              const zodResult = UpdateDocumentStateSchema.safeParse(parsedArgs);
              if (!zodResult.success) {
                validationErrorMessage = `Zod Validation Error: ${zodResult.error.issues
                  .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
                  .join("; ")}`;
              } else {
                validatedPatch = zodResult.data;
              }
            }

            // Self-correction loop: retry internally if invalid
            if (validationErrorMessage) {
              if (attempt <= MAX_RETRIES) {
                await writer.write(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "self_correction_retry",
                      attempt,
                      error: validationErrorMessage,
                    })}\n\n`
                  )
                );

                conversation.push({
                  role: "assistant",
                  content: assistantText || null,
                  tool_calls: [
                    {
                      id: toolCallId || `call_${Date.now()}`,
                      type: "function",
                      function: {
                        name: toolCallName,
                        arguments: toolCallArgs,
                      },
                    },
                  ],
                });

                conversation.push({
                  role: "tool",
                  tool_call_id: toolCallId || `call_${Date.now()}`,
                  content: `Validation Error: ${validationErrorMessage}. Please correct your arguments and call update_document_state again.`,
                });

                continue;
              } else {
                await writer.write(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "error",
                      message: `Validation failed: ${validationErrorMessage}`,
                    })}\n\n`
                  )
                );
                break;
              }
            }

            if (validatedPatch) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "state_update",
                    patch: validatedPatch,
                  })}\n\n`
                )
              );
              successfulResolution = true;
              break;
            }
          }
        }

        const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
        const promptTokens = Math.max(40, Math.round(JSON.stringify(conversation).length / 3.8));
        const completionTokens = Math.max(12, totalAssistantTokens);

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "telemetry",
              promptTokens,
              completionTokens,
              latencyMs,
              rawToolPayload: lastRawToolPayload,
            })}\n\n`
          )
        );

        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        await writer.close();
      } catch (streamErr: any) {
        console.error("Stream error:", streamErr);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: streamErr.message || "An error occurred during LLM stream generation",
            })}\n\n`
          )
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

const DEFAULT_PERSONAL_WISHES_FALLBACK: PersonalWishes = {
  full_name: null,
  home_address: null,
  covers_worldwide_assets: null,
  has_children: null,
  children: null,
  executor: null,
  specific_gifts: null,
  additional_wishes: null,
};
