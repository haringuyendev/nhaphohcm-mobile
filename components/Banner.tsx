import { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { Banner as BannerType } from '@/types/property';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

interface BannerProps {
  banners: BannerType[];
}

export function Banner({ banners }: BannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex ? styles.activeDot : styles.inactiveDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  image: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 12,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#EF4444',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
