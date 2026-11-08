import { Stack, ThemeProvider, DefaultTheme } from "expo-router";
import React from "react";
import { Platform, View, Text, Image, Pressable, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors, SCREEN_BG } from "../constants/Colors";

// Navigation paints its own page colour; make it the screen background (transparent on the
// web, so the festive pattern from app/+html.tsx shows through).
const THEME = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: SCREEN_BG } };

// Web only: "HinduNaamKaran  by vigyatri" in the home header (links to the maker's site).
function HomeTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>HinduNaamKaran</Text>
      <Pressable
        onPress={() => Linking.openURL("https://vigyatri.com")}
        accessibilityRole="link"
        style={{ flexDirection: "row", alignItems: "center", gap: 4, opacity: 0.92 }}
      >
        <Image source={require("../assets/vigyatri-mark.png")} style={{ width: 14, height: 14 }} />
        <Text style={{ color: "#e0e7ff", fontSize: 11, fontWeight: "600" }}>by vigyatri</Text>
      </Pressable>
    </View>
  );
}

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
        <Stack.Screen name="index" options={{ title: "HinduNaamKaran", headerTitle: Platform.OS === "web" ? () => <HomeTitle /> : undefined }} />
        <Stack.Screen name="results" options={{ title: "Suggested Names", headerBackTitle: "Back" }} />
        <Stack.Screen name="name/[id]" options={{ title: "Name Details", headerBackTitle: "Back" }} />
        <Stack.Screen name="check" options={{ title: "Check a Name", headerBackTitle: "Back" }} />
        <Stack.Screen name="method" options={{ title: "How It Works", headerBackTitle: "Back" }} />
      </Stack>
    </ThemeProvider>
  );
}
