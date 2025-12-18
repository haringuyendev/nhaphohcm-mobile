// MessagesScreen.tsx (FULL CODE FIXED)

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Search, ArrowLeft, MessageSquare } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useWebSocket, MESSAGE_TYPES } from "@/hooks/use-websocket";
import { Conversation, Media, Message, User } from "@/types";
import { ConversationSkeleton } from "@/components/Skeleton/ConversationSkeleton";
import { useUser } from "@/hooks/use-user";

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const {user:me}=useUser()
  const userId = me?.id;

  const lastConversationsRef = useRef<Record<string, Conversation>>({});

  const { data, fetchCollection, loading, connected } = useWebSocket(handleWebsocketEvent);

  const fetchConversationList = useCallback((q: string) => {
    if (!userId || !connected) return;

    let where: any = {
      participants: { contains: userId },
    };

    if (q.trim()) {
      where = {
        and: [
          { "participants.id": { contains: userId } },
          {
            or: [
              { title: { contains: q } },
              { "lastMessage.text": { contains: q } },
              { "participants.name": { contains: q } },
            ],
          },
        ],
      };
    }

    fetchCollection("conversations", {
      limit: 50,
      sort: "-updatedAt",
      where,
      depth: 2,
    });
  }, [fetchCollection, userId, connected]);

  const conversations = useMemo(() => data?.conversations ?? [], [data?.conversations]);

  useEffect(() => {
    conversations.forEach((c: Conversation) => {
      lastConversationsRef.current[c.id] = c;
    });
  }, [conversations]);

  function handleConversationChanged(conv: Conversation) {
    const id = conv.id;

    const lastState = lastConversationsRef.current[id];
    lastConversationsRef.current[id] = conv;

    if (!lastState) return;

    const oldTime = (lastState?.lastMessage as any)?.updatedAt;
    const newTime = (conv?.lastMessage as any)?.updatedAt;

    if (!newTime || newTime === oldTime) return;
  }

  function handleWebsocketEvent(event: string, payload: any) {
    if (event !== MESSAGE_TYPES.COLLECTION_CHANGED) return;

    if (payload.collection === "conversations") {
      handleConversationChanged(payload.doc);
    }
  }

  const getTimeAgo = (date: string) => {
    const d = new Date(date);
    const diffMin = (Date.now() - d.getTime()) / 60000;

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${Math.floor(diffMin)} phút`;
    const h = diffMin / 60;
    if (h < 24) return `${Math.floor(h)} giờ`;
    return `${Math.floor(h / 24)} ngày`;
  };

  const renderItem = ({ item: conv }: { item: Conversation }) => {
    const partner: User = conv?.participants?.find(
      (v: any) => v.id !== me?.id
    ) as User;

    const avatar =
      typeof partner === "object"
        ? process.env.EXPO_PUBLIC_API_URL + (partner.avatar as any)?.url
        : undefined;

    const lastMsg = conv.lastMessage as Message;

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => router.push(`/messages/${conv.id}`)}
      >
        <Image source={{ uri: avatar }} style={styles.avatar}
          contentFit="cover"
          placeholderContentFit="cover"
          placeholder={((avatar as Media)?.blurhash) || "LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
        />

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName}>
              {conv.isGroup ? conv.title : partner?.name || "Cuộc trò chuyện"}
            </Text>
            <Text style={styles.timestamp}>
              {lastMsg?.updatedAt ? getTimeAgo(lastMsg.updatedAt) : ""}
            </Text>
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMsg.text || "Chưa có tin nhắn"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageSkeleton = () => (
    <FlatList
      data={[1, 2, 3, 4, 5, 6]}
      keyExtractor={(i) => `sk-${i}`}
      renderItem={() => <ConversationSkeleton />}
      contentContainerStyle={{ paddingTop: 8 }}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MessageSquare size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu nhắn tin để hiển thị cuộc trò chuyện ở đây.
      </Text>

      <TouchableOpacity
        onPress={() => fetchConversationList("")}
        style={styles.refreshBtn}
      >
        <Text style={styles.refreshText}>Làm mới</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchConversationList(searchQuery);
    }, 350);

    return () => clearTimeout(timeout);
  }, [fetchConversationList, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
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

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đoạn chat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {!connected || loading ? (
        renderMessageSkeleton()
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  searchContainer: { padding: 16, backgroundColor: "#FFF" },

  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  searchInput: { flex: 1, fontSize: 15, color: "#111" },

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

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  refreshBtn: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshText: { color: "#FFF", fontSize: 15 },
});
