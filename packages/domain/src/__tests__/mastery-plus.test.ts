import { describe, expect, it } from "vitest";
import { isMasteryPlusTier, isPlatinumTier, masteryPlusBlocksPlatinum } from "../engine/eligibility.js";
import { achievementByTitle, storeWithFixture, USER_A } from "./helpers.js";

describe("Mastery+ does not block platinum", () => {
  it("helper is a hard false", () => {
    expect(masteryPlusBlocksPlatinum()).toBe(false);
  });

  it("platinum remains independently claimable after Mastery+ is claimed", () => {
    const store = storeWithFixture();
    const mastery = achievementByTitle(store, "Mastery Path", "Mastery+");
    const platinum = achievementByTitle(store, "Consistent", "Platinum");
    expect(isMasteryPlusTier(mastery.tier)).toBe(true);
    expect(isPlatinumTier(platinum.tier)).toBe(true);

    store.logEvidence(USER_A, mastery.id, { incrementReps: 5 }, { source: "manual", actor: "user" });
    store.claim(USER_A, mastery.id, {
      explicitUserAction: true,
      actor: "user",
      source: "atlas",
    });
    expect(store.getProgress(USER_A, mastery.id).state).toBe("claimed");
    expect(store.getProgress(USER_A, platinum.id).state).toBe("locked");

    store.logEvidence(USER_A, platinum.id, { incrementReps: 3 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, platinum.id).state).toBe("ready_to_claim");
    store.claim(USER_A, platinum.id, {
      explicitUserAction: true,
      actor: "user",
      source: "manual",
    });
    expect(store.getProgress(USER_A, platinum.id).state).toBe("claimed");
  });
});
