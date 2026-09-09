import { newEntityId } from "../ids.js";
import type { LedgerEvent, LedgerEventType, Provenance } from "../types.js";

export function createLedgerEvent(input: {
  userId: string;
  eventType: LedgerEventType;
  payload?: Record<string, unknown>;
  provenance: Provenance;
  now?: string;
}): LedgerEvent {
  const createdAt = input.now ?? new Date().toISOString();
  return {
    id: newEntityId("ledger", `${input.userId}|${input.eventType}|${createdAt}|${JSON.stringify(input.payload ?? {})}`),
    userId: input.userId,
    eventType: input.eventType,
    payload: input.payload ?? {},
    provenance: input.provenance,
    createdAt,
  };
}
