// components/community/CommentModal.tsx
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Send, X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { getTimeAgo } from '@/utils';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  rootComments: any[];
  getReplies: (parentId: string) => any[];
  replyingTo: { id: string; authorName: string } | null;
  onCancelReply: () => void;
  onReply: (commentId: string, authorName: string) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  onSubmitComment: () => void;
  isSubmitting: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
}

export function CommentModal({
  visible,
  onClose,
  rootComments,
  getReplies,
  replyingTo,
  onCancelReply,
  onReply,
  commentText,
  setCommentText,
  onSubmitComment,
  isSubmitting,
  scrollViewRef,
}: CommentModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bình luận</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
          >
            {rootComments.length > 0 ? (
              rootComments.map((comment) => {
                const replies = getReplies(comment.id);
                return (
                  <View key={comment.id}>
                    {/* Root Comment */}
                    <CommentItem
                      comment={comment}
                      rootComments={comment}
                      onReply={onReply}
                      getTimeAgo={getTimeAgo}
                    />

                    {/* Replies */}
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply={true}
                        rootComments={comment}
                        onReply={onReply}
                        getTimeAgo={getTimeAgo}
                      />
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

          {/* Input */}
          <View style={styles.commentInputContainer}>
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Đang trả lời{' '}
                  <Text style={styles.replyingToName}>{replyingTo.authorName}</Text>
                </Text>
                <TouchableOpacity onPress={onCancelReply}>
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
                  (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled,
                ]}
                onPress={onSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
              >
                {isSubmitting ? (
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
  );
}

const styles = StyleSheet.create({
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  closeButton: { position: 'absolute', right: 16, padding: 4 },
  commentsList: { flex: 1, paddingHorizontal: 16 },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
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
  replyingToText: { fontSize: 13, color: '#6B7280' },
  replyingToName: { fontWeight: '600', color: '#111827' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
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
  sendButtonDisabled: { backgroundColor: '#93C5FD' },
});