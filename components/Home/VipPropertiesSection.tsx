// components/home/VipPropertiesSection.tsx
import { PropertyCard } from '@/components/PropertyCard';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useProperties } from '@/hooks/use-properties';
import { PropertyListSkeleton } from './PropertyListSkeleton';

export const VipPropertiesSection = () => {
    const {
        vip_properties,
        vipisLoading
    } = useProperties();
    if (!vip_properties || vip_properties.length === 0) return null;
    if (vipisLoading) return <PropertyListSkeleton />
    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.title}>Tin VIP nổi bật</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {vip_properties.slice(0, 10).map((property) => (
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