import { Header } from '@/components/Headers/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { useUser } from '@/hooks/use-user';
import { Stack, useRouter } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const router = useRouter();

  const {
    favoriteProperties,
    loading,
  } = useUser();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        renderItem={({ item }) => (
          <View>
            <PropertyCard
              property={item}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có tin yêu thích nào
              </Text>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/search' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>
                  Thêm tin ngay!
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
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

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '500',
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
