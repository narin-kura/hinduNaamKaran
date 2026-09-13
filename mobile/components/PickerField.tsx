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

export function PickerField({ label, value, mode, icon, onChange }: Props) {
  const [show, setShow] = useState(false);

  const displayText =
    mode === "date"
      ? value.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setShow(true)}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.value}>{displayText}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={mode === "date" ? new Date() : undefined}
          onChange={(_event, selectedDate) => {
            setShow(Platform.OS === "ios");
            if (selectedDate) onChange(selectedDate);
          }}
        />
      )}
    </View>
  );
}

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
});
