import { RealEstateToast } from '@/components/RealEstateToast';
import { store, useAppDispatch } from '@/store';
import { loadAppData } from '@/store/slices/app';
import {
  registerForPushNotificationsAsync,
  registerPushTokenToBackend,
} from '@/utils/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const [pushToken, setPushToken] = useState<string | null>(null);

  // 1) Lấy push token khi app mở
  useEffect(() => {
    const registerToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) setPushToken(token);
    };

    registerToken();
  }, []);

  // 2) Khi token thay đổi → gửi lên backend
  useEffect(() => {
    if (!pushToken) return;

    const saveToken = async () => {
      await registerPushTokenToBackend(pushToken);
    };

    saveToken();
  }, [pushToken]);

  // 3) Load app data
  useEffect(() => {
    dispatch(loadAppData());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerBackTitle: 'Quay lại' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="property/[id]"
        options={{ headerShown: true, headerTitle: '' }}
      />
      <Stack.Screen
        name="community/[id]"
        options={{ headerShown: true, headerTitle: '' }}
      />
      <Stack.Screen
        name="editpost/[id]"
        options={{ headerShown: true, headerTitle: '' }}
      />
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true, // Phát âm thanh
      shouldSetBadge: true, // Set badge icon
      shouldShowBanner: true, // Bắt buộc trên iOS 17+
      shouldShowList: true, // Bắt buộc trên iOS Notification List
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GestureHandlerRootView>
          <RootLayoutNav />
          <Toast
            config={{
              realEstateSuccess: ({ text1, text2 }) => (
                <RealEstateToast
                  type="success"
                  text1={String(text1)}
                  text2={String(text2)}
                />
              ),
              realEstateRemoved: ({ text1, text2 }) => (
                <RealEstateToast
                  type="removed"
                  text1={String(text1)}
                  text2={String(text2)}
                />
              ),
              realEstateError: ({ text1, text2 }) => (
                <RealEstateToast
                  type="error"
                  text1={String(text1)}
                  text2={String(text2)}
                />
              ),
            }}
          />
        </GestureHandlerRootView>
      </Provider>
    </QueryClientProvider>
  );
}
