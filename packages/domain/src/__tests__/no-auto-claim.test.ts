import { describe, expect, it } from "vitest";
import { AutoClaimForbiddenError } from "../errors.js";
import {
  simulateImportSideEffects,
  simulatePulsePermission,
  simulateWearableAutoComplete,
} from "../engine/permissions.js";
import { achievementByTitle, storeWithFixture, USER_A } from "./helpers.js";

describe("no auto-claim", () => {
  it("import never creates claims", () => {
    const store = storeWithFixture();
    expect(store.listClaims(USER_A)).toEqual([]);
    for (const achievement of store.catalog.achievements) {
      expect(store.getProgress(USER_A, achievement.id).state).toBe("locked");
    }
    simulateImportSideEffects(store, USER_A);
    expect(store.listClaims(USER_A)).toEqual([]);
  });

  it("Pulse full-permission simulation cannot claim", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, bronze.id).state).toBe("ready_to_claim");

    const result = simulatePulsePermission(store, USER_A, "full");
    expect(result.claimedAttempted).toBeGreaterThan(0);
    expect(result.claimedSucceeded).toBe(0);
    expect(store.getProgress(USER_A, bronze.id).state).toBe("ready_to_claim");
    expect(store.listClaims(USER_A)).toEqual([]);
  });

  it("wearable / health simulation cannot claim", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    simulateWearableAutoComplete(store, USER_A);
    expect(store.getProgress(USER_A, bronze.id).state).not.toBe("claimed");
    expect(store.listClaims(USER_A)).toHaveLength(0);
  });

  it("rejects claim payloads that omit explicitUserAction", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    expect(() =>
      store.claim(USER_A, bronze.id, { actor: "user", source: "atlas" } as never),
    ).toThrow(AutoClaimForbiddenError);
  });
});
