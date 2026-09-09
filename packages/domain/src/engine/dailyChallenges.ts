import { DAILY_CHALLENGE_DEFAULT_COUNT } from "../constants.js";
import { newEntityId } from "../ids.js";
import type { DailyChallenge, FocusRecord, NorthStar, Season } from "../types.js";

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function todayUtcDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function planDailyChallenges(input: {
  userId: string;
  date: string;
  focus: FocusRecord | null;
  season: Season | null;
  northStars: NorthStar[];
  branchName: (id: string) => string;
}): Omit<DailyChallenge, "done" | "completedAt">[] {
  const candidates: { title: string; branchId?: string; northStarId?: string }[] = [];

  for (const item of input.focus?.items ?? []) {
    if (item.kind === "branch") {
      candidates.push({
        title: `One real session on ${input.branchName(item.id)}`,
        branchId: item.id,
      });
    }
  }

  for (const branchId of input.season?.status === "active" ? input.season.priorityBranchIds : []) {
    if (candidates.some((item) => item.branchId === branchId)) continue;
    candidates.push({
      title: `Keep ${input.branchName(branchId)} moving this Season`,
      branchId,
    });
  }

  for (const star of input.northStars.filter((item) => item.status === "active")) {
    candidates.push({
      title: `One step on ${star.name}`,
      northStarId: star.id,
    });
  }

  if (candidates.length === 0) {
    candidates.push({ title: "Show up once" }, { title: "Log something real" }, { title: "Protect one focus block" });
  }

  const seed = hashSeed(`${input.userId}|${input.date}`);
  const rotated = candidates
    .map((item, index) => ({ item, order: (seed + index * 17) % 997 }))
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.item);

  const picked = rotated.slice(0, DAILY_CHALLENGE_DEFAULT_COUNT);
  return picked.map((item, index) => ({
    id: newEntityId("challenge", `${input.userId}|${input.date}|${index}|${item.title}`),
    userId: input.userId,
    date: input.date,
    title: item.title,
    branchId: item.branchId,
    northStarId: item.northStarId,
  }));
}
