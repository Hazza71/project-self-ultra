import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EXPECTED_COUNTS } from "../constants.js";
import { CanonicalImportError } from "../errors.js";
import { importCanonical } from "../canonical/importer.js";
import { loadCanonicalFromDisk } from "../canonical/loadNode.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const canonicalPath = resolve(repoRoot, "data/canonical_data.json");
const hasCanonical = existsSync(canonicalPath);

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
    expect(catalog.trees.map((tree) => tree.name)).toEqual([
      "Character",
      "Body",
      "Capability",
      "Intelligence",
      "Expression",
      "Adventure",
      "Freedom",
    ]);
  });

  it.skipIf(!hasCanonical)("declared counts match imported counts", () => {
    const raw = JSON.parse(readFileSync(canonicalPath, "utf8"));
    const catalog = importCanonical(raw);
    expect(catalog.counts.trees).toBe(raw.counts.trees ?? EXPECTED_COUNTS.trees);
    expect(catalog.counts.achievements).toBe(raw.counts.achievements);
  });
});
