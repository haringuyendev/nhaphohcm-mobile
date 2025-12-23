// components/community/PostCard.tsx
import { Image } from 'expo-image';
import { Heart, MessageCircle, Send, Share2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share as RNShare,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/hooks/use-app';
import {
  useAddCommentMutation,
  useGetCommentsQuery,
  useReplyCommentMutation,
  useToggleLikeMutation,
} from '@/store/api/socialPosts';
import { Comment } from '@/store/payload-types';
import { Community, Media, SocialPost } from '@/types/community';
import { getImageUrl } from '@/utils'; // ← DÙNG HÀM CHUNG
import { renderLexicalNode } from '@/utils/lexical'; // giả sử bạn có hàm này

interface PostCardProps {
  post: SocialPost;
  community?: Community;
}

export function PostCard({ post, community }: PostCardProps) {
  const insets = useSafeAreaInsets();
  const { togglePostLike, incrementShareCount } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);

  const [toggleLike] = useToggleLikeMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [replyComment, { isLoading: isReplyingComment }] =
    useReplyCommentMutation();
  const { data: commentsResponse, isLoading: isCommentsLoading } =
    useGetCommentsQuery(post.id, { skip: !isCommentModalOpen });
  const allComments = commentsResponse?.docs || [];

  // Filter root comments (no parentComment) and group replies
  const rootComments = allComments.filter(
    (comment: any) => comment.parentComment === null
  );
  const getReplies = (parentId: string) =>
    allComments.filter(
      (comment: any) =>
        comment.parentComment?.id === parentId ||
        comment.parentComment === parentId
    );

  const handleLike = async () => {
    setIsAnimating(true);
    try {
      await toggleLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleOpenComment = () => {
    setIsCommentModalOpen(true);
  };

  const handleCloseComment = () => {
    setIsCommentModalOpen(false);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleReplyComment = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, authorName });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      if (replyingTo) {
        await replyComment({
          parentCommentId: replyingTo.id,
          text: commentText.trim(),
        });
        setReplyingTo(null);
      } else {
        await addComment({ postId: post.id, text: commentText.trim() });
      }
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
    }
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
              ? `${post.author?.name || 'Thành viên'} · ${getTimeAgo(
                  post.createdAt
                )}`
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
                source={{ uri: getImageUrl(attachment.file as Media) }}
                style={[
                  styles.postImage,
                  (post.attachments ?? []).length === 1 && styles.singleImage,
                ]}
                placeholder={
                  (attachment.file as Media)?.blurhash ||
                  'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
                }
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

        <TouchableOpacity style={styles.action} onPress={handleOpenComment}>
          <MessageCircle size={22} color="#6B7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleShare}>
          <Share2 size={22} color="#6B7280" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseComment}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bình luận</Text>
              <TouchableOpacity
                onPress={handleCloseComment}
                style={styles.closeButton}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
            >
              {isCommentsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                </View>
              ) : rootComments && rootComments.length > 0 ? (
                rootComments.map((comment: any, index: number) => {
                  const replies = getReplies(comment.id).sort(
                    (a: Comment, b: Comment) => {
                      return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                      );
                    }
                  );

                  return (
                    <View key={comment.id || index}>
                      {/* Parent Comment */}
                      <View style={styles.commentItem}>
                        <Image
                          source={{
                            uri: getImageUrl(comment.author?.avatar as Media),
                          }}
                          style={styles.commentAvatar}
                          placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                        />
                        <View style={styles.commentContent}>
                          <Text style={styles.commentAuthor}>
                            {comment.author?.name ?? 'Người dùng'}
                          </Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <View style={styles.commentActions}>
                            <Text style={styles.commentTime}>
                              {getTimeAgo(comment.createdAt)}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                handleReplyComment(
                                  comment.id,
                                  comment.author?.name ?? 'Người dùng'
                                )
                              }
                            >
                              <Text style={styles.replyButton}>Trả lời</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Replies */}
                      {replies.length > 0 &&
                        replies.map((reply: any, replyIndex: number) => (
                          <View
                            key={reply.id || replyIndex}
                            style={styles.replyItem}
                          >
                            <Image
                              source={{
                                uri: getImageUrl(reply.author?.avatar as Media),
                              }}
                              style={styles.replyAvatar}
                              placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                            />
                            <View style={styles.commentContent}>
                              <Text style={styles.commentAuthor}>
                                {reply.author?.name ?? 'Người dùng'}
                              </Text>
                              <Text style={styles.commentText}>
                                {reply.text}
                              </Text>
                              <View style={styles.commentActions}>
                                <Text style={styles.commentTime}>
                                  {getTimeAgo(reply.createdAt)}
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleReplyComment(
                                      comment.id,
                                      reply.author?.name ?? 'Người dùng'
                                    )
                                  }
                                >
                                  <Text style={styles.replyButton}>
                                    Trả lời
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyComments}>
                  <MessageCircle size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                  <Text style={styles.emptySubText}>
                    Hãy là người đầu tiên bình luận!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>
                    Đang trả lời{' '}
                    <Text style={styles.replyingToName}>
                      {replyingTo.authorName}
                    </Text>
                  </Text>
                  <TouchableOpacity onPress={handleCancelReply}>
                    <X size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={
                    replyingTo
                      ? `Trả lời ${replyingTo.authorName}...`
                      : 'Viết bình luận...'
                  }
                  placeholderTextColor="#9CA3AF"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!commentText.trim() ||
                      isAddingComment ||
                      isReplyingComment) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={handleSubmitComment}
                  disabled={
                    !commentText.trim() || isAddingComment || isReplyingComment
                  }
                >
                  {isAddingComment || isReplyingComment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Send size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  /* Comment Modal Styles */
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 16,
  },
  replyButton: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingLeft: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  commentInputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  replyingToText: {
    fontSize: 13,
    color: '#6B7280',
  },
  replyingToName: {
    fontWeight: '600',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
});
