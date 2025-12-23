// components/community/CommunityHeader.tsx
import { Search, Plus, X } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  searchVisible: boolean;
  searchQuery: string;
  onSearchToggle: () => void;
  onSearchChange: (text: string) => void;
  onCancelSearch: () => void;
  onCreatePress: () => void;
};

export const CommunityHeader = ({
  searchVisible,
  searchQuery,
  onSearchToggle,
  onSearchChange,
  onCancelSearch,
  onCreatePress,
}: Props) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Cộng đồng</Text>
      <View style={styles.headerActions}>
        {searchVisible ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm cộng đồng..."
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
            />
            <TouchableOpacity onPress={onCancelSearch}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={onSearchToggle}>
              <Search size={22} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onCreatePress}>
              <Plus size={26} color="#1F2937" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    width: 260,
  },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
});