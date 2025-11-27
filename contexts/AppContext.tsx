import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProperties } from '@/mocks/data';
import { Property, SearchFilters } from '@/types/property';

const STORAGE_KEY = '@binhthanh_properties';
const FAVORITES_KEY = '@binhthanh_favorites';

export const [AppProvider, useApp] = createContextHook(() => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      
      if (stored) {
        setProperties(JSON.parse(stored));
      } else {
        setProperties(mockProperties);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProperties));
      }

      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProperties(mockProperties);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProperties = async (newProperties: Property[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProperties));
      setProperties(newProperties);
    } catch (error) {
      console.error('Error saving properties:', error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addProperty = useCallback(async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
    };

    const updated = [newProperty, ...properties];
    await saveProperties(updated);
    return newProperty;
  }, [properties]);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    await saveProperties(updated);
  }, [properties]);

  const deleteProperty = useCallback(async (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    await saveProperties(updated);
  }, [properties]);

  const pushProperty = useCallback(async (id: string) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, lastPushedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
    );
    await saveProperties(updated);
  }, [properties]);

  const upgradeToVIP = useCallback(async (id: string, days: number) => {
    const vipExpiryDate = new Date();
    vipExpiryDate.setDate(vipExpiryDate.getDate() + days);
    
    const updated = properties.map((p) =>
      p.id === id 
        ? { 
            ...p, 
            isVIP: true, 
            vipExpiryDate: vipExpiryDate.toISOString(),
            updatedAt: new Date().toISOString() 
          } 
        : p
    );
    await saveProperties(updated);
  }, [properties]);

  const toggleFavorite = useCallback(async (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    await saveFavorites(newFavorites);
  }, [favorites]);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  const getPropertyById = useCallback((id: string) => {
    return properties.find((p) => p.id === id);
  }, [properties]);

  const getVIPProperties = useMemo(() => {
    return properties
      .filter((p) => p.isVIP && p.status === 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [properties]);

  const getActiveProperties = useMemo(() => {
    return properties
      .filter((p) => p.status === 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [properties]);

  const getMyProperties = useCallback((userId: string) => {
    return properties.filter((p) => p.userId === userId);
  }, [properties]);

  const searchProperties = useCallback((filters: SearchFilters) => {
    return properties.filter((p) => {
      if (p.status !== 'active') return false;
      
      if (filters.transactionType && p.transactionType !== filters.transactionType) return false;
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (filters.province && p.location.province !== filters.province) return false;
      if (filters.district && p.location.district !== filters.district) return false;
      if (filters.ward && p.location.ward !== filters.ward) return false;
      
      if (filters.priceMin !== undefined) {
        const priceInMillion = p.priceUnit === 'billion' ? p.price * 1000 : p.price;
        if (priceInMillion < filters.priceMin) return false;
      }
      
      if (filters.priceMax !== undefined) {
        const priceInMillion = p.priceUnit === 'billion' ? p.price * 1000 : p.price;
        if (priceInMillion > filters.priceMax) return false;
      }
      
      if (filters.areaMin !== undefined && p.area < filters.areaMin) return false;
      if (filters.areaMax !== undefined && p.area > filters.areaMax) return false;
      if (filters.bedrooms !== undefined && p.bedrooms && p.bedrooms < filters.bedrooms) return false;
      if (filters.direction && p.direction !== filters.direction) return false;
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        return (
          p.title.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.location.fullAddress.toLowerCase().includes(keyword)
        );
      }
      
      return true;
    }).sort((a, b) => {
      if (a.isVIP && !b.isVIP) return -1;
      if (!a.isVIP && b.isVIP) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [properties]);

  const getFavoriteProperties = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  return {
    properties,
    favorites,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    pushProperty,
    upgradeToVIP,
    toggleFavorite,
    isFavorite,
    getPropertyById,
    getVIPProperties,
    getActiveProperties,
    getMyProperties,
    searchProperties,
    getFavoriteProperties,
  };
});
