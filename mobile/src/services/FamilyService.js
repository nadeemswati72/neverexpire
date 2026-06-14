import { DEFAULT_FAMILY_MEMBERS } from "../data/mockFamily";
import * as StorageService from "./StorageService";

/**
 * Family member CRUD against AsyncStorage, seeded from DEFAULT_FAMILY_MEMBERS
 * on first run. Members from every demo account live in the same array;
 * callers (DataContext) filter by `userId`.
 */

export async function getAllFamilyMembers() {
  const stored = await StorageService.getItem(StorageService.STORAGE_KEYS.FAMILY_MEMBERS);
  if (stored && stored.length) return stored;

  await StorageService.setItem(StorageService.STORAGE_KEYS.FAMILY_MEMBERS, DEFAULT_FAMILY_MEMBERS);
  return DEFAULT_FAMILY_MEMBERS;
}

export async function addFamilyMember({ userId, name, relationship, avatarColor }) {
  const members = await getAllFamilyMembers();
  const newMember = {
    id: `fam-${Date.now()}`,
    userId,
    name,
    relationship,
    isSelf: false,
    avatarColor: avatarColor || "#4F8EF7",
  };
  const updated = [...members, newMember];
  await StorageService.setItem(StorageService.STORAGE_KEYS.FAMILY_MEMBERS, updated);
  return updated;
}
