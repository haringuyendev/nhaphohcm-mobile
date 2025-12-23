// components/home/CategoriesSection.tsx
import { CategoryCard } from '@/components/CategoryCard';
import { PropertyType } from '@/types';
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useProperties } from '@/hooks/use-properties';


export const CategoriesSection = () => {
  const router = useRouter();
    const {
        propertyTypes,
      } = useProperties();
  const handleCategoryPress = (category: PropertyType) => {
    router.push({
      pathname: '/search',
      params: { propertyType: category.value },
    } as any);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {propertyTypes.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: { paddingHorizontal: 16 },
});