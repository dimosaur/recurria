import { pluralize } from "@/lib/date";
import { Platform, StyleSheet, Text, View } from "react-native";

function getDueStyle(days: number) {
  if (days < 0) {
    return {
      bg: "rgba(255,69,58,0.15)",
      text: "#FF453A",
      label: `${pluralize(Math.abs(days), "day")} overdue`,
    };
  }
  if (days === 0) {
    return { bg: "rgba(255,159,10,0.16)", text: "#FF9F0A", label: "Due today" };
  }
  if (days <= 7 && days >= 1) {
    return {
      bg: "rgba(10,132,255,0.16)",
      text: "#0A84FF",
      label: days === 1 ? "Due tomorrow" : `In ${pluralize(days, "day")}`,
    };
  }
  return {
    bg: "rgba(48,209,88,0.18)",
    text: "#30D158",
    label: `In ${pluralize(days, "day")}`,
  };
}

export default function DuePill({ days }: { days: number }) {
  const { bg, text, label } = getDueStyle(days);
  return (
    <View style={[styles.duePill, { backgroundColor: bg }]}>
      <Text style={[styles.duePillText, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  duePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  duePillText: {
    fontSize: 11,
    fontWeight: Platform.select({ ios: "600", android: "500", default: "600" }),
  },
});
