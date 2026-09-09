import type {
  Catalog,
  OverallRollup,
  TreeRollup,
  UserAchievementProgress,
} from "../types.js";

function percent(claimed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((claimed / total) * 100);
}

export function rollupTree(
  catalog: Catalog,
  treeId: string,
  progress: UserAchievementProgress[],
): TreeRollup {
  const achievements = catalog.achievements.filter((item) => item.treeId === treeId);
  const byId = new Map(progress.map((item) => [item.achievementId, item]));
  let claimed = 0;
  let ready = 0;
  let inProgress = 0;
  let xpClaimed = 0;
  let xpTotal = 0;

  for (const achievement of achievements) {
    xpTotal += achievement.xp;
    const state = byId.get(achievement.id)?.state ?? "locked";
    if (state === "claimed") {
      claimed += 1;
      xpClaimed += achievement.xp;
    } else if (state === "ready_to_claim" || state === "verified") {
      ready += 1;
    } else if (state === "in_progress") {
      inProgress += 1;
    }
  }

  return {
    treeId,
    claimed,
    ready,
    inProgress,
    total: achievements.length,
    xpClaimed,
    xpTotal,
    percent: percent(claimed, achievements.length),
  };
}

export function rollupOverall(
  catalog: Catalog,
  progress: UserAchievementProgress[],
): OverallRollup {
  const byTree = catalog.trees.map((tree) => rollupTree(catalog, tree.id, progress));
  const claimed = byTree.reduce((sum, item) => sum + item.claimed, 0);
  const ready = byTree.reduce((sum, item) => sum + item.ready, 0);
  const inProgress = byTree.reduce((sum, item) => sum + item.inProgress, 0);
  const total = byTree.reduce((sum, item) => sum + item.total, 0);
  const xpClaimed = byTree.reduce((sum, item) => sum + item.xpClaimed, 0);
  const xpTotal = byTree.reduce((sum, item) => sum + item.xpTotal, 0);
  return {
    claimed,
    ready,
    inProgress,
    total,
    xpClaimed,
    xpTotal,
    percent: percent(claimed, total),
    byTree,
  };
}

export function focusLabel(overall: OverallRollup, catalog: Catalog): {
  title: string;
  subtitle: string;
  treeName: string | null;
} {
  const needingWork = [...overall.byTree].sort((a, b) => a.percent - b.percent)[0];
  const tree = needingWork
    ? catalog.trees.find((item) => item.id === needingWork.treeId)
    : undefined;
  if (!tree) {
    return {
      title: "Discipline in the details.",
      subtitle: "Show up. Execute. Elevate.",
      treeName: null,
    };
  }
  return {
    title: tree.name,
    subtitle: needingWork && needingWork.percent < 100
      ? "Show up. Execute. Elevate."
      : "Keep the standard.",
    treeName: tree.name,
  };
}
