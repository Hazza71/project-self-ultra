export const colors = {
  background: "#121212",
  graphite: "#1A1A1A",
  charcoal: "#242424",
  card: "#1C1C1C",
  cardBorder: "rgba(197, 160, 89, 0.28)",
  offWhite: "#F4F1EA",
  muted: "#9A958C",
  silver: "#C5C9CE",
  gold: "#C5A059",
  goldSoft: "rgba(197, 160, 89, 0.16)",
  pulseRed: "#C41E3A",
  pulseRedGlow: "rgba(196, 30, 58, 0.35)",
  success: "#7D9A6A",
  danger: "#C41E3A",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
};

export const radius = {
  card: 18,
  pill: 999,
};

export const type = {
  display: {
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "600" as const,
    color: colors.gold,
    textTransform: "uppercase" as const,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: "600" as const,
    color: colors.gold,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.offWhite,
  },
  body: {
    fontSize: 15,
    color: colors.offWhite,
    lineHeight: 22,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
};
