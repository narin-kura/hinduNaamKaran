import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { RankedName, Gender } from "../lib/suggest";
import { RankBadge } from "./RankBadge";

const GENDER_LABEL: Record<Gender, string> = { M: "Boy", F: "Girl", U: "Either" };
const ALT_STYLE = {
  best: { backgroundColor: Colors.bestLight, borderColor: Colors.bestLight },
  good: { backgroundColor: Colors.goodLight, borderColor: Colors.goodLight },
  worst: { backgroundColor: Colors.worstLight, borderColor: Colors.worstLight },
} as const;
const ALT_TEXT = { best: { color: Colors.best }, good: { color: Colors.good }, worst: { color: Colors.worst } } as const;

export function NameCard({ entry, onPress }: { entry: RankedName; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{entry.name}</Text>
            <View style={[styles.sylChip, entry.padaMatch && styles.sylChipPada]}>
              <Text style={[styles.sylText, entry.padaMatch && styles.sylTextPada]}>{entry.startingSound}</Text>
            </View>
            <Text style={styles.gender}>{GENDER_LABEL[entry.gender]}</Text>
          </View>
          <RankBadge rank={entry.rank} />
        </View>
        {entry.variantOf && (
          <Text style={styles.variantNote}>Spelling variation of {entry.variantOf}</Text>
        )}
        <Text style={styles.meaning} numberOfLines={2}>{entry.meaning}</Text>
        <Text style={styles.reason} numberOfLines={1}>
          Name number {entry.nameNumber} · {entry.reason}
        </Text>
        {!entry.variantOf && entry.alternates.length > 0 && (
          <View style={styles.altRow}>
            <Text style={styles.altLabel}>Also spelt</Text>
            {entry.alternates.map((a) => (
              <View key={a.spelling} style={[styles.altChip, ALT_STYLE[a.rank]]}>
                <Text style={[styles.altText, ALT_TEXT[a.rank]]}>
                  {a.spelling} · {a.nameNumber}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  sylChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.border },
  sylChipPada: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sylText: { fontSize: 10, fontWeight: "700", color: Colors.textMuted },
  sylTextPada: { color: "#fff" },
  meaning: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  reason: { fontSize: 11, color: Colors.textMuted, marginTop: 5 },
  variantNote: { fontSize: 11, color: Colors.primaryDark, fontWeight: "700", marginTop: 2 },
  altRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 6 },
  altLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 },
  altChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  altText: { fontSize: 11, fontWeight: "700" },
});
