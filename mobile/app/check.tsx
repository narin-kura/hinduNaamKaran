import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { getBirthChart } from "../lib/astro";
import { syllablesForScope, findNameById } from "../lib/suggest";
import { detectSyllable } from "../lib/syllable";
import { NumerologyCard } from "../components/NumerologyCard";
import { SpellingVariants } from "../components/SpellingVariants";

type Params = { date: string; time: string; timeZone: string };

type Fit = "pada" | "nakshatra" | "rashi" | "none";

export default function CheckNameScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const [name, setName] = useState("");

  const chart = useMemo(
    () => getBirthChart({ date: params.date, time: params.time, timeZone: params.timeZone }),
    [params.date, params.time, params.timeZone]
  );
  const birthDay = Number(params.date.split("-")[2]);

  const trimmed = name.trim();
  const detection = detectSyllable(trimmed);
  const padaSyl = chart.syllable;
  const nakSyls = syllablesForScope(chart, "nakshatra");
  const rashiSyls = syllablesForScope(chart, "rashi");

  const eq = (a: string | null, b: string) => !!a && a.toLowerCase() === b.toLowerCase();
  const fit: Fit = !detection.syllable
    ? "none"
    : eq(detection.syllable, padaSyl)
    ? "pada"
    : nakSyls.some((s) => eq(detection.syllable, s))
    ? "nakshatra"
    : rashiSyls.some((s) => eq(detection.syllable, s))
    ? "rashi"
    : "none";

  const known = trimmed ? findNameById(trimmed.toLowerCase()) : undefined;

  const FIT_STYLE: Record<Fit, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; title: string }> = {
    pada: { color: Colors.best, bg: Colors.bestLight, icon: "checkmark-circle", title: "Matches the exact pada syllable" },
    nakshatra: { color: Colors.best, bg: Colors.bestLight, icon: "checkmark-circle", title: `Matches a syllable of ${chart.nakshatraName} Nakshatra` },
    rashi: { color: Colors.good, bg: Colors.goodLight, icon: "checkmark-circle-outline", title: `Matches a syllable of ${chart.rashiName} Rashi` },
    none: { color: Colors.worst, bg: Colors.worstLight, icon: "close-circle", title: "Does not match a traditional syllable for this birth" },
  };
  const fs = FIT_STYLE[fit];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Checking against</Text>
        <Text style={styles.summaryValue}>
          {chart.nakshatraName} · Pada {chart.padaIndex + 1} · {chart.rashiName}
        </Text>
        <Text style={styles.summarySub}>
          Pada syllable <Text style={styles.bold}>{padaSyl}</Text> · Nakshatra{" "}
          <Text style={styles.bold}>{nakSyls.join(", ")}</Text> · Rashi{" "}
          <Text style={styles.bold}>{rashiSyls.join(", ")}</Text>
        </Text>
      </View>

      <Text style={styles.label}>Name you have in mind</Text>
      <TextInput
        style={styles.input}
        placeholder="Type any name, e.g. Vihaan"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {trimmed.length >= 2 && (
        <View>
          <View style={[styles.fitCard, { backgroundColor: fs.bg }]}>
            <Ionicons name={fs.icon} size={22} color={fs.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fitTitle, { color: fs.color }]}>{fs.title}</Text>
              <Text style={styles.fitText}>
                {detection.syllable
                  ? `"${trimmed}" begins with the "${detection.syllable}" sound` +
                    (detection.match === "consonant-family"
                      ? ", grouped by consonant family because its first sound is not itself one of the 108 pada syllables."
                      : ".")
                  : `We could not place the first sound of "${trimmed}" among the 108 pada syllables.`}
                {fit === "none" && detection.syllable
                  ? ` For this birth the traditional sounds are ${padaSyl} (pada), ${nakSyls.join("/")} (nakshatra) or ${rashiSyls.join("/")} (rashi).`
                  : ""}
              </Text>
            </View>
          </View>

          <NumerologyCard name={trimmed} birthDay={birthDay} />
          <SpellingVariants name={trimmed} birthDay={birthDay} />

          {known && (
            <TouchableOpacity
              style={styles.knownLink}
              onPress={() => router.push({ pathname: "/name/[id]", params: { id: known.name.toLowerCase(), birthDay: String(birthDay) } })}
            >
              <Ionicons name="book-outline" size={15} color={Colors.primary} />
              <Text style={styles.knownText}>
                {known.name} is in our list: {known.meaning}. See its source.
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.disclaimer}>
            The syllable check follows the standard Nakshatra pada table. Numerology compatibility
            charts vary between traditions and practitioners; treat this as one perspective.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.primaryLight, padding: 16, marginBottom: 18 },
  summaryLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase" },
  summaryValue: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary, marginTop: 4 },
  summarySub: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 18 },
  bold: { fontWeight: "700", color: Colors.primaryDark },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 17,
    color: Colors.textPrimary, backgroundColor: Colors.surface, marginBottom: 16, fontWeight: "600",
  },
  fitCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, padding: 14, marginBottom: 14 },
  fitTitle: { fontSize: 14, fontWeight: "800" },
  fitText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  knownLink: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 14 },
  knownText: { flex: 1, fontSize: 13, color: Colors.primary, fontWeight: "600", lineHeight: 18 },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", lineHeight: 16 },
});
