// ~/hooks/useNotificationSocket.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { ENDPOINTS } from "~/lib/endpoints";
import type { NotificationRecord } from "~/types/notification"; // adjust path if needed

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseNotificationSocketOptions {
  /** Called when a new notification arrives */
  onNotification: (notification: NotificationRecord) => void;
  /** Only connect when true */
  enabled?: boolean;
  /** Access token (required in production) */
  token?: string | null;
}

export function useNotificationSocket({
  onNotification,
  enabled = true,
  token,
}: UseNotificationSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const callbackRef = useRef(onNotification);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const shouldReconnect = useRef(true);
  const isMounted = useRef(false);

  // Keep callback fresh without re-creating the socket
  callbackRef.current = onNotification;

  const clearTimers = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !token) return;

    // Prevent multiple sockets
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    setStatus("connecting");

    const wsBase =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

    const url = new URL(
      `${wsBase}${ENDPOINTS.notifications?.ws ?? "/ws/notifications"}`,
    );
    url.searchParams.set("token", token);

    const socket = new WebSocket(url.toString());
    wsRef.current = socket;

    socket.onopen = () => {
      // Component already unmounted → close immediately
      if (!isMounted.current) {
        socket.close();
        return;
      }

      setStatus("connected");
      shouldReconnect.current = true;

      // Heartbeat every 25s
      heartbeatRef.current = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 25_000);
    };

    socket.onmessage = (event) => {
      if (event.data === "pong") return;

      try {
        const data = JSON.parse(event.data) as NotificationRecord;
        callbackRef.current(data);
      } catch (err) {
        console.error("Invalid notification message", err);
      }
    };

    socket.onclose = (event) => {
      clearTimers();
      wsRef.current = null;

      // Auth / permission failure
      if (event.code === 1008) {
        shouldReconnect.current = false;
        setStatus("error");
        console.warn("Notification WebSocket closed: authentication failed");
        return;
      }

      setStatus("disconnected");

      // Auto-reconnect only if still mounted and allowed
      if (shouldReconnect.current && isMounted.current && enabled) {
        reconnectRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socket.onerror = () => {
      setStatus("error");
    };
  }, [enabled, token, clearTimers]);

  useEffect(() => {
    isMounted.current = true;

    if (enabled && token) {
      // Small delay helps with React Strict Mode double-mount
      const timer = window.setTimeout(() => {
        connect();
      }, 80);

      return () => {
        clearTimeout(timer);
        isMounted.current = false;
        shouldReconnect.current = false;
        clearTimers();

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }

    // Not enabled → ensure disconnected
    isMounted.current = false;
    shouldReconnect.current = false;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, [enabled, token, connect, clearTimers]);

  return { status };
}
