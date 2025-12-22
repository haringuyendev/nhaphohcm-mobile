// components/home/skeletons/PropertyListSkeleton.tsx
import { SkeletonCard } from '@/components/Skeleton/PropertySkeleton';
import React from 'react';
import { FlatList, View } from 'react-native';

export const PropertyListSkeleton = () => {
  return (
    <FlatList
      data={[1, 2, 3, 4, 5, 6]}
      keyExtractor={(item) => `skeleton-${item}`}
      renderItem={() => <SkeletonCard />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
};