// app/reset-password.tsx
import { View, Text } from "react-native";
import { useState } from "react";
import { AuthInput } from "@/components/Auth/AuthInput";
import { AuthButton } from "@/components/Auth/AuthButton";
import { useLocalSearchParams } from "expo-router";

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState("");

  const submit = async () => {
    // call /users/reset-password
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 20 }}>
        Đặt lại mật khẩu
      </Text>

      <AuthInput
        placeholder="Mật khẩu mới"
        secure
        value={password}
        onChangeText={setPassword}
      />
      <AuthButton label="Xác nhận" onPress={submit} />
    </View>
  );
}
