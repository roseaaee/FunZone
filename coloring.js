'use strict';
/* =====================================================
   FunZone COLORING – pixel art, colour by number
   - pick a picture from the collection (grey until it is coloured)
   - pick a numbered colour at the bottom: every box with that number turns darker
   - tap or drag over those boxes to colour them
   - pinch with two fingers (or + / −, or the mouse wheel) to zoom; drag with two fingers (or ✋) to move
   Progress is kept on this device only.
   ===================================================== */
FZ.colorProg = store.get('color', {});                  // { pictureId: "0101…" one digit per box: 1 = coloured }
const saveColor = () => store.set('color', FZ.colorProg);
const cp = { pic: null, sel: 1, done: null, scale: 1, ox: 0, oy: 0, pan: false, peek: false, smooth: 0 };

/* the SMOOTH picture (traced from the pixels by tools/build_pictures.py) — it appears when a picture is finished */
const pathCache = new Map();
function drawSmooth(g, p, ox, oy, S, alpha = 1) {
  if (!p.smooth) return;
  let L = pathCache.get(p.id); if (!L) { L = p.smooth.map(l => ({ c: p.colors[l.c - 1], path: new Path2D(l.d) })); pathCache.set(p.id, L); }
  g.save(); g.globalAlpha = alpha; g.translate(ox, oy); g.scale(S, S); g.lineJoin = 'round'; g.lineWidth = 0.14;
  L.forEach(l => { g.fillStyle = l.c; g.strokeStyle = l.c; g.fill(l.path, 'evenodd'); g.stroke(l.path); });
  g.restore();
}

/* grey shade for a colour that is not coloured yet (dark colours → darker grey), like a pencil sketch */
const greyOf = hex => { const n = parseInt(hex.slice(1), 16), l = ((n >> 16) * .3 + ((n >> 8) & 255) * .59 + (n & 255) * .11); const g = Math.round(205 + l / 255 * 42); return `rgb(${g},${g},${g})`; };
const cellAt = (p, x, y) => +p.cells[y][x];
const doneOf = p => { const s = FZ.colorProg[p.id] || ''; return Array.from({ length: p.w * p.h }, (_, i) => s[i] === '1'); };
const progressOf = p => { const d = doneOf(p); let n = 0, all = 0; for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (cellAt(p, x, y)) { all++; if (d[y * p.w + x]) n++; } return all ? n / all : 0; };

/* a small picture for the collection: grey boxes, coloured ones in colour */
function drawThumb(cv, p) {
  const d = doneOf(p), S = Math.floor(Math.min(cv.width / p.w, cv.height / p.h)), ox = (cv.width - S * p.w) / 2, oy = (cv.height - S * p.h) / 2, g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  if (progressOf(p) >= 1 && p.smooth) return drawSmooth(g, p, ox, oy, S);        // finished pictures show their smooth version
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = cellAt(p, x, y); if (!c) continue;
    g.fillStyle = d[y * p.w + x] ? p.colors[c - 1] : greyOf(p.colors[c - 1]);
    g.fillRect(ox + x * S, oy + y * S, S, S);
    if (!d[y * p.w + x]) { g.strokeStyle = 'rgba(0,0,0,.06)'; g.strokeRect(ox + x * S + .5, oy + y * S + .5, S - 1, S - 1); }
  }
}

/* ---------------- THE COLLECTION ---------------- */
function renderColorList() {
  const grid = $('#colorGrid'); grid.innerHTML = '';
  FZ.pictures.forEach(p => {
    const pr = progressOf(p), name = p.name[FZ.lang] || p.name.en;
    const card = h(`<button class="pixcard" aria-label="${name}"><canvas width="200" height="200"></canvas><span class="pbar"><i style="width:${Math.round(pr * 100)}%"></i></span><span class="pname">${name}${pr >= 1 ? ' ✅' : ''}</span></button>`);
    drawThumb($('canvas', card), p);
    card.onclick = () => { FZ.sfx('pop'); openPicture(p); };
    grid.append(card);
  });
}
function goColoring() { destroyGame(); renderColorList(); show('coloring'); FZ.say(FZ.t('co_pick')); }
$('#colorBack').onclick = goHome;

/* ---------------- COLOURING ONE PICTURE ---------------- */
const cv = $('#pxCanvas'), box = $('#pxBox');
function openPicture(p) {
  cp.pic = p; cp.done = doneOf(p); cp.pan = false; cp.peek = false; cp.smooth = progressOf(p) >= 1 ? 1 : 0; peekUI();
  $('#pxTitle').textContent = p.name[FZ.lang] || p.name.en;
  $('#pxPan').classList.remove('on');
  show('paint');
  const first = p.colors.findIndex((_, i) => left(i + 1) > 0);
  cp.sel = first < 0 ? 1 : first + 1;
  renderPalette(); requestAnimationFrame(() => { fit(); draw(); });
  if (!FZ.settings.colorHelp) { FZ.settings.colorHelp = 1; FZ.saveSettings(); setTimeout(openColorHelp, 300); }   // instructions the first time only
}
const left = num => { const p = cp.pic; let n = 0; for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (cellAt(p, x, y) === num && !cp.done[y * p.w + x]) n++; return n; };
function renderPalette() {
  const p = cp.pic, pal = $('#pxPal'); pal.innerHTML = '';
  p.colors.forEach((c, i) => {
    const num = i + 1, fin = left(num) === 0, dark = parseInt(c.slice(1, 3), 16) * .3 + parseInt(c.slice(3, 5), 16) * .59 + parseInt(c.slice(5, 7), 16) * .11 < 140;
    const b = h(`<button class="pxsw ${num === cp.sel ? 'on' : ''} ${fin ? 'fin' : ''}" style="--sw:${c};color:${dark ? '#fff' : '#222'}" aria-label="${FZ.t('co_color')} ${num}${fin ? ' ✓' : ''}">${fin ? '✓' : num}</button>`);
    b.onclick = () => { cp.sel = num; FZ.sfx('pop'); renderPalette(); draw(); };
    pal.append(b);
  });
}
/* view: cell size in screen pixels (scale) and the picture's top-left corner (ox, oy) */
function fit() {
  const p = cp.pic, W = box.clientWidth, H = box.clientHeight, dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  /* the "finished look" card sits at the top right; the picture fits in the rest (beside it on wide screens, below it on tall ones) */
  const m = Math.round(clamp(Math.min(W, H) * .24, 70, 190)), wide = W >= H * 1.15, side = $('#pxSide');
  side.style.width = m + 'px'; drawMini(m);
  const aw = wide ? W - m - 20 : W, ah = wide ? H : H - m - 34, ax = 0, ay = wide ? 0 : m + 34;
  cp.scale = Math.max(4, Math.min((aw - 24) / p.w, (ah - 24) / p.h));
  cp.ox = ax + (aw - cp.scale * p.w) / 2; cp.oy = ay + (ah - cp.scale * p.h) / 2;
}
/* the finished picture, in pixels, so the child can see what they are making */
function drawMini(m) {
  const p = cp.pic, c = $('#pxMini'), dpr = window.devicePixelRatio || 1, S = Math.floor((m - 12) * dpr / Math.max(p.w, p.h));
  c.width = c.height = Math.round((m - 12) * dpr); c.style.width = c.style.height = (m - 12) + 'px';
  const g = c.getContext('2d'), ox = (c.width - S * p.w) / 2, oy = (c.height - S * p.h) / 2;
  g.clearRect(0, 0, c.width, c.height);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const k = cellAt(p, x, y); if (k) { g.fillStyle = p.colors[k - 1]; g.fillRect(ox + x * S, oy + y * S, S, S); } }
}
function zoomAt(f, cx, cy) {
  const p = cp.pic, W = box.clientWidth, H = box.clientHeight, min = Math.min((W - 24) / p.w, (H - 24) / p.h) * 0.8, max = 90;
  const ns = clamp(cp.scale * f, min, max), k = ns / cp.scale;
  cp.ox = cx - (cx - cp.ox) * k; cp.oy = cy - (cy - cp.oy) * k; cp.scale = ns; draw();
}
function draw() {
  const p = cp.pic, g = cv.getContext('2d'), dpr = window.devicePixelRatio || 1, S = cp.scale;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  if (cp.smooth >= 1) return drawSmooth(g, p, cp.ox, cp.oy, S);
  const showNum = S >= 15 && !cp.peek, t = performance.now();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.min(22, S * 0.52)}px system-ui, sans-serif`;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = cellAt(p, x, y); if (!c) continue;
    const X = cp.ox + x * S, Y = cp.oy + y * S;
    if (X > cv.width / dpr || Y > cv.height / dpr || X + S < 0 || Y + S < 0) continue;
    if (cp.done[y * p.w + x] || cp.peek) { g.fillStyle = p.colors[c - 1]; g.fillRect(X, Y, S + .5, S + .5); continue; }      // 🖼️ peek: every box in its real colour
    const hot = c === cp.sel;                               // boxes with the chosen number are darker, so they are easy to find
    g.fillStyle = hot ? '#8d8d8d' : greyOf(p.colors[c - 1]); g.fillRect(X, Y, S, S);
    if (S >= 8) { g.strokeStyle = hot ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.08)'; g.lineWidth = 1; g.strokeRect(X + .5, Y + .5, S - 1, S - 1); }
    if (showNum) { g.fillStyle = hot ? '#fff' : 'rgba(0,0,0,.45)'; g.fillText(c, X + S / 2, Y + S / 2 + 1); }
  }
  if (cp.smooth > 0) drawSmooth(g, p, cp.ox, cp.oy, S, cp.smooth);                  // the finished picture melting into its smooth version
}
window.addEventListener('resize', () => { if (FZ.screen === 'paint' && cp.pic) { const s = cp.scale; fit(); draw(); } });

/* colour the box under a point (only if it has the chosen number) */
function paintAt(px, py) {
  const p = cp.pic, x = Math.floor((px - cp.ox) / cp.scale), y = Math.floor((py - cp.oy) / cp.scale);
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
  const c = cellAt(p, x, y), i = y * p.w + x;
  if (cp.peek) { cp.peek = false; peekUI(); draw(); }
  if (cp.smooth || !c || cp.done[i]) return;
  if (c !== cp.sel) { if (!paintAt.warned) { paintAt.warned = true; FZ.sfx('oops'); setTimeout(() => paintAt.warned = false, 600); } return; }
  cp.done[i] = true; FZ.sfx('step'); draw(); save();
  if (left(cp.sel) === 0) {                                  // this colour is finished: go on to the next one
    FZ.sfx('good'); const nx = p.colors.findIndex((_, k) => left(k + 1) > 0);
    if (nx < 0) return finished();
    cp.sel = nx + 1; renderPalette(); draw();
  }
}
let saveT = null;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { FZ.colorProg[cp.pic.id] = cp.done.map(b => b ? 1 : 0).join(''); saveColor(); }, 250); }
function finished() {
  FZ.colorProg[cp.pic.id] = cp.done.map(b => b ? 1 : 0).join(''); saveColor(); renderPalette();
  fit(); draw(); FZ.sfx('win');
  /* the pixels melt into a smooth picture */
  const t0 = performance.now(), D = 1600;
  const melt = t => { cp.smooth = Math.min(1, (t - t0) / D); draw(); if (cp.smooth < 1 && FZ.screen === 'paint') requestAnimationFrame(melt); else showDone(); };
  setTimeout(() => requestAnimationFrame(melt), 500);
}
function showDone() {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard"><div style="font-size:64px">🎉🖍️</div><h2>${FZ.t('co_done')}</h2>
    <canvas id="pxDone" width="440" height="440" style="width:220px;height:220px;margin:8px auto;display:block"></canvas>
    <div class="actions"><button class="btn big" id="mClose">🎨 ${FZ.t('co_more')}</button></div></div>`;
  drawThumb($('#pxDone'), cp.pic);
  m.classList.remove('hidden'); FZ.say(FZ.t('co_done'));
  $('#mClose').onclick = () => { m.classList.add('hidden'); goColoring(); };
}

/* touch / mouse: one finger colours, two fingers zoom and move; ✋ mode moves with one finger */
(() => {
  const pts = new Map(); let pinch = null, painting = false, panLast = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    pts.set(e.pointerId, pos(e));
    if (pts.size === 2) { painting = false; const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; return; }
    if (cp.pan || e.button === 1 || e.button === 2) { panLast = pos(e); return; }
    painting = true; paintAt(...pos(e));
  });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, pos(e));
    if (pinch && pts.size >= 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      cp.ox += m[0] - pinch.m[0]; cp.oy += m[1] - pinch.m[1];
      zoomAt(d / pinch.d, m[0], m[1]); pinch = { d, m }; return;
    }
    if (panLast) { const q = pos(e); cp.ox += q[0] - panLast[0]; cp.oy += q[1] - panLast[1]; panLast = q; draw(); return; }
    if (painting) paintAt(...pos(e));
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { painting = false; panLast = null; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = pos(e); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, x, y); }, { passive: false });
})();
const mid = () => [box.clientWidth / 2, box.clientHeight / 2];
$('#pxIn').onclick = () => zoomAt(1.4, ...mid());
$('#pxOut').onclick = () => zoomAt(1 / 1.4, ...mid());
$('#pxFit').onclick = () => { fit(); draw(); };
function peekUI() { }                                                          // (the old 🖼️ button is gone: the finished look is always shown at the top right)
$('#pxPan').onclick = () => { cp.pan = !cp.pan; $('#pxPan').classList.toggle('on', cp.pan); $('#pxPan').setAttribute('aria-pressed', cp.pan); FZ.sfx('pop'); };
$('#pxBack').onclick = goColoring;
$('#pxHelp').onclick = () => openColorHelp();
$('#pxReset').onclick = () => { if (confirm(FZ.t('co_reset_ask'))) { delete FZ.colorProg[cp.pic.id]; saveColor(); openPicture(cp.pic); } };
document.addEventListener('keydown', e => {
  if (FZ.screen === 'paint' && $('#modal').classList.contains('hidden')) {
    if (e.key === '+' || e.key === '=') zoomAt(1.25, ...mid());
    else if (e.key === '-') zoomAt(0.8, ...mid());
    else if (e.key === 'Escape') goColoring();
    else if (/^[1-9]$/.test(e.key) && +e.key <= cp.pic.colors.length) { cp.sel = +e.key; renderPalette(); draw(); }
  } else if (FZ.screen === 'coloring' && e.key === 'Escape') goHome();
});

/* how to colour: zoom, pick a number, colour the dark boxes */
function openColorHelp() {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard cohelp"><h2>🎨 ${FZ.t('co_how')}</h2>
    <ol>
      <li><span class="ci">🤏</span><span>${FZ.t('co_h1')}</span></li>
      <li><span class="ci">🔢</span><span>${FZ.t('co_h2')}</span></li>
      <li><span class="ci">👆</span><span>${FZ.t('co_h3')}</span></li>
      <li><span class="ci">✅</span><span>${FZ.t('co_h4')}</span></li>
    </ol>
    <div class="actions"><button class="btn big" id="mClose">${FZ.t('lets_play')}</button></div></div>`;
  m.classList.remove('hidden'); $('#mClose').onclick = () => m.classList.add('hidden');
  FZ.say([FZ.t('co_h1'), FZ.t('co_h2'), FZ.t('co_h3')].join(' '), false);
}
FZ.onLangColor = () => { if (FZ.screen === 'coloring') renderColorList(); else if (FZ.screen === 'paint' && cp.pic) $('#pxTitle').textContent = cp.pic.name[FZ.lang] || cp.pic.name.en; };
