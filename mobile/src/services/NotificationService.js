import * as ApiService from "./ApiService";

/**
 * In-app notifications (sharing events) from the Flask backend — the mobile
 * counterpart of the web NotificationBell. Returns
 * { unread_count, notifications: [{id, message, document_id, is_read, created_at}] }.
 */
export async function getNotifications() {
  return ApiService.get("/notifications");
}

export async function markRead(notificationId) {
  return ApiService.put(`/notifications/${notificationId}/read`, {});
}

export async function markAllRead() {
  return ApiService.put("/notifications/read-all", {});
}
