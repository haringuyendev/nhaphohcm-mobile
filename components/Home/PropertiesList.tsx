// components/home/PropertiesList.tsx
import { PropertyCard } from '@/components/PropertyCard';
import React from 'react';
import { ActivityIndicator, FlatList, View, StyleSheet } from 'react-native';
import { useProperties } from '@/hooks/use-properties';
import { PropertyListSkeleton } from './PropertyListSkeleton';
interface PropertiesListProps {
    listHeaderComponent?: React.JSX.Element;
}
export const PropertiesList = ({ listHeaderComponent }: PropertiesListProps) => {
    const {
        properties,
        handleLoadMore,
        handleRefetch,
        propertiesLoading,
        propertyHasNextPage,
    } = useProperties();
    if (propertiesLoading) return <PropertyListSkeleton />;
    if (properties.length === 0) return null;
    return (
        <FlatList
            data={properties}
            keyExtractor={(item, index) => item.id ? item.id : `property-${index}`}
            renderItem={({ item }) => <PropertyCard property={item} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshing={propertiesLoading}
            onRefresh={handleRefetch}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={listHeaderComponent}
            ListFooterComponent={() =>
                propertyHasNextPage ? (
                    <ActivityIndicator size="small" color="#EF4444" style={styles.loader} />
                ) : null
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
    );
};

const styles = StyleSheet.create({
    listContent: { paddingBottom: 16 },
    loader: { paddingVertical: 20 },
});