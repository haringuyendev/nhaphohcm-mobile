import { Banner } from '@/components/Banner';
import { CategoryCard } from '@/components/CategoryCard';
import { Header } from '@/components/Headers/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { mockBanners, mockCategories } from '@/mocks/data';
import { useGetPropertiesQuery } from '@/store/services/properties';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { data, error, isLoading } = useGetPropertiesQuery(null);

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const allProperties = data?.docs || [];
  const vipProperties = allProperties.filter((property) => property.is_vip);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/search',
      params: {
        transactionType: category.transactionType,
        propertyType: category.propertyType || '',
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Header />
      <FlatList
        data={allProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={() => (
          <View>
            <Banner banners={mockBanners} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {mockCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => handleCategoryPress(category)}
                  />
                ))}
              </ScrollView>
            </View>

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
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchButton: {
    marginRight: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  vipContainer: {
    paddingHorizontal: 0,
  },
  vipCard: {
    marginLeft: 0,
  },
});
