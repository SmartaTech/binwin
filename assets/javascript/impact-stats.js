/*!
 * BinWin public impact stats
 * Fetches GET <admin-domain>/api/public-stats and fills any element that has
 * a data-stat="<jsonKey>" attribute. wasteBreakdown is ignored for now.
 *
 * Switching from mock to live: change STATS_URL below (or set
 * window.BINWIN_STATS_URL before this script loads). Nothing else changes.
 */
(function () {
  "use strict";

  // ---- CONFIG -------------------------------------------------------------
  // TODO: replace with "https://<admin-domain>/api/public-stats" once provided.
  var STATS_URL = window.BINWIN_STATS_URL || "mock/public-stats.json";
  var REFRESH_MS = 5 * 60 * 1000; // re-fetch every 5 min while tab is visible
  var TIMEOUT_MS = 8000;
  var LOCALE = "en-IN";

  // Built-in sample data. Used ONLY while STATS_URL is a local/relative path
  // (development), e.g. when the page is opened via file:// and the browser
  // blocks fetching the mock JSON. Never used once STATS_URL is an http(s) URL.
  var MOCK = {
    wasteCollectedKg: 12480.5, dryKg: 7320.2, wetKg: 3150.8, eWasteKg: 410.0,
    otherKg: 1599.5, plasticRecoveredKg: 2140.6, co2SavedKg: 19968.8,
    treesEquivalent: 1387, pickupsCompleted: 2315,
    updatedAt: "2026-10-29T09:40:00.000Z",
    wasteBreakdown: [
      { category: "dry", label: "Dry (unsorted)", kg: 3148.0, percent: 25.2 },
      { category: "wet", label: "Wet", kg: 2400.5, percent: 19.2 },
      { category: "plastic", label: "Plastic", kg: 2140.6, percent: 17.2 },
      { category: "mixed", label: "Mixed", kg: 1599.5, percent: 12.8 },
      { category: "paper", label: "Paper", kg: 1350.4, percent: 10.8 },
      { category: "organic", label: "Organic", kg: 750.3, percent: 6.0 },
      { category: "metal", label: "Metal", kg: 420.3, percent: 3.4 },
      { category: "e-waste", label: "E-waste", kg: 395.0, percent: 3.2 },
      { category: "glass", label: "Glass", kg: 260.9, percent: 2.1 },
      { category: "hazardous", label: "Hazardous", kg: 15.0, percent: 0.1 }
    ]
  };
  var IS_LIVE = /^https?:\/\//i.test(STATS_URL);
  // -------------------------------------------------------------------------

  var NUMERIC = [
    "wasteCollectedKg", "dryKg", "wetKg", "eWasteKg", "otherKg",
    "plasticRecoveredKg", "co2SavedKg", "treesEquivalent", "pickupsCompleted"
  ];
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var firstPaint = true;
  var timer = null;

  function fmt(n, decimals) {
    return Number(n).toLocaleString(LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals == null ? 1 : decimals
    });
  }

  // Keep only finite numbers so a bad/missing field never renders "NaN".
  function sanitize(raw) {
    var s = {};
    NUMERIC.forEach(function (k) {
      var v = Number(raw && raw[k]);
      if (isFinite(v) && v >= 0) s[k] = v;
    });
    if (raw && typeof raw.updatedAt === "string") s.updatedAt = raw.updatedAt;
    if (raw && Array.isArray(raw.wasteBreakdown)) {
      s.wasteBreakdown = raw.wasteBreakdown.map(function (b) {
        return { category: String(b.category || ""), label: String(b.label || b.category || ""),
                 kg: Number(b.kg), percent: Number(b.percent) };
      }).filter(function (b) { return isFinite(b.kg) && b.kg > 0 && isFinite(b.percent); });
    }
    return s;
  }

  function fetchStats() {
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var t = ctrl && setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    return fetch(STATS_URL, { headers: { Accept: "application/json" }, signal: ctrl && ctrl.signal })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(sanitize)
      .finally(function () { if (t) clearTimeout(t); });
  }

  function countUp(el, to, decimals) {
    if (reduceMotion || !firstPaint) { el.textContent = fmt(to, decimals); return; }
    var start = performance.now(), dur = 1400;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased, decimals);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(to, decimals);
    })(start);
  }

  function render(s) {
    window.BINWIN_STATS = s;
    window.dispatchEvent(new CustomEvent("binwin:stats", { detail: s }));
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      var key = el.getAttribute("data-stat");
      if (key === "updatedAt") {
        if (s.updatedAt) {
          var d = new Date(s.updatedAt);
          if (!isNaN(d)) {
            el.textContent = d.toLocaleString(LOCALE, {
              day: "numeric", month: "short", year: "numeric",
              hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata"
            });
            el.setAttribute("datetime", d.toISOString());
          }
        }
        return;
      }
      if (!(key in s)) return; // leave the "—" placeholder
      countUp(el, s[key], el.hasAttribute("data-decimals") ? Number(el.getAttribute("data-decimals")) : null);
    });

    // Composition bar: dry / wet / e-waste / other as share of total.
    var total = s.wasteCollectedKg;
    document.querySelectorAll("[data-share]").forEach(function (el) {
      var v = s[el.getAttribute("data-share")];
      if (total > 0 && v != null) {
        var pct = (v / total) * 100;
        el.style.width = pct + "%";
        el.setAttribute("data-pct", pct.toFixed(1));
      }
    });
    document.querySelectorAll("[data-share-label]").forEach(function (el) {
      var v = s[el.getAttribute("data-share-label")];
      if (total > 0 && v != null) el.textContent = ((v / total) * 100).toFixed(1) + "%";
    });

    document.querySelectorAll("[data-stats-root]").forEach(function (r) {
      r.setAttribute("data-state", "ready");
    });
    firstPaint = false;
  }

  function setState(state) {
    document.querySelectorAll("[data-stats-root]").forEach(function (r) {
      // Keep showing old numbers if we already have them.
      if (state === "error" && r.getAttribute("data-state") === "ready") return;
      r.setAttribute("data-state", state);
    });
  }

  function load() {
    return fetchStats().then(render).catch(function (err) {
      console.warn("[binwin] public-stats unavailable (" + STATS_URL + "):", err.message);
      if (!IS_LIVE) { render(sanitize(MOCK)); return; } // dev fallback only
      setState("error");
    });
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden) load(); }, REFRESH_MS);
  }

  function init() {
    if (!document.querySelector("[data-stats-root]")) return;
    setState("loading");
    load();
    schedule();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) load();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
