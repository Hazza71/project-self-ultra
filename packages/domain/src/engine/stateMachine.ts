import { ACHIEVEMENT_STATES } from "../constants.js";
import type { AchievementState } from "../types.js";
import { ClaimNotAllowedError } from "../errors.js";

const ORDER: Record<AchievementState, number> = {
  locked: 0,
  in_progress: 1,
  ready_to_claim: 2,
  verified: 3,
  claimed: 4,
};

export function canTransition(from: AchievementState, to: AchievementState): boolean {
  if (from === to) return true;
  if (from === "claimed") return false;
  if (from === "locked" && to === "in_progress") return true;
  if (from === "in_progress" && to === "ready_to_claim") return true;
  if (from === "ready_to_claim" && (to === "verified" || to === "claimed")) return true;
  if (from === "verified" && to === "claimed") return true;
  return false;
}

export function assertTransition(from: AchievementState, to: AchievementState): void {
  if (!canTransition(from, to)) {
    throw new ClaimNotAllowedError(`Illegal state transition ${from} → ${to}`);
  }
}

export function isClaimableState(state: AchievementState): boolean {
  return state === "ready_to_claim" || state === "verified";
}

export function isTerminal(state: AchievementState): boolean {
  return state === "claimed";
}

export function stateRank(state: AchievementState): number {
  return ORDER[state] ?? 0;
}

export { ACHIEVEMENT_STATES };
