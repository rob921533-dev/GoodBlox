/* ============================================================
   GoodBlox — main application
   ============================================================ */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     0. Utilities
     ----------------------------------------------------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  function esc(v){
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmtNum(n){
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  function timeAgo(ts){
    const t = new Date(ts).getTime();
    if (isNaN(t)) return "—";
    const diff = Date.now() - t;
    if (diff < 0) return "just now";
    const s = Math.floor(diff / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    if (d < 30) return d + "d ago";
    const mo = Math.floor(d / 30);
    if (mo < 12) return mo + "mo ago";
    return Math.floor(mo / 12) + "y ago";
  }
  function dateStr(ts){
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function clockStr(ts){
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }

  /* -----------------------------------------------------------
     1. Icons
     ----------------------------------------------------------- */
  const ICONS = {
    home:      '<path d="M3 10.6 12 3l9 7.6"/><path d="M5.5 9.6V20a1 1 0 0 0 1 1h3.5v-5.5h4V21h3.5a1 1 0 0 0 1-1V9.6"/>',
    discover:  '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
    games:     '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    create:    '<path d="M12 5v14M5 12h14"/>',
    avatar:    '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6"/>',
    friends:   '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20c0-3.4 2.9-5.3 6.5-5.3s6.5 1.9 6.5 5.3"/><path d="M16.5 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M18 14.9c2.4.5 3.8 2.1 3.8 4.6"/>',
    messages:  '<path d="M20.5 11.6c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.34L4.5 20.5l1.2-3.5a6.9 6.9 0 0 1-2.2-5c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z"/>',
    bell:      '<path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21h4"/>',
    profile:   '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6"/>',
    settings:  '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
    logout:    '<path d="M15 4h3.2A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8H15"/><path d="M10.5 8 6.5 12l4 4"/><path d="M6.5 12h9"/>',
    play:      '<path d="M7 4.5 19.5 12 7 19.5z"/>',
    heart:     '<path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.3 12 20 12 20z"/>',
    star:      '<path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8z"/>',
    trash:     '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7 7.5 20h9L17.5 7"/>',
    edit:      '<path d="M16.5 3.5 20.5 7.5 8.5 19.5 3.5 20.5 4.5 15.5z"/>',
    eye:       '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    send:      '<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-7.5L3 9.5z"/>',
    user:      '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6"/>',
    check:     '<path d="m4.5 12.5 5 5 10-11"/>'
  };
  function icon(name, cls){
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  /* -----------------------------------------------------------
     2. Avatar renderer
     ----------------------------------------------------------- */
  const AVATAR_DEFAULTS = {
    skin_color: "#f2c9a0",
    shirt_color: "#7657ff",
    pants_color: "#2b3350",
    hair: "short",
    face: "smile",
    accessory: "none"
  };
  const HAIR_COLORS = {
    short: "#1c1c22", long: "#3a2a20", spiky: "#d9a24a",
    curly: "#6b4226", bun: "#7657ff", none: "#1c1c22"
  };
  function avatarSVGInner(av){
    av = Object.assign({}, AVATAR_DEFAULTS, av || {});
    const skin = av.skin_color, shirt = av.shirt_color, pants = av.pants_color;
    const hair = HAIR_COLORS[av.hair] || "#1c1c22";
    const eye = "#151824";

    let hairEl = "";
    switch (av.hair){
      case "none": hairEl = ""; break;
      case "long":
        hairEl = '<circle cx="60" cy="42" r="26" fill="' + hair + '"/>' +
                 '<rect x="30" y="40" width="12" height="46" rx="6" fill="' + hair + '"/>' +
                 '<rect x="78" y="40" width="12" height="46" rx="6" fill="' + hair + '"/>';
        break;
      case "spiky":
        hairEl = '<circle cx="60" cy="42" r="26" fill="' + hair + '"/>' +
                 '<path d="M40 28 L46 10 L54 24 L60 5 L66 24 L74 10 L80 28 Z" fill="' + hair + '"/>';
        break;
      case "bun":
        hairEl = '<circle cx="60" cy="42" r="26" fill="' + hair + '"/>' +
                 '<circle cx="60" cy="12" r="9" fill="' + hair + '"/>';
        break;
      case "curly":
        hairEl = '<circle cx="60" cy="42" r="26" fill="' + hair + '"/>' +
                 '<circle cx="40" cy="26" r="8" fill="' + hair + '"/>' +
                 '<circle cx="60" cy="17" r="9.5" fill="' + hair + '"/>' +
                 '<circle cx="80" cy="26" r="8" fill="' + hair + '"/>';
        break;
      default:
        hairEl = '<circle cx="60" cy="42" r="26" fill="' + hair + '"/>';
    }

    const legs =
      '<rect x="44" y="96" width="14" height="22" rx="6" fill="' + pants + '"/>' +
      '<rect x="62" y="96" width="14" height="22" rx="6" fill="' + pants + '"/>';
    const arms =
      '<rect x="21" y="68" width="13" height="34" rx="6.5" fill="' + shirt + '"/>' +
      '<rect x="86" y="68" width="13" height="34" rx="6.5" fill="' + shirt + '"/>' +
      '<circle cx="27.5" cy="104" r="6.5" fill="' + skin + '"/>' +
      '<circle cx="92.5" cy="104" r="6.5" fill="' + skin + '"/>';
    const torso = '<rect x="34" y="62" width="52" height="44" rx="16" fill="' + shirt + '"/>';
    const neck  = '<rect x="52" y="64" width="16" height="14" fill="' + skin + '"/>';
    const head  = '<circle cx="60" cy="46" r="24" fill="' + skin + '"/>';

    const eyes = '<circle cx="51" cy="44" r="3.2" fill="' + eye + '"/><circle cx="69" cy="44" r="3.2" fill="' + eye + '"/>';
    let faceEl = eyes + '<path d="M52 55 q8 8 16 0" stroke="' + eye + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    switch (av.face){
      case "happy":
        faceEl = eyes + '<path d="M51 54 q9 10 18 0" stroke="' + eye + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        break;
      case "cool":
        faceEl = '<rect x="40" y="39.5" width="18" height="9" rx="4" fill="' + eye + '"/>' +
                 '<rect x="62" y="39.5" width="18" height="9" rx="4" fill="' + eye + '"/>' +
                 '<rect x="57" y="42" width="6" height="3.2" fill="' + eye + '"/>' +
                 '<path d="M52 55 q8 8 16 0" stroke="' + eye + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        break;
      case "wink":
        faceEl = '<circle cx="51" cy="44" r="3.2" fill="' + eye + '"/>' +
                 '<path d="M64.5 44 h9" stroke="' + eye + '" stroke-width="3" stroke-linecap="round"/>' +
                 '<path d="M52 55 q8 8 16 0" stroke="' + eye + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        break;
      case "surprised":
        faceEl = eyes + '<circle cx="60" cy="56" r="4.6" fill="none" stroke="' + eye + '" stroke-width="2.6"/>';
        break;
    }

    let hatEl = "";
    switch (av.accessory){
      case "cap":
        hatEl = '<path d="M34 43 A26 26 0 0 1 86 43 Z" fill="#ff5d73"/>' +
                '<rect x="19" y="40" width="33" height="8" rx="4" fill="#ff5d73"/>';
        break;
      case "beanie":
        hatEl = '<path d="M33 45 A27 27 0 0 1 87 45 Z" fill="#44e4ff"/>' +
                '<rect x="32" y="42" width="56" height="9" rx="4.5" fill="#2fb8d6"/>';
        break;
      case "crown":
        hatEl = '<path d="M38 38 L44 20 L52 32 L60 17 L68 32 L76 20 L82 38 Z" fill="#ffd54a" stroke="#d9a800" stroke-width="1.5" stroke-linejoin="round"/>';
        break;
      case "headphones":
        hatEl = '<path d="M34 48 A26 26 0 0 1 86 48" stroke="#1b1f2e" stroke-width="6" fill="none" stroke-linecap="round"/>' +
                '<rect x="25" y="42" width="13" height="23" rx="6.5" fill="#1b1f2e"/>' +
                '<rect x="82" y="42" width="13" height="23" rx="6.5" fill="#1b1f2e"/>';
        break;
      case "halo":
        hatEl = '<ellipse cx="60" cy="14" rx="16" ry="5" fill="none" stroke="#ffe066" stroke-width="4"/>';
        break;
    }

    return legs + arms + hairEl + torso + neck + head + faceEl + hatEl;
  }

  function avatarHTML(av, size, extraClass){
    av = Object.assign({}, AVATAR_DEFAULTS, av || {});
    const s = size || 96;
    return '<div class="avatar ' + (extraClass || "") + '" style="width:' + s + "px;height:" + s + 'px;background:linear-gradient(135deg,#7657ff,#44e4ff)">' +
      '<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">' + avatarSVGInner(av) + "</svg></div>";
  }

  /* -----------------------------------------------------------
     3. Toasts & modals
     ----------------------------------------------------------- */
  function toast(msg, type){
    const host = $("#toasts");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3600);
  }
  function openModal(html, opts){
    opts = opts || {};
    const root = $("#modalRoot");
    root.innerHTML =
      '<div class="modal-backdrop" data-action="modalBackdrop">' +
        '<div class="modal ' + (opts.size || "") + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || "") + '">' +
          '<div class="modal-head"><h2>' + esc(opts.title || "") + "</h2>" +
          '<button class="modal-close" data-action="closeModal" aria-label="Close">&times;</button></div>' +
          '<div class="modal-body">' + html + "</div>" +
        "</div>" +
      "</div>";
    const focusable = root.querySelector("input, select, textarea, button.btn-primary");
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }
  function closeModal(){ $("#modalRoot").innerHTML = ""; }

  /* -----------------------------------------------------------
     4. Global state
     ----------------------------------------------------------- */
  const STATE = {
    user: null,               // supabase auth user
    profile: null,            // profiles row
    avatar: null,             // avatars row
    settings: loadSettings(),
    templates: new Map(),
    route: { page: "home", param: "" },
    messagesChannel: null,
    avatarDraft: null,
    editingGameId: null
  };

  function loadSettings(){
    try {
      const raw = localStorage.getItem("goodblox.ui.settings");
      return raw ? JSON.parse(raw) : { darkMode: true, compact: false, animations: true, allowRequests: true, showOnline: true, notifyFriends: true, notifyGames: true, notifyMessages: true };
    } catch (_){ return { darkMode: true, compact: false, animations: true, allowRequests: true, showOnline: true, notifyFriends: true, notifyGames: true, notifyMessages: true }; }
  }
  function saveSettings(){
    try { localStorage.setItem("goodblox.ui.settings", JSON.stringify(STATE.settings)); } catch (_){}
  }
  function applySettings(){
    document.body.classList.toggle("light", !STATE.settings.darkMode);
    document.body.classList.toggle("compact", !!STATE.settings.compact);
    document.body.classList.toggle("no-anim", !STATE.settings.animations);
  }

  /* -----------------------------------------------------------
     5. Template loader
     ----------------------------------------------------------- */
  async function loadTemplate(name){
    if (STATE.templates.has(name)) return STATE.templates.get(name);
    const res = await fetch("pages/" + name + ".html", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load template: " + name);
    const html = await res.text();
    STATE.templates.set(name, html);
    return html;
  }

  /* -----------------------------------------------------------
     6. Navigation configuration
     ----------------------------------------------------------- */
  const NAV_ITEMS = [
    { id: "home",          label: "Home",          icon: "home",      hash: "#/home" },
    { id: "discover",      label: "Discover",      icon: "discover",  hash: "#/discover" },
    { id: "games",         label: "Games",         icon: "games",     hash: "#/games" },
    { id: "create",        label: "Create",        icon: "create",    hash: "#/create" },
    { id: "avatar",        label: "Avatar",        icon: "avatar",    hash: "#/avatar" },
    { id: "friends",       label: "Friends",       icon: "friends",   hash: "#/friends" },
    { id: "messages",      label: "Messages",      icon: "messages",  hash: "#/messages" },
    { id: "notifications", label: "Notifications", icon: "bell",      hash: "#/notifications" }
  ];
  const FOOT_ITEMS = [
    { id: "profile",  label: "Profile",  icon: "profile",  hash: "#/profile" },
    { id: "settings", label: "Settings", icon: "settings", hash: "#/settings" },
    { id: "logout",   label: "Log Out",  icon: "logout",   hash: "#/logout" }
  ];
  const BOTTOM_ITEMS = [
    { id: "home",     label: "Home",     icon: "home",     hash: "#/home" },
    { id: "discover", label: "Discover", icon: "discover", hash: "#/discover" },
    { id: "create",   label: "Create",   icon: "create",   hash: "#/create" },
    { id: "friends",  label: "Friends",  icon: "friends",  hash: "#/friends" },
    { id: "messages", label: "Chat",     icon: "messages", hash: "#/messages" }
  ];

  /* -----------------------------------------------------------
     7. Nav builder
     ----------------------------------------------------------- */
  let unreadMessages = 0;
  let unreadNotifications = 0;

  async function refreshBadges(){
    try { unreadNotifications = await GBApi.unreadNotificationCount(); } catch (_){ unreadNotifications = 0; }
    try {
      const convos = await GBApi.listConversations();
      unreadMessages = convos.reduce((s, c) => s + (c.unread || 0), 0);
    } catch (_){ unreadMessages = 0; }
  }

  function buildNav(){
    const badgeFor = id => {
      if (id === "messages" && unreadMessages) return '<span class="nav-badge">' + (unreadMessages > 9 ? "9+" : unreadMessages) + "</span>";
      if (id === "notifications" && unreadNotifications) return '<span class="nav-badge">' + (unreadNotifications > 9 ? "9+" : unreadNotifications) + "</span>";
      return "";
    };

    $("#mainNav").innerHTML = NAV_ITEMS.map(item =>
      '<button class="nav-item ' + (STATE.route.page === item.id ? "active" : "") + '" data-action="nav" data-to="' + item.id + '" aria-label="' + item.label + '">' +
        icon(item.icon) + '<span class="label">' + item.label + "</span>" + badgeFor(item.id) +
      "</button>"
    ).join("");

    $("#footNav").innerHTML = FOOT_ITEMS.map(item =>
      '<button class="nav-item" data-action="nav" data-to="' + item.id + '" aria-label="' + item.label + '">' +
        icon(item.icon) + '<span class="label">' + item.label + "</span>" +
      "</button>"
    ).join("");

    $("#bottomNav").innerHTML = BOTTOM_ITEMS.map(item =>
      '<button class="bnav-item ' + (STATE.route.page === item.id ? "active" : "") + '" data-action="nav" data-to="' + item.id + '" aria-label="' + item.label + '">' +
        icon(item.icon) + "<span>" + item.label + "</span>" + badgeFor(item.id) +
      "</button>"
    ).join("");

    if (STATE.profile){
      $("#sidebarUser").innerHTML =
        avatarHTML(STATE.avatar, 38) +
        '<div class="meta">' +
          '<div class="uname">' + esc(STATE.profile.display_name || STATE.profile.username) + "</div>" +
          '<div class="status"><span class="dot"></span> Online</div>' +
        "</div>";

      $("#topAvatarBtn").innerHTML = avatarHTML(STATE.avatar, 26) +
        (unreadNotifications ? '<span class="ping">' + (unreadNotifications > 9 ? "9+" : unreadNotifications) + "</span>" : "");
    }
  }

  /* -----------------------------------------------------------
     8. Game card renderer
     ----------------------------------------------------------- */
  const CATEGORY_EMOJI = {
    Adventure: "🧭", Racing: "🏎️", Simulator: "🏙️", Tycoon: "💰",
    PvP: "⚔️", Social: "🧱", Obby: "🟣", Survival: "🔥"
  };
  function thumbHTML(game){
    const hasImg = game.thumbnail_url && /^https?:\/\//i.test(game.thumbnail_url);
    const emoji = CATEGORY_EMOJI[game.category] || "🎮";
    const bg = "linear-gradient(135deg," + pickGrad(game.id) + ")";
    return '<div class="thumb" style="background:' + bg + '">' +
      (hasImg ? '<img src="' + esc(game.thumbnail_url) + '" alt="" loading="lazy" onerror="this.remove()">' : "") +
      '<span class="thumb-emoji">' + emoji + "</span>" +
      '<span class="thumb-shine"></span>' +
      '<span class="thumb-tag">' + esc(game.category) + "</span>" +
      '<span class="thumb-live"><span class="live-dot"></span>' + fmtNum(game.player_count || 0) + " playing</span>" +
    "</div>";
  }
  function pickGrad(seed){
    const grads = ["#7657ff,#44e4ff","#4d9dff,#3ddc97","#ff5d73,#ffb020","#7657ff,#ff8ad4","#1b1f2e,#4d9dff","#44e4ff,#3ddc97","#ffb020,#ff5d73","#3ddc97,#4d9dff"];
    let h = 0;
    for (let i = 0; i < String(seed).length; i++) h = ((h * 31) + String(seed).charCodeAt(i)) >>> 0;
    return grads[h % grads.length];
  }
  function gameCard(game){
    return '<article class="game-card" data-action="openGame" data-id="' + esc(game.id) + '" tabindex="0" role="button" aria-label="Open ' + esc(game.name) + '">' +
      thumbHTML(game) +
      '<div class="game-card-body">' +
        "<h3>" + esc(game.name) + "</h3>" +
        '<div class="creator">by ' + esc(game.creator ? (game.creator.display_name || game.creator.username) : "Unknown") + "</div>" +
        '<div class="game-card-meta">' +
          '<span class="star">★ ' + (game.likes || 0) + "</span>" +
          "<span>·</span>" +
          "<span>" + fmtNum(game.visits || 0) + " visits</span>" +
        "</div>" +
        '<div class="game-card-foot">' +
          '<span class="rating-pill">' + fmtNum(game.likes || 0) + " likes</span>" +
          '<button class="btn btn-play" data-action="play" data-id="' + esc(game.id) + '">Play</button>' +
        "</div>" +
      "</div>" +
    "</article>";
  }
  function sectionBlock(title, innerHTML, linkHash, linkText){
    return '<section class="section"><div class="section-head"><h2>' + esc(title) + "</h2>" +
      (linkHash ? '<a class="link" href="' + linkHash + '">' + esc(linkText || "See all") + "</a>" : "") +
      "</div>" + innerHTML + "</section>";
  }
  function rowSection(title, games, linkHash){
    if (!games.length) return "";
    return sectionBlock(title, '<div class="row-scroll">' + games.map(gameCard).join("") + "</div>", linkHash, "See all");
  }
  function emptyState(emoji, title, text, actionHTML){
    return '<div class="empty"><div class="emo">' + emoji + "</div><h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" + (actionHTML || "") + "</div>";
  }
  function errorBanner(message){
    return '<div class="error-banner">' + esc(message) + "</div>";
  }
  function loadingGrid(n){
    let html = '<div class="skeleton-grid">';
    for (let i = 0; i < (n || 8); i++) html += '<div class="skeleton skeleton-card"></div>';
    return html + "</div>";
  }

  /* -----------------------------------------------------------
     9. Page renderers
     ----------------------------------------------------------- */

  async function renderHome(){
    const tpl = await loadTemplate("home");
    $("#view").innerHTML = tpl;

    const welcome = STATE.profile ? (STATE.profile.display_name || STATE.profile.username) : "player";
    $("#homeGreeting").textContent = "Welcome back, " + welcome;
    $("#homeBadgeText").textContent = "Loading games…";

    try {
      const [popular, newest, updated, myCount] = await Promise.all([
        GBApi.listGames({ sort: "Most Played", limit: 8 }),
        GBApi.listGames({ sort: "Newest", limit: 8 }),
        GBApi.listGames({ sort: "Recently Updated", limit: 8 }),
        GBApi.listMyGames().then(g => g.length).catch(() => 0)
      ]);
      const badgeText = popular.length + " games · you've created " + myCount;
      $("#homeBadgeText").textContent = badgeText;

      let html = "";
      if (popular.length) html += rowSection("Popular Games", popular, "#/discover");
      if (newest.length) html += rowSection("New &amp; Noteworthy", newest, "#/discover");
      if (updated.length) html += rowSection("Recently Updated", updated, "#/discover");

      const suggestions = await GBApi.listProfiles(6).catch(() => []);
      const others = suggestions.filter(p => p.id !== STATE.profile.id).slice(0, 6);
      if (others.length){
        html += sectionBlock("Players on GoodBlox",
          '<div class="person-grid">' + others.map(u =>
            '<div class="person-card">' + avatarHTML(null, 46) +
              '<div class="pmeta"><div class="pname">' + esc(u.display_name || u.username) + "</div>" +
              '<div class="pstatus">@' + esc(u.username) + "</div></div>" +
              '<div class="pactions"><button class="btn btn-ghost btn-sm" data-action="viewProfile" data-id="' + esc(u.id) + '">View</button></div>' +
            "</div>"
          ).join("") + "</div>");
      }
      $("#homeSections").innerHTML = html || emptyState("🎮", "No games yet", "Be the first to publish a game.", '<a class="btn btn-primary" href="#/create">Create a game</a>');
    } catch (err){
      console.error(err);
      $("#homeSections").innerHTML = errorBanner("Could not load games: " + (err.message || err));
    }
  }

  async function renderDiscover(){
    const tpl = await loadTemplate("discover");
    $("#view").innerHTML = tpl;

    const cats = ["Popular", "New", "Recently Updated", "Highest Rated", "Adventure", "Racing", "Simulator", "Tycoon", "PvP", "Social", "Obby", "Survival"];
    $("#discoverChips").innerHTML = cats.map((c, i) =>
      '<button class="chip ' + (i === 0 ? "active" : "") + '" data-action="discoverCat" data-cat="' + esc(c) + '">' + esc(c) + "</button>"
    ).join("");

    let state = { cat: "Popular", sort: "Most Played" };

    async function load(){
      $("#discoverResults").innerHTML = loadingGrid(8);
      try {
        const opts = { sort: state.sort, limit: 60 };
        if (state.cat === "Popular") opts.sort = "Most Played";
        else if (state.cat === "New") opts.sort = "Newest";
        else if (state.cat === "Recently Updated") opts.sort = "Recently Updated";
        else if (state.cat === "Highest Rated") opts.sort = "Highest Rated";
        else opts.category = state.cat;

        const games = await GBApi.listGames(opts);
        $("#discoverResults").innerHTML = games.length
          ? '<div class="game-grid">' + games.map(gameCard).join("") + "</div>"
          : emptyState("🔎", "Nothing here yet", "No games match this filter.");
      } catch (err){
        console.error(err);
        $("#discoverResults").innerHTML = errorBanner("Could not load games: " + (err.message || err));
      }
    }

    $$("#discoverChips .chip").forEach(chip => chip.addEventListener("click", () => {
      $$("#discoverChips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.cat = chip.dataset.cat;
      load();
    }));
    $("#discoverSort").addEventListener("change", e => { state.sort = e.target.value; load(); });
    load();
  }

  async function renderGames(){
    /* Simple list-all page using discover template look */
    $("#view").innerHTML =
      '<div class="page"><div class="toolbar"><h1>All Games</h1>' +
      '<div class="spacer"></div>' +
      '<input class="input" id="gamesSearch" style="width:auto;min-width:220px" placeholder="Filter games…" aria-label="Filter games">' +
      '<select class="input" id="gamesSort" style="width:auto;min-width:180px" aria-label="Sort games">' +
        '<option>Most Played</option><option>Newest</option><option>Recently Updated</option><option>Highest Rated</option>' +
      '</select></div><div id="gamesResults"></div></div>';

    const state = { search: "", sort: "Most Played" };
    let timer = null;
    async function load(){
      $("#gamesResults").innerHTML = loadingGrid(8);
      try {
        const games = await GBApi.listGames({ search: state.search, sort: state.sort, limit: 80 });
        $("#gamesResults").innerHTML = games.length
          ? '<div class="game-grid">' + games.map(gameCard).join("") + "</div>"
          : emptyState("🎮", "No games found", "Try a different search term.");
      } catch (err){
        console.error(err);
        $("#gamesResults").innerHTML = errorBanner("Could not load games: " + (err.message || err));
      }
    }
    $("#gamesSearch").addEventListener("input", e => {
      clearTimeout(timer);
      const v = e.target.value;
      timer = setTimeout(() => { state.search = v; load(); }, 250);
    });
    $("#gamesSort").addEventListener("change", e => { state.sort = e.target.value; load(); });
    load();
  }

  async function renderGame(id){
    const tpl = await loadTemplate("game");
    $("#view").innerHTML = tpl;
    const detail = $("#gameDetail");

    try {
      const game = await GBApi.getGame(id);
      if (!game){
        detail.innerHTML = emptyState("❓", "Game not found", "This game may have been removed.",
          '<a class="btn btn-primary" href="#/discover">Back to Discover</a>');
        return;
      }
      GBApi.incrementVisit(game.id);

      let liked = false;
      try { liked = await GBApi.isGameLiked(game.id); } catch (_){}

      const creator = game.creator || { username: "Unknown", display_name: "Unknown", id: null };
      const isOwner = STATE.profile && creator.id === STATE.profile.id;

      detail.innerHTML =
        '<div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.85fr);gap:22px;align-items:start" class="game-detail-grid">' +
          "<div>" +
            '<div class="thumb" style="border-radius:20px;aspect-ratio:16/9;border:1px solid var(--border);background:linear-gradient(135deg,' + pickGrad(game.id) + ')">' +
              (game.thumbnail_url && /^https?:\/\//.test(game.thumbnail_url)
                ? '<img src="' + esc(game.thumbnail_url) + '" alt="" onerror="this.remove()">' : "") +
              '<span class="thumb-emoji" style="font-size:76px">' + (CATEGORY_EMOJI[game.category] || "🎮") + "</span>" +
              '<span class="thumb-shine"></span>' +
            "</div>" +
            '<div class="card" style="margin-top:18px">' +
              '<h2 style="margin:0 0 12px;font-size:17px">About this game</h2>' +
              '<p style="margin:0;color:var(--muted);line-height:1.7;font-size:14.5px">' + esc(game.description || "No description.") + "</p>" +
              '<div style="display:flex;gap:22px;flex-wrap:wrap;margin-top:20px;padding-top:18px;border-top:1px solid var(--border)">' +
                '<div class="stat"><div class="v">' + dateStr(game.created_at) + '</div><div class="k">Created</div></div>' +
                '<div class="stat"><div class="v">' + dateStr(game.updated_at) + '</div><div class="k">Updated</div></div>' +
                '<div class="stat"><div class="v">' + esc(game.category) + '</div><div class="k">Category</div></div>' +
              "</div>" +
            "</div>" +
          "</div>" +
          "<div>" +
            '<div class="card">' +
              '<h1 style="margin:0 0 6px;font-size:25px;letter-spacing:-.7px">' + esc(game.name) + "</h1>" +
              '<div style="color:var(--muted);font-size:14px;margin-bottom:16px">by ' +
                (creator.id
                  ? '<a class="link" href="#/profile/' + esc(creator.id) + '">' + esc(creator.display_name || creator.username) + "</a>"
                  : esc(creator.display_name || creator.username)) +
              "</div>" +
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">' +
                '<div class="card2 card" style="padding:12px"><div class="stat"><div class="v">' + fmtNum(game.player_count || 0) + '</div><div class="k">Playing</div></div></div>' +
                '<div class="card2 card" style="padding:12px"><div class="stat"><div class="v">' + (game.likes || 0) + '</div><div class="k">Likes</div></div></div>' +
                '<div class="card2 card" style="padding:12px"><div class="stat"><div class="v">' + fmtNum(game.visits || 0) + '</div><div class="k">Visits</div></div></div>' +
                '<div class="card2 card" style="padding:12px"><div class="stat"><div class="v">' + esc(game.category) + '</div><div class="k">Category</div></div></div>' +
              "</div>" +
              '<button class="btn btn-primary btn-block" style="padding:15px;font-size:16px" data-action="play" data-id="' + esc(game.id) + '">' +
                icon("play") + " PLAY" +
              "</button>" +
              '<div style="display:flex;gap:9px;margin-top:10px">' +
                '<button class="btn btn-ghost" style="flex:1" data-action="likeGame" data-id="' + esc(game.id) + '" id="likeBtn">' +
                  icon("heart") + " " + (liked ? "Liked" : "Like") +
                "</button>" +
                (isOwner
                  ? '<button class="btn btn-danger" style="flex:1" data-action="deleteGame" data-id="' + esc(game.id) + '">' + icon("trash") + " Delete</button>"
                  : '<button class="btn btn-ghost" style="flex:1" data-action="shareGame" data-id="' + esc(game.id) + '">' + icon("send") + " Share</button>") +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";

      /* Related games */
      try {
        const related = await GBApi.listGames({ category: game.category, limit: 8 });
        const others = related.filter(g => g.id !== game.id).slice(0, 4);
        if (others.length){
          $("#gameRelated").innerHTML = sectionBlock("More " + game.category + " Games",
            '<div class="game-grid">' + others.map(gameCard).join("") + "</div>", "#/discover", "Browse all");
        }
      } catch (_){}
    } catch (err){
      console.error(err);
      detail.innerHTML = errorBanner("Could not load game: " + (err.message || err));
    }
  }

  async function renderProfile(userId){
    const tpl = await loadTemplate("profile");
    $("#view").innerHTML = tpl;
    const wrap = $("#profileContent");

    try {
      let profile;
      if (userId && userId !== STATE.profile.id){
        profile = await GBApi.getProfile(userId);
      } else {
        profile = STATE.profile;
      }
      if (!profile){
        wrap.innerHTML = emptyState("👤", "Player not found", "That account does not exist.");
        return;
      }
      const avatar = await GBApi.getAvatar(profile.id).catch(() => null);
      const isMe = profile.id === STATE.profile.id;

      /* Get stats */
      const [games, friendship] = await Promise.all([
        GBApi.listGames({ limit: 200 }).then(all => all.filter(g => g.creator_id === profile.id)).catch(() => []),
        isMe ? Promise.resolve(null) : GBApi.getFriendshipWith(profile.id).catch(() => null)
      ]);

      const friendsCount = await countFriends(profile.id).catch(() => 0);
      const totalVisits = games.reduce((s, g) => s + (g.visits || 0), 0);

      let actions = "";
      if (isMe){
        actions =
          '<a class="btn btn-primary" href="#/avatar">Edit Avatar</a>' +
          '<button class="btn btn-ghost" data-action="openEditProfile">Edit Profile</button>';
      } else if (friendship){
        if (friendship.status === "accepted"){
          actions = '<button class="btn btn-ghost" data-action="removeFriend" data-fid="' + esc(friendship.id) + '">Remove Friend</button>' +
                    '<button class="btn btn-primary" data-action="messageUser" data-uid="' + esc(profile.id) + '">Message</button>';
        } else if (friendship.status === "pending"){
          if (friendship.requester_id === STATE.profile.id){
            actions = '<button class="btn btn-ghost" disabled>Request Sent</button>';
          } else {
            actions = '<button class="btn btn-primary" data-action="acceptFriend" data-fid="' + esc(friendship.id) + '">Accept Request</button>' +
                      '<button class="btn btn-ghost" data-action="declineFriend" data-fid="' + esc(friendship.id) + '">Decline</button>';
          }
        }
      } else {
        actions = '<button class="btn btn-primary" data-action="addFriend" data-uid="' + esc(profile.id) + '">Add Friend</button>' +
                  '<button class="btn btn-ghost" data-action="messageUser" data-uid="' + esc(profile.id) + '">Message</button>';
      }

      wrap.innerHTML =
        '<div class="profile-head">' +
          '<div class="profile-banner"></div>' +
          '<div class="profile-body">' +
            avatarHTML(avatar, 108, "avatar-lg") +
            '<div class="profile-info">' +
              "<h1>" + esc(profile.display_name || profile.username) + "</h1>" +
              '<div class="handle">@' + esc(profile.username) + " · Joined " + dateStr(profile.created_at) + "</div>" +
            "</div>" +
            '<div style="display:flex;gap:9px;padding-bottom:6px;flex-wrap:wrap">' + actions + "</div>" +
          "</div>" +
          '<div class="profile-stats">' +
            '<div class="stat"><div class="v">' + friendsCount + '</div><div class="k">Friends</div></div>' +
            '<div class="stat"><div class="v">' + games.length + '</div><div class="k">Games</div></div>' +
            '<div class="stat"><div class="v">' + fmtNum(totalVisits) + '</div><div class="k">Total visits</div></div>' +
          "</div>" +
        "</div>" +

        sectionBlock("About",
          '<div class="card"><p style="margin:0;color:var(--muted);line-height:1.7;font-size:14.5px">' +
            esc(profile.bio || "This player has not written a bio yet.") + "</p></div>", null) +

        sectionBlock(isMe ? "Your Games" : "Games by " + (profile.display_name || profile.username),
          games.length
            ? '<div class="game-grid">' + games.map(gameCard).join("") + "</div>"
            : emptyState("🎮", isMe ? "You have not created a game yet" : "No games yet",
                isMe ? "Head to Create to publish your first world." : "This player has not published anything yet.",
                isMe ? '<a class="btn btn-primary" href="#/create">Create a game</a>' : ""),
          null);
    } catch (err){
      console.error(err);
      wrap.innerHTML = errorBanner("Could not load profile: " + (err.message || err));
    }
  }

  async function countFriends(userId){
    try {
      const { data, error } = await window.gbSupabase
        .from("friendships")
        .select("id, status, requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted");
      if (error) throw error;
      return (data || []).length;
    } catch (_){ return 0; }
  }

  /* -------- Avatar editor -------- */
  const AVATAR_OPTIONS = {
    skin_color:  ["#f8d9b8", "#f2c9a0", "#e0a878", "#c98a5c", "#a86b3c", "#8a5228", "#6b3c1c", "#4a2912", "#ffd9c9", "#d9a3c9"],
    shirt_color: ["#7657ff", "#4d9dff", "#44e4ff", "#3ddc97", "#ffb020", "#ff5d73", "#ff8ad4", "#ffffff", "#1b1f2e", "#5b6478"],
    pants_color: ["#2b3350", "#1b1f2e", "#3d4568", "#4a3b6b", "#5b4636", "#2f4f4a", "#6b2f3f", "#d9d9e0"],
    hair: [
      { id: "none",  label: "Bald" }, { id: "short", label: "Short" },
      { id: "long",  label: "Long" }, { id: "spiky", label: "Spiky" },
      { id: "bun",   label: "Bun" },  { id: "curly", label: "Curly" }
    ],
    face: [
      { id: "smile", label: "Smile" }, { id: "happy", label: "Happy" },
      { id: "cool", label: "Cool" }, { id: "wink", label: "Wink" },
      { id: "surprised", label: "Surprised" }
    ],
    accessory: [
      { id: "none", label: "None" }, { id: "cap", label: "Cap" },
      { id: "beanie", label: "Beanie" }, { id: "crown", label: "Crown" },
      { id: "headphones", label: "Headphones" }, { id: "halo", label: "Halo" }
    ]
  };

  async function renderAvatar(){
    const tpl = await loadTemplate("avatar");
    $("#view").innerHTML = tpl;

    if (!STATE.avatarDraft){
      STATE.avatarDraft = Object.assign({}, AVATAR_DEFAULTS, STATE.avatar || {});
    }
    const av = STATE.avatarDraft;

    $("#avatarStage").innerHTML = avatarHTML(av, 230, "avatar-lg");
    $("#avatarDisplayName").textContent = STATE.profile.display_name || STATE.profile.username;
    $("#avatarUsername").textContent = "@" + STATE.profile.username;

    const swatchRow = (label, key, colors) =>
      '<div style="margin-bottom:20px">' +
        '<div style="font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;margin-bottom:9px">' + label + "</div>" +
        '<div class="swatches">' + colors.map(c =>
          '<div class="swatch ' + (av[key] === c ? "active" : "") + '" data-action="setAvatarColor" data-key="' + key + '" data-value="' + esc(c) + '" style="background:' + esc(c) + '" role="button" tabindex="0" aria-label="' + esc(label + " " + c) + '"></div>'
        ).join("") + "</div>" +
      "</div>";

    const optionRow = (label, key, options) =>
      '<div style="margin-bottom:20px">' +
        '<div style="font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;margin-bottom:9px">' + label + "</div>" +
        '<div class="option-grid">' + options.map(o =>
          '<div class="option ' + (av[key] === o.id ? "active" : "") + '" data-action="setAvatarOption" data-key="' + key + '" data-value="' + o.id + '" role="button" tabindex="0">' + esc(o.label) + "</div>"
        ).join("") + "</div>" +
      "</div>";

    $("#avatarControls").innerHTML =
      swatchRow("Skin tone", "skin_color", AVATAR_OPTIONS.skin_color) +
      swatchRow("Shirt", "shirt_color", AVATAR_OPTIONS.shirt_color) +
      swatchRow("Pants", "pants_color", AVATAR_OPTIONS.pants_color) +
      optionRow("Hair style", "hair", AVATAR_OPTIONS.hair) +
      optionRow("Face", "face", AVATAR_OPTIONS.face) +
      optionRow("Accessory", "accessory", AVATAR_OPTIONS.accessory);
  }

  function refreshAvatarStage(){
    if (!STATE.avatarDraft) return;
    const stage = $("#avatarStage");
    if (stage) stage.innerHTML = avatarHTML(STATE.avatarDraft, 230, "avatar-lg");
    $$('.swatch[data-action="setAvatarColor"]').forEach(s =>
      s.classList.toggle("active", STATE.avatarDraft[s.dataset.key] === s.dataset.value));
    $$('.option[data-action="setAvatarOption"]').forEach(o =>
      o.classList.toggle("active", STATE.avatarDraft[o.dataset.key] === o.dataset.value));
  }

  /* -------- Friends -------- */
  let friendsTab = "online";

  async function renderFriends(){
    const tpl = await loadTemplate("friends");
    $("#view").innerHTML = tpl;

    try {
      const friendships = await GBApi.listFriendships();
      const accepted = friendships.filter(f => f.status === "accepted");
      const pending = friendships.filter(f => f.status === "pending" && f.addressee_id === STATE.profile.id);
      const sent = friendships.filter(f => f.status === "pending" && f.requester_id === STATE.profile.id);

      $("#friendCount").textContent = accepted.length + " friends";

      $("#friendTabs").innerHTML =
        '<button class="chip ' + (friendsTab === "online" ? "active" : "") + '" data-action="friendsTab" data-tab="online">Friends (' + accepted.length + ")</button>" +
        '<button class="chip ' + (friendsTab === "pending" ? "active" : "") + '" data-action="friendsTab" data-tab="pending">Pending (' + pending.length + ")</button>" +
        '<button class="chip ' + (friendsTab === "sent" ? "active" : "") + '" data-action="friendsTab" data-tab="sent">Sent (' + sent.length + ")</button>";

      function otherOf(f){
        return f.requester_id === STATE.profile.id ? f.addressee : f.requester;
      }

      let list = [];
      if (friendsTab === "online") list = accepted;
      else if (friendsTab === "pending") list = pending;
      else list = sent;

      if (!list.length){
        const messages = {
          online: ["👥", "No friends yet", "Send a friend request to get started."],
          pending: ["📬", "No pending requests", "When someone adds you, they will show up here."],
          sent:    ["📤", "No sent requests", "Requests you send will show up here."]
        };
        const [e, t, s] = messages[friendsTab];
        $("#friendsContent").innerHTML = emptyState(e, t, s);
      } else {
        $("#friendsContent").innerHTML = '<div class="person-grid">' + list.map(f => {
          const other = otherOf(f);
          const actions = friendsTab === "pending"
            ? '<button class="btn btn-primary btn-sm" data-action="acceptFriend" data-fid="' + esc(f.id) + '">Accept</button>' +
              '<button class="btn btn-ghost btn-sm" data-action="declineFriend" data-fid="' + esc(f.id) + '">Decline</button>'
            : friendsTab === "sent"
              ? '<button class="btn btn-ghost btn-sm" disabled>Pending</button>'
              : '<button class="btn btn-ghost btn-sm" data-action="viewProfile" data-id="' + esc(other.id) + '">View</button>' +
                '<button class="btn btn-danger btn-sm" data-action="removeFriend" data-fid="' + esc(f.id) + '">Remove</button>';
          return '<div class="person-card">' +
            avatarHTML(null, 50) +
            '<div class="pmeta">' +
              '<div class="pname">' + esc(other.display_name || other.username) + "</div>" +
              '<div class="pstatus">@' + esc(other.username) + "</div>" +
            "</div>" +
            '<div class="pactions">' + actions + "</div>" +
          "</div>";
        }).join("") + "</div>";
      }
    } catch (err){
      console.error(err);
      $("#friendsContent").innerHTML = errorBanner("Could not load friends: " + (err.message || err));
    }
  }

  /* -------- Messages -------- */
  let messagesChannel = null;

  async function renderMessages(param){
    const tpl = await loadTemplate("messages");
    $("#view").innerHTML = tpl;

    let activeId = param || null;
    let activeProfile = null;

    async function loadList(){
      const convos = await GBApi.listConversations();
      const list = $("#convoList");
      let html = '<div class="convo-list-head">Conversations</div>';

      if (!convos.length){
        html += '<div style="padding:26px 16px;color:var(--muted);font-size:13.5px;text-align:center">' +
          "No conversations yet.<br>Add a friend to start chatting.</div>";
      } else {
        for (const c of convos){
          const profile = await GBApi.getProfile(c.otherId).catch(() => null);
          if (!profile) continue;
          const preview = c.last
            ? (c.last.sender_id === STATE.profile.id ? "You: " : "") + c.last.content
            : "Say hello 👋";
          const isActive = activeId === profile.id;
          html += '<div class="convo ' + (isActive ? "active" : "") + '" data-action="openConvo" data-uid="' + esc(profile.id) + '" role="button" tabindex="0">' +
            avatarHTML(null, 42) +
            '<div class="cmeta">' +
              '<div class="cname"><span>' + esc(profile.display_name || profile.username) + "</span>" +
                '<span style="font-weight:500;font-size:11px;color:var(--muted)">' + (c.last ? timeAgo(c.last.created_at) : "") + "</span>" +
              "</div>" +
              '<div class="clast">' + esc(preview) + "</div>" +
            "</div>" +
            (c.unread ? '<span class="unread-dot"></span>' : "") +
          "</div>";
        }
      }
      list.innerHTML = html;
    }

    async function loadChat(){
      if (!activeId){
        $("#chatWindow").innerHTML =
          '<div class="empty-chat"><div><div style="font-size:38px;margin-bottom:12px">💬</div>' +
          "<div>Select a conversation to start chatting.</div></div></div>";
        return;
      }
      activeProfile = await GBApi.getProfile(activeId);
      if (!activeProfile){
        $("#chatWindow").innerHTML = errorBanner("Player not found.");
        return;
      }
      await GBApi.markMessagesRead(activeId).catch(() => {});
      const messages = await GBApi.listMessages(activeId);
      const body =
        messages.length
          ? messages.map(m =>
              '<div class="msg ' + (m.sender_id === STATE.profile.id ? "me" : "them") + '">' +
                esc(m.content) +
                '<span class="ts">' + clockStr(m.created_at) + " · " + timeAgo(m.created_at) + "</span>" +
              "</div>").join("")
          : '<div class="empty-chat">No messages yet. Say hi to ' + esc(activeProfile.display_name || activeProfile.username) + "!</div>";

      $("#chatWindow").innerHTML =
        '<div class="chat-head">' +
          avatarHTML(null, 40) +
          "<div>" +
            '<div class="cname">' + esc(activeProfile.display_name || activeProfile.username) + "</div>" +
            '<div class="cstatus">@' + esc(activeProfile.username) + "</div>" +
          "</div>" +
          '<button class="btn btn-ghost btn-sm" style="margin-left:auto" data-action="viewProfile" data-id="' + esc(activeProfile.id) + '">Profile</button>' +
        "</div>" +
        '<div class="chat-body" id="chatBody">' + body + "</div>" +
        '<form class="chat-input" id="chatForm">' +
          '<input id="chatText" placeholder="Message @' + esc(activeProfile.username) + '…" autocomplete="off" aria-label="Message text">' +
          '<button class="btn btn-primary" type="submit">' + icon("send") + " Send</button>" +
        "</form>";

      const chatBody = $("#chatBody");
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

      $("#chatForm").addEventListener("submit", async e => {
        e.preventDefault();
        const input = $("#chatText");
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        try {
          await GBApi.sendMessage(activeProfile.id, text);
          loadChat();
        } catch (ex){
          toast(ex.message || "Failed to send.", "err");
        }
      });
    }

    await loadList();
    await loadChat();

    /* Realtime: reload current chat when a new message arrives */
    if (messagesChannel){
      try { messagesChannel.unsubscribe(); } catch (_){}
    }
    try {
      messagesChannel = GBApi.subscribeToMessages(payload => {
        const m = payload.new;
        if (!m) return;
        const involved = m.sender_id === STATE.profile.id || m.receiver_id === STATE.profile.id;
        if (!involved) return;
        if (activeId && (m.sender_id === activeId || m.receiver_id === activeId)) {
          loadChat();
        } else {
          loadList();
        }
        refreshBadges().then(buildNav);
      });
      STATE.messagesChannel = messagesChannel;
    } catch (err){ console.warn("Realtime unavailable", err); }
  }

  /* -------- Notifications -------- */
  async function renderNotifications(){
    $("#view").innerHTML =
      '<div class="page"><div class="toolbar"><h1>Notifications</h1>' +
      '<span class="rating-pill" id="notifCount"></span><div class="spacer"></div>' +
      '<button class="btn btn-ghost btn-sm" data-action="markAllRead">Mark all as read</button></div>' +
      '<div id="notifList"></div></div>';

    try {
      const list = await GBApi.listNotifications();
      const unread = list.filter(n => !n.read).length;
      $("#notifCount").textContent = unread ? unread + " unread" : list.length + " total";

      const describe = n => {
        const p = n.payload || {};
        switch (n.type){
          case "friend_request":   return "@" + (p.from_username || "someone") + " sent you a friend request.";
          case "friend_accepted":  return "@" + (p.from_username || "someone") + " accepted your friend request.";
          case "game_liked":       return "@" + (p.from_username || "someone") + " liked your game " + (p.game_name ? '"' + p.game_name + '"' : "") + ".";
          case "message":          return "@" + (p.from_username || "someone") + ": " + (p.preview || "sent a message");
          default:                 return "New notification";
        }
      };
      const iconFor = n => ({
        friend_request: "👥", friend_accepted: "✅",
        game_liked: "❤️", message: "💬"
      })[n.type] || "🔔";

      $("#notifList").innerHTML = list.length
        ? list.map(n =>
            '<div class="notif ' + (n.read ? "" : "unread") + '" data-action="openNotification" data-id="' + esc(n.id) + '" data-type="' + esc(n.type) + '" data-payload="' + esc(JSON.stringify(n.payload || {})) + '" role="button" tabindex="0">' +
              '<div class="nicon">' + iconFor(n) + "</div>" +
              '<div class="ntext">' + esc(describe(n)) + '<div class="ntime">' + timeAgo(n.created_at) + "</div></div>" +
              (n.read ? "" : '<span class="unread-dot" style="margin-top:8px"></span>') +
            "</div>"
          ).join("")
        : emptyState("🔔", "No notifications", "Friend requests, likes and messages will show up here.");
    } catch (err){
      console.error(err);
      $("#notifList").innerHTML = errorBanner("Could not load notifications: " + (err.message || err));
    }
  }

  /* -------- Create / Edit game -------- */
  async function renderCreate(){
    const tpl = await loadTemplate("create");
    $("#view").innerHTML = tpl;

    const cats = (window.GOODBLOX_CONFIG || {}).GAME_CATEGORIES || ["Adventure", "Racing", "Simulator", "Tycoon", "PvP", "Social", "Obby", "Survival"];
    $("#cgCategory").innerHTML = cats.map(c => '<option>' + esc(c) + "</option>").join("");

    const editing = STATE.editingGameId;
    let editingGame = null;
    if (editing){
      editingGame = await GBApi.getGame(editing).catch(() => null);
      if (editingGame && editingGame.creator_id === STATE.profile.id){
        $("#createTitle").textContent = "Edit Game";
        $("#cgName").value = editingGame.name;
        $("#cgDesc").value = editingGame.description || "";
        $("#cgCategory").value = editingGame.category;
        $("#cgThumb").value = editingGame.thumbnail_url || "";
        $("#cgSubmit").textContent = "SAVE CHANGES";
        $("#cgCancel").classList.remove("hidden");
        $("#cgCancel").addEventListener("click", () => {
          STATE.editingGameId = null;
          renderCreate();
        });
      } else {
        STATE.editingGameId = null;
      }
    }

    /* live preview */
    const preview = () => {
      const g = {
        id: editing || "preview",
        name: $("#cgName").value.trim() || "Untitled Game",
        description: $("#cgDesc").value.trim(),
        category: $("#cgCategory").value,
        thumbnail_url: $("#cgThumb").value.trim(),
        creator: { display_name: STATE.profile.display_name, username: STATE.profile.username },
        likes: 0, visits: 0, player_count: 0
      };
      $("#createPreview").innerHTML = gameCard(g);
      const el = $("#createPreview");
      $$("[data-action]", el).forEach(n => n.removeAttribute("data-action"));
    };
    ["cgName", "cgDesc", "cgCategory", "cgThumb"].forEach(id => {
      const el = $("#" + id);
      el.addEventListener("input", preview);
      el.addEventListener("change", preview);
    });
    preview();

    /* my games */
    const myGames = await GBApi.listMyGames().catch(() => []);
    $("#myGamesCount").textContent = myGames.length + " created";
    $("#myGames").innerHTML = myGames.length
      ? '<div class="game-grid">' + myGames.map(g =>
          '<div class="game-card" style="cursor:default">' + thumbHTML(g) +
            '<div class="game-card-body">' +
              "<h3>" + esc(g.name) + "</h3>" +
              '<div class="creator">' + esc(g.category) + " · " + fmtNum(g.visits || 0) + " visits</div>" +
              '<div class="game-card-foot" style="gap:6px;flex-wrap:wrap">' +
                '<button class="btn btn-ghost btn-sm" data-action="openGame" data-id="' + esc(g.id) + '" title="View">' + icon("eye") + "</button>" +
                '<button class="btn btn-ghost btn-sm" data-action="editGame" data-id="' + esc(g.id) + '" title="Edit">' + icon("edit") + "</button>" +
                '<button class="btn btn-danger btn-sm" data-action="deleteGame" data-id="' + esc(g.id) + '" title="Delete">' + icon("trash") + "</button>" +
              "</div>" +
            "</div>" +
          "</div>"
        ).join("") + "</div>"
      : emptyState("🛠️", "You have not published a game yet", "Fill in the form and hit CREATE GAME to publish your first world.");

    /* submit */
    $("#createForm").addEventListener("submit", async e => {
      e.preventDefault();
      const errEl = $("#createError"), okEl = $("#createSuccess");
      errEl.textContent = ""; okEl.textContent = "";

      const name = $("#cgName").value.trim();
      const description = $("#cgDesc").value.trim();
      const category = $("#cgCategory").value;
      const thumbnail = $("#cgThumb").value.trim();

      if (!name){ errEl.textContent = "Please enter a game name."; return; }
      if (name.length < 3){ errEl.textContent = "Game name must be at least 3 characters."; return; }
      if (!description){ errEl.textContent = "Please write a short description."; return; }
      if (thumbnail && !/^https?:\/\//i.test(thumbnail)){ errEl.textContent = "Thumbnail URL must start with http:// or https://"; return; }

      const btn = $("#cgSubmit");
      btn.disabled = true;
      const old = btn.textContent;
      btn.textContent = editing ? "Saving…" : "Creating…";

      try {
        if (editing){
          await GBApi.updateGame(editing, { name, description, category, thumbnail_url: thumbnail || null });
          STATE.editingGameId = null;
          toast("Game updated.", "ok");
          renderCreate();
        } else {
          const game = await GBApi.createGame({ name, description, category, thumbnail_url: thumbnail || null });
          okEl.textContent = 'Game "' + game.name + '" created.';
          toast("Game created successfully!", "ok");
          setTimeout(() => renderCreate(), 600);
        }
      } catch (ex){
        console.error(ex);
        errEl.textContent = ex.message || "Failed to save game.";
        btn.disabled = false;
        btn.textContent = old;
      }
    });
  }

  /* -------- Settings -------- */
  async function renderSettings(){
    const tpl = await loadTemplate("settings");
    $("#view").innerHTML = tpl;

    $("#setDisplay").value = STATE.profile.display_name || STATE.profile.username;
    $("#setBio").value = STATE.profile.bio || "";
    $("#accountMeta").innerHTML =
      "Username: <strong>@" + esc(STATE.profile.username) + "</strong> · Joined " + dateStr(STATE.profile.created_at) +
      '<br>User ID: <code style="font-size:11px">' + esc(STATE.profile.id) + "</code>";

    $$('[data-setting]').forEach(input => {
      input.checked = !!STATE.settings[input.dataset.setting];
      input.addEventListener("change", e => {
        STATE.settings[e.target.dataset.setting] = e.target.checked;
        saveSettings();
        applySettings();
      });
    });
  }

  /* -----------------------------------------------------------
     10. Actions
     ----------------------------------------------------------- */
  const actions = {
    nav(el){
      const to = el.dataset.to;
      if (to === "logout"){ actions.logout(); return; }
      if (to === "profile"){ location.hash = "#/profile/" + STATE.profile.id; return; }
      location.hash = "#/" + to;
    },

    openGame(el){ location.hash = "#/game/" + el.dataset.id; },
    viewProfile(el){ location.hash = "#/profile/" + el.dataset.id; },
    messageUser(el){ location.hash = "#/messages/" + el.dataset.uid; },
    openConvo(el){ location.hash = "#/messages/" + el.dataset.uid; },

    playRandom(){
      GBApi.listGames({ limit: 20 }).then(list => {
        if (!list.length){ toast("No games yet.", "warn"); return; }
        actions.play({ dataset: { id: pick(list).id } });
      });
    },

    play(el){
      const id = el.dataset.id;
      if (!id) return;
      GBApi.getGame(id).then(game => {
        if (!game) return;
        openModal(
          '<div style="text-align:center;padding:14px 0 4px">' +
            '<div class="spinner"></div>' +
            '<h3 style="margin:0 0 8px;font-size:18px">Launching GoodBlox</h3>' +
            '<p style="color:var(--muted);margin:0;font-size:14px" id="launchStatus">Connecting to ' + esc(game.name) + "…</p>" +
            '<div class="progress"><span id="launchBar"></span></div>' +
          "</div>",
          { title: game.name }
        );
        const statuses = ["Connecting to server…", "Loading assets…", "Spawning your avatar…", "Almost there…"];
        let step = 0;
        const bar = $("#launchBar");
        const statusEl = $("#launchStatus");
        const t = setInterval(() => {
          step++;
          if (bar) bar.style.width = Math.min(100, step * 12.5) + "%";
          if (statusEl) statusEl.textContent = statuses[Math.min(statuses.length - 1, Math.floor(step / 2))];
          if (step >= 8){
            clearInterval(t);
            const body = document.querySelector(".modal-body");
            if (body){
              body.innerHTML =
                '<div style="text-align:center;padding:14px 0 4px">' +
                  '<div style="font-size:52px;margin-bottom:12px">✅</div>' +
                  '<h3 style="margin:0 0 8px;font-size:18px">Game client not installed</h3>' +
                  '<p style="color:var(--muted);margin:0 0 20px;font-size:14px">' +
                    "In a full build, this would open " + esc(game.name) + " inside the GoodBlox game client. " +
                    "GoodBlox does not execute external programs from the browser." +
                  "</p>" +
                  '<button class="btn btn-primary" data-action="closeModal">Close</button>' +
                "</div>";
            }
          }
        }, 260);
      });
    },

    async likeGame(el){
      const id = el.dataset.id;
      try {
        const liked = await GBApi.toggleGameLike(id);
        toast(liked ? "Liked!" : "Like removed.", "ok");
        renderGame(id);
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    shareGame(el){
      const url = location.origin + location.pathname + "#/game/" + el.dataset.id;
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      toast("Link copied to clipboard.", "ok");
    },

    async addFriend(el){
      try {
        await GBApi.sendFriendRequest(el.dataset.uid);
        toast("Friend request sent.", "ok");
        if (STATE.route.page === "profile") renderProfile(el.dataset.uid);
      } catch (ex){ toast(ex.message || "Failed to send request.", "warn"); }
    },

    async acceptFriend(el){
      try {
        await GBApi.respondToFriendRequest(el.dataset.fid, "accepted");
        toast("Friend accepted.", "ok");
        route();
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    async declineFriend(el){
      try {
        await GBApi.respondToFriendRequest(el.dataset.fid, "declined");
        toast("Request declined.", "ok");
        route();
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    async removeFriend(el){
      if (!confirm("Remove this friend?")) return;
      try {
        await GBApi.removeFriendship(el.dataset.fid);
        toast("Friend removed.", "ok");
        route();
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    friendsTab(el){ friendsTab = el.dataset.tab; renderFriends(); },
    discoverCat(el){ /* handled inline */ },

    setAvatarColor(el){
      STATE.avatarDraft[el.dataset.key] = el.dataset.value;
      refreshAvatarStage();
    },
    setAvatarOption(el){
      STATE.avatarDraft[el.dataset.key] = el.dataset.value;
      refreshAvatarStage();
    },
    randomAvatar(){
      STATE.avatarDraft = {
        skin_color: pick(AVATAR_OPTIONS.skin_color),
        shirt_color: pick(AVATAR_OPTIONS.shirt_color),
        pants_color: pick(AVATAR_OPTIONS.pants_color),
        hair: pick(AVATAR_OPTIONS.hair).id,
        face: pick(AVATAR_OPTIONS.face).id,
        accessory: pick(AVATAR_OPTIONS.accessory).id
      };
      renderAvatar();
    },
    resetAvatar(){
      STATE.avatarDraft = Object.assign({}, AVATAR_DEFAULTS);
      renderAvatar();
      toast("Avatar reset.", "ok");
    },
    async saveAvatar(){
      try {
        STATE.avatar = await GBApi.saveMyAvatar(STATE.avatarDraft);
        toast("Avatar saved!", "ok");
        buildNav();
      } catch (ex){ toast(ex.message || "Failed to save avatar.", "err"); }
    },

    openEditProfile(){
      openModal(
        '<label class="field"><span>Display name</span>' +
          '<input class="input" id="mDisplay" value="' + esc(STATE.profile.display_name || STATE.profile.username) + '" maxlength="60"></label>' +
        '<label class="field"><span>Bio</span>' +
          '<textarea class="input" id="mBio" maxlength="400">' + esc(STATE.profile.bio || "") + "</textarea></label>" +
        '<div class="form-error" id="mError"></div>' +
        '<button class="btn btn-primary btn-block" id="mSave">Save Profile</button>',
        { title: "Edit Profile" }
      );
      $("#mSave").addEventListener("click", async () => {
        const display = $("#mDisplay").value.trim();
        const bio = $("#mBio").value.trim();
        const err = $("#mError");
        err.textContent = "";
        if (!display){ err.textContent = "Display name cannot be empty."; return; }
        try {
          STATE.profile = await GBApi.updateMyProfile({ display_name: display, bio });
          closeModal();
          toast("Profile updated.", "ok");
          buildNav();
          route();
        } catch (ex){ err.textContent = ex.message || "Failed."; }
      });
    },

    async saveProfile(){
      const display = $("#setDisplay").value.trim();
      const bio = $("#setBio").value.trim();
      const errEl = $("#settingsError"), okEl = $("#settingsSuccess");
      errEl.textContent = ""; okEl.textContent = "";
      if (!display){ errEl.textContent = "Display name cannot be empty."; return; }
      try {
        STATE.profile = await GBApi.updateMyProfile({ display_name: display, bio });
        okEl.textContent = "Profile saved.";
        toast("Profile updated.", "ok");
        buildNav();
      } catch (ex){ errEl.textContent = ex.message || "Failed."; }
    },

    async editGame(el){
      STATE.editingGameId = el.dataset.id;
      location.hash = "#/create";
      if (STATE.route.page === "create") renderCreate();
    },

    async deleteGame(el){
      if (!confirm("Delete this game permanently?")) return;
      try {
        await GBApi.deleteGame(el.dataset.id);
        toast("Game deleted.", "ok");
        if (STATE.route.page === "create") renderCreate();
        else location.hash = "#/create";
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    async markAllRead(){
      try {
        await GBApi.markAllNotificationsRead();
        toast("All marked as read.", "ok");
        renderNotifications();
        await refreshBadges(); buildNav();
      } catch (ex){ toast(ex.message || "Failed.", "err"); }
    },

    async openNotification(el){
      try { await GBApi.markNotificationRead(el.dataset.id); } catch (_){}
      const type = el.dataset.type;
      let payload = {};
      try { payload = JSON.parse(el.dataset.payload || "{}"); } catch (_){}
      if (type === "friend_request" || type === "friend_accepted"){
        if (payload.from_user) location.hash = "#/profile/" + payload.from_user;
      } else if (type === "game_liked"){
        if (payload.game_id) location.hash = "#/game/" + payload.game_id;
      } else if (type === "message"){
        if (payload.from_user) location.hash = "#/messages/" + payload.from_user;
      } else {
        renderNotifications();
      }
      await refreshBadges(); buildNav();
    },

    async logout(){
      if (!confirm("Sign out of GoodBlox?")) return;
      try {
        if (STATE.messagesChannel) try { STATE.messagesChannel.unsubscribe(); } catch (_){}
        await GBAuth.signOut();
        location.replace("login.html");
      } catch (ex){ toast(ex.message || "Failed to sign out.", "err"); }
    },

    closeModal(){ closeModal(); },
    modalBackdrop(el, e){ if (e.target === el) closeModal(); }
  };

  /* -----------------------------------------------------------
     11. Event delegation
     ----------------------------------------------------------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const act = el.dataset.action;
    if (!actions[act]) return;
    if (act === "modalBackdrop"){
      if (e.target === el) closeModal();
      return;
    }
    if (act === "closeModal"){
      if (e.target.closest(".modal") && el.classList.contains("modal-backdrop")) return;
      e.preventDefault();
      closeModal();
      return;
    }
    if (el.tagName === "A" && el.getAttribute("href")) return;
    e.preventDefault();
    actions[act](el, e);
  });

  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="button"][tabindex]')){
      e.preventDefault();
      e.target.click();
    }
    if (e.key === "Escape"){
      if ($("#modalRoot") && $("#modalRoot").innerHTML.trim()) closeModal();
      const sr = $("#searchResults");
      if (sr) sr.classList.add("hidden");
    }
  });

  /* -----------------------------------------------------------
     12. Global search
     ----------------------------------------------------------- */
  let searchTimer = null;
  function bindSearch(){
    const input = $("#globalSearch");
    const box = $("#searchResults");
    if (!input) return;

    input.addEventListener("input", e => {
      clearTimeout(searchTimer);
      const q = e.target.value.trim();
      searchTimer = setTimeout(() => runSearch(q), 180);
    });
    input.addEventListener("focus", e => {
      if (e.target.value.trim()) runSearch(e.target.value.trim());
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".searchbox") && box) box.classList.add("hidden");
    });
  }

  async function runSearch(query){
    const box = $("#searchResults");
    if (!box) return;
    if (!query){
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }
    box.innerHTML = '<div class="search-empty">Searching…</div>';
    box.classList.remove("hidden");

    try {
      const [games, users] = await Promise.all([
        GBApi.listGames({ search: query, limit: 5 }).catch(() => []),
        GBApi.listProfiles(200).then(list =>
          list.filter(p =>
            p.username.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
            (p.display_name || "").toLowerCase().indexOf(query.toLowerCase()) !== -1
          ).slice(0, 5)
        ).catch(() => [])
      ]);

      if (!games.length && !users.length){
        box.innerHTML = '<div class="search-empty">No results found for "' + esc(query) + '"</div>';
        return;
      }

      let html = "";
      if (games.length){
        html += '<div class="search-group-title">Games</div>';
        html += games.map(g =>
          '<div class="search-item" data-action="openGame" data-id="' + esc(g.id) + '" role="button" tabindex="0">' +
            '<div style="width:44px;height:30px;border-radius:8px;background:linear-gradient(135deg,' + pickGrad(g.id) + ');display:grid;place-items:center;font-size:15px;flex:none">' + (CATEGORY_EMOJI[g.category] || "🎮") + "</div>" +
            '<div><div class="t">' + esc(g.name) + "</div><div class=\"s\">by " + esc(g.creator ? g.creator.username : "?") + " · " + esc(g.category) + "</div></div>" +
          "</div>"
        ).join("");
      }
      if (users.length){
        html += '<div class="search-group-title">Players</div>';
        html += users.map(u =>
          '<div class="search-item" data-action="viewProfile" data-id="' + esc(u.id) + '" role="button" tabindex="0">' +
            avatarHTML(null, 34) +
            '<div><div class="t">' + esc(u.display_name || u.username) + "</div><div class=\"s\">@" + esc(u.username) + "</div></div>" +
          "</div>"
        ).join("");
      }
      box.innerHTML = html;
    } catch (err){
      console.error(err);
      box.innerHTML = '<div class="search-empty">Search failed. ' + esc(err.message || "") + "</div>";
    }
  }

  /* -----------------------------------------------------------
     13. Router
     ----------------------------------------------------------- */
  async function route(){
    if (!STATE.profile) return;

    const raw = location.hash.replace(/^#\/?/, "") || "home";
    const parts = raw.split("/").filter(Boolean);
    const page = parts[0] || "home";
    const param = parts.slice(1).join("/");

    STATE.route = { page, param };

    const view = $("#view");
    view.innerHTML = '<div class="skeleton-grid"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div>';

    try {
      switch (page){
        case "home":          await renderHome(); break;
        case "discover":      await renderDiscover(); break;
        case "games":         await renderGames(); break;
        case "game":          await renderGame(decodeURIComponent(param)); break;
        case "create":        await renderCreate(); break;
        case "avatar":        await renderAvatar(); break;
        case "friends":       await renderFriends(); break;
        case "messages":      await renderMessages(param ? decodeURIComponent(param) : null); break;
        case "notifications": await renderNotifications(); break;
        case "profile":       await renderProfile(param ? decodeURIComponent(param) : STATE.profile.id); break;
        case "settings":      await renderSettings(); break;
        default:
          view.innerHTML = emptyState("🧭", "Page not found", "That route does not exist.",
            '<a class="btn btn-primary" href="#/home">Go home</a>');
      }
    } catch (err){
      console.error("[GoodBlox] Render error:", err);
      view.innerHTML = errorBanner("Something went wrong: " + (err.message || err));
    }

    buildNav();
  }

  /* -----------------------------------------------------------
     14. Boot
     ----------------------------------------------------------- */
  async function boot(){
    const bootScreen = $("#bootScreen");

    if (!GBAuth.isConfigured()){
      bootScreen.classList.add("hidden");
      $("#configError").classList.remove("hidden");
      if (window.gbSupabaseError){
        $("#configErrorText").textContent = window.gbSupabaseError;
      }
      return;
    }

    try {
      const session = await GBAuth.getSession();
      if (!session){
        location.replace("login.html");
        return;
      }

      STATE.user = session.user;

      /* Fetch profile (auto-created by trigger) */
      let profile = null;
      for (let i = 0; i < 6 && !profile; i++){
        profile = await GBApi.getProfile(STATE.user.id).catch(() => null);
        if (!profile) await new Promise(r => setTimeout(r, 500));
      }
      if (!profile){
        bootScreen.innerHTML =
          '<div style="text-align:center;max-width:520px;padding:24px">' +
            '<div style="font-size:44px;margin-bottom:12px">⚠️</div>' +
            '<h2 style="margin:0 0 10px">Profile not found</h2>' +
            '<p style="color:var(--muted);line-height:1.6;margin:0 0 16px">' +
              "Your account exists but no profile row was created. This usually means the SQL schema from <code>sql/schema.sql</code> has not been run yet." +
            "</p>" +
            '<button class="btn btn-danger" onclick="localStorage.clear();location.href=\'login.html\'">Sign out</button>' +
          "</div>";
        return;
      }
      STATE.profile = profile;
      STATE.avatar = await GBApi.getMyAvatar().catch(() => null);

      applySettings();
      bootScreen.classList.add("hidden");
      $("#appShell").classList.remove("hidden");

      await refreshBadges();
      bindSearch();
      buildNav();

      /* Auth state listener */
      GBAuth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_OUT"){
          location.replace("login.html");
        } else if (event === "TOKEN_REFRESHED"){
          /* no-op: session was refreshed silently */
        } else if (event === "USER_UPDATED"){
          STATE.user = await GBAuth.getUser().catch(() => STATE.user);
        }
      });

      /* Periodic badge refresh (light: every 30s) */
      setInterval(async () => {
        if (document.hidden) return;
        await refreshBadges();
        buildNav();
      }, 30000);

      window.addEventListener("hashchange", route);

      if (!location.hash || location.hash === "#/" || location.hash === "#"){
        location.hash = "#/home";
      }
      await route();
    } catch (err){
      console.error("[GoodBlox] Boot error:", err);
      bootScreen.innerHTML =
        '<div style="text-align:center;max-width:520px;padding:24px">' +
          '<div style="font-size:44px;margin-bottom:12px">⚠️</div>' +
          '<h2 style="margin:0 0 10px">Could not start GoodBlox</h2>' +
          '<p style="color:var(--muted);line-height:1.6;margin:0 0 16px">' + esc(err.message || String(err)) + "</p>" +
          '<button class="btn btn-danger" onclick="localStorage.clear();location.href=\'login.html\'">Reset & sign in</button>' +
        "</div>";
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();
})();
