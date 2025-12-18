import { Header } from '@/components/Headers/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { mockVIPPackages } from '@/mocks/data';
import { Stack, useRouter } from 'expo-router';
import { Clock, Edit, EyeOff, Trash2, TrendingUp, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBumpPropertyMutation,
  useUpdateVipStatusMutation,
  useDeletePropertyPermanentlyMutation,
  useHidePropertyMutation,
  useRestorePropertyMutation,
  useGetMyPropertiesByStatusQuery,
} from '@/store/api/properties';
import { useUser } from '@/hooks/use-user';

type TabType = 'active' | 'hidden' | 'expired';

const statusMap: Record<TabType, 'published' | 'deleted' | 'expired'> = {
  active: 'published',
  hidden: 'deleted',
  expired: 'expired',
};

export default function MyPostsScreen() {
  const router = useRouter();
  const { user, favorites } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const currentStatus = statusMap[activeTab];

  const {
    data: propertiesData,
    isLoading,
    isFetching,
  } = useGetMyPropertiesByStatusQuery(
    {
      userId: user?.id || '',
      status: currentStatus,
      limit: 50,
      page: 1,
    },
    { skip: !user?.id }
  );

  const properties = propertiesData?.docs || [];
  const totalCount = propertiesData?.totalDocs || 0;

  // Mutations
  const [bumpProperty] = useBumpPropertyMutation();
  const [updateVipStatus] = useUpdateVipStatusMutation();
  const [hideProperty] = useHidePropertyMutation();
  const [restoreProperty] = useRestorePropertyMutation();
  const [deleteProperty] = useDeletePropertyPermanentlyMutation();

  const handlePush = async (id: string) => {
    try {
      await bumpProperty(id).unwrap();
      Alert.alert('Thành công', 'Đã đẩy tin lên đầu trang!');
    } catch {
      Alert.alert('Lỗi', 'Không thể đẩy tin, vui lòng thử lại');
    }
  };

  const handleUpgradeVIP = (propertyId: string) => {
    Alert.alert(
      'Chọn gói VIP',
      'Chọn gói VIP để tin của bạn nổi bật hơn',
      [
        ...mockVIPPackages.map((pkg) => ({
          text: `${pkg.name} - ${pkg.price.toLocaleString()}đ (+${pkg.days} ngày)`,
          onPress: async () => {
            try {
              await updateVipStatus({ id: propertyId, days: pkg.days, isVip: true }).unwrap();
              Alert.alert('Thành công', `Đã nâng cấp VIP ${pkg.days} ngày!`);
            } catch {
              Alert.alert('Lỗi', 'Không thể nâng cấp VIP');
            }
          },
        })),
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleHide = async (id: string) => {
    try {
      await hideProperty(id).unwrap();
      Alert.alert('Thành công', 'Đã ẩn tin đăng');
    } catch {
      Alert.alert('Lỗi', 'Không thể ẩn tin');
    }
  };

  const handleShow = async (id: string) => {
    try {
      await restoreProperty(id).unwrap();
      Alert.alert('Thành công', 'Đã hiển thị lại tin đăng');
    } catch {
      Alert.alert('Lỗi', 'Không thể hiển thị tin');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa tin đăng',
      'Bạn có chắc muốn xóa tin đăng này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(id).unwrap();
              Alert.alert('Thành công', 'Đã xóa tin đăng');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa tin');
            }
          },
        },
      ]
    );
  };

  const renderActions = (property: any) => (
    <View style={styles.actionsContainer}>
      {property.is_vip && (
        <View style={styles.vipBanner}>
          <Zap size={16} color="#EF4444" fill="#EF4444" />
          <Text style={styles.vipBannerText}>
            VIP còn {Math.ceil((new Date(property.vip_expire_at).getTime() - Date.now()) / 86400000)} ngày
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handlePush(property.id)}>
          <TrendingUp size={18} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Đẩy tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleUpgradeVIP(property.id)}>
          <Zap size={18} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>VIP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/post?id=${property.id}`)}>
          <Edit size={18} color="#3B82F6" />
          <Text style={[styles.actionText, { color: '#3B82F6' }]}>Sửa</Text>
        </TouchableOpacity>

        {property.is_hidden ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShow(property.id)}>
            <EyeOff size={18} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Hiện</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleHide(property.id)}>
            <EyeOff size={18} color="#6B7280" />
            <Text style={[styles.actionText, { color: '#6B7280' }]}>Ẩn</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(property.id)}>
          <Trash2 size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>

      {!property.is_hidden && property.is_published && (
        <View style={styles.expiryInfo}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.expiryText}>
            Hết hạn: {property.expire_at ? new Date(property.expire_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}
          </Text>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Vui lòng đăng nhập để xem tin đăng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Đang hiển thị {activeTab === 'active' ? `(${totalCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'hidden' && styles.tabActive]}
          onPress={() => setActiveTab('hidden')}
        >
          <Text style={[styles.tabText, activeTab === 'hidden' && styles.tabTextActive]}>
            Đã ẩn {activeTab === 'hidden' ? `(${totalCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'expired' && styles.tabActive]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[styles.tabText, activeTab === 'expired' && styles.tabTextActive]}>
            Hết hạn {activeTab === 'expired' ? `(${totalCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {(isLoading || isFetching) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải tin đăng...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <PropertyCard property={item} isFavorite={favorites.includes(item.id)} />
              {renderActions(item)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'active' && 'Chưa có tin đang hiển thị'}
                {activeTab === 'hidden' && 'Chưa có tin nào bị ẩn'}
                {activeTab === 'expired' && 'Chưa có tin nào hết hạn'}
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={() => router.push('/post')}>
                <Text style={styles.createButtonText}>Đăng tin ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Styles giữ nguyên
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
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#EF4444',
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '600',
  },
});