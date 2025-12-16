// MessagesScreen.tsx
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Search, ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMeQuery } from "@/store/api/auth";
import { useWebSocket, MESSAGE_TYPES } from "@/hooks/use-websocket";
import { registerForPushNotificationsAsync, registerPushTokenToBackend, showLocalNotification } from "@/utils/notifications";

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: me } = useMeQuery();

  // ---- Lưu trạng thái cũ để detect new message ----
  const lastConversationsRef = useRef<Record<string, any>>({});

  // ---- WebSocket with event listener ----
  const { data, fetchCollection } = useWebSocket(handleWebsocketEvent);

  // ---- Register notification ----
  

  // ---- Fetch conversations ----
  useEffect(() => {
    if (!me?.id) return;
    fetchCollection("conversations", { limit: 50, sort: "-updatedAt" });
  }, [me]);

  const conversations = data?.conversations ?? [];

  // ---- FILTER ----
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const title = c.title?.toLowerCase() || "";
    const msg = c.lastMessage?.text?.toLowerCase() || "";

    return title.includes(q) || msg.includes(q);
  });

  // ------------------------------------------------------------
  // 🔥 Khi socket trả event COLLECTION_CHANGED → detect new message
  // ------------------------------------------------------------
  function handleWebsocketEvent(event: string, payload: any) {
    if (event !== MESSAGE_TYPES.COLLECTION_CHANGED) return;
    if (payload.collection !== "conversations") return;

    const conv = payload.doc;
    const id = conv.id;

    const lastState = lastConversationsRef.current[id];
    lastConversationsRef.current[id] = conv;

    if (!lastState) return; // lần đầu load → skip

    const oldMsgTime = lastState?.lastMessage?.updatedAt;
    const newMsgTime = conv?.lastMessage?.updatedAt;

    if (!newMsgTime || newMsgTime === oldMsgTime) return;

    // ---- Không notify nếu chính mình gửi ----
    const senderId =
      typeof conv.lastMessage.sender === "string"
        ? conv.lastMessage.sender
        : conv.lastMessage.sender?.id;

    if (senderId === me?.id) return;

    // ---- SHOW NOTIFICATION ----
    showLocalNotification(
      conv.title || "Tin nhắn mới",
      conv.lastMessage?.text || "Bạn có tin nhắn mới."
    );
  }

  const getTimeAgo = (date: string) => {
    const d = new Date(date);
    const diffMin = (Date.now() - d.getTime()) / 60000;

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${Math.floor(diffMin)} phút`;
    const hours = diffMin / 60;
    if (hours < 24) return `${Math.floor(hours)} giờ`;
    const days = hours / 24;
    return `${Math.floor(days)} ngày`;
  };

  const renderItem = ({ item:conv }:{item:any}) => {
    const avatar =
      typeof conv.participants?.[0] === "object"
        ? conv.participants[0].avatar?.url
        : undefined;

    return (
      <TouchableOpacity style={styles.messageItem}>
        <Image source={{ uri: avatar.url }} style={styles.avatar} />

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName}>{conv.title}</Text>
            <Text style={styles.timestamp}>
              {conv.lastMessage?.updatedAt ? getTimeAgo(conv.lastMessage.updatedAt) : ""}
            </Text>
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {conv.lastMessage?.text || "Chưa có tin nhắn"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Tin nhắn",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

// ---------------------- STYLES -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  searchContainer: { padding: 16, backgroundColor: "#FFF" },
  searchInputWrapper: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  searchInput: { flex: 1 },
  messageItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  messageContent: { flex: 1 },
  messageHeader: { flexDirection: "row", justifyContent: "space-between" },
  userName: { fontSize: 16, fontWeight: "600" },
  timestamp: { fontSize: 13, color: "#9CA3AF" },
  lastMessage: { marginTop: 4, fontSize: 14, color: "#555" },
});
