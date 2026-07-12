import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import * as StorageService from "./StorageService";
import { getDocumentTypeMeta } from "../constants/documentTypes";
import { EXPIRY_STATUS, getExpiryStatus } from "../utils/dateUtils";

/**
 * Local (on-device) scheduled notifications for document expiry — works
 * fully inside Expo Go with zero backend/APNs/FCM infrastructure, unlike
 * remote push. Covers "remind me before my documents expire" even when the
 * app is closed; it does NOT cover server-side events like a new share
 * arriving (that needs real push — see mobile/CLAUDE.md).
 *
 * Only documents already flagged "expiring soon" or "expired" are
 * scheduled (bounded volume — iOS caps an app at 64 pending local
 * notifications). The schedule is fully replaced on every sync rather than
 * diffed, which is simple and safe at this data scale.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const IDENTIFIER_PREFIX = "ne-expiry-";
const NOTIFY_HOUR = 9; // fire at 9am local time on the trigger day

// Days-before-expiry to fire, keyed by which Settings toggle controls it.
const REMINDER_OFFSETS_DAYS = [30, 7, 1];
const EXPIRED_OFFSET_DAYS = [0];

const DEFAULT_PREFS = { expiryReminders: true, expiredAlerts: true };

export async function getPreferences() {
  return StorageService.getItem(StorageService.STORAGE_KEYS.NOTIFICATION_PREFS, DEFAULT_PREFS);
}

export async function setPreferences(prefs) {
  await StorageService.setItem(StorageService.STORAGE_KEYS.NOTIFICATION_PREFS, prefs);
}

export async function requestPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("expiry-reminders", {
      name: "Expiry Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

function triggerDateFor(expiryDateStr, offsetDays) {
  const [year, month, day] = expiryDateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - offsetDays);
  date.setHours(NOTIFY_HOUR, 0, 0, 0);
  return date;
}

function titleFor(offsetDays) {
  if (offsetDays === 0) return "Document expired today";
  if (offsetDays === 1) return "Expires tomorrow";
  return `Expires in ${offsetDays} days`;
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Replaces the whole local notification schedule from the current document list. */
export async function syncExpiryNotifications(documents) {
  const prefs = await getPreferences();
  await cancelAll();

  const offsets = [
    ...(prefs.expiryReminders ? REMINDER_OFFSETS_DAYS : []),
    ...(prefs.expiredAlerts ? EXPIRED_OFFSET_DAYS : []),
  ];
  if (offsets.length === 0) return [];

  const granted = await requestPermissions();
  if (!granted) return [];

  const now = new Date();
  const scheduled = [];

  for (const doc of documents) {
    if (!doc.expiryDate) continue;
    const status = getExpiryStatus(doc.expiryDate);
    if (status !== EXPIRY_STATUS.EXPIRING_SOON && status !== EXPIRY_STATUS.EXPIRED) continue;

    const typeMeta = getDocumentTypeMeta(doc.documentType);

    for (const offset of offsets) {
      const fireDate = triggerDateFor(doc.expiryDate, offset);
      if (fireDate <= now) continue;

      const id = await Notifications.scheduleNotificationAsync({
        identifier: `${IDENTIFIER_PREFIX}${doc.id}-${offset}`,
        content: {
          title: titleFor(offset),
          body: `${typeMeta.label} — ${doc.fullName || "Document"}`,
          data: { documentId: doc.id },
          sound: offset === 0,
        },
        trigger: { type: "date", date: fireDate },
      });
      scheduled.push(id);
    }
  }

  return scheduled;
}
