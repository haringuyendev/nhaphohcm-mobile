// components/community/CommunityListItem.tsx
import { resolveImageUrl } from '@/utils';
import { Image } from 'expo-image';
import { Users, UserPlus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  community: any;
  onPress?: () => void;
  showJoinButton?: boolean;
  isJoined?: boolean;
};

export const CommunityListItem = ({ community, onPress, showJoinButton = false, isJoined = false }: Props) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: resolveImageUrl(community.avatar?.url || community.cover?.url)??'https://via.placeholder.com/80x80?text=User' }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{community.name}</Text>
        <View style={styles.footer}>
          <View style={styles.memberRow}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.memberCount}>
              {community.memberCount.toLocaleString('vi-VN')} thành viên
            </Text>
          </View>
          {showJoinButton && (
            <TouchableOpacity style={[styles.joinButton, isJoined && styles.joinedButton]}>
              {isJoined ? (
                <Text style={styles.joinedText}>Đã tham gia</Text>
              ) : (
                <>
                  <UserPlus size={18} color="#FFFFFF" />
                  <Text style={styles.joinText}>Tham gia</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberCount: { fontSize: 14, color: '#6B7280' },
  joinButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  joinedButton: { backgroundColor: '#10B981' },
  joinText: { color: '#FFFFFF', fontWeight: '600' },
  joinedText: { color: '#FFFFFF', fontWeight: '600' },
});