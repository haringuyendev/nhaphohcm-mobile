// components/home/BannerSection.tsx
import { Banner } from '@/components/Banner';
import { mockBanners } from '@/mocks/data';
import React from 'react';
import { View } from 'react-native';

export const BannerSection = () => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Banner banners={mockBanners} />
    </View>
  );
};