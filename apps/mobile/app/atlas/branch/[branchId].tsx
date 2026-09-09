import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { ListRow } from "../../../src/components/ListRow";
import { Screen } from "../../../src/components/Screen";
import {
  branchKind,
  collectionKindForBranch,
  collectionStateLabel,
  formatCollectionCounts,
} from "@psx/domain";
import { usePsx } from "../../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../../src/theme/tokens";

export default function BranchScreen() {
  const { branchId } = useLocalSearchParams<{ branchId: string }>();
  const router = useRouter();
  const { catalog, userId, store, addCollection } = usePsx();
  const [title, setTitle] = useState("");
  const branch = catalog?.branches.find((item) => item.id === branchId);
  const category = catalog?.categories.find((item) => item.id === branch?.categoryId);
  const achievements = catalog?.achievements.filter((item) => item.branchId === branchId) ?? [];
  const competence = store && branch ? store.getCompetence(userId, branch.id).state : "unexplored";
  const kind = catalog && branch ? branchKind(catalog, branch.id) : null;
  const collectionKind = catalog && branch ? collectionKindForBranch(catalog, branch.id) : "default";
  const items = store && branch ? store.listCollections(userId, branch.id) : [];
  const counts = store && branch ? store.collectionCounts(userId, branch.id) : null;

  if (!branch) {
    return (
      <Screen>
        <Text style={typeStyles.title}>Branch not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{category?.name}</Text>
      <Text style={typeStyles.title}>{branch.name}</Text>
      <Text style={typeStyles.muted}>
        Competence: {competence}
        {kind ? ` · ${kind === "core" ? "core / recommended" : kind}` : ""}
      </Text>
      <Text style={typeStyles.eyebrow}>
        {collectionKind === "repertoire" ? "Repertoire" : "Collection"}
      </Text>
      <Text style={typeStyles.muted}>
        {counts ? formatCollectionCounts(counts, collectionKind) : "No collection items"}
        {" · not Achievements"}
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={collectionKind === "repertoire" ? "Add a song" : "Add a collection item"}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Pressable
        style={styles.btn}
        onPress={() => {
          if (!title.trim()) return;
          addCollection(branch.id, title.trim());
          setTitle("");
        }}
      >
        <Text style={styles.btnText}>Add to collection</Text>
      </Pressable>
      {items.map((item) => (
        <ListRow
          key={item.id}
          title={item.title}
          subtitle={item.repertoire?.arrangement || item.notes || item.type}
          meta={collectionStateLabel(item.state, collectionKind)}
          onPress={() => router.push(`/collections/${item.id}`)}
        />
      ))}
      {achievements.map((achievement) => {
        const progress = store?.getProgress(userId, achievement.id);
        return (
          <ListRow
            key={achievement.id}
            title={achievement.title}
            subtitle={`${achievement.tier} · ${achievement.xp} XP`}
            meta={progress?.state ?? "locked"}
            onPress={() => router.push(`/atlas/achievement/${achievement.id}`)}
          />
        );
      })}
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
});
