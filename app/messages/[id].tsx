import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, SendHorizontal } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWebSocket, MESSAGE_TYPES } from "@/hooks/use-websocket";
import { useMeQuery } from "@/store/api/auth";
import { useCreateMessageMutation } from "@/store/api/messages";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id: conversationId } = useLocalSearchParams();

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { data: me } = useMeQuery();
  const [createMessage, { error }] = useCreateMessageMutation();
  const { data, fetchCollection } = useWebSocket(handleWS);

  // ---- Conversation từ websocket ----
  const conversation = useMemo(() => {
    return data?.conversations?.find((c) => c.id === conversationId);
  }, [data?.conversations, conversationId]);

  const headerPartner = useMemo(() => {
    if (!conversation || !me?.user?.id) return null;
    return conversation.participants?.find((p: any) => p.id !== me.user.id);
  }, [conversation, me]);

  // ---- Messages của conversation ----
  const messages =
    data?.messages
      ?.filter((m) => {
        const conv =
          typeof m.conversation === "string"
            ? m.conversation
            : m.conversation?.id;
        return conv === conversationId;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      ) ?? [];

  // ---- Fetch initial messages ----
  useEffect(() => {
    if (!conversationId) return;

    fetchCollection("messages", {
      limit: 200,
      sort: "createdAt",
      where: { conversation: { equals: conversationId } },
      depth: 2,
    });
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  // ---- HANDLE REALTIME ----
  function handleWS(event: string, payload: any) {
    if (event !== MESSAGE_TYPES.COLLECTION_CHANGED) return;
    if (payload.collection !== "messages") return;

    const msg = payload.doc;
    const convId =
      typeof msg.conversation === "string"
        ? msg.conversation
        : msg.conversation?.id;

    if (convId !== conversationId) return;

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }

  // ---- SEND MESSAGE ----
  async function sendMessage() {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    try {
      const res = await createMessage({
        conversation: conversationId as string,
        sender: me?.user,
        text,
      }).unwrap();

    } catch (err) {
    }
  }


  // ---- BUBBLE UI ----
  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.sender?.id === me?.user?.id;

    const avatar =
      !isMine && item.sender?.avatar?.url
        ? process.env.EXPO_PUBLIC_API_URL + item.sender.avatar.url
        : null;

    const createdAt = item.createdAt
      ? new Date(item.createdAt)
      : new Date(); // fallback tránh Invalid Date

    return (
      <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
        {!isMine && avatar && (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        )}

        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={isMine ? styles.msgMine : styles.msgTheir}>{item.text}</Text>

          <Text style={isMine ? styles.timeMine : styles.timeTheir}>
            {createdAt.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: headerPartner?.name || "Đoạn chat",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nhập tin nhắn..."
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholderTextColor="#6B7280"
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <SendHorizontal size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },

  row: { flexDirection: "row", marginVertical: 6 },
  rowLeft: { flexDirection: "row", alignItems: "flex-start", marginRight: 40 },
  rowRight: { flexDirection: "row-reverse", alignItems: "flex-end", marginLeft: 40 },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    backgroundColor: "#CCC",
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
  },

  myBubble: { backgroundColor: "#007AFF", borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: "#E5E7EB", borderBottomLeftRadius: 4 },

  msgMine: { color: "#FFF", fontSize: 15 },
  msgTheir: { color: "#000", fontSize: 15 },

  timeMine: { color: "#FFF", fontSize: 10, marginTop: 4, textAlign: "right" },
  timeTheir: { color: "#555", fontSize: 10, marginTop: 4, textAlign: "right" },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#DDD",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F3F5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
  },

  sendBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    marginLeft: 10,
    borderRadius: 20,
  },
});
