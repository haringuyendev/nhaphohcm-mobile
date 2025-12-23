// app/(tabs)/home.tsx hoặc app/index.tsx
import { Header } from '@/components/Headers/Header';
import { BannerSection } from '@/components/Home/BannerSection';
import { CategoriesSection } from '@/components/Home/CategoriesSection';
import { PropertiesList } from '@/components/Home/PropertiesList';
import { VipPropertiesSection } from '@/components/Home/VipPropertiesSection';

import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const ListHeader = () => (
    <View>
      <BannerSection />
      <CategoriesSection />
      <VipPropertiesSection />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Tin đăng mới nhất
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <PropertiesList listHeaderComponent={<ListHeader />} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { paddingBottom: 16 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  categoriesContainer: { paddingHorizontal: 16 },
  vipContainer: { paddingHorizontal: 0 },
  vipCard: { marginLeft: 0 },
});