import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { getBirthChart } from "../lib/astro";
import { suggestNames, Gender, RankedName } from "../lib/suggest";
import { NameCard } from "../components/NameCard";

type Params = {
  date: string;
  time: string;
  timeZone: string;
  cityLabel: string;
  gender: string;
};

function Section({
  title,
  color,
  bg,
  entries,
  onSelect,
}: {
  title: string;
  color: string;
  bg: string;
  entries: RankedName[];
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: bg }]}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        <Text style={[styles.sectionCount, { color }]}>{entries.length}</Text>
      </View>
      {entries.length === 0 ? (
        <Text style={styles.emptyText}>No names in this category yet.</Text>
      ) : (
        entries.map((entry) => (
          <NameCard key={entry.id} entry={entry} onPress={() => onSelect(entry.id)} />
        ))
      )}
    </View>
  );
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();

  const chart = useMemo(
    () => getBirthChart({ date: params.date, time: params.time, timeZone: params.timeZone }),
    [params.date, params.time, params.timeZone]
  );

  const birthDay = Number(params.date.split("-")[2]);
  const genderFilter: Gender | undefined = params.gender === "M" || params.gender === "F" ? params.gender : undefined;

  const result = useMemo(
    () => suggestNames(chart, birthDay, genderFilter),
    [chart, birthDay, genderFilter]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Birth Star (Nakshatra)</Text>
        <Text style={styles.summaryValue}>
          {chart.nakshatraName} · Pada {chart.padaIndex + 1}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Ionicons name="planet-outline" size={13} color={Colors.primaryDark} />
            <Text style={styles.summaryChipText}>Rashi: {chart.rashiName}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Ionicons name="text-outline" size={13} color={Colors.primaryDark} />
            <Text style={styles.summaryChipText}>Syllable: {chart.syllable}</Text>
          </View>
        </View>
        {result.usedFallback && (
          <Text style={styles.fallbackNote}>
            Our starting name list doesn't have enough names for the exact "{chart.syllable}"
            sound yet, so this list is widened to the rest of the {chart.nakshatraName} Nakshatra.
          </Text>
        )}
      </View>

      <Section
        title="Best Matches"
        color={Colors.best}
        bg={Colors.bestLight}
        entries={result.best}
        onSelect={(id) => router.push({ pathname: "/name/[id]", params: { id, birthDay: String(birthDay) } })}
      />
      <Section
        title="Good Matches"
        color={Colors.good}
        bg={Colors.goodLight}
        entries={result.good}
        onSelect={(id) => router.push({ pathname: "/name/[id]", params: { id, birthDay: String(birthDay) } })}
      />
      <Section
        title="Worst Matches"
        color={Colors.worst}
        bg={Colors.worstLight}
        entries={result.worst}
        onSelect={(id) => router.push({ pathname: "/name/[id]", params: { id, birthDay: String(birthDay) } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    padding: 16,
    marginBottom: 18,
  },
  summaryLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase" },
  summaryValue: { fontSize: 19, fontWeight: "800", color: Colors.textPrimary, marginTop: 4 },
  summaryRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  summaryChipText: { fontSize: 12, color: Colors.primaryDark, fontWeight: "700" },
  fallbackNote: { fontSize: 12, color: Colors.textMuted, marginTop: 10, lineHeight: 17, fontStyle: "italic" },
  section: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  sectionCount: { fontSize: 13, fontWeight: "800" },
  emptyText: { fontSize: 13, color: Colors.textMuted, fontStyle: "italic", paddingHorizontal: 4 },
});
