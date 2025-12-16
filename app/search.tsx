import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { SlidersHorizontal, X } from "lucide-react-native";
import FiltersPanel from "@/components/search/FiltersPanel";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetPropertiesQuery } from "@/store/api/properties";
import type { Property } from "@/types";
import { PropertyCard } from "@/components/PropertyCard";
import { SkeletonCard } from "@/components/Skeleton/PropertySkeleton";

export interface SearchFilters {
  province?: string;
  district?: string;
  ward?: string;
  type?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
}
// Build CMS query params
function buildSearchParams(keyword: string, filters: SearchFilters, page: number) {
  const params: Record<string, any> = { limit: 10, page };

  if (keyword?.trim().length > 0) params.search = keyword;
  if (filters.province) params.province = filters.province;
  if (filters.district) params.district = filters.district;
  if (filters.ward) params.ward = filters.ward;
  if (filters.type) params.type = filters.type;
  if (filters.price_min) params.price_min = filters.price_min;
  if (filters.price_max) params.price_max = filters.price_max;
  if (filters.area_min) params.area_min = filters.area_min;
  if (filters.area_max) params.area_max = filters.area_max;

  return params;
}

export default function SearchScreen() {
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({province:'79'});
  const [keyword, setKeyword] = useState("");

  // DEBOUNCE
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 350);

    return () => clearTimeout(timer);
  }, [keyword]);

  // PAGINATION STATE
  const [page, setPage] = useState(1);

  // ALWAYS rebuild params when page or filters change
  const params = useMemo(
    () => buildSearchParams(debouncedKeyword, filters, page),
    [debouncedKeyword, filters, page]
  );
  // FETCH DATA
  const { data, isLoading, isFetching } = useGetPropertiesQuery(params);

  // MERGE RESULTS (Infinite Scroll)
  const [mergedResults, setMergedResults] = useState<Property[]>([]);

  useEffect(() => {
    if (!data?.docs) return;

    if (page === 1) {
      // Load mới → reset danh sách
      setMergedResults(data.docs);
    } else {
      // Load tiếp → append
      setMergedResults((prev) => [...prev, ...data.docs]);
    }
  }, [data]);



  // APPLY FILTERS
  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // reset page
    setShowFilters(false);
  };

  // LOAD MORE WHEN BOTTOM REACHED
  const handleLoadMore = () => {
    if (isFetching) return;
    if (!data?.hasNextPage) return;

    setPage(data.nextPage);
  };

  // RESET SEARCH (clear button)
  const clearKeyword = () => {
    setKeyword("");
    setPage(1);
  };

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
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <Stack.Screen
        options={{
          headerTitle: "Tìm kiếm",
          headerTitleStyle: { fontWeight: "700" },
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
            <TouchableOpacity style={styles.clearButton} onPress={clearKeyword}>
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
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* RESULTS HEADER */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {isLoading && page === 1
            ? "Đang tải..."
            : `${mergedResults.length} kết quả`}
        </Text>
      </View>

      {/* LOADING FIRST TIME */}
      {isLoading && page === 1 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={mergedResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={() =>
            data?.hasNextPage ? (
              <ActivityIndicator size="small" color="#EF4444" style={{ padding: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  searchContainer: { flexDirection: "row", padding: 16, gap: 12 },
  searchInputWrapper: { flex: 1, position: "relative" },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearButton: { position: "absolute", right: 12, top: 12 },
  filterButton: {
    backgroundColor: "#FEE2E2",
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  listContent: { paddingBottom: 16 },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#9CA3AF" },
});
