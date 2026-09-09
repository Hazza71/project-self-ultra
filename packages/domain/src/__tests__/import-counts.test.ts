import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANONICAL_TREE_NAMES, EXPECTED_COUNTS, INVARIANTS } from "../constants.js";
import { CanonicalImportError } from "../errors.js";
import { importCanonical } from "../canonical/importer.js";
import { loadCanonicalFromDisk } from "../canonical/loadNode.js";
import { branchKind } from "../engine/branchKind.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const canonicalPath = resolve(repoRoot, "data/canonical_data.json");
const hasCanonical = existsSync(canonicalPath);
/** SHA-256 of the shipped canonical_data.json from docs/manifest.json. */
const CANONICAL_SHA256 = "1c741620681c792aae830ef3d8611464fe0123813e40dff77277e0ba234c5437";

describe("canonical import counts", () => {
  it("refuses to invent taxonomy when the canonical file is missing", () => {
    if (hasCanonical) {
      expect(hasCanonical).toBe(true);
      return;
    }
    expect(() => loadCanonicalFromDisk(repoRoot)).toThrow(CanonicalImportError);
  });

  it.skipIf(!hasCanonical)("imports exactly 7 trees, 34 categories, 150 branches, 619 achievements", () => {
    const catalog = loadCanonicalFromDisk(repoRoot);
    expect(catalog.counts).toEqual(EXPECTED_COUNTS);
    expect(catalog.trees.map((tree) => tree.name)).toEqual([...CANONICAL_TREE_NAMES]);
  });

  it.skipIf(!hasCanonical)("declared counts match imported counts", () => {
    const raw = JSON.parse(readFileSync(canonicalPath, "utf8"));
    const catalog = importCanonical(raw);
    expect(catalog.counts.trees).toBe(raw.counts.trees ?? EXPECTED_COUNTS.trees);
    expect(catalog.counts.achievements).toBe(raw.counts.achievements);
  });

  it.skipIf(!hasCanonical)("matches the shipped canonical_data.json digest", () => {
    const digest = createHash("sha256").update(readFileSync(canonicalPath)).digest("hex");
    expect(digest).toBe(CANONICAL_SHA256);
  });

  it.skipIf(!hasCanonical)("preserves object-form invariants and unique stable ids", () => {
    const catalog = loadCanonicalFromDisk(repoRoot);
    expect(catalog.invariants).toEqual(expect.arrayContaining(Object.values(INVARIANTS)));
    const ids = [
      ...catalog.trees.map((item) => item.id),
      ...catalog.categories.map((item) => item.id),
      ...catalog.branches.map((item) => item.id),
      ...catalog.achievements.map((item) => item.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    const again = loadCanonicalFromDisk(repoRoot);
    expect(again.achievements.map((item) => item.id)).toEqual(catalog.achievements.map((item) => item.id));
  });

  it.skipIf(!hasCanonical)("classifies recommended vs legendary branches without inventing nodes", () => {
    const catalog = loadCanonicalFromDisk(repoRoot);
    const kinds = catalog.branches.map((branch) => branchKind(catalog, branch.id));
    expect(kinds.filter((kind) => kind === "core").length).toBeGreaterThan(0);
    expect(kinds.filter((kind) => kind === "elective").length).toBeGreaterThan(0);
    expect(kinds.filter((kind) => kind === "legendary")).toEqual(["legendary"]);
    const legendary = catalog.branches.find((branch) => branchKind(catalog, branch.id) === "legendary");
    expect(legendary?.name).toBe("Extreme Endurance / Triathlon");
  });
});
