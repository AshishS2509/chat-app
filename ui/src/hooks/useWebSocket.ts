import { useRef, useCallback } from "react";
import { useUserStatus } from "./useUserStatus";

export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const { setConnected } = useUserStatus();

  const connect = useCallback(() => {
    if (socketRef.current) return;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
      } catch {
        //
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
      socketRef.current = null;

      reconnectTimeout.current = setTimeout(() => {
        // eslint-disable-next-line react-hooks/immutability
        connect();
      }, 3000);
    };
  }, [setConnected, url]);

  const sendMessage = useCallback((data: object) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    socketRef.current.send(JSON.stringify(data));
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
  }, []);

  return {
    // messages,
    sendMessage,
    reconnect: connect,
    connect,
    disconnect,
  };
}
