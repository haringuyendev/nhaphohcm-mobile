// hooks/use-websocket.ts
import { useMeQuery } from "@/store/api/auth";
import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export const MESSAGE_TYPES = {
  FETCH_COLLECTION: "FETCH_COLLECTION",
  COLLECTION_DATA: "COLLECTION_DATA",
  COLLECTION_CHANGED: "COLLECTION_CHANGED",
};

export type WSStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "failed";

export function useWebSocket(onEvent?: (event: string, payload: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { data: userData } = useMeQuery();
  const userId = userData?.user?.id;

  const [status, setStatus] = useState<WSStatus>("disconnected");
  const [data, setData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      path: "/socket.io",
      transports: ["websocket"],
    });

    socketRef.current = socket;
    setStatus("connecting");

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("JOIN_USER", userId);
    });

    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("error"));

    socket.onAny((event, payload) => {
      // Trả event raw ra ngoài để screen xử lý
      onEvent?.(event, payload);

      // Merge hậu kỳ vào data
      if (event === MESSAGE_TYPES.COLLECTION_DATA) handleCollectionData(payload);
      if (event === MESSAGE_TYPES.COLLECTION_CHANGED)
        handleCollectionChanged(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // ---- Handler: collection data ----
  const handleCollectionData = useCallback((payload: any) => {
    const col = payload?.collection;
    const docs = payload?.docs ?? [];
    if (!col) return;

    setData((prev) => ({
      ...prev,
      [col]: docs,
    }));
  }, []);

  // ---- Handler: collection changed ----
  const handleCollectionChanged = useCallback((msg: any) => {
    const col = msg.collection;
    if (!col) return;

    setData((prev) => {
      const arr = prev[col] ?? [];
      const idx = arr.findIndex((i) => i.id === msg.doc.id);

      if (msg.operation === "create") {
        if (idx !== -1) return prev;
        return { ...prev, [col]: [...arr, msg.doc] };
      }

      if (msg.operation === "update") {
        if (idx !== -1) {
          const updated = [...arr];
          updated[idx] = msg.doc;
          return { ...prev, [col]: updated };
        }
        return { ...prev, [col]: [...arr, msg.doc] };
      }

      if (msg.operation === "delete") {
        return {
          ...prev,
          [col]: arr.filter((i) => i.id !== msg.doc.id),
        };
      }

      return prev;
    });
  }, []);

  const fetchCollection = useCallback((collection: string, config: any = {}) => {
    socketRef.current?.emit(MESSAGE_TYPES.FETCH_COLLECTION, {
      col: collection,
      ...config,
    });
  }, []);

  return {
    socket: socketRef.current,
    status,
    fetchCollection,
    data,
  };
}
