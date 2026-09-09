import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { colors, type as typeStyles } from "../src/theme/tokens";

export default function LedgerScreen() {
  const { store, userId, logManual } = usePsx();
  const [body, setBody] = useState("");
  const events = store?.listLedger(userId) ?? [];
  const logs = store?.listManualLogs(userId) ?? [];

  return (
    <Screen>
      <Text style={typeStyles.title}>Ledger</Text>
      <Text style={typeStyles.muted}>Canonical event stream. Manual logs carry user provenance.</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Write a manual log"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Pressable
        style={styles.btn}
        onPress={() => {
          if (!body.trim()) return;
          logManual(body.trim());
          setBody("");
        }}
      >
        <Text style={styles.btnText}>Append log</Text>
      </Pressable>
      <Text style={typeStyles.eyebrow}>Manual logs</Text>
      {logs.length === 0 ? <Text style={typeStyles.muted}>None yet.</Text> : null}
      {logs.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={typeStyles.body}>{item.body}</Text>
          <Text style={typeStyles.muted}>{item.createdAt}</Text>
        </View>
      ))}
      <Text style={typeStyles.eyebrow}>Events</Text>
      {events.slice().reverse().map((event) => (
        <View key={event.id} style={styles.item}>
          <Text style={typeStyles.body}>{event.eventType}</Text>
          <Text style={typeStyles.muted}>
            {event.provenance.actor}/{event.provenance.source} · {event.createdAt}
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
  },
  btn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  btnText: { color: colors.gold, fontWeight: "700", letterSpacing: 1.2 },
  item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
});
