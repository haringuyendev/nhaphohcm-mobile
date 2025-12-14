// app/register.tsx
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { AuthInput } from "@/components/Auth/AuthInput";
import { AuthButton } from "@/components/Auth/AuthButton";

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    // gọi API register
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <AuthInput
        placeholder="Họ và tên"
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      <AuthInput
        placeholder="Email"
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
      />

      <AuthInput
        placeholder="Mật khẩu"
        value={form.password}
        secure
        onChangeText={(t) => setForm({ ...form, password: t })}
      />

      <AuthButton label="Tạo tài khoản" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#009BA1",
    marginBottom: 24,
    textAlign: "center",
  },
});
