/* ============================================================
   GoodBlox — authentication wrapper
   All auth calls go through GBAuth so there is exactly one
   place that talks to Supabase Auth.
   ============================================================ */
(function () {
  "use strict";

  const AUTH = {};

  function client() {
    if (!window.gbSupabase) {
      throw new Error(window.gbSupabaseError || "Supabase is not configured.");
    }
    return window.gbSupabase;
  }

  AUTH.isConfigured = function () { return !!window.gbSupabase; };

  AUTH.signUp = async function ({ email, password, username, displayName }) {
    const supabase = client();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: displayName || username
        }
      }
    });
    if (error) throw error;
    return data;
  };

  AUTH.signIn = async function (email, password) {
    const supabase = client();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  AUTH.signOut = async function () {
    const supabase = client();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  AUTH.getSession = async function () {
    const supabase = client();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  };

  AUTH.getUser = async function () {
    const supabase = client();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  };

  AUTH.resetPassword = async function (email) {
    const supabase = client();
    const origin = window.location.origin + window.location.pathname.replace(/[^/]*$/, "");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: origin + "login.html?reset=1"
    });
    if (error) throw error;
  };

  AUTH.updatePassword = async function (newPassword) {
    const supabase = client();
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  AUTH.onAuthStateChange = function (handler) {
    const supabase = client();
    return supabase.auth.onAuthStateChange(handler);
  };

  AUTH.friendlyError = function (err) {
    if (!err) return "Something went wrong.";
    const msg = String(err.message || err);
    if (/Invalid login credentials/i.test(msg)) return "Incorrect email or password.";
    if (/Email not confirmed/i.test(msg)) return "Please confirm your email address before signing in.";
    if (/User already registered/i.test(msg)) return "That email is already registered. Try signing in instead.";
    if (/Password should be at least/i.test(msg)) return "Password is too short (minimum 6 characters).";
    if (/Unable to validate email address/i.test(msg)) return "That email address does not look valid.";
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Network error — check your internet connection.";
    return msg;
  };

  window.GBAuth = AUTH;
})();
