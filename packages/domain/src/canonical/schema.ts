import { CANONICAL_SCHEMA, EXPECTED_COUNTS } from "../constants.js";
import type { CanonicalFile } from "../types.js";
import { CanonicalImportError } from "../errors.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new CanonicalImportError(`Expected non-empty string for ${field}`);
  }
  return value;
}

function optionalString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new CanonicalImportError("Expected string or null");
  }
  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CanonicalImportError(`Expected number for ${field}`);
  }
  return value;
}

function optionalNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CanonicalImportError("Expected number");
  }
  return value;
}

/** Canonical files ship invariants as a `{ flag: true }` object; fixtures may use a string array. */
export function parseInvariants(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (isRecord(raw)) {
    return Object.entries(raw)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }
  return [];
}

export function parseCanonicalFile(raw: unknown): CanonicalFile {
  if (!isRecord(raw)) {
    throw new CanonicalImportError("Canonical data must be a JSON object");
  }
  if (raw["_status"] === "awaiting_canonical_file") {
    throw new CanonicalImportError(
      "data/canonical_data.json is not installed yet. Write the provided file verbatim (schema psx.canonical_data.v1).",
    );
  }
  const schema = asString(raw.schema, "schema");
  if (schema !== CANONICAL_SCHEMA) {
    throw new CanonicalImportError(
      `Unsupported schema "${schema}". Expected ${CANONICAL_SCHEMA}.`,
    );
  }
  if (!Array.isArray(raw.trees)) {
    throw new CanonicalImportError("canonical data must include trees[]");
  }

  const trees = raw.trees.map((tree, treeIndex) => {
    if (!isRecord(tree)) {
      throw new CanonicalImportError(`trees[${treeIndex}] must be an object`);
    }
    const categories = Array.isArray(tree.categories) ? tree.categories : [];
    return {
      id: asString(tree.id, `trees[${treeIndex}].id`),
      name: asString(tree.name, `trees[${treeIndex}].name`),
      icon: optionalString(tree.icon),
      legendary_trophy: optionalString(tree.legendary_trophy),
      priority: optionalNumber(tree.priority, treeIndex),
      categories: categories.map((category, categoryIndex) => {
        if (!isRecord(category)) {
          throw new CanonicalImportError(
            `trees[${treeIndex}].categories[${categoryIndex}] must be an object`,
          );
        }
        const branches = Array.isArray(category.branches) ? category.branches : [];
        return {
          name: asString(category.name, `category.name`),
          description: optionalString(category.description),
          branches: branches.map((branch, branchIndex) => {
            if (!isRecord(branch)) {
              throw new CanonicalImportError(
                `branches[${branchIndex}] must be an object`,
              );
            }
            const achievements = Array.isArray(branch.achievements)
              ? branch.achievements
              : [];
            return {
              name: asString(branch.name, "branch.name"),
              recommended: branch.recommended as boolean | string | number | null,
              achievements: achievements.map((achievement, achievementIndex) => {
                if (!isRecord(achievement)) {
                  throw new CanonicalImportError(
                    `achievements[${achievementIndex}] must be an object`,
                  );
                }
                return {
                  title: asString(achievement.title, "achievement.title"),
                  tier: asString(achievement.tier, "achievement.tier"),
                  xp: asNumber(achievement.xp, "achievement.xp"),
                  req: optionalString(achievement.req),
                  minReps:
                    typeof achievement.minReps === "number"
                      ? achievement.minReps
                      : typeof achievement.min_reps === "number"
                        ? achievement.min_reps
                        : undefined,
                  min_reps: achievement.min_reps as number | null | undefined,
                  extension: achievement.extension,
                };
              }),
            };
          }),
        };
      }),
    };
  });

  const invariants = parseInvariants(raw.invariants);

  const counts = isRecord(raw.counts)
    ? {
        trees:
          typeof raw.counts.trees === "number" ? raw.counts.trees : undefined,
        categories:
          typeof raw.counts.categories === "number"
            ? raw.counts.categories
            : undefined,
        main_categories:
          typeof raw.counts.main_categories === "number"
            ? raw.counts.main_categories
            : undefined,
        branches:
          typeof raw.counts.branches === "number"
            ? raw.counts.branches
            : undefined,
        skill_branches:
          typeof raw.counts.skill_branches === "number"
            ? raw.counts.skill_branches
            : undefined,
        achievements:
          typeof raw.counts.achievements === "number"
            ? raw.counts.achievements
            : undefined,
      }
    : undefined;

  return {
    schema,
    product: raw.product,
    counts,
    invariants,
    trees,
  };
}

export function declaredCounts(file: CanonicalFile): {
  trees: number;
  categories: number;
  branches: number;
  achievements: number;
} {
  const categories =
    file.counts?.categories ??
    file.counts?.main_categories ??
    EXPECTED_COUNTS.categories;
  const branches =
    file.counts?.branches ??
    file.counts?.skill_branches ??
    EXPECTED_COUNTS.branches;
  return {
    trees: file.counts?.trees ?? EXPECTED_COUNTS.trees,
    categories,
    branches,
    achievements: file.counts?.achievements ?? EXPECTED_COUNTS.achievements,
  };
}
