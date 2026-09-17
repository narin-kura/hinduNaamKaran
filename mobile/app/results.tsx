import React, { useMemo, useState } from "react";
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { getBirthChart } from "../lib/astro";
import { suggestNames, syllablesForScope, Gender, RankedName, Scope, MIN_RESULTS } from "../lib/suggest";
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

const SCOPE_LABEL: Record<Scope, string> = {
  pada: "Pada only",
  nakshatra: "Nakshatra",
  rashi: "Rashi",
};

const SCOPE_HELP: Record<Scope, string> = {
  pada: "Only the Moon's exact pada syllable. The strictest reading.",
  nakshatra: "Any of the birth star's four syllables. What most families and pandits use.",
  rashi: "Any of the nine pada syllables in the Moon sign. Also a widely followed practice.",
};

export default function ResultsScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("nakshatra");

  const chart = useMemo(
    () => getBirthChart({ date: params.date, time: params.time, timeZone: params.timeZone }),
    [params.date, params.time, params.timeZone]
  );

  const birthDay = Number(params.date.split("-")[2]);
  const genderFilter: Gender | undefined =
    params.gender === "M" || params.gender === "F" ? params.gender : undefined;

  const result = useMemo(
    () => suggestNames(chart, birthDay, genderFilter, scope),
    [chart, birthDay, genderFilter, scope]
  );

  const sections: RankSection[] = useMemo(
    () => [
      { title: "Best Matches", color: Colors.best, bg: Colors.bestLight, data: result.best },
      { title: "Good Matches", color: Colors.good, bg: Colors.goodLight, data: result.good },
      { title: "Worst Matches", color: Colors.worst, bg: Colors.worstLight, data: result.worst },
    ],
    [result]
  );

  const birthNumber = getBirthNumber(birthDay);
  // Classical planetary-friendship texts define no allies or enemies for the
  // shadow planets Rahu (4) and Ketu (7), so every name ranks "Good". Say so,
  // or "Best: 0" looks like a bug.
  const neutralRuler = birthNumber === 4 ? "Rahu" : birthNumber === 7 ? "Ketu" : null;

  const openName = (item: RankedName) =>
    router.push({
      pathname: "/name/[id]",
      params: {
        id: item.variantOf ? item.variantOf.toLowerCase() : item.id,
        birthDay: String(birthDay),
        ...(item.variantOf ? { spelling: item.name } : {}),
      },
    });

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
        <View>
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
                <Ionicons name="star-outline" size={13} color={Colors.primaryDark} />
                <Text style={styles.summaryChipText}>Pada syllable: {chart.syllable}</Text>
              </View>
            </View>

            <Text style={styles.scopeLabel}>Which syllables to allow</Text>
            <View style={styles.scopeRow}>
              {(["pada", "nakshatra", "rashi"] as Scope[]).map((s) => {
                const active = s === scope;
                const count = syllablesForScope(chart, s).length;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.scopePill, active && styles.scopePillActive]}
                    onPress={() => setScope(s)}
                  >
                    <Text style={[styles.scopeText, active && styles.scopeTextActive]}>{SCOPE_LABEL[s]}</Text>
                    <Text style={[styles.scopeCount, active && styles.scopeTextActive]}>
                      {count} {count === 1 ? "syllable" : "syllables"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.scopeHelp}>{SCOPE_HELP[scope]}</Text>

            <View style={styles.syllableRow}>
              {result.syllables.map((s) => (
                <View
                  key={s}
                  style={[styles.syllableChip, s === result.padaSyllable && styles.syllableChipPada]}
                >
                  <Text style={[styles.syllableText, s === result.padaSyllable && styles.syllableTextPada]}>
                    {s}
                  </Text>
                </View>
              ))}
              <Text style={styles.totalText}>{result.total} names</Text>
            </View>

            {result.autoWidened && (
              <Text style={styles.note}>
                Fewer than {MIN_RESULTS} names begin with the {SCOPE_LABEL[result.scopeRequested].toLowerCase()}{" "}
                syllables, so the list was widened to the {SCOPE_LABEL[result.scopeUsed].toLowerCase()} set.
                Names beginning with the exact pada syllable "{result.padaSyllable}" are listed first.
              </Text>
            )}
            {neutralRuler && (
              <Text style={styles.note}>
                Birth number {birthNumber} is ruled by {neutralRuler}. The classical planetary
                friendship texts define no friendly or hostile numbers for {neutralRuler}, so every
                name here ranks as Good rather than Best or Worst.
              </Text>
            )}
          </View>
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
          <Text style={styles.emptyText}>No names in this category.</Text>
        ) : (
          <View style={styles.sectionGap} />
        )
      }
      renderItem={({ item }) => <NameCard entry={item} onPress={() => openName(item)} />}
      ListFooterComponent={
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How the ranks are decided</Text>
          <Text style={styles.howText}>
            Each name gets a Chaldean number from its letters. Your baby's birth number is the day of
            the month reduced to one digit ({birthDay} → {birthNumber}). Every number is ruled by a
            planet, and the classical planetary friendship chart says whether the birth planet
            treats the name's planet as a friend (Best), neutral (Good) or an enemy (Worst). Tap any
            name to see its planets and the letter arithmetic.
          </Text>
          <TouchableOpacity style={styles.howLink} onPress={() => router.push("/method")}>
            <Ionicons name="book-outline" size={15} color={Colors.primary} />
            <Text style={styles.howLinkText}>Full method: panchang, ayanamsa and numerology used</Text>
          </TouchableOpacity>
        </View>
      }
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

  scopeLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase", marginTop: 16, marginBottom: 6 },
  scopeRow: { flexDirection: "row", gap: 8 },
  scopePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  scopePillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  scopeText: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary },
  scopeCount: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  scopeTextActive: { color: Colors.primaryDark },
  scopeHelp: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 17 },

  syllableRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 12 },
  syllableChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  syllableChipPada: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  syllableText: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary },
  syllableTextPada: { color: "#fff" },
  totalText: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", marginLeft: "auto" },

  note: { fontSize: 12, color: Colors.textMuted, marginTop: 10, lineHeight: 17, fontStyle: "italic" },
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
  howCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginTop: 6 },
  howTitle: { fontSize: 12, fontWeight: "700", color: Colors.textPrimary, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 },
  howText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  howLink: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  howLinkText: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
});
