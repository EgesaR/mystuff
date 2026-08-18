// ~/types/notification.ts

export type NotificationType =
  | "system_alert"
  | "invite"
  | "product_update"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "mention"
  | "new_message"
  | "comment"
  | "share_invite";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  archived: boolean;
  recipient_id: string;
  sender_id: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnreadCountResponse {
  count: number;
}

export type BulkNotificationActionType =
  "read" | "archive" | "unarchive" | "delete";

export interface BulkNotificationAction {
  ids: string[];
  action: BulkNotificationActionType;
}
