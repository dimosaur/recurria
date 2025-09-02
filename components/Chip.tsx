import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconBg?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  testID?: string;
};

export default function Chip({
  label,
  selected,
  onPress,
  iconBg,
  iconName,
  testID,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessible
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.9 },
      ]}
    >
      {iconBg && iconName ? (
        <View style={[styles.chipIcon, { backgroundColor: iconBg }]}> 
          <Ionicons name={iconName} size={12} color="#fff" />
        </View>
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipSelected: {
    backgroundColor: "#fff",
  },
  chipText: {
    color: "#C7CBD1",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#000",
  },
  chipIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});


