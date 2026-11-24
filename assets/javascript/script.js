// ============================================================
// CIRCULAR COUNTRY — SHARED SCRIPT
// Used across all pages. Handles nav, scroll effects, reveals,
// the hero loop diagram, impact counters, and the partner form.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  fetch('layouts/header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header_html').innerHTML = data;
      // Header markup only exists in the DOM from this point on,
      // so the nav/dropdown behaviour must be wired up here.
      if (typeof initMobileNav === 'function') initMobileNav();
    });
  
  fetch('layouts/footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer_html').innerHTML = data;
    });

  // ---- mobile drawer ----
  const burger = document.getElementById('burgerBtn');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('open'));
    if (drawerClose) drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));
  }

  // ---- reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- hero typing effect ----
  const typingHeadline = document.getElementById('heroTypingText');
  if (typingHeadline) {
    const rawText = typingHeadline.dataset.text?.trim() || '';
    const text = rawText.replace(/\|/g, '\n');
    typingHeadline.textContent = '';
    let charIndex = 0;
    const typingSpeed = 70;
    const startDelay = 500;
    const resetDelay = 1800;
    function type() {
      if (charIndex <= text.length) {
        typingHeadline.textContent = text.slice(0, charIndex);
        charIndex += 1;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => {
          charIndex = 0;
          typingHeadline.textContent = '';
          setTimeout(type, typingSpeed);
        }, resetDelay);
      }
    }
    setTimeout(type, startDelay);
  }

  // ---- impact counters + bars (Resources page) ----
  const impactSection = document.getElementById('impact');
  if (impactSection) {
    let impactPlayed = false;
    function animateCount(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1400; const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const impactIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !impactPlayed) {
          impactPlayed = true;
          document.querySelectorAll('.bignum').forEach(animateCount);
          document.querySelectorAll('.impact-bar-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });
        }
      });
    }, { threshold: 0.3 });
    impactIO.observe(impactSection);
  }

  // ---- hero loop diagram animation (Home page) ----
  const nodes = document.querySelectorAll('.loop-node');
  if (nodes.length) {
    const labels = ['Collect', 'Segregate', 'Recycle', 'Upcycle', 'Resource'];
    const positions = [[220, 52], [377, 170], [318, 358], [122, 358], [63, 170]];
    const centerLabel = document.getElementById('loopCenterLabel');
    const pulse = document.getElementById('loopPulse');
    let activeIdx = 0;
    function setActive(i) {
      nodes.forEach(n => n.classList.remove('loop-node-active'));
      nodes[i].classList.add('loop-node-active');
      if (centerLabel) centerLabel.textContent = labels[i];
      if (pulse) { pulse.setAttribute('cx', positions[i][0]); pulse.setAttribute('cy', positions[i][1]); }
    }
    setActive(0);
    setInterval(() => { activeIdx = (activeIdx + 1) % nodes.length; setActive(activeIdx); }, 1800);
  }

  // ---- partner form submit (demo) ----
  const form = document.getElementById('partnerForm');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (form && toast) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      toastMsg.textContent = 'Thanks! Your message has been received.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3200);
      form.reset();
    });
  }

});

// leaves falling
var LeafScene = function(el) {
    this.viewport = el;
    this.world = document.createElement('div');
    this.leaves = [];

    this.options = {
      numLeaves: 24,
      wind: {
        magnitude: 1.2,
        maxSpeed: 12,
        duration: 300,
        start: 0,
        speed: 0
      },
    };

    this.width = this.viewport.offsetWidth;
    this.height = this.viewport.offsetHeight;

    // animation helper
    this.timer = 0;

    this._resetLeaf = function(leaf) {

      // place leaf towards the top left
      leaf.x = Math.random() * this.width;
      leaf.y = -20 - Math.random() * 80;
      leaf.z = Math.random() * 200;

      leaf.xSpeedVariation = (Math.random() * 1.2) - 0.6;
      leaf.ySpeed = 1.4 + Math.random() * 1.2;
      leaf.rotationAngle = Math.random() * 360;
      leaf.rotationSpeed = (Math.random() * 1.8 + 0.4) * (Math.random() > 0.5 ? 1 : -1);
      leaf.windOffset = Math.random() * Math.PI * 2;
      leaf.el.style.left = leaf.x + 'px';
      leaf.el.style.top = leaf.y + 'px';
      leaf.el.style.transform = 'rotate(' + leaf.rotationAngle + 'deg)';

      return leaf;
    }

    this._updateLeaf = function(leaf) {
      var xSpeed = 0.4 + leaf.xSpeedVariation;
      var breeze = Math.sin((leaf.y + leaf.x) * 0.018 + leaf.windOffset) * 1.6;
      leaf.x += xSpeed + breeze;
      leaf.y += leaf.ySpeed;
      leaf.rotationAngle += leaf.rotationSpeed;

      leaf.el.style.left = leaf.x + 'px';
      leaf.el.style.top = leaf.y + 'px';
      leaf.el.style.transform = 'rotate(' + leaf.rotationAngle + 'deg)';

      if (leaf.x < -80 || leaf.x > this.width + 80 || leaf.y > this.height + 80) {
        this._resetLeaf(leaf);
      }
    }

    this._updateWind = function() {
      // wind follows a sine curve: asin(b*time + c) + a
      // where a = wind magnitude as a function of leaf position, b = wind.duration, c = offset
      // wind duration should be related to wind magnitude, e.g. higher windspeed means longer gust duration

      if (this.timer === 0 || this.timer > (this.options.wind.start + this.options.wind.duration)) {

        this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
        this.options.wind.duration = this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
        this.options.wind.start = this.timer;

        var screenHeight = this.height;

        this.options.wind.speed = function(t, y) {
          // should go from full wind speed at the top, to 1/2 speed at the bottom, using leaf Y
          var a = this.magnitude/2 * (screenHeight - 2*y/3)/screenHeight;
          return a * Math.sin(2*Math.PI/this.duration * t + (3 * Math.PI/2)) + a;
        }
      }
    }
  }

  LeafScene.prototype.init = function() {

    for (var i = 0; i < this.options.numLeaves; i++) {
      var leaf = {
        el: document.createElement('img'),
        x: 0,
        y: 0,
        z: 0,
        rotation: {
          axis: 'X',
          value: 0,
          speed: 0,
          x: 0
        },
        xSpeedVariation: 0,
        ySpeed: 0,
        path: {
          type: 1,
          start: 0,

        },
        image: 1
      };
      leaf.el.className = 'leaf';
      leaf.el.src = 'assets/images/icons/green-leaf.svg';
      leaf.el.alt = '';
      this._resetLeaf(leaf);
      this.leaves.push(leaf);
      this.world.appendChild(leaf.el);
    }

    this.world.className = 'leaf-scene';
    this.viewport.appendChild(this.world);

    // set perspective
    this.world.style.webkitPerspective = "400px";
    this.world.style.MozPerspective = "400px";
    this.world.style.oPerspective = "400px";
    this.world.style.perspective = "400px";
    
    // reset window height/width on resize
    var self = this;
    window.onresize = function(event) {
      self.width = self.viewport.offsetWidth;
      self.height = self.viewport.offsetHeight;
    };
  }

  LeafScene.prototype.render = function() {
    for (var i = 0; i < this.leaves.length; i++) {
      this._updateLeaf(this.leaves[i]);
    }

    this.timer++;
    requestAnimationFrame(this.render.bind(this));
  }

  // start up leaf scene
  var leafContainer = document.querySelector('.falling-leaves');
  if (leafContainer) {
    var leaves = new LeafScene(leafContainer);
    leaves.init();
    leaves.render();
  }

  // chart js — waste breakdown donut, driven by /api/public-stats (wasteBreakdown)
document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("donutChart");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const centerX = 300, centerY = 300, outerRadius = 180, innerRadius = 90;
  const START_DEG = -70;       // rotates chart so small slices sit mid-side, where labels have room
  const MIN_ANGLE = 2.5;      // keeps tiny categories (e.g. hazardous 0.1%) visible
  const MIN_LABEL_GAP = 38;   // vertical px between pointer labels
  const COLORS = {
    dry: "#8cc63f", wet: "#00b094", plastic: "#008db9", mixed: "#4653a0", paper: "#1892b0",
    organic: "#5aa469", metal: "#7a8aa0", "e-waste": "#e0a030", glass: "#6cc7d9", hazardous: "#c0504d"
  };
  const FALLBACK = ["#8cc63f", "#00b094", "#008db9", "#4653a0", "#1892b0", "#5aa469", "#7a8aa0", "#e0a030"];
  const nf = (n, d) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(k => e.setAttribute(k, attrs[k]));
    return e;
  }
  function polarToCartesian(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180.0;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function slicePath(x, y, rIn, rOut, startDeg, endDeg) {
    const oS = polarToCartesian(x, y, rOut, endDeg), oE = polarToCartesian(x, y, rOut, startDeg);
    const iS = polarToCartesian(x, y, rIn, startDeg), iE = polarToCartesian(x, y, rIn, endDeg);
    const large = endDeg - startDeg <= 180 ? "0" : "1";
    return [`M ${oS.x} ${oS.y}`, `A ${rOut} ${rOut} 0 ${large} 0 ${oE.x} ${oE.y}`,
            `L ${iS.x} ${iS.y}`, `A ${rIn} ${rIn} 0 ${large} 1 ${iE.x} ${iE.y}`, "Z"].join(" ");
  }

  // Slice angles proportional to kg, with a minimum so small ones stay visible.
  function computeAngles(items) {
    const total = items.reduce((a, i) => a + i.kg, 0);
    let angles = items.map(i => (i.kg / total) * 360);
    const small = angles.map(a => a < MIN_ANGLE);
    const fixed = small.filter(Boolean).length * MIN_ANGLE;
    const bigSum = angles.reduce((a, v, i) => a + (small[i] ? 0 : v), 0);
    const scale = bigSum > 0 ? (360 - fixed) / bigSum : 1;
    return angles.map((a, i) => (small[i] ? MIN_ANGLE : a * scale));
  }

  // Spread labels on one side so they never overlap.
  function spreadLabels(group) {
    group.sort((a, b) => a.y - b.y);
    for (let i = 1; i < group.length; i++) group[i].y = Math.max(group[i].y, group[i - 1].y + MIN_LABEL_GAP);
    const limit = centerY + outerRadius + 60;
    const n = group.length;
    if (n && group[n - 1].y > limit) {
      group[n - 1].y = limit;
      for (let i = n - 2; i >= 0; i--) group[i].y = Math.min(group[i].y, group[i + 1].y - MIN_LABEL_GAP);
    }
  }

  function drawPlaceholder() {
    svg.innerHTML = "";
    svg.appendChild(el("circle", { cx: centerX, cy: centerY, r: (innerRadius + outerRadius) / 2,
      fill: "none", stroke: "#e3e8e1", "stroke-width": outerRadius - innerRadius }));
  }

  function build(breakdown) {
    const items = (breakdown || []).filter(b => b && b.kg > 0);
    if (!items.length) return;
    svg.innerHTML = "";
    const legendContainer = document.querySelector(".impact-legend");
    if (legendContainer) legendContainer.innerHTML = "";
    const legendList = legendContainer ? document.createElement("ul") : null;

    const angles = computeAngles(items);
    const gap = 1.2; // degrees between slices
    const labels = [];
    let cursor = START_DEG;

    items.forEach((item, idx) => {
      const color = COLORS[item.category] || FALLBACK[idx % FALLBACK.length];
      const sweep = angles[idx];
      const startDeg = cursor + gap / 2, endDeg = cursor + sweep - gap / 2;
      const midDeg = cursor + sweep / 2;
      cursor += sweep;
      const kgText = nf(item.kg, 1) + " kg";
      const pctText = nf(item.percent, 1) + "%";

      const path = el("path", { d: slicePath(centerX, centerY, innerRadius, outerRadius, startDeg, endDeg), fill: color, class: "slice" });
      const title = el("title");
      title.textContent = `${item.label}: ${kgText} (${pctText})`;
      path.appendChild(title);
      svg.appendChild(path);

      // Percentage inside wedge when there is room
      if (sweep >= 30) {
        const tp = polarToCartesian(centerX, centerY, (innerRadius + outerRadius) / 2, midDeg);
        const t = el("text", { x: tp.x, y: tp.y, "text-anchor": "middle", "dominant-baseline": "central", class: "slice-text", style: "font-size:16px" });
        t.textContent = pctText;
        svg.appendChild(t);
      }

      const norm = ((midDeg % 360) + 360) % 360;
      const isRight = norm < 180;
      const anchor = polarToCartesian(centerX, centerY, outerRadius + 22, midDeg);
      labels.push({ item, color, midDeg, isRight, kgText, pctText, y: anchor.y });

      if (legendList) {
        const li = document.createElement("li");
        const mark = document.createElement("span");
        mark.className = "legend-mark";
        mark.style.backgroundColor = color;
        mark.style.fontSize = "0.72rem";
        mark.textContent = item.percent < 1 ? "<1%" : Math.round(item.percent) + "%";
        const lab = document.createElement("p");
        lab.className = "legend-label";
        lab.textContent = item.label;
        const val = document.createElement("span");
        val.className = "legend-value";
        val.textContent = `${kgText} · ${pctText}`;
        lab.appendChild(val);
        li.appendChild(mark);
        li.appendChild(lab);
        legendList.appendChild(li);
      }
    });

    // Pointer lines + labels, spread per side
    const right = labels.filter(l => l.isRight), left = labels.filter(l => !l.isRight);
    const originalY = new Map(labels.map(l => [l, l.y]));
    spreadLabels(right);
    spreadLabels(left);
    labels.forEach(l => {
      const colX = l.isRight ? centerX + outerRadius + 50 : centerX - outerRadius - 50;
      const p0 = polarToCartesian(centerX, centerY, outerRadius + 4, l.midDeg);
      const p1 = polarToCartesian(centerX, centerY, outerRadius + 20, l.midDeg);
      const endX = l.isRight ? colX - 6 : colX + 6;
      svg.appendChild(el("polyline", { points: `${p0.x},${p0.y} ${p1.x},${p1.y} ${endX},${l.y}`,
        fill: "none", stroke: l.color, "stroke-width": "2", class: "pointer-line" }));
      const lx = l.isRight ? colX : colX;
      const text = el("text", { x: lx, y: l.y, "text-anchor": l.isRight ? "start" : "end", class: "label-text" });
      const t1 = el("tspan", { x: lx, dy: "-0.2em" }); t1.textContent = l.item.label;
      const t2 = el("tspan", { x: lx, dy: "1.3em", class: "label-value" }); t2.textContent = `${l.kgText} · ${l.pctText}`;
      text.appendChild(t1); text.appendChild(t2);
      svg.appendChild(text);
    });

    if (legendList && legendContainer) legendContainer.appendChild(legendList);
  }

  drawPlaceholder();
  if (window.BINWIN_STATS && window.BINWIN_STATS.wasteBreakdown) build(window.BINWIN_STATS.wasteBreakdown);
  window.addEventListener("binwin:stats", e => {
    if (e.detail && e.detail.wasteBreakdown) build(e.detail.wasteBreakdown);
  });
});

// ============================================================
// MOBILE NAV BEHAVIOUR — ADDED 2026-08-12
// Only affects screens under 992px.
// IMPORTANT: header.html is injected via fetch(), so this can't
// run as a plain self-executing IIFE at parse time — the header
// (and #navbarNav) won't exist in the DOM yet. Instead it's
// defined as a function and invoked once the fetch() callback
// above has actually inserted the header markup. It guards
// against being called twice (e.g. if you ever add retry logic).
// ============================================================
var initMobileNav = (function () {
  'use strict';
  var initialized = false;

  return function initMobileNav() {
    if (initialized) return;
    var MOBILE = '(max-width: 991.98px)';
    var header = document.getElementById('siteHeader');
    var panel = document.getElementById('navbarNav');
    if (!header || !panel) return;
    initialized = true;
    var isMobile = function () { return window.matchMedia(MOBILE).matches; };

  function closeAll() {
    panel.querySelectorAll('.dropdown.is-open').forEach(function (d) {
      d.classList.remove('is-open');
      var t = d.querySelector('.nav-link');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  panel.querySelectorAll('.dropdown').forEach(function (drop) {
    var toggle = drop.querySelector('.nav-link');
    var menu = drop.querySelector('.dropdown-content');
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function (e) {
      if (!isMobile()) return;
      e.preventDefault(); e.stopPropagation();
      if (drop.classList.contains('is-open')) {
        drop.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        closeAll();
        drop.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  panel.addEventListener('show.bs.collapse', function () {
    header.classList.add('menu-open');
    header.classList.remove('hide');
    if (isMobile()) document.body.style.overflow = 'hidden';
  });
  panel.addEventListener('hidden.bs.collapse', function () {
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
    closeAll();
  });

  panel.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link || !isMobile() || e.defaultPrevented) return;
    if (link.closest('.dropdown > .nav-link') && !link.closest('.dropdown-content')) return;
    var C = window.bootstrap && window.bootstrap.Collapse;
    var i = C && C.getInstance(panel);
    if (i) i.hide(); else panel.classList.remove('show');
  });

  document.addEventListener('click', function (e) {
    if (!isMobile() || !panel.classList.contains('show')) return;
    if (!header.contains(e.target)) {
      var C = window.bootstrap && window.bootstrap.Collapse;
      var i = C && C.getInstance(panel);
      if (i) i.hide();
      return;
    }
    // Tapped inside the open mobile menu but outside any open dropdown
    // (e.g. tapped a different top-level link) — close any open submenu.
    if (!e.target.closest('.dropdown.is-open')) closeAll();
  });

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      if (!isMobile()) {
        document.body.style.overflow = '';
        header.classList.remove('menu-open');
        panel.classList.remove('show');
        closeAll();
      }
    }, 150);
  });
  };
})();

// ============================================================
// CONTENT CAMPAIGN GALLERY (impact.html) — tabs + click-to-enlarge
// Lives directly in the page markup (not fetched), so a normal
// DOMContentLoaded listener is safe here.
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  var tabBtns = document.querySelectorAll('.campaign-tab-btn');
  var panels = document.querySelectorAll('.campaign-tab-panel');
  var lightbox = document.getElementById('campaignLightbox');
  if (!tabBtns.length || !lightbox) return;

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var target = document.querySelector('.campaign-tab-panel[data-panel="' + btn.dataset.tab + '"]');
      if (target) target.classList.add('active');
    });
  });

  var inner = document.getElementById('campaignLightboxInner');
  var closeBtn = document.getElementById('campaignLightboxClose');

  function openLightbox(card) {
    var type = card.getAttribute('data-type');
    var src = card.getAttribute('data-src');
    inner.innerHTML = '';
    if (type === 'video') {
      var video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      var poster = card.getAttribute('data-poster');
      if (poster) video.poster = poster;
      inner.appendChild(video);
    } else {
      var img = document.createElement('img');
      img.src = src;
      var cardImg = card.querySelector('img');
      img.alt = cardImg ? cardImg.alt : '';
      inner.appendChild(img);
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    inner.innerHTML = ''; // stops any playing video
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.campaign-media-card').forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card); });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
});