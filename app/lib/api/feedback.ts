import { apiFetch } from "~/lib/http.client";
import type {
  Feedback,
  FeedbackCreateInput,
  FeedbackStatus,
} from "~/types/feedback";

const BASE = "/api/feedback";

export async function submitFeedback(
  input: FeedbackCreateInput,
): Promise<Feedback> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

export async function listAllFeedback(): Promise<Feedback[]> {
  const res = await apiFetch(BASE);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<Feedback> {
  const res = await apiFetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}
