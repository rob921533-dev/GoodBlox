(function () {
  "use strict";

  console.log("[GoodBlox] Initializing application...");

  // 1. DOM Helper Functions
  function h(tag, props, children) {
    var el = document.createElement(tag);
    var k, arr, i, c;

    if (props) {
      for (k in props) {
        if (Object.prototype.hasOwnProperty.call(props, k)) {
          if (k === "style") {
            el.style.cssText = props[k];
          } else if (k.indexOf("data-") === 0) {
            el.setAttribute(k, props[k]);
          } else {
            el[k] = props[k];
          }
        }
      }
    }

    if (children !== undefined && children !== null) {
      arr = Array.isArray(children) ? children : [children];
      for (i = 0; i < arr.length; i++) {
        c = arr[i];
        if (typeof c === "string" || typeof c === "number") {
          el.appendChild(document.createTextNode(String(c)));
        } else if (c && c.nodeType) {
          el.appendChild(c);
        }
      }
    }
    return el;
  }

  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  // 2. Constants & Helpers
  var CATEGORY_ICON = {
    Adventure: "Adv",
    Obby: "Run",
    Simulator: "Sim",
    Tycoon: "Tyc",
    Roleplay: "RP",
    Action: "Act"
  };

  var GRADIENTS = [
    "#4f46e5, #06b6d4",
    "#f59e0b, #ef4444",
    "#10b981, #3b82f6",
    "#8b5cf6, #ec4899",
    "#6366f1, #14b8a6"
  ];

  function pickGrad(id) {
    var hash = 0;
    var str = String(id || "default");
    var i;
    for (i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    var idx = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[idx];
  }

  function avatarNode(avatarUrl, size) {
    var s = size || 36;
    if (avatarUrl) {
      return h("img", {
        src: avatarUrl,
        className: "avatar",
        style: "width:" + s + "px;height:" + s + "px;border-radius:50%;object-fit:cover",
        alt: "Avatar"
      });
    }

    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", s);
    svg.setAttribute("height", s);
    svg.setAttribute("viewBox", "0 0 36 36");
    svg.setAttribute("style", "border-radius:50%;background:#1e293b");

    var c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", "18");
    c.setAttribute("cy", "12");
    c.setAttribute("r", "7");
    c.setAttribute("fill", "#94a3b8");

    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", "M6 32c0-6.6 5.4-12 12-12s12 5.4 12 12");
    p.setAttribute("fill", "#94a3b8");

    svg.appendChild(c);
    svg.appendChild(p);
    return svg;
  }

  // 3. Application State
  var STATE = {
    user: null,
    profile: null,
    route: { page: "home", param: "" },
    launchTimer: null,
    messagesChannel: null,
    currentSearchToken: 0
  };

  // 4. Supabase Client Initialization
  var supabase = null;
  if (window.supabase && typeof window.supabase.createClient === "function") {
    var url = window.https://yxlmpfhmddadjormqdln.supabase.co || "";
    var key = window.sb_publishable_9qWjySjK_apijQQn_UxrSQ_hwxGVj8V || "";
    if (url && key) {
      supabase = window.supabase.createClient(url, key);
      console.log("[GoodBlox] Supabase client ready.");
    } else {
      console.warn("[GoodBlox] Supabase credentials (SUPABASE_URL / SUPABASE_ANON_KEY) are missing.");
    }
  } else {
    console.warn("[GoodBlox] Supabase SDK script tag not found.");
  }

  // 5. Auth Service
  var GBAuth = {
    getUser: function () {
      if (!supabase) {
        return Promise.resolve(null);
      }
      return supabase.auth.getUser().then(function (res) {
        if (res && res.data && res.data.user) {
          return res.data.user;
        }
        return null;
      }).catch(function () {
        return null;
      });
    },
    getProfile: function (userId) {
      if (!supabase || !userId) {
        return Promise.resolve(null);
      }
      return supabase.from("profiles").select("*").eq("id", userId).single().then(function (res) {
        return res.data || null;
      }).catch(function () {
        return null;
      });
    },
    signOut: function () {
      if (supabase) {
        return supabase.auth.signOut().then(function () {
          STATE.user = null;
          STATE.profile = null;
          window.location.hash = "#/login";
        });
      }
      return Promise.resolve();
    }
  };

  // 6. API Service
  var GBApi = {
    listGames: function (opts) {
      if (!supabase) {
        return Promise.resolve([]);
      }
      var options = opts || {};
      var search = options.search || "";
      var category = options.category || "";
      var limit = options.limit || 20;

      var q = supabase.from("games").select("*, creator:profiles(username, display_name)").limit(limit);

      if (search) {
        q = q.ilike("name", "%" + search + "%");
      }
      if (category) {
        q = q.eq("category", category);
      }

      return q.then(function (res) {
        if (res.error) {
          throw res.error;
        }
        return res.data || [];
      });
    },
    getGame: function (id) {
      if (!supabase) {
        return Promise.resolve(null);
      }
      return supabase.from("games").select("*, creator:profiles(username, display_name)").eq("id", id).single().then(function (res) {
        if (res.error) {
          throw res.error;
        }
        return res.data;
      });
    },
    listProfiles: function (limit) {
      if (!supabase) {
        return Promise.resolve([]);
      }
      var max = limit || 50;
      return supabase.from("profiles").select("*").limit(max).then(function (res) {
        if (res.error) {
          throw res.error;
        }
        return res.data || [];
      });
    },
    getMessages: function (recipientId) {
      if (!supabase || !STATE.user) {
        return Promise.resolve([]);
      }
      var f1 = "and(sender_id.eq." + STATE.user.id + ",recipient_id.eq." + recipientId + ")";
      var f2 = "and(sender_id.eq." + recipientId + ",recipient_id.eq." + STATE.user.id + ")";
      var filter = f1 + "," + f2;

      return supabase.from("messages").select("*").or(filter).order("created_at", { ascending: true }).then(function (res) {
        if (res.error) {
          throw res.error;
        }
        return res.data || [];
      });
    },
    sendMessage: function (recipientId, body) {
      if (!supabase || !STATE.user) {
        return Promise.resolve(null);
      }
      var payload = {
        sender_id: STATE.user.id,
        recipient_id: recipientId,
        body: body
      };
      return supabase.from("messages").insert(payload).select().single().then(function (res) {
        if (res.error) {
          throw res.error;
        }
        return res.data;
      });
    },
    subscribeMessages: function (recipientId, onMessage) {
      if (!supabase || !STATE.user) {
        return null;
      }
      var chanName = "messages:" + STATE.user.id + ":" + recipientId;
      var config = {
        event: "INSERT",
        schema: "public",
        table: "messages"
      };

      return supabase.channel(chanName).on("postgres_changes", config, function (payload) {
        var msg = payload.new;
        var isDirect = (msg.sender_id === STATE.user.id && msg.recipient_id === recipientId);
        var isReply = (msg.sender_id === recipientId && msg.recipient_id === STATE.user.id);
        if (isDirect || isReply) {
          onMessage(msg);
        }
      }).subscribe();
    }
  };

  // 7. Modal Component
  function closeModal() {
    if (STATE.launchTimer) {
      clearInterval(STATE.launchTimer);
      STATE.launchTimer = null;
    }
    var root = $("#modalRoot");
    if (root) {
      root.innerHTML = "";
    }
  }

  function stopProp(e) {
    e.stopPropagation();
  }

  function openModal(contentNode, options) {
    closeModal();
    var root = $("#modalRoot");
    if (!root) {
      return;
    }
    var title = (options && options.title) ? options.title : "";

    var header = h("div", { className: "modal-header" }, [
      h("h3", {}, title),
      h("button", { className: "btn-close", "data-action": "closeModal" }, "×")
    ]);

    var card = h("div", { className: "modal-card", role: "dialog", onclick: stopProp }, [
      header,
      h("div", { className: "modal-body" }, [contentNode])
    ]);

    var backdrop = h("div", { className: "modal-backdrop", "data-action": "closeModal" }, [card]);

    root.appendChild(backdrop);
    var focusable = root.querySelector("input, select, button, textarea, [tabindex='0']");
    if (focusable) {
      focusable.focus();
    }
  }

  // 8. Search System
  function runSearch(query) {
    var box = $("#searchResults");
    if (!box) {
      return;
    }

    var trimmed = query.trim();
    if (!trimmed) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    STATE.currentSearchToken++;
    var token = STATE.currentSearchToken;
    box.innerHTML = "";
    box.appendChild(h("div", { className: "search-empty" }, "Searching..."));
    box.classList.remove("hidden");

    var p1 = GBApi.listGames({ search: trimmed, limit: 5 }).catch(function () {
      return [];
    });

    var p2 = GBApi.listProfiles(200).then(function (list) {
      var filtered = [];
      var q = trimmed.toLowerCase();
      var i, p, u, d;

      for (i = 0; i < list.length; i++) {
        p = list[i];
        u = (p && p.username) ? p.username.toLowerCase() : "";
        d = (p && p.display_name) ? p.display_name.toLowerCase() : "";
        if (u.indexOf(q) !== -1 || d.indexOf(q) !== -1) {
          filtered.push(p);
        }
      }
      return filtered.slice(0, 5);
    }).catch(function () {
      return [];
    });

    Promise.all([p1, p2]).then(function (results) {
      var games = results[0];
      var users = results[1];
      var i;

      if (token !== STATE.currentSearchToken) {
        return;
      }

      box.innerHTML = "";
      if (!games.length && !users.length) {
        box.appendChild(h("div", { className: "search-empty" }, 'No results found for "' + trimmed + '"'));
        return;
      }

      if (games.length) {
        box.appendChild(h("div", { className: "search-group-title" }, "Games"));
        for (i = 0; i < games.length; i++) {
          var g = games[i];
          var creatorName = (g && g.creator && g.creator.username) ? g.creator.username : "?";
          var iconText = CATEGORY_ICON[g.category] || "Game";
          var gradStyle = "width:44px;height:30px;border-radius:8px;background:linear-gradient(135deg," + pickGrad(g.id) + ");display:grid;place-items:center;font-size:12px;font-weight:bold;color:#fff;flex:none";

          var gameItem = h("div", { className: "search-item", "data-action": "openGame", "data-id": g.id, role: "button", tabindex: "0" }, [
            h("div", { style: gradStyle }, iconText),
            h("div", {}, [
              h("div", { className: "t" }, g.name),
              h("div", { className: "s" }, "by " + creatorName + " • " + g.category)
            ])
          ]);
          box.appendChild(gameItem);
        }
      }

      if (users.length) {
        box.appendChild(h("div", { className: "search-group-title" }, "Players"));
        for (i = 0; i < users.length; i++) {
          var u = users[i];
          var userItem = h("div", { className: "search-item", "data-action": "viewProfile", "data-id": u.id, role: "button", tabindex: "0" }, [
            avatarNode(u.avatar_url, 34),
            h("div", {}, [
              h("div", { className: "t" }, u.display_name || u.username),
              h("div", { className: "s" }, "@" + u.username)
            ])
          ]);
          box.appendChild(userItem);
        }
      }
    }).catch(function (err) {
      if (token !== STATE.currentSearchToken) {
        return;
      }
      console.error("Search error:", err);
      box.innerHTML = "";
      box.appendChild(h("div", { className: "search-empty" }, "Search failed. " + (err.message || "")));
    });
  }

  // 9. Views & Page Rendering
  function renderHome() {
    var main = $("#mainContent");
    if (!main) {
      return;
    }

    var name = (STATE.profile && (STATE.profile.display_name || STATE.profile.username)) || "Player";

    var grid = h("div", { id: "homeGamesGrid", className: "games-grid" }, [
      h("div", { className: "spinner" })
    ]);

    var view = h("div", { className: "page-container" }, [
      h("header", { className: "hero" }, [
        h("h1", {}, "Welcome back, " + name + "!"),
        h("p", {}, "Jump into your favorite experiences or explore new games.")
      ]),
      h("section", { className: "section" }, [
        h("h2", {}, "Featured Games"),
        grid
      ])
    ]);

    main.innerHTML = "";
    main.appendChild(view);

    GBApi.listGames({ limit: 6 }).then(function (games) {
      grid.innerHTML = "";
      if (!games.length) {
        grid.appendChild(h("p", {}, "No games found."));
        return;
      }
      var i;
      for (i = 0; i < games.length; i++) {
        var g = games[i];
        var creator = (g && g.creator && g.creator.username) ? g.creator.username : "Unknown";
        var card = h("div", { className: "game-card", "data-action": "openGame", "data-id": g.id }, [
          h("div", { className: "game-thumb", style: "background:linear-gradient(135deg, " + pickGrad(g.id) + ")" }, [
            h("span", { style: "font-size:14px;font-weight:bold" }, CATEGORY_ICON[g.category] || "Game")
          ]),
          h("div", { className: "game-info" }, [
            h("div", { className: "game-title" }, g.name),
            h("div", { className: "game-author" }, "by " + creator),
            h("button", { className: "btn btn-primary btn-sm", "data-action": "play", "data-id": g.id }, "Play")
          ])
        ]);
        grid.appendChild(card);
      }
    }).catch(function (err) {
      console.error(err);
    });
  }

  function renderGames() {
    var main = $("#mainContent");
    if (!main) {
      return;
    }

    var grid = h("div", { id: "gamesListGrid", className: "games-grid" }, [
      h("div", { className: "spinner" })
    ]);

    var view = h("div", { className: "page-container" }, [
      h("h2", {}, "Discover Games"),
      h("div", { className: "filter-bar" }, [
        h("input", { type: "text", id: "gameSearchInput", className: "input", placeholder: "Search games by name..." })
      ]),
      grid
    ]);

    main.innerHTML = "";
    main.appendChild(view);

    var load = function (query) {
      grid.innerHTML = "";
      grid.appendChild(h("div", { className: "spinner" }));

      GBApi.listGames({ search: query || "" }).then(function (games) {
        grid.innerHTML = "";
        if (!games.length) {
          grid.appendChild(h("p", {}, "No games match your search."));
          return;
        }
        var i;
        for (i = 0; i < games.length; i++) {
          var g = games[i];
          var creator = (g && g.creator && g.creator.username) ? g.creator.username : "?";
          var card = h("div", { className: "game-card", "data-action": "openGame", "data-id": g.id }, [
            h("div", { className: "game-thumb", style: "background:linear-gradient(135deg, " + pickGrad(g.id) + ")" }, [
              h("span", { style: "font-size:14px;font-weight:bold" }, CATEGORY_ICON[g.category] || "Game")
            ]),
            h("div", { className: "game-info" }, [
              h("div", { className: "game-title" }, g.name),
              h("div", { className: "game-author" }, g.category + " • by " + creator),
              h("button", { className: "btn btn-primary btn-sm", "data-action": "play", "data-id": g.id }, "Play")
            ])
          ]);
          grid.appendChild(card);
        }
      });
    };

    load();

    var searchInput = $("#gameSearchInput");
    if (searchInput) {
      var timer;
      searchInput.addEventListener("input", function (e) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          load(e.target.value);
        }, 250);
      });
    }
  }

  function renderMessages(recipientId) {
    var main = $("#mainContent");
    if (!main) {
      return;
    }

    if (!recipientId) {
      main.innerHTML = "";
      main.appendChild(h("div", { className: "page-container" }, [
        h("h2", {}, "Messages"),
        h("p", {}, "Select a player from search or user profile to start chatting.")
      ]));
      return;
    }

    var historyBox = h("div", { id: "chatHistory", className: "chat-history" }, [
      h("div", { className: "spinner" })
    ]);

    var chatInput = h("input", { type: "text", id: "chatInput", className: "input", placeholder: "Type a message...", required: true, autocomplete: "off" });

    var form = h("form", { id: "chatForm", className: "chat-form" }, [
      chatInput,
      h("button", { type: "submit", className: "btn btn-primary" }, "Send")
    ]);

    var view = h("div", { className: "page-container chat-container" }, [
      h("h2", {}, "Chat"),
      historyBox,
      form
    ]);

    main.innerHTML = "";
    main.appendChild(view);

    var renderMsgs = function (list) {
      historyBox.innerHTML = "";
      var i;
      for (i = 0; i < list.length; i++) {
        var m = list[i];
        var isMe = STATE.user && m.sender_id === STATE.user.id;
        var cls = "chat-bubble " + (isMe ? "me" : "them");
        historyBox.appendChild(h("div", { className: cls }, [
          h("div", { className: "chat-body" }, m.body)
        ]));
      }
      historyBox.scrollTop = historyBox.scrollHeight;
    };

    var msgsArr = [];
    GBApi.getMessages(recipientId).then(function (messages) {
      msgsArr = messages;
      renderMsgs(msgsArr);

      STATE.messagesChannel = GBApi.subscribeMessages(recipientId, function (newMsg) {
        msgsArr.push(newMsg);
        renderMsgs(msgsArr);
      });
    });

    form.onsubmit = function (e) {
      e.preventDefault();
      var body = chatInput.value.trim();
      if (!body) {
        return;
      }
      chatInput.value = "";
      GBApi.sendMessage(recipientId, body).catch(function (err) {
        console.error("Failed to send message:", err);
      });
    };
  }

  function renderProfile(userId) {
    var main = $("#mainContent");
    if (!main) {
      return;
    }

    var currentUserId = STATE.user ? STATE.user.id : null;
    var targetId = userId || currentUserId;

    GBAuth.getProfile(targetId).then(function (profile) {
      main.innerHTML = "";
      if (!profile) {
        main.appendChild(h("div", { className: "page-container" }, [h("p", {}, "Profile not found.")]));
        return;
      }

      var msgBtn = null;
      if (targetId !== currentUserId) {
        msgBtn = h("button", { className: "btn btn-secondary btn-sm", "data-action": "messageUser", "data-id": targetId }, "Message");
      }

      main.appendChild(h("div", { className: "page-container" }, [
        h("div", { className: "profile-header" }, [
          avatarNode(profile.avatar_url, 72),
          h("div", {}, [
            h("h2", {}, profile.display_name || profile.username),
            h("p", { style: "color:var(--muted)" }, "@" + profile.username),
            msgBtn
          ])
        ])
      ]));
    });
  }

  // 10. Router
  function route() {
    var raw = location.hash.replace(/^#\/?/, "") || "home";
    var parts = raw.split("/").filter(Boolean);
    var page = parts[0] || "home";
    var param = parts.slice(1).join("/");

    if (STATE.route.page === "messages" && page !== "messages" && STATE.messagesChannel) {
      try {
        STATE.messagesChannel.unsubscribe();
        STATE.messagesChannel = null;
      } catch (err) {
        console.warn("Error unsubscribing realtime channel:", err);
      }
    }

    STATE.route = { page: page, param: param };

    switch (page) {
      case "home":
        renderHome();
        break;
      case "games":
        renderGames();
        break;
      case "messages":
        renderMessages(param);
        break;
      case "profile":
        renderProfile(param);
        break;
      default:
        renderHome();
    }
  }

  // 11. Event Actions
  var actions = {
    closeModal: function () {
      closeModal();
    },
    openGame: function (el) {
      var id = el.getAttribute("data-id");
      if (id) {
        window.location.hash = "#/game/" + id;
      }
    },
    viewProfile: function (el) {
      var id = el.getAttribute("data-id");
      if (id) {
        window.location.hash = "#/profile/" + id;
      }
    },
    messageUser: function (el) {
      var id = el.getAttribute("data-id");
      if (id) {
        window.location.hash = "#/messages/" + id;
      }
    },
    logout: function () {
      GBAuth.signOut();
    },
    play: function (el) {
      var id = el.getAttribute("data-id");
      if (!id) {
        return;
      }

      if (STATE.launchTimer) {
        clearInterval(STATE.launchTimer);
        STATE.launchTimer = null;
      }

      GBApi.getGame(id).then(function (game) {
        if (!game) {
          return;
        }

        var statusEl = h("p", { style: "color:var(--muted);margin:0;font-size:14px", id: "launchStatus" }, "Connecting to " + game.name + "...");
        var bar = h("span", { id: "launchBar", style: "display:block;height:100%;width:0%;background:#3b82f6;transition:width 0.2s" });

        var content = h("div", { style: "text-align:center;padding:14px 0 4px" }, [
          h("div", { className: "spinner" }),
          h("h3", { style: "margin:0 0 8px;font-size:18px" }, "Launching GoodBlox"),
          statusEl,
          h("div", { className: "progress", style: "height:6px;background:#334155;border-radius:3px;margin-top:12px;overflow:hidden" }, [bar])
        ]);

        openModal(content, { title: game.name });

        var statuses = [
          "Connecting to server...",
          "Loading assets...",
          "Spawning your avatar...",
          "Almost there..."
        ];
        var step = 0;

        STATE.launchTimer = setInterval(function () {
          step++;
          if (bar) {
            bar.style.width = Math.min(100, step * 12.5) + "%";
          }
          if (statusEl) {
            var idx = Math.min(statuses.length - 1, Math.floor(step / 2));
            statusEl.textContent = statuses[idx];
          }

          if (step >= 8) {
            clearInterval(STATE.launchTimer);
            STATE.launchTimer = null;
            var body = document.querySelector(".modal-body");
            if (body) {
              body.innerHTML = "";
              body.appendChild(h("div", { style: "text-align:center;padding:14px 0 4px" }, [
                h("div", { style: "font-size:24px;font-weight:bold;color:#10b981;margin-bottom:12px" }, "[ OK ]"),
                h("h3", { style: "margin:0 0 8px;font-size:18px" }, "Game client not installed"),
                h("p", { style: "color:var(--muted);margin:0 0 20px;font-size:14px" }, "In a full build, this would open " + game.name + " inside the GoodBlox game client."),
                h("button", { className: "btn btn-primary", "data-action": "closeModal" }, "Close")
              ]));
            }
          }
        }, 260);
      });
    }
  };

  // 12. App Initialization
  function initEvents() {
    document.body.addEventListener("click", function (e) {
      var actionEl = null;
      var current = e.target;
      while (current && current !== document.body) {
        if (current.getAttribute && current.getAttribute("data-action")) {
          actionEl = current;
          break;
        }
        current = current.parentNode;
      }

      if (!actionEl) {
        return;
      }
      var actionName = actionEl.getAttribute("data-action");
      if (typeof actions[actionName] === "function") {
        actions[actionName](actionEl, e);
      }
    });

    var searchInput = $("#globalSearch");
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener("input", function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          runSearch(e.target.value);
        }, 200);
      });
    }

    window.addEventListener("hashchange", route);
  }

  function init() {
    initEvents();

    GBAuth.getUser().then(function (user) {
      STATE.user = user;
      if (user) {
        return GBAuth.getProfile(user.id);
      }
      return null;
    }).then(function (profile) {
      if (profile) {
        STATE.profile = profile;
      }
      route();
    }).catch(function (err) {
      console.error("Init error", err);
      route();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
