/* ============================================================
   GoodBlox — runtime configuration
   ------------------------------------------------------------
   Fill in your Supabase project URL and public anon key below.
   Both values come from:
     Supabase dashboard → Project Settings → API

   NEVER put a service_role key in this file. Only the anon
   (public) key is safe in the browser, because Row Level
   Security policies on every table enforce ownership.
   ============================================================ */
window.GOODBLOX_CONFIG = {
  SUPABASE_URL: "https://0ec90b57d6e95fcbda19832f.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_9qWjySjK_apijQQn_UxrSQ_hwxGVj8V",

  APP_NAME: "GoodBlox",

  DEFAULT_AVATAR: "assets/default-avatar.svg",
  DEFAULT_GAME_THUMB: "assets/default-game.svg",

  GAME_CATEGORIES: [
    "Adventure",
    "Racing",
    "Simulator",
    "Tycoon",
    "PvP",
    "Social",
    "Obby",
    "Survival"
  ]
};
