import { describe, expect, it } from "vitest";
import { AutoClaimForbiddenError } from "../errors.js";
import { executePulseTool, executePulseTools } from "../pulse/execute.js";
import { createLocalPulseRuntime } from "../pulse/runtime.js";
import { createOpenAIAdapter, resolvePulseAdapterMode } from "../pulse/openaiAdapter.js";
import { ALLOWED_PULSE_TOOLS, FORBIDDEN_PULSE_TOOLS } from "../pulse/tools.js";
import { achievementByTitle, branchByName, storeWithPhase2, USER_A } from "./helpers.js";

describe("Pulse tools cannot auto-claim", () => {
  it("rejects claim_achievement and leaves state Ready to Claim", () => {
    const store = storeWithPhase2();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, bronze.id).state).toBe("ready_to_claim");

    const results = executePulseTools(store, USER_A, [
      { name: "claim_achievement", arguments: { achievementId: bronze.id } },
    ]);
    expect(results[0]?.ok).toBe(false);
    expect(results[0]?.error?.code).toBe("auto_claim_forbidden");
    expect(store.getProgress(USER_A, bronze.id).state).toBe("ready_to_claim");
    expect(store.listClaims(USER_A)).toEqual([]);
    expect(store.listLedger(USER_A).some((item) => item.eventType === "pulse_claim_rejected")).toBe(true);
  });

  it("explains Ready-to-Claim without claiming", () => {
    const store = storeWithPhase2();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    const result = executePulseTool(store, USER_A, {
      name: "explain_ready_to_claim",
      arguments: { achievementId: bronze.id },
    });
    expect(result.ok).toBe(true);
    const data = result.data as { canPulseClaim: boolean; readyToClaim: boolean };
    expect(data.canPulseClaim).toBe(false);
    expect(data.readyToClaim).toBe(true);
    expect(store.getProgress(USER_A, bronze.id).state).not.toBe("claimed");
  });

  it("mock adapter maps 'claim' language to the forbidden tool", async () => {
    const store = storeWithPhase2();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    const runtime = createLocalPulseRuntime(store, USER_A);
    const turn = await runtime.turn(`claim ${bronze.title}`);
    expect(turn.toolCalls.some((call) => call.name === "claim_achievement")).toBe(true);
    expect(turn.results.some((item) => item.error?.code === "auto_claim_forbidden")).toBe(true);
    expect(store.listClaims(USER_A)).toEqual([]);
  });

  it("can manage collections and north stars through typed tools", async () => {
    const store = storeWithPhase2();
    const piano = branchByName(store, "Piano");
    const created = executePulseTool(store, USER_A, {
      name: "create_collection_item",
      arguments: { branchId: piano.id, title: "Moonlight Sonata", state: "saved" },
    });
    expect(created.ok).toBe(true);
    expect(store.listCollections(USER_A, piano.id)).toHaveLength(1);

    const star = executePulseTool(store, USER_A, {
      name: "create_north_star",
      arguments: { name: "Learn the piece", targetValue: 1, currentValue: 0, unit: "piece" },
    });
    expect(star.ok).toBe(true);
    expect(store.listNorthStars(USER_A)).toHaveLength(1);
  });

  it("keeps claim out of the allowed OpenAI tool list and requires a key for that adapter", () => {
    expect(FORBIDDEN_PULSE_TOOLS).toContain("claim_achievement");
    expect(ALLOWED_PULSE_TOOLS.some((tool) => tool.name === "claim_achievement")).toBe(false);
    expect(resolvePulseAdapterMode({})).toBe("mock");
    expect(() => createOpenAIAdapter({})).toThrow(/OPENAI_API_KEY/);
    expect(() => {
      throw new AutoClaimForbiddenError();
    }).toThrow(AutoClaimForbiddenError);
  });
});
