import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ListRow } from "../src/components/ListRow";
import { PsxCard } from "../src/components/PsxCard";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { colors, type as typeStyles } from "../src/theme/tokens";

export default function FocusSeasonScreen() {
  const router = useRouter();
  const { catalog, store, userId, setFocusItems, startSeason, completeChallenge, persistNow, refresh } = usePsx();
  const [query, setQuery] = useState("");
  const [seasonName, setSeasonName] = useState("Current Season");
  const [weeks, setWeeks] = useState("8");
  const focus = store ? store.getFocusRecord(userId) : null;
  const season = store ? store.getActiveSeason(userId) : null;
  const challenges = store ? store.listDailyChallenges(userId) : [];
  const budget = store ? store.attentionBudget(userId) : null;

  useEffect(() => {
    if (!store) return;
    if (store.listDailyChallenges(userId).length > 0) return;
    store.ensureDailyChallenges(userId);
    persistNow();
    refresh();
  }, [store, userId, persistNow, refresh]);

  const matches = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.branches
      .filter((branch) => !q || branch.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [catalog, query]);

  const selected = new Set(focus?.items.filter((item) => item.kind === "branch").map((item) => item.id));

  const toggle = (branchId: string) => {
    const next = new Set(selected);
    if (next.has(branchId)) next.delete(branchId);
    else next.add(branchId);
    setFocusItems([...next].map((id) => ({ kind: "branch" as const, id, load: "high" as const })));
  };

  return (
    <Screen>
      <Text style={typeStyles.title}>Focus & Season</Text>
      <Text style={typeStyles.muted}>
        What matters now. Non-focus skills stay loggable. Completing a Season grants 0 XP.
      </Text>
      {budget?.overloaded ? (
        <PsxCard eyebrow="Attention Budget">
          <Text style={typeStyles.body}>{budget.suggestion}</Text>
        </PsxCard>
      ) : (
        <Text style={typeStyles.muted}>
          High-load goals: {budget?.highLoadGoalCount ?? 0}/{budget?.limit ?? 4}
        </Text>
      )}
      <Text style={typeStyles.eyebrow}>Daily challenges</Text>
      {challenges.map((item) => (
        <Pressable
          key={item.id}
          style={styles.challenge}
          onPress={() => {
            if (!item.done) completeChallenge(item.id);
          }}
        >
          <Text style={typeStyles.body}>
            {item.done ? "✓ " : "○ "}
            {item.title}
          </Text>
        </Pressable>
      ))}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Find a Branch to focus"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      {matches.map((branch) => (
        <ListRow
          key={branch.id}
          title={branch.name}
          subtitle={catalog?.categories.find((item) => item.id === branch.categoryId)?.name}
          meta={selected.has(branch.id) ? "FOCUS" : undefined}
          onPress={() => toggle(branch.id)}
        />
      ))}
      <Text style={typeStyles.eyebrow}>Season (6–12 weeks)</Text>
      {season ? (
        <PsxCard eyebrow={season.name}>
          <Text style={typeStyles.body}>
            {season.startsAt.slice(0, 10)} → {season.endsAt.slice(0, 10)} · {season.priorityBranchIds.length}{" "}
            priorities
          </Text>
          <Pressable
            style={styles.btnSecondary}
            onPress={() => {
              store?.completeSeason(userId, season.id, {
                intention: "Stay on the priorities",
                actual: "Review in Atlas / Ledger",
              });
              persistNow();
              refresh();
            }}
          >
            <Text style={styles.btnSecondaryText}>Complete season (0 XP)</Text>
          </Pressable>
        </PsxCard>
      ) : (
        <>
          <TextInput
            value={seasonName}
            onChangeText={setSeasonName}
            placeholder="Season name"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <TextInput
            value={weeks}
            onChangeText={setWeeks}
            placeholder="Weeks (6–12)"
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable
            style={styles.btn}
            onPress={() => {
              const w = Number(weeks);
              startSeason({
                name: seasonName.trim() || "Season",
                weeks: Number.isFinite(w) ? w : 8,
                priorityBranchIds: [...selected],
              });
            }}
          >
            <Text style={styles.btnText}>Start season from Focus</Text>
          </Pressable>
        </>
      )}
      <Pressable style={styles.link} onPress={() => router.push("/compass")}>
        <Text style={typeStyles.eyebrow}>Open Compass</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    color: colors.offWhite,
    backgroundColor: colors.graphite,
  },
  btn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  btnText: { color: colors.gold, fontWeight: "700", letterSpacing: 1.2 },
  btnSecondary: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  btnSecondaryText: { color: colors.offWhite, fontWeight: "700" },
  challenge: { paddingVertical: 8 },
  link: { alignItems: "center", paddingVertical: 12 },
});
