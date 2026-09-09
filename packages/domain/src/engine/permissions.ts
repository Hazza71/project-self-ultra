import { AutoClaimForbiddenError } from "../errors.js";
import type { CatalogAchievement } from "../types.js";
import { isEligible } from "./eligibility.js";
import type { MemoryStore } from "../store/memoryStore.js";

export type PulsePermissionTier = "none" | "suggest" | "full";

/**
 * Pulse (and any permission tier) may evaluate eligibility and suggest
 * Ready-to-Claim items. It MUST NOT claim.
 */
export function simulatePulsePermission(
  store: MemoryStore,
  userId: string,
  tier: PulsePermissionTier,
): { suggested: CatalogAchievement[]; claimedAttempted: number; claimedSucceeded: number } {
  if (tier === "none") {
    return { suggested: [], claimedAttempted: 0, claimedSucceeded: 0 };
  }

  const suggested: CatalogAchievement[] = [];
  for (const achievement of store.catalog.achievements) {
    const progress = store.getProgress(userId, achievement.id);
    const evidenceCount = store.listEvidence(userId, achievement.id).length;
    if (isEligible(achievement, progress, evidenceCount)) {
      store.markReadyIfEligible(userId, achievement.id, {
        source: "pulse_stub",
        actor: "pulse",
        permissionTier: tier,
      });
      suggested.push(achievement);
    }
  }

  let claimedAttempted = 0;
  let claimedSucceeded = 0;
  if (tier === "full") {
    for (const achievement of suggested) {
      claimedAttempted += 1;
      try {
        store.claim(userId, achievement.id, {
          explicitUserAction: true,
          actor: "pulse",
          source: "pulse",
        } as never);
        claimedSucceeded += 1;
      } catch (error) {
        if (!(error instanceof AutoClaimForbiddenError)) throw error;
      }
    }
  }

  return { suggested, claimedAttempted, claimedSucceeded };
}

export function simulateImportSideEffects(store: MemoryStore, userId: string): void {
  for (const achievement of store.catalog.achievements) {
    try {
      store.claim(userId, achievement.id, {
        explicitUserAction: false,
        actor: "import",
        source: "import",
      } as never);
    } catch (error) {
      if (!(error instanceof AutoClaimForbiddenError)) throw error;
    }
  }
}

export function simulateWearableAutoComplete(store: MemoryStore, userId: string): void {
  for (const achievement of store.catalog.achievements) {
    try {
      store.claim(userId, achievement.id, {
        explicitUserAction: true,
        actor: "wearable",
        source: "wearable",
      } as never);
    } catch (error) {
      if (!(error instanceof AutoClaimForbiddenError)) throw error;
    }
  }
}
