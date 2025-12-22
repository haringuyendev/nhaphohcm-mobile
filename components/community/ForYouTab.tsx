// components/community/ForYouTab.tsx
import { PostCard } from '@/components/PostCard';
import { FollowedGroupsSection } from '@/components/community/FollowedGroupsSection';
import { useGetJoinedCommunitiesQuery } from '@/store/api/community';
import { useGetTrendingQuery } from '@/store/api/socialPosts';
import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { PostCardSkeleton } from './PostSkeleton';
import { FollowedGroupsSkeleton } from './CommunitySkeleton';

export const ForYouTab = () => {
  const { data: joined, isLoading: joinedLoading, refetch: joinedRefetch } = useGetJoinedCommunitiesQuery({ limit: 5 });
  const { data: trending, isLoading: trendingLoading, refetch: trendingRefetch } = useGetTrendingQuery({ limit: 10 });
  const onRefresh = useCallback(() => {
    trendingRefetch();
    joinedRefetch();
  }, [joinedRefetch, trendingRefetch]);

  if (trendingLoading || joinedLoading) {
    return (
      <FlatList
        data={[1, 2, 3]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => <PostCardSkeleton />}
        ListHeaderComponent={() => <FollowedGroupsSkeleton />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    );
  }
  return (
    <FlatList
      data={trending?.docs || []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} community={item.community} />}
      refreshing={trendingLoading || joinedLoading}
      onRefresh={onRefresh}
      ListHeaderComponent={() => (
        <FollowedGroupsSection
          title="Cộng đồng đang hot"
          groups={joined?.docs || []}
        />
      )}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});