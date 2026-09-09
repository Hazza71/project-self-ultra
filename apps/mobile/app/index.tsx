import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PulseLogo } from "../src/components/PulseLogo";
import { PsxCard } from "../src/components/PsxCard";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { formatNorthStarProgress, summarisePulseTurn } from "@psx/domain";
import { colors, type as typeStyles } from "../src/theme/tokens";

export default function PulseHome() {
  const router = useRouter();
  const {
    status,
    error,
    overall,
    listening,
    setListening,
    store,
    userId,
    catalog,
    askPulse,
    lastPulse,
  } = usePsx();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const heuristic = store ? store.focus(userId) : null;
  const focusRecord = store ? store.getFocusRecord(userId) : null;
  const season = store ? store.getActiveSeason(userId) : null;
  const stars = store ? store.listNorthStars(userId) : [];
  const activeStar = stars.find((item) => item.status === "active") ?? stars[0];
  const ready = overall?.ready ?? 0;
  const budget = store ? store.attentionBudget(userId) : null;
  const percent = overall?.percent ?? 0;
  const onTrack = percent >= 40;

  const focusTitle =
    focusRecord?.items[0] && catalog
      ? catalog.branches.find((item) => item.id === focusRecord.items[0]?.id)?.name ??
        catalog.categories.find((item) => item.id === focusRecord.items[0]?.id)?.name ??
        heuristic?.title
      : heuristic?.title;
  const focusSubtitle = season
    ? `${season.name} · ${focusRecord?.items.length ?? 0} focus`
    : heuristic?.subtitle ?? "Show up. Execute. Elevate.";

  const signal = budget?.overloaded
    ? budget.suggestion
    : ready > 0
      ? `${ready} Ready to Claim in Atlas. Pulse will not claim them.`
      : "All quiet.";

  const sendPulse = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const turn = await askPulse(text);
      setDraft("");
      if (turn?.navigation?.href) router.push(turn.navigation.href as never);
    } finally {
      setBusy(false);
    }
  };

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
        <PulseLogo listening={listening} size={220} />
      </Pressable>

      <Text style={[typeStyles.display, { textAlign: "center" }]}>PULSE</Text>
      <Text style={styles.prompt}>
        {listening ? "Listening... Tap the logo to stop." : "Tap to speak or type."}
      </Text>
      <Text style={[typeStyles.muted, { textAlign: "center" }]}>
        {listening ? "Voice TTS is out of Phase 2. Typed tools are live." : "I'm here to help."}
      </Text>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Ask Pulse — search, log, collections, north stars…"
        placeholderTextColor={colors.muted}
        style={styles.input}
        onSubmitEditing={() => void sendPulse()}
        returnKeyType="send"
      />
      <Pressable style={styles.send} onPress={() => void sendPulse()} disabled={busy}>
        <Text style={styles.sendText}>{busy ? "Working…" : "Send to Pulse"}</Text>
      </Pressable>
      {lastPulse ? <Text style={typeStyles.muted}>{summarisePulseTurn(lastPulse)}</Text> : null}

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

      <Pressable onPress={() => router.push("/focus")}>
        <PsxCard
          eyebrow="Focus"
          right={
            <View>
              <Text style={styles.today}>NOW</Text>
              <Text style={styles.pct}>{percent}%</Text>
            </View>
          }
        >
          <Text style={typeStyles.title}>{focusTitle ?? "Discipline in the details."}</Text>
          <Text style={[typeStyles.muted, { marginTop: 6 }]}>{focusSubtitle}</Text>
        </PsxCard>
      </Pressable>

      <PsxCard eyebrow="Signal">
        <Text style={typeStyles.body}>{signal}</Text>
      </PsxCard>

      <Pressable onPress={() => router.push(activeStar ? `/north-stars/${activeStar.id}` : "/north-stars")}>
        <PsxCard eyebrow="North Star" right={<Text style={styles.onTrack}>{activeStar ? "OPEN" : "SET"}</Text>}>
          {activeStar ? (
            <>
              <Text style={typeStyles.title}>{activeStar.name}</Text>
              <Text style={[typeStyles.muted, { marginTop: 6 }]}>{formatNorthStarProgress(activeStar)}</Text>
            </>
          ) : (
            <Text style={typeStyles.body}>Set a concrete target. Spending does not grant XP.</Text>
          )}
        </PsxCard>
      </Pressable>

      <PsxCard eyebrow="Progress" right={<Text style={styles.onTrack}>{onTrack ? "ON TRACK" : "BUILDING"}</Text>}>
        <Text style={typeStyles.body}>
          {percent}% OVERALL
          {catalog ? ` · ${overall?.claimed ?? 0}/${catalog.counts.achievements}` : ""}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
        </View>
      </PsxCard>

      <View style={styles.row}>
        <Pressable style={styles.link} onPress={() => router.push("/compass")}>
          <Text style={typeStyles.eyebrow}>Compass</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.push("/north-stars")}>
          <Text style={typeStyles.eyebrow}>Stars</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.push("/focus")}>
          <Text style={typeStyles.eyebrow}>Season</Text>
        </Pressable>
      </View>

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
  logoWrap: { alignItems: "center", marginTop: 4, marginBottom: 4 },
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
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    color: colors.offWhite,
    backgroundColor: colors.graphite,
  },
  send: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  sendText: { color: colors.gold, fontWeight: "700", letterSpacing: 1.2 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  link: { flex: 1, alignItems: "center", paddingVertical: 10 },
});
