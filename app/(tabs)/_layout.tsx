import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, FileText, User } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: 'BinhThanhLand',
        headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        tabBarStyle: {
          height: 84,                    // Tăng chiều cao
          paddingBottom: 28,             // Đẩy icon lên trên Home Indicator
          paddingTop: 12,
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Tìm kiếm theo yêu cầu",
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          headerShown: true,
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
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20, color: '#EF4444' },
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
