/**
 * Demo account shortcuts shown on the Login screen's "Demo accounts" card.
 * These are real registered accounts on the Flask backend (see
 * backend/seed_rich_demo.py) — NOT mock/local auth. LoginScreen just
 * autofills the email + password; AuthService.login() does a real
 * POST /api/v1/auth/login.
 */

export const DEMO_PASSWORD = "Demo@1234";

export const DEMO_USERS = [
  {
    id: "ahmed",
    name: "Ahmed Al Rashid",
    email: "ahmed.alrashid@neverexpire.test",
    avatarColor: "#34c9ba",
  },
  {
    id: "fatima",
    name: "Fatima Al Rashid",
    email: "fatima.alrashid@neverexpire.test",
    avatarColor: "#e879a0",
  },
  {
    id: "imran",
    name: "Imran Khan",
    email: "imran.khan@neverexpire.test",
    avatarColor: "#3182ce",
  },
  {
    id: "sara",
    name: "Sara Khan",
    email: "sara.khan@neverexpire.test",
    avatarColor: "#d53f8c",
  },
];
