import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PulseLogo } from "../src/components/PulseLogo";
import { PsxCard } from "../src/components/PsxCard";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { colors, type as typeStyles } from "../src/theme/tokens";

export default function PulseHome() {
  const router = useRouter();
  const { status, error, overall, listening, setListening, store, userId, catalog } = usePsx();
  const focus = store ? store.focus(userId) : null;
  const percent = overall?.percent ?? 0;
  const onTrack = percent >= 40;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/ledger")} hitSlop={12}>
          <Text style={styles.corner}>LEDGER</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/settings")} hitSlop={12}>
          <Text style={styles.corner}>SETTINGS</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setListening(!listening)}
        style={styles.logoWrap}
        accessibilityRole="button"
        accessibilityLabel={listening ? "Stop listening stub" : "Tap to talk stub"}
      >
        <PulseLogo listening={listening} size={250} />
      </Pressable>

      <Text style={[typeStyles.display, { textAlign: "center" }]}>PULSE</Text>
      <Text style={styles.prompt}>
        {listening ? "Listening... Tap the logo to stop." : "Tap to speak or type."}
      </Text>
      <Text style={[typeStyles.muted, { textAlign: "center" }]}>
        {listening ? "Voice is a Phase 2 stub." : "I'm here to help."}
      </Text>

      {status === "missing_catalog" ? (
        <PsxCard eyebrow="Catalog">
          <Text style={typeStyles.title}>Canonical data not installed</Text>
          <Text style={[typeStyles.muted, { marginTop: 8 }]}>
            Write data/canonical_data.json verbatim (schema psx.canonical_data.v1). Atlas will show the 7
            trees once the file is imported. Do not invent a replacement taxonomy.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </PsxCard>
      ) : null}

      <PsxCard
        eyebrow="Focus"
        right={
          <View>
            <Text style={styles.today}>TODAY</Text>
            <Text style={styles.pct}>{percent}%</Text>
          </View>
        }
      >
        <Text style={typeStyles.title}>{focus?.title ?? "Discipline in the details."}</Text>
        <Text style={[typeStyles.muted, { marginTop: 6 }]}>
          {focus?.subtitle ?? "Show up. Execute. Elevate."}
        </Text>
      </PsxCard>

      <PsxCard
        eyebrow="Progress"
        right={<Text style={styles.onTrack}>{onTrack ? "ON TRACK" : "BUILDING"}</Text>}
      >
        <Text style={typeStyles.body}>
          {percent}% OVERALL
          {catalog ? ` · ${overall?.claimed ?? 0}/${catalog.counts.achievements}` : ""}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
        </View>
      </PsxCard>

      <Link href="/atlas" asChild>
        <Pressable style={styles.overview}>
          <Text style={typeStyles.eyebrow}>System Overview</Text>
          <Text style={styles.down}>⌄</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  corner: { color: colors.silver, letterSpacing: 2, fontSize: 11, fontWeight: "600" },
  logoWrap: { alignItems: "center", marginTop: 8, marginBottom: 4 },
  prompt: { color: colors.offWhite, textAlign: "center", fontSize: 16, marginTop: 4 },
  today: { color: colors.gold, fontSize: 10, letterSpacing: 2, textAlign: "right" },
  pct: { color: colors.gold, fontSize: 28, fontWeight: "700", textAlign: "right" },
  onTrack: { color: colors.gold, fontSize: 11, letterSpacing: 1.6, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#2A2A2A",
    marginTop: 12,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.gold, borderRadius: 99 },
  overview: { alignItems: "center", paddingVertical: 18, gap: 4 },
  down: { color: colors.gold, fontSize: 18 },
  error: { color: colors.pulseRed, marginTop: 8, fontSize: 13 },
});
