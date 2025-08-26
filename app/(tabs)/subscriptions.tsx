import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Subscriptions() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Subscriptions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
  },
});
