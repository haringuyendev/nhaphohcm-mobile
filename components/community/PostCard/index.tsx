// components/community/PostCard.tsx (phiên bản cuối cùng sau khi tách)
import { Alert, View, Share as RNShare, StyleSheet } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PostHeader } from './Header';
import { PostContent } from './Content';
import { PostStats } from './Stats';
import { PostActions } from './Actions';
import { CommentModal } from './Modal';

import {
    useAddCommentMutation,
    useReplyCommentMutation,
    useToggleLikeMutation,
} from '@/store/api/socialPosts';
import { useUser } from '@/hooks/use-user';
import { MESSAGE_TYPES, useWebSocket } from '@/hooks/use-websocket';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

interface PostCardProps {
    post: any;
    community?: any;
}

export function PostCard({ post, community }: PostCardProps) {
    const [localPost, setLocalPost] = useState(post);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{
        id: string;
        authorName: string;
    } | null>(null);

    const scrollViewRef = useRef<any>(null); // ref cho CommentModal

    const [toggleLike] = useToggleLikeMutation();
    const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
    const [replyComment, { isLoading: isReplyingComment }] = useReplyCommentMutation();

    const { user: me, postLikes } = useUser();
    const likedPostIds = postLikes?.map((p: any) => p.post?.id || p.post);
    const isLiked = likedPostIds?.includes(localPost.id);

    useEffect(() => {
        setLocalPost(post);
    }, [post]);

    const handleWS = useCallback(
        (event: string, payload: any) => {
            if (event !== MESSAGE_TYPES.COLLECTION_CHANGED) return;

            const { collection, operation, doc } = payload;

            if (collection === 'socialPosts' && doc.id === localPost.id) {
                setLocalPost((prev: any) => ({
                    ...prev,
                    likeCount: doc.likeCount ?? prev.likeCount,
                    commentCount: doc.commentCount ?? prev.commentCount,
                }));

                if (me && doc.author?.id === me.id) {
                    Toast.show({
                        type: 'realEstateSuccess',
                        text1: 'Có người vừa thích bài viết của bạn!',
                        text2: localPost.title || 'Bài viết mới',
                    });
                }
            }

            if (collection === 'comments' && operation === 'create') {
                const commentPostId =
                    typeof doc.post === 'string' ? doc.post : doc.post?.id;

                if (commentPostId === localPost.id) {
                    if (me && doc.author?.id !== me.id) {
                        Toast.show({
                            type: 'realEstateSuccess',
                            text1: `${doc.author?.name || 'Ai đó'} vừa bình luận`,
                            text2: `"${doc.text}"`,
                            position: 'top',
                            visibilityTime: 4000,
                        });
                    }

                    setLocalPost((prev: any) => ({
                        ...prev,
                        commentCount: (prev.commentCount ?? 0) + 1,
                    }));
                }
            }
        },
        [localPost.id, localPost.title, me]
    );

    const { fetchCollection, data } = useWebSocket(handleWS);

    useEffect(() => {
        if (isCommentModalOpen) {
            fetchCollection('comments', {
                limit: 200,
                sort: 'createdAt',
                where: { post: { equals: localPost.id } },
                depth: 2,
            });
        }
    }, [isCommentModalOpen, localPost.id, fetchCollection]);

    const comments = data?.comments || [];

    const rootComments = comments.filter(
        (comment: any) =>
            comment.parentComment === null &&
            (typeof comment.post === 'string'
                ? comment.post
                : comment.post?.id) === localPost.id
    ).sort(
        (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const getReplies = (parentId: string) =>
        comments
            .filter(
                (comment: any) =>
                    comment.parentComment?.id === parentId ||
                    comment.parentComment === parentId
            )
            .sort(
                (a: any, b: any) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

    useEffect(() => {
        if (rootComments.length > 0 && isCommentModalOpen) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    }, [rootComments.length, isCommentModalOpen]);

    const handleLike = async () => {
        try {
            await toggleLike(localPost.id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleOpenComment = () => setIsCommentModalOpen(true);

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
                await addComment({ postId: localPost.id, text: commentText.trim() });
            }
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
        }
    };

    const handleShare = async () => {
        try {
            await RNShare.share({
                message: localPost.title || 'Xem bài viết này',
                url: `https://yourapp.com/post/${localPost.id}`, // tùy chọn
                title: 'Chia sẻ bài viết',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <View style={styles.card}>
            <PostHeader
                communityName={community?.name}
                communityCover={community?.cover}
                authorName={post.author?.name || 'Người dùng'}
                authorAvatar={post.author?.avatar}
                createdAt={post.createdAt}
            />

            <PostContent content={post.content} attachments={post.attachments} />

            <PostStats
                likeCount={localPost.likeCount}
                commentCount={localPost.commentCount}
            />

            <PostActions
                isLiked={isLiked}
                onLike={handleLike}
                onComment={handleOpenComment}
                onShare={handleShare}
            />

            <CommentModal
                visible={isCommentModalOpen}
                onClose={handleCloseComment}
                rootComments={rootComments}
                getReplies={getReplies}
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
                onReply={handleReplyComment}
                commentText={commentText}
                setCommentText={setCommentText}
                onSubmitComment={handleSubmitComment}
                isSubmitting={isAddingComment || isReplyingComment}
                scrollViewRef={scrollViewRef}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
});