// components/community/skeletons/PostCardSkeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export const PostCardSkeleton = () => {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.headerText}>
          <View style={styles.communityName} />
          <View style={styles.authorName} />
        </View>
      </View>
      <View style={styles.title} />
      <View style={styles.contentLine1} />
      <View style={styles.contentLine2} />
      <View style={styles.imagePlaceholder} />
      <View style={styles.actions}>
        <View style={styles.actionItem} />
        <View style={styles.actionItem} />
        <View style={styles.actionItem} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12, borderRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#E5E7EB' },
  headerText: { marginLeft: 10, flex: 1 },
  communityName: { height: 16, width: '50%', backgroundColor: '#E5E7EB', borderRadius: 6 },
  authorName: { height: 14, width: '40%', backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 6 },
  title: { height: 20, width: '80%', backgroundColor: '#E5E7EB', borderRadius: 8, marginBottom: 8 },
  contentLine1: { height: 14, width: '100%', backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 6 },
  contentLine2: { height: 14, width: '90%', backgroundColor: '#E5E7EB', borderRadius: 6 },
  imagePlaceholder: { height: 200, width: '100%', backgroundColor: '#E5E7EB', borderRadius: 12, marginVertical: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionItem: { height: 32, width: 80, backgroundColor: '#E5E7EB', borderRadius: 8 },
});