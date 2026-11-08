import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { CityMatch } from "../constants/cities";
import { CityPicker } from "../components/CityPicker";
import { PickerField } from "../components/PickerField";
import { Gender } from "../lib/suggest";
import namesData from "../data/names.json";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.vigyatri.hindunaamkaran";
// Rounded down so the claim stays true as names are added: 2941 -> "2,900+".
const NAME_COUNT = `${(Math.floor(namesData.length / 100) * 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}+`;

const FACTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "book-outline", text: `${NAME_COUNT} names` },
  { icon: "cloud-offline-outline", text: "Works offline" },
  { icon: "heart-outline", text: "Free · no ads" },
];

const STEPS = [
  { n: "1", title: "Birth details", text: "Date, time and place" },
  { n: "2", title: "Nakshatra", text: "Birth star and naming syllable" },
  { n: "3", title: "Names", text: "Ranked Best, Good or Avoid" },
];

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
  const [cityError, setCityError] = useState(false);

  const birthParams = () =>
    city && {
      date: toDateParam(date),
      time: toTimeParam(time),
      timeZone: city.timeZone,
      cityLabel: city.city,
      gender,
    };

  const onCheck = () => {
    const p = birthParams();
    if (!p) {
      setCityError(true);
      return;
    }
    setCityError(false);
    router.push({ pathname: "/check", params: p });
  };

  const onSubmit = () => {
    if (!city) {
      setCityError(true);
      return;
    }
    setCityError(false);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.column}>
      <View style={styles.hero}>
        <Image
          source={require("../assets/babies.png")}
          style={styles.babies}
          resizeMode="contain"
          accessibilityLabel="Illustration of three smiling babies"
        />
        <Text style={styles.heroKicker}>NAAMAKARAN · NAMING CEREMONY</Text>
        <Text style={styles.introTitle}>Find an auspicious name for your little one</Text>
        <Text style={styles.introText}>
          Enter the baby's birth date, time, and place. HinduNaamKaran finds the traditional
          Nakshatra-based naming syllable, then ranks matching names using numerology.
        </Text>
        <View style={styles.factRow}>
          {FACTS.map((f) => (
            <View key={f.text} style={styles.fact}>
              <Ionicons name={f.icon} size={13} color={Colors.primaryDark} />
              <Text style={styles.factText}>{f.text}</Text>
            </View>
          ))}
        </View>
        {Platform.OS === "web" && (
          <TouchableOpacity style={styles.playBtn} onPress={() => Linking.openURL(PLAY_URL)}>
            <Ionicons name="logo-google-playstore" size={20} color="#fff" />
            <View>
              <Text style={styles.playSmall}>DOWNLOAD THE APP ON</Text>
              <Text style={styles.playBig}>Google Play</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stepRow}>
        {STEPS.map((st) => (
          <View key={st.n} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{st.n}</Text>
            </View>
            <Text style={styles.stepTitle}>{st.title}</Text>
            <Text style={styles.stepText}>{st.text}</Text>
          </View>
        ))}
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
          <CityPicker
            value={city}
            onChange={(c) => {
              setCity(c);
              setCityError(false);
            }}
          />
          {cityError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color={Colors.worst} />
              <Text style={styles.errorText}>
                Please search for and select the baby's birth city above.
              </Text>
            </View>
          )}
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

      <TouchableOpacity style={styles.secondaryBtn} onPress={onCheck}>
        <Ionicons name="search-outline" size={17} color={Colors.primary} />
        <Text style={styles.secondaryText}>Check a name I already have in mind</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.methodLink} onPress={() => router.push("/method")}>
        <Ionicons name="book-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.methodText}>How it works: panchang, ayanamsa and numerology used</Text>
      </TouchableOpacity>

      {Platform.OS === "web" && (
        <TouchableOpacity style={styles.playBtn} onPress={() => Linking.openURL(PLAY_URL)}>
          <Ionicons name="logo-google-playstore" size={20} color="#fff" />
          <View>
            <Text style={styles.playSmall}>DOWNLOAD THE APP ON</Text>
            <Text style={styles.playBig}>Google Play</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.disclaimer}>
        Suggestions blend traditional Nakshatra naming with Chaldean numerology. They're a
        starting point for reflection and family discussion, not a substitute for guidance
        from a family priest or astrologer.
      </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, paddingBottom: 40, alignItems: "center" },
  column: { width: "100%", maxWidth: 560 },
  hero: {
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 22,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  babies: { width: 300, height: 100 },
  heroKicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: Colors.secondary, marginTop: 12 },
  introTitle: { fontSize: 23, fontWeight: "800", color: Colors.textPrimary, marginTop: 6, textAlign: "center", lineHeight: 29 },
  introText: { fontSize: 13, color: Colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 19 },
  factRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 14 },
  fact: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.surface, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
  },
  factText: { fontSize: 12, fontWeight: "700", color: Colors.primaryDark },
  stepRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  step: {
    flex: 1, alignItems: "center", backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, paddingVertical: 12, paddingHorizontal: 6,
  },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stepTitle: { fontSize: 13, fontWeight: "800", color: Colors.textPrimary, marginTop: 6, textAlign: "center" },
  stepText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: "center", lineHeight: 15 },
  playBtn: {
    flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "center",
    backgroundColor: "#111", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginTop: 18,
  },
  playSmall: { color: "#fff", fontSize: 9, fontWeight: "600", letterSpacing: 0.6 },
  playBig: { color: "#fff", fontSize: 16, fontWeight: "700" },
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
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  errorText: { fontSize: 12, color: Colors.worst, fontWeight: "600", flex: 1 },
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
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 13, marginTop: 10,
    backgroundColor: Colors.surface,
  },
  secondaryText: { color: Colors.primary, fontSize: 15, fontWeight: "700" },
  methodLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  methodText: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 16, lineHeight: 16, paddingHorizontal: 8 },
});
