import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Banner } from '@/components/Banner';
import { CategoryCard } from '@/components/CategoryCard';
import { PropertyCard } from '@/components/PropertyCard';
import { mockBanners, mockCategories } from '@/mocks/data';

export default function HomeScreen() {
  const router = useRouter();
  const { getVIPProperties, getActiveProperties } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const vipProperties = getVIPProperties;
  const allProperties = getActiveProperties;

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
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/search' as any)} style={styles.searchButton}>
              <Search size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }} 
      />
      
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
