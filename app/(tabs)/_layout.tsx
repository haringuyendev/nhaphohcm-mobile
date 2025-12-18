import { useSession } from "@/hooks/use-session";
import { Redirect, Tabs } from "expo-router";
import { Home, FileText, User, Users, PlusCircle } from "lucide-react-native";
import React from "react";
import { View } from "react-native";


export default function TabLayout() {
  const { tokenChecked, token, isAuthenticated } = useSession();
  
  if (!tokenChecked) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#EF4444',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600' as const,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="community"
          options={{
            title: "Cộng đồng",
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: "Đăng tin",
            headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
            tabBarIcon: ({ color }) => (
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#EF4444',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <PlusCircle color="#FFFFFF" size={28} />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="myposts"
          options={{
            title: "Tin của tôi",
            tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}
