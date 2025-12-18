// app/(tabs)/community.tsx  (hoặc đường dẫn bạn đang dùng)
import { PostCard } from '@/components/PostCard';
import { useApp } from '@/hooks/use-app';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import {
  Compass,
  Home,
  Plus,
  Search,
  Settings,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type TabType = 'for-you' | 'your-groups' | 'discover' | 'manage';

export default function CommunityScreen() {
  const router = useRouter();
  const {
    getRecommendCommunities,
    joinCommunity,
    getJoinedCommunities,
    getOwnedCommunities,
    leaveCommunity,
    getPostWithCommunity,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('for-you');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  // Header cố định
  const CustomHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Cộng đồng</Text>
      <View style={styles.headerActions}>
        {searchVisible ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm cộng đồng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery('');
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setSearchVisible(true)}
            >
              <Search size={22} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setCreateModalVisible(true)}
            >
              <Plus size={26} color="#1F2937" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Tab bar
  const Tabs = () => (
    <View style={{ height: 60 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          paddingHorizontal: 16, // Khoảng cách 2 bên
          gap: 20, // Khoảng cách giữa các tab
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'for-you' && styles.activeTab]}
          onPress={() => setActiveTab('for-you')}
        >
          <Home
            size={20}
            color={activeTab === 'for-you' ? '#EF4444' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'for-you' && styles.activeTabText,
            ]}
          >
            Dành cho bạn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'your-groups' && styles.activeTab]}
          onPress={() => setActiveTab('your-groups')}
        >
          <UserCheck
            size={20}
            color={activeTab === 'your-groups' ? '#EF4444' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'your-groups' && styles.activeTabText,
            ]}
          >
            Nhóm của bạn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Compass
            size={20}
            color={activeTab === 'discover' ? '#EF4444' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'discover' && styles.activeTabText,
            ]}
          >
            Khám phá
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Settings
            size={20}
            color={activeTab === 'manage' ? '#EF4444' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'manage' && styles.activeTabText,
            ]}
          >
            Quản lý
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Nội dung từng tab
  const ForYouTab = () => {
    const topGroups = getJoinedCommunities.slice(0, 5);

    return (
      <FlatList
        data={getPostWithCommunity}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} community={item.community} />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.forYouHeader}>
            <Text style={styles.sectionTitle}>Nhóm bạn tham gia</Text>

            {/* Hiển thị 5 nhóm */}
            {topGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.followedGroupRow}
                onPress={() => router.push(`/community/${group.id}`)}
              >
                {/* <Image
                  source={{
                    uri:
                      resolveImageUrl(
                        ((group.cover?.avatar as Media)?.url
                      ) ?? 'https://via.placeholder.com/80x80?text=User',
                  }}
                  style={styles.followedGroupAvatar}
                  contentFit="cover"
                  placeholderContentFit="cover"
                /> */}

                <View style={styles.followedGroupInfo}>
                  <Text style={styles.followedGroupName}>{group.name}</Text>
                  <Text style={styles.followedGroupMembers}>
                    {group.memberCount.toLocaleString('vi-VN')} thành viên
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Separator */}
            <View style={{ height: 16 }} />
          </View>
        )}
      />
    );
  };

  const YourGroupsTab = () => (
    <FlatList
      data={getJoinedCommunities}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.groupRow}
          onPress={() => router.push(`/community/${item.id}`)}
        >
          {/* Ảnh bên trái */}
          <Image source={{ uri: item.coverImage }} style={styles.groupAvatar} />

          {/* Text bên phải */}
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>{item.name}</Text>
            <Text style={styles.groupMembers}>
              {item.memberCount.toLocaleString('vi-VN')} thành viên
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const DiscoverTab = () => (
    <FlatList
      data={getRecommendCommunities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.discoverCard}>
          <Image
            source={{ uri: item.coverImage }}
            style={styles.discoverImage}
          />
          <View style={styles.discoverInfo}>
            <Text style={styles.discoverName}>{item.name}</Text>
            <Text style={styles.discoverCategory}>{item.category}</Text>
            <View style={styles.discoverFooter}>
              <View style={styles.memberRow}>
                <Users size={16} color="#6B7280" />
                <Text style={styles.memberCount}>
                  {item.memberCount.toLocaleString('vi-VN')} thành viên
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  item.isJoined && styles.joinedButton,
                ]}
                onPress={() =>
                  item.isJoined
                    ? leaveCommunity(item.id)
                    : joinCommunity(item.id)
                }
              >
                {item.isJoined ? (
                  <Text style={styles.joinedText}>Đã tham gia</Text>
                ) : (
                  <>
                    <UserPlus size={18} color="#FFFFFF" />
                    <Text style={styles.joinText}>Tham gia</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );

  const ManageTab = () => (
    <FlatList
      data={getOwnedCommunities}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.groupRow}
          onPress={() => router.push(`/community/${item.id}`)}
        >
          {/* Ảnh bên trái */}
          <Image source={{ uri: item.coverImage }} style={styles.groupAvatar} />

          {/* Text bên phải */}
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>{item.name}</Text>
            <Text style={styles.groupMembers}>
              {item.memberCount.toLocaleString('vi-VN')} thành viên
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader />
      <Tabs />

      <View style={styles.content}>
        {activeTab === 'for-you' && <ForYouTab />}
        {activeTab === 'your-groups' && <YourGroupsTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'manage' && <ManageTab />}
      </View>

      {/* Modal Tạo mới */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCreateModalVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Tạo mới</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setCreateModalVisible(false);
              }}
            >
              <View style={styles.modalIcon}>
                <Users size={24} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.modalItemTitle}>Tạo cộng đồng mới</Text>
                <Text style={styles.modalItemDesc}>
                  Tạo nhóm riêng về bất động sản
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setCreateModalVisible(false);
              }}
            >
              <View style={styles.modalIcon}>
                <Plus size={24} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.modalItemTitle}>Viết bài đăng</Text>
                <Text style={styles.modalItemDesc}>
                  Chia sẻ dự án, kinh nghiệm, tin tức
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Styles đẹp lung linh
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    width: 260,
  },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    gap: 4,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#EF4444' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#EF4444' },
  content: { flex: 1 },
  groupsSection: { backgroundColor: '#FFFFFF', paddingVertical: 16 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  groupsHorizontal: { paddingHorizontal: 16, flexDirection: 'row', gap: 12 },
  groupItem: { width: 140, height: 100, borderRadius: 12, overflow: 'hidden' },
  groupImage: { width: '100%', height: '100%' },
  groupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  groupName: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  discoverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discoverImage: { width: '100%', height: 160 },
  discoverInfo: { padding: 16 },
  discoverName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  discoverCategory: { fontSize: 14, color: '#EF4444', marginTop: 4 },
  discoverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberCount: { fontSize: 14, color: '#6B7280' },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinedButton: { backgroundColor: '#10B981' },
  joinText: { color: '#FFFFFF', fontWeight: '600' },
  joinedText: { color: '#FFFFFF', fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '88%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  modalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemTitle: { fontSize: 17, fontWeight: '600' },
  modalItemDesc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  groupInfo: {
    marginLeft: 12,
    flex: 1,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  groupMembers: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  forYouHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },

  followedGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  followedGroupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },

  followedGroupInfo: {
    marginLeft: 10,
  },

  followedGroupName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  followedGroupMembers: {
    fontSize: 13,
    color: '#6B7280',
  },

  // PostCard header
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  postCommunityAvatar: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },

  postCommunityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  postAuthorName: {
    fontSize: 13,
    color: '#6B7280',
  },
});
