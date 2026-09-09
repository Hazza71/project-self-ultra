import { CANONICAL_TREE_NAMES, EXPECTED_COUNTS, INVARIANTS } from "../constants.js";
import { CanonicalCountsError, CanonicalImportError } from "../errors.js";
import { mintAchievementId, mintBranchId, mintCategoryId, normalizePathPart } from "../ids.js";
import type {
  CanonicalAchievementInput,
  CanonicalFile,
  Catalog,
  CatalogAchievement,
  CatalogBranch,
  CatalogCategory,
  CatalogTree,
} from "../types.js";
import { declaredCounts, parseCanonicalFile } from "./schema.js";

export interface ImportOptions {
  /** Production imports always enforce 7/34/150/619. Tests may disable. */
  enforceCounts?: boolean;
}

function coerceRecommended(value: CanonicalAchievementInput["minReps"] | boolean | string | number | null | undefined): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const n = value.trim().toLowerCase();
    return n === "true" || n === "yes" || n === "1" || n === "recommended";
  }
  return false;
}

function coerceMinReps(achievement: CanonicalAchievementInput): number {
  const raw = achievement.minReps ?? achievement.min_reps ?? 0;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
    throw new CanonicalImportError(`Invalid minReps for "${achievement.title}"`);
  }
  return Math.floor(raw);
}

export function importCanonical(raw: unknown, options: ImportOptions = {}): Catalog {
  const file: CanonicalFile = parseCanonicalFile(raw);
  const enforceCounts = options.enforceCounts !== false;

  const trees: CatalogTree[] = [];
  const categories: CatalogCategory[] = [];
  const branches: CatalogBranch[] = [];
  const achievements: CatalogAchievement[] = [];

  const seenTreeIds = new Set<string>();
  const seenIds = new Set<string>();

  file.trees.forEach((treeInput, treeIndex) => {
    const treeId = normalizePathPart(treeInput.id);
    if (seenTreeIds.has(treeId)) {
      throw new CanonicalImportError(`Duplicate tree id "${treeId}"`);
    }
    seenTreeIds.add(treeId);

    const tree: CatalogTree = {
      id: treeId,
      name: normalizePathPart(treeInput.name),
      icon: treeInput.icon ?? "",
      legendaryTrophy: treeInput.legendary_trophy ?? "",
      priority: treeInput.priority ?? treeIndex,
      path: treeId,
      categoryIds: [],
    };
    trees.push(tree);

    (treeInput.categories ?? []).forEach((categoryInput, categoryIndex) => {
      const categoryName = normalizePathPart(categoryInput.name);
      const categoryId = mintCategoryId(treeId, categoryName);
      if (seenIds.has(categoryId)) {
        throw new CanonicalImportError(`Duplicate category id for ${treeId}/${categoryName}`);
      }
      seenIds.add(categoryId);

      const category: CatalogCategory = {
        id: categoryId,
        treeId,
        name: categoryName,
        description: categoryInput.description ?? "",
        sortOrder: categoryIndex,
        path: `${treeId}/${categoryName}`,
        branchIds: [],
      };
      categories.push(category);
      tree.categoryIds.push(categoryId);

      (categoryInput.branches ?? []).forEach((branchInput, branchIndex) => {
        const branchName = normalizePathPart(branchInput.name);
        const branchId = mintBranchId(treeId, categoryName, branchName);
        if (seenIds.has(branchId)) {
          throw new CanonicalImportError(`Duplicate branch id for ${category.path}/${branchName}`);
        }
        seenIds.add(branchId);

        const branch: CatalogBranch = {
          id: branchId,
          categoryId,
          treeId,
          name: branchName,
          recommended: coerceRecommended(branchInput.recommended),
          sortOrder: branchIndex,
          path: `${treeId}/${categoryName}/${branchName}`,
          achievementIds: [],
        };
        branches.push(branch);
        category.branchIds.push(branchId);

        (branchInput.achievements ?? []).forEach((achievementInput, achievementIndex) => {
          const title = normalizePathPart(achievementInput.title);
          const tier = normalizePathPart(String(achievementInput.tier));
          const achievementId = mintAchievementId(treeId, categoryName, branchName, title, tier);
          if (seenIds.has(achievementId)) {
            throw new CanonicalImportError(
              `Duplicate achievement id for ${branch.path}/${title}/${tier}`,
            );
          }
          seenIds.add(achievementId);

          const achievement: CatalogAchievement = {
            id: achievementId,
            branchId,
            categoryId,
            treeId,
            title,
            tier,
            xp: achievementInput.xp,
            req: achievementInput.req ?? "",
            minReps: coerceMinReps(achievementInput),
            extension: achievementInput.extension ?? null,
            sortOrder: achievementIndex,
            path: `${treeId}/${categoryName}/${branchName}/${title}/${tier}`,
          };
          achievements.push(achievement);
          branch.achievementIds.push(achievementId);
        });
      });
    });
  });

  const catalog: Catalog = {
    schema: file.schema,
    product: file.product ?? null,
    invariants: file.invariants ?? [],
    trees,
    categories,
    branches,
    achievements,
    counts: {
      trees: trees.length,
      categories: categories.length,
      branches: branches.length,
      achievements: achievements.length,
    },
  };

  if (enforceCounts) {
    assertCanonicalCounts(catalog, file);
  }

  return catalog;
}

export function assertCanonicalCounts(catalog: Catalog, file?: CanonicalFile): void {
  const actual = catalog.counts;
  const expected = EXPECTED_COUNTS;
  const mismatches: string[] = [];

  if (actual.trees !== expected.trees) {
    mismatches.push(`trees ${actual.trees} !== ${expected.trees}`);
  }
  if (actual.categories !== expected.categories) {
    mismatches.push(`categories ${actual.categories} !== ${expected.categories}`);
  }
  if (actual.branches !== expected.branches) {
    mismatches.push(`branches ${actual.branches} !== ${expected.branches}`);
  }
  if (actual.achievements !== expected.achievements) {
    mismatches.push(`achievements ${actual.achievements} !== ${expected.achievements}`);
  }

  if (file) {
    const declared = declaredCounts(file);
    if (declared.trees !== actual.trees) {
      mismatches.push(`declared trees ${declared.trees} !== imported ${actual.trees}`);
    }
    if (declared.categories !== actual.categories) {
      mismatches.push(`declared categories ${declared.categories} !== imported ${actual.categories}`);
    }
    if (declared.branches !== actual.branches) {
      mismatches.push(`declared branches ${declared.branches} !== imported ${actual.branches}`);
    }
    if (declared.achievements !== actual.achievements) {
      mismatches.push(`declared achievements ${declared.achievements} !== imported ${actual.achievements}`);
    }
  }

  if (mismatches.length > 0) {
    throw new CanonicalCountsError(
      `Canonical import count mismatch (must be 7/34/150/619): ${mismatches.join("; ")}`,
    );
  }

  const names = catalog.trees.map((tree) => tree.name);
  for (const required of CANONICAL_TREE_NAMES) {
    if (!names.includes(required)) {
      throw new CanonicalCountsError(
        `Canonical tree "${required}" missing. Do not reinvent taxonomy.`,
      );
    }
  }

  const invariantSet = new Set(catalog.invariants);
  for (const required of Object.values(INVARIANTS)) {
    if (catalog.invariants.length > 0 && !invariantSet.has(required)) {
      throw new CanonicalImportError(`Missing invariant "${required}"`);
    }
  }
}
