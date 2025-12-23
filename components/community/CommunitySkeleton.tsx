// components/community/skeletons/FollowedGroupsSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export const FollowedGroupsSkeleton = () => {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.titleSkeleton} />
      {[1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.textContainer}>
            <View style={styles.nameSkeleton} />
            <View style={styles.memberSkeleton} />
          </View>
        </View>
      ))}
      <View style={{ height: 16 }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF' },
  titleSkeleton: { height: 20, width: 180, backgroundColor: '#E5E7EB', borderRadius: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatarSkeleton: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#E5E7EB' },
  textContainer: { marginLeft: 10, flex: 1 },
  nameSkeleton: { height: 16, width: '60%', backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 6 },
  memberSkeleton: { height: 14, width: '40%', backgroundColor: '#E5E7EB', borderRadius: 6 },
});