import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Thin JSON wrapper around AsyncStorage. All NeverExpire keys are namespaced
 * under STORAGE_KEYS so they're easy to find/clear together (e.g. on logout
 * during testing).
 */

const NAMESPACE = "@neverexpire";

export const STORAGE_KEYS = {
  CURRENT_USER: `${NAMESPACE}:currentUser`,
  FAMILY_MEMBERS: `${NAMESPACE}:familyMembers`,
  DOCUMENTS: `${NAMESPACE}:documents`,
};

export async function getItem(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`StorageService.getItem(${key}) failed`, error);
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`StorageService.setItem(${key}) failed`, error);
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`StorageService.removeItem(${key}) failed`, error);
  }
}
