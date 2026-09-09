import { describe, expect, it } from "vitest";
import { xpFromNorthStarEvent } from "../engine/northStars.js";
import { branchByName, storeWithPhase2, USER_A } from "./helpers.js";

describe("North Stars", () => {
  it("stores concrete targets, deadlines, linked Branches, and progress history", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const star = store.createNorthStar(USER_A, {
      name: "5k under 25",
      type: "race",
      currentValue: 28,
      targetValue: 25,
      unit: "minutes",
      deadline: "2026-12-01T00:00:00.000Z",
      reason: "Feel capable on the road",
      linkedBranchIds: [habit.id],
    });
    expect(star.linkedBranchIds).toEqual([habit.id]);
    expect(star.history).toHaveLength(1);

    const moved = store.recordNorthStarProgress(USER_A, star.id, {
      value: 26.4,
      note: "tempo run",
      source: "manual",
    });
    expect(moved.currentValue).toBe(26.4);
    expect(moved.history.at(-1)?.xpGranted).toBe(0);
    expect(moved.status).toBe("active");
  });

  it("never grants XP from buying or spending", () => {
    const store = storeWithPhase2();
    const before = store.overall(USER_A).xpClaimed;
    const star = store.createNorthStar(USER_A, {
      name: "Emergency fund",
      type: "savings",
      currentValue: 0,
      targetValue: 5000,
      unit: "GBP",
    });
    store.recordNorthStarProgress(USER_A, star.id, {
      value: 1200,
      note: "bought nothing; transferred cash",
      source: "spend",
    });
    expect(xpFromNorthStarEvent("spend")).toBe(0);
    expect(store.overall(USER_A).xpClaimed).toBe(before);
    expect(store.listClaims(USER_A)).toEqual([]);
    const events = store.listLedger(USER_A).filter((item) => item.eventType === "north_star_progress");
    expect(events.every((item) => item.payload.xpGranted === 0)).toBe(true);
  });
});
