/**
 * Centralized route name constants. Screens and navigators should reference
 * these instead of hardcoding strings so renames stay a one-line change.
 */
export const ROUTES = {
  // Root stack
  LOGIN: "Login",
  DRAWER: "Drawer",

  // Screens pushed above the drawer (hide tabs/drawer while open)
  ADD_DOCUMENT: "AddDocument",
  VOICE_ADD: "VoiceAdd",
  DOCUMENT_FORM: "DocumentForm",
  DOCUMENT_DETAILS: "DocumentDetails",
  MY_DOCUMENTS: "MyDocuments",
  SHARING: "Sharing",
  REGISTER: "Register",
  FAMILY_MEMBER_DOCUMENTS: "FamilyMemberDocuments",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",
  SETTINGS: "Settings",
  HELP_SUPPORT: "HelpSupport",
  ABOUT: "About",
  TESTING_GUIDE: "TestingGuide", // TEMPORARY: remove route + screen + drawer entry once testing is done

  // Drawer
  MAIN_TABS: "MainTabs",

  // Bottom tabs
  DASHBOARD: "Dashboard",
  ADD_TAB: "AddTab",
  FAMILY: "Family",
};
