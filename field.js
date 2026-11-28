'use strict';
/* =====================================================
   FIELD – a small real-time playground engine (canvas).
   Kids walk and run freely, like in the real games:
   • drag anywhere = a joystick appears under the finger
   • tap the ground = walk there
   • arrow keys / WASD on a keyboard
   Used by Patintero, Agawan Base, Langit-Lupa, Araw-Lilim,
   Kapitang Bakod, Lawin at Sisiw and Taguan.
   World units: the kids are about 16 units tall.
   ===================================================== */
(function () {
  const imgCache = new Map();
  /* an SVG drawing → an <img> the canvas can draw (cached) */
  FZ.sprite = svg => {
    let im = imgCache.get(svg); if (im) return im;
    const vb = (svg.match(/viewBox="([^"]+)"/) || [, '0 0 100 100'])[1].split(/[ ,]+/).map(Number);
    const sized = svg.replace('<svg ', `<svg width="${vb[2] * 4}" height="${vb[3] * 4}" `);
    im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized); im.ar = vb[2] / vb[3];
    imgCache.set(svg, im); if (imgCache.size > 400) imgCache.delete(imgCache.keys().next().value);
    return im;
  };
  /* a kid's poses as images: stand, two running frames, left and right */
  FZ.kidSprites = (make) => {
    const S = {}; ['stand', 'run', 'arms', 'jump', 'wide'].forEach(p => { S[p] = FZ.sprite(make(p, false)); S[p + 'L'] = FZ.sprite(make(p, true)); });
    return S;
  };
  const hyp = Math.hypot;
  /* one emoji → a picture 2× its size, so nothing is ever cut off */
  const EMO = 96, emoCache = new Map();
  function emojiPic(e) {
    let c = emoCache.get(e); if (c) return c;
    c = document.createElement('canvas'); c.width = EMO * 2; c.height = EMO * 2;
    const g = c.getContext('2d'); g.font = `${EMO}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui`;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(e, EMO, EMO * 1.5);
    emoCache.set(e, c); return c;
  }

  FZ.field = (api, o) => {
    let vw = o.view ? o.view[0] : o.W, vh = o.view ? o.view[1] : o.H;
    const wrap = h(`<div class="field"><canvas></canvas><div class="fhud"></div></div>`);
    const cv = $('canvas', wrap), ctx = cv.getContext('2d'), hud = $('.fhud', wrap);
    api.stage.append(wrap);
    const F = {
      W: o.W, H: o.H, vw, vh, actors: [], props: [], solids: o.solids || [], cam: { x: 0, y: 0 }, t: 0,
      el: wrap, hud, ctx, canvas: cv, goal: null, input: { x: 0, y: 0 }, frozen: false, dark: 0, follow: !!o.view,
      bounds: o.bounds || { x: 3, y: 3, w: o.W - 6, h: o.H - 6 }
    };
    /* ---------- size: as big as fits on screen, keeping the shape ---------- */
    let S = 1, dpr = 1;
    function size() {
      /* use the free space under the top bar: whatever the phone, tablet or computer, and either way round */
      /* only things in the normal flow under the playground take room (not the goal card that floats on top) */
      const top = api.stage.getBoundingClientRect().top + (window.scrollY || 0), below = [...api.stage.children].filter(c => {
        if (c === wrap || !c.offsetHeight) return false; const cs = getComputedStyle(c);
        return cs.position !== 'fixed' && cs.position !== 'absolute' && cs.gridColumn !== '2 / auto';
      }).reduce((n, c) => n + c.offsetHeight + 8, 0);
      const land = innerWidth > innerHeight && innerHeight < 560, side = land && api.stage.querySelector(':scope > .actions:not(:empty)') ? 200 : 0;
      const maxW = Math.max(200, (api.stage.clientWidth || innerWidth) - side), maxH = Math.max(160, (window.visualViewport ? visualViewport.height : innerHeight) - top - 10 - (land ? 0 : below));
      /* FILL THE SCREEN: the playground always takes ALL the free space, on phones, tablets and computers, upright or sideways.
         When the screen is a different shape from the place, we show a little less of it and the camera follows your player;
         if the screen is still a different shape, the ground simply continues past the edges of the play area. */
      const A = maxW / maxH, KEEP = o.keep || .6;
      if (o.view && o.view[0] < F.W) {
        vh = o.view[1]; vw = clamp(vh * A, o.view[0] * .5, Math.min(F.W, o.view[0] * 1.6));
        if (vw / vh > A + .01) vh = Math.min(F.H, vw / A);
        else if (vw / vh < A - .01) vw = Math.min(F.W, vh * A);
      } else {
        vw = F.W; vh = F.H;
        if (A < vw / vh) vw = Math.max(F.W * KEEP, vh * A);                       // tall screen: show a bit less from side to side
        else vh = Math.max(F.H * KEEP, vw / A);                                   // wide screen: show a bit less from top to bottom
      }
      if (vw / vh > A) vh = vw / A; else vw = vh * A;                             // still a different shape: the ground goes on past the edges
      F.follow = vw < F.W - .5 || vh < F.H - .5;
      F.vw = vw; F.vh = vh;
      const w = maxW, hh = maxH;
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.style.width = w + 'px'; cv.style.height = hh + 'px'; cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr);
      S = cv.width / vw;
    }
    let lastKey = '';
    const resize = () => { const k = innerWidth + 'x' + Math.round((window.visualViewport ? visualViewport.height : innerHeight) / 24); if (k === lastKey) return; lastKey = k; size(); };
    size(); requestAnimationFrame(() => { lastKey = ''; resize(); }); api.on(window, 'resize', resize);
    if (window.visualViewport) api.on(visualViewport, 'resize', resize); api.on(window, 'orientationchange', () => setTimeout(() => { lastKey = ''; resize(); }, 300));

    /* ---------- actors (kids) ---------- */
    F.actor = a => {
      a = Object.assign({ x: 0, y: 0, r: 3.2, h: 17, speed: 30, vx: 0, vy: 0, face: 1, step: 0, hidden: false, alpha: 1, solid: true }, a);
      if (a.make && !a.spr) a.spr = FZ.kidSprites(a.make);
      F.actors.push(a); return a;
    };
    F.prop = p => { F.props.push(p); return p; };
    F.me = null;
    /* ---------- moving helpers ---------- */
    const inBounds = a => { const B = F.bounds; a.x = clamp(a.x, B.x, B.x + B.w); a.y = clamp(a.y, B.y, B.y + B.h); };
    function collide(a) {
      if (!a.solid) return;
      for (const s of F.solids) {
        if (s.off) continue;
        if (s.r) {                                                  // round things (tree trunks, rocks)
          const dx = a.x - s.x, dy = a.y - s.y, d = hyp(dx, dy), m = s.r + a.r * .7;
          if (d < m && d > 0.001) { a.x = s.x + dx / d * m; a.y = s.y + dy / d * m; }
        } else {                                                    // boxes (houses, fences)
          const nx = clamp(a.x, s.x, s.x + s.w), ny = clamp(a.y, s.y, s.y + s.h), dx = a.x - nx, dy = a.y - ny, d = hyp(dx, dy), m = a.r * .7;
          if (d < m) {
            if (d > 0.001) { a.x = nx + dx / d * m; a.y = ny + dy / d * m; }
            else { const L = [a.x - s.x, s.x + s.w - a.x, a.y - s.y, s.y + s.h - a.y], k = L.indexOf(Math.min(...L)); if (k === 0) a.x = s.x - m; else if (k === 1) a.x = s.x + s.w + m; else if (k === 2) a.y = s.y - m; else a.y = s.y + s.h + m; }
          }
        }
      }
    }
    F.walk = (a, dx, dy, dt, sp = a.speed) => {
      const d = hyp(dx, dy); if (d < 0.001) { a.vx = a.vy = 0; return; }
      const k = Math.min(1, d); a.vx = dx / d * sp * k; a.vy = dy / d * sp * k;
      a.x += a.vx * dt; a.y += a.vy * dt; if (Math.abs(a.vx) > 0.5) a.face = a.vx < 0 ? -1 : 1;
      collide(a); inBounds(a); a.step += dt * sp * .09;
    };
    /* walk toward a point; true when there */
    F.goTo = (a, x, y, dt, sp = a.speed, near = 0.8) => {
      const dx = x - a.x, dy = y - a.y, d = hyp(dx, dy);
      if (d <= near) { a.vx = a.vy = 0; return true; }
      const st = Math.min(d, sp * dt); F.walk(a, dx / d, dy / d, dt, st / dt); return false;
    };
    F.dist = (a, b) => hyp(a.x - b.x, a.y - b.y);
    F.moving = a => hyp(a.vx, a.vy) > 1;

    /* ---------- input: keys, joystick, tap to walk ---------- */
    const keys = new Set();
    api.on(window, 'keydown', e => { const k = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D', A: 'L', D: 'R', W: 'U', S: 'D' }[e.key]; if (k) { keys.add(k); F.goal = null; e.preventDefault(); } });
    api.on(window, 'keyup', e => { const k = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D', A: 'L', D: 'R', W: 'U', S: 'D' }[e.key]; if (k) keys.delete(k); });
    let joy = null;
    const toWorld = (cx, cy) => { const r = cv.getBoundingClientRect(); return { x: F.cam.x + (cx - r.left) / r.width * vw, y: F.cam.y + (cy - r.top) / r.height * vh }; };
    cv.style.touchAction = 'none';
    api.on(cv, 'pointerdown', e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { }
      joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), moved: false };
    });
    api.on(cv, 'pointermove', e => {
      if (!joy || e.pointerId !== joy.id) return;
      joy.x = e.clientX; joy.y = e.clientY;
      if (hyp(joy.x - joy.x0, joy.y - joy.y0) > 12) { joy.moved = true; F.goal = null; }
    });
    const up = e => {
      if (!joy || e.pointerId !== joy.id) return;
      const j = joy; joy = null;
      if (!j.moved && performance.now() - j.t0 < 400) {               // a tap
        const w = toWorld(j.x, j.y);
        if (F.onTap && F.onTap(w.x, w.y) === true) return;
        F.goal = w;
      }
    };
    api.on(cv, 'pointerup', up); api.on(cv, 'pointercancel', up);
    F.stick = () => {
      let x = (keys.has('R') ? 1 : 0) - (keys.has('L') ? 1 : 0), y = (keys.has('D') ? 1 : 0) - (keys.has('U') ? 1 : 0);
      if (joy && joy.moved) { const r = cv.getBoundingClientRect(), k = vw / r.width; x = (joy.x - joy.x0) * k / 9; y = (joy.y - joy.y0) * k / 9; }
      const d = hyp(x, y); if (d > 1) { x /= d; y /= d; }
      return { x, y };
    };

    /* ---------- drawing ---------- */
    F.drawKid = (a) => {
      if (a.hidden) return;
      const mv = F.moving(a), pose = a.pose || (mv ? (Math.floor(a.step) % 2 ? 'run' : 'stand') : 'stand');
      const im = a.spr ? a.spr[pose + (a.face < 0 ? 'L' : '')] || a.spr.stand : null;
      const hh = a.h, ww = im && im.ar ? hh * im.ar : hh * .68, bob = mv ? Math.abs(Math.sin(a.step * Math.PI)) * 1.2 : 0;
      ctx.save(); ctx.globalAlpha = a.alpha;
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r * 1.3, a.r * .55, 0, 0, 7); ctx.fill();
      if (a.ring) { ctx.strokeStyle = a.ring; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r * 1.9, a.r * .9, 0, 0, 7); ctx.stroke(); }
      if (im && im.complete && im.naturalWidth) ctx.drawImage(im, a.x - ww / 2, a.y - hh - bob + 1 - (a.lift || 0), ww, hh);
      else if (a.emoji) { ctx.font = `${hh * .8}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(a.emoji, a.x, a.y); }
      if (a.tag) { ctx.font = `bold ${4.2}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; const w = ctx.measureText(a.tag).width + 3; ctx.fillStyle = a.tagBg || 'rgba(255,255,255,.92)'; F.round(a.x - w / 2, a.y - hh - 7.5 - bob, w, 6, 2); ctx.fill(); ctx.fillStyle = a.tagFg || '#2b2140'; ctx.fillText(a.tag, a.x, a.y - hh - 2 - bob); }
      ctx.restore();
    };
    F.round = (x, y, w, hh, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    /* emoji are drawn once, big, on their own little canvas with room around them, then reused.
       (Drawing a tiny emoji on a zoomed canvas cuts off its edges on some phones.) */
    F.emoji = (e, x, y, s, alpha = 1) => {
      const im = emojiPic(e); ctx.save(); ctx.globalAlpha = alpha;
      const k = s / EMO; ctx.drawImage(im, x - im.width * k / 2, y - EMO * 1.62 * k, im.width * k, im.height * k);   // bottom of the emoji sits on y
      ctx.restore();
    };
    F.text = (t, x, y, s = 5, c = '#2b2140') => { ctx.save(); ctx.font = `bold ${s}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = s * .28; ctx.strokeStyle = '#fff'; ctx.strokeText(t, x, y); ctx.fillStyle = c; ctx.fillText(t, x, y); ctx.restore(); };
    function render() {
      const me = F.me;
      /* the camera: follow your player inside the place; if the view is bigger than the place, keep the place in the middle */
      const camAxis = (p, v, W) => v >= W ? (W - v) / 2 : clamp(p - v / 2, 0, W - v);
      if (me) { F.cam.x = camAxis(me.x, vw, F.W); F.cam.y = camAxis(me.y, vh, F.H); } else { F.cam.x = camAxis(F.W / 2, vw, F.W); F.cam.y = camAxis(F.H / 2, vh, F.H); }
      ctx.setTransform(S, 0, 0, S, -F.cam.x * S, -F.cam.y * S);
      if (vw > F.W + .5 || vh > F.H + .5) {                       // ground past the edges of the play area
        ctx.fillStyle = o.edge || '#9be07a'; ctx.fillRect(F.cam.x, F.cam.y, vw, vh);
        ctx.fillStyle = 'rgba(60,140,40,.18)'; for (let i = 0; i < vw * vh / 260; i++) ctx.fillRect(F.cam.x + (i * 97.13) % vw, F.cam.y + (i * 61.7 + (i % 7) * 13) % vh, 1.2, .5);
      } else ctx.clearRect(F.cam.x, F.cam.y, vw, vh);
      o.ground && o.ground(ctx, F);
      const list = F.props.concat(F.actors).filter(x => !x.gone).sort((a, b) => (a.z || a.y) - (b.z || b.y));
      list.forEach(x => x.draw ? x.draw(ctx, F) : F.drawKid(x));
      o.over && o.over(ctx, F);
      if (F.dark > 0 && me) {                                     // dusk: you only see near you
        ctx.setTransform(S, 0, 0, S, 0, 0);
        const cx = me.x - F.cam.x, cy = me.y - 8 - F.cam.y, R = F.darkR || 40;
        const g = ctx.createRadialGradient(cx, cy, R * .55, cx, cy, R);
        g.addColorStop(0, 'rgba(12,16,48,0)'); g.addColorStop(1, `rgba(12,16,48,${F.dark})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (joy && joy.moved) {                                     // the joystick under the finger
        const r = cv.getBoundingClientRect(), k = cv.width / r.width, x0 = (joy.x0 - r.left) * k, y0 = (joy.y0 - r.top) * k;
        let dx = (joy.x - joy.x0) * k, dy = (joy.y - joy.y0) * k; const d = hyp(dx, dy), m = 46 * dpr; if (d > m) { dx = dx / d * m; dy = dy / d * m; }
        ctx.globalAlpha = .55; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x0, y0, m, 0, 7); ctx.fill();
        ctx.globalAlpha = .9; ctx.fillStyle = '#845ef7'; ctx.beginPath(); ctx.arc(x0 + dx, y0 + dy, 20 * dpr, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (F.goal && me && !F.frozen) {                            // where you tapped
        ctx.setTransform(S, 0, 0, S, -F.cam.x * S, -F.cam.y * S);
        ctx.strokeStyle = 'rgba(132,94,247,.8)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.ellipse(F.goal.x, F.goal.y, 3.5, 1.8, 0, 0, 7); ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    /* ---------- the game loop ---------- */
    api.frame(dt => {
      F.t += dt;
      const me = F.me;
      if (me && !F.frozen && !me.locked) {
        const s = F.stick();
        if (s.x || s.y) F.walk(me, s.x, s.y, dt);
        else if (F.goal) { if (F.goTo(me, F.goal.x, F.goal.y, dt)) { F.goal = null; F.onArrive && F.onArrive(); } }
        else { me.vx = me.vy = 0; }
      }
      if (!F.frozen) o.tick && o.tick(dt, F);
      render();
    });
    FZ.lastField = F;                 // (for automatic tests)
    return F;
  };
})();
