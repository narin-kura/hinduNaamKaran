import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "HinduNaamKaran" }} />
        <Stack.Screen name="results" options={{ title: "Suggested Names", headerBackTitle: "Back" }} />
        <Stack.Screen name="name/[id]" options={{ title: "Name Details", headerBackTitle: "Back" }} />
        <Stack.Screen name="check" options={{ title: "Check a Name", headerBackTitle: "Back" }} />
        <Stack.Screen name="method" options={{ title: "How It Works", headerBackTitle: "Back" }} />
      </Stack>
    </>
  );
}
