// components/community/FollowedGroupsSection.tsx
import { resolveImageUrl } from '@/utils';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  title: string;
  groups: any[];
};

export const FollowedGroupsSection = ({ title, groups }: Props) => {
  const router = useRouter();

  if (!groups || groups.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {groups.map((group: any) => (
        <TouchableOpacity
          key={group.id}
          style={styles.groupRow}
          onPress={() => router.push(`/community/${group.id}`)}
        >
          <Image
            source={{
              uri: resolveImageUrl(group.cover?.url) ?? 'https://via.placeholder.com/80x80?text=User',
            }}
            style={styles.groupAvatar}
            contentFit="cover"
          />
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>
              {group.memberCount.toLocaleString('vi-VN')} thành viên
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  groupAvatar: { width: 42, height: 42, borderRadius: 8 },
  groupInfo: { marginLeft: 10 },
  groupName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  memberCount: { fontSize: 13, color: '#6B7280' },
});