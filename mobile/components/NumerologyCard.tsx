import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import {
  getBirthNumber,
  getNameNumber,
  getCompatibility,
  explainCompatibility,
  getNameNumberBreakdown,
  PLANET_OF_NUMBER,
} from "../lib/numerology";
import { RankBadge } from "./RankBadge";

/** Birth number vs name number, the planetary reason for the rank, and the letter arithmetic. */
export function NumerologyCard({ name, birthDay }: { name: string; birthDay: number }) {
  const birthNumber = getBirthNumber(birthDay);
  const nameNumber = getNameNumber(name);
  const rank = getCompatibility(birthNumber, nameNumber);
  const why = explainCompatibility(birthNumber, nameNumber);
  const breakdown = getNameNumberBreakdown(name);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="calculator-outline" size={16} color={Colors.primary} />
        <Text style={styles.cardTitle}>Numerology</Text>
        <View style={{ marginLeft: "auto" }}>
          <RankBadge rank={rank} />
        </View>
      </View>

      <View style={styles.numRow}>
        <View style={styles.numItem}>
          <Text style={styles.numValue}>{birthNumber}</Text>
          <Text style={styles.numLabel}>Birth Number</Text>
          <Text style={styles.numPlanet}>{PLANET_OF_NUMBER[birthNumber]}</Text>
        </View>
        <Ionicons name="swap-horizontal" size={18} color={Colors.textMuted} />
        <View style={styles.numItem}>
          <Text style={styles.numValue}>{nameNumber}</Text>
          <Text style={styles.numLabel}>Name Number</Text>
          <Text style={styles.numPlanet}>{PLANET_OF_NUMBER[nameNumber]}</Text>
        </View>
      </View>

      <Text style={styles.whyTitle}>Why it ranks {rank}</Text>
      <Text style={styles.cardText}>{why.long}</Text>

      <Text style={styles.whyTitle}>How the name number is worked out</Text>
      <View style={styles.letterRow}>
        {breakdown.letters.map((l, i) => (
          <View key={i} style={styles.letterCell}>
            <Text style={styles.letterChar}>{l.letter}</Text>
            <Text style={styles.letterVal}>{l.value}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.arith}>
        {breakdown.letters.map((l) => l.value).join(" + ")} = {breakdown.total}
        {breakdown.steps.map((s) => `  →  ${s}`).join("")}
      </Text>
      <Text style={styles.hint}>
        Chaldean letter values: A I J Q Y = 1 · B K R = 2 · C G L S = 3 · D M T = 4 · E H N X = 5 ·
        U V W = 6 · O Z = 7 · F P = 8. Digits are added until a single number remains. The birth
        number is the day of the month ({birthDay}) reduced the same way.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textTransform: "uppercase", letterSpacing: 0.3 },
  cardText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  numRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 4 },
  numItem: { alignItems: "center" },
  numValue: { fontSize: 28, fontWeight: "800", color: Colors.primary },
  numLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  numPlanet: { fontSize: 11, color: Colors.primaryDark, fontWeight: "700", marginTop: 1 },
  whyTitle: { fontSize: 12, fontWeight: "700", color: Colors.textPrimary, marginTop: 14, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 },
  letterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  letterCell: { alignItems: "center", backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, minWidth: 34 },
  letterChar: { fontSize: 14, fontWeight: "800", color: Colors.primaryDark },
  letterVal: { fontSize: 11, color: Colors.primaryDark, marginTop: 1 },
  arith: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, marginTop: 10 },
  hint: { fontSize: 11, color: Colors.textMuted, marginTop: 8, lineHeight: 16 },
});
