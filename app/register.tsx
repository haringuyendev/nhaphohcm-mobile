// app/register.tsx
import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLoginMutation, useRegisterMutation } from '@/store/api/auth';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [err, setErr] = useState('');

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const router = useRouter();

  const submit = async () => {
    try {
      await register(form).unwrap();

      const res = await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      // Payload CMS trả token ở res.token
      await SecureStore.setItemAsync('token', res.token);

      setForm({ name: '', email: '', phone: '', password: '' });
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log('Registration failed:', err?.data?.errors);
      if (err?.data?.errors && err.data.errors.length > 0) {
        const errors = err.data.errors;
        errors[0]?.message && setErr(errors[0].message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <AuthInput
        placeholder="Họ và tên"
        value={form.name}
        onChangeText={(t: string) => setForm({ ...form, name: t })}
        onFocus={() => setErr('')}
      />

      <AuthInput
        placeholder="Email"
        value={form.email}
        onChangeText={(t: string) => setForm({ ...form, email: t })}
        onFocus={() => setErr('')}
      />

      <AuthInput
        placeholder="Số điện thoại"
        value={form.phone}
        onChangeText={(t: string) => setForm({ ...form, phone: t })}
        onFocus={() => setErr('')}
      />

      <AuthInput
        placeholder="Mật khẩu"
        value={form.password}
        secure
        onChangeText={(t: string) => setForm({ ...form, password: t })}
        onFocus={() => setErr('')}
      />

      {err ? (
        <Text style={{ color: 'red', marginTop: 12, marginBottom: 12 }}>
          {err}
        </Text>
      ) : null}

      <AuthButton label="Tạo tài khoản" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#009BA1',
    marginBottom: 24,
    textAlign: 'center',
  },
});
