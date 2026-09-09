import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadCanonicalFromDisk } from "./loadNode.js";
import { EXPECTED_COUNTS } from "../constants.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const catalog = loadCanonicalFromDisk(repoRoot, process.env.PSX_CANONICAL_DATA_PATH);
const { trees, categories, branches, achievements } = catalog.counts;

if (
  trees !== EXPECTED_COUNTS.trees ||
  categories !== EXPECTED_COUNTS.categories ||
  branches !== EXPECTED_COUNTS.branches ||
  achievements !== EXPECTED_COUNTS.achievements
) {
  throw new Error(
    `Canonical counts ${trees}/${categories}/${branches}/${achievements} !== 7/34/150/619`,
  );
}

console.log(
  `Canonical import OK: ${trees} trees, ${categories} categories, ${branches} branches, ${achievements} achievements`,
);
