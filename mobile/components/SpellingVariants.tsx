import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { getBirthNumber, getCompatibility, getNameNumber } from "../lib/numerology";
import { suggestSpellings } from "../lib/variants";
import { RankBadge } from "./RankBadge";

/** Alternative spellings that keep the sound but improve the numerology rank. */
export function SpellingVariants({ name, birthDay }: { name: string; birthDay: number }) {
  const rank = getCompatibility(getBirthNumber(birthDay), getNameNumber(name));
  const variants = suggestSpellings(name, birthDay);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="create-outline" size={16} color={Colors.primary} />
        <Text style={styles.cardTitle}>Spelling variations</Text>
      </View>
      {rank === "best" ? (
        <Text style={styles.text}>
          "{name}" already ranks Best for this birth number. No spelling change is needed.
        </Text>
      ) : variants.length === 0 ? (
        <Text style={styles.text}>
          No spelling of "{name}" that keeps its sound reaches a better rank. Changing the
          pronunciation would make it a different name.
        </Text>
      ) : (
        <View>
          <Text style={styles.text}>
            Same sound, same first syllable, different letters. Numerologists commonly adjust a
            spelling this way to reach a better number.
          </Text>
          {variants.map((v) => (
            <View key={v.spelling} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spelling}>{v.spelling}</Text>
                <Text style={styles.meta}>
                  Name number {v.nameNumber} · {v.reason} · {v.edits === 1 ? "1 change" : `${v.edits} changes`}
                </Text>
              </View>
              <RankBadge rank={v.rank} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textTransform: "uppercase", letterSpacing: 0.3 },
  text: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  spelling: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  meta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
