(function () {
  "use strict";

  // --- Helpers & Utilities ---
  const $ = (s, p = document) => p.querySelector(s);   const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const esc = (str) =>
    String(str ?? "")
      .replace(/&/g, "&")
      .replace(//g, ">")
      .replace(/"/g, """)
      .replace(/'/g, "'");

  const CATEGORY_EMOJI = {
    Adventure: "⚔️",
    Obby: "🏃",
    Simulator: "📊",
    Tycoon: "🏭",
    Roleplay: "🎭",
    Action: "💥",
  };

  const GRADIENTS = [
    "#4f46e5, #06b6d4",
    "#f59e0b, #ef4444",
    "#10b981, #3b82f6",
    "#8b5cf6, #ec4899",
    "#6366f1, #14b8a6",
  ];

  function pickGrad(id) {
    let hash = 0;
    const str = String(id || "default");
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  }

  function avatarHTML(avatarUrl, size = 36) {
    if (avatarUrl) {
      return `
; } return SVG`;}// --- Global Application State ---const STATE = {user: null,profile: null,route: { page: "home", param: "" },launchTimer: null,messagesChannel: null,currentSearchToken: 0,};// --- Supabase Client & API Abstraction ---const supabase = window.supabase? window.supabase.createClient(window.SUPABASE_URL || "",window.SUPABASE_ANON_KEY || ""): null;const GBAuth = {async getUser() {if (!supabase) return null;const { data } = await supabase.auth.getUser();return data?.user || null;},async getProfile(userId) {if (!supabase || !userId) return null;const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();return data;},async signOut() {if (supabase) await supabase.auth.signOut();STATE.user = null;STATE.profile = null;window.location.hash = "#/login";},};const GBApi = {async listGames({ search = "", category = "", limit = 20 } = {}) {if (!supabase) return [];let q = supabase.from("games").select("*, creator:profiles(username, display_name)").limit(limit);  if (search) q = q.ilike("name", `%${search}%`);
  if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
},
async getGame(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("games")
    .select("*, creator:profiles(username, display_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
},
async listProfiles(limit = 50) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(limit);
  if (error) throw error;
  return data || [];
},
async getMessages(recipientId) {
  if (!supabase || !STATE.user) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.\({STATE.user.id},recipient_id.eq.\){recipientId}),and(sender_id.eq.\({recipientId},recipient_id.eq.\){STATE.user.id})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
},
async sendMessage(recipientId, body) {
  if (!supabase || !STATE.user) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: STATE.user.id,
      recipient_id: recipientId,
      body: body,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
},
subscribeMessages(recipientId, onMessage) {
  if (!supabase || !STATE.user) return null;
  return supabase
    .channel(`messages:\({STATE.user.id}:\){recipientId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === STATE.user.id &&
            msg.recipient_id === recipientId) ||
          (msg.sender_id === recipientId &&
            msg.recipient_id === STATE.user.id)
        ) {
          onMessage(msg);
        }
      }
    )
    .subscribe();
},
};// --- Modal Management & Accessibility ---function closeModal() {if (STATE.launchTimer) {clearInterval(STATE.launchTimer);STATE.launchTimer = null;}const root = $("#modalRoot");if (root) root.innerHTML = "";}function openModal(contentHtml, options = {}) {closeModal();const root = $("#modalRoot");if (!root) return;root.innerHTML = `
${esc(options.title || "")}×${contentHtml}`;const focusable = root.querySelector("input, select, button, textarea, [tabindex='0']");if (focusable) focusable.focus();}// --- Race-Condition Safe Search ---async function runSearch(query) {const box = $("#searchResults");if (!box) return;const trimmed = query.trim();if (!trimmed) {box.classList.add("hidden");box.innerHTML = "";return;}const token = ++STATE.currentSearchToken;box.innerHTML = 'Searching…';box.classList.remove("hidden");try {
  const [games, users] = await Promise.all([
    GBApi.listGames({ search: trimmed, limit: 5 }).catch(() => []),
    GBApi.listProfiles(200)
      .then((list) =>
        list
          .filter(
            (p) =>
              (p.username || "").toLowerCase().includes(trimmed.toLowerCase()) ||
              (p.display_name || "").toLowerCase().includes(trimmed.toLowerCase())
          )
          .slice(0, 5)
      )
      .catch(() => []),
  ]);

  if (token !== STATE.currentSearchToken) return;

  if (!games.length && !users.length) {
    box.innerHTML = `
No results found for "${esc(trimmed)}"`;return;}  let html = "";
  if (games.length) {
    html += '
Games';html += games.map((g) => `${CATEGORY_EMOJI[g.category] || "🎮"}${esc(g.name)}by ${esc(g.creator ? g.creator.username : "?")} ·${esc(g.category)}`).join("");}  if (users.length) {
    html += '
Players';html += users.map((u) => `${avatarHTML(u.avatar_url, 34)}${esc(u.display_name || u.username)}@${esc(u.username)}`).join("");}  box.innerHTML = html;
} catch (err) {
  if (token !== STATE.currentSearchToken) return;
  console.error("Search error:", err);
  box.innerHTML = `
Search failed. ${esc(err.message || "")}`;}}// --- View Renderers ---async function renderHome() {const main = $("#mainContent");if (!main) return;main.innerHTML = `
Welcome back, ${esc(STATE.profile?.display_name || STATE.profile?.username || "Player")}!Jump into your favorite experiences or explore new games.Featured Games`;try {const games = await GBApi.listGames({ limit: 6 });const grid = $("#homeGamesGrid");if (!grid) return;if (!games.length) {grid.innerHTML = "No games found.";return;}  grid.innerHTML = games
    .map(
      (g) => `
${CATEGORY_EMOJI[g.category] || "🎮"}${esc(g.name)}by ${esc(g.creator?.username || "Unknown")}Play`
  )
  .join("");
} catch (err) {console.error(err);}}async function renderGames() {const main = $("#mainContent");if (!main) return;main.innerHTML = `Discover Games`;const load = async (query = "") => {const grid = $("#gamesListGrid");if (!grid) return;grid.innerHTML = '';const games = await GBApi.listGames({ search: query });if (!games.length) {grid.innerHTML = "No games match your search.";return;}grid.innerHTML = games.map((g) => `${CATEGORY_EMOJI[g.category] || "🎮"}${esc(g.name)}${esc(g.category)} · by${esc(g.creator?.username || "?")}Play`
  )
  .join("");
};await load();}async function renderMessages(recipientId) {const main = $("#mainContent");if (!main) return;if (!recipientId) {main.innerHTML = `MessagesSelect a player from search or user profile to start chatting.`;return;}main.innerHTML = `
ChatSend`;const historyBox = $("#chatHistory");const renderMsgs = (list) => {if (!historyBox) return;historyBox.innerHTML = list.map((m) => `${esc(m.body)}`
  )
  .join("");
historyBox.scrollTop = historyBox.scrollHeight;
};const messages = await GBApi.getMessages(recipientId);renderMsgs(messages);// Realtime channel setupSTATE.messagesChannel = GBApi.subscribeMessages(recipientId, (newMsg) => {messages.push(newMsg);renderMsgs(messages);});const form = $("#chatForm");if (form) {form.onsubmit = async (e) => {e.preventDefault();const input = $("#chatInput");const body = input.value.trim();if (!body) return;input.value = "";try {await GBApi.sendMessage(recipientId, body);} catch (err) {console.error("Failed to send message:", err);}};}}async function renderProfile(userId) {const main = $("#mainContent");if (!main) return;const targetId = userId || STATE.user?.id;const profile = await GBAuth.getProfile(targetId);if (!profile) {main.innerHTML = `Profile not found.`;return;}main.innerHTML = `
${avatarHTML(profile.avatar_url, 72)}${esc(profile.display_name || profile.username)}@${esc(profile.username)}${targetId !== STATE.user?.id? Message: ""}`;}// --- Central Router ---async function route() {const raw = location.hash.replace(/^#/?/, "") || "home";const parts = raw.split("/").filter(Boolean);const page = parts[0] || "home";const param = parts.slice(1).join("/");// Realtime Channel Cleanup when navigating away from messagesif (STATE.route.page === "messages" && page !== "messages" && STATE.messagesChannel) {try {STATE.messagesChannel.unsubscribe();STATE.messagesChannel = null;} catch (err) {console.warn("Error unsubscribing realtime channel:", err);}}STATE.route = { page, param };switch (page) {case "home":await renderHome();break;case "games":await renderGames();break;case "messages":await renderMessages(param);break;case "profile":await renderProfile(param);break;default:await renderHome();}}// --- Central Action Handlers ---const actions = {closeModal() {closeModal();},openGame(el) {const id = el.dataset.id;if (id) window.location.hash = #/game/${id};},viewProfile(el) {const id = el.dataset.id;if (id) window.location.hash = #/profile/${id};},messageUser(el) {const id = el.dataset.id;if (id) window.location.hash = #/messages/${id};},logout() {GBAuth.signOut();},play(el) {const id = el.dataset.id;if (!id) return;if (STATE.launchTimer) {
  clearInterval(STATE.launchTimer);
  STATE.launchTimer = null;
}

GBApi.getGame(id).then((game) => {
  if (!game) return;
  openModal(
    '
' +'' +'Launching GoodBlox' +'Connecting to ' + esc(game.name) + "…" +'' +"",{ title: game.name });    const statuses = [
      "Connecting to server…",
      "Loading assets…",
      "Spawning your avatar…",
      "Almost there…",
    ];
    let step = 0;

    STATE.launchTimer = setInterval(() => {
      step++;
      const bar = $("#launchBar");
      const statusEl = $("#launchStatus");

      if (bar) bar.style.width = Math.min(100, step * 12.5) + "%";
      if (statusEl)
        statusEl.textContent =
          statuses[Math.min(statuses.length - 1, Math.floor(step / 2))];

      if (step >= 8) {
        clearInterval(STATE.launchTimer);
        STATE.launchTimer = null;
        const body = document.querySelector(".modal-body");
        if (body) {
          body.innerHTML =
            '
' +'✅' +'Game client not installed' +'' +"In a full build, this would open " + esc(game.name) + " inside the GoodBlox game client. " +"GoodBlox does not execute external programs from the browser." +"" +'Close' +"";}}}, 260);});},};// --- Event Delegation & Global Listeners ---function initEvents() {// Single delegated click listener to prevent listener accumulationdocument.body.addEventListener("click", (e) => {const actionEl = e.target.closest("[data-action]");if (!actionEl) return;const actionName = actionEl.dataset.action;if (typeof actions[actionName] === "function") {actions[actionName](actionEl, e);}});// Global Search Listener
const searchInput = $("#globalSearch");
if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(e.target.value), 200);
  });
}

window.addEventListener("hashchange", route);
}// --- App Initialization ---async function init() {initEvents();STATE.user = await GBAuth.getUser();
if (STATE.user) {
  STATE.profile = await GBAuth.getProfile(STATE.user.id);
}

await route();
}document.addEventListener("DOMContentLoaded", init);})();