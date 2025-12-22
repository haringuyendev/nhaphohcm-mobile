// components/community/CreateModal.tsx
import { Plus, Users } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateCommunity: () => void;
  onCreatePost: () => void;
};

export const CreateModal = ({ visible, onClose, onCreateCommunity, onCreatePost }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <Text style={styles.title}>Tạo mới</Text>

          <TouchableOpacity style={styles.item} onPress={onCreateCommunity}>
            <View style={styles.icon}><Users size={24} color="#EF4444" /></View>
            <View>
              <Text style={styles.itemTitle}>Tạo cộng đồng mới</Text>
              <Text style={styles.itemDesc}>Tạo nhóm riêng về bất động sản</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={onCreatePost}>
            <View style={styles.icon}><Plus size={24} color="#EF4444" /></View>
            <View>
              <Text style={styles.itemTitle}>Viết bài đăng</Text>
              <Text style={styles.itemDesc}>Chia sẻ dự án, kinh nghiệm, tin tức</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '88%' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  icon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 17, fontWeight: '600' },
  itemDesc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
});