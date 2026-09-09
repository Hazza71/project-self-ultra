import { describe, expect, it } from "vitest";
import { achievementByTitle, storeWithFixture, USER_A } from "./helpers.js";

describe("Ready-to-Claim is not Claimed", () => {
  it("eligibility moves to ready_to_claim without writing a claim", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    const progress = store.getProgress(USER_A, bronze.id);
    expect(progress.state).toBe("ready_to_claim");
    expect(progress.claimedAt).toBeNull();
    expect(store.listClaims(USER_A)).toEqual([]);
    expect(store.overall(USER_A).ready).toBeGreaterThan(0);
    expect(store.overall(USER_A).claimed).toBe(0);
  });

  it("verified is still not claimed", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    store.verify(USER_A, bronze.id);
    expect(store.getProgress(USER_A, bronze.id).state).toBe("verified");
    expect(store.listClaims(USER_A)).toEqual([]);
  });
});
