import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, Zap, Edit, Trash2, EyeOff, Clock } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PropertyCard } from '@/components/PropertyCard';
import { mockVIPPackages } from '@/mocks/data';

type TabType = 'active' | 'hidden' | 'expired';

export default function MyPostsScreen() {
  const router = useRouter();
  const { getMyProperties, updateProperty, deleteProperty, pushProperty, upgradeToVIP } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const myProperties = getMyProperties('user1');

  const filteredProperties = myProperties.filter((p) => {
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'hidden') return p.status === 'hidden';
    if (activeTab === 'expired') return p.status === 'expired';
    return false;
  });

  const handlePush = async (id: string) => {
    await pushProperty(id);
    Alert.alert('Thành công', 'Đã đẩy tin lên đầu trang!');
  };

  const handleUpgradeVIP = (propertyId: string) => {
    Alert.alert(
      'Chọn gói VIP',
      'Chọn gói VIP để tin của bạn nổi bật hơn',
      [
        ...mockVIPPackages.map((pkg) => ({
          text: `${pkg.name} - ${pkg.price.toLocaleString()}đ`,
          onPress: async () => {
            await upgradeToVIP(propertyId, pkg.days);
            Alert.alert('Thành công', `Đã nâng cấp VIP ${pkg.days} ngày!`);
          },
        })),
        { text: 'Hủy', style: 'cancel' as const }
      ]
    );
  };

  const handleHide = async (id: string) => {
    await updateProperty(id, { status: 'hidden' });
    Alert.alert('Thành công', 'Đã ẩn tin đăng');
  };

  const handleShow = async (id: string) => {
    await updateProperty(id, { status: 'active' });
    Alert.alert('Thành công', 'Đã hiển thị tin đăng');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa tin đăng',
      'Bạn có chắc muốn xóa tin đăng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            await deleteProperty(id);
            Alert.alert('Thành công', 'Đã xóa tin đăng');
          }
        },
      ]
    );
  };

  const renderActions = (property: any) => (
    <View style={styles.actionsContainer}>
      {property.isVIP && (
        <View style={styles.vipBanner}>
          <Zap size={16} color="#EF4444" fill="#EF4444" />
          <Text style={styles.vipBannerText}>
            VIP còn {Math.ceil((new Date(property.vipExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày
          </Text>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handlePush(property.id)}
        >
          <TrendingUp size={18} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Đẩy tin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleUpgradeVIP(property.id)}
        >
          <Zap size={18} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/post' as any)}
        >
          <Edit size={18} color="#3B82F6" />
          <Text style={[styles.actionText, { color: '#3B82F6' }]}>Sửa</Text>
        </TouchableOpacity>

        {property.status === 'active' ? (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleHide(property.id)}
          >
            <EyeOff size={18} color="#6B7280" />
            <Text style={[styles.actionText, { color: '#6B7280' }]}>Ẩn</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShow(property.id)}
          >
            <EyeOff size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Hiện</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(property.id)}
        >
          <Trash2 size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>

      {property.status === 'active' && (
        <View style={styles.expiryInfo}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.expiryText}>
            Hết hạn: {new Date(property.expiryDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Tin của tôi',
          headerTitleStyle: { fontWeight: '700' as const },
        }} 
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Đang hiển thị ({myProperties.filter((p) => p.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hidden' && styles.tabActive]}
          onPress={() => setActiveTab('hidden')}
        >
          <Text style={[styles.tabText, activeTab === 'hidden' && styles.tabTextActive]}>
            Đã ẩn ({myProperties.filter((p) => p.status === 'hidden').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expired' && styles.tabActive]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[styles.tabText, activeTab === 'expired' && styles.tabTextActive]}>
            Hết hạn ({myProperties.filter((p) => p.status === 'expired').length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <PropertyCard property={item} />
            {renderActions(item)}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có tin đăng nào</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/post' as any)}
            >
              <Text style={styles.createButtonText}>Đăng tin ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#EF4444',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  tabTextActive: {
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  listContent: {
    paddingBottom: 16,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  vipBannerText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600' as const,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
