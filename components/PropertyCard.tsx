import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin } from 'lucide-react-native';
import { Property } from '@/types/property';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useApp();

  const formatPrice = (price: number, unit: string) => {
    if (unit === 'billion') {
      return `${price} tỷ`;
    }
    return `${price} triệu`;
  };

  const handlePress = () => {
    router.push(`/property/${property.id}` as any);
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const favorite = isFavorite(property.id);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: property.images[0]?.uri }} 
          style={styles.image}
          resizeMode="cover"
        />
        {property.isVIP && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          <Heart 
            size={20} 
            color={favorite ? '#EF4444' : '#FFFFFF'} 
            fill={favorite ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPrice(property.price, property.priceUnit)}
          </Text>
          {property.pricePerM2 && (
            <Text style={styles.pricePerM2}>
              ~{property.pricePerM2} tr/m²
            </Text>
          )}
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.detail}>{property.area} m²</Text>
          {property.bedrooms && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.detail}>{property.bedrooms} PN</Text>
            </>
          )}
          {property.bathrooms && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.detail}>{property.bathrooms} WC</Text>
            </>
          )}
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {property.location.district}, {property.location.province}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.postedTime}>
            {new Date(property.updatedAt).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.viewCount}>{property.viewCount} lượt xem</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    fontWeight: '700' as const,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  postedTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
