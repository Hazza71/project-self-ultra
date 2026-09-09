import { describe, expect, it } from "vitest";
import { DomainRuleError } from "../errors.js";
import { seasonCompletionXp } from "../engine/seasons.js";
import { achievementByTitle, branchByName, storeWithPhase2, USER_A, weeksFromNow } from "./helpers.js";

describe("Seasons do not grant fake XP", () => {
  it("rejects seasons outside 6–12 weeks and grants 0 XP on completion", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const now = new Date();
    expect(() =>
      store.createSeason(USER_A, {
        name: "Too short",
        startsAt: now.toISOString(),
        endsAt: weeksFromNow(3, now),
        priorityBranchIds: [habit.id],
      }),
    ).toThrow(DomainRuleError);

    const season = store.createSeason(USER_A, {
      name: "Autumn block",
      startsAt: now.toISOString(),
      endsAt: weeksFromNow(8, now),
      priorityBranchIds: [habit.id],
    });
    const xpBefore = store.overall(USER_A).xpClaimed;
    const done = store.completeSeason(USER_A, season.id, {
      intention: "Build the habit",
      actual: "Logged twice",
    });
    expect(done.xpGranted).toBe(0);
    expect(seasonCompletionXp(done.season)).toBe(0);
    expect(store.overall(USER_A).xpClaimed).toBe(xpBefore);
    expect(store.listClaims(USER_A)).toEqual([]);
  });

  it("keeps non-focus skills loggable during a Season", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const strength = branchByName(store, "Fixture Strength");
    const now = new Date();
    store.createSeason(USER_A, {
      name: "Habit season",
      startsAt: now.toISOString(),
      endsAt: weeksFromNow(8, now),
      priorityBranchIds: [habit.id],
    });
    store.setFocus(USER_A, [{ kind: "branch", id: habit.id, load: "high" }]);
    const lift = achievementByTitle(store, "Lift", "Bronze");
    expect(lift.branchId).toBe(strength.id);
    store.logEvidence(USER_A, lift.id, { incrementReps: 1 }, { source: "manual", actor: "user" });
    expect(store.getProgress(USER_A, lift.id).state).toBe("ready_to_claim");
    expect(store.getProgress(USER_A, lift.id).state).not.toBe("claimed");
  });
});
