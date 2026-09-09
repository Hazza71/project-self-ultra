import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/tokens";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
};

export function ListRow({ title, subtitle, meta, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  pressed: { opacity: 0.7 },
  title: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
  sub: { color: colors.muted, fontSize: 13, marginTop: 3 },
  meta: { color: colors.gold, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  chevron: { color: colors.silver, fontSize: 22, marginLeft: 4 },
});
