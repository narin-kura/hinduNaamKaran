import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

type Props = {
  label: string;
  value: Date;
  mode: "date" | "time";
  icon: keyof typeof Ionicons.glyphMap;
  onChange: (date: Date) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function PickerField({ label, value, mode, icon, onChange }: Props) {
  const [show, setShow] = useState(false);

  const displayText =
    mode === "date"
      ? value.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  // The native picker library has no web implementation, so on web use the
  // browser's own date/time input. Keeps the other half of the Date intact.
  // Nothing else ever sets the date, so the input can stay uncontrolled.
  if (Platform.OS === "web") {
    const onWebChange = (e: { target: { value: string } }) => {
      const v = e.target.value;
      if (!v) return;
      const next = new Date(value);
      if (mode === "date") {
        const [y, m, d] = v.split("-").map(Number);
        next.setFullYear(y, m - 1, d);
      } else {
        const [h, min] = v.split(":").map(Number);
        next.setHours(h, min, 0, 0);
      }
      onChange(next);
    };
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.field}>
          <Ionicons name={icon} size={18} color={Colors.primary} />
          {React.createElement("input", {
            type: mode,
            // Uncontrolled on purpose: re-setting `value` on every keystroke
            // resets the browser's segment editor and drops typed digits.
            defaultValue: mode === "date" ? toDateInput(value) : toTimeInput(value),
            max: mode === "date" ? toDateInput(new Date()) : undefined,
            onChange: onWebChange,
            style: webInputStyle,
            "aria-label": label,
          })}
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setShow(true)}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.value}>{displayText}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} style={{ marginLeft: "auto" }} />
      </TouchableOpacity>
      {show && (
        <View>
          <DateTimePicker
            value={value}
            mode={mode}
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={mode === "date" ? new Date() : undefined}
            onChange={(event, selectedDate) => {
              // Android: the dialog closes itself on both "set" and "dismissed".
              if (Platform.OS !== "ios") setShow(false);
              if (event.type === "set" && selectedDate) onChange(selectedDate);
            }}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShow(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const webInputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 15,
  fontWeight: 600,
  color: Colors.textPrimary,
  fontFamily: "inherit",
  padding: 0,
  cursor: "pointer",
} as const;

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.surface,
  },
  value: { fontSize: 15, color: Colors.textPrimary, fontWeight: "600" },
  doneBtn: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
  },
  doneText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
