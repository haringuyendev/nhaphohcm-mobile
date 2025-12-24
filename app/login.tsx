// app/login.tsx
import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLoginMutation } from '@/store/api/auth';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(''); // Email hoặc số điện thoại
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const res = await login({
        // Backend của bạn có thể nhận email hoặc phone
        email: identifier.includes('@') ? identifier : '',
        password,
      }).unwrap();

      await SecureStore.setItemAsync('token', res.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      alert(e?.data?.message || 'Sai email/số điện thoại hoặc mật khẩu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo Batdongsan style */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground} />
            
          </View>

          <Text style={styles.title}>Chào mừng bạn trở lại!</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục quản lý tin đăng bất động sản
          </Text>

          {/* Input Email/Số điện thoại */}
          <AuthInput
            placeholder="Email hoặc số điện thoại"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Input Mật khẩu */}
          <AuthInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secure
          />

          {/* Nút Đăng nhập - đỏ cam gradient nổi bật */}
          <AuthButton
            label={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
          >
            {isLoading && <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />}
          </AuthButton>

          {/* Quên mật khẩu */}
          <TouchableOpacity
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Divider "HOẶC" */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Đăng ký */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupLink}> Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0', // Nền cam nhạt như Batdongsan
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#EF4444',
    borderRadius: 60,
    opacity: 0.15,
    transform: [{ scale: 1.4 }],
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EF4444', // Đỏ cam đậm Batdongsan
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    height: 52,
    marginTop: 16,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  forgotText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 15,
  },
  signupLink: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});