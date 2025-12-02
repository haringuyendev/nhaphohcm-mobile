import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Share as RNShare } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { Post } from '@/types/community';
import { useApp } from '@/contexts/AppContext';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
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
        message: `${post.content}\n\n- ${post.userName}`,
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
      <View style={styles.header}>
        <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.timestamp}>{getTimeAgo(post.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {post.images.map((imageUri, index) => (
            <Image
              key={index}
              source={{ uri: imageUri }}
              style={[
                styles.postImage,
                post.images!.length === 1 && styles.singleImage,
              ]}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {post.likeCount > 0 && `${post.likeCount.toLocaleString('vi-VN')} lượt thích`}
        </Text>
        <View style={styles.rightStats}>
          {post.commentCount > 0 && (
            <Text style={styles.statText}>
              {post.commentCount.toLocaleString('vi-VN')} bình luận
            </Text>
          )}
          {post.shareCount > 0 && (
            <Text style={styles.statText}>
              {post.shareCount.toLocaleString('vi-VN')} chia sẻ
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Heart
            size={22}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
            fill={post.isLiked ? '#EF4444' : 'transparent'}
            style={isAnimating && styles.animatedIcon}
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
          activeOpacity={0.7}
        >
          <MessageCircle size={22} color="#6B7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
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
    marginBottom: 8,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  content: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imagesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  postImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  singleImage: {
    width: '100%',
    height: 320,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  rightStats: {
    flexDirection: 'row',
    gap: 12,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  likedText: {
    color: '#EF4444',
  },
  animatedIcon: {
    transform: [{ scale: 1.2 }],
  },
});
