import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

function Section({ icon, title, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

function B({ children }: { children: React.ReactNode }) {
  return <Text style={styles.b}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={[styles.p, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

function Link({ url, label }: { url: string; label: string }) {
  return (
    <TouchableOpacity style={styles.link} onPress={() => Linking.openURL(url)}>
      <Ionicons name="open-outline" size={13} color={Colors.primary} />
      <Text style={styles.linkText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MethodScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={styles.intro}>
        Everything below runs on your phone. Nothing is sent anywhere. This page says exactly which
        calculations and traditions are used, so you can judge them for yourself or check them
        with your family priest.
      </Text>

      <Section icon="moon-outline" title="1. Birth star (Nakshatra)">
        <P>
          The birth time you enter is converted from the birth city's time zone to universal time.
          The app then computes the <B>Moon's apparent ecliptic longitude</B> at that instant, as
          seen from the centre of the Earth.
        </P>
        <Bullet>
          <B>Ephemeris:</B> the open-source <B>astronomy-engine</B> library. Its lunar positions
          derive from E. W. Brown's lunar theory via the Improved Lunar Ephemeris (1954), as adapted
          in Montenbruck and Pfleger, <B>Astronomy on the Personal Computer</B>. Accuracy is within
          about one arc-minute.
        </Bullet>
        <Bullet>
          <B>Ayanamsa (sidereal correction):</B> <B>Lahiri</B>, also called Chitrapaksha. This is the
          ayanamsa adopted by India's Calendar Reform Committee (1955) and used by the Rashtriya
          Panchang, Drik Panchang and most Indian almanacs. It is applied as a linear approximation:
          about 23°51′ at the year 2000, increasing about 50.3 arc-seconds per year.
        </Bullet>
        <Bullet>
          <B>Divisions:</B> the sidereal zodiac is split into 27 equal Nakshatras of 13°20′, each
          into 4 padas of 3°20′, and 12 Rashis of 30°. The Moon's position picks the Nakshatra, pada
          and Rashi.
        </Bullet>
        <Bullet>
          <B>Checked against a published panchang:</B> for New Delhi on 4 September 2026, Drik
          Panchang lists Rohini ending at 11:04 PM. This app places the boundary within about a
          minute of that. The check is part of the app's automated tests.
        </Bullet>
        <P>
          <B>Known limitation:</B> the Moon is computed geocentrically. The birth place is used for
          the time zone, not for the small parallax shift seen from a specific point on Earth. That
          shift can matter only when the Moon is within a few arc-minutes of a pada boundary.
        </P>
        <Link url="https://www.drikpanchang.com/panchang/day-panchang.html" label="Drik Panchang day panchang" />
        <Link url="https://github.com/cosinekitty/astronomy" label="astronomy-engine on GitHub" />
      </Section>

      <Section icon="text-outline" title="2. Naming syllables">
        <P>
          Each of the 108 padas has a traditional naming sound. The table used here is the standard
          Nakshatra Pada Swara table, cross-checked against Drik Panchang's published version.
        </P>
        <Bullet>
          <B>One sound, several spellings.</B> Vi, Vee and Bi are the same pada sound. The app
          treats doubled long vowels (Deepika = Di) as identical, and treats <B>Va and Ba as the same
          akshara</B> (Sanskrit व is written and spoken as ब across eastern India and elsewhere).
        </Bullet>
        <Bullet>
          <B>Consonant clusters.</B> A name such as Shiva or Pradyumna begins with a sound that is
          not itself one of the 108. It is grouped with the closest syllable in the same consonant
          family, and the app says so on the name's page.
        </Bullet>
        <Bullet>
          <B>How wide to match.</B> The strictest reading uses only the Moon's pada syllable. Most
          families and pandits accept any of the <B>four syllables of the birth Nakshatra</B>, which
          is the app's default. Naming by the <B>nine syllables of the Rashi</B> is also a widely
          followed practice. You can switch between all three on the results screen, and names
          that begin with the exact pada syllable are always listed first.
        </Bullet>
        <Link url="https://www.drikpanchang.com/swar-siddhanta/nakshatra/nakshatra-pada-swar-siddhanta.html" label="Drik Panchang: Nakshatra pada syllables" />
      </Section>

      <Section icon="calculator-outline" title="3. Numerology">
        <Bullet>
          <B>System: Chaldean numerology.</B> Letters carry the values 1 to 8 (A I J Q Y = 1, B K R = 2,
          C G L S = 3, D M T = 4, E H N X = 5, U V W = 6, O Z = 7, F P = 8). The number 9 is not given
          to any letter. This is the system most Indian numerologists use for names.
        </Bullet>
        <Bullet>
          <B>Birth number (Mulank):</B> the day of the month reduced to one digit. Born on the 25th
          gives 2 + 5 = 7.
        </Bullet>
        <Bullet>
          <B>Name number:</B> the letter values added together and reduced to one digit.
        </Bullet>
        <Bullet>
          <B>Compatibility: classical planetary friendship (Graha Maitri).</B> Each number is ruled by
          a planet: 1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars.
          The natural friendships between the seven classical planets, as given in the Brihat
          Parashara Hora Shastra, decide the rank. Friend is Best, neutral is Good, enemy is Worst,
          and a shared planet is Best. These relationships are not always mutual: Saturn treats Mars
          as an enemy while Mars treats Saturn as neutral. That is the classical text, not a bug.
        </Bullet>
        <Bullet>
          <B>Rahu and Ketu.</B> The classical seven-planet chart defines no friends or enemies for
          these two. Numbers 4 and 7 are therefore treated as neutral to everything, and the app says
          so whenever it applies.
        </Bullet>
        <P>
          <B>Not used:</B> Pythagorean letter values, the Lo Shu grid, and the full-date destiny
          number (Bhagyank). If your family follows one of those, the ranks here will differ.
        </P>
      </Section>

      <Section icon="library-outline" title="4. Names and meanings">
        <P>
          Names and their verse numbers come from public-domain scripture: the Vishnu Sahasranama,
          the Shiva Sahasranama (Linga Purana), the Lalita Sahasranama, and the Lakshmi, Durga,
          Gauri and Ganesha Ashtottara Shatanamavalis, alongside widely used modern Sanskrit and
          Hindi names. Every name shows its source. The English meanings were written for this app.
        </P>
      </Section>

      <Text style={styles.disclaimer}>
        Naming customs vary by region and family, and numerology systems differ between
        practitioners. These results are a starting point for reflection and family discussion, not
        a substitute for guidance from your family priest or astrologer.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  intro: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textTransform: "uppercase", letterSpacing: 0.3 },
  p: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 8 },
  b: { fontWeight: "700", color: Colors.textPrimary },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 2 },
  bulletDot: { color: Colors.primary, fontSize: 14, lineHeight: 21 },
  link: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  linkText: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: "center", lineHeight: 16, marginTop: 6 },
});
