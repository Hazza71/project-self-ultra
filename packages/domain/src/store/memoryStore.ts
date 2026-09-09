import { AutoClaimForbiddenError, DomainRuleError, IsolationError, NotFoundError } from "../errors.js";
import { newEntityId } from "../ids.js";
import { createLedgerEvent } from "../ledger/ledger.js";
import { evaluateAttentionBudget } from "../engine/attentionBudget.js";
import { assertCanClaim, assertExplicitUserClaim } from "../engine/claim.js";
import {
  assertCollectionTransition,
  collectionKindForBranch,
  countCollections,
  defaultCollectionType,
  emptyRepertoire,
  isCollectionState,
  requireBranch,
} from "../engine/collections.js";
import { competenceForBranch } from "../engine/competence.js";
import { recommendNext } from "../engine/compass.js";
import { planDailyChallenges, todayUtcDate } from "../engine/dailyChallenges.js";
import { isEligible } from "../engine/eligibility.js";
import { explainReadyToClaim } from "../engine/explainReady.js";
import {
  assertNorthStarTransition,
  isNorthStarState,
  isSpendLikeSource,
  xpFromNorthStarEvent,
} from "../engine/northStars.js";
import { focusLabel, rollupOverall } from "../engine/progress.js";
import { assertSeasonLength, recommendedPriorityCount, seasonCompletionXp } from "../engine/seasons.js";
import { assertTransition } from "../engine/stateMachine.js";
import type {
  Catalog,
  CatalogAchievement,
  ClaimRecord,
  CollectionItem,
  CollectionState,
  CompetenceRecord,
  DailyChallenge,
  EvidenceRecord,
  ExplicitClaimInput,
  FocusItem,
  FocusRecord,
  LedgerEvent,
  ManualLogRecord,
  NorthStar,
  NorthStarHistoryEntry,
  NorthStarState,
  PersistSnapshot,
  Provenance,
  RepertoireMetadata,
  SearchFilters,
  SearchHit,
  Season,
  SeasonState,
  UserAchievementProgress,
} from "../types.js";

function nowIso(): string {
  return new Date().toISOString();
}

function emptyProgress(userId: string, achievementId: string, at: string): UserAchievementProgress {
  return {
    userId,
    achievementId,
    state: "locked",
    reps: 0,
    startedAt: null,
    readyAt: null,
    verifiedAt: null,
    claimedAt: null,
    updatedAt: at,
  };
}

export class MemoryStore {
  readonly catalog: Catalog;
  private progress = new Map<string, UserAchievementProgress>();
  private evidence: EvidenceRecord[] = [];
  private claims: ClaimRecord[] = [];
  private ledger: LedgerEvent[] = [];
  private competence = new Map<string, CompetenceRecord>();
  private manualLogs: ManualLogRecord[] = [];
  private collections: CollectionItem[] = [];
  private northStars: NorthStar[] = [];
  private focusByUser = new Map<string, FocusRecord>();
  private seasons: Season[] = [];
  private dailyChallenges: DailyChallenge[] = [];

  constructor(catalog: Catalog) {
    this.catalog = catalog;
    this.appendSystemLedger("catalog_imported", {
      counts: catalog.counts,
      schema: catalog.schema,
    });
  }

  private key(userId: string, achievementId: string): string {
    return `${userId}::${achievementId}`;
  }

  private competenceKey(userId: string, branchId: string): string {
    return `${userId}::${branchId}`;
  }

  private assertUser(userId: string): void {
    if (!userId || typeof userId !== "string") {
      throw new IsolationError("A user id is required for all stateful operations.");
    }
  }

  private achievement(id: string): CatalogAchievement {
    const found = this.catalog.achievements.find((item) => item.id === id);
    if (!found) throw new NotFoundError(`Unknown achievement ${id}`);
    return found;
  }

  private appendSystemLedger(eventType: LedgerEvent["eventType"], payload: Record<string, unknown>): void {
    this.ledger.push(
      createLedgerEvent({
        userId: "system",
        eventType,
        payload,
        provenance: { source: "import", actor: "system" },
      }),
    );
  }

  private appendLedger(
    userId: string,
    eventType: LedgerEvent["eventType"],
    payload: Record<string, unknown>,
    provenance: Provenance,
  ): LedgerEvent {
    this.assertUser(userId);
    const event = createLedgerEvent({ userId, eventType, payload, provenance });
    this.ledger.push(event);
    return event;
  }

  private refreshCompetence(userId: string, branchId: string): CompetenceRecord {
    const userProgress = this.listProgress(userId);
    const state = competenceForBranch(this.catalog, branchId, userProgress);
    const record: CompetenceRecord = {
      userId,
      branchId,
      state,
      updatedAt: nowIso(),
    };
    this.competence.set(this.competenceKey(userId, branchId), record);
    this.appendLedger(
      userId,
      "competence_updated",
      { branchId, state },
      { source: "system", actor: "system" },
    );
    return record;
  }

  getProgress(userId: string, achievementId: string): UserAchievementProgress {
    this.assertUser(userId);
    return this.progress.get(this.key(userId, achievementId)) ?? emptyProgress(userId, achievementId, nowIso());
  }

  listProgress(userId: string): UserAchievementProgress[] {
    this.assertUser(userId);
    return [...this.progress.values()].filter((item) => item.userId === userId);
  }

  listClaims(userId: string): ClaimRecord[] {
    this.assertUser(userId);
    return this.claims.filter((item) => item.userId === userId);
  }

  listEvidence(userId: string, achievementId?: string): EvidenceRecord[] {
    this.assertUser(userId);
    return this.evidence.filter(
      (item) => item.userId === userId && (!achievementId || item.achievementId === achievementId),
    );
  }

  listLedger(userId: string): LedgerEvent[] {
    this.assertUser(userId);
    return this.ledger.filter((item) => item.userId === userId);
  }

  listManualLogs(userId: string): ManualLogRecord[] {
    this.assertUser(userId);
    return this.manualLogs.filter((item) => item.userId === userId);
  }

  getCompetence(userId: string, branchId: string): CompetenceRecord {
    this.assertUser(userId);
    return (
      this.competence.get(this.competenceKey(userId, branchId)) ?? {
        userId,
        branchId,
        state: "unexplored",
        updatedAt: nowIso(),
      }
    );
  }

  start(userId: string, achievementId: string, provenance: Provenance = { source: "atlas", actor: "user" }): UserAchievementProgress {
    this.assertUser(userId);
    const current = this.getProgress(userId, achievementId);
    if (current.state === "claimed") return current;
    if (current.state === "locked") {
      assertTransition(current.state, "in_progress");
    }
    const at = nowIso();
    const next: UserAchievementProgress = {
      ...current,
      state: current.state === "locked" ? "in_progress" : current.state,
      startedAt: current.startedAt ?? at,
      updatedAt: at,
    };
    this.progress.set(this.key(userId, achievementId), next);
    this.appendLedger(userId, "progress_started", { achievementId }, provenance);
    this.refreshCompetence(userId, this.achievement(achievementId).branchId);
    return this.evaluate(userId, achievementId, provenance);
  }

  logEvidence(
    userId: string,
    achievementId: string,
    input: { kind?: string; payload?: Record<string, unknown>; incrementReps?: number },
    provenance: Provenance = { source: "manual", actor: "user" },
  ): EvidenceRecord {
    this.assertUser(userId);
    this.achievement(achievementId);
    if (provenance.actor !== "user") {
      throw new AutoClaimForbiddenError("Evidence that counts toward eligibility must be user-attributed in Phase 1.");
    }
    const current = this.getProgress(userId, achievementId);
    if (current.state === "locked") {
      this.start(userId, achievementId, provenance);
    }
    const at = nowIso();
    const record: EvidenceRecord = {
      id: newEntityId("evidence", `${userId}|${achievementId}|${at}|${this.evidence.length}`),
      userId,
      achievementId,
      kind: input.kind ?? "manual",
      payload: input.payload ?? {},
      createdAt: at,
    };
    this.evidence.push(record);
    const latest = this.getProgress(userId, achievementId);
    const increment = input.incrementReps ?? 1;
    const updated: UserAchievementProgress = {
      ...latest,
      reps: latest.reps + increment,
      updatedAt: at,
    };
    this.progress.set(this.key(userId, achievementId), updated);
    this.appendLedger(
      userId,
      "evidence_logged",
      { achievementId, evidenceId: record.id, reps: updated.reps },
      provenance,
    );
    this.evaluate(userId, achievementId, provenance);
    return record;
  }

  logManual(
    userId: string,
    body: string,
    provenance: Provenance,
    achievementId?: string,
  ): ManualLogRecord {
    this.assertUser(userId);
    if (provenance.actor !== "user" || (provenance.source !== "user" && provenance.source !== "manual" && provenance.source !== "atlas")) {
      throw new AutoClaimForbiddenError("Manual logs must be written by the user with user provenance.");
    }
    const at = nowIso();
    const record: ManualLogRecord = {
      id: newEntityId("log", `${userId}|${at}|${body}`),
      userId,
      body,
      achievementId,
      createdAt: at,
      provenance,
    };
    this.manualLogs.push(record);
    this.appendLedger(
      userId,
      "manual_log",
      { body, achievementId: achievementId ?? null, logId: record.id },
      provenance,
    );
    return record;
  }

  evaluate(
    userId: string,
    achievementId: string,
    provenance: Provenance = { source: "system", actor: "system" },
  ): UserAchievementProgress {
    this.assertUser(userId);
    const achievement = this.achievement(achievementId);
    const current = this.getProgress(userId, achievementId);
    this.appendLedger(
      userId,
      "eligibility_evaluated",
      { achievementId, state: current.state, reps: current.reps },
      provenance,
    );
    if (current.state === "claimed" || current.state === "verified") {
      return current;
    }
    const eligible = isEligible(achievement, current, this.listEvidence(userId, achievementId).length);
    if (eligible && current.state !== "ready_to_claim") {
      assertTransition(current.state, "ready_to_claim");
      const at = nowIso();
      const next: UserAchievementProgress = {
        ...current,
        state: "ready_to_claim",
        readyAt: current.readyAt ?? at,
        updatedAt: at,
      };
      this.progress.set(this.key(userId, achievementId), next);
      this.appendLedger(userId, "ready_to_claim", { achievementId }, provenance);
      this.refreshCompetence(userId, achievement.branchId);
      return next;
    }
    return current;
  }

  markReadyIfEligible(userId: string, achievementId: string, provenance: Provenance): UserAchievementProgress {
    return this.evaluate(userId, achievementId, provenance);
  }

  verify(userId: string, achievementId: string, provenance: Provenance = { source: "atlas", actor: "user" }): UserAchievementProgress {
    this.assertUser(userId);
    const current = this.getProgress(userId, achievementId);
    assertTransition(current.state, "verified");
    const at = nowIso();
    const next: UserAchievementProgress = {
      ...current,
      state: "verified",
      verifiedAt: at,
      updatedAt: at,
    };
    this.progress.set(this.key(userId, achievementId), next);
    this.appendLedger(userId, "verified", { achievementId }, provenance);
    return next;
  }

  claim(
    userId: string,
    achievementId: string,
    input: Omit<ExplicitClaimInput, "userId" | "achievementId"> & {
      explicitUserAction?: unknown;
      actor?: unknown;
      source?: unknown;
      provenance?: Provenance;
    },
  ): ClaimRecord {
    this.assertUser(userId);
    this.achievement(achievementId);
    const claimInput = { ...input, userId, achievementId };
    assertExplicitUserClaim(claimInput);
    const current = this.getProgress(userId, achievementId);
    assertCanClaim(current.state);

    const at = nowIso();
    const record: ClaimRecord = {
      id: newEntityId("claim", `${userId}|${achievementId}|${at}`),
      userId,
      achievementId,
      claimedAt: at,
      explicitUserAction: true,
      actor: "user",
      source: claimInput.source,
    };
    this.claims.push(record);
    const next: UserAchievementProgress = {
      ...current,
      state: "claimed",
      claimedAt: at,
      updatedAt: at,
    };
    this.progress.set(this.key(userId, achievementId), next);
    this.appendLedger(
      userId,
      "claimed",
      { achievementId, claimId: record.id, source: record.source },
      { source: claimInput.source === "atlas" ? "atlas" : "manual", actor: "user" },
    );
    this.refreshCompetence(userId, this.achievement(achievementId).branchId);
    return record;
  }

  search(userId: string, filters: SearchFilters = {}): SearchHit[] {
    this.assertUser(userId);
    const query = filters.query?.trim().toLowerCase() ?? "";
    const hits: SearchHit[] = [];
    for (const achievement of this.catalog.achievements) {
      const branch = this.catalog.branches.find((item) => item.id === achievement.branchId);
      const category = this.catalog.categories.find((item) => item.id === achievement.categoryId);
      const tree = this.catalog.trees.find((item) => item.id === achievement.treeId);
      if (!branch || !category || !tree) continue;
      if (filters.treeId && tree.id !== filters.treeId) continue;
      if (filters.categoryId && category.id !== filters.categoryId) continue;
      if (filters.branchId && branch.id !== filters.branchId) continue;
      if (filters.tier && achievement.tier !== filters.tier) continue;
      if (filters.recommendedOnly && !branch.recommended) continue;
      const progress = this.progress.get(this.key(userId, achievement.id)) ?? null;
      if (filters.state && (progress?.state ?? "locked") !== filters.state) continue;
      if (filters.readyToClaimOnly && progress?.state !== "ready_to_claim" && progress?.state !== "verified") {
        continue;
      }
      if (query) {
        const haystack = `${achievement.title} ${achievement.tier} ${branch.name} ${category.name} ${tree.name} ${achievement.req}`.toLowerCase();
        if (!haystack.includes(query)) continue;
      }
      hits.push({ achievement, branch, category, tree, progress });
    }
    return hits;
  }

  overall(userId: string) {
    return rollupOverall(this.catalog, this.listProgress(userId));
  }

  /** Heuristic home line from rollup — not the user-set Focus record. */
  focus(userId: string) {
    return focusLabel(this.overall(userId), this.catalog);
  }

  listCollections(userId: string, branchId?: string): CollectionItem[] {
    this.assertUser(userId);
    return this.collections.filter(
      (item) => item.userId === userId && (!branchId || item.branchId === branchId),
    );
  }

  collectionCounts(userId: string, branchId: string) {
    return countCollections(this.listCollections(userId, branchId));
  }

  getCollection(userId: string, id: string): CollectionItem {
    this.assertUser(userId);
    const found = this.collections.find((item) => item.userId === userId && item.id === id);
    if (!found) throw new NotFoundError(`Unknown collection item ${id}`);
    return found;
  }

  createCollectionItem(
    userId: string,
    input: {
      branchId: string;
      title: string;
      type?: string;
      subtype?: string;
      state?: CollectionState;
      notes?: string;
      difficulty?: string;
      tags?: string[];
      source?: string;
      prerequisites?: string[];
      rating?: number;
      reflection?: string;
      repertoire?: Partial<RepertoireMetadata>;
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): CollectionItem {
    this.assertUser(userId);
    requireBranch(this.catalog, input.branchId);
    const title = input.title.trim();
    if (!title) throw new DomainRuleError("invalid_collection", "Collection items need a title.");
    const kind = collectionKindForBranch(this.catalog, input.branchId);
    const state: CollectionState = input.state ?? "saved";
    if (!isCollectionState(state)) {
      throw new DomainRuleError("invalid_collection_state", `Unknown collection state "${String(input.state)}".`);
    }
    const at = nowIso();
    const repertoire =
      kind === "repertoire" || input.repertoire
        ? { ...emptyRepertoire(), ...input.repertoire }
        : undefined;
    const item: CollectionItem = {
      id: newEntityId("collection", `${userId}|${input.branchId}|${title}|${at}|${this.collections.length}`),
      userId,
      branchId: input.branchId,
      title,
      type: input.type ?? defaultCollectionType(kind),
      subtype: input.subtype,
      state,
      dateAdded: at,
      startedAt: state === "active" || state === "competent" || state === "completed" ? at : null,
      completedAt: state === "completed" ? at : null,
      difficulty: input.difficulty,
      notes: input.notes ?? "",
      evidence: [],
      source: input.source,
      prerequisites: input.prerequisites ?? [],
      tags: input.tags ?? [],
      rating: input.rating,
      reflection: input.reflection,
      repertoire,
      updatedAt: at,
    };
    this.collections.push(item);
    this.appendLedger(
      userId,
      "collection_created",
      { id: item.id, branchId: item.branchId, title: item.title, state: item.state },
      provenance,
    );
    return item;
  }

  updateCollectionItem(
    userId: string,
    id: string,
    patch: {
      title?: string;
      state?: CollectionState;
      notes?: string;
      difficulty?: string;
      tags?: string[];
      rating?: number;
      reflection?: string;
      repertoire?: Partial<RepertoireMetadata>;
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): CollectionItem {
    const current = this.getCollection(userId, id);
    const at = nowIso();
    let state = current.state;
    if (patch.state) {
      if (!isCollectionState(patch.state)) {
        throw new DomainRuleError("invalid_collection_state", `Unknown collection state "${patch.state}".`);
      }
      assertCollectionTransition(current.state, patch.state);
      state = patch.state;
    }
    const repertoire = patch.repertoire
      ? { ...(current.repertoire ?? emptyRepertoire()), ...patch.repertoire }
      : current.repertoire;
    const next: CollectionItem = {
      ...current,
      title: patch.title?.trim() || current.title,
      state,
      notes: patch.notes ?? current.notes,
      difficulty: patch.difficulty ?? current.difficulty,
      tags: patch.tags ?? current.tags,
      rating: patch.rating ?? current.rating,
      reflection: patch.reflection ?? current.reflection,
      repertoire,
      startedAt:
        current.startedAt ??
        (state === "active" || state === "competent" || state === "completed" ? at : current.startedAt),
      completedAt: state === "completed" ? (current.completedAt ?? at) : state === "archived" ? current.completedAt : null,
      updatedAt: at,
    };
    const index = this.collections.findIndex((item) => item.id === id && item.userId === userId);
    this.collections[index] = next;
    this.appendLedger(
      userId,
      "collection_updated",
      { id: next.id, state: next.state, title: next.title },
      provenance,
    );
    return next;
  }

  listNorthStars(userId: string): NorthStar[] {
    this.assertUser(userId);
    return this.northStars.filter((item) => item.userId === userId);
  }

  getNorthStar(userId: string, id: string): NorthStar {
    this.assertUser(userId);
    const found = this.northStars.find((item) => item.userId === userId && item.id === id);
    if (!found) throw new NotFoundError(`Unknown North Star ${id}`);
    return found;
  }

  createNorthStar(
    userId: string,
    input: {
      name: string;
      type?: string;
      currentValue?: number;
      targetValue: number;
      unit?: string;
      deadline?: string | null;
      reason?: string;
      linkedBranchIds?: string[];
      linkedCategoryIds?: string[];
      status?: NorthStarState;
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): NorthStar {
    this.assertUser(userId);
    const name = input.name.trim();
    if (!name) throw new DomainRuleError("invalid_north_star", "North Stars need a name.");
    if (!Number.isFinite(input.targetValue)) {
      throw new DomainRuleError("invalid_north_star", "North Stars need a numeric target.");
    }
    const status: NorthStarState = input.status ?? "active";
    if (!isNorthStarState(status)) {
      throw new DomainRuleError("invalid_north_star_state", `Unknown North Star status "${String(input.status)}".`);
    }
    const at = nowIso();
    const currentValue = input.currentValue ?? 0;
    const history: NorthStarHistoryEntry[] = [
      { at, value: currentValue, note: "created", source: "system", xpGranted: 0 },
    ];
    const star: NorthStar = {
      id: newEntityId("northstar", `${userId}|${name}|${at}|${this.northStars.length}`),
      userId,
      name,
      type: input.type ?? "goal",
      currentValue,
      targetValue: input.targetValue,
      unit: input.unit ?? "units",
      deadline: input.deadline ?? null,
      reason: input.reason ?? "",
      linkedBranchIds: input.linkedBranchIds ?? [],
      linkedCategoryIds: input.linkedCategoryIds ?? [],
      status,
      history,
      createdAt: at,
      updatedAt: at,
    };
    this.northStars.push(star);
    this.appendLedger(
      userId,
      "north_star_created",
      { id: star.id, name: star.name, xpGranted: xpFromNorthStarEvent() },
      provenance,
    );
    this.maybeFlagAttention(userId);
    return star;
  }

  updateNorthStar(
    userId: string,
    id: string,
    patch: {
      name?: string;
      status?: NorthStarState;
      currentValue?: number;
      targetValue?: number;
      unit?: string;
      deadline?: string | null;
      reason?: string;
      linkedBranchIds?: string[];
      linkedCategoryIds?: string[];
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): NorthStar {
    const current = this.getNorthStar(userId, id);
    if (patch.status) {
      if (!isNorthStarState(patch.status)) {
        throw new DomainRuleError("invalid_north_star_state", `Unknown North Star status "${patch.status}".`);
      }
      assertNorthStarTransition(current.status, patch.status);
    }
    const at = nowIso();
    const next: NorthStar = {
      ...current,
      name: patch.name?.trim() || current.name,
      status: patch.status ?? current.status,
      currentValue: patch.currentValue ?? current.currentValue,
      targetValue: patch.targetValue ?? current.targetValue,
      unit: patch.unit ?? current.unit,
      deadline: patch.deadline === undefined ? current.deadline : patch.deadline,
      reason: patch.reason ?? current.reason,
      linkedBranchIds: patch.linkedBranchIds ?? current.linkedBranchIds,
      linkedCategoryIds: patch.linkedCategoryIds ?? current.linkedCategoryIds,
      updatedAt: at,
    };
    const index = this.northStars.findIndex((item) => item.id === id && item.userId === userId);
    this.northStars[index] = next;
    this.appendLedger(userId, "north_star_updated", { id: next.id, status: next.status, xpGranted: 0 }, provenance);
    return next;
  }

  recordNorthStarProgress(
    userId: string,
    id: string,
    input: { value: number; note?: string; source?: NorthStarHistoryEntry["source"] | string },
    provenance: Provenance = { source: "manual", actor: "user" },
  ): NorthStar {
    const current = this.getNorthStar(userId, id);
    const at = nowIso();
    const source: NorthStarHistoryEntry["source"] = isSpendLikeSource(input.source)
      ? "spend"
      : input.source === "pulse" || input.source === "system" || input.source === "manual"
        ? input.source
        : "manual";
    const entry: NorthStarHistoryEntry = {
      at,
      value: input.value,
      note: input.note,
      source,
      xpGranted: xpFromNorthStarEvent(source),
    };
    const next: NorthStar = {
      ...current,
      currentValue: input.value,
      history: [...current.history, entry],
      updatedAt: at,
    };
    const index = this.northStars.findIndex((item) => item.id === id && item.userId === userId);
    this.northStars[index] = next;
    this.appendLedger(
      userId,
      "north_star_progress",
      { id: next.id, value: input.value, source, xpGranted: 0 },
      provenance,
    );
    return next;
  }

  getFocusRecord(userId: string): FocusRecord | null {
    this.assertUser(userId);
    return this.focusByUser.get(userId) ?? null;
  }

  setFocus(
    userId: string,
    items: FocusItem[],
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): FocusRecord {
    this.assertUser(userId);
    const record: FocusRecord = {
      userId,
      items,
      updatedAt: nowIso(),
    };
    this.focusByUser.set(userId, record);
    this.appendLedger(
      userId,
      "focus_updated",
      { count: items.length, ids: items.map((item) => `${item.kind}:${item.id}`) },
      provenance,
    );
    this.maybeFlagAttention(userId);
    return record;
  }

  listSeasons(userId: string): Season[] {
    this.assertUser(userId);
    return this.seasons.filter((item) => item.userId === userId);
  }

  getActiveSeason(userId: string): Season | null {
    return this.listSeasons(userId).find((item) => item.status === "active") ?? null;
  }

  getSeason(userId: string, id: string): Season {
    this.assertUser(userId);
    const found = this.seasons.find((item) => item.userId === userId && item.id === id);
    if (!found) throw new NotFoundError(`Unknown Season ${id}`);
    return found;
  }

  createSeason(
    userId: string,
    input: {
      name: string;
      startsAt: string;
      endsAt: string;
      priorityBranchIds?: string[];
      priorityCategoryIds?: string[];
      status?: SeasonState;
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): Season {
    this.assertUser(userId);
    const weeks = assertSeasonLength(input.startsAt, input.endsAt);
    const name = input.name.trim() || "Season";
    const status: SeasonState = input.status ?? "active";
    if (status === "active") {
      for (const season of this.seasons) {
        if (season.userId === userId && season.status === "active") {
          season.status = "archived";
          season.updatedAt = nowIso();
        }
      }
    }
    const at = nowIso();
    const season: Season = {
      id: newEntityId("season", `${userId}|${name}|${input.startsAt}|${at}`),
      userId,
      name,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      priorityBranchIds: input.priorityBranchIds ?? [],
      priorityCategoryIds: input.priorityCategoryIds ?? [],
      status,
      review: null,
      createdAt: at,
      updatedAt: at,
    };
    this.seasons.push(season);
    const rec = recommendedPriorityCount(season.priorityBranchIds.length + season.priorityCategoryIds.length);
    this.appendLedger(
      userId,
      "season_created",
      {
        id: season.id,
        weeks,
        priorityNote: rec.note,
        xpGranted: seasonCompletionXp(season),
      },
      provenance,
    );
    this.maybeFlagAttention(userId);
    return season;
  }

  updateSeason(
    userId: string,
    id: string,
    patch: {
      name?: string;
      startsAt?: string;
      endsAt?: string;
      priorityBranchIds?: string[];
      priorityCategoryIds?: string[];
      status?: SeasonState;
      reviewIntention?: string;
      reviewActual?: string;
    },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): Season {
    const current = this.getSeason(userId, id);
    const startsAt = patch.startsAt ?? current.startsAt;
    const endsAt = patch.endsAt ?? current.endsAt;
    assertSeasonLength(startsAt, endsAt);
    const at = nowIso();
    let review = current.review;
    if (patch.reviewIntention || patch.reviewActual) {
      review = {
        intention: patch.reviewIntention ?? current.review?.intention ?? "",
        actual: patch.reviewActual ?? current.review?.actual ?? "",
        at,
      };
    }
    const next: Season = {
      ...current,
      name: patch.name?.trim() || current.name,
      startsAt,
      endsAt,
      priorityBranchIds: patch.priorityBranchIds ?? current.priorityBranchIds,
      priorityCategoryIds: patch.priorityCategoryIds ?? current.priorityCategoryIds,
      status: patch.status ?? current.status,
      review,
      updatedAt: at,
    };
    const index = this.seasons.findIndex((item) => item.id === id && item.userId === userId);
    this.seasons[index] = next;
    const xp = next.status === "completed" ? seasonCompletionXp(next) : 0;
    this.appendLedger(userId, "season_updated", { id: next.id, status: next.status, xpGranted: xp }, provenance);
    return next;
  }

  completeSeason(
    userId: string,
    id: string,
    review: { intention: string; actual: string },
    provenance: Provenance = { source: "atlas", actor: "user" },
  ): { season: Season; xpGranted: 0 } {
    const season = this.updateSeason(
      userId,
      id,
      { status: "completed", reviewIntention: review.intention, reviewActual: review.actual },
      provenance,
    );
    return { season, xpGranted: seasonCompletionXp(season) };
  }

  listDailyChallenges(userId: string, date?: string): DailyChallenge[] {
    this.assertUser(userId);
    const day = date ?? todayUtcDate();
    return this.dailyChallenges.filter((item) => item.userId === userId && item.date === day);
  }

  ensureDailyChallenges(userId: string, date?: string): DailyChallenge[] {
    this.assertUser(userId);
    const day = date ?? todayUtcDate();
    const existing = this.listDailyChallenges(userId, day);
    if (existing.length > 0) return existing;
    const planned = planDailyChallenges({
      userId,
      date: day,
      focus: this.getFocusRecord(userId),
      season: this.getActiveSeason(userId),
      northStars: this.listNorthStars(userId),
      branchName: (id) => this.catalog.branches.find((branch) => branch.id === id)?.name ?? "this Branch",
    });
    const records: DailyChallenge[] = planned.map((item) => ({
      ...item,
      done: false,
      completedAt: null,
    }));
    this.dailyChallenges.push(...records);
    this.appendLedger(
      userId,
      "daily_challenge_generated",
      { date: day, count: records.length, xpGranted: 0 },
      { source: "system", actor: "system" },
    );
    return records;
  }

  completeDailyChallenge(userId: string, id: string): DailyChallenge {
    this.assertUser(userId);
    const found = this.dailyChallenges.find((item) => item.userId === userId && item.id === id);
    if (!found) throw new NotFoundError(`Unknown daily challenge ${id}`);
    found.done = true;
    found.completedAt = nowIso();
    this.appendLedger(
      userId,
      "daily_challenge_completed",
      { id: found.id, xpGranted: 0 },
      { source: "manual", actor: "user" },
    );
    return found;
  }

  attentionBudget(userId: string) {
    this.assertUser(userId);
    return evaluateAttentionBudget({
      focus: this.getFocusRecord(userId),
      northStars: this.listNorthStars(userId),
      season: this.getActiveSeason(userId),
      collections: this.listCollections(userId),
      labels: {
        branchName: (id) => this.catalog.branches.find((branch) => branch.id === id)?.name ?? id,
      },
    });
  }

  compass(userId: string) {
    this.assertUser(userId);
    return recommendNext({
      catalog: this.catalog,
      progress: this.listProgress(userId),
      focus: this.getFocusRecord(userId),
      season: this.getActiveSeason(userId),
      northStars: this.listNorthStars(userId),
      collections: this.listCollections(userId),
      budget: this.attentionBudget(userId),
    });
  }

  explainReady(userId: string, achievementId: string) {
    const achievement = this.achievement(achievementId);
    return explainReadyToClaim({
      achievement,
      progress: this.getProgress(userId, achievementId),
      evidenceCount: this.listEvidence(userId, achievementId).length,
    });
  }

  snapshot(userId: string): PersistSnapshot {
    this.assertUser(userId);
    return {
      version: 2,
      userId,
      progress: this.listProgress(userId),
      evidence: this.listEvidence(userId),
      claims: this.listClaims(userId),
      ledger: this.listLedger(userId),
      competence: [...this.competence.values()].filter((item) => item.userId === userId),
      manualLogs: this.listManualLogs(userId),
      collections: this.listCollections(userId),
      northStars: this.listNorthStars(userId),
      focus: this.getFocusRecord(userId),
      seasons: this.listSeasons(userId),
      dailyChallenges: this.dailyChallenges.filter((item) => item.userId === userId),
    };
  }

  restore(snapshot: PersistSnapshot): void {
    this.assertUser(snapshot.userId);
    for (const item of snapshot.progress) {
      if (item.userId !== snapshot.userId) throw new IsolationError("Snapshot progress mixed users");
      this.progress.set(this.key(item.userId, item.achievementId), item);
    }
    this.evidence.push(...snapshot.evidence.filter((item) => item.userId === snapshot.userId));
    this.claims.push(...snapshot.claims.filter((item) => item.userId === snapshot.userId));
    this.ledger.push(...snapshot.ledger.filter((item) => item.userId === snapshot.userId));
    for (const item of snapshot.competence) {
      if (item.userId !== snapshot.userId) continue;
      this.competence.set(this.competenceKey(item.userId, item.branchId), item);
    }
    this.manualLogs.push(...snapshot.manualLogs.filter((item) => item.userId === snapshot.userId));
    this.collections.push(...(snapshot.collections ?? []).filter((item) => item.userId === snapshot.userId));
    this.northStars.push(...(snapshot.northStars ?? []).filter((item) => item.userId === snapshot.userId));
    if (snapshot.focus && snapshot.focus.userId === snapshot.userId) {
      this.focusByUser.set(snapshot.userId, snapshot.focus);
    }
    this.seasons.push(...(snapshot.seasons ?? []).filter((item) => item.userId === snapshot.userId));
    this.dailyChallenges.push(
      ...(snapshot.dailyChallenges ?? []).filter((item) => item.userId === snapshot.userId),
    );
  }

  recordPulseInvocation(
    userId: string,
    tool: string,
    ok: boolean,
    extra: Record<string, unknown> = {},
  ): void {
    this.assertUser(userId);
    this.appendLedger(
      userId,
      !ok && (tool === "claim_achievement" || extra.code === "auto_claim_forbidden")
        ? "pulse_claim_rejected"
        : "pulse_tool_invoked",
      { tool, ok, ...extra },
      { source: "pulse_stub", actor: "pulse", note: "pulse_tool" },
    );
  }

  private maybeFlagAttention(userId: string): void {
    const budget = this.attentionBudget(userId);
    if (!budget.overloaded) return;
    this.appendLedger(
      userId,
      "attention_budget_flagged",
      { highLoadGoalCount: budget.highLoadGoalCount, limit: budget.limit },
      { source: "system", actor: "system" },
    );
  }
}
