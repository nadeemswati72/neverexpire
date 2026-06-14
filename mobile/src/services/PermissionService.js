import * as ImagePicker from "expo-image-picker";

/**
 * Centralized permission requests for the Add Document flow. Keeping these
 * in one place means every "Take Photo" / "Choose from Gallery" entry point
 * (Add Document screen, Edit Document, future OCR re-scan) asks the same
 * way and can be swapped out (e.g. for expo-camera) without touching screens.
 *
 * See .claude/skills/mobile-permissions/SKILL.md for usage guidance.
 */

export const PERMISSION_RESULT = {
  GRANTED: "granted",
  DENIED: "denied",
  UNDETERMINED: "undetermined",
};

export async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status;
}

export async function requestMediaLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status;
}

export async function getCameraPermissionStatus() {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return status;
}

export async function getMediaLibraryPermissionStatus() {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return status;
}

/** Ensures camera permission is granted, requesting it if undetermined. */
export async function ensureCameraPermission() {
  const current = await getCameraPermissionStatus();
  if (current === PERMISSION_RESULT.GRANTED) return true;
  const requested = await requestCameraPermission();
  return requested === PERMISSION_RESULT.GRANTED;
}

/** Ensures media library permission is granted, requesting it if undetermined. */
export async function ensureMediaLibraryPermission() {
  const current = await getMediaLibraryPermissionStatus();
  if (current === PERMISSION_RESULT.GRANTED) return true;
  const requested = await requestMediaLibraryPermission();
  return requested === PERMISSION_RESULT.GRANTED;
}
