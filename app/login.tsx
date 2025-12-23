import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLoginMutation } from '@/store/api/auth';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';



/* ======================= TOAST CONFIG ======================= */
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.toastSuccess}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
      renderLeadingIcon={() => (
        <CheckCircle size={22} color={SUCCESS} />
      )}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.toastError}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
      renderLeadingIcon={() => (
        <AlertCircle size={22} color={ACCENT} />
      )}
    />
  ),
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng nhập email và mật khẩu',
        position: 'top',
      });
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      await SecureStore.setItemAsync('token', res.token);

      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công',
        text2: 'Chào mừng bạn quay trở lại 🎉',
        position: 'top',
      });

      router.replace('/(tabs)');
    } catch (e) {
      console.log(e);

      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: 'Sai email hoặc mật khẩu',
        position: 'top',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ
          </Text>
        </View>

        {/* ---------- FORM ---------- */}
        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AuthInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secure
          />

          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgot}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <AuthButton
            label={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            onPress={handleLogin}
            disabled={isLoading}
          />
        </View>

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.footerLink}> Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- TOAST ---------- */}
      <Toast config={toastConfig} />
    </View>
  );
}

/* ======================= CONSTANTS ======================= */
const ACCENT = '#EF4444';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#F9FAFB';
const SUCCESS = '#16A34A';

/* ======================= STYLE ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 26,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },

  form: {
    gap: 14,
  },

  forgotWrapper: {
    alignItems: 'flex-end',
    marginTop: 4,
  },

  forgot: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },

  footer: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },

  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT,
  },

  /* ---------- TOAST ---------- */
  toastSuccess: {
    borderLeftColor: SUCCESS,
    borderLeftWidth: 5,
    backgroundColor: '#FFFFFF',
  },

  toastError: {
    borderLeftColor: ACCENT,
    borderLeftWidth: 5,
    backgroundColor: '#FFFFFF',
  },

  toastContent: {
    paddingHorizontal: 12,
  },

  toastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  toastMessage: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
});
