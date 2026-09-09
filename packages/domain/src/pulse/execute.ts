import { AutoClaimForbiddenError, DomainRuleError, NotFoundError, PsxError } from "../errors.js";
import type { MemoryStore } from "../store/memoryStore.js";
import type { CollectionState, FocusItem, FocusKind, NorthStarState, Provenance, SeasonState } from "../types.js";
import { isForbiddenPulseTool, pulseToolByName } from "./tools.js";
import type { PulseToolCall, PulseToolResult } from "./types.js";

const PULSE_AUDIT: Provenance = { source: "pulse_stub", actor: "pulse", note: "pulse_tool" };
const USER_VIA_PULSE: Provenance = { source: "manual", actor: "user", note: "via_pulse_tool" };

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  return undefined;
}

function strList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function fail(tool: string, error: unknown): PulseToolResult {
  if (error instanceof AutoClaimForbiddenError) {
    return { ok: false, tool, error: { code: error.code, message: error.message } };
  }
  if (error instanceof PsxError) {
    return { ok: false, tool, error: { code: error.code, message: error.message } };
  }
  const message = error instanceof Error ? error.message : "Pulse tool failed";
  return { ok: false, tool, error: { code: "pulse_tool_failed", message } };
}

function atlasHref(args: Record<string, unknown>): string {
  const achievementId = str(args.achievementId);
  const branchId = str(args.branchId);
  const categoryId = str(args.categoryId);
  const treeId = str(args.treeId);
  const view = str(args.view);
  if (achievementId) return `/atlas/achievement/${achievementId}`;
  if (branchId) return `/atlas/branch/${branchId}`;
  if (categoryId) return `/atlas/category/${categoryId}`;
  if (treeId) return `/atlas/tree/${treeId}`;
  if (view === "search") return "/atlas/search";
  if (view === "compass") return "/compass";
  if (view === "north_stars") return "/north-stars";
  if (view === "focus") return "/focus";
  return "/atlas";
}

function parseFocusItems(value: unknown): FocusItem[] {
  if (!Array.isArray(value)) {
    throw new DomainRuleError("invalid_focus", "set_focus requires an items array.");
  }
  const items: FocusItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const rec = raw as Record<string, unknown>;
    const kind = str(rec.kind) as FocusKind | undefined;
    const id = str(rec.id);
    if (!kind || !id) continue;
    if (kind !== "branch" && kind !== "category" && kind !== "north_star") continue;
    const load = str(rec.load);
    items.push({
      kind,
      id,
      note: str(rec.note),
      load: load === "maintenance" || load === "temporary" || load === "high" ? load : "high",
    });
  }
  return items;
}

export function executePulseTool(store: MemoryStore, userId: string, call: PulseToolCall): PulseToolResult {
  const name = call.name;
  const args = call.arguments ?? {};

  if (isForbiddenPulseTool(name) || name === "claim_achievement") {
    try {
      throw new AutoClaimForbiddenError(
        "Pulse cannot claim achievements. Ready-to-Claim is not Claimed. Use Atlas Claim.",
      );
    } catch (error) {
      return fail(name, error);
    }
  }

  const def = pulseToolByName(name);
  if (!def || !def.allowed) {
    return fail(name, new DomainRuleError("unknown_pulse_tool", `Unknown Pulse tool "${name}".`));
  }

  try {
    switch (def.name) {
      case "navigate_atlas": {
        const href = atlasHref(args);
        return { ok: true, tool: def.name, navigation: { href }, data: { href } };
      }
      case "search_project": {
        const query = str(args.query) ?? "";
        const hits = store.search(userId, { query, treeId: str(args.treeId) }).slice(0, 12);
        return {
          ok: true,
          tool: def.name,
          data: hits.map((hit) => ({
            achievementId: hit.achievement.id,
            title: hit.achievement.title,
            branch: hit.branch.name,
            tree: hit.tree.name,
            state: hit.progress?.state ?? "locked",
          })),
        };
      }
      case "log_activity": {
        const body = str(args.body);
        if (!body) throw new DomainRuleError("invalid_log", "log_activity requires body.");
        const achievementId = str(args.achievementId);
        const log = store.logManual(userId, body, USER_VIA_PULSE, achievementId);
        if (achievementId) {
          store.logEvidence(userId, achievementId, { payload: { note: body }, incrementReps: 1 }, USER_VIA_PULSE);
        }
        return { ok: true, tool: def.name, data: { logId: log.id, achievementId: achievementId ?? null } };
      }
      case "explain_ready_to_claim": {
        const achievementId = str(args.achievementId);
        if (!achievementId) throw new DomainRuleError("invalid_args", "achievementId is required.");
        return { ok: true, tool: def.name, data: store.explainReady(userId, achievementId) };
      }
      case "get_achievement_status": {
        const achievementId = str(args.achievementId);
        if (!achievementId) throw new DomainRuleError("invalid_args", "achievementId is required.");
        const progress = store.getProgress(userId, achievementId);
        const explanation = store.explainReady(userId, achievementId);
        return { ok: true, tool: def.name, data: { progress, explanation } };
      }
      case "list_collections": {
        const branchId = str(args.branchId);
        const items = store.listCollections(userId, branchId);
        return {
          ok: true,
          tool: def.name,
          data: {
            items,
            counts: branchId ? store.collectionCounts(userId, branchId) : undefined,
          },
        };
      }
      case "create_collection_item": {
        const branchId = str(args.branchId);
        const title = str(args.title);
        if (!branchId || !title) throw new DomainRuleError("invalid_args", "branchId and title are required.");
        const item = store.createCollectionItem(
          userId,
          {
            branchId,
            title,
            state: str(args.state) as CollectionState | undefined,
            notes: str(args.notes),
            difficulty: str(args.difficulty),
            repertoire:
              str(args.arrangement) || num(args.tempoBpm) !== undefined || bool(args.fromMemory) !== undefined
                ? {
                    arrangement: str(args.arrangement),
                    tempoBpm: num(args.tempoBpm),
                    fromMemory: bool(args.fromMemory) ?? false,
                    usesSheetOrTab: false,
                  }
                : undefined,
          },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: item };
      }
      case "update_collection_item": {
        const id = str(args.id);
        if (!id) throw new DomainRuleError("invalid_args", "id is required.");
        const item = store.updateCollectionItem(
          userId,
          id,
          {
            title: str(args.title),
            state: str(args.state) as CollectionState | undefined,
            notes: str(args.notes),
            difficulty: str(args.difficulty),
            repertoire:
              str(args.arrangement) || str(args.section) || num(args.tempoBpm) !== undefined || bool(args.fromMemory) !== undefined
                ? {
                    arrangement: str(args.arrangement),
                    section: str(args.section),
                    tempoBpm: num(args.tempoBpm),
                    fromMemory: bool(args.fromMemory),
                  }
                : undefined,
          },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: item };
      }
      case "list_north_stars":
        return { ok: true, tool: def.name, data: store.listNorthStars(userId) };
      case "create_north_star": {
        const name = str(args.name);
        const targetValue = num(args.targetValue);
        if (!name || targetValue === undefined) {
          throw new DomainRuleError("invalid_args", "name and targetValue are required.");
        }
        const star = store.createNorthStar(
          userId,
          {
            name,
            type: str(args.type),
            currentValue: num(args.currentValue),
            targetValue,
            unit: str(args.unit),
            deadline: str(args.deadline) ?? null,
            reason: str(args.reason),
            linkedBranchIds: strList(args.linkedBranchIds),
          },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: { ...star, xpGranted: 0 } };
      }
      case "update_north_star": {
        const id = str(args.id);
        if (!id) throw new DomainRuleError("invalid_args", "id is required.");
        const star = store.updateNorthStar(
          userId,
          id,
          {
            status: str(args.status) as NorthStarState | undefined,
            currentValue: num(args.currentValue),
            targetValue: num(args.targetValue),
            deadline: str(args.deadline),
            reason: str(args.reason),
          },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: star };
      }
      case "record_north_star_progress": {
        const id = str(args.id);
        const value = num(args.value);
        if (!id || value === undefined) throw new DomainRuleError("invalid_args", "id and value are required.");
        const star = store.recordNorthStarProgress(
          userId,
          id,
          { value, note: str(args.note), source: str(args.source) },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: { star, xpGranted: 0 } };
      }
      case "summarise_focus_season": {
        const focus = store.getFocusRecord(userId);
        const season = store.getActiveSeason(userId);
        const challenges = store.ensureDailyChallenges(userId);
        const budget = store.attentionBudget(userId);
        return {
          ok: true,
          tool: def.name,
          data: {
            focus,
            season,
            dailyChallenges: challenges,
            attentionBudget: budget,
            heuristicFocus: store.focus(userId),
          },
        };
      }
      case "set_focus": {
        const record = store.setFocus(userId, parseFocusItems(args.items), PULSE_AUDIT);
        return { ok: true, tool: def.name, data: record };
      }
      case "set_season": {
        const existingId = str(args.id);
        if (existingId) {
          const season = store.updateSeason(
            userId,
            existingId,
            {
              name: str(args.name),
              startsAt: str(args.startsAt),
              endsAt: str(args.endsAt),
              priorityBranchIds: strList(args.priorityBranchIds),
              status: str(args.status) as SeasonState | undefined,
              reviewIntention: str(args.reviewIntention),
              reviewActual: str(args.reviewActual),
            },
            PULSE_AUDIT,
          );
          return { ok: true, tool: def.name, data: { season, xpGranted: 0 } };
        }
        const startsAt = str(args.startsAt);
        const endsAt = str(args.endsAt);
        if (!startsAt || !endsAt) {
          throw new DomainRuleError("invalid_args", "startsAt and endsAt are required to create a Season.");
        }
        const season = store.createSeason(
          userId,
          {
            name: str(args.name) ?? "Season",
            startsAt,
            endsAt,
            priorityBranchIds: strList(args.priorityBranchIds),
            status: (str(args.status) as SeasonState | undefined) ?? "active",
          },
          PULSE_AUDIT,
        );
        return { ok: true, tool: def.name, data: { season, xpGranted: 0 } };
      }
      case "get_compass":
        return { ok: true, tool: def.name, data: store.compass(userId) };
      default:
        return fail(name, new DomainRuleError("unknown_pulse_tool", `Unhandled Pulse tool "${name}".`));
    }
  } catch (error) {
    if (error instanceof NotFoundError && name === "explain_ready_to_claim") {
      return fail(name, error);
    }
    return fail(name, error);
  }
}

export function executePulseTools(
  store: MemoryStore,
  userId: string,
  calls: PulseToolCall[],
): PulseToolResult[] {
  return calls.map((call) => {
    const result = executePulseTool(store, userId, call);
    store.recordPulseInvocation(userId, result.tool, result.ok, {
      code: result.error?.code,
      navigation: result.navigation?.href,
    });
    return result;
  });
}
