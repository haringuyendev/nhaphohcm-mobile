// app/forgot-password.tsx
import { View, Text } from "react-native";
import { useState } from "react";
import { AuthInput } from "@/components/Auth/AuthInput";
import { AuthButton } from "@/components/Auth/AuthButton";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async () => {
    // call /users/forgot-password
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 20 }}>
        Quên mật khẩu
      </Text>

      <AuthInput placeholder="Email" value={email} onChangeText={setEmail} />
      <AuthButton label="Gửi liên kết đặt lại mật khẩu" onPress={submit} />
    </View>
  );
}
