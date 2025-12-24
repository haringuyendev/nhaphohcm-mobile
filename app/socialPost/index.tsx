// app/socialPost/create.tsx
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { X, Camera } from 'lucide-react-native';

import { useCreateMediaMutation } from '@/store/api/media';
import { useCreateSocialPostMutation } from '@/store/api/socialPosts';
import { markdownToLexical } from '@/utils/lexical_converter';
import { AuthButton } from '@/components/Auth/AuthButton';

export default function CreateSocialPostScreen() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();

  const [title, setTitle] = useState('');
  const [markdownDescription, setMarkdownDescription] = useState('');
  const [images, setImages] = useState<{ uri: string }[]>([]);

  const [createMedia, { isLoading: uploadingMedia }] = useCreateMediaMutation();
  const [createPost, { isLoading: creatingPost }] = useCreateSocialPostMutation();

  const isLoading = uploadingMedia || creatingPost;

  const pickImages = async () => {
    if (images.length >= 10) {
      Alert.alert('Giới hạn', 'Chỉ được đăng tối đa 10 ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri }));
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề bài viết');
      return;
    }

    if (!markdownDescription.trim() && images.length === 0) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập mô tả hoặc thêm ảnh');
      return;
    }

    try {
      let attachments = [];

      if (images.length > 0) {
        attachments = [];

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const formData = new FormData();

          formData.append('file', {
            uri: img.uri,
            name: `post_${Date.now()}_${i}.jpg`,
            type: 'image/jpeg',
          } as any);

          const alt = i === 0 ? `Ảnh đại diện: ${title}` : `Ảnh chi tiết ${i + 1}`;
          formData.append('_payload', JSON.stringify({ alt }));

          const uploadRes = await createMedia(formData).unwrap();
          attachments.push({ file: uploadRes.doc.id });
        }
      }

      const lexicalContent = markdownToLexical(markdownDescription);

      await createPost({
        title: title.trim(),
        content: JSON.parse(lexicalContent),
        community: communityId || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      }).unwrap();

      Alert.alert('Thành công!', 'Bài viết đã được đăng', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Create post error:', error);
      Alert.alert(
        'Lỗi',
        error?.data?.message || 'Không thể đăng bài viết. Vui lòng thử lại.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Tiêu đề */}
          <TextInput
            style={styles.titleInput}
            placeholder="Tiêu đề bài viết..."
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          {/* Mô tả */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#666"
            value={markdownDescription}
            onChangeText={setMarkdownDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Danh sách ảnh */}
          {images.length > 0 && (
            <FlatList
              data={images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              style={styles.imageList}
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverText}>Bìa</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <X size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Nút thêm ảnh */}
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
            <Camera size={28} color="#666" />
            <Text style={styles.addPhotoText}>Thêm ảnh</Text>
            <Text style={styles.addPhotoSub}>
              {images.length}/10 ảnh
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Nút đăng */}
        <View style={styles.footer}>
          <AuthButton
            label={isLoading ? 'Đang đăng...' : 'Đăng bài'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading && <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />}
          </AuthButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { flex: 1, padding: 16 },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  descriptionInput: {
    fontSize: 17,
    color: '#000',
    minHeight: 120,
    paddingTop: 8,
  },
  imageList: { marginVertical: 16 },
  imageWrapper: { position: 'relative', marginRight: 12 },
  imagePreview: { width: 120, height: 120, borderRadius: 12 },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  addPhotoBtn: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoText: { fontSize: 17, fontWeight: '600', marginTop: 12 },
  addPhotoSub: { color: '#666', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE' },
  submitBtn: { backgroundColor: '#1877F2', height: 50, borderRadius: 12 },
});