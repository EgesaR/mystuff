import type { Feedback, FeedbackCategory, FeedbackStatus } from "~/types/feedback";

export async function submitFeedback(payload: {
  message: string;
  category: FeedbackCategory;
}) {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to submit feedback");
  }

  return (await res.json()) as Feedback;
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  const res = await fetch(`/api/feedback/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update feedback status");
  }

  return (await res.json()) as Feedback;
}
