import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Colors } from "../constants/Colors";
import { CityMatch, searchCities } from "../constants/cities";

type Props = {
  value: CityMatch | null;
  onChange: (city: CityMatch) => void;
};

export function CityPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCities(query), [query]);

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Start typing a city name..."
        placeholderTextColor={Colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      {value && !query && (
        <View style={styles.selectedChip}>
          <Text style={styles.selectedText}>
            {value.city}, {value.province ? `${value.province}, ` : ""}{value.country}
          </Text>
        </View>
      )}
      {results.length > 0 && (
        <View style={styles.results}>
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.city}-${item.lat}-${i}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => {
                  onChange(item);
                  setQuery("");
                }}
              >
                <Text style={styles.resultCity}>{item.city}</Text>
                <Text style={styles.resultMeta}>
                  {item.province ? `${item.province}, ` : ""}{item.country}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  selectedChip: {
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  selectedText: { color: Colors.primaryDark, fontWeight: "700", fontSize: 13 },
  results: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    maxHeight: 220,
    overflow: "hidden",
  },
  resultRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultCity: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  resultMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
});
