import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, SCREEN_BG } from "../constants/Colors";
import { CityMatch } from "../constants/cities";
import { CityPicker } from "../components/CityPicker";
import { PickerField } from "../components/PickerField";
import { Gender } from "../lib/suggest";
import namesData from "../data/names.json";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.vigyatri.hindunaamkaran";
// Rounded down so the claim stays true as names are added: 2941 -> "2,900+".
const NAME_COUNT = `${(Math.floor(namesData.length / 100) * 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}+`;

// iPhone/iPad visitors can't use the Play link; show them Safari's Add to Home Screen instead.
// Checked after mount: the web build is pre-rendered, where navigator doesn't exist.
const detectIosWeb = () =>
  Platform.OS === "web" &&
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const FACTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "book-outline", text: `${NAME_COUNT} names` },
  { icon: "cloud-offline-outline", text: "Works offline" },
  { icon: "heart-outline", text: "Free · no ads" },
];

const TORAN_STYLE = {
  alignSelf: "stretch",
  height: 88,
  margin: "-18px -18px 4px",
  backgroundImage: "url(/babytoran.png)", // marigold version kept in public/toran.png
  backgroundRepeat: "repeat-x",
  backgroundSize: "384px 88px",
  backgroundPosition: "center top",
} as const;

const PILL_COLORS: Record<string, { fg: string; bg: string }> = {
  ANY: { fg: "#6d28d9", bg: "#ede9fe" },
  M: { fg: "#0369a1", bg: "#e0f2fe" },
  F: { fg: "#be185d", bg: "#fce7f3" },
};

const STEPS = [
  { n: "1", emoji: "📅", tint: "#cffafe", title: "Birth details", text: "Date, time and place" },
  { n: "2", emoji: "🌙", tint: "#ede9fe", title: "Nakshatra", text: "Birth star and naming syllable" },
  { n: "3", emoji: "✨", tint: "#dcfce7", title: "Names", text: "Ranked Best, Good or Avoid" },
];

const WHY = [
  { emoji: "🔭", color: "#7c3aed", title: "Real astronomy", text: "The Moon's exact position at the birth time and city." },
  { emoji: "🔢", color: "#ca8a04", title: "Numerology ranked", text: "Every name marked Best, Good or Avoid." },
  { emoji: "🔒", color: "#15803d", title: "Private & offline", text: "Works without internet. Birth details never leave your device." },
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
  const [IS_IOS_WEB, setIosWeb] = useState(false);
  useEffect(() => setIosWeb(detectIosWeb()), []);

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
      {Platform.OS === "web" &&
        // Baby-props toran (rattle, bottle, cradle, booties...) across the top (web only; file in public/).
        React.createElement("div", { "aria-hidden": true, style: TORAN_STYLE })}
      <View style={styles.column}>
      <View style={styles.hero}>
        {Platform.OS === "web" && React.createElement("div", { className: "hnk-hero-bg", "aria-hidden": true })}
        <View pointerEvents="none" style={[styles.blob, { top: -50, left: -50, backgroundColor: "rgba(255,255,255,0.10)" }]} />
        <View pointerEvents="none" style={[styles.blob, { bottom: -60, right: -40, backgroundColor: "rgba(45,212,191,0.35)" }]} />
        <View pointerEvents="none" style={[styles.blob, { top: 40, right: -70, width: 120, height: 120, backgroundColor: "rgba(255,255,255,0.10)" }]} />
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
              <Ionicons name={f.icon} size={13} color="#fff" />
              <Text style={styles.factText}>{f.text}</Text>
            </View>
          ))}
        </View>
        {IS_IOS_WEB && (
          <View style={styles.iosHint}>
            <Ionicons name="share-outline" size={20} color={Colors.primaryDark} />
            <Text style={styles.iosHintText}>
              On iPhone? Tap <Text style={styles.iosHintBold}>Share</Text>, then{" "}
              <Text style={styles.iosHintBold}>Add to Home Screen</Text> to use HinduNaamKaran like an app.
            </Text>
          </View>
        )}
        {Platform.OS === "web" && !IS_IOS_WEB && (
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
            <View style={[styles.stepIcon, { backgroundColor: st.tint }]}>
              <Text style={styles.stepEmoji}>{st.emoji}</Text>
            </View>
            <Text style={styles.stepTitle}>{st.title}</Text>
            <Text style={styles.stepText}>{st.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardHeadEmoji}>👶</Text>
          <View>
            <Text style={styles.cardHeadTitle}>Baby's birth details</Text>
            <Text style={styles.cardHeadSub}>Exact time gives the most accurate birth star</Text>
          </View>
        </View>
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
                style={[
                  styles.genderPill,
                  gender === opt.key && { borderColor: PILL_COLORS[opt.key].fg, backgroundColor: PILL_COLORS[opt.key].bg },
                ]}
                onPress={() => setGender(opt.key)}
              >
                <Text style={[styles.genderText, gender === opt.key && { color: PILL_COLORS[opt.key].fg }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
        {Platform.OS === "web" && React.createElement("div", { className: "hnk-cta-bg", "aria-hidden": true })}
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

      <Text style={styles.whyTitle}>Why families like it</Text>
      <View style={styles.whyRow}>
        {WHY.map((w) => (
          <View key={w.title} style={[styles.why, { borderTopColor: w.color }]}>
            <Text style={styles.whyEmoji}>{w.emoji}</Text>
            <Text style={styles.whyHead}>{w.title}</Text>
            <Text style={styles.whyText}>{w.text}</Text>
          </View>
        ))}
      </View>

      {Platform.OS === "web" && !IS_IOS_WEB && (
        <TouchableOpacity style={styles.playBtn} onPress={() => Linking.openURL(PLAY_URL)}>
          <Ionicons name="logo-google-playstore" size={20} color="#fff" />
          <View>
            <Text style={styles.playSmall}>DOWNLOAD THE APP ON</Text>
            <Text style={styles.playBig}>Google Play</Text>
          </View>
        </TouchableOpacity>
      )}

      {Platform.OS === "web" && (
        <TouchableOpacity style={styles.vgBadge} onPress={() => Linking.openURL("https://vigyatri.com")} accessibilityRole="link">
          <Image source={require("../assets/vigyatri-mark.png")} style={{ width: 18, height: 18 }} />
          <Text style={styles.vgBadgeText}>A Vigyatri app</Text>
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
  container: { flex: 1, backgroundColor: SCREEN_BG },
  scroll: { padding: 18, paddingBottom: 40, alignItems: "center" },
  column: { width: "100%", maxWidth: 560 },
  hero: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 18,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#155e75",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  blob: { position: "absolute", width: 200, height: 200, borderRadius: 100 },
  babies: { width: 300, height: 100 },
  heroKicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#fde68a", marginTop: 12 },
  introTitle: { fontSize: 25, fontWeight: "800", color: "#fff", marginTop: 6, textAlign: "center", lineHeight: 31, maxWidth: 380 },
  introText: { fontSize: 13.5, color: "#e0f7fa", textAlign: "center", marginTop: 8, lineHeight: 20 },
  factRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 14 },
  fact: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
  },
  factText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  stepRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  step: {
    flex: 1, alignItems: "center", backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, paddingVertical: 12, paddingHorizontal: 6,
  },
  stepIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  stepEmoji: { fontSize: 20 },
  stepTitle: { fontSize: 13, fontWeight: "800", color: Colors.textPrimary, marginTop: 6, textAlign: "center" },
  stepText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: "center", lineHeight: 15 },
  playBtn: {
    flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "center",
    backgroundColor: "#111", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginTop: 18,
  },
  iosHint: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16,
    backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
  },
  iosHintText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  iosHintBold: { fontWeight: "800", color: Colors.primaryDark },
  playSmall: { color: "#fff", fontSize: 9, fontWeight: "600", letterSpacing: 0.6 },
  playBig: { color: "#fff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 4,
    borderTopColor: Colors.primary,
    padding: 16,
    gap: 16,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeadEmoji: { fontSize: 28 },
  cardHeadTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },
  cardHeadSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  whyTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginTop: 22, marginBottom: 10 },
  whyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  why: {
    flexGrow: 1, flexBasis: 150, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, borderTopWidth: 4, padding: 12, alignItems: "center",
  },
  whyEmoji: { fontSize: 26 },
  whyHead: { fontSize: 13.5, fontWeight: "800", color: Colors.textPrimary, marginTop: 4, textAlign: "center" },
  whyText: { fontSize: 11.5, color: Colors.textSecondary, marginTop: 3, textAlign: "center", lineHeight: 16 },
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
    backgroundColor: "#db2777",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 18,
    overflow: "hidden",
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
  vgBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", marginTop: 18,
    paddingVertical: 4, paddingLeft: 6, paddingRight: 11, borderRadius: 999,
    backgroundColor: "rgba(99,102,241,0.12)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
  },
  vgBadgeText: { fontSize: 12, fontWeight: "600", color: "#312e81" },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 16, lineHeight: 16, paddingHorizontal: 8 },
});
