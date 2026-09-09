import { describe, expect, it } from "vitest";
import { isEligible } from "../engine/eligibility.js";
import { achievementByTitle, storeWithFixture, USER_A } from "./helpers.js";

describe("deterministic eligibility", () => {
  it("requires minReps before Ready to Claim", () => {
    const store = storeWithFixture();
    const platinum = achievementByTitle(store, "Consistent", "Platinum");
    store.start(USER_A, platinum.id);
    store.logEvidence(USER_A, platinum.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, platinum.id).state).toBe("in_progress");
    store.logEvidence(USER_A, platinum.id, { incrementReps: 2 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, platinum.id).reps).toBe(3);
    expect(store.getProgress(USER_A, platinum.id).state).toBe("ready_to_claim");
  });

  it("zero minReps still requires user evidence, not mere existence", () => {
    const store = storeWithFixture();
    const gold = achievementByTitle(store, "Zero Rep Note", "Gold");
    const locked = store.getProgress(USER_A, gold.id);
    expect(isEligible(gold, locked, 0)).toBe(false);
    store.start(USER_A, gold.id);
    const started = store.getProgress(USER_A, gold.id);
    expect(isEligible(gold, started, 0)).toBe(false);
    store.logEvidence(USER_A, gold.id, { incrementReps: 0 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, gold.id).state).toBe("ready_to_claim");
  });

  it("the same inputs always produce the same eligibility", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    const a = isEligible(bronze, store.getProgress(USER_A, bronze.id), 0);
    const b = isEligible(bronze, store.getProgress(USER_A, bronze.id), 0);
    expect(a).toBe(false);
    expect(a).toBe(b);
  });
});
