// components/community/ManageTab.tsx
import { CommunityListItem } from '@/components/community/CommunityListItem';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useGetManagedCommunitiesQuery } from '@/store/api/community';
import { PostCardSkeleton } from './PostSkeleton';

export const ManageTab = () => {
    const router = useRouter();
    const { data: managed, isLoading: managedLoading, refetch: managedRefetch } = useGetManagedCommunitiesQuery({ limit: 20 });
    if (managedLoading) {
        return (
            <FlatList
                data={[1, 2, 3]}
                keyExtractor={(item) => item.toString()}
                renderItem={() => <PostCardSkeleton />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />
        )
    }
    return (
        <FlatList
            data={managed?.docs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
                <CommunityListItem
                    community={item}
                    onPress={() => router.push(`/community/${item.id}`)}
                />
            )}
            refreshing={managedLoading}
            onRefresh={managedRefetch}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>Bạn chưa quản lý cộng đồng nào</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { fontSize: 16, color: '#9CA3AF' },
});