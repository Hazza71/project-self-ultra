import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { ListRow } from "../../../src/components/ListRow";
import { Screen } from "../../../src/components/Screen";
import { usePsx } from "../../../src/lib/PsxContext";
import { type as typeStyles } from "../../../src/theme/tokens";

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { catalog, userId, store } = usePsx();
  const category = catalog?.categories.find((item) => item.id === categoryId);
  const tree = catalog?.trees.find((item) => item.id === category?.treeId);
  const branches = catalog?.branches.filter((item) => item.categoryId === categoryId) ?? [];

  if (!category) {
    return (
      <Screen>
        <Text style={typeStyles.title}>Category not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={typeStyles.eyebrow}>{tree?.name}</Text>
      <Text style={typeStyles.title}>{category.name}</Text>
      {category.description ? <Text style={typeStyles.muted}>{category.description}</Text> : null}
      {branches.map((branch) => {
        const competence = store?.getCompetence(userId, branch.id).state ?? "unexplored";
        return (
          <ListRow
            key={branch.id}
            title={branch.name}
            subtitle={`${branch.achievementIds.length} achievements · ${competence}`}
            meta={branch.recommended ? "REC" : undefined}
            onPress={() => router.push(`/atlas/branch/${branch.id}`)}
          />
        );
      })}
    </Screen>
  );
}
