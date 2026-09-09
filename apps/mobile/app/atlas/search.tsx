import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ListRow } from "../../src/components/ListRow";
import { Screen } from "../../src/components/Screen";
import { usePsx } from "../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../src/theme/tokens";

const FILTERS = ["all", "ready", "recommended"] as const;

export default function AtlasSearch() {
  const router = useRouter();
  const { search, catalog } = usePsx();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [treeId, setTreeId] = useState<string | undefined>();

  const hits = useMemo(
    () =>
      search({
        query,
        treeId,
        recommendedOnly: filter === "recommended",
        readyToClaimOnly: filter === "ready",
      }),
    [search, query, treeId, filter],
  );

  return (
    <Screen>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoFocus
      />
      <View style={styles.chips}>
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === item && styles.chipTextOn]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {catalog ? (
        <View style={styles.chips}>
          <Pressable onPress={() => setTreeId(undefined)} style={[styles.chip, !treeId && styles.chipOn]}>
            <Text style={[styles.chipText, !treeId && styles.chipTextOn]}>all trees</Text>
          </Pressable>
          {catalog.trees.map((tree) => (
            <Pressable
              key={tree.id}
              onPress={() => setTreeId(tree.id)}
              style={[styles.chip, treeId === tree.id && styles.chipOn]}
            >
              <Text style={[styles.chipText, treeId === tree.id && styles.chipTextOn]}>{tree.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Text style={typeStyles.muted}>{hits.length} results</Text>
      {hits.map((hit) => (
        <ListRow
          key={hit.achievement.id}
          title={hit.achievement.title}
          subtitle={`${hit.tree.name} · ${hit.branch.name} · ${hit.achievement.tier}`}
          meta={hit.progress?.state ?? "locked"}
          onPress={() => router.push(`/atlas/achievement/${hit.achievement.id}`)}
        />
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
    fontSize: 16,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipOn: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  chipText: { color: colors.muted, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase" },
  chipTextOn: { color: colors.gold },
});
