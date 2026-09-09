import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NO_AUTO_CLAIM_SQL_INVARIANTS } from "../rls/policies.js";
import { storeWithFixture, USER_A, USER_B, achievementByTitle } from "./helpers.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("user isolation", () => {
  it("progress and claims are per-user", () => {
    const store = storeWithFixture();
    const bronze = achievementByTitle(store, "Show Up", "Bronze");
    store.logEvidence(USER_A, bronze.id, {}, { source: "manual", actor: "user" });
    store.claim(USER_A, bronze.id, {
      explicitUserAction: true,
      actor: "user",
      source: "atlas",
    });

    expect(store.getProgress(USER_A, bronze.id).state).toBe("claimed");
    expect(store.getProgress(USER_B, bronze.id).state).toBe("locked");
    expect(store.listClaims(USER_B)).toEqual([]);
    expect(store.listProgress(USER_B)).toEqual([]);
    expect(store.snapshot(USER_B).claims).toEqual([]);
    expect(store.snapshot(USER_A).claims).toHaveLength(1);
  });

  it("SQL policies encode auth.uid isolation and no-auto-claim checks", () => {
    const sql = readFileSync(resolve(repoRoot, "supabase/migrations/20260909120000_init.sql"), "utf8");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("auth.uid()");
    for (const snippet of NO_AUTO_CLAIM_SQL_INVARIANTS) {
      expect(sql).toContain(snippet);
    }
    expect(sql).toContain("user_progress");
    expect(sql).toContain("ledger_events");
    expect(sql).toContain("claims");
  });
});
