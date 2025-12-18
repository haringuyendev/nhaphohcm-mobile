import { useEffect, useState, useCallback, useMemo } from "react";
import { Property, PropertyType } from "@/types";
import { useGetPropertiesQuery } from "@/store/api/properties";
import { useGetPropertyTypesQuery } from "@/store/api/filter-api";

// =========================
// COMMON FILTERS
// =========================
export interface SearchFilters {
  province?: string;
  district?: string;
  ward?: string;
  type?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  is_vip?: boolean;
}

// =========================
// BUILD QUERY PARAMS
// =========================
function buildQueryParams(keyword: string, filters: SearchFilters, page: number) {
  const params: any = { limit: 10, page };

  if (keyword.trim().length > 0) params.search = keyword;

  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      params[key] = val;
    }
  });

  return params;
}

// =========================
// REMOVE DUPLICATE PROPERTIES
// =========================
function dedupe(list: Property[]) {
  const map = new Map<string, Property>();
  for (const item of list) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

// =========================
// MAIN HOOK
// =========================
export function useProperties() {
  // HOME + SEARCH SHARED STATE
  const [properties, setProperties] = useState<Property[]>([]);
  const [vip_properties, setVipProperties] = useState<Property[]>([]);

  // SEARCH
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ province: "79" });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  // PAGINATION
  const [page, setPage] = useState(1);

  // PARAMS cho Property thường
  const propertyParams = useMemo(
    () => buildQueryParams(debouncedKeyword, filters, page),
    [debouncedKeyword, filters, page]
  );

  // PARAMS VIP (fixed page = 1, không liên quan search)
  const vipParams = useMemo(
    () => ({ limit: 10, page: 1, is_vip: true }),
    []
  );

  // FETCH DATA
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    refetch: propertiesRefetch,
    isFetching: isPropertiesFetching,
  } = useGetPropertiesQuery(propertyParams);

  const {
    data: vipPropertiesData,
    isLoading: vipisLoading,
  } = useGetPropertiesQuery(vipParams);

  const { data: propertyTypes = [], refetch: refetchPropertyTypes } =
    useGetPropertyTypesQuery();

  // MERGE NORMAL PROPERTIES + DEDUPE
  useEffect(() => {
    if (!propertiesData?.docs) return;

    if (page === 1) {
      setProperties(dedupe(propertiesData.docs)); // reset + dedupe
    } else {
      setProperties((prev) =>
        dedupe([...prev, ...propertiesData.docs]) // merge + dedupe
      );
    }
  }, [propertiesData]);

  // VIP LIST
  useEffect(() => {
    if (vipPropertiesData?.docs) {
      setVipProperties(dedupe(vipPropertiesData.docs));
    }
  }, [vipPropertiesData]);

  // ACTIONS
  const handleRefetch = useCallback(() => {
    setPage(1);
    propertiesRefetch();
  }, [propertiesRefetch]);

  const handleLoadMore = useCallback(() => {
    if (isPropertiesFetching) return;
    if (!propertiesData?.hasNextPage) return;

    setPage((prev) => prev + 1);
  }, [isPropertiesFetching, propertiesData]);

  const applyFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ province: "79" });
    setKeyword("");
    setPage(1);
    handleRefetch();
  }, [handleRefetch]);

  return {
    // DATA
    properties,
    vip_properties,
    propertyTypes,

    // LOADING STATE
    propertiesLoading,
    vipisLoading,
    isFetching: isPropertiesFetching,

    // PAGINATION
    page,
    handleLoadMore,
    propertyHasNextPage: propertiesData?.hasNextPage ?? false,

    // REFRESH
    handleRefetch,
    refetchPropertyTypes,

    // SEARCH + FILTER
    keyword,
    setKeyword,
    filters,
    applyFilters,
    clearFilters,
  };
}
