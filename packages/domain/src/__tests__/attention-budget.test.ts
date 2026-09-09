import { describe, expect, it } from "vitest";
import { ATTENTION_BUDGET_HIGH_LOAD_LIMIT } from "../constants.js";
import { branchByName, storeWithPhase2, USER_A, weeksFromNow } from "./helpers.js";

describe("Attention Budget", () => {
  it("flags overload when too many high-load goals are active", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const strength = branchByName(store, "Fixture Strength");
    const piano = branchByName(store, "Piano");

    expect(store.attentionBudget(USER_A).overloaded).toBe(false);

    for (let i = 0; i < 5; i += 1) {
      store.createNorthStar(USER_A, {
        name: `Goal ${i}`,
        targetValue: 10,
        currentValue: 0,
        status: "active",
      });
    }
    const budget = store.attentionBudget(USER_A);
    expect(budget.highLoadGoalCount).toBeGreaterThan(ATTENTION_BUDGET_HIGH_LOAD_LIMIT);
    expect(budget.overloaded).toBe(true);
    expect(budget.suggestion).toMatch(/high-load/);

    const flagged = store.listLedger(USER_A).filter((item) => item.eventType === "attention_budget_flagged");
    expect(flagged.length).toBeGreaterThan(0);

    store.setFocus(USER_A, [
      { kind: "branch", id: habit.id, load: "high" },
      { kind: "branch", id: strength.id, load: "high" },
      { kind: "branch", id: piano.id, load: "high" },
    ]);
    const now = new Date();
    store.createSeason(USER_A, {
      name: "Overloaded season",
      startsAt: now.toISOString(),
      endsAt: weeksFromNow(8, now),
      priorityBranchIds: [habit.id, strength.id, piano.id],
    });
    expect(store.attentionBudget(USER_A).overloaded).toBe(true);
  });
});
