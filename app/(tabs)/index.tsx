import { Banner } from '@/components/Banner';
import { CategoryCard } from '@/components/CategoryCard';
import { Header } from '@/components/Headers/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { SkeletonCard } from '@/components/Skeleton/PropertySkeleton';
import { mockBanners } from '@/mocks/data';

import { useProperties } from '@/hooks/use-properties';
import { PropertyType } from '@/types';

import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  // const { favorites, toggleFavorite } = useUser(); // ⭐ Lấy danh sách ID yêu thích

  const {
    properties,
    vip_properties,
    handleLoadMore,
    handleRefetch,
    propertyTypes,
    propertiesLoading,
    propertyHasNextPage,
  } = useProperties();

  const normalProperties = properties.filter((p) => !p.is_vip);

  const renderSkeleton = () => (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(i, index) => `sk-${index}`}
      renderItem={() => <SkeletonCard />}
      contentContainerStyle={styles.listContent}
    />
  );

  const handleCategoryPress = (category: PropertyType) => {
    router.push({
      pathname: '/search',
      params: { propertyType: category.value },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      {/* MAIN LIST */}
      {propertiesLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={normalProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={false} // ⭐ Check yêu thích
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={propertiesLoading}
          onRefresh={handleRefetch}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View>
              {/* BANNER */}
              <Banner banners={mockBanners} />

              {/* CATEGORY */}
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

              {/* VIP */}
              {vip_properties.length > 0 && (
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
                    {vip_properties.slice(0, 5).map((property) => (
                      <View key={property.id} style={styles.vipCard}>
                        <PropertyCard property={property} isFavorite={false} />
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
            propertyHasNextPage ? (
              <ActivityIndicator
                size="small"
                color="#EF4444"
                style={{ paddingVertical: 20 }}
              />
            ) : null
          }
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
