(function () {
  "use strict";

  // --- Helpers & Utilities ---
  const $ = (s, p = document) => p.querySelector(s);   const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const esc = function (str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&")
      .replace(//g, ">")
      .replace(/\x22/g, """)
      .replace(/\x27/g, "'");
  };

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
