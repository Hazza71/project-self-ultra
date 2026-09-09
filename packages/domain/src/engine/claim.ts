import { CLAIM_ACTOR_USER, CLAIM_SOURCES, FORBIDDEN_CLAIM_SOURCES } from "../constants.js";
import { AutoClaimForbiddenError, ClaimNotAllowedError } from "../errors.js";
import type { AchievementState, ClaimSource, ExplicitClaimInput, Provenance } from "../types.js";
import { isClaimableState } from "./stateMachine.js";

function isClaimSource(value: string): value is ClaimSource {
  return (CLAIM_SOURCES as readonly string[]).includes(value);
}

export function assertExplicitUserClaim(input: {
  explicitUserAction?: unknown;
  actor?: unknown;
  source?: unknown;
  provenance?: Provenance;
}): asserts input is ExplicitClaimInput {
  if (input.explicitUserAction !== true) {
    throw new AutoClaimForbiddenError(
      "Claim requires explicitUserAction: true. Achievements are never auto-claimed.",
    );
  }
  if (input.actor !== CLAIM_ACTOR_USER) {
    throw new AutoClaimForbiddenError(
      `Claim actor must be "user" (received "${String(input.actor)}"). Pulse, imports, and wearables cannot claim.`,
    );
  }
  if (typeof input.source !== "string" || !isClaimSource(input.source)) {
    throw new AutoClaimForbiddenError(
      `Claim source must be atlas or manual (received "${String(input.source)}").`,
    );
  }
  if (input.provenance) {
    const src = input.provenance.source;
    const actor = input.provenance.actor;
    if ((FORBIDDEN_CLAIM_SOURCES as readonly string[]).includes(src) || actor !== "user") {
      throw new AutoClaimForbiddenError(
        `Provenance ${actor}/${src} is not allowed to claim achievements.`,
      );
    }
  }
}

export function assertCanClaim(state: AchievementState): void {
  if (state === "claimed") {
    throw new ClaimNotAllowedError("Achievement is already claimed.");
  }
  if (!isClaimableState(state)) {
    throw new ClaimNotAllowedError(
      `Cannot claim from state "${state}". Achievement must be Ready to Claim (or Verified). Ready-to-Claim is not Claimed.`,
    );
  }
}

export function isAutoClaimAttempt(input: {
  explicitUserAction?: unknown;
  actor?: unknown;
  source?: unknown;
}): boolean {
  try {
    assertExplicitUserClaim(input as ExplicitClaimInput);
    return false;
  } catch (error) {
    if (error instanceof AutoClaimForbiddenError) return true;
    throw error;
  }
}
