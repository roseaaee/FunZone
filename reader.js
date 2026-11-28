'use strict';
/* =====================================================
   FunZone STORY ZONE – story list + book reader
   - flip pages with the big arrows, a swipe, or the ← → keys
   - 🔊 Read to me: the device voice reads each page and lights up each word
   - EN / TL switch inside the book
   - remembers the page you stopped on (on this device only)
   ===================================================== */
/* the storybook collection (books.js) */
FZ.stories = (FZ.books || []).slice();
const langsOf = st => st.pages[0].tl ? ['en', 'tl'] : ['en'];   // the storybooks are in English only (for now)
FZ.storyProg = store.get('stories', {});            // { storyId: { done, reads } } – only shown to grown-ups in Parent Mode
const saveStories = () => store.set('stories', FZ.storyProg);
FZ.storiesDone = () => FZ.stories.filter(s => (FZ.storyProg[s.id] || {}).done).length;
const SL = o => o[rd.lang] || o.en;                  // story text in the book's language

let rd = { st: null, page: 0, lang: FZ.lang, voice: false, utter: null, audio: null, token: 0 };

/* ---------------- STORY LIST: just the book collection ---------------- */
function renderStories() {
  const grid = $('#storyGrid'); if (!grid) return;
  grid.innerHTML = '';
  FZ.stories.forEach(st => {
    const t = (st.title[FZ.lang] || st.title.en).replace(/\s*\([^)]*\)\s*$/, '');
    const card = h(`<button class="bookcard" aria-label="${t}"><span class="bcover"><img src="${st.cover}" alt="" loading="lazy" decoding="async"></span><span class="bname">${t}</span></button>`);
    card.onclick = () => { FZ.sfx('pop'); openStory(st); };
    grid.append(card);
  });
}
function goStories() { destroyGame(); stopReading(); exitFull(); renderStories(); show('stories'); FZ.say(FZ.t('st_pick')); }
$('#storiesBack').onclick = goHome;

/* ---------------- READER: a full-screen book with real page turns ----------------
   Each page is a "sheet" that turns around the spine (left edge) in 3D.
   Drag a page with a finger to turn it slowly, flick it, tap the right/left side, or use ◀ ▶ and the arrow keys. */
let flipping = false;
/* pages of the open book: 0 = front cover, 1..n = the story, n + 1 = The End */
const lastPage = () => rd.st.pages.length + 1;
function openStory(st, page = 0) {
  rd.st = st; rd.page = page; rd.lang = langsOf(st).includes(FZ.lang) ? FZ.lang : 'en';
  show('reader'); enterFull();
  renderBar(); const book = $('#rdBook'); book.innerHTML = '';
  const sh = makeSheet(rd.page); book.append(sh); settle(sh);
  if (!FZ.settings.wordTip) { FZ.settings.wordTip = 1; FZ.saveSettings(); setTimeout(() => tip(FZ.t('st_wordtip')), 900); }   // shown once
}
/* a little message over the book */
function tip(text) {
  const t = h(`<div class="rdtip" role="status">${text}</div>`); $('#reader').append(t);
  setTimeout(() => t.classList.add('out'), 3600); setTimeout(() => t.remove(), 4200);
}
function renderBar() {
  const st = rd.st;
  $('#rdTitle').textContent = (st.title[rd.lang] || st.title.en).replace(/\s*\([^)]*\)\s*$/, '');   // "Alamat ng Pinya (The Legend…)" → "Alamat ng Pinya"
  $$('#reader .rdlang button').forEach(b => b.classList.toggle('active', b.dataset.rl === rd.lang));
  $('#reader .rdlang').style.display = langsOf(st).length > 1 ? '' : 'none';      // English-only books: no switch
  $('#rdVoice').classList.toggle('on', rd.voice); $('#rdVoice').setAttribute('aria-pressed', rd.voice);
}
/* one page of the book */
function makeSheet(i) {
  const st = rd.st, n = st.pages.length, el = document.createElement('div');
  el.className = 'sheet'; el.dataset.i = i;
  let face;
  if (i === 0) {                                    // the front cover
    el.classList.add('coversheet');
    const big = st.cover.replace('cover.webp', 'cover-big.webp');
    const t = (st.title[rd.lang] || st.title.en).replace(/\s*\([^)]*\)\s*$/, '');
    face = `<div class="spic img"><div class="sblur" style="background-image:url('${big}')"></div><img src="${big}" alt="${t}" draggable="false"></div><p class="rdtext vh">${words(t)}</p>`;
    const nx = st.pages[0]; if (nx && nx.img) { const im = new Image(); im.src = nx.img; }
  } else if (i <= n) {
    const pg = st.pages[i - 1];
    face = `<div class="spic img"><div class="sblur" style="background-image:url('${pg.img}')"></div><img src="${pg.img}" alt="" draggable="false"></div>`
      + `<div class="stext"><p class="rdtext">${words(SL(pg))}</p><span class="pnum">${i}</span></div>`;
    const nx = st.pages[i]; if (nx && nx.img) { const im = new Image(); im.src = nx.img; }   // load the next picture early
  } else {                                          // The End – nothing else, just like a real book
    el.classList.add('endsheet');
    face = `<div class="rdend"><div class="endem">🌟</div><h2>${rd.lang === 'tl' ? 'Wakas' : 'The End'}</h2>
      <p class="endsrc">${st.source ? SL(st.source) : ''}</p></div>`;
  }
  el.innerHTML = `<div class="sface">${face}<div class="curl"></div></div><div class="sback"></div><div class="shade"></div>`;
  return el;
}
const setAngle = (el, a) => { el.style.transform = `rotateY(${a}deg)`; el.style.setProperty('--sh', Math.sin(-a * Math.PI / 180).toFixed(3)); };
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate(el, from, to, done) {
  const ms = reduceMotion() ? 1 : 260 + Math.abs(to - from) * 2.4, t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms); setAngle(el, from + (to - from) * ease(k)); if (k < 1) requestAnimationFrame(step); else done(); };
  requestAnimationFrame(step);
}
/* the page now lying open: it gets the text id, progress is saved, the controls update */
function settle(sheet) {
  $$('#rdBook .sheet').forEach(s => { if (s !== sheet) s.remove(); });
  sheet.style.transform = ''; sheet.style.zIndex = 1; sheet.classList.remove('turning');
  $$('#rdBook .rdtext').forEach(p => p.removeAttribute('id'));
  const t = $('.rdtext', sheet); if (t) t.id = 'rdText';
  rd.page = +sheet.dataset.i; flipping = false;
  const st = rd.st, n = st.pages.length, end = rd.page === n + 1;
  if (end) { const prog = FZ.storyProg[st.id] = Object.assign({ done: false, reads: 0 }, FZ.storyProg[st.id]); prog.done = true; prog.reads++; saveStories(); }
  $('#rdDots').innerHTML = `<span class="pgcount">${rd.page === 0 ? '📕' : end ? '🌟' : `${rd.page} / ${n}`}</span>`;
  $('#rdPrev').disabled = rd.page === 0; $('#rdNext').disabled = end;
  $('#rdPrev').style.visibility = rd.page === 0 ? 'hidden' : ''; $('#rdNext').style.visibility = end ? 'hidden' : '';
  if (rd.voice) setTimeout(readPage, 300);
}
function current() { return $(`#rdBook .sheet[data-i="${rd.page}"]`); }
/* forward: the open page turns away to the left, showing the next one underneath.
   back: the previous page comes back over from the left. */
function prepare(d) {
  const np = rd.page + d;
  if (np < 0 || np > lastPage()) return null;
  const cur = current(), other = makeSheet(np);
  if (d > 0) { other.style.zIndex = 1; cur.style.zIndex = 2; cur.classList.add('turning'); $('#rdBook').insertBefore(other, cur); return { mover: cur, other, from: 0, to: -180, keep: other }; }
  other.style.zIndex = 3; other.classList.add('turning'); setAngle(other, -180); $('#rdBook').append(other);
  return { mover: other, other, from: -180, to: 0, keep: other };
}
function turn(d) {
  if (flipping || !rd.st) return;
  const f = prepare(d); if (!f) return;
  flipping = true; stopReading(); FZ.sfx('pop');
  animate(f.mover, f.from, f.to, () => settle(f.keep));
}
function jumpTo(i) { const book = $('#rdBook'); book.innerHTML = ''; const sh = makeSheet(i); book.append(sh); settle(sh); }

/* drag a page with a finger (or mouse) to turn it like paper */
(() => {
  const bk = $('#rdBook'); let drag = null;
  bk.addEventListener('pointerdown', e => {
    if (flipping || e.button > 0 || e.target.closest('button, details, a')) return;
    drag = { x0: e.clientX, y0: e.clientY, t0: performance.now(), w: bk.clientWidth, f: null, a: 0, moved: false };
  });
  bk.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.f) {
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;   // a tap or a scroll, not a page turn
      drag.f = prepare(dx < 0 ? 1 : -1); if (!drag.f) { drag = null; return; }
      drag.moved = true; flipping = true; stopReading(); try { bk.setPointerCapture(e.pointerId); } catch (er) { }
    }
    const k = dx / drag.w * 180;
    drag.a = drag.f.to < drag.f.from ? clamp(k, -180, 0) : clamp(-180 + k, -180, 0);
    setAngle(drag.f.mover, drag.a);
  });
  const end = e => {
    if (!drag) return; const d = drag; drag = null;
    if (!d.f) {                                         // a tap: right side = next page, left side = back (words can still be tapped)
      if (d.moved || e.type === 'pointercancel' || e.target.closest('.w, button, details, a')) return;
      const r = bk.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x > 0.72) turn(1); else if (x < 0.28) turn(-1);
      return;
    }
    const v = (e.clientX - d.x0) / Math.max(1, performance.now() - d.t0);   // a quick flick turns the page too
    const fwd = d.f.to < d.f.from;
    const go = fwd ? (d.a < -75 || v < -0.6) : (d.a > -105 || v > 0.6);
    if (go) { FZ.sfx('pop'); animate(d.f.mover, d.a, d.f.to, () => settle(d.f.keep)); }
    else animate(d.f.mover, d.a, d.f.from, () => { d.f.other === d.f.mover ? d.f.mover.remove() : d.f.other.remove(); const c = current(); c.style.zIndex = 1; c.classList.remove('turning'); c.style.transform = ''; flipping = false; });
  };
  bk.addEventListener('pointerup', end); bk.addEventListener('pointercancel', end);
})();

/* full screen while reading (where the browser allows it) */
const canFull = () => !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
function enterFull() { if (canFull() && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); }
function exitFull() { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { }); }
const FULL_ICON = on => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="#5b3fb8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${on
  ? '<path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/>' : '<path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/>'}</svg>`;
const fullIcon = () => { const b = $('#rdFull'); if (b) b.innerHTML = FULL_ICON(!!document.fullscreenElement); };
document.addEventListener('fullscreenchange', fullIcon);

/* every word in its own span, so it can light up while it is read */
const words = text => text.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w : `<span class="w">${w}</span>`).join('');

/* ---------------- READ TO ME (device voice, lights up each word) ---------------- */
function stopReading() {
  rd.token++;
  try { speechSynthesis.cancel(); } catch (e) { }
  if (rd.audio) { try { rd.audio.pause(); } catch (e) { } rd.audio = null; }
  rd.utter = null; $$('#rdText .w.hl').forEach(w => w.classList.remove('hl'));
}
const recKey = (id, lang, page) => `${id}|${lang}|${page}`;   // page = story page index (0 = first story page) or 'cover'
/* Read the page: 1) a real reader's recording made in Parent Mode, 2) narration files listed in stories.js, 3) the device voice */
async function readPage() {
  if (FZ.screen !== 'reader') return;
  const box = $('#rdText'); if (!box) return;
  stopReading();
  const token = rd.token, n = rd.st.pages.length;
  if (rd.page > n) return;
  const pg = rd.page === 0 ? 'cover' : rd.page - 1;
  const blob = FZ.rec ? await FZ.rec.get(recKey(rd.st.id, rd.lang, pg)) : null;
  if (token !== rd.token || FZ.screen !== 'reader') return;
  if (blob) return playAudio(URL.createObjectURL(blob), true, speakPage);
  const nar = rd.st.narration && rd.st.narration[rd.lang];
  if (nar) return playAudio(`${nar}${pg === 'cover' ? 'cover' : pg + 1}.mp3`, false, speakPage);
  speakPage();
}
/* play a recording and light up the words in step with it (spread by word length) */
function playAudio(url, revoke, fallback) {
  const spans = $$('#rdText .w'), total = spans.reduce((a, s) => a + s.textContent.length + 1, 0);
  const ends = []; let acc = 0; spans.forEach(s => { acc += s.textContent.length + 1; ends.push(acc / total); });
  const a = new Audio(url); rd.audio = a; const token = rd.token;
  const light = i => spans.forEach((s, k) => s.classList.toggle('hl', k === i));
  a.ontimeupdate = () => { if (!a.duration || !isFinite(a.duration)) return; const f = a.currentTime / a.duration; light(ends.findIndex(e => f <= e)); };
  a.onended = () => { light(-1); if (revoke) URL.revokeObjectURL(url); };
  a.onerror = () => { if (revoke) URL.revokeObjectURL(url); if (token === rd.token && fallback) fallback(); };
  a.play().catch(() => { if (token === rd.token && fallback) fallback(); });
}
function speakPage() {
  if (!('speechSynthesis' in window) || FZ.screen !== 'reader') return;
  const box = $('#rdText'); if (!box) return;
  try { speechSynthesis.cancel(); } catch (e) { }
  const spans = $$('.w', box), text = spans.map(s => s.textContent).join(' ');
  const starts = []; let pos = 0; spans.forEach(s => { starts.push(pos); pos += s.textContent.length + 1; });
  const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' '));
  const v = FZ.voiceFor(rd.lang);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = rd.lang === 'tl' ? 'fil-PH' : 'en-US';
  u.rate = 0.85; u.pitch = 1.05;
  const light = i => spans.forEach((s, k) => s.classList.toggle('hl', k === i));
  u.onboundary = e => { if (e.name && e.name !== 'word') return; let i = starts.findIndex((p, k) => e.charIndex >= p && (k === starts.length - 1 || e.charIndex < starts[k + 1])); light(i); };
  u.onend = () => { if (rd.utter === u) light(-1); };
  rd.utter = u;
  try { speechSynthesis.speak(u); } catch (e) { }
}

/* ---------------- controls ---------------- */
$('#rdBack').onclick = goStories;
$('#rdFull').onclick = () => document.fullscreenElement ? exitFull() : enterFull();
if (!canFull()) $('#rdFull').style.display = 'none'; else fullIcon();
$('#rdPrev').onclick = () => turn(-1);
$('#rdNext').onclick = () => turn(1);
$('#rdVoice').onclick = () => { rd.voice = !rd.voice; FZ.sfx('pop'); $('#rdVoice').classList.toggle('on', rd.voice); $('#rdVoice').setAttribute('aria-pressed', rd.voice); rd.voice ? readPage() : stopReading(); };
$$('#reader .rdlang button').forEach(b => b.onclick = () => { rd.lang = b.dataset.rl; FZ.sfx('pop'); renderBar(); jumpTo(rd.page); });
/* tap a word to hear just that word */
/* tap a word to hear how it is said: the word pops up big and is spoken slowly */
$('#rdBook').addEventListener('click', e => {
  const w = e.target.closest('.w'); if (!w) return;
  const word = w.textContent.replace(/[^\p{L}\p{N}'’-]/gu, '').replace(/^['’-]+|['’-]+$/g, ''); if (!word) return;
  stopReading(); w.classList.add('hl'); setTimeout(() => w.classList.remove('hl'), 1400);
  $$('#reader .wordpop').forEach(x => x.remove());
  const r = w.getBoundingClientRect(), box = $('#reader').getBoundingClientRect();
  const pop = h(`<div class="wordpop">🔊 ${word}</div>`); $('#reader').append(pop);
  pop.style.left = clamp(r.left + r.width / 2 - box.left, 90, box.width - 90) + 'px';
  pop.style.top = Math.max(60, r.top - box.top - 14) + 'px';
  setTimeout(() => pop.classList.add('out'), 1500); setTimeout(() => pop.remove(), 1900);
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(word);
  const v = FZ.voiceFor(rd.lang); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = rd.lang === 'tl' ? 'fil-PH' : 'en-US';
  u.rate = 0.7;
  try { speechSynthesis.speak(u); } catch (er) { }
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (FZ.screen === 'reader') {
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    else if (e.key === 'Escape') goStories();
  } else if (FZ.screen === 'stories' && e.key === 'Escape') goHome();
});
FZ.onLangStories = () => { if (FZ.screen === 'stories') renderStories(); else if (FZ.screen === 'reader') { rd.lang = langsOf(rd.st).includes(FZ.lang) ? FZ.lang : 'en'; renderBar(); jumpTo(rd.page); } };
renderStories();

/* =====================================================
   RECORD A REAL READER (Parent Mode)
   Recordings are kept in this browser's IndexedDB on this device only. Nothing is uploaded.
   ===================================================== */
FZ.rec = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('funzone-voice', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('rec');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
    const t = db.transaction('rec', mode), q = fn(t.objectStore('rec'));
    t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
  }));
  return {
    get: k => tx('readonly', st => st.get(k)).catch(() => null),
    set: (k, b) => tx('readwrite', st => st.put(b, k)),
    del: k => tx('readwrite', st => st.delete(k)),
    keys: () => tx('readonly', st => st.getAllKeys()).catch(() => [])
  };
})();

const recUI = { story: 0, lang: 'en', mr: null, page: null, stream: null, timer: null, card: null, open: null, t0: 0 };
const recText = (st, i) => i < st.pages.length ? (st.pages[i].en || '') : (st.lesson ? st.lesson.en : FZ.t('rec_end'));
/* the list in Parent Mode: one row per page; "Record" opens the page in a big window */
FZ.renderRecCard = async card => {
  if (!card) return; recUI.card = card;
  const st = FZ.stories[recUI.story], n = st.pages.length, rows = st.lesson ? n + 1 : n;
  const have = new Set(await FZ.rec.keys());
  const canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && window.isSecureContext !== false);
  const done = Array.from({ length: rows }, (_, i) => have.has(recKey(st.id, 'en', i < n ? i : 'end'))).filter(Boolean).length;
  card.innerHTML = `<h3>${FZ.t('rec_title')}</h3><p class="muted">${FZ.t('rec_note')}</p>
    <div class="row"><label for="recStory">${FZ.t('rec_story')}</label><select id="recStory">${FZ.stories.map((s, i) => `<option value="${i}" ${i === recUI.story ? 'selected' : ''}>${s.title.en}</option>`).join('')}</select></div>
    ${canRec ? '' : `<p class="muted warn">${FZ.t('rec_nomic')}</p>`}
    <p class="muted"><b>${done} / ${rows}</b> ${FZ.t('rec_count')}</p>
    <div class="reclist">${Array.from({ length: rows }, (_, i) => {
      const pg = i < n ? i : 'end', has = have.has(recKey(st.id, 'en', pg));
      return `<div class="recrow ${has ? 'has' : ''}" data-i="${i}">
        <span class="rp">${has ? '✅' : '⚪'} ${i < n ? FZ.t('rec_page') + ' ' + (i + 1) : FZ.t('rec_end')}</span>
        <span class="rtxt">${recText(st, i)}</span>
        <span class="rbtns"><button class="btn small ropen" ${canRec ? '' : 'disabled'}>🎙️ ${FZ.t(has ? 'rec_redo' : 'rec_open')}</button></span></div>`;
    }).join('')}</div>`;
  $('#recStory', card).onchange = e => { recUI.story = +e.target.value; FZ.renderRecCard(card); };
  $$('.recrow', card).forEach(row => row.onclick = () => { if (canRec) openRecPage(+row.dataset.i); });     // tap anywhere on a page to open its recording window
};
/* the recording window: the whole text of the page, with the Record button under it */
async function openRecPage(i) {
  recUI.open = i;
  const st = FZ.stories[recUI.story], n = st.pages.length, rows = st.lesson ? n + 1 : n, pg = i < n ? i : 'end', key = recKey(st.id, 'en', pg);
  const has = !!(await FZ.rec.get(key)), live = !!recUI.mr, m = $('#modal');
  const img = i < n && st.pages[i].img ? `<img class="recimg" src="${st.pages[i].img}" alt="">` : '';
  m.innerHTML = `<div class="mcard recdlg" role="dialog" aria-label="${FZ.t('rec_page')} ${i + 1}">
    <div class="rechead"><b>${st.title.en}</b><span>${i < n ? `${FZ.t('rec_page')} ${i + 1} / ${n}` : FZ.t('rec_end')}</span></div>
    ${img}
    <div class="recfull">${recText(st, i)}</div>
    <div class="recstate ${live ? 'live' : ''}" id="recState">${live ? '🔴 ' + FZ.t('rec_now') + ' <span id="recClock">0:00</span>' : has ? '✅ ' + FZ.t('rec_saved') : FZ.t('rec_ready')}</div>
    <button class="btn big recbig ${live ? 'stop' : ''}" id="recGo">${live ? FZ.t('rec_stop') : has ? '⏺ ' + FZ.t('rec_again') : FZ.t('rec_start')}</button>
    <div class="recnav">
      <button class="round" id="recPrev" aria-label="${FZ.t('rec_prev')}" ${i > 0 && !live ? '' : 'disabled'}>◀</button>
      <button class="btn small" id="recPlay" ${has && !live ? '' : 'disabled'}>▶ ${FZ.t('rec_play')}</button>
      <button class="btn small" id="recDel" ${has && !live ? '' : 'disabled'}>🗑 ${FZ.t('rec_del')}</button>
      <button class="round" id="recNext" aria-label="${FZ.t('rec_next')}" ${i < rows - 1 && !live ? '' : 'disabled'}>▶</button>
    </div>
    <div class="actions"><button class="btn" id="recClose" ${live ? 'disabled' : ''}>✔ ${FZ.t('rec_done')}</button></div></div>`;
  m.classList.remove('hidden');
  $('#recGo').onclick = () => recUI.mr ? stopRec() : startRec(key, pg);
  $('#recPrev').onclick = () => openRecPage(i - 1);
  $('#recNext').onclick = () => openRecPage(i + 1);
  $('#recPlay').onclick = async () => { const b = await FZ.rec.get(key); if (b) { const u = URL.createObjectURL(b), a = new Audio(u); a.onended = () => URL.revokeObjectURL(u); a.play().catch(() => { }); } };
  $('#recDel').onclick = async () => { await FZ.rec.del(key); openRecPage(i); FZ.renderRecCard(recUI.card); };
  $('#recClose').onclick = () => { recUI.open = null; m.classList.add('hidden'); FZ.renderRecCard(recUI.card); };
}
async function startRec(key, pg) {
  try {
    try { speechSynthesis.cancel(); } catch (e) { }
    recUI.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch (e) { const m = $('#recState'); if (m) m.textContent = FZ.t('rec_denied'); return; }
  const chunks = [], mr = new MediaRecorder(recUI.stream);
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = async () => {
    recUI.stream.getTracks().forEach(t => t.stop()); clearTimeout(recUI.timer); clearInterval(recUI.clock);
    if (chunks.length) await FZ.rec.set(key, new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
    recUI.mr = null; recUI.page = null;
    if (recUI.open !== null) openRecPage(recUI.open);
    FZ.renderRecCard(recUI.card);
  };
  recUI.mr = mr; recUI.page = pg; recUI.t0 = Date.now(); mr.start();
  recUI.timer = setTimeout(stopRec, 90000);                      // one page is never longer than a minute and a half
  await openRecPage(recUI.open);
  recUI.clock = setInterval(() => { const c = $('#recClock'), t = Math.floor((Date.now() - recUI.t0) / 1000); if (c) c.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }, 500);
}
function stopRec() { if (recUI.mr && recUI.mr.state !== 'inactive') recUI.mr.stop(); }
