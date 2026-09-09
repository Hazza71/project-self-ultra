import type { MemoryStore } from "../store/memoryStore.js";
import { createMockAdapter } from "./mockAdapter.js";
import { createPulseAdapter } from "./openaiAdapter.js";
import { executePulseTools } from "./execute.js";
import type { PulseAdapter, PulseEnv, PulseTurnInput } from "./types.js";
import type { PulseToolResult } from "./types.js";

export interface PulseTurnResult {
  adapter: PulseAdapter["name"];
  text: string;
  toolCalls: { name: string; arguments: Record<string, unknown> }[];
  results: PulseToolResult[];
  navigation?: { href: string };
}

export function createPulseRuntime(
  store: MemoryStore,
  userId: string,
  adapter?: PulseAdapter,
  env?: PulseEnv,
) {
  const resolved = adapter ?? createPulseAdapter(env ?? (process.env as PulseEnv), store.catalog);
  return {
    adapter: resolved,
    async turn(input: PulseTurnInput | string): Promise<PulseTurnResult> {
      const payload: PulseTurnInput = typeof input === "string" ? { userText: input } : input;
      const plan = await resolved.complete(payload);
      const results = executePulseTools(store, userId, plan.toolCalls);
      const navigation = results.find((item) => item.navigation)?.navigation;
      return {
        adapter: resolved.name,
        text: plan.text,
        toolCalls: plan.toolCalls,
        results,
        navigation,
      };
    },
  };
}

export function createLocalPulseRuntime(store: MemoryStore, userId: string) {
  return createPulseRuntime(store, userId, createMockAdapter(store.catalog));
}
