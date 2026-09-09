import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, radius, type as typeStyles } from "../theme/tokens";

type Props = {
  eyebrow?: string;
  children: ReactNode;
  style?: ViewStyle;
  right?: ReactNode;
};

export function PsxCard({ eyebrow, children, style, right }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.goldEdge} />
      {(eyebrow || right) && (
        <View style={styles.header}>
          {eyebrow ? <Text style={typeStyles.eyebrow}>{eyebrow}</Text> : <View />}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    overflow: "hidden",
  },
  goldEdge: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1.5,
    backgroundColor: colors.gold,
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
