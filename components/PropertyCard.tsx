import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin } from 'lucide-react-native';
import { District, Media, Property, Province, User } from '@/types';
import { Image } from 'expo-image';
import { useUser } from '@/hooks/use-user';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
}

export function PropertyCard({ property, isFavorite }: PropertyCardProps) {
  const router = useRouter();
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
  const { toggleFavorite } = useUser()

  const pricePerM2 = (() => {
    if (!property.price || !property.area) return null;
    return Math.round((property.price / property.area) / 1_000_000);
  })();

  const resolveImageUrl = (relative?: string | null | undefined) => {
    if (!relative) return null;
    if (relative.startsWith("http")) return relative;
    return `${process.env.EXPO_PUBLIC_API_URL}${relative}`;
  };

  const handlePress = () => router.push(`/property/${property.id}` as any);

  const handleFavorite = async (e: any) => {
    e.stopPropagation();

    try {
      const res = await toggleFavorite({ propertyId: property.id });

      if (res?.data?.isFavorite) {
        Toast.show({
          type: "realEstateSuccess",
          text1: "Đã thêm vào yêu thích ❤️",
          text2: property.title
        });
      } else {
        Toast.show({
          type: "realEstateSuccess",
          text1: "Đã xóa khỏi yêu thích",
          text2: property.title
        });
      }
    } catch (err) {
      Toast.show({
        type: "realEstateError",
        text1: "Thao tác thất bại!",
        text2: "Vui lòng thử lại.",
      });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              resolveImageUrl((property?.images?.[0]?.image as Media)?.url) ||
              "https://via.placeholder.com/400x300?text=No+Image",
          }}
          placeholder={((property?.images?.[0]?.image as Media)?.blurhash) || "LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
          style={styles.image}
          contentFit="cover"
          placeholderContentFit="cover"
        />

        {property.is_vip && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}

        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
          <Heart size={20} color={isFavorite ? '#EF4444' : '#FFF'} fill={isFavorite ? '#EF4444' : 'transparent'} />
        </TouchableOpacity>
      </View>

      {/* ------- CONTENT -------- */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>

        {/* PRICE */}
        {pricePerM2 !== null && (
          <Text style={styles.pricePerM2}>~{pricePerM2} triệu/m²</Text>
        )}

        {/* DETAILS */}
        <View style={styles.detailsRow}>
          {property.area && <Text style={styles.detail}>{property.area} m²</Text>}

          {Number(property.bedrooms) > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.detail}>{property.bedrooms} PN</Text>
            </>
          )}

          {Number(property.bathrooms) > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.detail}>{property.bathrooms} WC</Text>
            </>
          )}
        </View>

        {/* LOCATION */}
        <View style={styles.locationRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {`${(property.district as District)?.name ?? ""}, ${(property.province as Province)?.name ?? ""}`}
          </Text>

        </View>

        {/* ------- FOOTER: TIME + SELLER ------- */}
        <View style={styles.footerRow}>
          {property?.seller && (
            <View style={styles.footerSeller}>
              <Image
                source={{
                  uri:
                    resolveImageUrl(((property?.seller as User)?.avatar as Media)?.url) ??
                    "https://via.placeholder.com/80x80?text=User",
                }}
                style={styles.sellerAvatar}
                placeholder={((property?.seller as User)?.avatar as Media)?.blurhash || "LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
                contentFit="cover"
              />
              <Text style={styles.sellerName} numberOfLines={1}>
                {(property?.seller as User)?.name ?? "Người đăng"}
              </Text>
            </View>
          )}
          <Text style={styles.postedTime}>{timeAgo(property.updatedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },

  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  vipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  vipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginRight: 8,
  },

  pricePerM2: {
    fontSize: 13,
    color: '#6B7280',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  detail: {
    fontSize: 14,
    color: '#4B5563',
  },

  separator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  location: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },

  // ------- FOOTER + SELLER -------
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  postedTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  footerSeller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '60%',
  },

  sellerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
  },

  sellerName: {
    fontSize: 13,
    color: '#374151',
    flexShrink: 1,
  },
});

export default PropertyCard;
