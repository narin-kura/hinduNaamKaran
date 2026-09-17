import React, { useMemo } from "react";
import { View, Text, SectionList, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { getBirthChart } from "../lib/astro";
import { suggestNames, Gender, RankedName } from "../lib/suggest";
import { getBirthNumber } from "../lib/numerology";
import { NameCard } from "../components/NameCard";

type Params = {
  date: string;
  time: string;
  timeZone: string;
  cityLabel: string;
  gender: string;
};

type RankSection = {
  title: string;
  color: string;
  bg: string;
  data: RankedName[];
};

export default function ResultsScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();

  const chart = useMemo(
    () => getBirthChart({ date: params.date, time: params.time, timeZone: params.timeZone }),
    [params.date, params.time, params.timeZone]
  );

  const birthDay = Number(params.date.split("-")[2]);
  const genderFilter: Gender | undefined =
    params.gender === "M" || params.gender === "F" ? params.gender : undefined;

  const result = useMemo(() => suggestNames(chart, birthDay, genderFilter), [chart, birthDay, genderFilter]);

  const sections: RankSection[] = useMemo(
    () => [
      { title: "Best Matches", color: Colors.best, bg: Colors.bestLight, data: result.best },
      { title: "Good Matches", color: Colors.good, bg: Colors.goodLight, data: result.good },
      { title: "Worst Matches", color: Colors.worst, bg: Colors.worstLight, data: result.worst },
    ],
    [result]
  );

  const total = result.best.length + result.good.length + result.worst.length;
  const birthNumber = getBirthNumber(birthDay);
  // Classical planetary-friendship texts define no allies or enemies for the
  // shadow planets Rahu (4) and Ketu (7), so every name ranks "Good". Say so,
  // or "Best: 0" looks like a bug.
  const neutralRuler = birthNumber === 4 ? "Rahu" : birthNumber === 7 ? "Ketu" : null;

  const openName = (id: string) =>
    router.push({ pathname: "/name/[id]", params: { id, birthDay: String(birthDay) } });

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      initialNumToRender={12}
      windowSize={7}
      ListHeaderComponent={
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
            <View style={styles.summaryChip}>
              <Ionicons name="list-outline" size={13} color={Colors.primaryDark} />
              <Text style={styles.summaryChipText}>{total} names</Text>
            </View>
          </View>
          {neutralRuler && (
            <Text style={styles.fallbackNote}>
              Birth number {birthNumber} is ruled by {neutralRuler}. The classical planetary
              friendship texts define no friendly or hostile numbers for {neutralRuler}, so every
              name here ranks as Good rather than Best or Worst.
            </Text>
          )}
          {result.usedFallback && (
            <Text style={styles.fallbackNote}>
              Our name list doesn't have enough names for the exact "{chart.syllable}" sound yet,
              so this list is widened to the rest of the {chart.nakshatraName} Nakshatra.
            </Text>
          )}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: section.bg }]}>
          <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
          <Text style={[styles.sectionCount, { color: section.color }]}>{section.data.length}</Text>
        </View>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <Text style={styles.emptyText}>No names in this category yet.</Text>
        ) : (
          <View style={styles.sectionGap} />
        )
      }
      renderItem={({ item }) => <NameCard entry={item} onPress={() => openName(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 40 },
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
  sectionGap: { height: 8 },
  emptyText: { fontSize: 13, color: Colors.textMuted, fontStyle: "italic", paddingHorizontal: 4, marginBottom: 18 },
});
