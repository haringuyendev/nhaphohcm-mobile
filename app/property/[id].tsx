import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Dimensions, FlatList, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Heart, Phone, MessageCircle, MapPin, Maximize, Bed, Bath, Compass, Calendar, Eye, Share2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PropertyCard } from '@/components/PropertyCard';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams();
    const { getPropertyById, toggleFavorite, isFavorite, getActiveProperties } = useApp();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveImageIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const property = getPropertyById(id as string);
    const favorite = isFavorite(id as string);
    const relatedProperties = getActiveProperties.filter((p) =>
        p.id !== id &&
        p.location.province === property?.location.province &&
        p.transactionType === property?.transactionType
    ).slice(0, 5);

    if (!property) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không tìm thấy tin đăng</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formatPrice = (price: number, unit: string) => {
        if (unit === 'billion') {
            return `${price} tỷ`;
        }
        return `${price} triệu`;
    };

    const handleCall = () => {
        Linking.openURL(`tel:${property.contactPhone}`);
    };

    const handleMessage = () => {
        Linking.openURL(`sms:${property.contactPhone}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerTransparent: true,
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerButton}>
                                <Share2 size={20} color="#111827" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => toggleFavorite(property.id)}
                            >
                                <Heart
                                    size={20}
                                    color={favorite ? '#EF4444' : '#111827'}
                                    fill={favorite ? '#EF4444' : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <ScrollView style={styles.content}>
                <View style={styles.imageSection}>
                    <FlatList
                        data={property.images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
                        )}
                    />
                    <View style={styles.imagePagination}>
                        <Text style={styles.imagePaginationText}>
                            {activeImageIndex + 1} / {property.images.length}
                        </Text>
                    </View>
                    {property.isVIP && (
                        <View style={styles.vipBadgeDetail}>
                            <Text style={styles.vipBadgeText}>VIP</Text>
                        </View>
                    )}
                </View>

                <View style={styles.mainInfo}>
                    <Text style={styles.title}>{property.title}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(property.price, property.priceUnit)}</Text>
                        {property.pricePerM2 && (
                            <Text style={styles.pricePerM2}>~{property.pricePerM2} tr/m²</Text>
                        )}
                    </View>

                    <View style={styles.locationContainer}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.location}>{property.location.fullAddress}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đặc điểm bất động sản</Text>
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureItem}>
                            <Maximize size={20} color="#EF4444" />
                            <Text style={styles.featureValue}>{property.area} m²</Text>
                            <Text style={styles.featureLabel}>Diện tích</Text>
                        </View>
                        {property.bedrooms && (
                            <View style={styles.featureItem}>
                                <Bed size={20} color="#EF4444" />
                                <Text style={styles.featureValue}>{property.bedrooms}</Text>
                                <Text style={styles.featureLabel}>Phòng ngủ</Text>
                            </View>
                        )}
                        {property.bathrooms && (
                            <View style={styles.featureItem}>
                                <Bath size={20} color="#EF4444" />
                                <Text style={styles.featureValue}>{property.bathrooms}</Text>
                                <Text style={styles.featureLabel}>Phòng tắm</Text>
                            </View>
                        )}
                        {property.direction && (
                            <View style={styles.featureItem}>
                                <Compass size={20} color="#EF4444" />
                                <Text style={styles.featureValue}>{property.direction}</Text>
                                <Text style={styles.featureLabel}>Hướng</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin mô tả</Text>
                    <Text style={styles.description}>{property.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                    <View style={styles.contactInfo}>
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>Người đăng:</Text>
                            <Text style={styles.contactValue}>{property.contactName}</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>Điện thoại:</Text>
                            <Text style={[styles.contactValue, styles.contactPhone]}>{property.contactPhone}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
                    <View style={styles.infoRow}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.infoText}>
                            Ngày đăng: {new Date(property.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Eye size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{property.viewCount} lượt xem</Text>
                    </View>
                </View>

                {relatedProperties.length > 0 && (
                    <View>
                        <Text style={{
                            padding: 16, fontSize: 16,
                            fontWeight: '700' as const,
                            color: '#111827',
                            marginBottom: 16,
                        }}>Tin đăng liên quan</Text>
                        <FlatList
                            data={relatedProperties}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View key={item.id} style={styles.relatedItem}>
                                    <PropertyCard property={item} />
                                </View>
                            )}
                            contentContainerStyle={styles.relatedList}
                        />
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                    <Phone size={20} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Gọi điện</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                    <MessageCircle size={20} color="#EF4444" />
                    <Text style={styles.messageButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
        marginRight: 16,
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    imageSection: {
        position: 'relative',
    },
    image: {
        width: width,
        height: 300,
    },
    imagePagination: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    imagePaginationText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600' as const,
    },
    vipBadgeDetail: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    vipBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700' as const,
    },
    mainInfo: {
        padding: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: '#111827',
        marginBottom: 12,
        lineHeight: 26,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: '#EF4444',
        marginRight: 12,
    },
    pricePerM2: {
        fontSize: 14,
        color: '#6B7280',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
        flex: 1,
    },
    section: {
        padding: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#F3F4F6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: '#111827',
        marginBottom: 16,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        width: '48%',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    featureValue: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: '#111827',
        marginTop: 8,
        marginBottom: 4,
    },
    featureLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    description: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
    },
    contactInfo: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
    },
    contactRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    contactLabel: {
        fontSize: 14,
        color: '#6B7280',
        width: 100,
    },
    contactValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500' as const,
        flex: 1,
    },
    contactPhone: {
        color: '#EF4444',
        fontWeight: '600' as const,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    relatedList: {
        paddingHorizontal: 0
    },
    relatedItem: {
        width: width - 24,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
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
    callButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600' as const,
    },
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
    messageButtonText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '600' as const,
    },
});
