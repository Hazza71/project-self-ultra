#!/usr/bin/env node
/**
 * Seed the catalog into Postgres/Supabase from data/canonical_data.json.
 * Requires DATABASE_URL. Does not write claims or user progress.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { importCanonical } from "../packages/domain/src/canonical/importer.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(repoRoot, "data/canonical_data.json"), "utf8"));
const catalog = importCanonical(raw);

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("BEGIN");
  for (const tree of catalog.trees) {
    await client.query(
      `INSERT INTO trees (id, name, icon, legendary_trophy, priority)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         icon = EXCLUDED.icon,
         legendary_trophy = EXCLUDED.legendary_trophy,
         priority = EXCLUDED.priority`,
      [tree.id, tree.name, tree.icon, tree.legendaryTrophy, tree.priority],
    );
  }
  for (const category of catalog.categories) {
    await client.query(
      `INSERT INTO categories (id, tree_id, name, description, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         sort_order = EXCLUDED.sort_order`,
      [category.id, category.treeId, category.name, category.description, category.sortOrder],
    );
  }
  for (const branch of catalog.branches) {
    await client.query(
      `INSERT INTO branches (id, category_id, name, recommended, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         recommended = EXCLUDED.recommended,
         sort_order = EXCLUDED.sort_order`,
      [branch.id, branch.categoryId, branch.name, branch.recommended, branch.sortOrder],
    );
  }
  for (const achievement of catalog.achievements) {
    await client.query(
      `INSERT INTO achievements (id, branch_id, title, tier, xp, req, min_reps, extension, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         tier = EXCLUDED.tier,
         xp = EXCLUDED.xp,
         req = EXCLUDED.req,
         min_reps = EXCLUDED.min_reps,
         extension = EXCLUDED.extension,
         sort_order = EXCLUDED.sort_order`,
      [
        achievement.id,
        achievement.branchId,
        achievement.title,
        achievement.tier,
        achievement.xp,
        achievement.req,
        achievement.minReps,
        JSON.stringify(achievement.extension),
        achievement.sortOrder,
      ],
    );
  }
  await client.query("COMMIT");
  console.log("Seeded catalog", catalog.counts);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
