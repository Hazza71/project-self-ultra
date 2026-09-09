import { describe, expect, it } from "vitest";
import { AutoClaimForbiddenError, ClaimNotAllowedError } from "../errors.js";
import { achievementByTitle, storeWithFixture, USER_A } from "./helpers.js";

describe("Claim requires explicit user action", () => {
  it("claims only via atlas/manual user action", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    const claim = store.claim(USER_A, bronze.id, {
      explicitUserAction: true,
      actor: "user",
      source: "atlas",
    });
    expect(claim.explicitUserAction).toBe(true);
    expect(claim.actor).toBe("user");
    expect(store.getProgress(USER_A, bronze.id).state).toBe("claimed");
    expect(store.listLedger(USER_A).some((event) => event.eventType === "claimed")).toBe(true);
  });

  it("rejects Pulse as actor even with explicitUserAction true", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    expect(() =>
      store.claim(USER_A, bronze.id, {
        explicitUserAction: true,
        actor: "pulse",
        source: "atlas",
      } as never),
    ).toThrow(AutoClaimForbiddenError);
  });

  it("cannot claim from locked or in_progress", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    expect(() =>
      store.claim(USER_A, bronze.id, {
        explicitUserAction: true,
        actor: "user",
        source: "atlas",
      }),
    ).toThrow(ClaimNotAllowedError);
    store.start(USER_A, bronze.id);
    expect(() =>
      store.claim(USER_A, bronze.id, {
        explicitUserAction: true,
        actor: "user",
        source: "manual",
      }),
    ).toThrow(ClaimNotAllowedError);
  });
});
