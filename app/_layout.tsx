import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { loadAppData } from "@/store/slices/app";
import { useMeQuery } from "@/store/api/auth";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync, registerPushTokenToBackend } from "@/utils/notifications";

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
    <Stack screenOptions={{ headerBackTitle: "Quay lại" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: true, headerTitle: "" }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: true, headerTitle: "" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,   // Phát âm thanh
      shouldSetBadge: true,    // Set badge icon
      shouldShowBanner: true,  // Bắt buộc trên iOS 17+
      shouldShowList: true,    // Bắt buộc trên iOS Notification List
    }),
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </Provider>
    </QueryClientProvider>
  );
}
