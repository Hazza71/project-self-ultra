import { useRouter } from "expo-router";
import { Text } from "react-native";
import { ListRow } from "../src/components/ListRow";
import { Screen } from "../src/components/Screen";
import { usePsx } from "../src/lib/PsxContext";
import { type as typeStyles } from "../src/theme/tokens";

export default function CompassScreen() {
  const router = useRouter();
  const { store, userId } = usePsx();
  const suggestions = store ? store.compass(userId) : [];

  return (
    <Screen>
      <Text style={typeStyles.title}>Compass</Text>
      <Text style={typeStyles.muted}>
        What makes sense to work on next. Compass recommends; it does not dictate. Pulse cannot Claim.
      </Text>
      {suggestions.map((item) => (
        <ListRow
          key={`${item.kind}:${item.id}`}
          title={item.title}
          subtitle={item.reason}
          meta={item.kind}
          onPress={item.href ? () => router.push(item.href as never) : undefined}
        />
      ))}
    </Screen>
  );
}
