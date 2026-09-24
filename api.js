/* ============================================================
   GoodBlox — data API
   Every call to Supabase lives here. Ownership is enforced by
   Row Level Security in the database, not by this file.
   ============================================================ */
(function () {
  "use strict";

  const API = {};

  function client() {
    if (!window.gbSupabase) {
      throw new Error(window.gbSupabaseError || "Supabase is not configured.");
    }
    return window.gbSupabase;
  }

  async function me() {
    const { data, error } = await client().auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("You are not signed in.");
    return data.user;
  }
  API.currentUserId = async () => (await me()).id;

  /* -----------------------------------------------------------
     Profiles
     ----------------------------------------------------------- */
  API.getProfile = async function (userId) {
    const { data, error } = await client()
      .from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  };

  API.getProfileByUsername = async function (username) {
    const { data, error } = await client()
      .from("profiles").select("*").ilike("username", username).maybeSingle();
    if (error) throw error;
    return data;
  };

  API.getMyProfile = async function () {
    const u = await me();
    return API.getProfile(u.id);
  };

  API.updateMyProfile = async function (patch) {
    const u = await me();
    const clean = {};
    if (typeof patch.display_name === "string") clean.display_name = patch.display_name.trim().slice(0, 60);
    if (typeof patch.bio === "string") clean.bio = patch.bio.trim().slice(0, 400);
    if (typeof patch.avatar_url === "string") clean.avatar_url = patch.avatar_url;
    clean.updated_at = new Date().toISOString();
    const { data, error } = await client()
      .from("profiles").update(clean).eq("id", u.id).select().single();
    if (error) throw error;
    return data;
  };

  API.usernameAvailable = async function (username) {
    const { data, error } = await client()
      .from("profiles").select("id").ilike("username", username).maybeSingle();
    if (error) throw error;
    return !data;
  };

  API.listProfiles = async function (limit) {
    const { data, error } = await client()
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit || 40);
    if (error) throw error;
    return data || [];
  };

  /* -----------------------------------------------------------
     Games
     ----------------------------------------------------------- */
  const GAME_SELECT = `id, creator_id, name, description, category,
    thumbnail_url, player_count, visits, likes, created_at, updated_at,
    creator:profiles!games_creator_id_fkey (id, username, display_name, avatar_url)`;

  API.listGames = async function (opts) {
    opts = opts || {};
    let q = client().from("games").select(GAME_SELECT);
    if (opts.category && opts.category !== "All") {
      q = q.eq("category", opts.category);
    }
    if (opts.search && opts.search.trim()) {
      const term = "%" + opts.search.trim().replace(/[%_,]/g, "") + "%";
      q = q.or(`name.ilike.${term},description.ilike.${term}`);
    }
    switch (opts.sort) {
      case "Newest":           q = q.order("created_at", { ascending: false }); break;
      case "Recently Updated": q = q.order("updated_at", { ascending: false }); break;
      case "Highest Rated":    q = q.order("likes", { ascending: false }); break;
      case "Most Played":
      default:                 q = q.order("visits", { ascending: false });
    }
    q = q.limit(opts.limit || 60);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  };

  API.getGame = async function (id) {
    const { data, error } = await client()
      .from("games").select(GAME_SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  };

  API.createGame = async function (game) {
    const u = await me();
    const payload = {
      creator_id: u.id,                     // RLS also enforces this
      name: String(game.name || "").trim().slice(0, 60),
      description: String(game.description || "").trim().slice(0, 2000),
      category: String(game.category || "Adventure").slice(0, 40),
      thumbnail_url: game.thumbnail_url ? String(game.thumbnail_url).slice(0, 500) : null
    };
    const { data, error } = await client()
      .from("games").insert(payload).select().single();
    if (error) throw error;
    return data;
  };

  API.updateGame = async function (id, patch) {
    const clean = {};
    if (patch.name != null) clean.name = String(patch.name).trim().slice(0, 60);
    if (patch.description != null) clean.description = String(patch.description).trim().slice(0, 2000);
    if (patch.category != null) clean.category = String(patch.category).slice(0, 40);
    if (patch.thumbnail_url != null) clean.thumbnail_url = String(patch.thumbnail_url).slice(0, 500);
    clean.updated_at = new Date().toISOString();
    const { data, error } = await client()
      .from("games").update(clean).eq("id", id).select().single();
    if (error) throw error;
    return data;
  };

  API.deleteGame = async function (id) {
    const { error } = await client().from("games").delete().eq("id", id);
    if (error) throw error;
  };

  API.listMyGames = async function () {
    const u = await me();
    const { data, error } = await client()
      .from("games")
      .select(GAME_SELECT)
      .eq("creator_id", u.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  API.incrementVisit = async function (id) {
    try { await client().rpc("increment_game_visits", { game_id_input: id }); }
    catch (_) { /* RPC is optional */ }
  };

  /* -----------------------------------------------------------
     Likes
     ----------------------------------------------------------- */
  API.isGameLiked = async function (gameId) {
    const u = await me();
    const { data, error } = await client()
      .from("game_likes").select("game_id")
      .eq("game_id", gameId).eq("user_id", u.id).maybeSingle();
    if (error) throw error;
    return !!data;
  };

  API.toggleGameLike = async function (gameId) {
    const u = await me();
    const liked = await API.isGameLiked(gameId);
    if (liked) {
      const { error } = await client()
        .from("game_likes").delete()
        .eq("game_id", gameId).eq("user_id", u.id);
      if (error) throw error;
      return false;
    }
    const { error } = await client()
      .from("game_likes").insert({ game_id: gameId, user_id: u.id });
    if (error) throw error;
    return true;
  };

  /* -----------------------------------------------------------
     Friendships
     ----------------------------------------------------------- */
  const FRIEND_SELECT = `
    id, status, requester_id, addressee_id, created_at, updated_at,
    requester:profiles!friendships_requester_id_fkey (id, username, display_name, avatar_url),
    addressee:profiles!friendships_addressee_id_fkey (id, username, display_name, avatar_url)
  `;

  API.listFriendships = async function () {
    const u = await me();
    const { data, error } = await client()
      .from("friendships").select(FRIEND_SELECT)
      .or(`requester_id.eq.${u.id},addressee_id.eq.${u.id}`)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  API.getFriendshipWith = async function (otherUserId) {
    const u = await me();
    const { data, error } = await client()
      .from("friendships").select(FRIEND_SELECT)
      .or(`and(requester_id.eq.${u.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${u.id})`)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  API.sendFriendRequest = async function (targetUserId) {
    const u = await me();
    if (targetUserId === u.id) throw new Error("You cannot add yourself.");
    const { data, error } = await client()
      .from("friendships")
      .insert({ requester_id: u.id, addressee_id: targetUserId, status: "pending" })
      .select().single();
    if (error) {
      if (error.code === "23505") throw new Error("A friend request already exists between you and this player.");
      if (error.code === "23514") throw new Error("You cannot send a friend request to yourself.");
      throw error;
    }
    return data;
  };

  API.sendFriendRequestByUsername = async function (username) {
    const profile = await API.getProfileByUsername(username);
    if (!profile) throw new Error("No player with that username.");
    return API.sendFriendRequest(profile.id);
  };

  API.respondToFriendRequest = async function (friendshipId, status) {
    if (status !== "accepted" && status !== "declined") {
      throw new Error("Invalid friendship status.");
    }
    const { data, error } = await client()
      .from("friendships")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", friendshipId).select().single();
    if (error) throw error;
    return data;
  };

  API.removeFriendship = async function (friendshipId) {
    const { error } = await client().from("friendships").delete().eq("id", friendshipId);
    if (error) throw error;
  };

  /* -----------------------------------------------------------
     Messages
     ----------------------------------------------------------- */
  API.listMessages = async function (otherUserId) {
    const u = await me();
    const { data, error } = await client()
      .from("messages").select("*")
      .or(`and(sender_id.eq.${u.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${u.id})`)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw error;
    return data || [];
  };

  API.sendMessage = async function (receiverId, content) {
    const u = await me();
    const text = String(content || "").trim();
    if (!text) throw new Error("Message cannot be empty.");
    if (text.length > 2000) throw new Error("Message is too long.");
    const { data, error } = await client()
      .from("messages")
      .insert({ sender_id: u.id, receiver_id: receiverId, content: text })
      .select().single();
    if (error) throw error;
    return data;
  };

  API.markMessagesRead = async function (otherUserId) {
    const u = await me();
    const { error } = await client()
      .from("messages").update({ read_at: new Date().toISOString() })
      .eq("receiver_id", u.id).eq("sender_id", otherUserId).is("read_at", null);
    if (error) throw error;
  };

  API.listConversations = async function () {
    const u = await me();
    const { data, error } = await client()
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at, read_at")
      .or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const map = new Map();
    (data || []).forEach(m => {
      const other = m.sender_id === u.id ? m.receiver_id : m.sender_id;
      if (!map.has(other)) {
        map.set(other, {
          otherId: other,
          last: m,
          unread: (m.receiver_id === u.id && !m.read_at) ? 1 : 0
        });
      } else if (m.receiver_id === u.id && !m.read_at) {
        map.get(other).unread += 1;
      }
    });
    return Array.from(map.values());
  };

  API.subscribeToMessages = function (callback) {
    const supabase = client();
    return supabase
      .channel("gb-messages")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        callback)
      .subscribe();
  };

  /* -----------------------------------------------------------
     Notifications
     ----------------------------------------------------------- */
  API.listNotifications = async function () {
    const u = await me();
    const { data, error } = await client()
      .from("notifications").select("*")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  };

  API.unreadNotificationCount = async function () {
    const u = await me();
    const { count, error } = await client()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", u.id).eq("read", false);
    if (error) throw error;
    return count || 0;
  };

  API.markNotificationRead = async function (id) {
    const { error } = await client()
      .from("notifications").update({ read: true }).eq("id", id);
    if (error) throw error;
  };

  API.markAllNotificationsRead = async function () {
    const u = await me();
    const { error } = await client()
      .from("notifications").update({ read: true })
      .eq("user_id", u.id).eq("read", false);
    if (error) throw error;
  };

  /* -----------------------------------------------------------
     Avatars
     ----------------------------------------------------------- */
  API.getAvatar = async function (userId) {
    const { data, error } = await client()
      .from("avatars").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  };

  API.getMyAvatar = async function () {
    const u = await me();
    return API.getAvatar(u.id);
  };

  API.saveMyAvatar = async function (patch) {
    const u = await me();
    const payload = {
      user_id: u.id,
      skin_color:  String(patch.skin_color  || "#f2c9a0").slice(0, 20),
      shirt_color: String(patch.shirt_color || "#7657ff").slice(0, 20),
      pants_color: String(patch.pants_color || "#2b3350").slice(0, 20),
      hair:        String(patch.hair        || "short").slice(0, 20),
      face:        String(patch.face        || "smile").slice(0, 20),
      accessory:   String(patch.accessory   || "none").slice(0, 20),
      updated_at:  new Date().toISOString()
    };
    const { data, error } = await client()
      .from("avatars")
      .upsert(payload, { onConflict: "user_id" })
      .select().single();
    if (error) throw error;
    return data;
  };

  window.GBApi = API;
})();
