import { describe, expect, it } from "vitest";
import { achievementByTitle, branchByName, storeWithPhase2, USER_A, weeksFromNow } from "./helpers.js";

describe("Compass", () => {
  it("weights Focus and Season and never dictates a claim", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const piano = branchByName(store, "Piano");
    store.setFocus(USER_A, [{ kind: "branch", id: habit.id, load: "high" }]);
    store.createSeason(USER_A, {
      name: "Now",
      startsAt: new Date().toISOString(),
      endsAt: weeksFromNow(8),
      priorityBranchIds: [habit.id, piano.id],
    });
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, { incrementReps: 1 }, { source: "manual", actor: "user" });

    const suggestions = store.compass(USER_A);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((item) => item.reason.includes("Pulse will not claim"))).toBe(true);
    expect(store.listClaims(USER_A)).toEqual([]);
  });
});
