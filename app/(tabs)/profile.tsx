import { useUser } from '@/hooks/use-user';
import { useLogoutMutation } from '@/store/api/auth';
import { useGetMyPropertiesByStatusQuery } from '@/store/api/properties';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { ChevronRight, FileText, Heart, HelpCircle, LogOut, Settings, User } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { resolveImageUrl } from '@/utils';
import { Media } from '@/types';
export default function ProfileScreen() {
  const router = useRouter()
  const { user, favorites, loading, stats } = useUser();
  console.log(stats);
  const menuItems = [
    {
      icon: User,
      label: 'Thông tin cá nhân',
      onPress: () => console.log('Profile'),
    },
    {
      icon: Heart,
      label: 'Tin đã lưu',
      count: loading ? 0 : favorites.length,
      onPress: () => router.push('/wishlist'),
    },
    {
      icon: FileText,
      label: 'Lịch sử giao dịch',
      onPress: () => console.log('History'),
    },
    {
      icon: Settings,
      label: 'Cài đặt',
      onPress: () => console.log('Settings'),
    },
    {
      icon: HelpCircle,
      label: 'Trợ giúp & Hỗ trợ',
      onPress: () => console.log('Help'),
    },
  ];
  const [logOut] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logOut();
      await SecureStore.deleteItemAsync("token");
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen
        options={{
          headerTitle: 'Tài khoản',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Image
              source={{
                uri: resolveImageUrl(
                  ((user?.avatar as Media)?.url
                  ) ?? 'https://via.placeholder.com/80x80?text=User',
                ) as string,
              }}
              style={styles.avatar}
              placeholder={
                ((user?.avatar as Media)?.blurhash ||
                'LEHV6nWB2yk8pyo0adR*.7kCMdnj')
              }
              contentFit="cover"
            />
          </View>
          <Text style={styles.name}>
            {user?.name || 'Chưa cập nhật tên'}
          </Text>

          <Text style={styles.phone}>
            {user?.phone || 'Chưa cập nhật số điện thoại'}
          </Text>
          <Text style={styles.phone}>
            {user?.email || 'Chưa cập nhật email'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.published}</Text>
            <Text style={styles.statLabel}>Đang hiển thị</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.vip}</Text>
            <Text style={styles.statLabel}>VIP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Đã đăng</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconContainer}>
                    <Icon size={22} color="#EF4444" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.count !== undefined && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                  )}
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BinhThanhLand v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2024 BinhThanhLand. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#EF4444',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500' as const,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#D1D5DB',
  },
});
