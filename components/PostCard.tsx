import { useApp } from '@/hooks/use-app';
import {
  useAddCommentMutation,
  useGetCommentsQuery,
  useReplyCommentMutation,
  useToggleLikeMutation,
} from '@/store/api/socialPosts';
import {
  Comment,
  Community,
  Media,
  SocialPost,
  User,
} from '@/store/payload-types';
import { resolveImageUrl } from '@/utils';
import { renderLexicalNode } from '@/utils/lexical';
import { Heart, MessageCircle, Send, Share2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface PostCardProps {
  post: SocialPost;
  community?: Community;
}

export function PostCard({ post, community }: PostCardProps) {
  const insets = useSafeAreaInsets();

  console.log('Rendering PostCard for post ID:', post);

  const { incrementShareCount } = useApp();
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
    try {
      await toggleLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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
        incrementShareCount(post.id);
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
            source={{
              uri:
                resolveImageUrl((community?.cover as Media)?.url) ??
                ((post?.author as User)?.avatar as Media)?.url ??
                'https://via.placeholder.com/80x80?text=User',
            }}
            style={styles.groupAvatar}
          />

          {/* Avatar user chồng lên — chỉ hiển thị nếu có community */}
          {post?.community && (
            <Image
              source={{
                uri:
                  resolveImageUrl((post?.author.avatar as Media)?.url) ??
                  'https://via.placeholder.com/80x80?text=User',
              }}
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
            {post?.community
              ? `${post?.author.name} · ${getTimeAgo(post.createdAt)}`
              : getTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Nội dung bài viết */}
      <Text style={styles.content}>
        {renderLexicalNode(post?.content?.root)}
      </Text>

      {/* Hình ảnh */}
      {post?.attachments && post?.attachments?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {post?.attachments?.map((attachment, index) => (
            <Image
              key={index}
              source={{
                uri:
                  resolveImageUrl((attachment.file as Media)?.url) ??
                  'https://via.placeholder.com/80x80?text=User',
              }}
              style={[
                styles.postImage,
                post?.attachments?.length === 1 && styles.singleImage,
              ]}
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
          <Heart
            size={22}
            color={post?.isLiked ? '#EF4444' : '#6B7280'}
            fill={post?.isLiked ? '#EF4444' : 'transparent'}
          />
          <Text style={[styles.actionText, post?.isLiked && styles.likedText]}>
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenComment}
        >
          <MessageCircle size={22} color="#6B7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
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

                  console.log(
                    'Rendering comment ID:',
                    comment.id,
                    'with replies:',
                    replies
                  );

                  return (
                    <View key={comment.id || index}>
                      {/* Parent Comment */}
                      <View style={styles.commentItem}>
                        <Image
                          source={{
                            uri:
                              resolveImageUrl(
                                (comment.author?.avatar as Media)?.url
                              ) ??
                              'https://via.placeholder.com/40x40?text=User',
                          }}
                          style={styles.commentAvatar}
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
                                uri:
                                  resolveImageUrl(
                                    (reply.author?.avatar as Media)?.url
                                  ) ??
                                  'https://via.placeholder.com/40x40?text=User',
                              }}
                              style={styles.replyAvatar}
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
    borderRadius: 13, // Tròn 100%
    borderWidth: 2, // Viền trắng cho đẹp như Facebook
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -2, // Nhô ra 1 chút cho giống FB
    right: -2,
  },

  /* Comment Modal Styles */
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 0, // Đảm bảo modal chạm đáy
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
