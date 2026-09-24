(function () {
  "use strict";

  // --- Helpers & Utilities ---
  var $ = function (s, p) { 
    return (p || document).querySelector(s); 
  };
  
  var $$ = function (s, p) { 
    return Array.prototype.slice.call((p || document).querySelectorAll(s)); 
  };

  var quoteReg = new RegExp(String.fromCharCode(34), "g");
  var aposReg = new RegExp(String.fromCharCode(39), "g");

  var esc = function (str) {
    if (str === null || str === undefined) return "";
    var s = String(str);
    s = s.replace(/&/g, "&");
    s = s.replace(//g, ">");
    s = s.replace(quoteReg, """);
    s = s.replace(aposReg, "'");
    return s;
  };

  // Replaced Emojis with ASCII text to prevent byte-reading errors
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
    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  }

  function avatarHTML(avatarUrl, size) {
    var s = size || 36;
    if (avatarUrl) {
      return '
