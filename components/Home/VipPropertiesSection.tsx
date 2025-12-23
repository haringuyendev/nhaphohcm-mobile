// components/home/VipPropertiesSection.tsx
import { PropertyCard } from '@/components/PropertyCard';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { PropertyListSkeleton } from './PropertyListSkeleton';
import { useRouter } from 'expo-router';
import { useGetPropertiesQuery } from '@/store/api/properties';

export const VipPropertiesSection = () => {
    const router = useRouter();
    const {data:vipPropertiesData, isLoading:vipisLoading} = useGetPropertiesQuery({limit: 10, page: 1, is_vip: true});
    if (!vipPropertiesData || vipPropertiesData.length === 0) return null;
    if (vipisLoading) return <PropertyListSkeleton />
    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.title}>Tin VIP nổi bật</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll} onPress={() => router.push('/search?is_vip=true')}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {vipPropertiesData.docs.slice(0, 10).map((property:any) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: { marginBottom: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: { fontSize: 18, fontWeight: '700', color: '#111827' },
    seeAll: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
});