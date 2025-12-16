// components/SkeletonCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />

      <View style={styles.textLine} />
      <View style={[styles.textLine, { width: "60%" }]} />

      <View style={styles.smallLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    alignSelf: "center",
    height: 260,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  image: {
    height: 150,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  textLine: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 8,
  },
  smallLine: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    width: "40%",
    marginTop: 4,
  },
});
