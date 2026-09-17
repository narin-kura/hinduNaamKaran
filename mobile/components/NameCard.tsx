import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { RankedName, Gender } from "../lib/suggest";
import { RankBadge } from "./RankBadge";

const GENDER_LABEL: Record<Gender, string> = { M: "Boy", F: "Girl", U: "Either" };

export function NameCard({ entry, onPress }: { entry: RankedName; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{entry.name}</Text>
            <Text style={styles.gender}>{GENDER_LABEL[entry.gender]}</Text>
          </View>
          <RankBadge rank={entry.rank} />
        </View>
        <Text style={styles.meaning} numberOfLines={2}>{entry.meaning}</Text>
        <Text style={styles.reason} numberOfLines={1}>
          Name number {entry.nameNumber} · {entry.reason}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 8, flexShrink: 1 },
  name: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  gender: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 },
  meaning: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  reason: { fontSize: 11, color: Colors.textMuted, marginTop: 5 },
});
