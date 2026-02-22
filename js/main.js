'use strict';

/* ==========================================================================
   GALLERY DATA
   — ここを編集してギャラリーを更新できます
   ========================================================================== */
const GALLERY = [
  { id:'001', title:'WORK 01', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1710.jpg' },
  { id:'002', title:'WORK 02', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1711.jpg' },
  { id:'003', title:'WORK 03', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1712.jpg' },
  { id:'004', title:'WORK 04', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1713.jpg' },
  { id:'005', title:'WORK 05', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1714.jpg' },
  { id:'006', title:'WORK 06', year:'2025', tags:['ART','SKETCH'], img:'images/IMG_1715.jpg' },
];

/* ==========================================================================
   UTILITY
   ========================================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ==========================================================================
   CUSTOM CURSOR
   ========================================================================== */
function initCursor() {
  const dot  = Object.assign(document.createElement('div'), { className: 'cursor' });
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  document.body.append(dot, ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tick() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .gallery-item, .c-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(2)';
      ring.style.width     = '50px';
      ring.style.height    = '50px';
      ring.style.borderColor = 'var(--pink)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(1)';
      ring.style.width     = '28px';
      ring.style.height    = '28px';
      ring.style.borderColor = 'var(--blue)';
    });
  });
}

/* ==========================================================================
   CITY CANVAS — animated cyberpunk Shanghai skyline
   ========================================================================== */
function initCityCanvas() {
  const canvas = document.getElementById('cityCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, frame = 0;
  const layers = { far: [], mid: [], near: [] };
  const rain = [], sparks = [];

  /* ---- helpers ---- */
  function rInt(a, b) { return Math.floor(rand(a, b)); }

  function makeBuildings(count, wMin, wMax, hMin, hMax) {
    const list = [];
    let x = rInt(-120, -40);
    while (x < W + 200) {
      const w = rand(wMin, wMax);
      const h = rand(hMin, hMax);
      const wins = [];
      const ww = 3, wh = 4, gx = 7, gy = 9;
      for (let wy = H - h + 14; wy < H - 8; wy += wh + gy) {
        for (let wx = x + 7; wx < x + w - 5; wx += ww + gx) {
          const r = Math.random();
          const col = r > .6 ? (r > .85 ? (r > .94 ? 'p' : 'g') : 'b') : '';
          wins.push({ x: wx, y: wy, w: ww, h: wh, col,
            flicker: Math.random() < .06,
            phase: rand(0, Math.PI * 2),
            spd:   rand(.4, 2.0) });
        }
      }
      const sign = Math.random() < .18 && w > 45;
      list.push({ x, w, h, wins, sign });
      x += w + rand(-4, 10);
    }
    return list;
  }

  function resetScene() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    layers.far  = makeBuildings(0, 22, 58,  50, 160);
    layers.mid  = makeBuildings(0, 32, 82,  80, 240);
    layers.near = makeBuildings(0, 44, 130, 110, 360);

    rain.length = 0;
    for (let i = 0; i < 260; i++) {
      rain.push({ x: rand(0, W), y: rand(-H, H),
        len: rand(7, 22), spd: rand(7, 16), op: rand(.06, .22) });
    }
    sparks.length = 0;
    for (let i = 0; i < 45; i++) {
      sparks.push({
        x: rand(0, W), y: rand(0, H),
        sz: rand(.8, 2.8),
        dx: rand(-.4, .4), dy: rand(-1.4, -.25),
        op: rand(.3, .9), life: rand(0, 1), maxL: rand(.4, 1),
        col: Math.random() < .55 ? '#00d4ff' : '#ff006e',
      });
    }
  }

  function drawBuilding(b, bodyAlpha, edgeAlpha) {
    const by = H - b.h;
    ctx.fillStyle = `rgba(7,7,18,${bodyAlpha})`;
    ctx.fillRect(b.x, by, b.w, b.h);

    /* right-edge highlight */
    ctx.fillStyle = `rgba(0,100,200,${edgeAlpha * .14})`;
    ctx.fillRect(b.x + b.w - 1, by, 1, b.h);
    /* top-edge highlight */
    ctx.fillStyle = `rgba(0,150,255,${edgeAlpha * .18})`;
    ctx.fillRect(b.x, by, b.w, 2);

    /* windows */
    for (const w of b.wins) {
      if (!w.col) continue;
      let r = 0, g = 0, bl = 0;
      if (w.col === 'b') { r=0;   g=160; bl=255; }
      if (w.col === 'p') { r=255; g=0;   bl=120; }
      if (w.col === 'g') { r=0;   g=210; bl=110; }
      let op = .55;
      if (w.flicker) op = clamp(.25 + .45 * Math.abs(Math.sin(frame * .05 * w.spd + w.phase)), .1, .9);
      const fa = op * bodyAlpha;
      ctx.fillStyle = `rgba(${r},${g},${bl},${fa})`;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      if (fa > .35) {
        ctx.shadowColor = `rgb(${r},${g},${bl})`;
        ctx.shadowBlur  = 5 * bodyAlpha;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.shadowBlur  = 0;
      }
    }

    /* neon rooftop sign */
    if (b.sign && b.w > 40) {
      const by2 = H - b.h;
      const sx = b.x + b.w * .2, sy = by2 + b.h * .28, sw = b.w * .62;
      ctx.fillStyle = `rgba(255,0,110,${.65 * bodyAlpha})`;
      ctx.shadowColor = '#ff006e';
      ctx.shadowBlur  = 10;
      ctx.fillRect(sx, sy, sw, 7);
      ctx.shadowBlur  = 0;
    }
  }

  function drawFrame() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    /* — Sky gradient — */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#010107');
    sky.addColorStop(.45, '#040418');
    sky.addColorStop(.8,  '#06061a');
    sky.addColorStop(1,   '#0a0820');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* ambient bloom low-horizon */
    const bloom1 = ctx.createRadialGradient(W*.28, H*.72, 0, W*.28, H*.72, W*.52);
    bloom1.addColorStop(0, 'rgba(0,40,130,.14)');
    bloom1.addColorStop(1, 'transparent');
    ctx.fillStyle = bloom1;
    ctx.fillRect(0, 0, W, H);

    const bloom2 = ctx.createRadialGradient(W*.76, H*.65, 0, W*.76, H*.65, W*.38);
    bloom2.addColorStop(0, 'rgba(120,0,60,.10)');
    bloom2.addColorStop(1, 'transparent');
    ctx.fillStyle = bloom2;
    ctx.fillRect(0, 0, W, H);

    /* — Far buildings — */
    for (const b of layers.far) drawBuilding(b, .32, .18);

    /* mid-distance haze */
    const haze = ctx.createLinearGradient(0, H*.45, 0, H*.78);
    haze.addColorStop(0, 'transparent');
    haze.addColorStop(1, 'rgba(3,3,15,.38)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, H*.45, W, H*.33);

    /* — Mid buildings — */
    for (const b of layers.mid) drawBuilding(b, .62, .38);

    /* — Near buildings — */
    for (const b of layers.near) drawBuilding(b, 1, .9);

    /* — Wet ground — */
    const gy = H * .85;
    const grd = ctx.createLinearGradient(0, gy, 0, H);
    grd.addColorStop(0,  'rgba(4,4,24,.8)');
    grd.addColorStop(.4, 'rgba(0,20,60,.4)');
    grd.addColorStop(1,  'rgba(0,0,8,.92)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, gy, W, H - gy);

    /* puddle reflections */
    [
      { x: W*.18, col: 'rgba(0,180,255,.07)' },
      { x: W*.5,  col: 'rgba(255,0,100,.055)' },
      { x: W*.82, col: 'rgba(0,220,110,.05)' },
    ].forEach(({ x, col }, i) => {
      const px = x + Math.sin(frame * .012 + i * 2) * 18;
      const pr = ctx.createRadialGradient(px, H - 18, 0, px, H - 18, 110);
      pr.addColorStop(0, col);
      pr.addColorStop(1, 'transparent');
      ctx.fillStyle = pr;
      ctx.fillRect(px - 110, H - 75, 220, 75);
    });

    /* — Rain — */
    ctx.save();
    for (const d of rain) {
      ctx.strokeStyle = `rgba(140,210,255,${d.op})`;
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.2, d.y + d.len);
      ctx.stroke();
      d.y += d.spd;
      if (d.y > H + 22) { d.y = -d.len; d.x = rand(0, W); }
    }
    ctx.restore();

    /* — Floating neon sparks — */
    for (const p of sparks) {
      p.life += .004;
      if (p.life > p.maxL) { p.life = 0; p.x = rand(0, W); p.y = H; }
      const t  = p.life / p.maxL;
      const op = p.op * Math.sin(t * Math.PI);
      ctx.globalAlpha = op;
      ctx.fillStyle   = p.col;
      ctx.shadowColor = p.col;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(p.life * 8) * 6, p.y - t * H * .45, p.sz, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    /* — Scanlines — */
    ctx.fillStyle = 'rgba(0,0,0,.022)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    /* — Vignette — */
    const vig = ctx.createRadialGradient(W/2, H/2, H*.18, W/2, H/2, H*.95);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0,0,8,.72)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', resetScene);
  resetScene();
  drawFrame();
}

/* ==========================================================================
   GALLERY
   ========================================================================== */
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  GALLERY.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-item reveal';
    el.style.transitionDelay = (i * .055) + 's';
    el.innerHTML = `
      <img src="${item.img}" alt="${item.title}" loading="lazy">
      <div class="g-overlay">
        <div class="g-num">${item.id} / ${item.year}</div>
        <div class="g-title">${item.title}</div>
        <div class="g-tags">
          ${item.tags.map(t => `<span class="g-tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="g-scan"></div>
    `;
    grid.appendChild(el);
  });

  /* Re-attach cursor listeners to newly created items */
  document.querySelectorAll('.gallery-item').forEach(el => {
    const dot  = document.querySelector('.cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    el.addEventListener('mouseenter', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(2)';
      ring.style.width     = '50px';
      ring.style.height    = '50px';
      ring.style.borderColor = 'var(--pink)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(1)';
      ring.style.width     = '28px';
      ring.style.height    = '28px';
      ring.style.borderColor = 'var(--blue)';
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL
   ========================================================================== */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ==========================================================================
   STAT COUNTERS
   ========================================================================== */
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.count;
      const dur    = 1600;
      const t0     = Date.now();
      const tick   = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      tick();
      io.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initNav() {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('navHamburger');
  const drw = document.getElementById('navDrawer');

  /* scroll class */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 50);
  }, { passive: true });

  /* active link */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 220) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }, { passive: true });

  /* mobile hamburger */
  if (btn && drw) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      drw.classList.toggle('open');
    });
    drw.querySelectorAll('.drawer-link').forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('open');
        drw.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   RANDOM GLITCH FLASH on gallery items
   ========================================================================== */
function initGlitchFlash() {
  function flash() {
    const items = document.querySelectorAll('.gallery-item');
    if (!items.length) return;
    const el = items[Math.floor(Math.random() * items.length)];
    el.classList.add('glitch-flash');
    setTimeout(() => el.classList.remove('glitch-flash'), 320);
    setTimeout(flash, 1800 + Math.random() * 5000);
  }
  setTimeout(flash, 3200);
}

/* ==========================================================================
   BOOT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCityCanvas();
  initGallery();
  initReveal();
  initCounters();
  initNav();
  initCursor();
  initGlitchFlash();
});
