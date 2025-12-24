// components/community/CommentItem.tsx
import { Image } from 'expo-image';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { getImageUrl } from '@/utils';

interface CommentItemProps {
  comment: any;
  isReply?: boolean;
  onReply: (id: string, name: string) => void;
  getTimeAgo: (date: string) => string;
}

export function CommentItem({
  comment,
  isReply = false,
  onReply,
  getTimeAgo,
}: CommentItemProps) {
  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <Image
        source={{ uri: getImageUrl(comment.author?.avatar) }}
        style={isReply ? styles.replyAvatar : styles.avatar}
        placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
      />
      <View style={styles.content}>
        <Text style={styles.author}>{comment.author?.name ?? 'Người dùng'}</Text>
        <Text style={styles.text}>{comment.text}</Text>
        <View style={styles.actions}>
          <Text style={styles.time}>{getTimeAgo(comment.createdAt)}</Text>
          <TouchableOpacity onPress={() => onReply(comment.id, comment.author?.name ?? 'Người dùng')}>
            <Text style={styles.replyBtn}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  replyContainer: { paddingLeft: 52, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  replyAvatar: { width: 32, height: 32, borderRadius: 16 },
  content: { flex: 1, marginLeft: 12 },
  author: { fontSize: 14, fontWeight: '600', color: '#111827' },
  text: { fontSize: 14, color: '#374151', marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 4, alignItems: 'center' },
  time: { fontSize: 12, color: '#9CA3AF' },
  replyBtn: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
});