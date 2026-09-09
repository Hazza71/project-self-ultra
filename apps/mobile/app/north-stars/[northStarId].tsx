import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PsxCard } from "../../src/components/PsxCard";
import { Screen } from "../../src/components/Screen";
import { formatNorthStarProgress } from "@psx/domain";
import { usePsx } from "../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../src/theme/tokens";

export default function NorthStarDetailScreen() {
  const { northStarId } = useLocalSearchParams<{ northStarId: string }>();
  const { store, userId, catalog, recordNorthStar, persistNow, refresh } = usePsx();
  const star = store && northStarId ? store.listNorthStars(userId).find((item) => item.id === northStarId) : undefined;
  const [value, setValue] = useState(star ? String(star.currentValue) : "");
  const [note, setNote] = useState("");

  if (!star || !store) {
    return (
      <Screen>
        <Text style={typeStyles.title}>North Star not found</Text>
      </Screen>
    );
  }

  const linked = star.linkedBranchIds
    .map((id) => catalog?.branches.find((branch) => branch.id === id)?.name)
    .filter(Boolean);

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{star.type}</Text>
      <Text style={typeStyles.title}>{star.name}</Text>
      <Text style={typeStyles.muted}>
        {formatNorthStarProgress(star)}
        {star.deadline ? ` · due ${star.deadline.slice(0, 10)}` : ""}
      </Text>
      {star.reason ? <Text style={typeStyles.body}>{star.reason}</Text> : null}
      {linked.length ? <Text style={typeStyles.muted}>Linked: {linked.join(", ")}</Text> : null}
      <PsxCard eyebrow="Log progress">
        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          placeholder="Current value"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Note (spend notes grant 0 XP)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable
          style={styles.btn}
          onPress={() => {
            const next = Number(value);
            if (!Number.isFinite(next)) return;
            recordNorthStar(star.id, next, note.trim() || undefined);
            setNote("");
          }}
        >
          <Text style={styles.btnText}>Record</Text>
        </Pressable>
      </PsxCard>
      <Pressable
        style={styles.btnSecondary}
        onPress={() => {
          store.updateNorthStar(userId, star.id, { status: star.status === "active" ? "paused" : "active" });
          persistNow();
          refresh();
        }}
      >
        <Text style={styles.btnSecondaryText}>{star.status === "active" ? "Pause" : "Activate"}</Text>
      </Pressable>
      <Text style={typeStyles.eyebrow}>History</Text>
      {star.history
        .slice()
        .reverse()
        .map((entry) => (
          <View key={`${entry.at}-${entry.value}`} style={styles.item}>
            <Text style={typeStyles.body}>
              {entry.value} {star.unit} · {entry.source} · 0 XP
            </Text>
            <Text style={typeStyles.muted}>
              {entry.note ?? "—"} · {entry.at}
            </Text>
          </View>
        ))}
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
    marginBottom: 10,
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
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  btnSecondaryText: { color: colors.offWhite, fontWeight: "700" },
  item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
});
