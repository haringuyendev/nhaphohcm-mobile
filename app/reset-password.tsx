import { AuthButton } from '@/components/Auth/AuthButton';
import { AuthInput } from '@/components/Auth/AuthInput';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Liên kết không hợp lệ',
        text2: 'Vui lòng kiểm tra lại email đặt lại mật khẩu',
        position: 'top',
      });
      return;
    }

    if (!password || password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Mật khẩu không hợp lệ',
        text2: 'Mật khẩu phải có ít nhất 6 ký tự',
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true);
      // TODO: call API /users/forgot-password
      // await forgotPassword({ email }).unwrap();
      // Fake delay để demo UX
      await new Promise((res) => setTimeout(res, 800));

      Toast.show({
        type: 'success',
        text1: 'Đặt lại mật khẩu thành công',
        text2: 'Bạn có thể đăng nhập bằng mật khẩu mới',
        position: 'top',
      });

      setPassword('');
      router.replace('/login');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Không thể đặt lại mật khẩu, vui lòng thử lại',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>
        </View>

        {/* ---------- FORM ---------- */}
        <View style={styles.form}>
          <AuthInput
            placeholder="Mật khẩu mới"
            secure
            value={password}
            onChangeText={setPassword}
          />

          <AuthButton
            label={loading ? 'Đang xác nhận...' : 'Xác nhận'}
            onPress={submit}
            disabled={loading}
          />
        </View>

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.footerLink}>← Quay lại đăng nhập</Text>
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
    marginTop: 24,
    alignItems: 'center',
  },

  footerLink: {
    fontSize: 14,
    fontWeight: '600',
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
