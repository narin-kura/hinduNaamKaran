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
        <Stack.Screen name="index" options={{ title: "NaamKaran" }} />
        <Stack.Screen name="results" options={{ title: "Suggested Names", headerBackTitle: "Back" }} />
        <Stack.Screen name="name/[id]" options={{ title: "Name Details", headerBackTitle: "Back" }} />
      </Stack>
    </>
  );
}
