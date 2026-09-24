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
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw",

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
