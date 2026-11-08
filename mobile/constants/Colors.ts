import { Platform } from "react-native";

export const Colors = {
  // Brand bar keeps the traditional saffron; the rest of the UI uses peacock blue.
  saffron: "#c2410c",
  primary: "#0e7490",
  primaryDark: "#155e75",
  primaryLight: "#cffafe",
  secondary: "#a16207",
  secondaryLight: "#fef3c7",
  success: "#15803d",
  successLight: "#dcfce7",
  warning: "#b45309",
  warningLight: "#fef3c7",
  danger: "#b91c1c",
  dangerLight: "#fee2e2",
  background: "#f6fbfc",
  surface: "#ffffff",
  border: "#d5e9ee",
  textPrimary: "#1f2a30",
  textSecondary: "#4f6168",
  textMuted: "#8fa3a9",
  best: "#15803d",
  bestLight: "#dcfce7",
  good: "#a16207",
  goodLight: "#fef3c7",
  worst: "#b91c1c",
  worstLight: "#fee2e2",
};

// Page background: transparent on the web so the festive pattern from app/+html.tsx shows through.
export const SCREEN_BG = Platform.OS === "web" ? "transparent" : Colors.background;
