import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { ListRow } from "../../../src/components/ListRow";
import { Screen } from "../../../src/components/Screen";
import { usePsx } from "../../../src/lib/PsxContext";
import { type as typeStyles } from "../../../src/theme/tokens";

export default function TreeScreen() {
  const { treeId } = useLocalSearchParams<{ treeId: string }>();
  const router = useRouter();
  const { catalog } = usePsx();
  const tree = catalog?.trees.find((item) => item.id === treeId);
  const categories = catalog?.categories.filter((item) => item.treeId === treeId) ?? [];

  if (!tree) {
    return (
      <Screen>
        <Text style={typeStyles.title}>Tree not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{tree.icon || "Tree"}</Text>
      <Text style={typeStyles.title}>{tree.name}</Text>
      <Text style={typeStyles.muted}>{tree.legendaryTrophy || "Legendary trophy pending"}</Text>
      {categories.map((category) => (
        <ListRow
          key={category.id}
          title={category.name}
          subtitle={category.description || `${category.branchIds.length} branches`}
          onPress={() => router.push(`/atlas/category/${category.id}`)}
        />
      ))}
    </Screen>
  );
}
