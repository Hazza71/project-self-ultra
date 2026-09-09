import { importCanonical } from "../canonical/importer.js";
import { MemoryStore } from "../store/memoryStore.js";
import type { Catalog } from "../types.js";

/** Tiny fixture for engine tests. Not product taxonomy. */
export function engineFixture(): Catalog {
  return importCanonical(
    {
      schema: "psx.canonical_data.v1",
      product: { name: "PSX engine fixture" },
      invariants: [
        "canonical_structure_must_be_imported_not_reinvented",
        "achievements_never_auto_claim",
        "mastery_plus_does_not_block_platinum",
      ],
      trees: [
        {
          id: "fixture_character",
          name: "Fixture Character",
          icon: "anchor",
          legendary_trophy: "Fixture Trophy",
          priority: 0,
          categories: [
            {
              name: "Fixture Discipline",
              description: "Engine-test category",
              branches: [
                {
                  name: "Fixture Habit",
                  recommended: true,
                  achievements: [
                    {
                      title: "Show Up",
                      tier: "Bronze",
                      xp: 10,
                      req: "Log one session",
                      minReps: 1,
                    },
                    {
                      title: "Consistent",
                      tier: "Platinum",
                      xp: 50,
                      req: "Log three sessions",
                      minReps: 3,
                    },
                    {
                      title: "Mastery Path",
                      tier: "Mastery+",
                      xp: 100,
                      req: "Optional extension",
                      minReps: 5,
                    },
                    {
                      title: "Zero Rep Note",
                      tier: "Gold",
                      xp: 25,
                      req: "Write a note",
                      minReps: 0,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { enforceCounts: false },
  );
}

export function storeWithFixture(): MemoryStore {
  return new MemoryStore(engineFixture());
}

export const USER_A = "11111111-1111-4111-8111-111111111111";
export const USER_B = "22222222-2222-4222-8222-222222222222";

export function achievementByTitle(store: MemoryStore, title: string, tier?: string) {
  const found = store.catalog.achievements.find(
    (item) => item.title === title && (tier ? item.tier === tier : true),
  );
  if (!found) throw new Error(`Missing fixture achievement ${title}`);
  return found;
}
