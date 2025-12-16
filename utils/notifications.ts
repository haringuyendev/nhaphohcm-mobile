// utils/notifications.ts
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";

export async function registerPushTokenToBackend(expoPushToken: string) {
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${await SecureStore.getItemAsync("token")}`,
    },
    body: JSON.stringify({ expoPushToken }),
  });
}

export async function registerForPushNotificationsAsync() {
  const permissions = await Notifications.requestPermissionsAsync();
  if (permissions.status !== "granted") return null;

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "5a64aee4-b9ea-4f59-ae8a-abd0770a88df",
    })
  ).data;

  console.log("Expo Push Token:", token);
  return token;
}

export function showLocalNotification(title: string, body: string) {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}
