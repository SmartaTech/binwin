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

  // chart js
document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("donutChart");
  const centerX = 300;
  const centerY = 300;
  const outerRadius = 180;
  const innerRadius = 90;
  const gapDegrees = 3; // Gap between slices

  const slicesData = [
    { number: "01", color: "#8cc63f", label: "Waste Diverted from Landfills" },
    { number: "02", color: "#00b094", label: "CO₂ Emissions Reduced" },
    { number: "03", color: "#008db9", label: "Plastic Recovered" },
    { number: "04", color: "#4653a0", label: "Communities Served" },
    { number: "05", color: "#1892b0", label: "Educational Campaigns Conducted" }
  ];

  const totalSlices = slicesData.length;
  const sliceAngle = 360 / totalSlices;

  // 0° = 12 o'clock (Top Center)
  // Shift start angle by half a slice so the first split line is exactly at top-center
  const startAngleOffset = -sliceAngle / 2;

  // Helper: Convert Polar to Cartesian coordinates (0° = Top)
  function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  }

  // Helper: Generate SVG Path for Donut Slice
  function createDonutSlicePath(x, y, radiusInner, radiusOuter, startDeg, endDeg) {
    const outerStart = polarToCartesian(x, y, radiusOuter, endDeg);
    const outerEnd = polarToCartesian(x, y, radiusOuter, startDeg);
    const innerStart = polarToCartesian(x, y, radiusInner, startDeg);
    const innerEnd = polarToCartesian(x, y, radiusInner, endDeg);

    const largeArcFlag = endDeg - startDeg <= 180 ? "0" : "1";

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
      "Z"
    ].join(" ");
  }

  // Render Slices, Text, and Pointer Lines
  const legendContainer = document.querySelector('.impact-legend');
  const legendList = legendContainer ? document.createElement('ul') : null;

  slicesData.forEach((data, index) => {
    const startDeg = startAngleOffset + index * sliceAngle + gapDegrees / 2;
    const endDeg = startAngleOffset + (index + 1) * sliceAngle - gapDegrees / 2;
    const midDeg = (startDeg + endDeg) / 2;

    // 1. Create Path Element
    const pathD = createDonutSlicePath(centerX, centerY, innerRadius, outerRadius, startDeg, endDeg);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", data.color);
    path.setAttribute("class", "slice");
    svg.appendChild(path);

    // 2. Number Position inside the wedge (centered properly)
    const midRadius = (innerRadius + outerRadius) / 2;
    const textPos = polarToCartesian(centerX, centerY, midRadius, midDeg);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textPos.x);
    text.setAttribute("y", textPos.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("class", "slice-text");
    text.textContent = data.number;
    svg.appendChild(text);

    // 3. Pointer Line setup
    const lineStart = polarToCartesian(centerX, centerY, outerRadius + 5, midDeg);
    const lineMid = polarToCartesian(centerX, centerY, outerRadius + 35, midDeg);

    // Normalize angle to 0 - 360 to accurately determine left vs right half
    const normalizedMidDeg = (midDeg % 360 + 360) % 360;
    const isRight = normalizedMidDeg > 0 && normalizedMidDeg < 180;

    const lineEnd = {
      x: isRight ? lineMid.x + 40 : lineMid.x - 40,
      y: lineMid.y
    };

    // Draw Line
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", `${lineStart.x},${lineStart.y} ${lineMid.x},${lineMid.y} ${lineEnd.x},${lineEnd.y}`);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", data.color);
    polyline.setAttribute("stroke-width", "2");
    polyline.setAttribute("class", "pointer-line");
    svg.appendChild(polyline);

    // 4. Label Text beside Pointer Line
    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const textAnchor = isRight ? "start" : "end";
    const labelX = isRight ? lineEnd.x + 8 : lineEnd.x - 8;

    labelText.setAttribute("x", labelX);
    labelText.setAttribute("y", lineEnd.y);
    labelText.setAttribute("text-anchor", textAnchor);
    labelText.setAttribute("class", "label-text");

    // Break label text into 2 lines for readability
    const words = data.label.split(" ");
    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

    const tspan1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan1.setAttribute("x", labelX);
    tspan1.setAttribute("dy", "-0.3em");
    tspan1.textContent = line1;

    const tspan2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan2.setAttribute("x", labelX);
    tspan2.setAttribute("dy", "1.2em");
    tspan2.textContent = line2;

    labelText.appendChild(tspan1);
    labelText.appendChild(tspan2);
    svg.appendChild(labelText);

    if (legendList) {
      const legendItem = document.createElement('li');
      const legendMark = document.createElement('span');
      legendMark.className = 'legend-mark';
      legendMark.style.backgroundColor = data.color;
      legendMark.textContent = data.number;

      const legendLabel = document.createElement('p');
      legendLabel.className = 'legend-label';
      legendLabel.textContent = data.label;

      legendItem.appendChild(legendMark);
      legendItem.appendChild(legendLabel);
      legendList.appendChild(legendItem);
    }
  });

  if (legendList && legendContainer) {
    legendContainer.appendChild(legendList);
  }
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