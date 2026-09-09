import { SEASON_MAX_WEEKS, SEASON_MIN_WEEKS, SEASON_STATES } from "../constants.js";
import { DomainRuleError } from "../errors.js";
import type { Season, SeasonState } from "../types.js";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function isSeasonState(value: string): value is SeasonState {
  return (SEASON_STATES as readonly string[]).includes(value);
}

export function seasonLengthWeeks(startsAt: string, endsAt: string): number {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new DomainRuleError("invalid_season_dates", "Season needs a start date before its end date.");
  }
  return (end - start) / MS_PER_WEEK;
}

export function assertSeasonLength(startsAt: string, endsAt: string): number {
  const weeks = seasonLengthWeeks(startsAt, endsAt);
  if (weeks < SEASON_MIN_WEEKS || weeks > SEASON_MAX_WEEKS) {
    throw new DomainRuleError(
      "invalid_season_length",
      `Seasons last ${SEASON_MIN_WEEKS}–${SEASON_MAX_WEEKS} weeks (got ${weeks.toFixed(1)}).`,
    );
  }
  return weeks;
}

/**
 * Completing a Season never grants XP. Achievements claimed during it
 * already carry their own XP; there is no "Season completed" bonus.
 */
export function seasonCompletionXp(_season?: Season): 0 {
  return 0;
}

export function recommendedPriorityCount(count: number): { ok: boolean; note: string } {
  if (count >= 2 && count <= 4) {
    return { ok: true, note: "2–4 priorities is the normal Season recommendation." };
  }
  return {
    ok: false,
    note: "2–4 Season priorities is the usual range — not a hard lock. Attention Budget may flag overload.",
  };
}
