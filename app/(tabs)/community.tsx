import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { CommunityCard } from '@/components/CommunityCard';

export default function CommunityScreen() {
  const { communities, getJoinedCommunities, getOwnedCommunities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'joined' | 'owned'>('all');

  const joinedCommunities = getJoinedCommunities;
  const ownedCommunities = getOwnedCommunities;

  const getFilteredCommunities = () => {
    let filtered = communities;

    if (selectedTab === 'joined') {
      filtered = joinedCommunities;
    } else if (selectedTab === 'owned') {
      filtered = ownedCommunities;
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCommunities = getFilteredCommunities();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Cộng đồng',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20 },
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cộng đồng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'joined' && styles.activeTab]}
          onPress={() => setSelectedTab('joined')}
        >
          <Text style={[styles.tabText, selectedTab === 'joined' && styles.activeTabText]}>
            Đã tham gia ({joinedCommunities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'owned' && styles.activeTab]}
          onPress={() => setSelectedTab('owned')}
        >
          <Text style={[styles.tabText, selectedTab === 'owned' && styles.activeTabText]}>
            Của tôi ({ownedCommunities.length})
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'owned' && ownedCommunities.length > 0 && (
        <View style={styles.ownedSection}>
          <View style={styles.ownedHeader}>
            <Sparkles size={20} color="#EF4444" />
            <Text style={styles.ownedTitle}>Cộng đồng của bạn</Text>
          </View>
        </View>
      )}

      <FlatList
        data={filteredCommunities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommunityCard community={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Không tìm thấy cộng đồng nào'
                : selectedTab === 'joined'
                ? 'Bạn chưa tham gia cộng đồng nào'
                : 'Bạn chưa tạo cộng đồng nào'}
            </Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  activeTab: {
    backgroundColor: '#FEE2E2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#EF4444',
  },
  ownedSection: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  ownedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownedTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
