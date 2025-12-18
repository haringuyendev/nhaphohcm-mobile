import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, SendHorizontal, RotateCcw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWebSocket, MESSAGE_TYPES } from "@/hooks/use-websocket";
import { useCreateMessageMutation } from "@/store/api/messages";
import { Image } from "expo-image";
import { Media } from "@/types";
import { useUser } from "@/hooks/use-user";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id: conversationId } = useLocalSearchParams();

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]); // TRẠNG THÁI MỚI
  const flatListRef = useRef<FlatList>(null);
  const {user:me}=useUser()
  const [createMessage] = useCreateMessageMutation();
  const { data, fetchCollection } = useWebSocket(handleWS);

  // ---- Conversation via WS ----
  const conversation = useMemo(() => {
    return data?.messages?.[0]?.conversation;
  }, [data?.messages]);


  const headerPartner = useMemo(() => {
    if (!conversation || !me?.id) return null;
    const partner = conversation?.participants?.find((p: any) => p.id !== me?.id);
    return partner;
  }, [conversation, me]);

  // ---- Messages from WS ----
  const wsMessages = useMemo(() => {
    if (!data?.messages) return [];

    return data.messages
      .filter((m) => {
        const convId =
          typeof m.conversation === "string"
            ? m.conversation
            : m.conversation?.id;
        return convId === conversationId;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
  }, [data?.messages, conversationId]);


  // MERGE WS + LOCAL
  const mergedMessages = useMemo(() => [...wsMessages, ...localMessages], [wsMessages, localMessages]);

  // ---- Fetch messages on load ----
  useEffect(() => {
    if (!conversationId) return;

    fetchCollection("messages", {
      limit: 200,
      sort: "createdAt",
      where: { conversation: { equals: conversationId } },
      depth: 2,
    });
  }, [conversationId, fetchCollection]);

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [mergedMessages]);

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

    // Khi server trả về message thật → xoá localMessage tương ứng
    setLocalMessages((prev) =>
      prev.filter((m) => m.temp === false || m.text !== msg.text)
    );

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }

  // ---- SEND MESSAGE WITH OPTIMISTIC UI ----
  async function sendMessage() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    const tempId = "temp-" + Math.random().toString(36).slice(2);

    // 1) Add temporary message (UI kh không lag)
    setLocalMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text,
        sender: me,
        createdAt: new Date().toISOString(),
        conversation: conversationId,
        temp: true,
        status: "sending",
      },
    ]);

    try {
      await createMessage({
        conversation: conversationId as string,
        sender: me!,
        text,
      }).unwrap();

      // 2) Set trạng thái thành "sent"
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: "sent" }
            : m
        )
      );
    } catch (err: any) {
      // 3) Set trạng thái failed
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: "failed" }
            : m
        )
      );
    }
  }

  // ---- Retry button ----
  function retryMessage(msg: any) {
    setLocalMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: "sending" } : m
      )
    );

    createMessage({
      conversation: conversationId as string,
      sender: me!,
      text: msg.text,
    })
      .unwrap()
      .then(() => {
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: "sent" } : m
          )
        );
      })
      .catch(() => {
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: "failed" } : m
          )
        );
      });
  }

  // ---- MESSAGE UI ----
  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.sender?.id === me?.id;

    const avatar =
      !isMine && item.sender?.avatar?.url
        ? process.env.EXPO_PUBLIC_API_URL + item.sender.avatar.url
        : null;

    const createdAt = item.createdAt
      ? new Date(item.createdAt)
      : new Date();

    return (
      <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
        {!isMine && avatar && (
          <Image source={{ uri: avatar }} style={styles.avatar}
            contentFit="cover"
            placeholderContentFit="cover"
            placeholder={((avatar as Media)?.blurhash) || "LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
          />
        )}

        <View
          style={[
            styles.bubble,
            isMine ? styles.myBubble : styles.theirBubble,
            item.status === "sending" && { opacity: 0.5 },
            item.status === "failed" && { backgroundColor: "#fee2e2" },
          ]}
        >
          <Text style={isMine ? styles.msgMine : styles.msgTheir}>
            {item.text}
          </Text>

          <Text style={isMine ? styles.timeMine : styles.timeTheir}>
            {item.status === "sending"
              ? "Đang gửi…"
              : item.status === "failed"
                ? "Gửi thất bại"
                : createdAt.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </Text>

          {item.status === "failed" && (
            <TouchableOpacity
              onPress={() => retryMessage(item)}
              style={{ marginTop: 4 }}
            >
              <RotateCcw size={16} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: headerPartner?.name || "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={mergedMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#6B7280"
            value={input}
            onChangeText={setInput}
            style={styles.input}
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
