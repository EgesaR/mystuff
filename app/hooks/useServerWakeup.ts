import { useEffect } from "react";
import { ENDPOINTS } from "~/lib/api/endpoints";
import { apiFetch } from "~/lib/api/client";

export function useServerWakeup() {
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function wakeUp() {
      try {
        const res = await apiFetch(ENDPOINTS.health, {
          signal: controller.signal,
        });

        if (cancelled) return;

        if (!res) {
          console.log("Waking up backend server...");
          return;
        }

        // Tell TypeScript this is a Response
        const data = await (res as Response).json().catch(() => null);

        if (cancelled) return;

        if (data?.status === "degraded") {
          console.warn("Backend is awake but database connection failed");
        } else {
          console.log("Backend is awake and ready.");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.log("Waking up backend server...");
      }
    }

    wakeUp();

    return () => {
      cancelled = true;
      controller.abort(); // also abort the request on unmount
    };
  }, []);
}
