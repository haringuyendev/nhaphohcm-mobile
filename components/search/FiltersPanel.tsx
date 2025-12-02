import { provinces, districtsByProvince } from "@/mocks/data";
import { SearchFilters } from "@/types/property";
import { X } from "lucide-react-native";
import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";

export default function FiltersPanel({ filters, onApply, onClose }: { 
  filters: SearchFilters; 
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  return (
    <View style={styles.filtersPanel}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Bộ lọc</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterContent}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Loại giao dịch</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                localFilters.transactionType === 'sale' && styles.filterChipActive,
              ]}
              onPress={() => setLocalFilters({ ...localFilters, transactionType: 'sale' })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  localFilters.transactionType === 'sale' && styles.filterChipTextActive,
                ]}
              >
                Bán
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                localFilters.transactionType === 'rent' && styles.filterChipActive,
              ]}
              onPress={() => setLocalFilters({ ...localFilters, transactionType: 'rent' })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  localFilters.transactionType === 'rent' && styles.filterChipTextActive,
                ]}
              >
                Cho thuê
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Tỉnh/Thành phố</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province}
                  style={[
                    styles.filterChip,
                    localFilters.province === province && styles.filterChipActive,
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, province, district: undefined })}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      localFilters.province === province && styles.filterChipTextActive,
                    ]}
                  >
                    {province}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {localFilters.province && districtsByProvince[localFilters.province] && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Quận/Huyện</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {districtsByProvince[localFilters.province].map((district) => (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.filterChip,
                      localFilters.district === district && styles.filterChipActive,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, district })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.district === district && styles.filterChipTextActive,
                      ]}
                    >
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={styles.filterActions}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => setLocalFilters({})}
        >
          <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.applyButton} 
          onPress={() => onApply(localFilters)}
        >
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
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
  filterChipActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#374151',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
