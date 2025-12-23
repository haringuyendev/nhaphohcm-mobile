// components/community/PostCard.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share as RNShare
} from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

import { useApp } from '@/hooks/use-app';
import { Community, Media, SocialPost, User } from '@/types/community';
import { getImageUrl } from '@/utils'; // ← DÙNG HÀM CHUNG
import { renderLexicalNode } from '@/utils/lexical'; // giả sử bạn có hàm này

interface PostCardProps {
  post: SocialPost;
  community?: Community;
}

export function PostCard({ post, community }: PostCardProps) {
  const { togglePostLike, incrementShareCount } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    setIsAnimating(true);
    await togglePostLike(post.id);
    setTimeout(() => setIsAnimating(false), 600);
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

  // Avatar chính: ưu tiên community → user
  const mainAvatar = community?.cover ?? post.author?.avatar;
  const userAvatar = post.author?.avatar;

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {/* Avatar nhóm/cộng đồng hoặc user */}
          <Image
            source={{ uri: getImageUrl(mainAvatar as Media) }}
            style={styles.mainAvatar}
            placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
          />

          {/* Avatar user nhỏ chồng lên (chỉ khi có community) */}
          {community && userAvatar && (
            <Image
              source={{ uri: getImageUrl(userAvatar as Media) }}
              style={styles.userOverlayAvatar}
              placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
            />
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.groupName}>
            {community?.name || post.author?.name || 'Người dùng'}
          </Text>
          <Text style={styles.postMeta}>
            {community
              ? `${post.author?.name || 'Thành viên'} · ${getTimeAgo(post.createdAt)}`
              : getTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* NỘI DUNG */}
      <View style={styles.contentContainer}>
        {post.content && (
          <Text style={styles.contentText}>
            {renderLexicalNode(post.content.root)}
          </Text>
        )}

        {/* HÌNH ẢNH */}
        {post.attachments && post.attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContent}
            style={styles.imagesContainer}
          >
            {post.attachments.map((attachment, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl((attachment.file as Media)) }}
                style={[
                  styles.postImage,
                  (post.attachments ?? []).length === 1 && styles.singleImage,
                ]}
                placeholder={(attachment.file as Media)?.blurhash || 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        {(post.likeCount ?? 0) > 0 && (
          <Text style={styles.statText}>
            {post.likeCount?.toLocaleString('vi-VN')} lượt thích
          </Text>
        )}
        {(post.commentCount ?? 0) > 0 && (
          <Text style={styles.statText}>
            {post.commentCount?.toLocaleString('vi-VN')} bình luận
          </Text>
        )}
        {/* {(post.shareCount ?? 0) > 0 && (
          <Text style={styles.statText}>
            {post.shareCount?.toLocaleString('vi-VN')} lượt chia sẻ
          </Text>
        )} */}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <Heart
            size={22}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
            fill={post.isLiked ? '#EF4444' : 'transparent'}
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleComment}>
          <MessageCircle size={22} color="#6B7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleShare}>
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
  },

  header: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  mainAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
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

  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  postMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  contentContainer: {
    paddingHorizontal: 16,
  },
  contentText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },

  imagesContainer: {
    marginBottom: 12,
  },
  imagesContent: {
    gap: 8,
  },
  postImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  singleImage: {
    width: '100%',
    height: 320,
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },

  actions: {
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
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  likedText: {
    color: '#EF4444',
  },
});