import { useEffect, useRef } from "react";
import { getWsUrl } from "~/lib/config";
import type { Feedback } from "~/types/feedback";

export function useFeedbackSocket(onNewFeedback: (feedback: Feedback) => void) {
  const callbackRef = useRef(onNewFeedback);
  callbackRef.current = onNewFeedback;

  useEffect(() => {
    // Use the shared runtime helper so the WS host/port come from the current origin
    const socket = new WebSocket(`${getWsUrl()}/ws/feedback`);

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
