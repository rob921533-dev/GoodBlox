/* ============================================================
   GoodBlox — Supabase client bootstrap
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.GOODBLOX_CONFIG || {};
  const url = String(cfg.SUPABASE_URL || "").trim();
  const key = String(cfg.SUPABASE_ANON_KEY || "").trim();

  function fail(msg) {
    window.gbSupabase = null;
    window.gbSupabaseError = msg;
    console.warn("[GoodBlox] " + msg);
  }

  if (!url || !key || url.indexOf("YOUR_") === 0 || key.indexOf("YOUR_") === 0) {
    fail("Supabase is not configured. Open config.js and add your SUPABASE_URL and SUPABASE_ANON_KEY.");
    return;
  }

  if (!/^https?:\/\//.test(url)) {
    fail("SUPABASE_URL must start with http:// or https://");
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    fail("Supabase JS library failed to load. Check your internet connection and the CDN script tag in index.html.");
    return;
  }

  try {
    window.gbSupabase = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "goodblox.auth"
      },
      realtime: { params: { eventsPerSecond: 10 } }
    });
    window.gbSupabaseError = null;
    console.log("[GoodBlox] Supabase client ready.");
  } catch (err) {
    fail("Failed to initialise Supabase: " + (err && err.message ? err.message : err));
  }
})();
