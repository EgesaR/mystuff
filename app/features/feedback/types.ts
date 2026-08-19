export type FeedbackCategory = "bug" | "feature" | "general" | "praise";
export type FeedbackStatus = "new" | "reviewed" | "resolved";

export interface FeedbackUserSummary {
  id: string;
  username: string;
  email: string;
}

export interface Feedback {
  id: string;
  message: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  user: FeedbackUserSummary;
  created_at: string;
}

export interface FeedbackCreateInput {
  message: string;
  category: FeedbackCategory;
}
