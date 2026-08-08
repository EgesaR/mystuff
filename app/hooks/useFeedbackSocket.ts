import { useCallback, useEffect, useRef, useState } from "react";
import { ENDPOINTS } from "~/lib/endpoint";
import type { Feedback } from "~/types/feedback";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseFeedbackSocketOptions {
  /** Called whenever a new feedback item arrives */
  onNewFeedback: (feedback: Feedback) => void;
  /** Only connect when true */
  enabled?: boolean;
}
export function useFeedbackSocket({
  onNewFeedback,
  enabled = true,
}: UseFeedbackSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const callbackRef = useRef(onNewFeedback);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const shouldReconnect = useRef(true);

  // Keep callback fresh without re-creating the socket
  callbackRef.current = onNewFeedback;

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
    if (!enabled) return;
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    )
      return;

    setStatus("connecting");

    // Prefer same-origin so Vite proxy + cookies work in development
    // Fall back to VITE_WS_URL only if you explicitly need a different host.
    const wsBase =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === "https:" ? "wss:" : "ws"}//${window.location.host}`;

    const socket = new WebSocket(`${wsBase}${ENDPOINTS.feedback.ws}`);

    socket.onopen = () => {
      setStatus("connected");
      shouldReconnect.current = true;

      // Application-level heartbeat
      heartbeatRef.current = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 25_000);
    };

    socket.onmessage = (event) => {
      // Ignore heartbeat responses
      if (event.data === "pong") return;

      try {
        const data = JSON.parse(event.data) as Feedback;
        callbackRef.current(data);
      } catch (err) {
        console.error("Invalid feedback message", err);
      }
    };

    socket.onclose = (event) => {
      clearTimers();
      wsRef.current = null;

      // 1008 = Policy Violation → auth/authorization failed
      if (event.code === 1008) {
        shouldReconnect.current = false;
        setStatus("error");
        console.warn("WebSocket closed: authentication failed");
        return;
      }
      setStatus("disconnected");

      if (shouldReconnect.current && enabled) {
        reconnectRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socket.onerror = () => {
      // onclose will fire afterwards
      setStatus("error");
    };
  }, [enabled, clearTimers]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    clearTimers();
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      wsRef.current.close();
    }
    wsRef.current = null;
    setStatus("disconnected");
  }, [clearTimers]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      shouldReconnect.current = false;
      clearTimers();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect, disconnect, clearTimers]);

  return { status, connect, disconnect };
}
