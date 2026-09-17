import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { findNameById } from "../../lib/suggest";
import { getBirthNumber, getNameNumber, getCompatibility } from "../../lib/numerology";
import { RankBadge } from "../../components/RankBadge";

export default function NameDetailScreen() {
  const { id, birthDay } = useLocalSearchParams<{ id: string; birthDay: string }>();
  const entry = findNameById(id);

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Name not found.</Text>
      </View>
    );
  }

  const day = Number(birthDay);
  const birthNumber = getBirthNumber(day);
  const nameNumber = getNameNumber(entry.name);
  const rank = getCompatibility(birthNumber, nameNumber);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.hero}>
        <Text style={styles.name}>{entry.name}</Text>
        <RankBadge rank={rank} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Meaning</Text>
        <Text style={styles.cardText}>{entry.meaning}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="library-outline" size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Source</Text>
        </View>
        {!entry.source.startsWith(entry.origin) && (
          <Text style={styles.cardText}>{entry.origin}</Text>
        )}
        <Text style={styles.sourceCite}>{entry.source}</Text>
        {entry.syllableMatch === "consonant-family" && (
          <Text style={styles.sourceNote}>
            Grouped under the "{entry.startingSound}" syllable: this name's first sound is not
            itself one of the 108 pada syllables, so it is placed with the closest one.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="calculator-outline" size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Numerology</Text>
        </View>
        <View style={styles.numRow}>
          <View style={styles.numItem}>
            <Text style={styles.numValue}>{birthNumber}</Text>
            <Text style={styles.numLabel}>Birth Number</Text>
          </View>
          <Ionicons name="swap-horizontal" size={18} color={Colors.textMuted} />
          <View style={styles.numItem}>
            <Text style={styles.numValue}>{nameNumber}</Text>
            <Text style={styles.numLabel}>Name Number</Text>
          </View>
        </View>
        <Text style={styles.cardText}>
          {entry.name}'s Chaldean name number is {nameNumber}. Compared with a birth number of{" "}
          {birthNumber}, that's considered a{" "}
          <Text style={{ fontWeight: "700" }}>{rank}</Text> match.
        </Text>
      </View>

      <Text style={styles.disclaimer}>
        Numerology compatibility charts vary between traditions and practitioners -- treat this
        as one perspective among several, not a definitive verdict.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { color: Colors.textMuted, fontSize: 14 },
  hero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  name: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.3 },
  cardText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  numRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 12 },
  numItem: { alignItems: "center" },
  numValue: { fontSize: 28, fontWeight: "800", color: Colors.primary },
  numLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 8, lineHeight: 16 },
  sourceCite: { fontSize: 12, color: Colors.primaryDark, fontWeight: "700", marginTop: 8 },
  sourceNote: { fontSize: 11, color: Colors.textMuted, marginTop: 8, lineHeight: 16, fontStyle: "italic" },
});
