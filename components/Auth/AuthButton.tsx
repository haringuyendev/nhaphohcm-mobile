// components/AuthButton.tsx
import { Text, TouchableOpacity, StyleSheet } from "react-native";

export function AuthButton({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.txt}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
  },
  txt: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
