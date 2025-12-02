import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, FileText } from 'lucide-react-native';
import { Community } from '@/types/community';

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/community/${community.id}` as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <Image source={{ uri: community.coverImage }} style={styles.coverImage} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {community.name}
          </Text>
          {community.isOwned && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Quản lý</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {community.description}
        </Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {community.memberCount.toLocaleString('vi-VN')} thành viên
            </Text>
          </View>
          
          <View style={styles.stat}>
            <FileText size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {community.postCount.toLocaleString('vi-VN')} bài viết
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{community.category}</Text>
          </View>
          
          {community.isJoined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Đã tham gia</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginRight: 8,
  },
  ownerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4B5563',
  },
  joinedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#16A34A',
  },
});
