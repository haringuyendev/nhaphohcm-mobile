import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLoginMutation, useRegisterMutation } from '@/store/api/auth';
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

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
        position: 'top',
      });
      return;
    }

    try {
      await register(form).unwrap();

      const res = await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      await SecureStore.setItemAsync('token', res.token);

      Toast.show({
        type: 'success',
        text1: 'Tạo tài khoản thành công',
        text2: 'Chào mừng bạn đến với BinhThanhLand 🎉',
        position: 'top',
      });

      setForm({ name: '', email: '', phone: '', password: '' });
      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công',
        text2: 'Chào mừng quý khách 🎉',
        position: 'top',
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log('Registration failed:', err?.data?.errors);

      const message =
        err?.data?.errors?.[0]?.message ||
        'Không thể tạo tài khoản, vui lòng thử lại';

      Toast.show({
        type: 'error',
        text1: 'Đăng ký thất bại',
        text2: message,
        position: 'top',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>
            Tạo tài khoản để bắt đầu sử dụng dịch vụ
          </Text>
        </View>

        {/* ---------- FORM ---------- */}
        <View style={styles.form}>
          <AuthInput
            placeholder="Họ và tên"
            value={form.name}
            onChangeText={(t: string) =>
              setForm({ ...form, name: t })
            }
          />

          <AuthInput
            placeholder="Email"
            value={form.email}
            keyboardType="email-address"
            onChangeText={(t: string) =>
              setForm({ ...form, email: t })
            }
          />

          <AuthInput
            placeholder="Số điện thoại"
            value={form.phone}
            onChangeText={(t: string) =>
              setForm({ ...form, phone: t })
            }
          />

          <AuthInput
            placeholder="Mật khẩu"
            secure
            value={form.password}
            onChangeText={(t: string) =>
              setForm({ ...form, password: t })
            }
          />

          <AuthButton
            label={
              isRegisterLoading || isLoginLoading
                ? 'Đang xử lý...'
                : 'Tạo tài khoản'
            }
            onPress={submit}
            disabled={isRegisterLoading || isLoginLoading}
          />
        </View>

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.footerLink}> Đăng nhập</Text>
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
