import FiltersPanel from '@/components/search/FiltersPanel';
import { Stack } from 'expo-router';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PropertyCard } from '@/components/PropertyCard';
import { SkeletonCard } from '@/components/Skeleton/PropertySkeleton';
import { useProperties } from '@/hooks/use-properties';

export default function SearchScreen() {
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const {
    properties: results,
    keyword,
    page,
    setKeyword,
    filters,
    applyFilters,
    handleLoadMore,
    clearFilters,
    propertiesLoading,
    propertyHasNextPage,
  } = useProperties();

  // SKELETON
  const renderSkeleton = () => (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(i) => i.toString()}
      renderItem={() => <SkeletonCard />}
      contentContainerStyle={styles.listContent}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: 'Tìm kiếm',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo địa chỉ, tiêu đề..."
            value={keyword}
            onChangeText={setKeyword}
            placeholderTextColor="#9CA3AF"
          />

          {/* CLEAR BUTTON */}
          {keyword.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters((x) => !x)}
        >
          <SlidersHorizontal size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* FILTER PANEL */}
      {showFilters && (
        <FiltersPanel
          filters={filters}
          onApply={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* RESULTS HEADER */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {propertiesLoading && page === 1
            ? 'Đang tải...'
            : `${results.length} kết quả`}
        </Text>
      </View>

      {/* LOADING FIRST TIME */}
      {propertiesLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}/>
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={() =>
            propertyHasNextPage ? (
              <ActivityIndicator
                size="small"
                color="#EF4444"
                style={{ padding: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Không tìm thấy kết quả phù hợp
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  searchInputWrapper: { flex: 1, position: 'relative' },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearButton: { position: 'absolute', right: 12, top: 12 },
  filterButton: {
    backgroundColor: '#FEE2E2',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  listContent: { paddingBottom: 16 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});
