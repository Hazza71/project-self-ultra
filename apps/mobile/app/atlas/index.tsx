import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { ListRow } from "../../src/components/ListRow";
import { Screen } from "../../src/components/Screen";
import { usePsx } from "../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../src/theme/tokens";

export default function AtlasIndex() {
  const router = useRouter();
  const { catalog, status } = usePsx();

  return (
    <Screen>
      <Text style={typeStyles.title}>Atlas</Text>
      <Text style={typeStyles.muted}>
        Manual master map. Project → Tree → Category → Branch → Achievement.
      </Text>
      <Pressable onPress={() => router.push("/atlas/search")} style={styles.search}>
        <Text style={{ color: colors.muted }}>Search trees, branches, achievements…</Text>
      </Pressable>
      {status === "missing_catalog" || !catalog ? (
        <Text style={typeStyles.muted}>
          Canonical catalog is not installed yet. Atlas has no invented taxonomy to show.
        </Text>
      ) : (
        catalog.trees
          .slice()
          .sort((a, b) => a.priority - b.priority)
          .map((tree) => (
            <ListRow
              key={tree.id}
              title={tree.name}
              subtitle={`${tree.categoryIds.length} categories · ${tree.legendaryTrophy || "—"}`}
              meta={tree.icon || undefined}
              onPress={() => router.push(`/atlas/tree/${tree.id}`)}
            />
          ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.graphite,
  },
});
