// components/community/PostHeader.tsx
import { Image } from 'expo-image';
import { Text, View, StyleSheet } from 'react-native';
import { getImageUrl, getTimeAgo } from '@/utils';
import { Media } from '@/types/community';

interface PostHeaderProps {
  communityName?: string;
  communityCover?: Media;
  authorName: string;
  authorAvatar?: Media;
  createdAt: string;
}

export function PostHeader({
  communityName,
  communityCover,
  authorName,
  authorAvatar,
  createdAt,
}: PostHeaderProps) {
  const mainAvatar = communityCover ?? authorAvatar;

  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: getImageUrl(mainAvatar) }}
          style={styles.mainAvatar}
          placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        />
        {communityName && authorAvatar && (
          <Image
            source={{ uri: getImageUrl(authorAvatar) }}
            style={styles.userOverlayAvatar}
            placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
          />
        )}
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.groupName}>
          {communityName || authorName || 'Người dùng'}
        </Text>
        <Text style={styles.postMeta}>
          {communityName
            ? `${authorName || 'Thành viên'} · ${getTimeAgo(createdAt)}`
            : getTimeAgo(createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', padding: 16, paddingBottom: 12 },
  avatarContainer: { position: 'relative' },
  mainAvatar: { width: 48, height: 48, borderRadius: 8 },
  userOverlayAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  headerInfo: { flex: 1, justifyContent: 'center', marginLeft: 12 },
  groupName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  postMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});