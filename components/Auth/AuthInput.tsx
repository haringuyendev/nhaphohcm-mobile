// components/AuthInput.tsx
import { View, TextInput, StyleSheet } from "react-native";

export function AuthInput({ placeholder, value, onChangeText, secure }: any) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      placeholderTextColor="#9CA3AF"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#111",
    marginBottom: 12,
  },
});
