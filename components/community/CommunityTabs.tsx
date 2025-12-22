// components/community/CommunityTabs.tsx
import { Compass, Home, Settings, UserCheck } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type TabType = 'for-you' | 'your-groups' | 'discover' | 'manage';

type Props = {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
};

export const CommunityTabs = ({ activeTab, onTabPress }: Props) => {
  const tabs = [
    { key: 'for-you', icon: Home, label: 'Dành cho bạn' },
    { key: 'your-groups', icon: UserCheck, label: 'Nhóm của bạn' },
    { key: 'discover', icon: Compass, label: 'Khám phá' },
    { key: 'manage', icon: Settings, label: 'Quản lý' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
      >
        {tabs.map(({ key, icon: Icon, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.activeTab]}
            onPress={() => onTabPress(key as TabType)}
          >
            <Icon size={20} color={activeTab === key ? '#EF4444' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 60, backgroundColor: '#FFFFFF' },
  tabList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 20,
    alignItems: 'center',
  },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#EF4444' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#EF4444' },
});