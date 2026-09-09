import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { ListRow } from "../../../src/components/ListRow";
import { Screen } from "../../../src/components/Screen";
import { usePsx } from "../../../src/lib/PsxContext";
import { type as typeStyles } from "../../../src/theme/tokens";

export default function BranchScreen() {
  const { branchId } = useLocalSearchParams<{ branchId: string }>();
  const router = useRouter();
  const { catalog, userId, store } = usePsx();
  const branch = catalog?.branches.find((item) => item.id === branchId);
  const category = catalog?.categories.find((item) => item.id === branch?.categoryId);
  const achievements = catalog?.achievements.filter((item) => item.branchId === branchId) ?? [];
  const competence = store && branch ? store.getCompetence(userId, branch.id).state : "unexplored";

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
      <Text style={typeStyles.muted}>Competence: {competence}</Text>
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
