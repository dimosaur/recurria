import React from "react";
import type { FieldError } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

export type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string | FieldError;
  right?: React.ReactNode;
  testID?: string;
};

export default function FormField({ label, children, error, right, testID }: FormFieldProps) {
  const errorMsg = typeof error === "string" ? error : error?.message;
  return (
    <View style={{ marginBottom: 14 }} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {right}
      </View>
      {children}
      {!!errorMsg && <Text style={styles.fieldError}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: "#9BA1A6",
    fontSize: 12,
    marginBottom: 6,
  },
  fieldError: {
    marginTop: 6,
    color: "#FF453A",
    fontSize: 12,
  },
});


