import { describe, expect, it } from "vitest";
import { mintAchievementId, mintBranchId, mintCategoryId } from "../ids.js";
import { importCanonical } from "../canonical/importer.js";
import { engineFixture } from "./helpers.js";

describe("stable IDs across re-import", () => {
  it("mints deterministic hashes from path", () => {
    const a = mintCategoryId("character", "Integrity");
    const b = mintCategoryId("character", "Integrity");
    const c = mintCategoryId("character", "Integrity ");
    expect(a).toBe(b);
    expect(a).toBe(c);
    expect(a.startsWith("category_")).toBe(true);
    expect(mintBranchId("character", "Integrity", "Honesty")).toMatch(/^branch_/);
    expect(
      mintAchievementId("character", "Integrity", "Honesty", "First Truth", "Bronze"),
    ).toMatch(/^achievement_/);
  });

  it("re-import of the same payload yields identical ids", () => {
    const first = engineFixture();
    const second = importCanonical(
      {
        schema: "psx.canonical_data.v1",
        trees: [
          {
            id: first.trees[0]!.id,
            name: first.trees[0]!.name,
            icon: first.trees[0]!.icon,
            legendary_trophy: first.trees[0]!.legendaryTrophy,
            priority: first.trees[0]!.priority,
            categories: [
              {
                name: first.categories[0]!.name,
                description: first.categories[0]!.description,
                branches: [
                  {
                    name: first.branches[0]!.name,
                    recommended: first.branches[0]!.recommended,
                    achievements: first.achievements.map((item) => ({
                      title: item.title,
                      tier: item.tier,
                      xp: item.xp,
                      req: item.req,
                      minReps: item.minReps,
                    })),
                  },
                ],
              },
            ],
          },
        ],
      },
      { enforceCounts: false },
    );
    expect(second.categories.map((item) => item.id)).toEqual(first.categories.map((item) => item.id));
    expect(second.branches.map((item) => item.id)).toEqual(first.branches.map((item) => item.id));
    expect(second.achievements.map((item) => item.id)).toEqual(
      first.achievements.map((item) => item.id),
    );
  });

  it("whitespace-normalized paths stay stable", () => {
    expect(mintAchievementId("a", "b", "c", "Title", "Gold")).toBe(
      mintAchievementId(" a ", "  b", "c  ", " Title ", "Gold"),
    );
  });
});
