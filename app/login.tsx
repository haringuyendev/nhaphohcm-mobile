// app/login.tsx
import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLoginMutation } from '@/store/api/auth';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password }).unwrap();

      // Payload CMS trả token ở res.token
      await SecureStore.setItemAsync('token', res.token);

      router.replace('/(tabs)');
    } catch (e) {
      console.log(e);
      alert('Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <AuthInput placeholder="Email" value={email} onChangeText={setEmail} />
      <AuthInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secure
      />

      <AuthButton label="Đăng nhập" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/forgot-password')}>
        <Text style={styles.forgot}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.text}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}> Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#009BA1',
    marginBottom: 24,
    textAlign: 'center',
  },
  forgot: {
    color: '#009BA1',
    marginTop: 14,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  text: {
    color: '#6B7280',
  },
  link: {
    color: '#009BA1',
    fontWeight: '600',
  },
});
