// components/community/PostActions.tsx
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

interface PostActionsProps {
  isLiked: boolean;
  likeCount?: number;
  commentCount?: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function PostActions({
  isLiked,
  onLike,
  onComment,
  onShare,
}: PostActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.action} onPress={onLike}>
        <Heart
          size={22}
          color={isLiked ? '#EF4444' : '#6B7280'}
          fill={isLiked ? '#EF4444' : 'transparent'}
        />
        <Text style={[styles.text, isLiked && styles.likedText]}>Thích</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={onComment}>
        <MessageCircle size={22} color="#6B7280" />
        <Text style={styles.text}>Bình luận</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={onShare}>
        <Share2 size={22} color="#6B7280" />
        <Text style={styles.text}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  text: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  likedText: { color: '#EF4444' },
});