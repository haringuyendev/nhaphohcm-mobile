// app/register.tsx
import { View, Text, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { AuthInput } from "@/components/Auth/AuthInput";
import { AuthButton } from "@/components/Auth/AuthButton";
import { useRegisterMutation } from "@/store/api/auth";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [registerUser, { isLoading }] = useRegisterMutation();

  const submit = async () => {
    try {
      // Validate đơn giản
      if (!form.name || !form.email || !form.password) {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        return;
      }

      const res = await registerUser(form).unwrap(); // ⭐ unwrap để lấy data thật

      console.log("REGISTER_SUCCESS:", res);

      Alert.alert("Thành công", "Tài khoản đã được tạo!");

      // Reset form
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err: any) {
      console.log("REGISTER_ERROR:", err.data.errors);

      const message =
        err?.data?.error ||
        err?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      Alert.alert("Lỗi", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <AuthInput
        placeholder="Họ và tên"
        value={form.name}
        onChangeText={(t:any) => setForm({ ...form, name: t })}
      />

      <AuthInput
        placeholder="Email"
        value={form.email}
        onChangeText={(t:any) => setForm({ ...form, email: t })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AuthInput
        placeholder="Phone"
        value={form.phone}
        onChangeText={(t:any) => setForm({ ...form, phone: t })}
        keyboardType="phone"
        autoCapitalize="none"
      />

      <AuthInput
        placeholder="Mật khẩu"
        secure
        value={form.password}
        onChangeText={(t:any) => setForm({ ...form, password: t })}
      />

      <AuthButton
        label={isLoading ? "Đang tạo..." : "Tạo tài khoản"}
        onPress={submit}
        disabled={isLoading}
      />
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
