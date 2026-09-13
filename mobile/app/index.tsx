import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { CityMatch } from "../constants/cities";
import { CityPicker } from "../components/CityPicker";
import { PickerField } from "../components/PickerField";
import { Gender } from "../lib/suggest";

const GENDER_OPTIONS: { key: Gender | "ANY"; label: string }[] = [
  { key: "ANY", label: "Either" },
  { key: "M", label: "Boy" },
  { key: "F", label: "Girl" },
];

function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeParam(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export default function BirthDetailsScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [city, setCity] = useState<CityMatch | null>(null);
  const [gender, setGender] = useState<Gender | "ANY">("ANY");

  const onSubmit = () => {
    if (!city) {
      Alert.alert("Birth place needed", "Please search for and select the baby's birth city.");
      return;
    }
    router.push({
      pathname: "/results",
      params: {
        date: toDateParam(date),
        time: toTimeParam(time),
        timeZone: city.timeZone,
        cityLabel: city.city,
        gender,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.intro}>
        <Ionicons name="sparkles" size={28} color={Colors.primary} />
        <Text style={styles.introTitle}>Find an auspicious name</Text>
        <Text style={styles.introText}>
          Enter the baby's birth date, time, and place. NaamKaran finds the traditional
          Nakshatra-based naming syllable, then ranks matching names using numerology.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <PickerField label="Date of Birth" value={date} mode="date" icon="calendar-outline" onChange={setDate} />
        </View>
        <View style={styles.fieldGroup}>
          <PickerField label="Time of Birth" value={time} mode="time" icon="time-outline" onChange={setTime} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Place of Birth</Text>
          <CityPicker value={city} onChange={setCity} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Preference</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.genderPill, gender === opt.key && styles.genderPillActive]}
                onPress={() => setGender(opt.key)}
              >
                <Text style={[styles.genderText, gender === opt.key && styles.genderTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
        <Text style={styles.submitText}>Find Names</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Suggestions blend traditional Nakshatra naming with Chaldean numerology. They're a
        starting point for reflection and family discussion, not a substitute for guidance
        from a family priest or astrologer.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  intro: { alignItems: "center", marginBottom: 20, paddingHorizontal: 8 },
  introTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 10, textAlign: "center" },
  introText: { fontSize: 13, color: Colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 19 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
  },
  fieldGroup: { gap: 0 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6 },
  genderRow: { flexDirection: "row", gap: 8 },
  genderPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  genderPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  genderText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  genderTextActive: { color: Colors.primaryDark },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 18,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 16, lineHeight: 16, paddingHorizontal: 8 },
});
