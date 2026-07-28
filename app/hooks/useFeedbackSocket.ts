import { useEffect, useRef } from "react";
import type { Feedback } from "~/types/feedback";

export function useFeedbackSocket(onNewFeedback: (feedback: Feedback) => void) {
  const callbackRef = useRef(onNewFeedback);
  callbackRef.current = onNewFeedback;

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws/feedback`,
    );

    socket.onmessage = (event) => {
      try {
        callbackRef.current(JSON.parse(event.data) as Feedback);
      } catch (err) {
        console.error("Failed to parse feedback socket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("Feedback socket error:", err);
    };

    return () => socket.close();
  }, []);
}
