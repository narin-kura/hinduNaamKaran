import { Stack, ThemeProvider, DefaultTheme } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors, SCREEN_BG } from "../constants/Colors";

// Navigation paints its own page colour; make it the screen background (transparent on the
// web, so the festive pattern from app/+html.tsx shows through).
const THEME = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: SCREEN_BG } };

export default function RootLayout() {
  return (
    <ThemeProvider value={THEME}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.saffron },
          // Web: saffron-to-peacock gradient (CSS in app/+html.tsx). Android keeps solid saffron.
          headerBackground:
            Platform.OS === "web" ? () => React.createElement("div", { className: "hnk-header-bg" }) : undefined,
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: SCREEN_BG },
        }}
      >
        <Stack.Screen name="index" options={{ title: "HinduNaamKaran" }} />
        <Stack.Screen name="results" options={{ title: "Suggested Names", headerBackTitle: "Back" }} />
        <Stack.Screen name="name/[id]" options={{ title: "Name Details", headerBackTitle: "Back" }} />
        <Stack.Screen name="check" options={{ title: "Check a Name", headerBackTitle: "Back" }} />
        <Stack.Screen name="method" options={{ title: "How It Works", headerBackTitle: "Back" }} />
      </Stack>
    </ThemeProvider>
  );
}
