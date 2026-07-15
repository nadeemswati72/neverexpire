/**
 * Ionicons-name -> emoji glyph lookup. Every shared "icon" component
 * (AppButton, Header, EmptyState, SourceOptionCard, SummaryCard,
 * CustomTabBar, AppTextInput, ShareModal, FamilyMemberCard, and a handful
 * of inline screen icons) renders through this map via <EmojiIcon>, so call
 * sites keep passing the same familiar Ionicons-style name strings while
 * the app actually shows the "Emoji Nav" glyph set everywhere — not just
 * the drawer.
 *
 * A few purely directional/structural glyphs (chevron, close, menu, back)
 * use a plain Unicode symbol instead of a pictographic emoji: those are
 * tiny inline affordances where a full-color emoji would look oversized or
 * misaligned next to 13-18px text, and — unlike true emoji — these symbols
 * still respect RN's `color` style, so they can be tinted to match context
 * (e.g. a red trash icon vs a teal chevron).
 */
export const EMOJI_ICONS = {
  // Navigation / chrome
  "arrow-back": "←",
  menu: "☰",
  close: "✕",
  "chevron-forward": "›",
  add: "➕",
  "arrow-forward": "➡️",
  "arrow-down-outline": "⬇️",
  "arrow-up-outline": "⬆️",

  // Brand — matches the web app's ⏰ logo (Sidebar.tsx) for cross-platform consistency
  "shield-checkmark": "⏰",

  // Bottom tabs
  home: "🏠",
  "home-outline": "🏠",
  // A single-glyph family emoji (👪) renders bigger/punchier across fonts
  // than the multi-codepoint 👨‍👩‍👧 sequence, which many renderers shrink.
  people: "👪",
  "people-outline": "👪",

  // Forms
  "mail-outline": "✉️",
  "lock-closed-outline": "🔒",
  "person-outline": "👤",
  "person-add-outline": "➕",
  "eye-outline": "👁️",
  "eye-off-outline": "🙈",
  "search-outline": "🔍",

  // Empty states / generic
  "alert-circle-outline": "⚠️",
  "folder-outline": "🗂️",
  "document-text-outline": "📄",
  "notifications-outline": "🔔",

  // Add Document source picker
  "camera-outline": "📷",
  "image-outline": "🖼️",
  "document-outline": "📄",
  "document-attach-outline": "📎",
  "mic-outline": "🎙️",

  // Document actions
  "share-social-outline": "🔗",
  "create-outline": "✏️",
  "trash-outline": "🗑️",
  "download-outline": "⬇️",
  "checkmark-circle": "✅",

  // Misc screens
  "log-out-outline": "🚪",
  "call-outline": "📞",
  construct: "🛠️",
  "globe-outline": "🌐",
  "information-circle": "ℹ️",
  "information-circle-outline": "ℹ️",
};

/** Looks up the emoji for an Ionicons-style name, falling back to a neutral dot. */
export function emojiFor(name) {
  return EMOJI_ICONS[name] || "•";
}
