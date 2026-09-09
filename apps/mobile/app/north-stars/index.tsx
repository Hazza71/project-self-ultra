import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { ListRow } from "../../src/components/ListRow";
import { Screen } from "../../src/components/Screen";
import { formatNorthStarProgress } from "@psx/domain";
import { usePsx } from "../../src/lib/PsxContext";
import { colors, type as typeStyles } from "../../src/theme/tokens";

export default function NorthStarsScreen() {
  const router = useRouter();
  const { store, userId, addNorthStar } = usePsx();
  const stars = store ? store.listNorthStars(userId) : [];
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  return (
    <Screen>
      <Text style={typeStyles.title}>North Stars</Text>
      <Text style={typeStyles.muted}>
        Concrete outcomes, not XP. Buying or spending never grants self-development XP.
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name (e.g. 5k under 25)"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        value={target}
        onChangeText={setTarget}
        placeholder="Target value"
        keyboardType="numeric"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        value={unit}
        onChangeText={setUnit}
        placeholder="Unit"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Pressable
        style={styles.btn}
        onPress={() => {
          const targetValue = Number(target);
          if (!name.trim() || !Number.isFinite(targetValue)) return;
          addNorthStar({ name: name.trim(), targetValue, unit: unit.trim() || "units" });
          setName("");
          setTarget("");
          setUnit("");
        }}
      >
        <Text style={styles.btnText}>Create North Star</Text>
      </Pressable>
      {stars.length === 0 ? <Text style={typeStyles.muted}>None yet.</Text> : null}
      {stars.map((star) => (
        <ListRow
          key={star.id}
          title={star.name}
          subtitle={formatNorthStarProgress(star)}
          meta={star.status}
          onPress={() => router.push(`/north-stars/${star.id}`)}
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
