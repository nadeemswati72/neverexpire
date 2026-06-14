/**
 * Default family members, seeded into AsyncStorage on first launch (see
 * FamilyService.getFamilyMembers). Each member belongs to a demo user via
 * `userId`. The `isSelf` member represents the logged-in user themselves —
 * shown as "(Me)" on the Family Members screen.
 */

export const DEFAULT_FAMILY_MEMBERS = [
  // --- Nadeem Ahmad's family ---------------------------------------------
  {
    id: "fam-nadeem-self",
    userId: "user-nadeem",
    name: "Nadeem Ahmad",
    relationship: "Me",
    isSelf: true,
    avatarColor: "#4F8EF7",
  },
  {
    id: "fam-nadeem-sarah",
    userId: "user-nadeem",
    name: "Sarah Ahmad",
    relationship: "Wife",
    isSelf: false,
    avatarColor: "#EF5DA8",
  },
  {
    id: "fam-nadeem-ahmed",
    userId: "user-nadeem",
    name: "Ahmed Ahmad",
    relationship: "Son",
    isSelf: false,
    avatarColor: "#34C38F",
  },
  {
    id: "fam-nadeem-ayesha",
    userId: "user-nadeem",
    name: "Ayesha Ahmad",
    relationship: "Daughter",
    isSelf: false,
    avatarColor: "#F2994A",
  },

  // --- Aisha Khan's family -------------------------------------------------
  {
    id: "fam-aisha-self",
    userId: "user-aisha",
    name: "Aisha Khan",
    relationship: "Me",
    isSelf: true,
    avatarColor: "#8B5CF6",
  },
  {
    id: "fam-aisha-omar",
    userId: "user-aisha",
    name: "Omar Khan",
    relationship: "Husband",
    isSelf: false,
    avatarColor: "#4F8EF7",
  },
];
