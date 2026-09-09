import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AutoClaimForbiddenError,
  CanonicalImportError,
  importCanonical,
  MemoryStore,
  type Catalog,
  type OverallRollup,
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
  refresh: () => void;
  search: (filters?: SearchFilters) => SearchHit[];
  start: (achievementId: string) => void;
  logEvidence: (achievementId: string, note?: string) => void;
  claim: (achievementId: string) => void;
  logManual: (body: string, achievementId?: string) => void;
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
    return {
      status,
      error,
      userId,
      store,
      catalog: store?.catalog ?? null,
      overall,
      listening,
      setListening,
      refresh,
      search: (filters) => (store ? store.search(userId, filters) : []),
      start: (achievementId) => {
        if (!store) return;
        store.start(userId, achievementId, { source: "atlas", actor: "user" });
        void persist(store, userId);
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
        void persist(store, userId);
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
          void persist(store, userId);
          refresh();
        } catch (err) {
          if (err instanceof AutoClaimForbiddenError) throw err;
          throw err;
        }
      },
      logManual: (body, achievementId) => {
        if (!store) return;
        store.logManual(userId, body, { source: "manual", actor: "user" }, achievementId);
        void persist(store, userId);
        refresh();
      },
      signOut: async () => {
        await AsyncStorage.multiRemove([SNAP_KEY, USER_KEY]);
        const uid = await ensureUserId();
        setUserId(uid);
        if (store) {
          const fresh = new MemoryStore(store.catalog);
          setStore(fresh);
        }
        refresh();
      },
    };
  }, [status, error, userId, store, listening, persist, refresh, tick]);

  return <PsxContext.Provider value={value}>{children}</PsxContext.Provider>;
}

export function usePsx(): PsxContextValue {
  const ctx = useContext(PsxContext);
  if (!ctx) throw new Error("usePsx must be used within PsxProvider");
  return ctx;
}
