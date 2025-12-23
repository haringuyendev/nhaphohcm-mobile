import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Share as RNShare } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useApp } from '@/hooks/use-app';
import { Community, Media, SocialPost, User } from '@/types/community';
import { renderLexicalNode } from '@/utils/lexical';
import { resolveImageUrl } from '@/utils';

interface PostCardProps {
  post: SocialPost;
  community?: Community
}

export function PostCard({ post, community }: PostCardProps) {
  const { togglePostLike, incrementShareCount } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    setIsAnimating(true);
    await togglePostLike(post.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleComment = () => {
    Alert.alert('Bình luận', 'Tính năng bình luận đang được phát triển');
  };

  const handleShare = async () => {
    try {
      const result = await RNShare.share({
        message: `${post.content}\n\n`,
        title: 'Chia sẻ bài viết',
      });

      if (result.action === RNShare.sharedAction) {
        await incrementShareCount(post.id);
        Alert.alert('Thành công', 'Đã chia sẻ bài viết');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.card}>
      <View style={styles.groupHeader}>
        <View style={{ position: 'relative' }}>

          {/* Avatar chính: nếu có cộng đồng thì dùng ảnh cộng đồng, nếu không dùng avatar user */}
          <Image
            source={{ uri: resolveImageUrl((community?.cover as Media)?.url) ?? ((post?.author as User)?.avatar as Media)?.url ?? 'https://via.placeholder.com/80x80?text=User' }}
            style={styles.groupAvatar}
          />

          {/* Avatar user chồng lên — chỉ hiển thị nếu có community */}
          {post?.community && (
            <Image
              source={{ uri: resolveImageUrl((post?.author.avatar as Media)?.url) ?? 'https://via.placeholder.com/80x80?text=User' }}
              style={styles.overlayUserAvatar}
            />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.groupName}>
            {post?.community?.name ?? post?.author?.name}
          </Text>

          {/* Nếu có group → hiển thị người đăng + thời gian  
        Nếu không có group → chỉ hiển thị thời gian */}
          <Text style={styles.postAuthor}>
            {post?.community ? `${post?.author.name} · ${getTimeAgo(post.createdAt)}`
              : getTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Nội dung bài viết */}
      <Text style={styles.content}>{renderLexicalNode(post?.content?.root)}</Text>

      {/* Hình ảnh */}
      {post?.attachments && post?.attachments?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}>
          {post?.attachments?.map((attachment, index) => (
            <Image
              key={index}
              source={{ uri: resolveImageUrl((attachment.file as Media)?.url) ?? 'https://via.placeholder.com/80x80?text=User' }}
              style={[styles.postImage, post?.attachments?.length === 1 && styles.singleImage]}
            />
          ))}
        </ScrollView>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        {(post?.likeCount ?? 0) > 0 && (
          <Text style={styles.statText}>
            {post?.likeCount?.toLocaleString('vi-VN')} lượt thích
          </Text>
        )}

        {(post?.commentCount ?? 0) > 0 && (
          <Text style={styles.statText}>
            {post?.commentCount?.toLocaleString('vi-VN')} bình luận
          </Text>
        )}
      </View>
      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart size={22} color={post?.isLiked ? '#EF4444' : '#6B7280'} fill={post?.isLiked ? '#EF4444' : 'transparent'} />
          <Text style={[styles.actionText, post?.isLiked && styles.likedText]}>Thích</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <MessageCircle size={22} color="#6B7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={22} color="#6B7280" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },

  /* ⭐ HEADER FACEBOOK */
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  postAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  content: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  imagesContainer: { marginBottom: 12 },
  imagesContent: { paddingHorizontal: 16, gap: 8 },
  postImage: { width: 280, height: 280, borderRadius: 12 },
  singleImage: { width: '100%', height: 300 },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statText: { fontSize: 13, color: '#6B7280' },
  rightStats: { flexDirection: 'row', gap: 12 },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  actionText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  likedText: { color: '#EF4444' },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },

  overlayUserAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,        // Tròn 100%
    borderWidth: 2,          // Viền trắng cho đẹp như Facebook
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -2,              // Nhô ra 1 chút cho giống FB
    right: -2,
  },
});
