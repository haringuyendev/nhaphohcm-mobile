import { Tabs, useRouter } from "expo-router";
import { Home, Search, FileText, User, Users, Plus } from "lucide-react-native";
import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";

export default function TabLayout() {
  const router = useRouter();

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
            marginBottom: 24,
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
        name="search"
        options={{
          title: "Tìm kiếm",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          headerShown:false,
          title: "Cộng đồng",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
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
        <Tabs.Screen
          name="post"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/post' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonInner}>
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 95 : 85,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
