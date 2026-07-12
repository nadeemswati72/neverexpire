import * as ApiService from "./ApiService";

/**
 * Family member CRUD against the real Flask backend (was AsyncStorage).
 * `relationship` is now one of RELATION_TYPES' codes (backend enforces a
 * fixed lookup table), not free text — see FamilyMembersScreen's picker.
 */

// Mirrors backend family_relation_types (excluding SELF, which is the
// primary account holder and isn't addable through this form).
export const RELATION_TYPES = [
  { code: "SPOUSE", label: "Spouse", color: "#EF5DA8" },
  { code: "CHILD", label: "Child", color: "#34C38F" },
  { code: "PARENT", label: "Parent", color: "#22B8CF" },
  { code: "SIBLING", label: "Sibling", color: "#8B5CF6" },
  { code: "DOMESTIC_HELP", label: "Domestic Help", color: "#F2994A" },
  { code: "OTHER", label: "Other", color: "#9CA3AF" },
];

const RELATION_LABELS = Object.fromEntries(RELATION_TYPES.map((r) => [r.code, r.label]));
const RELATION_COLORS = Object.fromEntries(RELATION_TYPES.map((r) => [r.code, r.color]));

function toAppMember(person) {
  return {
    id: person.id,
    name: person.full_name,
    relationship: person.is_primary ? "Me" : RELATION_LABELS[person.relation_type] || person.relation_type,
    relationshipCode: person.relation_type,
    isSelf: person.is_primary,
    avatarColor: RELATION_COLORS[person.relation_type] || "#4F8EF7",
    photoPath: person.photo_path,
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
