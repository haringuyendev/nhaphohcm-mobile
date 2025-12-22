// app/(tabs)/community.tsx
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CommunityTabs } from '@/components/community/CommunityTabs';
import { CreateModal } from '@/components/community/CreateModal';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ManageTab } from '@/components/community/ManageTab';
import { DiscoverTab } from '@/components/community/DiscoverTab';
import { YourGroupsTab } from '@/components/community/YourGroupsTab';
import { ForYouTab } from '@/components/community/ForYouTab';

type TabType = 'for-you' | 'your-groups' | 'discover' | 'manage';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('for-you');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <CommunityHeader
        searchVisible={searchVisible}
        searchQuery={searchQuery}
        onSearchToggle={() => setSearchVisible(!searchVisible)}
        onSearchChange={setSearchQuery}
        onCancelSearch={() => { setSearchVisible(false); setSearchQuery(''); }}
        onCreatePress={() => setCreateModalVisible(true)}
      />

      <CommunityTabs activeTab={activeTab} onTabPress={setActiveTab} />

      <View style={styles.content}>
        {activeTab === 'for-you' && (
          <ForYouTab/>
        )}

        {activeTab === 'your-groups' && (
          <YourGroupsTab/>
        )}

        {activeTab === 'discover' && (
          <DiscoverTab/>
        )}

        {activeTab === 'manage' && (
          <ManageTab />
        )}
      </View>

      <CreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateCommunity={() => { /* TODO */ }}
        onCreatePost={() => { /* TODO */ }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
});