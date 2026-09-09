import { AutoClaimForbiddenError, IsolationError, NotFoundError } from "../errors.js";
import { newEntityId } from "../ids.js";
import { createLedgerEvent } from "../ledger/ledger.js";
import { assertCanClaim, assertExplicitUserClaim } from "../engine/claim.js";
import { competenceForBranch } from "../engine/competence.js";
import { isEligible } from "../engine/eligibility.js";
import { focusLabel, rollupOverall } from "../engine/progress.js";
import { assertTransition } from "../engine/stateMachine.js";
import type {
  Catalog,
  CatalogAchievement,
  ClaimRecord,
  CompetenceRecord,
  EvidenceRecord,
  ExplicitClaimInput,
  LedgerEvent,
  ManualLogRecord,
  PersistSnapshot,
  Provenance,
  SearchFilters,
  SearchHit,
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

  focus(userId: string) {
    return focusLabel(this.overall(userId), this.catalog);
  }

  snapshot(userId: string): PersistSnapshot {
    this.assertUser(userId);
    return {
      version: 1,
      userId,
      progress: this.listProgress(userId),
      evidence: this.listEvidence(userId),
      claims: this.listClaims(userId),
      ledger: this.listLedger(userId),
      competence: [...this.competence.values()].filter((item) => item.userId === userId),
      manualLogs: this.listManualLogs(userId),
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
  }
}
