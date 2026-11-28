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
FZ.settings = Object.assign({ sound: true, music: true, limit: 0, lang: null, avatar: 'boy' }, store.get('settings', {}));
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
   SOUND – short game sounds and background music, all made inside the app (no sound files).
   Games never talk: instructions are words on screen; only the stories are read aloud.
   ===================================================== */
let AC = null, fxBus = null, musicBus = null, musicSrc = null, musicBuf = null, musicMaking = null;
const audio = () => {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    AC = new C(); fxBus = AC.createGain(); fxBus.gain.value = 0.55; fxBus.connect(AC.destination);
    musicBus = AC.createGain(); musicBus.gain.value = 0; musicBus.connect(AC.destination);
  }
  if (AC.state !== 'running') AC.resume().catch(() => { });
  return AC;
};
/* one note: f = pitch (Hz), t = start (s from now), d = length, type, vol, slide = end pitch */
function note(f, t, d, type = 'triangle', vol = 0.3, slide = 0) {
  const ac = audio(); if (!ac) return; const t0 = ac.currentTime + t;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(g); g.connect(fxBus); o.start(t0); o.stop(t0 + d + 0.05);
}
function sparkle(t, n = 10) { for (let i = 0; i < n; i++) note(1500 + Math.random() * 1800, t + i * 0.045, 0.12, 'sine', 0.06); }
const N = m => 440 * Math.pow(2, (m - 69) / 12);          // MIDI note → Hz
const SFX = {
  pop: () => note(620, 0, 0.09, 'sine', 0.22, 940),
  step: () => note(1250, 0, 0.05, 'triangle', 0.12),
  good: () => { note(N(84), 0, 0.12, 'triangle', 0.22); note(N(88), 0.09, 0.18, 'triangle', 0.22); },
  coin: () => { note(N(88), 0, 0.08, 'square', 0.1); note(N(95), 0.07, 0.3, 'square', 0.1); },
  star: () => { [79, 84, 88, 91].forEach((m, i) => note(N(m), i * 0.07, 0.25, 'triangle', 0.2)); sparkle(0.3, 6); },
  oops: () => note(330, 0, 0.26, 'triangle', 0.28, 165),
  win: () => {                                            // ta-da! fanfare with sparkles
    [[72, 0], [76, 0.13], [79, 0.26], [84, 0.42]].forEach(([m, t]) => { note(N(m), t, 0.22, 'square', 0.09); note(N(m), t, 0.3, 'triangle', 0.2); });
    [72, 76, 79, 84].forEach(m => note(N(m), 0.62, 0.9, 'triangle', 0.13));
    note(N(48), 0.62, 0.9, 'triangle', 0.25); sparkle(0.6, 14);
  },
  fail: () => {                                           // gentle "wah-wah-wah-waaah"
    [[67, 0], [66, 0.3], [65, 0.6]].forEach(([m, t]) => note(N(m), t, 0.26, 'sawtooth', 0.07));
    const ac = audio(); if (!ac) return; const t0 = ac.currentTime + 0.9;
    const o = ac.createOscillator(), g = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = N(64); v.frequency.value = 6; vg.gain.value = 7; v.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.03); g.gain.setValueAtTime(0.07, t0 + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    o.connect(lp); lp.connect(g); g.connect(fxBus); o.start(t0); v.start(t0); o.stop(t0 + 1.2); v.stop(t0 + 1.2);
  },
};
FZ.tone = () => { };
FZ.sfx = name => { if (!FZ.settings.sound) return; try { (SFX[name] || SFX.pop)(); } catch (e) { } };

/* BACKGROUND MUSIC: an original, cheerful tune made once and played as a seamless loop.
   It keeps playing across every screen until a grown-up turns it off; it gets quieter while a story is read aloud
   and pauses while someone records their voice. */
const BPM = 108, BEAT = 60 / BPM, BARS = 16, LOOP = BARS * 4 * BEAT;
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];                 // C – Am – F – G
const MEL = [                                                                            // [beat, note, length] per 2 bars
  [[0, 76, 1], [1, 79, 0.5], [1.5, 76, 0.5], [2, 74, 1], [3, 72, 1], [4, 72, 0.5], [4.5, 74, 0.5], [5, 76, 1], [6, 74, 2]],
  [[0, 72, 1], [1, 76, 0.5], [1.5, 77, 0.5], [2, 79, 1], [3, 81, 1], [4, 79, 0.5], [4.5, 77, 0.5], [5, 76, 1], [6, 74, 2]],
  [[0, 76, 0.5], [0.5, 76, 0.5], [1, 79, 1], [2, 81, 0.5], [2.5, 79, 0.5], [3, 76, 1], [4, 77, 1], [5, 76, 0.5], [5.5, 74, 0.5], [6, 72, 2]],
  [[0, 74, 1], [1, 76, 1], [2, 79, 1.5], [3.5, 76, 0.5], [4, 74, 1], [5, 71, 1], [6, 72, 2]],
];
function makeMusic() {
  if (musicMaking) return musicMaking;
  const SR = 22050, len = Math.ceil((LOOP + 2) * SR);
  const O = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!O) return Promise.resolve(null);
  const oc = new O(1, len, SR), out = oc.createGain(); out.gain.value = 0.9; out.connect(oc.destination);
  const pl = (f, t, d, type, vol, partial) => {                                         // marimba-like pluck
    [[1, vol], partial ? [partial, vol * 0.25] : null].filter(Boolean).forEach(([m, v]) => {
      const o = oc.createOscillator(), g = oc.createGain(); o.type = type; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.02);
    });
  };
  const noise = oc.createBuffer(1, SR * 0.1, SR); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const shaker = (t, v) => { const s = oc.createBufferSource(), f = oc.createBiquadFilter(), g = oc.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 6000; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); s.connect(f); f.connect(g); g.connect(out); s.start(t); };
  for (let bar = 0; bar < BARS; bar++) {
    const t = bar * 4 * BEAT, ch = CHORDS[bar % 4], second = bar >= 8;
    pl(N(ch[0] - 12), t, BEAT * 1.6, 'triangle', 0.32); pl(N(ch[0] - 5), t + 2 * BEAT, BEAT * 1.4, 'triangle', 0.24);      // bass
    for (let b = 0; b < 4; b++) ch.forEach((m, i) => pl(N(m + 12), t + (b + 0.5) * BEAT, BEAT * 0.45, 'sine', 0.045));     // off-beat chords
    for (let e = 0; e < 8; e++) shaker(t + e * BEAT / 2, e % 2 ? 0.05 : 0.025);
    if (bar % 2 === 0) {
      const phrase = MEL[(bar / 2) % 4];
      phrase.forEach(([b, m, d]) => pl(N(m + (second && bar % 8 >= 4 ? 0 : 0)), t + b * BEAT, d * BEAT * 0.95 + 0.25, 'sine', second ? 0.15 : 0.13, 4));
      if (second) phrase.forEach(([b, m, d]) => pl(N(m - 12), t + b * BEAT, d * BEAT * 0.9 + 0.2, 'triangle', 0.035));  // second time: a soft echo below
    }
  }
  musicMaking = oc.startRendering().then(buf => {                                      // fold the ringing tail back to the start → no gap at the loop
    const n = Math.round(LOOP * SR), d = buf.getChannelData(0), loop = AC.createBuffer(1, n, SR), L = loop.getChannelData(0);
    for (let i = 0; i < n; i++) L[i] = d[i] + (i + n < d.length ? d[i + n] : 0);
    return (musicBuf = loop);
  }).catch(() => null);
  return musicMaking;
}
let musicLevel = 0.2, musicHold = new Set();
function musicTarget() { return FZ.settings.music && !musicHold.size ? (FZ.screen === 'reader' ? musicLevel * 0.35 : musicLevel) : 0; }
FZ.music = {
  update() {
    const ac = audio(); if (!ac) return;
    const want = musicTarget();
    if (want > 0 && !musicSrc) {
      makeMusic().then(buf => {
        if (!buf || musicSrc || !musicTarget()) return;
        musicSrc = AC.createBufferSource(); musicSrc.buffer = buf; musicSrc.loop = true; musicSrc.connect(musicBus); musicSrc.start();
        FZ.music.update();
      });
    }
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setTargetAtTime(want, ac.currentTime, 0.4);
    if (!want && musicSrc && !FZ.settings.music) { const s = musicSrc; musicSrc = null; setTimeout(() => { try { s.stop(); } catch (e) { } }, 1500); }
  },
  playing: () => !!musicSrc && musicTarget() > 0,
  buffer: () => musicBuf,
  hold(why) { musicHold.add(why); FZ.music.update(); },            // e.g. while recording a voice
  release(why) { musicHold.delete(why); FZ.music.update(); },
  toggle(on) { FZ.settings.music = on === undefined ? !FZ.settings.music : on; FZ.saveSettings(); FZ.music.update(); },
};
/* browsers only allow sound after the first tap, so start (or wake) the music on every tap */
['pointerdown', 'keydown', 'touchend'].forEach(ev => window.addEventListener(ev, () => { if (FZ.settings.music || FZ.settings.sound) FZ.music.update(); }, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && AC) { AC.resume().catch(() => { }); FZ.music.update(); } });

/* =====================================================
   VOICE – picks the most natural voice the device has, in the chosen language
   ===================================================== */
FZ.voices = [];
if ('speechSynthesis' in window) {
  const load = () => { try { FZ.voices = speechSynthesis.getVoices() || []; } catch (e) { } };
  load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) { }
}
const voiceScore = v => (/blessica|angelo/i.test(v.name) ? 20 : 0)          // Microsoft's natural Filipino voices (Edge, online)
  + (/natural|neural|online/i.test(v.name) ? 10 : 0) + (/google/i.test(v.name) ? 6 : 0)
  + (/samantha|karen|moira|ava|allison|aria|jenny|zira|libby|sonia|blessica|angelo|rosa|female/i.test(v.name) ? 4 : 0) + (v.localService ? 0 : 1);
/* the devices' voices: is it a man's or a woman's voice? (used to give story characters their own voices) */
const MALE_V = /\b(male|man|guy|david|daniel|alex|fred|james|tom|ryan|eric|christopher|davis|tony|jason|roger|brian|andrew|george|mark|richard|aaron|arthur|oliver|thomas|angelo|rishi|lee|gordon|reed|rocko|grandpa|eddy|ralph|junior|albert|bruce|jorge|diego|juan|carlos|pablo)\b/i;
const FEMALE_V = /\b(female|woman|jenny|aria|samantha|karen|moira|tessa|zira|susan|hazel|libby|sonia|natasha|michelle|emma|ava|allison|victoria|fiona|serena|kate|blessica|catherine|nicky|shelley|flo|sandy|grandma|martha|paulina|monica|lucia|rosa|google us english)\b/i;
FZ.voiceOf = (lang, want) => {                                     // want: 'm' or 'f'; falls back to the normal voice
  const base = FZ.voiceFor(lang); if (!want || !base) return base;
  const pre = base.lang.toLowerCase().slice(0, 2), same = FZ.voices.filter(v => v.lang.toLowerCase().startsWith(pre));
  const rx = want === 'm' ? MALE_V : FEMALE_V, other = want === 'm' ? FEMALE_V : MALE_V;
  if (rx.test(base.name) && !other.test(base.name)) return base;
  const c = same.filter(v => rx.test(v.name) && !other.test(v.name)).sort((a, b) => voiceScore(b) - voiceScore(a));
  return c[0] || base;
};
FZ.voiceIsMale = v => !!v && MALE_V.test(v.name) && !FEMALE_V.test(v.name);
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
/* what is actually read out loud (no emoji, no (notes), no HTML) */
FZ.speakable = t => String(t).replace(/<[^>]+>/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\s*\([^)]*\)/g, '').replace(/[_*·]/g, ' ').replace(/\s+/g, ' ').trim();
/* a short name for a line (used to key a grown-up's own recordings) */
FZ.voiceKey = t => { let h = 0x811c9dc5; const s = FZ.speakable(t); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return 'v' + (h >>> 0).toString(16).padStart(8, '0'); };
const TL_SAY = [[/\bng\b/g, 'nang'], [/\bNg\b/g, 'Nang'], [/\bmga\b/g, 'manga'], [/\bMga\b/g, 'Manga']];
FZ.tlFix = t => TL_SAY.reduce((s, [a, b]) => s.replace(a, b), t);
/* games never speak: FZ.say does nothing (instructions are on screen). Only stories are read aloud (reader.js). */
FZ.say = () => { };
/* used by the "test" button of the story voice */
FZ.readAloud = t => {
  const clean = FZ.speakable(t); if (!clean || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const v = FZ.voiceFor(FZ.lang), u = new SpeechSynthesisUtterance(FZ.lang === 'tl' ? FZ.tlFix(clean) : clean);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = FZ.lang === 'tl' ? 'fil-PH' : 'en-US';
    u.rate = FZ.lang === 'tl' ? 0.9 : 0.95; u.pitch = 1.05; speechSynthesis.speak(u);
  } catch (e) { }
};

/* =====================================================
   KIDS – whole-body Filipino children: t-shirt, shorts and tsinelas
   pose: stand | wide | run | jump | kick | knee | elbow | climb | sit
   ===================================================== */
/* HAIR STYLES (front view; the head is a circle at 50,20 with radius 15)
   back = drawn behind the body (long hair, ponytail), front = drawn over the head */
FZ.HAIR_STYLES = ['short', 'spiky', 'curly', 'buzz', 'bob', 'long', 'ponytail', 'pigtails', 'bun'];
FZ.hairParts = d => {
  const c = d.hair, tie = '#ff5d8f', style = d.hairStyle || (d.girl ? 'pigtails' : 'short');
  const fringe = `<path d="M34.4 20.5 A15.6 15.6 0 0 1 65.6 20.5 C62 12.5 56 11 50 12 C44 11 38 12.5 34.4 20.5Z" fill="${c}"/>`;
  const H = {
    short:    { front: fringe },
    spiky:    { front: fringe + `<path d="M35.5 16 L37 6.5 L42.5 12 L45.5 2.5 L50 10 L54.5 2.5 L57.5 12 L63 6.5 L64.5 16Z" fill="${c}"/>` },
    curly:    { front: [[36, 16, 5.5], [40, 10, 6], [46, 6.5, 6], [54, 6.5, 6], [60, 10, 6], [64, 16, 5.5], [50, 8, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('') },
    buzz:     { front: `<path d="M35.4 17.5 A14.8 14.8 0 0 1 64.6 17.5 C60 13 55 12.4 50 12.4 C45 12.4 40 13 35.4 17.5Z" fill="${c}" opacity=".8"/>` },
    bob:      { back: `<path d="M32 20 A18 18 0 0 1 68 20 L68.5 33 Q50 38 31.5 33Z" fill="${c}"/>`,
                front: `<path d="M34.6 21 A15.5 15.5 0 0 1 65.4 21 L65 15 C58 8.5 42 8.5 35 15Z" fill="${c}"/>` },
    long:     { back: `<path d="M31.5 20 A18.5 18.5 0 0 1 68.5 20 L70 50 Q60 54 50 50 Q40 54 30 50Z" fill="${c}"/>`, front: fringe },
    ponytail: { back: `<path d="M60 11 C77 12 80 30 73 46 C71 35 67 26 59 21Z" fill="${c}"/>`, front: fringe + `<circle cx="63" cy="12.5" r="2.6" fill="${tie}"/>` },
    pigtails: { front: fringe + `<circle cx="32.5" cy="17" r="6.2" fill="${c}"/><circle cx="67.5" cy="17" r="6.2" fill="${c}"/><circle cx="35" cy="12.5" r="2.6" fill="${tie}"/><circle cx="65" cy="12.5" r="2.6" fill="${tie}"/>` },
    bun:      { front: fringe + `<circle cx="50" cy="4.5" r="6.5" fill="${c}"/><circle cx="50" cy="10" r="2.4" fill="${tie}"/>` }
  };
  const h = H[style] || H.short;
  return { back: h.back || '', front: h.front };
};
/* little details that make each top recognisable */
FZ.TOPS = ['tee', 'tank', 'polo', 'long', 'hoodie', 'dress', 'barong', 'filipiniana'];
FZ.BOTTOMS = ['shorts', 'pants', 'skirt', 'overalls'];
FZ.topDetail = (top, d) => ({
  polo:   `<path d="M43 35 L50 40.5 L45.5 44Z M57 35 L50 40.5 L54.5 44Z" fill="#fff" stroke="rgba(0,0,0,.15)" stroke-width=".6"/><circle cx="50" cy="45.5" r="1.1" fill="#fff"/><circle cx="50" cy="50" r="1.1" fill="#fff"/>`,
  barong: `<path d="M43.5 35 L50 40 L56.5 35" fill="none" stroke="#d8c9a3" stroke-width="1.4"/><path d="M50 41 v24" stroke="#d8c9a3" stroke-width="1"/>`
          + `<path d="M44 42 q2 3 0 6 q-2 3 0 6 q2 3 0 6 M56 42 q-2 3 0 6 q2 3 0 6 q-2 3 0 6" fill="none" stroke="#c9b37e" stroke-width="1"/>`,
  long:   `<path d="M37.5 60 h25" stroke="rgba(255,255,255,.5)" stroke-width="2"/>`,
  hoodie: `<rect x="42" y="55" width="16" height="8" rx="3" fill="rgba(0,0,0,.13)"/>`,
  dress:  `<path d="M37.5 56 h25" stroke="rgba(255,255,255,.55)" stroke-width="2.4"/>`,
  filipiniana: `<path d="M37 37 C30 30 33 24 41 30 Z M63 37 C70 30 67 24 59 30 Z" fill="${d.shirt}" stroke="rgba(255,255,255,.75)" stroke-width="1.2"/><path d="M43.5 35 L50 41 L56.5 35" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>`
}[top] || '');
/* FOOTWEAR: tsinelas (flip-flops), sneakers, sandals, boots, school shoes, or barefoot */
FZ.FOOTWEAR = ['tsinelas', 'sneakers', 'sandals', 'boots', 'school', 'barefoot'];
FZ.footwear = (foot, cx, cy, rx, ry, rot, ax, ay, d) => {
  const X = cx.toFixed(1), Y = cy.toFixed(1), g = inner => `<g transform="rotate(${rot} ${ax.toFixed(1)} ${ay.toFixed(1)})">${inner}</g>`, c = d.shoe;
  switch (foot) {
    case 'barefoot': return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx * .8}" ry="${ry * .85}" fill="${d.skin}" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>`);
    case 'sneakers': return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx * 1.08}" ry="${ry * 1.08}" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M${cx - rx * .5} ${cy - ry * .3} h${rx} M${cx - rx * .5} ${cy + ry * .05} h${rx}" stroke="#fff" stroke-width="1.1"/>`);
    case 'sandals': return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" fill="#a0703f"/><ellipse cx="${X}" cy="${Y}" rx="${rx * .7}" ry="${ry * .78}" fill="${d.skin}"/><path d="M${cx - rx} ${cy - ry * .35} h${rx * 2} M${cx - rx} ${cy + ry * .25} h${rx * 2}" stroke="${c}" stroke-width="2"/>`);
    case 'boots': return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx * 1.1}" ry="${ry * 1.05}" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`);
    case 'school': return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx * 1.05}" ry="${ry}" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="1"/><ellipse cx="${(cx - rx * .3).toFixed(1)}" cy="${(cy - ry * .35).toFixed(1)}" rx="${rx * .3}" ry="${ry * .2}" fill="rgba(255,255,255,.55)"/>`);
    default: return g(`<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1"/><path d="M${cx - rx * .65} ${cy - ry * .1} L${X} ${cy - ry * .55} L${cx + rx * .65} ${cy - ry * .1}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.4"/>`);   // tsinelas with its V strap
  }
};
/* a kid drawing cropped to one part, for the Dress-up buttons */
FZ.kidPart = (o, vb) => FZ.kid(Object.assign({ pose: 'stand' }, o)).replace('class="kidsvg"', 'class="partsvg"').replace(/viewBox="[^"]*"/, `viewBox="${vb}"`);
/* just the head, for the hair-style buttons in Dress-up */
FZ.kidHead = (o = {}) => {
  const d = Object.assign({ skin: '#d39a66', hair: '#241713' }, o), hr = FZ.hairParts(d);
  return `<svg viewBox="24 -4 52 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${hr.back}`
    + `<circle cx="35" cy="22" r="3.3" fill="${d.skin}"/><circle cx="65" cy="22" r="3.3" fill="${d.skin}"/><circle cx="50" cy="20" r="15" fill="${d.skin}"/>${hr.front}`
    + `<circle cx="44.3" cy="22" r="1.9" fill="#2b1b17"/><circle cx="55.7" cy="22" r="1.9" fill="#2b1b17"/>`
    + `<path d="M45 27 Q50 32.5 55 27" fill="none" stroke="#2b1b17" stroke-width="1.8" stroke-linecap="round"/></svg>`;
};
FZ.kid = (o = {}) => {
  const d = Object.assign({ pose: 'stand', skin: '#d39a66', hair: '#241713', shirt: '#ff7b54', shorts: '#2f7fd6', shoe: '#ffd43b', girl: false, deco: 'star', flip: false, top: 'tee', bottom: 'shorts' }, o);
  /* clothes: top = tee | tank | polo | long | hoodie | dress | barong ; bottom = shorts | pants | skirt | overalls */
  const top = d.top, bottom = top === 'dress' || top === 'filipiniana' ? 'none' : d.bottom, foot = d.foot || 'tsinelas';
  if (top === 'barong') d.shirt = '#f3ead3';                                 // barong tagalog is always the light piña colour
  const longSleeve = ['long', 'hoodie', 'barong'].includes(top), legBare = bottom === 'skirt' || bottom === 'none';
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
      + (bottom === 'pants' ? ln(kx, ky, kx + dx2 * 0.82, ky + dy2 * 0.82, 9, d.shorts) : '')             // trouser leg
      + (foot === 'boots' ? ln(kx + dx2 * 0.45, ky + dy2 * 0.45, ax, ay, 9.6, d.shoe) : '')               // boot shaft
      + FZ.footwear(foot, ax + dx2 * 0.2, ay + dy2 * 0.2 + (pose.sole ? 0 : 2), pose.sole ? 3 : 5.2, pose.sole ? 6.5 : 6, rot, ax, ay, d)
      + ln(hx, hy, kx, ky, legBare ? 8.5 : 12.5, legBare ? d.skin : d.shorts);                         // thigh (shorts / pants, or bare under a skirt)
  });
  [[40, 42], [60, 42]].forEach(([sx, sy], i) => {
    const [a1, a2] = pose.a[i], [dx1, dy1] = S(a1, 13), ex = sx + dx1, ey = sy + dy1, [dx2, dy2] = S(a2, 12), wx = ex + dx2, wy = ey + dy2, [sl1, sl2] = S(a1, 8.5);
    arms += ln(sx, sy, ex, ey, 6.5, d.skin) + ln(ex, ey, wx, wy, 6, d.skin)
      + (longSleeve ? ln(sx, sy, ex, ey, 8, d.shirt) + ln(ex, ey, ex + dx2 * 0.8, ey + dy2 * 0.8, 7.5, d.shirt) : top === 'tank' ? '' : ln(sx, sy, sx + sl1, sy + sl2, 11, d.shirt))
      + `<circle cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" r="4" fill="${d.skin}"/>`;
  });
  const star = ['polo', 'barong'].includes(top) ? '' : d.deco === 'star' ? `<polygon points="50,44 52.2,48.8 57.4,49.3 53.5,52.8 54.6,58 50,55.3 45.4,58 46.5,52.8 42.6,49.3 47.8,48.8" fill="#fff" opacity=".92"/>`
    : d.deco === 'stripe' ? `<rect x="37" y="48" width="26" height="6" fill="#fff" opacity=".85"/>` : '';
  const hr = FZ.hairParts(d);
  const svg = `<svg class="kidsvg" viewBox="${(() => { const v = (pose.vb || '12 0 76 112').split(' ').map(Number); return d.flip ? [100 - v[0] - v[2], v[1], v[2], v[3]].join(' ') : v.join(' '); })()}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g${d.flip ? ' transform="translate(100 0) scale(-1 1)"' : ''}>`
    + hr.back + legs
    + `<rect x="46" y="31" width="8" height="8" fill="${d.skin}"/>`
    + `<rect x="37" y="35" width="26" height="33" rx="9" fill="${d.shirt}"/>`
    + (top === 'tank' ? `<path d="M40.5 35 Q50 49 59.5 35Z" fill="${d.skin}"/><rect x="37" y="35" width="4" height="9" fill="${d.skin}"/><rect x="59" y="35" width="4" height="9" fill="${d.skin}"/>` : `<path d="M43.5 35 Q50 43 56.5 35Z" fill="${d.skin}"/>`)
    + star + FZ.topDetail(top, d)
    + (bottom === 'shorts' || bottom === 'pants' || bottom === 'overalls' ? `<rect x="37.5" y="63" width="25" height="13" rx="5" fill="${d.shorts}"/><rect x="37.5" y="63" width="25" height="2.5" fill="rgba(0,0,0,.14)"/>` : '')
    + (bottom === 'skirt' ? `<path d="M37.5 62 L62.5 62 L67 79 Q50 83 33 79Z" fill="${d.shorts}"/><rect x="37.5" y="62" width="25" height="2.5" fill="rgba(0,0,0,.14)"/>` : '')
    + (bottom === 'overalls' ? `<rect x="41" y="47" width="18" height="17" rx="3" fill="${d.shorts}"/><path d="M42.5 48 L41 36 M57.5 48 L59 36" stroke="${d.shorts}" stroke-width="3.2" stroke-linecap="round"/><circle cx="43.5" cy="49.5" r="1.3" fill="#ffd43b"/><circle cx="56.5" cy="49.5" r="1.3" fill="#ffd43b"/><rect x="46" y="52" width="8" height="5" rx="1.5" fill="rgba(0,0,0,.12)"/>` : '')
    + (top === 'dress' ? `<path d="M38 58 L62 58 L69 81 Q50 86 31 81Z" fill="${d.shirt}"/><path d="M38 58 L62 58" stroke="rgba(0,0,0,.12)" stroke-width="2"/>` : '')
    + (top === 'filipiniana' ? `<path d="M38 57 L62 57 L71 88 Q50 93 29 88Z" fill="${d.shirt}"/><path d="M38 57 L62 57" stroke="rgba(0,0,0,.15)" stroke-width="2.4"/><path d="M33 80 Q50 85 67 80" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>` : '')
    + (top === 'hoodie' ? `<path d="M37 36 Q50 26 63 36" fill="none" stroke="${d.shirt}" stroke-width="7" stroke-linecap="round"/><path d="M47 39 v7 M53 39 v7" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>` : '')
    + arms
    + (top === 'hoodie' ? `<circle cx="50" cy="22" r="18.5" fill="${d.shirt}"/><circle cx="50" cy="22" r="18.5" fill="rgba(0,0,0,.1)"/>` : '')
    + `<circle cx="35" cy="22" r="3.3" fill="${d.skin}"/><circle cx="65" cy="22" r="3.3" fill="${d.skin}"/>`
    + `<circle cx="50" cy="20" r="15" fill="${d.skin}"/>`
    + hr.front
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
/* dress-up: the player's look is saved in settings.look (old boy/girl choice is carried over) */
FZ.LOOK_OPTS = {
  skin:   ['#f6d2a8', '#e0ac69', '#c58a55', '#a86f42', '#7a4b2a'],
  hair:   ['#241713', '#4a2c1d', '#8a5a2c', '#1a1a1a', '#c0392b', '#d9a441'],
  shirt:  ['#ff7b54', '#4cc46a', '#339af0', '#f4609b', '#a97bff', '#fcc419', '#22c1a6', '#e5383b', '#ffffff'],
  shorts: ['#2f7fd6', '#3a4fc4', '#f6a609', '#e64980', '#2f9e44', '#343a40', '#a97bff', '#8b5e34'],
  shoe:   ['#ffd43b', '#ff7ab0', '#4dabf7', '#ff6b6b', '#ffffff', '#343a40', '#8b5e34', '#40c057']
};
/* the clothes each player can choose from: boys and girls have their own sets */
FZ.WARDROBE = {
  boy:  { hairStyle: ['short', 'spiky', 'curly', 'buzz', 'long'], top: ['tee', 'tank', 'polo', 'long', 'hoodie', 'barong'], bottom: ['shorts', 'pants', 'overalls'], foot: FZ.FOOTWEAR },
  girl: { hairStyle: ['pigtails', 'ponytail', 'long', 'bob', 'bun', 'curly', 'short'], top: ['tee', 'tank', 'polo', 'long', 'hoodie', 'dress', 'filipiniana'], bottom: ['skirt', 'shorts', 'pants', 'overalls'], foot: FZ.FOOTWEAR }
};
const LOOK_DEF = {
  boy:  { skin: '#d39a66', hair: '#241713', hairStyle: 'short', top: 'tee', shirt: '#ff7b54', bottom: 'shorts', shorts: '#2f7fd6', foot: 'tsinelas', shoe: '#ffd43b' },
  girl: { skin: '#d39a66', hair: '#241713', hairStyle: 'pigtails', top: 'tee', shirt: '#f4609b', bottom: 'skirt', shorts: '#a97bff', foot: 'tsinelas', shoe: '#ff7ab0' }
};
/* each player (boy and girl) keeps their own outfit; older saves had one "look" */
FZ.looks = () => {
  const S = FZ.settings;
  if (!S.looks) { const old = S.look || {}, g = old.girl || S.avatar === 'girl' ? 'girl' : 'boy'; S.looks = { boy: {}, girl: {} }; S.looks[g] = Object.assign({}, old); S.gender = g; delete S.look; }
  return S.looks;
};
FZ.gender = () => (FZ.looks(), FZ.settings.gender === 'girl' ? 'girl' : 'boy');
FZ.look = (g = FZ.gender()) => {
  const L = Object.assign({}, LOOK_DEF[g], FZ.looks()[g] || {}, { girl: g === 'girl' }), W = FZ.WARDROBE[g];
  ['hairStyle', 'top', 'bottom', 'foot'].forEach(k => { if (!W[k].includes(L[k])) L[k] = LOOK_DEF[g][k]; });   // only clothes from this player's set
  return L;
};
FZ.setLook = patch => { const g = FZ.gender(), all = FZ.looks(); all[g] = Object.assign({}, all[g], patch); FZ.saveSettings(); };
FZ.me = (pose = 'stand', extra = {}) => { const L = FZ.look(); return FZ.kid(Object.assign({ pose, girl: L.girl, skin: L.skin, hair: L.hair, hairStyle: L.hairStyle, shirt: L.shirt, shorts: L.shorts, shoe: L.shoe, top: L.top, bottom: L.bottom, foot: L.foot }, extra)); };
/* Tala, the FunZone guide: a Filipino girl who shows kids around the games */
FZ.guide = (pose = 'arms') => FZ.kid({ pose, girl: true, skin: '#c58a55', hair: '#241713', hairStyle: 'ponytail', top: 'tee', shirt: '#fcc419', bottom: 'overalls', shorts: '#339af0', foot: 'sneakers', shoe: '#ff6b6b' });
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
