// app/forgot-password.tsx
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
import { useForgotPasswordMutation } from '@/store/api/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email của bạn');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      Alert.alert(
        'Thành công 🎉',
        'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.\nVui lòng kiểm tra hộp thư (và cả thư rác/spam).',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button - cố định góc trái trên */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={28} color="#FF6B35" />
          </TouchableOpacity>

          {/* Nội dung chính - căn giữa */}
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Đừng lo! Chỉ cần nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <AuthInput
                placeholder="Nhập email của bạn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Submit Button */}
            <AuthButton
              label={
                isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'
              }
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading && (
                <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
              )}
            </AuthButton>

            {/* Back to login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã nhớ mật khẩu?</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLink}> Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40, // Khoảng cách từ top
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#D1431A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 56,
    marginTop: 8,
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
    color: '#FF6B35',
    fontWeight: '700',
    paddingHorizontal: 6,
  },
});