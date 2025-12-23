// components/community/DiscoverTab.tsx
import { CommunityListItem } from '@/components/community/CommunityListItem';
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useGetRecommendedCommunitiesQuery } from '@/store/api/community';
import { FollowedGroupsSkeleton } from './CommunitySkeleton';

export const DiscoverTab = () => {
    const { data: recommended, isLoading: recLoading, refetch: recRefetch } = useGetRecommendedCommunitiesQuery({ limit: 10 });
    if (recLoading) {
        return (
            <FlatList
                data={[1, 2, 3]}
                keyExtractor={(item) => item.toString()}
                renderItem={() => <FollowedGroupsSkeleton />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />
        );
    }
    return (
        <FlatList
            data={recommended?.docs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => (
                <CommunityListItem community={item} showJoinButton />
            )}
            refreshing={recLoading}
            onRefresh={recRefetch}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>Chưa có cộng đồng gợi ý</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    content: { padding: 16 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { fontSize: 16, color: '#9CA3AF' },
});