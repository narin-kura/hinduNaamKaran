import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, SCREEN_BG } from "../constants/Colors";

/** True when the birth details needed by results/check are present and well-formed. */
export function hasBirthParams(p: { date?: string; time?: string; timeZone?: string }): boolean {
  return !!p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && !!p.time && /^\d{2}:\d{2}$/.test(p.time) && !!p.timeZone;
}

/** Shown when a results/check page is opened directly (shared link, refresh) without birth details. */
export function MissingBirthDetails() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Ionicons name="calendar-outline" size={40} color={Colors.primary} />
      <Text style={styles.title}>Birth details needed</Text>
      <Text style={styles.text}>Enter the baby's birth date, time and place first, then we can suggest or check names.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
        <Text style={styles.btnText}>Enter birth details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: SCREEN_BG },
  title: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 12 },
  text: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 20, maxWidth: 360 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 26, marginTop: 18 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
