import { isEligible } from "./eligibility.js";
import { isClaimableState } from "./stateMachine.js";
import type { Catalog, CatalogAchievement, ReadyToClaimExplanation, UserAchievementProgress } from "../types.js";

export function explainReadyToClaim(input: {
  achievement: CatalogAchievement;
  progress: UserAchievementProgress;
  evidenceCount: number;
}): ReadyToClaimExplanation {
  const eligible = isEligible(input.achievement, input.progress, input.evidenceCount);
  const readyToClaim = isClaimableState(input.progress.state);
  const claimed = input.progress.state === "claimed";
  const missing: string[] = [];
  if (input.progress.state === "locked") missing.push("Start the achievement in Atlas.");
  if (input.achievement.minReps > 0 && input.progress.reps < input.achievement.minReps) {
    missing.push(`Need ${input.achievement.minReps - input.progress.reps} more logged rep(s).`);
  }
  if (input.achievement.minReps === 0 && input.evidenceCount < 1 && !eligible) {
    missing.push("Log evidence that the requirement is met.");
  }
  if (eligible && !readyToClaim && !claimed) {
    missing.push("Eligibility is met but state is not Ready to Claim yet — re-evaluate in Atlas.");
  }

  let nextStep = "Keep logging real evidence. Pulse cannot Claim.";
  if (claimed) nextStep = "Already claimed. Ready-to-Claim is not Claimed — this one is done.";
  else if (readyToClaim) nextStep = "Open Atlas and tap Claim yourself. Pulse will never auto-claim.";
  else if (missing.length > 0) nextStep = missing[0] ?? nextStep;

  return {
    achievementId: input.achievement.id,
    title: input.achievement.title,
    state: input.progress.state,
    eligible,
    readyToClaim,
    claimed,
    missing,
    canPulseClaim: false,
    nextStep,
  };
}

export function findAchievement(catalog: Catalog, achievementId: string): CatalogAchievement | undefined {
  return catalog.achievements.find((item) => item.id === achievementId);
}
