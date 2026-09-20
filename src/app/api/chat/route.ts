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
 * and strict legal intake behavioral rules.
 */
function buildMasterSystemPrompt(currentState: PersonalWishes): string {
  return `You are a professional Estate Planning Intake Assistant guiding a client through drafting their Personal Wishes and Testamentary Intent document.

CURRENT_STATE of the document:
${JSON.stringify(currentState, null, 2)}

Strict Guidelines:
1. NEVER ask for information already captured in CURRENT_STATE (where value is not null).
2. Ask concise, friendly follow-up questions for missing required fields (where value is currently null).
3. If the user provides an address (e.g. street, city, state, postal code, or simple location), immediately accept it as home_address.
4. If multiple fields are provided at once, extract ALL of them in a single call to the tool 'update_document_state'.
5. If the user goes off-topic or asks about unrelated matters (e.g., weather, recipes, trivia, programming), politely decline and redirect them to complete their Personal Wishes Document.
6. Whenever the user provides personal wish information, invoke the 'update_document_state' tool with the extracted data.
7. Values must strictly match the schema:
   - full_name: string or null
   - home_address: string or null
   - covers_worldwide_assets: boolean or null
   - children: array of { name: string } or null
   - executor: object { name: string, relationship: string } or null
   - specific_gifts: array of strings or null
   - additional_wishes: string or null
8. Keep your responses calm, professional, clear, and reassuring.`;
}

/**
 * Resilient context-aware simulation engine.
 * Inspects dialogue context so user responses are NEVER ignored or stuck.
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
      await new Promise((r) => setTimeout(r, 14));
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
  };

  // Rule 5: Check for explicit off-topic query
  const offTopicKeywords = [
    "weather", "recipe", "capital of", "code", "python", "javascript",
    "sports", "football", "joke", "movie", "song", "who won", "how to bake"
  ];
  const isOffTopic = offTopicKeywords.some((kw) => lower.includes(kw));

  if (isOffTopic) {
    await streamText(
      "As your Estate Planning Assistant, my role is to help you document your personal testamentary wishes. Let's return to your document. "
    );

    if (!currentState.full_name) {
      await streamText("Could you please provide your full legal name?");
    } else if (!currentState.home_address) {
      await streamText("What is your primary residential address?");
    } else if (currentState.covers_worldwide_assets === null) {
      await streamText("Should this document cover your worldwide assets, or domestic assets only?");
    } else if (currentState.children === null) {
      await streamText("Would you like to list any children, or declare none?");
    } else if (!currentState.executor) {
      await streamText("Who would you like to appoint as your Executor or Personal Representative?");
    } else if (currentState.specific_gifts === null) {
      await streamText("Do you have any specific gifts or family bequests to designate?");
    } else if (!currentState.additional_wishes) {
      await streamText("Do you have any additional wishes or directives?");
    } else {
      await streamText("Your document is fully drafted and ready for review.");
    }
    await emitTelemetry(null);
    return;
  }

  // Multi-field extraction buffer
  const extractedPatch: Partial<UpdateDocumentState> = {};
  let detectedInformation = false;

  // Context-Aware Detection: What did the assistant ask for last?
  const isPromptedForAddress =
    assistantLower.includes("address") ||
    assistantLower.includes("residence") ||
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

  // 1. Explicit or Multi-Field Name Extraction
  if (!currentState.full_name) {
    const nameMatch =
      lastUserMsg.match(/(?:my name is|i am|call me|name:)\s+([A-Z][a-zA-Z\s'-]+?)(?=[,\.\n]|\s+(?:and|i live|my address|living)|$)/i) ||
      lastUserMsg.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/);

    if (nameMatch && nameMatch[1]) {
      extractedPatch.full_name = nameMatch[1].trim();
      detectedInformation = true;
    } else if (isPromptedForName && !lastUserMsg.includes(",") && lastUserMsg.split(" ").length <= 4) {
      const cleanName = lastUserMsg.replace(/^(?:my name is|i'm|name:?|it is|it's)\s+/i, "").trim();
      if (cleanName.length >= 2) {
        extractedPatch.full_name = cleanName;
        detectedInformation = true;
      }
    }
  }

  // 2. RESILIENT HOME ADDRESS EXTRACTION (Fixes "stuck on residential address" bug)
  if (!currentState.home_address) {
    // Multi-field or explicit pattern
    const explicitAddrMatch =
      lastUserMsg.match(/(?:i live at|address is|residing at|residence:?|address:?)\s+([^.\n]+)/i) ||
      lastUserMsg.match(/(\d+\s+[\w\s.,#-]+?(?:Street|St|Avenue|Ave|Road|Rd|Way|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Suite|Ste|Apt|Unit)[\w\s.,#-]*)/i);

    if (explicitAddrMatch && explicitAddrMatch[1]) {
      extractedPatch.home_address = explicitAddrMatch[1].trim();
      detectedInformation = true;
    } else if (isPromptedForAddress && !extractedPatch.full_name) {
      // User is responding directly to the residential address question!
      const cleanAddr = lastUserMsg
        .replace(/^(?:my address is|i live at|living at|address is|address:?|my residence is|residing at|it is|it's|at)\s+/i, "")
        .replace(/[.]+$/, "")
        .trim();

      // Accept any natural address input (e.g., "123 Main St", "London, UK", "Paris", "Seattle WA", "Flat 4, High St")
      if (cleanAddr.length >= 3 && !lower.includes("yes") && !lower.includes("worldwide")) {
        extractedPatch.home_address = cleanAddr;
        detectedInformation = true;
      }
    }
  }

  // 3. Worldwide Assets Coverage
  if (currentState.covers_worldwide_assets === null) {
    if (
      lower.includes("worldwide") ||
      lower.includes("global") ||
      lower.includes("all assets") ||
      lower.includes("yes, cover") ||
      lower === "yes" ||
      (isPromptedForWorldwide && (lower.startsWith("y") || lower.includes("worldwide")))
    ) {
      extractedPatch.covers_worldwide_assets = true;
      detectedInformation = true;
    } else if (
      lower.includes("domestic only") ||
      lower.includes("local only") ||
      lower.includes("strictly domestic") ||
      lower === "no" ||
      (isPromptedForWorldwide && (lower.startsWith("n") || lower.includes("domestic")))
    ) {
      extractedPatch.covers_worldwide_assets = false;
      detectedInformation = true;
    }
  }

  // 4. Children Extraction
  if (currentState.children === null) {
    if (
      lower.includes("no children") ||
      lower.includes("none") ||
      lower.includes("have no children") ||
      lower === "no" ||
      lower.includes("skip")
    ) {
      extractedPatch.children = [];
      detectedInformation = true;
    } else {
      const childMatch = lastUserMsg.match(/(?:children are|child is|children:|kids:?|add child)\s+([^.\n]+)/i);
      if (childMatch && childMatch[1]) {
        const names = childMatch[1].split(/,|and/).map((s) => s.trim()).filter(Boolean);
        if (names.length > 0) {
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
          extractedPatch.children = cleanNames.map((name) => ({ name }));
          detectedInformation = true;
        }
      }
    }
  }

  // 5. Executor Extraction
  if (!currentState.executor) {
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
      // Parse "Name (Relationship)" or "Name, Relationship" or just "Name"
      const parts = lastUserMsg
        .replace(/^(?:i appoint|executor is|appoint|executor:?)\s+/i, "")
        .split(/[,(]/);

      const name = parts[0]?.trim();
      const rel = parts[1]?.replace(/[)]/g, "").trim() || "Personal Representative";

      if (name && name.length >= 2) {
        extractedPatch.executor = { name, relationship: rel };
        detectedInformation = true;
      }
    }
  }

  // 6. Specific Gifts Extraction
  if (currentState.specific_gifts === null) {
    if (lower.includes("no gifts") || lower.includes("no specific gifts") || lower.includes("skip") || (isPromptedForGifts && lower === "none")) {
      extractedPatch.specific_gifts = [];
      detectedInformation = true;
    } else if (
      lower.includes("watch") ||
      lower.includes("piano") ||
      lower.includes("gift") ||
      lower.includes("give ") ||
      isPromptedForGifts
    ) {
      const giftClean = lastUserMsg.replace(/^(?:add gift|my specific gifts are|specific gifts?:?)\s*/i, "").trim();
      if (giftClean.length >= 3) {
        extractedPatch.specific_gifts = [giftClean];
        detectedInformation = true;
      }
    }
  }

  // 7. Additional Wishes Extraction
  if (!currentState.additional_wishes && (lower.includes("wish") || lower.includes("memorial") || lower.includes("funeral") || lower.includes("pet") || isPromptedForWishes)) {
    const cleanWishes = lastUserMsg.replace(/^(?:my wishes are|additional wishes?:?)\s*/i, "").trim();
    if (cleanWishes.length >= 3) {
      extractedPatch.additional_wishes = cleanWishes;
      detectedInformation = true;
    }
  }

  // If information was extracted, validate through strict Zod schema and stream
  if (detectedInformation && Object.keys(extractedPatch).length > 0) {
    const zodValidation = UpdateDocumentStateSchema.safeParse(extractedPatch);

    if (zodValidation.success) {
      // Emit tool call
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "tool_call",
            name: "update_document_state",
            args: zodValidation.data,
          })}\n\n`
        )
      );

      // Emit state mutation
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "state_update",
            patch: zodValidation.data,
          })}\n\n`
        )
      );

      // Friendly confirmation
      const updatedKeys = Object.keys(zodValidation.data);
      const friendlyLabels = updatedKeys.map((k) => k.replace(/_/g, " "));
      await streamText(`I have recorded your ${friendlyLabels.join(" and ")}. `);

      // Determine next missing field
      const nextState = { ...currentState, ...zodValidation.data };
      if (!nextState.full_name) {
        await streamText("To begin, what is your full legal name?");
      } else if (!nextState.home_address) {
        await streamText("What is your primary residential address?");
      } else if (nextState.covers_worldwide_assets === null) {
        await streamText("Should this personal wishes declaration govern your worldwide assets, or domestic assets only?");
      } else if (nextState.children === null) {
        await streamText("Would you like to list any children or descendants, or specify none?");
      } else if (!nextState.executor) {
        await streamText("Who would you like to appoint as your Executor or Personal Representative, and what is their relationship to you?");
      } else if (nextState.specific_gifts === null) {
        await streamText("Are there any specific heirlooms, sentimental items, or gifts you would like to designate?");
      } else if (!nextState.additional_wishes) {
        await streamText("Do you have any additional wishes or memorial directives to include?");
      } else {
        await streamText("All sections of your Personal Wishes document are complete. You can review the document on the right or export it.");
      }

      await emitTelemetry(zodValidation.data);
      return;
    } else {
      await streamText(
        `Please verify that information: ${zodValidation.error.issues.map((i) => i.message).join(", ")}. Let's try again.`
      );
      await emitTelemetry(null);
      return;
    }
  }

  // Default helpful response guiding the user to the next missing step
  await streamText("Let's continue drafting your Personal Wishes document. ");
  if (!currentState.full_name) {
    await streamText("Could you please provide your full legal name?");
  } else if (!currentState.home_address) {
    await streamText("What is your primary residential address?");
  } else if (currentState.covers_worldwide_assets === null) {
    await streamText("Should this document cover your worldwide assets, or domestic assets only?");
  } else if (currentState.children === null) {
    await streamText("Would you like to list your children, or declare none?");
  } else if (!currentState.executor) {
    await streamText("Who should be appointed as your Executor or Personal Representative?");
  } else if (currentState.specific_gifts === null) {
    await streamText("Do you have any specific gifts to designate?");
  } else if (!currentState.additional_wishes) {
    await streamText("Do you have any additional wishes or directives?");
  } else {
    await streamText("Your document is complete. Let me know if you would like to adjust any details or export.");
  }
  await emitTelemetry(null);
}

/**
 * POST /api/chat
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body: ChatRequestPayload = await req.json();
    const { messages = [], currentState = {} as PersonalWishes, apiKey } = body;

    const slidingWindow = messages.slice(-5);
    const masterSystemPrompt = buildMasterSystemPrompt(currentState);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const activeApiKey =
      apiKey ||
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY;

    const isGemini =
      Boolean(process.env.GEMINI_API_KEY) && !process.env.OPENAI_API_KEY;

    (async () => {
      try {
        if (!activeApiKey) {
          await runSimulatedEngine(slidingWindow, currentState, writer, encoder, startTime);
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          await writer.close();
          return;
        }

        const openai = new OpenAI({
          apiKey: activeApiKey,
          baseURL: isGemini
            ? "https://generativelanguage.googleapis.com/v1beta/openai/"
            : undefined,
        });

        const modelName = isGemini
          ? "gemini-1.5-flash"
          : process.env.OPENAI_MODEL || "gpt-4o-mini";

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

          const stream = await openai.chat.completions.create({
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

          for await (const chunk of stream) {
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
        const promptTokens = Math.max(
          40,
          Math.round(JSON.stringify(conversation).length / 3.8)
        );
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

    return new Response(readable, {
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
