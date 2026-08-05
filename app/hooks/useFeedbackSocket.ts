import { useEffect, useRef } from "react";
import { ENDPOINTS } from "~/lib/endpoint";
import type { Feedback } from "~/types/feedback";

export function useFeedbackSocket(onNewFeedback: (feedback: Feedback) => void) {
  const callbackRef = useRef(onNewFeedback);

  callbackRef.current = onNewFeedback;

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(
      `${protocol}//${window.location.host}${ENDPOINTS.feedback.ws}`,
    );

    socket.onopen = () => {
      console.log("WebSocket connected!");
    };

    socket.onmessage = (event) => {
      try {
        callbackRef.current(JSON.parse(event.data));
      } catch (error) {
        console.error("Invalid feedback message", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Feedback socket error", error);
    };

    return () => {
      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      )
        socket.close();
    };
  }, []);
}
