import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AutoClaimForbiddenError,
  CanonicalImportError,
  createLocalPulseRuntime,
  importCanonical,
  MemoryStore,
  type Catalog,
  type CollectionState,
  type FocusItem,
  type OverallRollup,
  type PulseTurnResult,
  type SearchFilters,
  type SearchHit,
} from "@psx/domain";
import bundled from "../../assets/canonical_data.json";

const USER_KEY = "psx.localUserId";
const SNAP_KEY = "psx.snapshot.v1";

type Status = "loading" | "ready" | "missing_catalog" | "error";

type PsxContextValue = {
  status: Status;
  error: string | null;
  userId: string;
  store: MemoryStore | null;
  catalog: Catalog | null;
  overall: OverallRollup | null;
  listening: boolean;
  setListening: (value: boolean) => void;
  lastPulse: PulseTurnResult | null;
  refresh: () => void;
  persistNow: () => void;
  search: (filters?: SearchFilters) => SearchHit[];
  start: (achievementId: string) => void;
  logEvidence: (achievementId: string, note?: string) => void;
  claim: (achievementId: string) => void;
  logManual: (body: string, achievementId?: string) => void;
  addCollection: (
    branchId: string,
    title: string,
    extra?: { state?: CollectionState; notes?: string; difficulty?: string },
  ) => void;
  updateCollectionState: (id: string, state: CollectionState) => void;
  addNorthStar: (input: {
    name: string;
    targetValue: number;
    currentValue?: number;
    unit?: string;
    type?: string;
    deadline?: string;
    reason?: string;
    linkedBranchIds?: string[];
  }) => void;
  recordNorthStar: (id: string, value: number, note?: string) => void;
  setFocusItems: (items: FocusItem[]) => void;
  startSeason: (input: { name: string; weeks?: number; priorityBranchIds: string[] }) => void;
  completeChallenge: (id: string) => void;
  askPulse: (text: string) => Promise<PulseTurnResult | null>;
  signOut: () => Promise<void>;
};

const PsxContext = createContext<PsxContextValue | null>(null);

function tryImport(): Catalog | null {
  const raw = bundled as { _status?: string };
  if (raw._status === "awaiting_canonical_file") return null;
  return importCanonical(bundled);
}

async function ensureUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(USER_KEY);
  if (existing) return existing;
  const id = `local-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
  await AsyncStorage.setItem(USER_KEY, id);
  return id;
}

export function PsxProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("local-pending");
  const [store, setStore] = useState<MemoryStore | null>(null);
  const [listening, setListening] = useState(false);
  const [lastPulse, setLastPulse] = useState<PulseTurnResult | null>(null);
  const [tick, setTick] = useState(0);

  const persist = useCallback(async (next: MemoryStore, uid: string) => {
    await AsyncStorage.setItem(SNAP_KEY, JSON.stringify(next.snapshot(uid)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = tryImport();
        const uid = await ensureUserId();
        if (cancelled) return;
        setUserId(uid);
        if (!catalog) {
          setStatus("missing_catalog");
          return;
        }
        const memory = new MemoryStore(catalog);
        const snapRaw = await AsyncStorage.getItem(SNAP_KEY);
        if (snapRaw) {
          try {
            const snap = JSON.parse(snapRaw);
            if (snap.userId === uid) memory.restore(snap);
          } catch {
            // ignore corrupt snapshot
          }
        }
        if (cancelled) return;
        setStore(memory);
        setStatus("ready");
      } catch (err) {
        if (err instanceof CanonicalImportError) {
          setError(err.message);
          setStatus("missing_catalog");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to start PSX");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const value = useMemo<PsxContextValue>(() => {
    const overall = store ? store.overall(userId) : null;
    const persistNow = () => {
      if (store) void persist(store, userId);
    };
    return {
      status,
      error,
      userId,
      store,
      catalog: store?.catalog ?? null,
      overall,
      listening,
      setListening,
      lastPulse,
      refresh,
      persistNow,
      search: (filters) => (store ? store.search(userId, filters) : []),
      start: (achievementId) => {
        if (!store) return;
        store.start(userId, achievementId, { source: "atlas", actor: "user" });
        persistNow();
        refresh();
      },
      logEvidence: (achievementId, note) => {
        if (!store) return;
        store.logEvidence(
          userId,
          achievementId,
          { payload: note ? { note } : {}, incrementReps: 1 },
          { source: "manual", actor: "user" },
        );
        persistNow();
        refresh();
      },
      claim: (achievementId) => {
        if (!store) return;
        try {
          store.claim(userId, achievementId, {
            explicitUserAction: true,
            actor: "user",
            source: "atlas",
          });
          persistNow();
          refresh();
        } catch (err) {
          if (err instanceof AutoClaimForbiddenError) throw err;
          throw err;
        }
      },
      logManual: (body, achievementId) => {
        if (!store) return;
        store.logManual(userId, body, { source: "manual", actor: "user" }, achievementId);
        persistNow();
        refresh();
      },
      addCollection: (branchId, title, extra) => {
        if (!store) return;
        store.createCollectionItem(
          userId,
          { branchId, title, state: extra?.state, notes: extra?.notes, difficulty: extra?.difficulty },
          { source: "atlas", actor: "user" },
        );
        persistNow();
        refresh();
      },
      updateCollectionState: (id, state) => {
        if (!store) return;
        store.updateCollectionItem(userId, id, { state }, { source: "atlas", actor: "user" });
        persistNow();
        refresh();
      },
      addNorthStar: (input) => {
        if (!store) return;
        store.createNorthStar(userId, input, { source: "atlas", actor: "user" });
        persistNow();
        refresh();
      },
      recordNorthStar: (id, value, note) => {
        if (!store) return;
        store.recordNorthStarProgress(userId, id, { value, note, source: "manual" }, { source: "manual", actor: "user" });
        persistNow();
        refresh();
      },
      setFocusItems: (items) => {
        if (!store) return;
        store.setFocus(userId, items, { source: "atlas", actor: "user" });
        persistNow();
        refresh();
      },
      startSeason: (input) => {
        if (!store) return;
        const weeks = input.weeks ?? 8;
        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
        store.createSeason(
          userId,
          {
            name: input.name,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            priorityBranchIds: input.priorityBranchIds,
            status: "active",
          },
          { source: "atlas", actor: "user" },
        );
        persistNow();
        refresh();
      },
      completeChallenge: (id) => {
        if (!store) return;
        store.completeDailyChallenge(userId, id);
        persistNow();
        refresh();
      },
      askPulse: async (text) => {
        if (!store) return null;
        const runtime = createLocalPulseRuntime(store, userId);
        const turn = await runtime.turn(text);
        setLastPulse(turn);
        persistNow();
        refresh();
        return turn;
      },
      signOut: async () => {
        await AsyncStorage.multiRemove([SNAP_KEY, USER_KEY]);
        const uid = await ensureUserId();
        setUserId(uid);
        setLastPulse(null);
        if (store) {
          const fresh = new MemoryStore(store.catalog);
          setStore(fresh);
        }
        refresh();
      },
    };
  }, [status, error, userId, store, listening, lastPulse, persist, refresh, tick]);

  return <PsxContext.Provider value={value}>{children}</PsxContext.Provider>;
}

export function usePsx(): PsxContextValue {
  const ctx = useContext(PsxContext);
  if (!ctx) throw new Error("usePsx must be used within PsxProvider");
  return ctx;
}
