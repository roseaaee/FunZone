'use strict';
/* =====================================================
   FunZone core: helpers, storage, sound, voice, kids, board engine
   ===================================================== */
const FZ = {
  games: [],
  cats: [
    { id: 'all',   key: 'cat_all',   emoji: '🌈' },
    { id: 'tag',   key: 'cat_tag',   emoji: '🏃' },
    { id: 'jump',  key: 'cat_jump',  emoji: '🦘' },
    { id: 'skill', key: 'cat_skill', emoji: '🎯' },
    { id: 'board', key: 'cat_board', emoji: '🎲' }
  ]
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const man = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

/* ---------- storage ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('funzone.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('funzone.' + k, JSON.stringify(v)); } catch (e) { } }
};
/* simple salted hash so the PIN is not stored as readable text (a kid-proof gate, not bank-grade security) */
FZ.hash = s => {
  let a = 0xdeadbeef, b = 0x41c6ce57; s = 'funzone:' + s;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677); }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
  b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
  return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36);
};
FZ.settings = Object.assign({ sound: true, voice: true, limit: 0, lang: null, avatar: 'boy' }, store.get('settings', {}));
if (FZ.settings.pin) { FZ.settings.pinHash = FZ.hash(FZ.settings.pin); delete FZ.settings.pin; }   // migrate old plain-text PIN
if (!FZ.settings.pinHash) FZ.settings.pinHash = FZ.hash('1234');
store.set('settings', FZ.settings);
FZ.progress = store.get('progress', {});
FZ.saveSettings = () => store.set('settings', FZ.settings);
FZ.saveProgress = () => store.set('progress', FZ.progress);
FZ.reg = def => FZ.games.push(def);
FZ.lang = FZ.settings.lang || 'en';           // 'en' | 'tl'
FZ.tr = s => s;                                // replaced by lang.js

/* =====================================================
   SOUND – soft, warm "toy xylophone" tones, bubbly pops and gentle footsteps
   ===================================================== */
let AC = null, OUT = null, REV = null, NOISE = null;
function audio() {
  if (!FZ.settings.sound) return null;
  try {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      AC = new C();
      OUT = AC.createGain(); OUT.gain.value = 0.9;
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
      OUT.connect(comp); comp.connect(AC.destination);
      /* tiny room reverb so tones do not sound dry and "computer-like" */
      const len = Math.floor(AC.sampleRate * 0.7), ir = AC.createBuffer(2, len, AC.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      const cv = AC.createConvolver(); cv.buffer = ir; REV = AC.createGain(); REV.gain.value = 0.25; REV.connect(cv); cv.connect(OUT);
      NOISE = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
      const nd = NOISE.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  } catch (e) { return null; }
}
/* mallet (marimba / xylophone-like): a pure tone plus quick-fading overtones */
function mallet(f, when = 0, v = 0.2, dur = 0.55) {
  const a = audio(); if (!a) return; const t = a.currentTime + when;
  [[1, 1, dur], [4, 0.26, dur * 0.22], [9.2, 0.07, dur * 0.1]].forEach(([m, amp, dd]) => {
    const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * m;
    o.connect(g); g.connect(OUT); g.connect(REV);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * amp, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dd);
    o.start(t); o.stop(t + dd + 0.05);
  });
}
/* smooth pitch glide (bubble pops, boings) */
function glide(f0, f1, d, v = 0.14, when = 0) {
  const a = audio(); if (!a) return; const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  o.connect(g); g.connect(OUT); g.connect(REV);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.05);
  o.start(t); o.stop(t + d + 0.08);
}
/* soft filtered noise (footsteps, whoosh) */
function puff(d, f, v = 0.2, when = 0, type = 'lowpass') {
  const a = audio(); if (!a) return; const t = a.currentTime + when, s = a.createBufferSource(), flt = a.createBiquadFilter(), g = a.createGain();
  s.buffer = NOISE; flt.type = type; flt.frequency.value = f; flt.Q.value = type === 'bandpass' ? 1.2 : 0.7;
  s.connect(flt); flt.connect(g); g.connect(OUT);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
}
FZ.tone = (f, d = 0.3, type, v = 0.15, when = 0) => mallet(f, when, Math.min(0.3, v * 1.5), Math.max(0.3, d * 1.6));
FZ.sfx = n => {
  const m = {
    pop: () => glide(520, 980, 0.07, 0.12),
    step: () => { puff(0.07, 420 + rnd(0, 220), 0.22); glide(150, 90, 0.07, 0.07); },
    good: () => { mallet(523, 0, 0.2); mallet(659, 0.09, 0.2); mallet(784, 0.18, 0.22, 0.7); },
    oops: () => { mallet(392, 0, 0.15, 0.35); mallet(294, 0.15, 0.15, 0.5); },
    jump: () => { glide(240, 620, 0.2, 0.13); puff(0.25, 1400, 0.05, 0, 'bandpass'); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => mallet(f, i * 0.12, 0.2, 0.6)); [523, 659, 784, 1047].forEach(f => mallet(f, 0.62, 0.12, 1.1)); }
  };
  (m[n] || (() => { }))();
};

/* =====================================================
   VOICE – picks the most natural voice the device has, in the chosen language
   ===================================================== */
FZ.voices = [];
if ('speechSynthesis' in window) {
  const load = () => { try { FZ.voices = speechSynthesis.getVoices() || []; } catch (e) { } };
  load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) { }
}
const voiceScore = v => (/natural|neural|online/i.test(v.name) ? 10 : 0) + (/google/i.test(v.name) ? 6 : 0)
  + (/samantha|karen|moira|ava|allison|aria|jenny|zira|libby|sonia|blessica|angelo|rosa|female/i.test(v.name) ? 4 : 0) + (v.localService ? 0 : 1);
FZ.voiceFor = lang => {
  const vs = FZ.voices; if (!vs.length) return null;
  const chosen = FZ.settings.voices && FZ.settings.voices[lang];              // the parent's own choice wins
  if (chosen) { const c = vs.find(v => v.name === chosen); if (c) return c; }
  /* Tagalog: Filipino voice first; if the device has none, a phonetically close voice reads Tagalog better than English does */
  const prefs = lang === 'tl' ? ['fil', 'tl', 'id', 'ms', 'es', 'en'] : ['en-us', 'en-gb', 'en-ph', 'en'];
  for (const p of prefs) {
    const c = vs.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(p));
    if (c.length) return c.sort((a, b) => voiceScore(b) - voiceScore(a))[0];
  }
  return null;
};
FZ.say = (t, force) => {
  if ((!FZ.settings.voice && !force) || !('speechSynthesis' in window)) return;
  const clean = String(t).replace(/<[^>]+>/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s*\([^)]*\)/g, '').replace(/[_*·]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  try {
    speechSynthesis.cancel();
    const v = FZ.voiceFor(FZ.lang);
    clean.split(/(?<=[.!?])\s+/).filter(Boolean).forEach(part => {      // short pieces sound smoother and never get cut off
      const u = new SpeechSynthesisUtterance(part);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = FZ.lang === 'tl' ? 'fil-PH' : 'en-US';
      u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
      speechSynthesis.speak(u);
    });
  } catch (e) { }
};

/* =====================================================
   KIDS – whole-body Filipino children: t-shirt, shorts and tsinelas
   pose: stand | wide | run | jump | kick | knee | elbow | climb | sit
   ===================================================== */
FZ.kid = (o = {}) => {
  const d = Object.assign({ pose: 'stand', skin: '#d39a66', hair: '#241713', shirt: '#ff7b54', shorts: '#2f7fd6', shoe: '#ffd43b', girl: false, deco: 'star', flip: false }, o);
  const P = {
    stand: { a: [[-14, -8], [14, 8]], l: [[-5, -3], [5, 3]] },
    wide:  { a: [[-12, -6], [12, 6]], l: [[-24, -16], [24, 16]] },
    run:   { a: [[-50, -100], [42, 115]], l: [[-30, -55], [24, -4]] },
    jump:  { a: [[-155, -170], [155, 170]], l: [[-34, 6], [34, -6]] },
    kick:  { a: [[-75, -65], [75, 65]], l: [[-4, -3], [64, 20]] },
    arms:  { a: [[-88, -90], [88, 90]], l: [[-6, -3], [6, 3]] },
    knee:  { a: [[-75, -65], [75, 65]], l: [[-4, -3], [86, -2]] },
    elbow: { a: [[-75, -65], [102, 172]], l: [[-6, -3], [6, 3]] },
    climb: { a: [[-168, -178], [168, 178]], l: [[-22, 10], [22, -10]] },
    sit:   { a: [[72, 82], [80, 90]], l: [[90, 92], [88, 90]], hips: [[48, 75], [48, 71]], vb: '28 0 70 84', sole: true }
  }[d.pose] || null;
  const pose = P || { a: [[-14, -8], [14, 8]], l: [[-5, -3], [5, 3]] };
  const S = (a, l) => [Math.sin(a * Math.PI / 180) * l, Math.cos(a * Math.PI / 180) * l];
  const ln = (x1, y1, x2, y2, w, c) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const hips = pose.hips || [[44, 70], [56, 70]];
  let legs = '', arms = '';
  pose.l.forEach(([a1, a2], i) => {
    const [hx, hy] = hips[i], [dx1, dy1] = S(a1, 14), kx = hx + dx1, ky = hy + dy1, [dx2, dy2] = S(a2, 16), ax = kx + dx2, ay = ky + dy2;
    const rot = pose.sole ? 0 : -a2;
    legs += ln(kx, ky, ax, ay, 8, d.skin)                                                              // shin
      + `<ellipse cx="${(ax + dx2 * 0.2).toFixed(1)}" cy="${(ay + dy2 * 0.2 + (pose.sole ? 0 : 2)).toFixed(1)}" rx="${pose.sole ? 3 : 5.2}" ry="${pose.sole ? 6.5 : 6}" fill="${d.shoe}" stroke="#d9a400" stroke-width="1" transform="rotate(${rot} ${ax.toFixed(1)} ${ay.toFixed(1)})"/>`  // tsinelas
      + ln(hx, hy, kx, ky, 12.5, d.shorts);                                                            // thigh (shorts)
  });
  [[40, 42], [60, 42]].forEach(([sx, sy], i) => {
    const [a1, a2] = pose.a[i], [dx1, dy1] = S(a1, 13), ex = sx + dx1, ey = sy + dy1, [dx2, dy2] = S(a2, 12), wx = ex + dx2, wy = ey + dy2, [sl1, sl2] = S(a1, 8.5);
    arms += ln(sx, sy, ex, ey, 6.5, d.skin) + ln(ex, ey, wx, wy, 6, d.skin) + `<circle cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" r="4" fill="${d.skin}"/>` + ln(sx, sy, sx + sl1, sy + sl2, 11, d.shirt);
  });
  const star = d.deco === 'star' ? `<polygon points="50,44 52.2,48.8 57.4,49.3 53.5,52.8 54.6,58 50,55.3 45.4,58 46.5,52.8 42.6,49.3 47.8,48.8" fill="#fff" opacity=".92"/>`
    : d.deco === 'stripe' ? `<rect x="37" y="48" width="26" height="6" fill="#fff" opacity=".85"/>` : '';
  const hairBoy = `<path d="M34.4 20.5 A15.6 15.6 0 0 1 65.6 20.5 C62 12.5 56 11 50 12 C44 11 38 12.5 34.4 20.5Z" fill="${d.hair}"/>`;
  const hairGirl = hairBoy + `<circle cx="32.5" cy="17" r="6.2" fill="${d.hair}"/><circle cx="67.5" cy="17" r="6.2" fill="${d.hair}"/><circle cx="35" cy="12.5" r="2.6" fill="#ff5d8f"/><circle cx="65" cy="12.5" r="2.6" fill="#ff5d8f"/>`;
  const svg = `<svg class="kidsvg" viewBox="${(() => { const v = (pose.vb || '12 0 76 112').split(' ').map(Number); return d.flip ? [100 - v[0] - v[2], v[1], v[2], v[3]].join(' ') : v.join(' '); })()}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g${d.flip ? ' transform="translate(100 0) scale(-1 1)"' : ''}>`
    + legs
    + `<rect x="46" y="31" width="8" height="8" fill="${d.skin}"/>`
    + `<rect x="37" y="35" width="26" height="33" rx="9" fill="${d.shirt}"/>`
    + `<path d="M43.5 35 Q50 43 56.5 35Z" fill="${d.skin}"/>` + star
    + `<rect x="37.5" y="63" width="25" height="13" rx="5" fill="${d.shorts}"/><rect x="37.5" y="63" width="25" height="2.5" fill="rgba(0,0,0,.14)"/>`
    + arms
    + `<circle cx="35" cy="22" r="3.3" fill="${d.skin}"/><circle cx="65" cy="22" r="3.3" fill="${d.skin}"/>`
    + `<circle cx="50" cy="20" r="15" fill="${d.skin}"/>`
    + (d.girl ? hairGirl : hairBoy)
    + `<circle cx="44.3" cy="22" r="1.9" fill="#2b1b17"/><circle cx="55.7" cy="22" r="1.9" fill="#2b1b17"/>`
    + `<circle cx="40.5" cy="27" r="2.7" fill="#ff7a7a" opacity=".45"/><circle cx="59.5" cy="27" r="2.7" fill="#ff7a7a" opacity=".45"/>`
    + `<path d="M45 27 Q50 32.5 55 27" fill="none" stroke="#2b1b17" stroke-width="1.8" stroke-linecap="round"/>`
    + `</g></svg>`;
  return svg;
};
/* a kid bending over with hands on knees – the "baka" in Luksong Baka (faces left, jumper leaps over the back) */
FZ.bender = (o = {}) => {
  const d = Object.assign({ skin: '#c58a55', hair: '#241713', shirt: '#22c1a6', shorts: '#e64980', shoe: '#ffd43b', girl: false }, o);
  const L = (x1, y1, x2, y2, w, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<svg class="kidsvg" viewBox="0 22 112 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
    + `<ellipse cx="68" cy="90" rx="38" ry="2.6" fill="rgba(0,0,0,.13)"/>`
    + L(69, 66, 69, 84, 8, d.skin) + `<ellipse cx="63" cy="87" rx="8" ry="3.4" fill="${d.shoe}" stroke="#d9a400"/>`
    + L(78, 66, 78, 84, 8, d.skin) + `<ellipse cx="72" cy="87" rx="8" ry="3.4" fill="${d.shoe}" stroke="#d9a400"/>`
    + L(80, 48, 80, 68, 20, d.shorts)
    + L(80, 48, 40, 42, 23, d.shirt) + `<circle cx="62" cy="44" r="2.8" fill="#fff" opacity=".9"/>`
    + L(47, 46, 74, 66, 6.5, d.skin) + L(47, 46, 54, 51, 11, d.shirt) + `<circle cx="74" cy="67" r="4" fill="${d.skin}"/>`
    + `<circle cx="30" cy="50" r="13.5" fill="${d.hair}"/>`
    + (d.girl ? `<circle cx="41" cy="39" r="5.6" fill="${d.hair}"/><circle cx="44" cy="37" r="2.6" fill="#ff5d8f"/>` : '')
    + `<circle cx="27" cy="54" r="10.8" fill="${d.skin}"/>`
    + `<circle cx="22.5" cy="55" r="1.9" fill="#2b1b17"/><circle cx="22" cy="59.5" r="2.4" fill="#ff7a7a" opacity=".45"/>`
    + `<path d="M23.5 61.5 Q28 64.5 32 60" fill="none" stroke="#2b1b17" stroke-width="1.7" stroke-linecap="round"/>`
    + `</svg>`;
};
/* ready-made kids: the player (boy or girl) and friends */
FZ.me = (pose = 'stand', extra = {}) => FZ.settings.avatar === 'girl'
  ? FZ.kid(Object.assign({ pose, girl: true, shirt: '#f4609b', shorts: '#3fa7ff', shoe: '#ffd43b', skin: '#d39a66' }, extra))
  : FZ.kid(Object.assign({ pose, shirt: '#ff7b54', shorts: '#2f7fd6', shoe: '#ffd43b', skin: '#d39a66' }, extra));
FZ.pals = [
  { shirt: '#4cc46a', shorts: '#3a4fc4', skin: '#c58a55', shoe: '#ff7ab0' },
  { shirt: '#a97bff', shorts: '#f6a609', skin: '#dba574', girl: true, shoe: '#4dabf7' },
  { shirt: '#fcc419', shorts: '#2f9e44', skin: '#b97a4a', shoe: '#ff6b6b', deco: 'stripe' },
  { shirt: '#22c1a6', shorts: '#e64980', skin: '#d39a66', girl: true, shoe: '#ffd43b' }
];
FZ.pal = (i, pose = 'stand', extra = {}) => FZ.kid(Object.assign({ pose }, FZ.pals[i % FZ.pals.length], extra));
FZ.rival = (pose = 'stand', extra = {}) => FZ.kid(Object.assign({ pose, shirt: '#e5383b', shorts: '#2b2d42', skin: '#c58a55', shoe: '#e9ecef', deco: 'stripe' }, extra));

/* ---------- grid board with smooth-moving pieces (emoji or SVG kids) ---------- */
FZ.board = (R, C, cellFn) => {
  const el = h(`<div class="board" style="--rows:${R};--cols:${C}"></div>`);
  const cells = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const d = document.createElement('div');
    d.className = 'cell ' + (cellFn ? (cellFn(r, c) || '') : '');
    el.appendChild(d); cells.push(d);
  }
  [[0, 'tl'], [C - 1, 'tr'], [(R - 1) * C, 'bl'], [R * C - 1, 'br']].forEach(([i, k]) => cells[i].classList.add(k));   // round the corners (board itself no longer clips)
  const b = { el, R, C, cells, cell: (r, c) => cells[r * C + c] };
  const glyph = (e, g) => { if (typeof g === 'string' && g.startsWith('<svg')) { e.innerHTML = g; e.classList.add('haskid'); } else { e.textContent = g; e.classList.remove('haskid'); } };
  b.ent = (emoji, r, c, cls = '') => {
    const e = document.createElement('div');
    e.className = 'ent ' + cls; glyph(e, emoji);
    e.style.width = (100 / C) + '%'; e.style.height = (100 / R) + '%';
    el.appendChild(e);
    const o = {
      el: e, r, c,
      set(nr, nc) { o.r = nr; o.c = nc; e.style.left = (nc * 100 / C) + '%'; e.style.top = (nr * 100 / R) + '%'; },
      say(t) { glyph(e, t); }
    };
    o.set(r, c);
    return o;
  };
  return b;
};

/* ---------- on-screen arrows (+ keyboard) ---------- */
FZ.dpad = (api, onMove, lrOnly) => {
  const el = h(`<div class="dpad${lrOnly ? ' lr' : ''}">${lrOnly ? '' : '<button class="up" aria-label="up">⬆️</button>'}<button class="left" aria-label="left">⬅️</button>${lrOnly ? '' : '<button class="down" aria-label="down">⬇️</button>'}<button class="right" aria-label="right">➡️</button></div>`);
  const map = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  Object.entries(map).forEach(([k, v]) => {
    const b = $('.' + k, el);
    if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); onMove(v[0], v[1]); });
  });
  api.on(window, 'keydown', e => {
    const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
    if (m && (!lrOnly || m === 'left' || m === 'right')) { e.preventDefault(); onMove(...map[m]); }
  });
  return el;
};

/* greedy one-step mover used by chasers (toward or away from a target) */
function stepToward(from, target, R, C, blocked, away) {
  const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dr, dc]) => ({ r: from.r + dr, c: from.c + dc }))
    .filter(p => p.r >= 0 && p.c >= 0 && p.r < R && p.c < C && !(blocked && blocked(p.r, p.c)));
  if (!opts.length) return null;
  opts.forEach(p => p.d = Math.abs(p.r - target.r) + Math.abs(p.c - target.c) + Math.random() * 0.6);
  opts.sort((a, b) => away ? b.d - a.d : a.d - b.d);
  return opts[0];
}
