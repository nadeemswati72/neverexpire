import { API_V1_URL } from "../constants/api";
import * as ApiService from "./ApiService";

/**
 * Family member CRUD against the real Flask backend (was AsyncStorage).
 * `relationship` is now one of RELATION_TYPES' codes (backend enforces a
 * fixed lookup table), not free text — see FamilyMembersScreen's picker.
 */

// Mirrors backend family_relation_types (excluding SELF, which is the
// primary account holder and isn't addable through this form).
// Colors match web's relation-type palette exactly (FamilyPage.tsx) so a
// given relation reads as the same color on both platforms.
export const RELATION_TYPES = [
  { code: "SPOUSE", label: "Spouse", color: "#e879a0" },
  { code: "CHILD", label: "Child", color: "#f6ad55" },
  { code: "PARENT", label: "Parent", color: "#68d391" },
  { code: "SIBLING", label: "Sibling", color: "#76e4f7" },
  { code: "DOMESTIC_HELP", label: "Domestic Help", color: "#f6a5c0" },
  { code: "OTHER", label: "Other", color: "#b794f4" },
];

const RELATION_LABELS = Object.fromEntries(RELATION_TYPES.map((r) => [r.code, r.label]));
const RELATION_COLORS = Object.fromEntries(RELATION_TYPES.map((r) => [r.code, r.color]));

/** Authenticated member photo URL — pair with { headers: authHeader } on <Image>/<Avatar>. */
export function photoUrlFor(personId) {
  return `${API_V1_URL}/family/${personId}/photo`;
}

function toAppMember(person) {
  return {
    id: person.id,
    name: person.full_name,
    relationship: person.is_primary ? "Me" : RELATION_LABELS[person.relation_type] || person.relation_type,
    relationshipCode: person.relation_type,
    isSelf: person.is_primary,
    avatarColor: RELATION_COLORS[person.relation_type] || "#4F8EF7",
    dateOfBirth: person.date_of_birth || null,
    photoPath: person.photo_path,
    photoUri: person.photo_path ? photoUrlFor(person.id) : null,
  };
}

export async function getAllFamilyMembers() {
  const members = await ApiService.get("/family");
  return members.map(toAppMember);
}

export async function addFamilyMember({ name, relationshipCode, dateOfBirth }) {
  await ApiService.post("/family", {
    full_name: name,
    relation_type: relationshipCode,
    date_of_birth: dateOfBirth || null,
  });
  return getAllFamilyMembers();
}

export async function updateFamilyMember(personId, { name, relationshipCode, dateOfBirth }) {
  await ApiService.put(`/family/${personId}`, {
    full_name: name,
    relation_type: relationshipCode,
    date_of_birth: dateOfBirth || null,
  });
  return getAllFamilyMembers();
}

/** Soft-delete — the backend preserves the member's existing documents. */
export async function deleteFamilyMember(personId) {
  await ApiService.del(`/family/${personId}`);
  return getAllFamilyMembers();
}
