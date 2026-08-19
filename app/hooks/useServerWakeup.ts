import { useEffect } from "react";
import { ENDPOINTS } from "~/lib/endpoints";
import { apiFetch } from "~/lib/http/client";

export function useServerWakeup() {
  useEffect(() => {
    apiFetch(`${import.meta.env.VITE_API_URL || ""}${ENDPOINTS.health}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "degraded") {
          console.warn("Backend is awake but database connection failed");
        } else {
          console.log("Backend is awake and ready.");
        }
      })
      .catch(() => {
        console.log("Waking up backend server...");
      });
  }, []);
}
