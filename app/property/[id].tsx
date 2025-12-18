import { useUser } from '@/hooks/use-user';
import { useCreateOrGetConversationMutation } from '@/store/api/conversations';
import { useGetPropertyByIdQuery } from '@/store/api/properties';
import { Media, Property, User } from '@/types';
import {
  getFullAddress,
  getImageUrl,
  getSellerAvatar,
  getSellerName,
} from '@/utils';
import { renderLexicalNode } from '@/utils/lexical';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31104000) return `${Math.floor(diff / 2592000)} tháng trước`;

  return `${Math.floor(diff / 31104000)} năm trước`;
};

// ------------------------
// MAIN COMPONENT
// ------------------------
export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data } = useGetPropertyByIdQuery(id as string, { skip: !id });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { user: me, favorites, toggleFavorite } = useUser();
  const [createOrGetConversation, { isLoading, error }] =
    useCreateOrGetConversationMutation();

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;
  const handleFavorite = async (e: any) => {
    e.stopPropagation();

    try {
      const res = await toggleFavorite({ propertyId: property.id });

      if (res?.data?.isFavorite) {
        Toast.show({
          type: 'realEstateSuccess',
          text1: 'Đã thêm vào yêu thích ❤️',
          text2: property.title,
        });
      } else {
        Toast.show({
          type: 'realEstateSuccess',
          text1: 'Đã xóa khỏi yêu thích',
          text2: property.title,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'realEstateError',
        text1: 'Thao tác thất bại!',
        text2: 'Vui lòng thử lại.',
      });
    }
  };
  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy tin đăng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const property = data as Property;

  const favorite = favorites.includes(property.id); // Tích hợp sau

  const handleCall = () => {
    if (typeof property.seller !== 'string' && property.seller?.phone) {
      Linking.openURL(`tel:${property.seller.phone}`);
    }
  };
  const handleChat = async () => {
    const res = await createOrGetConversation({
      sender: me?.id!,
      recipient: (property.seller as User).id,
    }).unwrap();

    router.push(`/messages/${res.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: property.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Share2 size={20} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleFavorite}
              >
                <Heart
                  size={20}
                  color={favorite ? '#EF4444' : '#111'}
                  fill={favorite ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        {/* ------------------ IMAGES ------------------ */}
        <View style={styles.imageSection}>
          <FlatList
            data={property.images || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id || Math.random().toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.image}
                contentFit="cover"
                placeholderContentFit="cover"
                placeholder={
                  (item.image as Media)?.blurhash ||
                  'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
                }
              />
            )}
          />

          <View style={styles.imagePagination}>
            <Text style={styles.imagePaginationText}>
              {activeImageIndex + 1} / {property.images?.length || 1}
            </Text>
          </View>

          {property.is_vip && (
            <View style={styles.vipBadgeDetail}>
              <Text style={styles.vipBadgeText}>VIP</Text>
            </View>
          )}
        </View>

        {/* ------------------ MAIN INFO ------------------ */}
        <View style={styles.mainInfo}>
          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>{getFullAddress(property)}</Text>
          </View>
        </View>

        {/* ------------------ SELLER ------------------ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.sellerRow}>
            <Image
              source={{
                uri:
                  getSellerAvatar(property.seller) ||
                  'https://via.placeholder.com/80',
              }}
              style={styles.sellerAvatar}
              placeholder={
                (property?.images?.[0]?.image as Media)?.blurhash ||
                'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
              }
              placeholderContentFit="cover"
              contentFit="cover"
            />
            <Text style={styles.sellerName}>
              {getSellerName(property.seller)}
            </Text>
          </View>
        </View>

        {/* ------------------ DESCRIPTION ------------------ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {property.description
              ? renderLexicalNode(property.description.root)
              : 'Không có mô tả'}
          </Text>
        </View>

        {/* ------------------ EXTRA INFO ------------------ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thêm</Text>

          <View style={styles.infoRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Đăng {timeAgo(property.createdAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ------------------ FOOTER ------------------ */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Phone size={20} color="#FFF" />
          <Text style={styles.callButtonText}>Gọi điện</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageButton} onPress={handleChat}>
          <MessageCircle size={20} color="#EF4444" />
          <Text style={styles.messageButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ------------------------
// STYLES
// ------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#999', fontSize: 16 },

  headerActions: { flexDirection: 'row', gap: 8, marginRight: 16 },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageSection: { position: 'relative' },
  image: { width: width, height: 300 },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imagePaginationText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  vipBadgeDetail: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vipBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  content: { flex: 1 },
  mainInfo: { padding: 16, borderBottomWidth: 8, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  location: { marginLeft: 6, fontSize: 14, color: '#6B7280' },

  section: { padding: 16, borderBottomWidth: 8, borderBottomColor: '#F3F4F6' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEE',
  },
  sellerName: { fontSize: 16, fontWeight: '600', color: '#111' },

  description: { fontSize: 15, lineHeight: 22, color: '#333' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { marginLeft: 8, fontSize: 14, color: '#777' },

  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
