import { apiFetch } from "~/lib/http.client";
import type {
  Feedback,
  FeedbackCreateInput,
  FeedbackStatus,
} from "~/types/feedback";
import { ENDPOINTS } from "../endpoint";

const BASE = ENDPOINTS.feedback.root;

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err.detail ?? err.message ?? "Request failed");
    } catch {
      throw new Error(res.statusText);
    }
  }

  return res.json() as Promise<T>;
}

export async function submitFeedback(
  input: FeedbackCreateInput,
): Promise<Feedback> {
  return parseResponse(
    await apiFetch(BASE, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export async function listAllFeedback(): Promise<Feedback[]> {
  return parseResponse(await apiFetch(BASE));
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<Feedback> {
  return parseResponse(
    await apiFetch(`${BASE}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );
}
