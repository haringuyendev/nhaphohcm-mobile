// components/community/PostStats.tsx
import { Text, View, StyleSheet } from 'react-native';

interface PostStatsProps {
  likeCount?: number;
  commentCount?: number;
}

export function PostStats({ likeCount = 0, commentCount = 0 }: PostStatsProps) {
  return (
    <View style={styles.container}>
      {likeCount > 0 && (
        <Text style={styles.text}>
          {likeCount.toLocaleString('vi-VN')} lượt thích
        </Text>
      )}
      {commentCount > 0 && (
        <Text style={styles.text}>
          {commentCount.toLocaleString('vi-VN')} bình luận
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: { fontSize: 13, color: '#6B7280' },
});