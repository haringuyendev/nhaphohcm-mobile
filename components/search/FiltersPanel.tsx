import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { X } from "lucide-react-native";

import {
  useGetDistrictsQuery,
  useGetWardsQuery,
  useGetPropertyTypesQuery,
} from "@/store/api/filter-api";
import { SearchFilters } from "@/hooks/use-properties";

export default function FiltersPanel({
  filters,
  onApply,
  onClose,
}: {
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // LOAD PROVINCES
  // const { data: provinces = [], isLoading: loadingProvinces } = useGetProvincesQuery();

  // LOAD DISTRICTS
  const { data: districts = [], isLoading: loadingDistricts } = useGetDistrictsQuery(
    { provinceCode: localFilters.province },
    { skip: !localFilters.province }
  );

  // LOAD WARDS
  const { data: wards = [], isLoading: loadingWards } = useGetWardsQuery(
    { districtCode: localFilters.district },
    { skip: !localFilters.district }
  );

  // PROPERTY TYPES
  const { data: propertyTypes = [], isLoading: loadingTypes } = useGetPropertyTypesQuery();
  useEffect(() => {
    if (!localFilters.district) {
      setLocalFilters((prev: SearchFilters) => ({ ...prev, ward: undefined }));
    }
  }, [localFilters.district]);

  return (
    <View style={styles.filtersPanel}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Bộ lọc</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterContent}>

        {/* PROPERTY TYPES */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Loại bất động sản</Text>

          {loadingTypes ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {propertyTypes.map((pt) => (
                  <TouchableOpacity
                    key={pt.id}
                    style={[
                      styles.filterChip,
                      localFilters.type === pt.value && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, type: pt.value as string })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.type === pt.value && styles.filterChipTextActive,
                      ]}
                    >
                      {pt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* DISTRICTS */}
        {localFilters.province && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Quận/Huyện</Text>

            {loadingDistricts ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                  {districts.map((d) => (
                    <TouchableOpacity
                      key={d.code}
                      style={[
                        styles.filterChip,
                        localFilters.district === d.code.toString() && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          district: d.code.toString(),
                          ward: undefined,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          localFilters.district === d.code.toString() && styles.filterChipTextActive,
                        ]}
                      >
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* WARDS */}
        {localFilters.district && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Phường/Xã</Text>

            {loadingWards ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                  {wards.map((w) => (
                    <TouchableOpacity
                      key={w.code}
                      style={[
                        styles.filterChip,
                        localFilters.ward === w.code.toString() && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          ward: w.code.toString(),
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          localFilters.ward === w.code.toString() && styles.filterChipTextActive,
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.clearButton} onPress={() => setLocalFilters({province:'79'})}>
          <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={() => onApply(localFilters)}>
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//
// STYLES ( giữ nguyên toàn bộ )
//
const styles = StyleSheet.create({
  filtersPanel: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterContent: { maxHeight: 300 },
  filterGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  filterChipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
