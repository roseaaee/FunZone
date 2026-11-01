'use strict';
/* =====================================================
   FunZone core: helpers, storage, sound, board engine
   ===================================================== */
const FZ = {
  games: [],
  cats: [
    { id: 'all',   label: 'All',    emoji: '🌈' },
    { id: 'tag',   label: 'Habulan', emoji: '🏃' },
    { id: 'jump',  label: 'Talon',  emoji: '🦘' },
    { id: 'skill', label: 'Husay',  emoji: '🎯' },
    { id: 'board', label: 'Board',  emoji: '🎲' }
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
FZ.settings = Object.assign({ sound: true, voice: true, limit: 0 }, store.get('settings', {}));
if (FZ.settings.pin) { FZ.settings.pinHash = FZ.hash(FZ.settings.pin); delete FZ.settings.pin; }   // migrate old plain-text PIN
if (!FZ.settings.pinHash) FZ.settings.pinHash = FZ.hash('1234');
store.set('settings', FZ.settings);
FZ.progress = store.get('progress', {});
FZ.saveSettings = () => store.set('settings', FZ.settings);
FZ.saveProgress = () => store.set('progress', FZ.progress);
FZ.reg = def => FZ.games.push(def);

/* ---------- sound ---------- */
let _ac;
function tone(f, d = 0.12, type = 'sine', v = 0.12, when = 0) {
  if (!FZ.settings.sound) return;
  try {
    _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.type = type; o.frequency.value = f; o.connect(g); g.connect(_ac.destination);
    const t = _ac.currentTime + when;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t); o.stop(t + d);
  } catch (e) { }
}
FZ.tone = tone;
FZ.sfx = n => {
  const m = {
    pop: () => tone(660, .08),
    step: () => tone(380 + rnd(0, 90), .06, 'triangle'),
    good: () => { tone(523, .1); tone(784, .16, 'sine', .12, .1); },
    oops: () => tone(210, .22, 'triangle', .15),
    jump: () => { tone(300, .14); tone(620, .12, 'sine', .1, .1); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'sine', .12, i * .12))
  };
  (m[n] || (() => { }))();
};
/* read-aloud (browser voice). force = true even if setting is off */
FZ.say = (t, force) => {
  if ((!FZ.settings.voice && !force) || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(t).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, ''));
    u.rate = .85; u.pitch = 1.25; u.lang = 'en-US';
    const v = speechSynthesis.getVoices().find(v => /en[-_]/i.test(v.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
};

/* ---------- grid board with smooth-moving emoji pieces ---------- */
FZ.board = (R, C, cellFn) => {
  const el = h(`<div class="board" style="--rows:${R};--cols:${C}"></div>`);
  const cells = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const d = document.createElement('div');
    d.className = 'cell ' + (cellFn ? (cellFn(r, c) || '') : '');
    el.appendChild(d); cells.push(d);
  }
  const b = { el, R, C, cells, cell: (r, c) => cells[r * C + c] };
  b.ent = (emoji, r, c, cls = '') => {
    const e = document.createElement('div');
    e.className = 'ent ' + cls; e.textContent = emoji;
    e.style.width = (100 / C) + '%'; e.style.height = (100 / R) + '%';
    el.appendChild(e);
    const o = {
      el: e, r, c,
      set(nr, nc) { o.r = nr; o.c = nc; e.style.left = (nc * 100 / C) + '%'; e.style.top = (nr * 100 / R) + '%'; },
      say(t) { e.textContent = t; }
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