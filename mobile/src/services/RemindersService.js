import * as ApiService from "./ApiService";

/**
 * Real backend-tracked reminders (90/30/7-day rules) — the mobile
 * counterpart of web's RemindersPage. Distinct from NotificationService's
 * sharing-activity feed.
 */

export async function getReminders() {
  return ApiService.get("/reminders");
}

export async function dismissReminder(reminderId) {
  return ApiService.put(`/reminders/${reminderId}/dismiss`);
}

/** Triggers the same digest-send admin action web's "Send Reminder Digest Now" button uses. */
export async function sendReminderDigestNow() {
  return ApiService.post("/admin/run-reminder-check");
}
