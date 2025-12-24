// app/(tabs)/profile/edit.tsx
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
import { useEffect, useState } from 'react';
import { AuthInput } from '@/components/Auth/AuthInput';
import { AuthButton } from '@/components/Auth/AuthButton';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/hooks/use-user';
import { useUpdateMeMutation } from '@/store/api/auth'; // Giả sử bạn có mutation này
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { getImageUrl, resolveImageUrl } from '@/utils'; // hàm lấy URL ảnh từ Payload media
import { useCreateMediaMutation } from '@/store/api/media';
import { Media } from '@/types';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, reloadUser } = useUser(); // useUser trả về user hiện tại
    const [updateUser, { isLoading }] = useUpdateMeMutation();
    const [uploadMedia] = useCreateMediaMutation();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null); // ảnh mới chọn từ thư viện

    // Ảnh hiển thị (ưu tiên ảnh mới chọn, fallback về avatar hiện tại)
    const displayAvatar = avatarUri || (user?.avatar ? getImageUrl(user.avatar) : null);

    const pickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền để chọn ảnh đại diện');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setAvatarUri(user.avatar ? resolveImageUrl((user.avatar as Media).url) : null);
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
            return;
        }

        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return;
        }

        try {
            let avatarId = (user?.avatar as Media)?.id || null;

            // Nếu có ảnh mới → upload lên Payload media trước
            if (avatarUri) {
                const formData = new FormData();
                formData.append('file', {
                    uri: avatarUri,
                    name: 'avatar.jpg',
                    type: 'image/jpeg',
                } as any);
                const alt = `Ảnh đại diện: ${name}`;
                formData.append('_payload', JSON.stringify({ alt }));
                // Hoặc dùng fetch trực tiếp nếu chưa có mutation
                const uploadRes = await uploadMedia(formData).unwrap();
                avatarId = uploadRes.doc.id;
            }

            // Cập nhật user
            await updateUser({
                id: user?.id as string,
                data: {
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    avatar: avatarId,
                }
            }).unwrap();

            // Refetch user để cập nhật global state
            await reloadUser();

            Toast.show({
                type: 'realEstateError',
                text1: 'Cập nhật thành công!',
                text2: 'Thông tin cá nhân đã được cập nhật',
            });
        } catch (error: any) {
            console.error('Update profile error:', error);
            Toast.show({
                type: 'realEstateError',
                text1: 'Đã có lỗi xảy ra',
                text2: error?.data?.message || 'Không thể cập nhật. Vui lòng thử lại.',
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

                    {/* Title */}
                    <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
                    <Text style={styles.subtitle}>
                        Cập nhật thông tin để người mua liên hệ dễ dàng hơn
                    </Text>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={pickAvatar}>
                            {displayAvatar ? (
                                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>Chọn ảnh</Text>
                                </View>
                            )}
                            <View style={styles.cameraOverlay}>
                                <Text style={styles.cameraText}>📷</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Text style={styles.label}>Họ và tên *</Text>
                        <AuthInput
                            placeholder="Nhập họ và tên"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Số điện thoại *</Text>
                        <AuthInput
                            placeholder="Nhập số điện thoại"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Email</Text>
                        <AuthInput
                            placeholder="Email (không thể thay đổi)"
                            value={user?.email || ''}
                            editable={false}
                            style={{ backgroundColor: '#F3F4F6' }}
                        />
                    </View>

                    {/* Save button */}
                    <AuthButton
                        label={isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        onPress={handleSave}
                        disabled={isLoading}
                        style={styles.saveButton}
                    >
                        {isLoading && <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />}
                    </AuthButton>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    backButton: {
        marginBottom: 24,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#D1431A',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF6B35',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    cameraText: {
        fontSize: 20,
    },
    form: {
        width: '100%',
        marginBottom: 40,
    },
    label: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 8,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        height: 56,
    },
});