// ============================================================
// CIRCULAR COUNTRY — SHARED SCRIPT
// Used across all pages. Handles nav, scroll effects, reveals,
// the hero loop diagram, impact counters, and the partner form.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

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

      // Data for the 5 slices matching the color palette and layout
      const slicesData = [
        {
          number: "01",
          color: "#8cc63f", // Light Green
          label: "Waste Diverted from Landfills",
          align: "left"
        },
        {
          number: "02",
          color: "#00b094", // Teal / Cyan Green
          label: "CO₂ Emissions Reduced",
          align: "right"
        },
        {
          number: "03",
          color: "#008db9", // Medium Blue
          label: "Plastic Recovered",
          align: "right"
        },
        {
          number: "04",
          color: "#4653a0", // Purple-Blue
          label: "Communities Served",
          align: "right"
        },
        {
          number: "05",
          color: "#1892b0", // Dark Cyan
          label: "Educational Campaigns Conducted",
          align: "left"
        }
      ];

      const totalSlices = slicesData.length;
      const sliceAngle = 360 / totalSlices;
      
      // Offset start angle so section 01 and 02 split at the top center (-90deg)
      const startAngleOffset = -90;

      // Helper: Convert Polar to Cartesian coordinates
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
      slicesData.forEach((data, index) => {
        const startDeg = startAngleOffset + index * sliceAngle + gapDegrees / 2;
        const endDeg = startAngleOffset + (index + 1) * sliceAngle - gapDegrees / 2;
        const midDeg = (startDeg + endDeg) / 2;

        // Create Path Element
        const pathD = createDonutSlicePath(centerX, centerY, innerRadius, outerRadius, startDeg, endDeg);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", data.color);
        path.setAttribute("class", "slice");
        svg.appendChild(path);

        // Number Position inside the wedge
        const midRadius = (innerRadius + outerRadius) / 2;
        const textPos = polarToCartesian(centerX, centerY, midRadius, midDeg);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textPos.x);
        text.setAttribute("y", textPos.y);
        text.setAttribute("class", "slice-text");
        text.textContent = data.number;
        svg.appendChild(text);

        // Pointer Line setup
        const lineStart = polarToCartesian(centerX, centerY, outerRadius + 5, midDeg);
        const lineMid = polarToCartesian(centerX, centerY, outerRadius + 40, midDeg);

        const isRight = midDeg > -90 && midDeg < 90;
        const lineEnd = {
          x: isRight ? lineMid.x + 50 : lineMid.x - 50,
          y: lineMid.y
        };

        // Draw Line
        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", `${lineStart.x},${lineStart.y} ${lineMid.x},${lineMid.y} ${lineEnd.x},${lineEnd.y}`);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", data.color);
        polyline.setAttribute("class", "pointer-line");
        svg.appendChild(polyline);

        // Label Text beside Pointer Line
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const textAnchor = isRight ? "start" : "end";
        const labelX = isRight ? lineEnd.x + 8 : labelXOffset = lineEnd.x - 8;

        labelText.setAttribute("x", labelX);
        labelText.setAttribute("y", lineEnd.y + 4);
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
      });
    });