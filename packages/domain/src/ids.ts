import { ID_NAMESPACE } from "./constants.js";
import { sha256Hex } from "./sha256.js";

export function normalizePathPart(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function mint(kind: string, path: string): string {
  const digest = sha256Hex(`${ID_NAMESPACE}|${kind}|${path}`);
  return `${kind}_${digest.slice(0, 32)}`;
}

export function mintCategoryId(treeId: string, categoryName: string): string {
  return mint("category", `${normalizePathPart(treeId)}/${normalizePathPart(categoryName)}`);
}

export function mintBranchId(
  treeId: string,
  categoryName: string,
  branchName: string,
): string {
  return mint(
    "branch",
    `${normalizePathPart(treeId)}/${normalizePathPart(categoryName)}/${normalizePathPart(branchName)}`,
  );
}

export function mintAchievementId(
  treeId: string,
  categoryName: string,
  branchName: string,
  title: string,
  tier: string,
): string {
  return mint(
    "achievement",
    `${normalizePathPart(treeId)}/${normalizePathPart(categoryName)}/${normalizePathPart(branchName)}/${normalizePathPart(title)}/${normalizePathPart(tier)}`,
  );
}

export function newEntityId(prefix: string, seed: string): string {
  return `${prefix}_${sha256Hex(`${ID_NAMESPACE}|row|${prefix}|${seed}`).slice(0, 24)}`;
}
