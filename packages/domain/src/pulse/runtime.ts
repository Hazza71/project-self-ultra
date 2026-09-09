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

export function summarisePulseTurn(turn: PulseTurnResult): string {
  const parts: string[] = [turn.text];
  for (const result of turn.results) {
    if (!result.ok && result.error) {
      parts.push(result.error.message);
      continue;
    }
    if (result.tool === "search_project" && Array.isArray(result.data)) {
      const hits = result.data as Array<{ title?: string; branch?: string }>;
      if (hits.length === 0) parts.push("No matches.");
      else {
        parts.push(
          hits
            .slice(0, 4)
            .map((hit) => `${hit.title ?? "?"} — ${hit.branch ?? ""}`)
            .join("; "),
        );
      }
    }
    if (result.tool === "create_collection_item" && result.data && typeof result.data === "object") {
      const item = result.data as { title?: string };
      if (item.title) parts.push(`Saved “${item.title}”.`);
    }
    if (result.tool === "create_north_star" && result.data && typeof result.data === "object") {
      const star = result.data as { name?: string };
      if (star.name) parts.push(`North Star “${star.name}” (0 XP from spending).`);
    }
  }
  return parts.filter(Boolean).join(" ");
}

export function createLocalPulseRuntime(store: MemoryStore, userId: string) {
  return createPulseRuntime(store, userId, createMockAdapter(store.catalog));
}
