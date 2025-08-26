import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Overview() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>Overview</Text>
      {Array.from({ length: 20 }).map((_, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.text}>Item {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  item: {
    height: 100,
    backgroundColor: "#333",
    marginVertical: 10,
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
