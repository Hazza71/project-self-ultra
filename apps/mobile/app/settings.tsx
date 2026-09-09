import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { createSupabase } from "../src/lib/supabase";
import { colors, type as typeStyles } from "../src/theme/tokens";

function Row({ title, body, onPress, danger }: { title: string; body: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.row} disabled={!onPress}>
      <Text style={[styles.rowTitle, danger && { color: colors.pulseRed }]}>{title}</Text>
      <Text style={typeStyles.muted}>{body}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { userId, signOut, catalog } = usePsx();
  const supabaseConfigured = Boolean(createSupabase());

  return (
    <Screen>
      <Text style={typeStyles.title}>Settings</Text>
      <Row title="Profile" body={`Local user ${userId}`} />
      <Row title="Preferences" body="Dark graphite theme (Phase 1 fixed)." />
      <Row
        title="Data & Integrations"
        body={
          supabaseConfigured
            ? "Supabase credentials detected. Catalog still imports locally in Phase 1."
            : "No live Supabase. Progress is stored on-device. Schema/RLS is in supabase/."
        }
      />
      <Row
        title="Catalog"
        body={
          catalog
            ? `${catalog.counts.trees}/${catalog.counts.categories}/${catalog.counts.branches}/${catalog.counts.achievements}`
            : "Awaiting data/canonical_data.json"
        }
      />
      <Row title="Pulse AI" body="Typed tools via mock adapter (PSX_PULSE_ADAPTER=mock). OPENAI_API_KEY is server-only — never ship it in Expo. Voice TTS is out of scope." />
      <Row
        title="Sign Out"
        danger
        body="Clears local progress for this device user."
        onPress={() => {
          Alert.alert("Sign out?", "Local progress will be cleared on this device.", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => void signOut() },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  rowTitle: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
});
