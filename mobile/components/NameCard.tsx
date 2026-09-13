import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { RankedName } from "../lib/suggest";
import { RankBadge } from "./RankBadge";

export function NameCard({ entry, onPress }: { entry: RankedName; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{entry.name}</Text>
          <RankBadge rank={entry.rank} />
        </View>
        <Text style={styles.meaning} numberOfLines={2}>{entry.meaning}</Text>
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
  name: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  meaning: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
});
