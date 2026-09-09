import type { PulseToolName } from "./tools.js";

export interface PulseToolCall {
  name: PulseToolName | string;
  arguments: Record<string, unknown>;
}

export interface PulseToolError {
  code: string;
  message: string;
}

export interface PulseToolResult {
  ok: boolean;
  tool: string;
  data?: unknown;
  error?: PulseToolError;
  navigation?: { href: string };
}

export interface PulseTurnInput {
  userText: string;
  context?: {
    focusSummary?: string;
    seasonName?: string;
  };
}

export interface PulseTurnPlan {
  text: string;
  toolCalls: PulseToolCall[];
}

export interface PulseAdapter {
  name: "mock" | "openai";
  complete(input: PulseTurnInput): Promise<PulseTurnPlan>;
}

export interface PulseEnv {
  PSX_PULSE_ADAPTER?: string;
  EXPO_PUBLIC_PULSE_ADAPTER?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_BASE_URL?: string;
}

export const PULSE_ENV_VARS = {
  PSX_PULSE_ADAPTER: "mock | openai — local/dev defaults to mock",
  EXPO_PUBLIC_PULSE_ADAPTER: "Client adapter hint; keep mock unless a server proxies OpenAI",
  OPENAI_API_KEY: "Server-only. Never ship in the Expo app. Enables the OpenAI adapter.",
  OPENAI_MODEL: "Optional chat model (default gpt-4o-mini)",
  OPENAI_BASE_URL: "Optional OpenAI-compatible base URL (default https://api.openai.com/v1)",
} as const;
