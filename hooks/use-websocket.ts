// hooks/use-websocket.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./use-user";

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
  const {user:me}=useUser() 
  const userId = me?.id;

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<WSStatus>("disconnected");

  const [data, setData] = useState<Record<string, any[]>>({});

  // -------------------------------
  // INIT SOCKET
  // -------------------------------
  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;
    setStatus("connecting");

    // CONNECT
    socket.on("connect", () => {
      setStatus("connected");
      setConnected(true);
      socket.emit("JOIN_USER", userId);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
      setConnected(false);
      setLoading(true); // important: show skeleton again
    });

    socket.on("connect_error", () => {
      setStatus("error");
    });

    // GLOBAL EVENT HANDLER
    socket.onAny((event, payload) => {
      onEvent?.(event, payload);

      if (event === MESSAGE_TYPES.COLLECTION_DATA)
        handleCollectionData(payload);

      if (event === MESSAGE_TYPES.COLLECTION_CHANGED)
        handleCollectionChanged(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // -------------------------------
  // COLLECTION DATA
  // -------------------------------
  const handleCollectionData = useCallback((payload: any) => {
    const col = payload?.collection;
    if (!col) return;

    const docs = payload?.docs ?? [];

    setData(prev => {
      const current = prev[col] ?? [];
      const changed = JSON.stringify(current) !== JSON.stringify(docs);
      if (!changed) return prev;

      return { ...prev, [col]: docs };
    });

    setLoading(false);
  }, []);

  // -------------------------------
  // COLLECTION CHANGE
  // -------------------------------
  const handleCollectionChanged = useCallback((msg: any) => {
    const col = msg.collection;
    if (!col) return;

    setData(prev => {
      const arr = prev[col] ?? [];
      const index = arr.findIndex(i => i.id === msg.doc.id);

      let next = arr;

      if (msg.operation === "create") {
        if (index !== -1) return prev;
        next = [...arr, msg.doc];
      }

      if (msg.operation === "update") {
        if (index !== -1) {
          next = [...arr];
          next[index] = msg.doc;
        } else {
          next = [...arr, msg.doc];
        }
      }

      if (msg.operation === "delete") {
        next = arr.filter(i => i.id !== msg.doc.id);
      }

      return { ...prev, [col]: next };
    });
  }, []);

  // -------------------------------
  // FETCH COLLECTION
  // -------------------------------
  const fetchCollection = useCallback(
    (collection: string, config: any = {}) => {
      if (!connected) return;

      setLoading(true);

      socketRef.current?.emit(MESSAGE_TYPES.FETCH_COLLECTION, {
        col: collection,
        ...config,
      });
    },
    [connected]
  );

  return {
    socket: socketRef.current,
    fetchCollection,
    status,
    connected,
    loading,
    data,
  };
}
