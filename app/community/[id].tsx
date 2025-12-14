import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Users, UserPlus, UserMinus } from 'lucide-react-native';
import { useApp } from '@/hooks/use-app';
import { PostCard } from '@/components/PostCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCommunityById, getPostsByCommunity, joinCommunity, leaveCommunity } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const community = getCommunityById(id);
  const posts = getPostsByCommunity(id);

  if (!community) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy cộng đồng</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleJoinToggle = async () => {
    if (community.isJoined) {
      Alert.alert(
        'Rời khỏi cộng đồng',
        `Bạn có chắc muốn rời khỏi "${community.name}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Rời khỏi',
            style: 'destructive',
            onPress: async () => {
              await leaveCommunity(id);
              Alert.alert('Thành công', 'Đã rời khỏi cộng đồng');
            },
          },
        ]
      );
    } else {
      await joinCommunity(id);
      Alert.alert('Thành công', 'Đã tham gia cộng đồng');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: community.name,
          headerTransparent: false,
        }}
      />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.coverContainer}>
              <Image source={{ uri: community.coverImage }} style={styles.coverImage} />
              <View style={styles.coverOverlay} />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <View style={styles.titleContent}>
                  <Text style={styles.communityName}>{community.name}</Text>
                  {community.isOwned && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerBadgeText}>Quản lý</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.description}>{community.description}</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Users size={18} color="#6B7280" />
                  <Text style={styles.statText}>
                    {community.memberCount.toLocaleString('vi-VN')} thành viên
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{community.category}</Text>
                </View>
              </View>

              {!community.isOwned && (
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    community.isJoined && styles.joinedButton,
                  ]}
                  onPress={handleJoinToggle}
                  activeOpacity={0.8}
                >
                  {community.isJoined ? (
                    <>
                      <UserMinus size={20} color="#FFFFFF" />
                      <Text style={styles.joinButtonText}>Rời khỏi</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} color="#FFFFFF" />
                      <Text style={styles.joinButtonText}>Tham gia</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.postsHeader}>
              <Text style={styles.postsTitle}>Bài viết</Text>
              <Text style={styles.postsCount}>
                {posts.length} bài viết
              </Text>
            </View>
          </View>
        )}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communityName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  ownerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#4B5563',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  joinedButton: {
    backgroundColor: '#6B7280',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  postsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
