import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  listening?: boolean;
};

export function PulseLogo({ size = 220, listening = false }: Props) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {listening ? (
        <>
          <View style={[styles.ring, { width: size, height: size, borderColor: "rgba(196,30,58,0.18)" }]} />
          <View style={[styles.ring, { width: size * 0.78, height: size * 0.78, borderColor: "rgba(196,30,58,0.32)" }]} />
          <View style={[styles.ring, { width: size * 0.58, height: size * 0.58, borderColor: "rgba(196,30,58,0.5)" }]} />
        </>
      ) : (
        <LinearGradient
          colors={["rgba(197,160,89,0.22)", "rgba(197,160,89,0.04)", "transparent"]}
          style={[styles.glow, { width: size * 1.15, height: size * 1.15 }]}
        />
      )}
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 200 200">
        <Defs>
          <SvgGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F5F6F7" />
            <Stop offset="0.45" stopColor="#B8BDC3" />
            <Stop offset="1" stopColor="#8D939A" />
          </SvgGradient>
        </Defs>
        <Circle cx="100" cy="100" r="82" stroke="url(#metal)" strokeWidth="4" fill="none" />
        <Circle cx="100" cy="100" r="76" stroke="rgba(197,160,89,0.35)" strokeWidth="1" fill="none" />
        <G>
          <Path
            d="M100 28 L142 118 L118 118 L118 158 L82 158 L82 118 L58 118 Z"
            fill="url(#metal)"
            stroke="#E8EAEB"
            strokeWidth="1.2"
          />
        </G>
        <Line x1="22" y1="100" x2="58" y2="100" stroke="url(#metal)" strokeWidth="3" strokeLinecap="round" />
        <Path
          d="M58 100 L70 100 L78 72 L90 128 L102 88 L112 100 L178 100"
          fill="none"
          stroke={listening ? "#C41E3A" : "url(#metal)"}
          strokeWidth="3.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
