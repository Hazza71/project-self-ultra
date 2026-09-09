import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PsxCard } from "../../../src/components/PsxCard";
import { Screen } from "../../../src/components/Screen";
import { usePsx } from "../../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../../src/theme/tokens";

export default function AchievementScreen() {
  const { achievementId } = useLocalSearchParams<{ achievementId: string }>();
  const { catalog, userId, store, start, logEvidence, claim, logManual } = usePsx();
  const [note, setNote] = useState("");
  const achievement = catalog?.achievements.find((item) => item.id === achievementId);
  const branch = catalog?.branches.find((item) => item.id === achievement?.branchId);
  const progress = store && achievement ? store.getProgress(userId, achievement.id) : null;
  const claimable = progress?.state === "ready_to_claim" || progress?.state === "verified";

  if (!achievement) {
    return (
      <Screen>
        <Text style={typeStyles.title}>Achievement not found</Text>
      </Screen>
    );
  }

  const onClaim = () => {
    Alert.alert(
      "Claim achievement?",
      "This is a deliberate Claim. Pulse, imports, and wearables cannot do this for you.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Claim",
          onPress: () => {
            try {
              claim(achievement.id);
            } catch (error) {
              Alert.alert("Claim blocked", error instanceof Error ? error.message : "Unable to claim");
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{branch?.name}</Text>
      <Text style={typeStyles.title}>{achievement.title}</Text>
      <Text style={typeStyles.muted}>
        {achievement.tier} · {achievement.xp} XP · min {achievement.minReps} reps
      </Text>
      <PsxCard eyebrow="State">
        <Text style={typeStyles.title}>{(progress?.state ?? "locked").replaceAll("_", " ")}</Text>
        <Text style={typeStyles.muted}>
          {progress?.reps ?? 0} reps logged. Ready to Claim is not Claimed.
        </Text>
      </PsxCard>
      <PsxCard eyebrow="Requirement">
        <Text style={typeStyles.body}>{achievement.req || "No requirement text."}</Text>
      </PsxCard>
      {progress?.state === "locked" ? (
        <Pressable style={styles.btn} onPress={() => start(achievement.id)}>
          <Text style={styles.btnText}>Start</Text>
        </Pressable>
      ) : null}
      {progress?.state !== "claimed" ? (
        <View style={{ gap: 10 }}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Evidence note (manual)"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable
            style={styles.btnSecondary}
            onPress={() => {
              logEvidence(achievement.id, note || undefined);
              if (note.trim()) logManual(note.trim(), achievement.id);
              setNote("");
            }}
          >
            <Text style={styles.btnSecondaryText}>Log evidence</Text>
          </Pressable>
        </View>
      ) : null}
      {claimable ? (
        <Pressable style={styles.claim} onPress={onClaim}>
          <Text style={styles.claimText}>Claim</Text>
        </Pressable>
      ) : (
        <Text style={typeStyles.muted}>
          Claim appears only when this achievement is Ready to Claim. It is never auto-claimed.
        </Text>
      )}
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
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  btnText: { color: colors.offWhite, letterSpacing: 1.4, fontWeight: "700" },
  btnSecondary: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  btnSecondaryText: { color: colors.gold, letterSpacing: 1.2, fontWeight: "700" },
  claim: {
    backgroundColor: colors.pulseRed,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  claimText: { color: colors.offWhite, letterSpacing: 2, fontWeight: "800", textTransform: "uppercase" },
});
