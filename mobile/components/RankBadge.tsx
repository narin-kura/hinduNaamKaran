import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Rank } from "../lib/numerology";

const RANK_STYLE: Record<Rank, { bg: string; fg: string; label: string }> = {
  best: { bg: Colors.bestLight, fg: Colors.best, label: "Best" },
  good: { bg: Colors.goodLight, fg: Colors.good, label: "Good" },
  worst: { bg: Colors.worstLight, fg: Colors.worst, label: "Worst" },
};

export function RankBadge({ rank }: { rank: Rank }) {
  const s = RANK_STYLE[rank];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
});
