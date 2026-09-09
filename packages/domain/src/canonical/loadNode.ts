import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CanonicalImportError } from "../errors.js";
import { importCanonical } from "./importer.js";
import type { Catalog } from "../types.js";

export function resolveCanonicalPath(repoRoot: string, override?: string): string {
  return override && override.trim() !== ""
    ? resolve(override)
    : resolve(repoRoot, "data/canonical_data.json");
}

export function loadCanonicalFromDisk(repoRoot: string, override?: string): Catalog {
  const path = resolveCanonicalPath(repoRoot, override);
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new CanonicalImportError(
      `Canonical file not found at ${path}. Write data/canonical_data.json verbatim from the provided source (schema psx.canonical_data.v1). Do not invent a replacement taxonomy.`,
    );
  }
  return importCanonical(JSON.parse(text));
}
