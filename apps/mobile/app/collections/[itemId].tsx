import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PsxCard } from "../../src/components/PsxCard";
import { Screen } from "../../src/components/Screen";
import { COLLECTION_STATES, collectionKindForBranch, collectionStateLabel } from "@psx/domain";
import { usePsx } from "../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../src/theme/tokens";

export default function CollectionItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { store, userId, catalog, updateCollectionState, persistNow, refresh } = usePsx();
  const item = store && itemId ? store.listCollections(userId).find((entry) => entry.id === itemId) : undefined;
  const branch = catalog?.branches.find((entry) => entry.id === item?.branchId);
  const kind = catalog && item ? collectionKindForBranch(catalog, item.branchId) : "default";
  const [bpm, setBpm] = useState(item?.repertoire?.tempoBpm ? String(item.repertoire.tempoBpm) : "");

  if (!item || !store) {
    return (
      <Screen>
        <Text style={typeStyles.title}>Collection item not found</Text>
      </Screen>
    );
  }

  const saveRepertoire = () => {
    const tempoBpm = bpm.trim() ? Number(bpm) : undefined;
    store.updateCollectionItem(
      userId,
      item.id,
      { repertoire: { tempoBpm: Number.isFinite(tempoBpm) ? tempoBpm : undefined } },
      { source: "atlas", actor: "user" },
    );
    persistNow();
    refresh();
  };

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{branch?.name}</Text>
      <Text style={typeStyles.title}>{item.title}</Text>
      <Text style={typeStyles.muted}>
        {item.type} · {collectionStateLabel(item.state, kind)} · Collections are not Achievements
      </Text>
      <PsxCard eyebrow="State">
        <View style={styles.row}>
          {COLLECTION_STATES.map((state) => (
            <Pressable
              key={state}
              style={[styles.chip, item.state === state && styles.chipOn]}
              onPress={() => {
                try {
                  updateCollectionState(item.id, state);
                } catch (error) {
                  Alert.alert("Blocked", error instanceof Error ? error.message : "Illegal transition");
                }
              }}
            >
              <Text style={styles.chipText}>{collectionStateLabel(state, kind)}</Text>
            </Pressable>
          ))}
        </View>
      </PsxCard>
      {kind === "repertoire" ? (
        <PsxCard eyebrow="Repertoire">
          <Text style={typeStyles.muted}>
            {item.repertoire?.arrangement ? `Arrangement: ${item.repertoire.arrangement}` : "No arrangement yet"}
          </Text>
          <TextInput
            value={bpm}
            onChangeText={setBpm}
            keyboardType="numeric"
            placeholder="Tempo BPM"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable style={styles.btn} onPress={saveRepertoire}>
            <Text style={styles.btnText}>Save tempo</Text>
          </Pressable>
          <Text style={typeStyles.muted}>
            Memory: {item.repertoire?.fromMemory ? "from memory" : "not yet"} · Sheet/tab:{" "}
            {item.repertoire?.usesSheetOrTab ? "yes" : "no"}
          </Text>
        </PsxCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipOn: { borderColor: colors.gold },
  chipText: { color: colors.offWhite, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    color: colors.offWhite,
    backgroundColor: colors.graphite,
    marginTop: 10,
  },
  btn: {
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  btnText: { color: colors.gold, fontWeight: "700" },
});
