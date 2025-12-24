// app/register.tsx
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AuthInput } from '@/components/Auth/AuthInput';
import { AuthButton } from '@/components/Auth/AuthButton';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRegisterMutation } from '@/store/api/auth';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const isLoading = isRegisterLoading;

  const handleSubmit = async () => {
    // Reset error
    setError('');
    // Basic validation
    if (!form.name.trim()) return setError('Vui lòng nhập họ và tên');
    if (!form.email.trim() && !form.phone.trim()) return setError('Vui lòng nhập email hoặc số điện thoại');
    if (!form.password.trim()) return setError('Vui lòng nhập mật khẩu');
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      }).unwrap();

      Toast.show({
        type: 'realEstateSuccess',
        text1: 'Đăng ký thành công!',
        text2: 'Chào mừng bạn đến với cộng đồng bất động sản!',
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      const message =
        err?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setError(message);
      Toast.show({
        type: 'realEstateError',
        text1: 'Đăng ký thất bại!',
        text2: message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B35" />
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Đăng ký để đăng tin, tìm kiếm và quản lý bất động sản dễ dàng hơn
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Họ và tên */}
            <AuthInput
              placeholder="Họ và tên"
              value={form.name}
              onChangeText={(t: string) => setForm({ ...form, name: t })}
              autoCapitalize="words"
            />

            {/* Email */}
            <AuthInput
              placeholder="Email (tùy chọn)"
              value={form.email}
              onChangeText={(t: string) => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Số điện thoại */}
            <AuthInput
              placeholder="Số điện thoại (tùy chọn)"
              value={form.phone}
              onChangeText={(t: string) => setForm({ ...form, phone: t })}
              keyboardType="phone-pad"
            />

            {/* Mật khẩu */}
            <AuthInput
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={form.password}
              onChangeText={(t: string) => setForm({ ...form, password: t })}
              secure
            />

            {/* Error message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Submit button */}
            <AuthButton
              label={isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading && <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />}
            </AuthButton>
          </View>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}> Đăng nhập ngay</Text>
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
    backgroundColor: '#FFF5F0', // Nền cam nhạt Batdongsan
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    height: 56,
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
  },
  loginLink: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 6,
  },
});