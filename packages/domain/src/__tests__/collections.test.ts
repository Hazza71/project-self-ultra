import { describe, expect, it } from "vitest";
import { DomainRuleError } from "../errors.js";
import {
  collectionKindForBranch,
  collectionStateLabel,
  formatCollectionCounts,
} from "../engine/collections.js";
import { branchByName, storeWithPhase2, USER_A, USER_B } from "./helpers.js";

describe("Collections CRUD and state", () => {
  it("creates items on any Branch with universal states and domain labels", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const piano = branchByName(store, "Piano");
    expect(collectionKindForBranch(store.catalog, piano.id)).toBe("repertoire");
    expect(collectionKindForBranch(store.catalog, habit.id)).toBe("default");
    expect(collectionStateLabel("competent", "repertoire")).toBe("Performance Ready");
    expect(collectionStateLabel("competent", "default")).toBe("Competent");

    const dish = store.createCollectionItem(USER_A, {
      branchId: habit.id,
      title: "Sourdough loaf",
      state: "planned",
    });
    expect(dish.type).toBe("item");
    expect(dish.repertoire).toBeUndefined();
    expect(dish.state).toBe("planned");

    const song = store.createCollectionItem(USER_A, {
      branchId: piano.id,
      title: "Clair de Lune",
      repertoire: { arrangement: "Debussy", tempoBpm: 60, fromMemory: false, usesSheetOrTab: true },
    });
    expect(song.type).toBe("repertoire");
    expect(song.repertoire?.arrangement).toBe("Debussy");
    expect(song.state).toBe("saved");

    store.updateCollectionItem(USER_A, song.id, { state: "planned" });
    store.updateCollectionItem(USER_A, song.id, { state: "active" });
    const ready = store.updateCollectionItem(USER_A, song.id, { state: "competent" });
    expect(ready.state).toBe("competent");
    expect(collectionStateLabel(ready.state, "repertoire")).toBe("Performance Ready");

    const counts = store.collectionCounts(USER_A, piano.id);
    expect(counts.total).toBe(1);
    expect(counts.competent).toBe(1);
    expect(formatCollectionCounts(counts, "repertoire")).toContain("Performance Ready");
  });

  it("rejects illegal collection transitions and does not create claims", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    const item = store.createCollectionItem(USER_A, { branchId: habit.id, title: "Project" });
    expect(() => store.updateCollectionItem(USER_A, item.id, { state: "completed" })).toThrow(DomainRuleError);
    expect(store.listClaims(USER_A)).toEqual([]);
    expect(store.overall(USER_A).xpClaimed).toBe(0);
  });

  it("isolates collections per user", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    store.createCollectionItem(USER_A, { branchId: habit.id, title: "A only" });
    expect(store.listCollections(USER_B)).toEqual([]);
    expect(store.listCollections(USER_A)).toHaveLength(1);
  });

  it("snapshots and restores collection items", () => {
    const store = storeWithPhase2();
    const habit = branchByName(store, "Fixture Habit");
    store.createCollectionItem(USER_A, { branchId: habit.id, title: "Kept" });
    const snap = store.snapshot(USER_A);
    const other = storeWithPhase2();
    other.restore(snap);
    expect(other.listCollections(USER_A).map((item) => item.title)).toEqual(["Kept"]);
  });
});
