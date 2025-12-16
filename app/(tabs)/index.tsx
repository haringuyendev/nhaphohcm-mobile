import { Banner } from '@/components/Banner';
import { CategoryCard } from '@/components/CategoryCard';
import { Header } from '@/components/Headers/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { SkeletonCard } from "@/components/Skeleton/PropertySkeleton";
import { mockBanners } from '@/mocks/data';

import { useGetPropertiesQuery } from '@/store/api/properties';
import { useGetPropertyTypesQuery } from '@/store/api/filter-api';
import { Property, PropertyType } from '@/types';

import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  // PAGE STATE for infinite scroll
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useGetPropertiesQuery({
    page,
    limit: 10,
  });

  const { data: propertyTypes = [] as PropertyType[], refetch: refetchPropertyTypes } = useGetPropertyTypesQuery();

  const [mergedProperties, setMergedProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Merge data for infinite scroll
  useEffect(() => {
    if (!data?.docs) return;

    if (page === 1) {
      setMergedProperties(data.docs);
    } else {
      setMergedProperties((prev) => [...prev, ...data.docs]);
    }
  }, [data]);

  // VIP + Normal properties
  const vipProperties = mergedProperties.filter((p) => p.is_vip);
  const allProperties = mergedProperties.filter((p) => !p.is_vip);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    await refetchPropertyTypes();
    setRefreshing(false);
  };

  // Load more when bottom
  const handleLoadMore = () => {
    if (isFetching) return;
    if (!data?.hasNextPage) return;

    setPage(data.nextPage);
  };

  // Press category → go to search page
  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/search',
      params: {
        propertyType: category.value,
      },
    } as any);
  };

  // Skeleton list
  const renderSkeleton = () => (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(i) => `sk-${i}`}
      renderItem={() => <SkeletonCard />}
      contentContainerStyle={styles.listContent}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      {/* MAIN LIST */}
      {isLoading && page === 1 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={allProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PropertyCard property={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={() => (
            <View>
              <Banner banners={mockBanners} />

              {/* CATEGORY SECTION */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {propertyTypes.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onPress={() => handleCategoryPress(category)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* VIP SECTION */}
              {vipProperties.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Tin VIP nổi bật</Text>
                    <TouchableOpacity>
                      <Text style={styles.seeAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.vipContainer}
                  >
                    {vipProperties.slice(0, 5).map((property) => (
                      <View key={property.id} style={styles.vipCard}>
                        <PropertyCard property={property} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tin đăng mới nhất</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() =>
            data?.hasNextPage ? (
              <ActivityIndicator size="small" color="#EF4444" style={{ paddingVertical: 20 }} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  categoriesContainer: { paddingHorizontal: 16 },
  vipContainer: { paddingHorizontal: 0 },
  vipCard: { marginLeft: 0 },
});
