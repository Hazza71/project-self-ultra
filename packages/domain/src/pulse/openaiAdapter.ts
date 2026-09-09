import { createMockAdapter } from "./mockAdapter.js";
import { pulseToolsAsOpenAI } from "./tools.js";
import type { PulseAdapter, PulseEnv, PulseTurnInput, PulseTurnPlan } from "./types.js";
import type { Catalog } from "../types.js";

const DEFAULT_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM = `You are Pulse, the intelligence layer of Project Self Ultra (PSX).
Be concise and terminal. Do not engagement-bait. Do not claim achievements.
Use the provided typed tools for navigation, search, logging, Collections, North Stars, Focus/Season, and Compass.
Never invent a Claim. Ready-to-Claim is not Claimed. Critical rules live in application code.`;

/**
 * OpenAI-compatible adapter. Requires OPENAI_API_KEY (server-only).
 * If the key is missing this factory throws — callers should use the mock adapter.
 */
export function createOpenAIAdapter(env: PulseEnv = process.env as PulseEnv): PulseAdapter {
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Use PSX_PULSE_ADAPTER=mock for local/dev, or set OPENAI_API_KEY on a server. Do not put the key in Expo public env.",
    );
  }
  const baseUrl = env.OPENAI_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE;
  const model = env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  return {
    name: "openai",
    async complete(input: PulseTurnInput): Promise<PulseTurnPlan> {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM },
      ];
      if (input.context?.focusSummary) {
        messages.push({ role: "system", content: `Focus: ${input.context.focusSummary}` });
      }
      if (input.context?.seasonName) {
        messages.push({ role: "system", content: `Season: ${input.context.seasonName}` });
      }
      messages.push({ role: "user", content: input.userText });

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages,
          tools: pulseToolsAsOpenAI(),
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI Pulse adapter failed (${response.status}): ${body.slice(0, 400)}`);
      }
      const json = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string | null;
            tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>;
          };
        }>;
      };
      const message = json.choices?.[0]?.message;
      const toolCalls = (message?.tool_calls ?? []).flatMap((call) => {
        const name = call.function?.name;
        if (!name) return [];
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function?.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        return [{ name, arguments: args }];
      });
      return {
        text: (message?.content ?? "").trim() || "Working.",
        toolCalls,
      };
    },
  };
}

export function resolvePulseAdapterMode(env: PulseEnv = process.env as PulseEnv): "mock" | "openai" {
  const mode = (env.PSX_PULSE_ADAPTER || env.EXPO_PUBLIC_PULSE_ADAPTER || "mock").toLowerCase();
  return mode === "openai" ? "openai" : "mock";
}

export function createPulseAdapter(env: PulseEnv = process.env as PulseEnv, catalog?: Catalog): PulseAdapter {
  if (resolvePulseAdapterMode(env) === "openai") {
    return createOpenAIAdapter(env);
  }
  return createMockAdapter(catalog);
}
