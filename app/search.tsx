import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useApp } from '@/hooks/use-app';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchFilters } from '@/types/property';
import FiltersPanel from '@/components/search/FiltersPanel';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { searchProperties } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    return searchProperties({ ...filters, keyword });
  }, [filters, keyword, searchProperties]);

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen 
        options={{
          headerTitle: 'Tìm kiếm',
          headerTitleStyle: { fontWeight: '700' as const },
        }} 
      />
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo địa chỉ, tiêu đề..."
          value={keyword}
          onChangeText={setKeyword}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <FiltersPanel filters={filters} onApply={handleApplyFilters} onClose={() => setShowFilters(false)} />
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>{results.length} kết quả</Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
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
  filterButton: {
    backgroundColor: '#FEE2E2',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  filterContent: {
    maxHeight: 300,
  },
  filterGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
