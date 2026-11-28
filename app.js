'use strict';
/* =====================================================
   FunZone app: navigation, child mode, parent mode, language
   ===================================================== */
let curGame = null, curLevel = 0, curApi = null, prevScreen = 'home', playedSec = 0, resting = false;

const CHILD_SCREENS = ['home', 'games', 'intro', 'levels', 'play', 'stories', 'reader', 'coloring', 'paint'];
function show(id) {
  if (id !== 'intro') { clearInterval(FZ.tutTimer); FZ.tutTimer = null; }
  if (FZ.screen === 'reader' && id !== 'reader') { try { speechSynthesis.cancel(); } catch (e) { } }   // leaving a book stops the voice
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  const sc = $('#' + id); if (sc) sc.scrollTop = 0;
  FZ.screen = id;
}
/* ---------------- LEVELS: every game has 30 levels, each a little harder; stars are kept for EACH level ---------------- */
FZ.LEVELS = 30;
FZ.levelCount = g => g && g.match ? 1 : FZ.LEVELS;          // match games (Sungka, Dama) have no levels: just Continue or New game
FZ.levelName = (g, i) => `${FZ.t('level')} ${i + 1}`;
FZ.lvStars = id => {                                   // stars per level, e.g. [3, 1] = level 1 has 3 stars, level 2 has 1
  const p = FZ.progress[id]; if (!p) return [];
  if (!Array.isArray(p.lv)) { p.lv = p.stars ? [p.stars] : []; delete p.stars; }   // older saves kept one score per game
  return p.lv;
};
Object.keys(FZ.progress).forEach(FZ.lvStars); FZ.saveProgress();
const sum = a => a.reduce((x, y) => x + (y || 0), 0);
const gameStars = g => sum(FZ.lvStars(g.id));
const gameMax = g => FZ.levelCount(g) * 3;
const isOpen = (g, i) => i === 0 || (FZ.lvStars(g.id)[i - 1] || 0) > 0;      // finish a level to open the next one
const nextLevel = g => { const lv = FZ.lvStars(g.id); for (let i = 0; i < FZ.LEVELS; i++) if (!lv[i]) return i; return FZ.LEVELS - 1; };
const totalStars = () => sum(FZ.games.map(gameStars));
const allMax = () => sum(FZ.games.map(gameMax));
const starRow = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);
FZ.seen = () => FZ.settings.seen || (FZ.settings.seen = {});   // tutorials and new-trick tips already shown, e.g. { patintero: 1, 'agawan:10': 1 }

/* ---------------- LANGUAGE + STATIC TEXT ---------------- */
function applyStatic() {
  $$('[data-i18n]').forEach(el => { el.innerHTML = FZ.t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', FZ.t(el.dataset.i18nAria)));
  document.documentElement.lang = FZ.lang === 'tl' ? 'fil' : 'en';
  $$('.langsw button').forEach(b => b.classList.toggle('active', b.dataset.lang === FZ.lang));
}
function setLang(l) {
  FZ.lang = l; FZ.settings.lang = l; FZ.saveSettings();
  applyStatic(); renderHome(); renderGames(); renderAvatars();
  if (FZ.screen === 'parent') renderParent();
  if (FZ.screen === 'levels' && curGame) openLevels(curGame);
  if (FZ.screen === 'intro' && curGame) openIntro(curGame);
  if (FZ.onLangStories) FZ.onLangStories();
  if (FZ.onLangColor) FZ.onLangColor();
  if (FZ.screen === 'lang') { show('home'); FZ.say(pick(FZ.t('mascot'))); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]'); if (!b) return;
  FZ.sfx('pop'); setLang(b.dataset.lang);
});

/* ---------------- AVATAR (boy or girl) ---------------- */
const avatarSvg = a => FZ.kid(Object.assign({ pose: 'stand' }, FZ.look(a)));      // each player in their own outfit
function renderAvatars() {
  const row = $('#avatarBtns'); row.innerHTML = '';
  ['boy', 'girl'].forEach(a => {
    const b = h(`<button class="${FZ.gender() === a ? 'active' : ''}" aria-label="${FZ.t(a)}">${avatarSvg(a)}</button>`);
    b.onclick = () => { FZ.settings.gender = a; FZ.saveSettings(); FZ.sfx('good'); renderAvatars(); };
    row.append(b);
  });
}

/* ---------------- HOME: pick a category first ---------------- */
const ZONES = [
  { id: 'games', emoji: '🎮', key: 'zone_games_n', color: '#ff922b', ready: true },
  { id: 'stories', emoji: '📚', key: 'zone_stories', color: '#4dabf7', ready: true },
  { id: 'coloring', emoji: '🎨', key: 'zone_coloring', color: '#f783ac', ready: true }
];
function renderHome() {
  const grid = $('#zoneGrid'); grid.innerHTML = '';
  ZONES.forEach(z => {
    const b = h(`<button class="zone ${z.ready ? '' : 'soon'}" style="--c:${z.color}"><span class="em">${z.emoji}</span><span class="nm">${FZ.t(z.key)}</span>${!z.ready ? `<span class="soonchip">${FZ.t('soon')}</span>` : ''}</button>`);
    b.onclick = () => {
      if (!z.ready) { FZ.sfx('pop'); const m = FZ.t('soon_say'); $('#mascotSay').textContent = m; FZ.say(m); return; }
      FZ.sfx('pop'); z.id === 'games' ? goGames() : z.id === 'stories' ? goStories() : goColoring();
    };
    grid.append(b);
  });
  if ($('#mascotSay')) $('#mascotSay').textContent = pick(FZ.t('mascot'));
}
function goHome() { destroyGame(); renderHome(); show('home'); }

/* ---------------- GAMES LIST: all games together, no stars outside the games ---------------- */
function renderGames() {
  const grid = $('#gameGrid'); grid.innerHTML = '';
  FZ.games.forEach(g => {
    const card = h(`<button class="card" style="--c:${g.color}"><span class="em">${g.emoji}</span><span class="nm">${g.name}</span></button>`);
    card.onclick = () => { FZ.sfx('pop'); openIntro(g); };
    grid.append(card);
  });
}
function goGames() { destroyGame(); renderGames(); renderAvatars(); $('#gMascot').innerHTML = FZ.guide('stand'); $('#mascotSay').textContent = pick(FZ.t('mascot')); show('games'); }
$('#gamesBack').onclick = goHome;

/* ---------------- LEVEL PICKER: 30 levels, stars for each level ---------------- */
function openLevels(g) {
  destroyGame(); curGame = g;
  const sc = $('#levels'), lv = FZ.lvStars(g.id), n = FZ.levelCount(g);
  sc.innerHTML = `
    <div class="ihead">
      <button class="round" id="lvBack" aria-label="${FZ.t('back')}">⬅️</button>
      <div class="title"><span class="big-em">${g.emoji}</span><h2>${g.name}</h2></div>
      <span style="width:58px"></span>
    </div>
    <p class="tagline">${FZ.t('pick_level')}</p>
    <div class="lvgrid lv30"></div>
    <p class="lvtotal">⭐ ${gameStars(g)} / ${gameMax(g)}</p>`;
  const grid = $('.lvgrid', sc);
  for (let i = 0; i < n; i++) {
    const open = isOpen(g, i), s = lv[i] || 0;
    const b = h(`<button class="lvbtn ${open ? '' : 'locked'} ${s ? 'done' : ''}" style="--c:${g.color}" ${open ? '' : 'aria-disabled="true"'}
      aria-label="${FZ.t('level')} ${i + 1}${open ? ', ' + s + ' ⭐' : ', ' + FZ.t('locked')}">
      <span class="ln">${open ? i + 1 : '🔒'}</span><span class="st">${starRow(s)}</span></button>`);
    b.onclick = () => {
      if (!open) { FZ.sfx('oops'); b.classList.add('wiggle'); setTimeout(() => b.classList.remove('wiggle'), 400); FZ.say(FZ.t('locked_say')); return; }
      try { window.speechSynthesis.cancel(); } catch (e) { }
      FZ.sfx('good'); startGame(g, i);
    };
    grid.append(b);
  }
  $('#lvBack').onclick = () => openIntro(g);
  show('levels');
  const first = $$('.lvbtn:not(.locked)', grid).find(b => !b.classList.contains('done')) || $('.lvbtn', grid);
  try { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center' }); } catch (e) { }
}

/* ---------------- GAME TITLE SCREEN: picture, "Level N", levels, how to play, about, settings ---------------- */
function openIntro(g) {
  destroyGame(); curGame = g;
  const sc = $('#intro'), TUT = FZ.tut && FZ.tut[g.id], nl = nextLevel(g), saved = g.match && store.get('match.' + g.id, null);
  const pic = TUT ? FZ.tutScene(TUT.real[0]) : `<div class="gt-em-big">${g.emoji}</div>`;     // the game's picture: kids playing it
  sc.innerHTML = `
    <div class="gt" style="--c:${g.color}">
      <div class="gt-hero">
        <div class="gt-pic">${pic}</div>
        <div class="gt-shade"></div>
        <button class="round gt-back" id="iBack" aria-label="${FZ.t('back')}">⬅️</button>
        <div class="gt-title"><h1><span>${g.emoji}</span> ${g.name}</h1><p>${FZ.g(g, 'tag')}</p></div>
      </div>
      <div class="gt-low">
      ${g.match ? `<div class="gt-two">${saved ? `<button class="gt-play" id="iCont">▶ ${FZ.t('gt_continue')}</button>` : ''}<button class="gt-play ${saved ? 'alt' : ''}" id="iNew">✨ ${FZ.t('gt_new')}</button></div>`
        : `<button class="gt-play" id="iPlay">▶ ${FZ.t('level')} ${nl + 1}</button>`}
      <div class="gt-row">
        ${g.match ? '' : `<button class="gt-btn" id="iLevels"><span>🔢</span>${FZ.t('gt_levels')}</button>`}
        <button class="gt-btn" id="iHow"><span>❓</span>${FZ.t('how_to')}</button>
        <button class="gt-btn" id="iAbout"><span>📜</span>${FZ.t('gt_about')}</button>
      </div>
      <div class="gt-corner">
        <button class="round" id="iSound" aria-label="${FZ.t('snd_fx')}" aria-pressed="${!!FZ.settings.sound}">${FZ.settings.sound ? '🔊' : '🔇'}</button>
        <button class="round" id="iSet" aria-label="${FZ.t('gt_settings')}">⚙️</button>
      </div>
      </div>
    </div>`;
  $('#iBack').onclick = goGames;
  const quiet = () => { try { speechSynthesis.cancel(); } catch (e) { } FZ.sfx('good'); };
  if (g.match) {
    if (saved) $('#iCont').onclick = () => { quiet(); startGame(g, 0); };
    $('#iNew').onclick = () => { quiet(); store.set('match.' + g.id, null); startGame(g, 0); };
  } else {
    $('#iPlay').onclick = () => { quiet(); startGame(g, nl); };
    $('#iLevels').onclick = () => { FZ.sfx('pop'); openLevels(g); };
  }
  $('#iHow').onclick = () => { FZ.sfx('pop'); openTutorial(g); };
  $('#iAbout').onclick = () => { FZ.sfx('pop'); openAbout(g); };
  $('#iSet').onclick = () => { FZ.sfx('pop'); openGameSettings(g); };
  $('#iSound').onclick = () => { FZ.settings.sound = !FZ.settings.sound; FZ.saveSettings(); FZ.sfx('pop'); openIntro(g); };
  show('intro');
  try { $('#iPlay, #iCont, #iNew').focus({ preventScroll: true }); } catch (e) { }          // keyboard users: Enter starts the game
}
const closeModal = () => { clearInterval(FZ.tutTimer); FZ.tutTimer = null; $('#modal').classList.add('hidden'); };
/* HOW TO PLAY: the basics of the game, as 3 picture steps (shown by itself the first time Level 1 is played) */
function openTutorial(g, onGo) {
  const T = FZ.tut && FZ.tut[g.id], m = $('#modal'), li = FZ.lang === 'tl' ? 1 : 0;
  const steps = T ? T.game : FZ.g(g, 'how').map(t => ({ c: [t, t] }));
  let step = 0, auto = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  m.innerHTML = `<div class="mcard tutcard">
    <h2>${g.emoji} ${FZ.t('how_to')}</h2>
    ${T ? '<div class="tutpic" id="tPic"></div>' : ''}
    <p class="tutcap" id="tCap"></p>
    <div class="tctl"><button type="button" class="round" id="tPrev" aria-label="${FZ.t('tut_prev')}">◀</button>
      <div class="tdots" id="tDots">${steps.map((_, i) => `<button type="button" data-i="${i}" aria-label="${FZ.t('tut_step')} ${i + 1}">${i + 1}</button>`).join('')}</div>
      <button type="button" class="round" id="tNext" aria-label="${FZ.t('tut_next')}">▶</button></div>
    <div class="actions"><button class="btn big" id="tGo">${onGo ? FZ.t('lets_play') : FZ.t('ok')}</button></div></div>`;
  const draw = () => {
    if (T) $('#tPic').innerHTML = FZ.tutScene(steps[step]);
    $('#tCap').innerHTML = `<b>${step + 1}</b> ${steps[step].c[li]}`;
    $$('#tDots button').forEach((b, i) => b.classList.toggle('active', i === step));
  };
  const go = k => { step = (k + steps.length) % steps.length; draw(); };
  $('#tPrev').onclick = () => { auto = false; go(step - 1); };
  $('#tNext').onclick = () => { auto = false; go(step + 1); };
  $$('#tDots button').forEach(b => b.onclick = () => { auto = false; go(+b.dataset.i); });
  $('#tGo').onclick = () => { closeModal(); if (onGo) onGo(); };
  clearInterval(FZ.tutTimer);
  FZ.tutTimer = setInterval(() => { if (auto && !m.classList.contains('hidden')) go(step + 1); }, 4500);
  m.classList.remove('hidden'); draw();
  FZ.say(steps.map(s => s.c[li]).join(' '), false);
  try { $('#tGo').focus({ preventScroll: true }); } catch (e) { }
}
/* a new trick at this level (shown once) */
function openTrick(g, tr, onGo) {
  const m = $('#modal'), text = tr[FZ.lang] || tr.en;
  m.innerHTML = `<div class="mcard trickcard"><div class="trem">${tr.emoji}</div><h2>${FZ.t('gt_new_trick')}</h2><p>${text}</p>
    <div class="actions"><button class="btn big" id="tGo">${FZ.t('lets_play')}</button></div></div>`;
  $('#tGo').onclick = () => { closeModal(); onGo(); };
  m.classList.remove('hidden'); FZ.say(text, false);
  try { $('#tGo').focus({ preventScroll: true }); } catch (e) { }
}
/* ABOUT: history, how it is played in real life, a tip for grown-ups */
function openAbout(g) {
  const m = $('#modal'), hist = FZ.HIST && FZ.HIST[g.id];
  m.innerHTML = `<div class="mcard aboutcard">
    <h2>${g.emoji} ${g.name}</h2>
    ${hist ? `<h3>📜 ${FZ.t('gt_history')}</h3><p>${hist[FZ.lang] || hist.en}</p>` : ''}
    <h3>${FZ.t('in_real')}</h3>
    <p class="meta"><span class="chip">👥 ${FZ.g(g, 'players')}</span> <span class="chip">🧰 ${FZ.g(g, 'props')}</span></p>
    <ol>${FZ.g(g, 'real').map(t => `<li>${t}</li>`).join('')}</ol>
    ${FZ.g(g, 'tip') ? `<h3>💡 ${FZ.t('gt_tip')}</h3><p>${FZ.g(g, 'tip')}</p>` : ''}
    <div class="actions"><button class="btn" id="mClose">${FZ.t('ok')}</button></div></div>`;
  m.classList.remove('hidden'); $('#mClose').onclick = closeModal;
}
/* GAME SETTINGS: sound, voice, show tips again, start over */
function openGameSettings(g) {
  const m = $('#modal'), S = FZ.settings;
  m.innerHTML = `<div class="mcard setcard"><h2>⚙️ ${FZ.t('gt_settings')}</h2>
    <div class="row"><label for="gSnd">${FZ.t('snd_fx')}</label><label class="switch"><input type="checkbox" id="gSnd" ${S.sound ? 'checked' : ''}><span></span></label></div>
    <div class="row"><label for="gVoice">${FZ.t('snd_voice')}</label><label class="switch"><input type="checkbox" id="gVoice" ${S.voice ? 'checked' : ''}><span></span></label></div>
    <div class="row"><span>${FZ.t('gt_tips_again')}</span><button class="btn small" id="gTips">💡 ${FZ.t('gt_show')}</button></div>
    <div class="row"><span>${FZ.t('gt_restart')}</span><button class="btn small ghost" id="gReset">🔄 ${FZ.t('gt_reset')}</button></div>
    <div class="actions"><button class="btn" id="mClose">${FZ.t('ok')}</button></div></div>`;
  m.classList.remove('hidden');
  $('#gSnd').onchange = e => { S.sound = e.target.checked; FZ.saveSettings(); FZ.sfx('pop'); };
  $('#gVoice').onchange = e => { S.voice = e.target.checked; FZ.saveSettings(); if (S.voice) FZ.say(FZ.t('hello')); };
  $('#gTips').onclick = () => { const sn = FZ.seen(); Object.keys(sn).forEach(k => { if (k === g.id || k.startsWith(g.id + ':')) delete sn[k]; }); FZ.saveSettings(); FZ.sfx('good'); $('#gTips').textContent = '✅'; };
  $('#gReset').onclick = () => { if (confirm(FZ.t('gt_reset_ask', g.name))) { delete FZ.progress[g.id]; FZ.saveProgress(); closeModal(); openIntro(g); } };
  $('#mClose').onclick = () => { closeModal(); if (FZ.screen === 'intro') openIntro(g); };
}

/* ---------------- PLAY ---------------- */
function makeApi(def, level) {
  const T = [], I = [], L = [], F = []; let dead = false;
  const stage = $('#stage'); stage.innerHTML = '';
  const api = {
    def, stage, level, levels: FZ.levelCount(def),
    t: level / (FZ.LEVELS - 1),                                   // 0 on level 1 … 1 on level 30
    /* a value for this level. Numbers change smoothly from level 1 (first value) to level 30 (last value),
       passing through the middle values, so every level is a little harder. Anything else (lists, words) changes in equal steps. */
    lv: (...v) => {
      const t = level / (FZ.LEVELS - 1);
      if (v.every(x => typeof x === 'number')) { const p = t * (v.length - 1), i = Math.min(v.length - 2, Math.floor(p)); return v.length === 1 ? v[0] : v[i] + (v[i + 1] - v[i]) * (p - i); }
      return v[Math.min(v.length - 1, Math.floor(level * v.length / FZ.LEVELS))];
    },
    get dead() { return dead; },
    later(f, ms) { const id = setTimeout(() => { if (!dead) f(); }, ms); T.push(id); return id; },
    every(f, ms) { const id = setInterval(() => { if (!dead) f(); }, ms); I.push(id); return id; },
    stopEvery(id) { clearInterval(id); },
    sleep(ms) { return new Promise(res => api.later(res, ms)); },
    frame(f) {
      const s = { on: true }; let last = performance.now();
      const loop = t => { if (!s.on || dead) return; const dt = Math.min(.05, (t - last) / 1000); last = t; if (f(dt) === false) { s.on = false; return; } requestAnimationFrame(loop); };
      requestAnimationFrame(loop); F.push(s); return () => { s.on = false; };
    },
    on(t, e, f, o) { t.addEventListener(e, f, o); L.push([t, e, f, o]); },
    msg(t, speak) { t = FZ.tr(t); $('#hint').textContent = t; if (speak) FZ.say(t); },
    /* LEVEL GOAL: every level says what the child must do to pass it, and how many tries (hearts) they have.
       api.goal({ en, tl, hearts }) shows it big at the start, then keeps it in the goal bar. */
    goal(o) {
      api.goalInfo = o; api.heartsLeft = o.hearts || 0; api.heartsMax = o.hearts || 0;
      const text = FZ.lang === 'tl' ? o.tl : o.en;
      drawGoalbar();
      api.showGoal();
    },
    /* the big goal card: at the start of the level, and again whenever the goal bar is tapped */
    showGoal() {
      const o = api.goalInfo; if (!o || dead) return;
      $$('.goalcard').forEach(c => c.remove());
      const text = FZ.lang === 'tl' ? o.tl : o.en;
      const card = h(`<div class="goalcard" role="status"><div class="gch">🎯 ${FZ.t('level')} ${level + 1}</div><div class="gct">${text}</div>${api.heartsMax ? `<div class="gchearts">${'❤️'.repeat(api.heartsLeft)}${'🤍'.repeat(api.heartsMax - api.heartsLeft)}</div>` : ''}</div>`);
      stage.append(card); api.later(() => card.classList.add('out'), 2600); api.later(() => card.remove(), 3100);
      card.onclick = () => card.remove();
    },
    progress(t) { api.goalNow = t; drawGoalbar(); },      // e.g. "2 / 3"
    /* lose one heart; returns how many are left. At 0 the level is not passed. */
    loseHeart() { if (!api.heartsMax) return 99; api.heartsLeft = Math.max(0, api.heartsLeft - 1); drawGoalbar(); $('#goalbar').classList.remove('hit'); void $('#goalbar').offsetWidth; $('#goalbar').classList.add('hit'); return api.heartsLeft; },
    /* stars from hearts left: all hearts = 3 stars, at least half = 2, else 1 */
    heartStars() { if (!api.heartsMax) return 3; const r = api.heartsLeft / api.heartsMax; return r >= 1 ? 3 : r >= .5 ? 2 : 1; },
    /* the goal was not reached: no stars, the next level stays closed, try again */
    fail(text) {
      if (dead) return; api.freeze(); FZ.sfx('oops');
      const p = FZ.progress[def.id] || { lv: [], plays: 0 }; FZ.progress[def.id] = p; p.plays = (p.plays || 0) + 1; FZ.saveProgress();
      showFail(def, level, text);
    },
    sfx: FZ.sfx,
    /* match games: the unfinished game is kept so kids can Continue later */
    saved: def.match ? store.get('match.' + def.id, null) : null,
    save(state) { if (def.match && !dead) store.set('match.' + def.id, state); },
    finish(stars, text) {
      if (def.match) store.set('match.' + def.id, null);
      if (dead) return; stars = clamp(stars, 1, 3);
      const p = FZ.progress[def.id] || { lv: [], plays: 0 }; FZ.progress[def.id] = p;
      const lv = FZ.lvStars(def.id), before = lv[level] || 0;
      const newBadge = stars === 3 && before < 3;     // a badge the first time a level gets 3 stars
      p.plays = (p.plays || 0) + 1; lv[level] = Math.max(before, stars);
      for (let i = 0; i < level; i++) lv[i] = lv[i] || 0;       // no holes in the list
      FZ.saveProgress();
      api.freeze();                                   // the game stops here, so kids are not interrupted by more moves
      newBadge ? FZ.sfx('win') : FZ.sfx('coin');
      showResult(def, level, stars, text, newBadge);
    },
    freeze() { dead = true; T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach(s => s.on = false); L.forEach(([t, e, f, o]) => t.removeEventListener(e, f, o)); },
    destroy() { api.freeze(); try { speechSynthesis.cancel(); } catch (e) { } }
  };
  return api;
}
function drawGoalbar() {
  const api = curApi || {}, o = api.goalInfo, el = $('#goalbar'); if (!el) return;
  if (!o) { el.innerHTML = ''; el.classList.add('empty'); return; }
  el.classList.remove('empty'); el.onclick = () => curApi && curApi.showGoal && curApi.showGoal();     // tap the bar to see the whole goal again
  el.innerHTML = `<span class="gtext">🎯 ${FZ.lang === 'tl' ? o.tl : o.en}</span>` + (api.goalNow ? `<span class="gnow">${api.goalNow}</span>` : '')
    + (api.heartsMax ? `<span class="ghearts" aria-label="${api.heartsLeft} / ${api.heartsMax}">${'❤️'.repeat(api.heartsLeft)}${'🤍'.repeat(api.heartsMax - api.heartsLeft)}</span>` : '');
}
/* level not passed: encourage, then Try again or Game home */
function showFail(g, level, text) {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard resultcard failcard" role="dialog">
    <div class="rstars">💪</div>
    <h2>${FZ.t('fail_title')}</h2>
    <p>${text ? FZ.tr(text) : FZ.t('fail_text')}</p>
    <div class="rbtns"><button class="btn big next" id="fAgain">🔁 ${FZ.t('fail_again')}</button><button class="btn big" id="fHome">🏠 ${FZ.t('gt_home')}</button></div></div>`;
  m.classList.remove('hidden');
  $('#fAgain').onclick = () => { m.classList.add('hidden'); startGame(g, level); };
  $('#fHome').onclick = () => { m.classList.add('hidden'); openIntro(g); };
  try { $('#fAgain').focus({ preventScroll: true }); } catch (e) { }
  FZ.say(FZ.t('fail_title'));
}
function destroyGame() { if (curApi) { curApi.destroy(); curApi = null; } $('#modal').classList.add('hidden'); hideToast(); }
/* keyboard hints for laptop users (shown only when a mouse/keyboard is the main input) */
const ARROWS = ['←', '↑', '↓', '→'];
FZ.keys = {
  patintero: [[ARROWS, '🏃']], agawan: [[ARROWS, '🏃']], langit: [[ARROWS, '🏃']], araw: [[ARROWS, '🏃']], bakod: [[ARROWS, '🏃']],
  lawin: [[ARROWS, '🐓']], taguan: [[ARROWS, '🚶']], tinik: [[['Space'], '🦘']], baka: [[['Space'], '🦘⏳']], garter: [[['Space'], '🦘⏳']],
  piko: [[['↑'], '🦶'], [['←', '→'], '🦶🦶'], [['↓'], '🪨']], kadang: [[['←', '→'], '🦶']], tumbang: [[['🖱️ drag'], '🩴'], [ARROWS, '🏃']], sipa: [[['←', '→'], '🏃'], [['Space'], '🦶']],
  palosebo: [[['Space'], '🤲'], [['S'], '🏖️'], [['F'], '👫']], sungka: [[['1', '…', '7'], '🐚']]
};
function renderKeyHint(g) {
  const el = $('#keyhint'); if (!el) return;
  const groups = (FZ.keys[g.id] || []).concat([[['Esc'], '⬅️']]);
  el.innerHTML = `<span class="kg">⌨️</span>` + groups.map(([ks, ic]) => `<span class="kg">${ks.map(k => `<kbd>${k}</kbd>`).join('')}<span class="ki">${ic}</span></span>`).join('');
}
function startGame(g, level = 0, ready = false) {
  if (!ready) {
    const seen = FZ.seen();
    if (level === 0 && !seen[g.id]) { seen[g.id] = 1; FZ.saveSettings(); return openTutorial(g, () => startGame(g, level, true)); }   // only the very first time
    const tr = (FZ.TRICKS && FZ.TRICKS[g.id] || []).find(t => t.at === level), key = g.id + ':' + level;
    if (tr && !seen[key]) { seen[key] = 1; FZ.saveSettings(); return openTrick(g, tr, () => startGame(g, level, true)); }
  }
  destroyGame(); curGame = g; curLevel = level; renderKeyHint(g);
  $('#goalbar').innerHTML = ''; $('#goalbar').classList.add('empty');
  $('#playTitle').innerHTML = `<span class="pt">${g.emoji} ${g.name}</span>` + (g.match ? '' : `<span class="lvtag">${FZ.t('level')} ${level + 1}</span>`);
  $('#hint').textContent = '';
  show('play');
  curApi = makeApi(g, level);
  try { g.start(curApi); } catch (e) { console.error(e); curApi.msg('Oops, something went wrong. Try another game!'); }
  fitFree(true);
}
/* ---------------- FILL THE SCREEN ----------------
   Every game's main area (the board, the scene, the court…) gets all the free space under the top bar,
   on phones, tablets and computers, upright or sideways. We measure the space and hand it over as --fh / --fw. */
/* no "Download / Share / Translate…" browser menu when a child presses and holds on anything
   (typing boxes and the grown-up corner still work normally) */
addEventListener('contextmenu', e => { if (!e.target.closest('input, textarea, select, #parent .ptab a')) e.preventDefault(); }, { capture: true });
addEventListener('selectstart', e => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
addEventListener('dragstart', e => { if (e.target.tagName === 'IMG' || e.target.closest('svg')) e.preventDefault(); });
const MAIN = ':scope > :is(.jscene,.sipaarena,.piko,.sungka,.dama,.board,.holen2,.kdg)';
let fitting = false, fitT = null;
function fitFree(tell) {
  const st = $('#stage'); if (!st || !$('#play').classList.contains('active')) return;
  const m = st.querySelector(MAIN); if (!m) return;
  fitting = true;
  const vh = window.visualViewport ? visualViewport.height : innerHeight, r = m.getBoundingClientRect();
  let below = 0;                                                                   // things under the main area (buttons, hints) keep their room
  [...st.children].forEach(c => { if (c === m || !c.offsetHeight) return; const cs = getComputedStyle(c), q = c.getBoundingClientRect();
    if (cs.position === 'absolute' || cs.position === 'fixed' || c.classList.contains('goalcard')) return; if (q.top >= r.bottom - 2) below += q.height + 10; });
  const fh = Math.max(180, Math.floor(vh - r.top - below - 14)), fw = Math.floor(st.clientWidth);
  const old = m.style.getPropertyValue('--fh');
  m.style.setProperty('--fh', fh + 'px'); m.style.setProperty('--fw', fw + 'px'); st.classList.add('filled'); st.dataset.shape = fh > fw * .8 ? 'tall' : 'wide';
  fitting = false;
  if (tell !== false && old !== fh + 'px') { window.dispatchEvent(new Event('resize')); FZ.lastFit = fh; }
}
const refit = () => { clearTimeout(fitT); fitT = setTimeout(() => fitFree(), 60); };
addEventListener('resize', () => { if (!fitting) refit(); });
if (window.visualViewport) visualViewport.addEventListener('resize', refit);
new MutationObserver(refit).observe($('#stage'), { childList: true });
/* ---------------- REWARD BANNER (replaces the full-screen popup) ---------------- */
let toastTimer = null;
function hideToast() { const t = $('#toast'); if (!t) return; clearTimeout(toastTimer); t.classList.add('hidden'); t.classList.remove('gone'); }
function showResult(g, level, stars, text, badge) {
  const m = $('#modal'), hasNext = !g.match && level + 1 < FZ.levelCount(g);
  m.innerHTML = `<div class="mcard resultcard" role="dialog" aria-label="${FZ.t('level')} ${level + 1}">
    <div class="rstars" aria-label="${stars} stars">${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${.15 + i * .2}s">${i < stars ? '⭐' : '☆'}</span>`).join('')}</div>
    <h2>${g.match ? g.emoji + ' ' + g.name : `${FZ.t('level')} ${level + 1} ✔️`}</h2>
    <p>${text ? FZ.tr(text) : FZ.t('great_play', g.name)}</p>
    ${badge ? `<div class="tbadge">🏅 ${FZ.t('badge_new')}</div>` : ''}
    <div class="rbtns">
      ${hasNext ? `<button class="btn big next" id="rNext">▶ ${FZ.t('level')} ${level + 2}</button>` : ''}
      ${g.match ? `<button class="btn big next" id="rNew">✨ ${FZ.t('gt_new')}</button>` : ''}
      <button class="btn big" id="rHome">🏠 ${FZ.t('gt_home')}</button>
      ${g.match ? '' : `<button class="btn" id="rAgain">${FZ.t('again')}</button>`}
    </div></div>`;
  m.classList.remove('hidden');
  const go = f => () => { m.classList.add('hidden'); f(); };
  if (hasNext) $('#rNext').onclick = go(() => startGame(g, level + 1));
  if (g.match) $('#rNew').onclick = go(() => { store.set('match.' + g.id, null); startGame(g, 0); });
  else $('#rAgain').onclick = go(() => startGame(g, level));
  $('#rHome').onclick = go(() => openIntro(g));
  try { (hasNext ? $('#rNext') : g.match ? $('#rNew') : $('#rHome')).focus({ preventScroll: true }); } catch (e) { }
  FZ.say(FZ.t('say_great'));
}
$('#btnBack').onclick = () => { if (curGame) openIntro(curGame); else goGames(); };
$('#btnHow').onclick = () => curGame && openTutorial(curGame);

/* ---------------- PIN LOCK ---------------- */
let pinBuf = '', pinCb = null;
(function buildKeypad() {
  const kp = $('#keypad');
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach(k => {
    const b = h(`<button type="button">${k}</button>`);
    b.onclick = () => pinPress(k);
    kp.append(b);
  });
})();
/* one handler for the on-screen keypad AND the physical keyboard (digits, numpad, Backspace, Enter, Esc) */
function pinPress(k) {
  if (pinBuf.length === 4) return;                                   // wrong-PIN shake in progress
  FZ.sfx('pop');
  const kb = $$('#keypad button').find(b => b.textContent === k); if (kb) { kb.classList.add('down'); setTimeout(() => kb.classList.remove('down'), 140); }
  if (k === '⌫') pinBuf = pinBuf.slice(0, -1);
  else if (k === 'OK') { if (pinBuf.length < 4) { $('#pinDots').classList.add('bad'); FZ.sfx('oops'); setTimeout(() => $('#pinDots').classList.remove('bad'), 400); } }
  else if (pinBuf.length < 4) pinBuf += k;
  updPin();
  if (pinBuf.length === 4) {
    if (FZ.hash(pinBuf) === FZ.settings.pinHash) { const cb = pinCb; pinCb = null; cb && cb(); }
    else { FZ.sfx('oops'); const d = $('#pinDots'); d.classList.add('bad'); setTimeout(() => { d.classList.remove('bad'); pinBuf = ''; updPin(); }, 450); }
  }
}
function lockCancel() { pinCb = null; show(resting ? 'rest' : prevScreen); }
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (FZ.screen === 'lock') {
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); pinPress(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); pinPress('⌫'); }
    else if (e.key === 'Enter') { e.preventDefault(); pinPress('OK'); }
    else if (e.key === 'Escape') { e.preventDefault(); lockCancel(); }
    return;
  }
  if (FZ.screen === 'intro' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) { const b = $(e.key === 'ArrowRight' ? '#tNext' : '#tPrev'); if (b) { e.preventDefault(); b.click(); } return; }
  if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) { $('#modal').classList.add('hidden'); return; }
  if (e.key === 'Escape' && FZ.screen === 'play') { if (curGame) openIntro(curGame); }
  else if (e.key === 'Escape' && FZ.screen === 'levels') { if (curGame) openIntro(curGame); }
  else if (e.key === 'Escape' && FZ.screen === 'intro') goGames();
  else if (e.key === 'Escape' && FZ.screen === 'games') goHome();
});
function updPin() { $$('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pinBuf.length)); }
function askPin(cb, titleKey) {
  pinCb = cb; pinBuf = ''; updPin();
  $('#lockTitle').textContent = FZ.t(titleKey || 'parents_only');
  prevScreen = FZ.screen && FZ.screen !== 'lock' ? FZ.screen : 'home';
  show('lock');
}
$('#lockCancel').onclick = lockCancel;
$('#btnParent').onclick = () => askPin(openParent, 'parents_only');

/* ---------------- PARENT MODE ---------------- */
function openParent() { destroyGame(); renderParent(); show('parent'); }
$('#btnExitParent').onclick = goHome;
$$('#ptabs button').forEach(b => b.onclick = () => {
  $$('#ptabs button').forEach(x => x.classList.toggle('active', x === b));
  $$('.ptab').forEach(t => t.classList.toggle('active', t.id === 'ptab-' + b.dataset.tab));
});
/* voices that fit the current language (Filipino voices for Tagalog, English voices for English) */
const voiceMatch = v => { const l = v.lang.toLowerCase().replace('_', '-'); return FZ.lang === 'tl' ? /^(fil|tl)/.test(l) : l.startsWith('en'); };
function hasLangVoice() { return FZ.lang !== 'tl' || FZ.voices.some(voiceMatch); }
function voiceOptions() {
  const cur = (FZ.settings.voices || {})[FZ.lang] || '';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return `<option value="">${FZ.t('voice_auto')}</option>` + FZ.voices.filter(voiceMatch).map(v => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
}
function renderParent() {
  /* progress */
  const tried = FZ.games.filter(g => (FZ.progress[g.id] || {}).plays).length;
  const lvRow = g => { const lv = FZ.lvStars(g.id), done = lv.filter(Boolean).length; return `<span class="plv">${FZ.t('levels_done', done, FZ.LEVELS)}</span><span class="plv">⭐ ${gameStars(g)} / ${gameMax(g)}</span>`; };
  $('#ptab-progress').innerHTML = `
    <div class="pcard"><h3>${FZ.t('summary')}</h3>
      <div class="prow2"><span class="n">${FZ.t('total_stars')}</span><b>⭐ ${totalStars()} / ${allMax()}</b></div>
      <div class="prow2"><span class="n">${FZ.t('games_tried')}</span><b>${tried} / ${FZ.games.length}</b></div>
      <div class="prow2"><span class="n">${FZ.t('st_finished')}</span><b>📖 ${FZ.storiesDone ? FZ.storiesDone() : 0} / ${FZ.stories.length}</b></div>
      <div class="prow2"><span class="n">${FZ.t('play_time')}</span><b>${Math.round(playedSec / 60)} ${FZ.t('min')}</b></div></div>`;

  /* settings */
  const S = FZ.settings;
  $('#ptab-settings').innerHTML = `
    <div class="pcard"><h3>${FZ.t('lang_row')}</h3>
      <div class="row"><label>${FZ.t('lang_title')}</label><div class="langsw"><button data-lang="en" class="${FZ.lang === 'en' ? 'active' : ''}">🇺🇸 English</button><button data-lang="tl" class="${FZ.lang === 'tl' ? 'active' : ''}">🇵🇭 Tagalog</button></div></div>
    </div>
    <div class="pcard"><h3>${FZ.t('snd_title')}</h3>
      <div class="row"><label for="sVoice">${FZ.t('snd_voice')}</label><label class="switch"><input type="checkbox" id="sVoice" ${S.voice ? 'checked' : ''}><span></span></label></div>
      <div class="row"><label for="sVoiceSel">${FZ.t('voice_pick')}</label><span style="display:flex;gap:8px;flex-wrap:wrap"><select id="sVoiceSel">${voiceOptions()}</select><button class="btn ghost" id="sVoiceTest" style="font-size:18px;padding:8px 16px">${FZ.t('voice_test')}</button></span></div>
      <p class="muted" id="voiceNote">${hasLangVoice() ? FZ.t('voice_note') : FZ.t('voice_no_tl')}</p>
      <p class="muted">${FZ.t('voice_tl_tip')}</p>
    </div>
    <div class="pcard" id="studioCard"></div>
    <div class="pcard" id="recCard"></div>
    <div class="pcard"><h3>${FZ.t('limit_title')}</h3>
      <div class="row"><label for="sLimit">${FZ.t('limit_lbl')}</label>
        <select id="sLimit">${[0, 10, 15, 20, 30, 45].map(v => `<option value="${v}" ${+S.limit === v ? 'selected' : ''}>${v ? FZ.t('minutes', v) : FZ.t('no_limit')}</option>`).join('')}</select></div>
      <p class="muted">${FZ.t('limit_note')}</p>
    </div>
    <div class="pcard"><h3>${FZ.t('pin_title')}</h3>
      <div class="row"><input id="sPin" type="password" inputmode="numeric" maxlength="4" placeholder="${FZ.t('pin_new')}"><button class="btn" id="sPinSave">${FZ.t('pin_save')}</button></div>
      <p class="muted" id="pinMsg"></p>
    </div>
    <div class="pcard"><h3>${FZ.t('data_title')}</h3>
      <div class="row"><label>${FZ.t('data_erase')}</label><button class="btn warn" id="sReset">${FZ.t('reset')}</button></div>
    </div>
    <div class="pcard"><h3>${FZ.t('priv_title')}</h3>
      <ul style="padding-left:22px;display:grid;gap:6px;font-size:17px">${FZ.t('priv').map(t => `<li>${t}</li>`).join('')}</ul>
    </div>`;
  $('#sVoiceSel').onchange = e => { S.voices = Object.assign({}, S.voices); if (e.target.value) S.voices[FZ.lang] = e.target.value; else delete S.voices[FZ.lang]; FZ.saveSettings(); FZ.say(FZ.t('voice_hi'), true); };
  $('#sVoiceTest').onclick = () => FZ.say(FZ.t('voice_hi'), true);
  if (FZ.renderRecCard) FZ.renderRecCard($('#recCard'));
  if (FZ.renderStudioCard) FZ.renderStudioCard($('#studioCard'));
  $('#sVoice').onchange = e => { S.voice = e.target.checked; FZ.saveSettings(); if (S.voice) FZ.say(FZ.t('hello')); };
  $('#sLimit').onchange = e => { S.limit = +e.target.value; FZ.saveSettings(); playedSec = 0; };
  $('#sPinSave').onclick = () => {
    const v = $('#sPin').value.trim();
    if (/^\d{4}$/.test(v)) { S.pinHash = FZ.hash(v); FZ.saveSettings(); $('#pinMsg').textContent = FZ.t('pin_saved'); $('#sPin').value = ''; }
    else $('#pinMsg').textContent = FZ.t('pin_bad');
  };
  $('#sReset').onclick = () => { if (confirm(FZ.t('confirm_reset'))) { FZ.progress = {}; FZ.saveProgress(); FZ.storyProg = {}; store.set('stories', {}); renderParent(); } };
  foldSettings();
}

/* Settings show only their titles (Language, Sound and voice, …). Tap a title to open that part. */
const openParts = new Set();
function foldSettings() {
  $$('#ptab-settings > .pcard').forEach((c, i) => {
    const t = c.querySelector(':scope > h3'); if (!t) return;
    c.classList.add('fold'); c.dataset.part = c.dataset.part || 'p' + i;
    c.classList.toggle('open', openParts.has(c.dataset.part));
    t.setAttribute('role', 'button'); t.tabIndex = 0; t.setAttribute('aria-expanded', c.classList.contains('open'));
  });
}
function toggleFold(t) {
  const c = t.closest('.pcard.fold'); if (!c) return;
  const on = !c.classList.contains('open'); c.classList.toggle('open', on); t.setAttribute('aria-expanded', on);
  on ? openParts.add(c.dataset.part) : openParts.delete(c.dataset.part); FZ.sfx && FZ.sfx('pop');
}
$('#ptab-settings').addEventListener('click', e => { const t = e.target.closest('.pcard.fold > h3'); if (t) toggleFold(t); });
$('#ptab-settings').addEventListener('keydown', e => { const t = e.target.closest('.pcard.fold > h3'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleFold(t); } });
new MutationObserver(() => { if ($$('#recCard, #studioCard').some(c => c.firstElementChild && !c.querySelector(':scope > h3[role]'))) foldSettings(); }).observe($('#ptab-settings'), { childList: true, subtree: true });

/* ---------------- TIME LIMIT / REST ---------------- */
setInterval(() => {
  if (!CHILD_SCREENS.includes(FZ.screen) || resting) return;
  playedSec += 5;
  if (FZ.settings.limit > 0 && playedSec >= FZ.settings.limit * 60) {
    resting = true; destroyGame(); show('rest'); try { $('#btnUnlock').focus(); } catch (e) { } FZ.say(FZ.t('rest_say'));
  }
}, 5000);
$('#btnUnlock').onclick = () => askPin(() => { resting = false; playedSec = 0; goHome(); }, 'unlock_title');

/* ---------------- BOOT ---------------- */
FZ.watchText($('#stage')); FZ.watchText($('#hint'));
applyStatic(); renderAvatars(); renderHome(); renderGames();
if ($('#langMascot')) $('#langMascot').innerHTML = FZ.guide('stand');
show(FZ.settings.lang ? 'home' : 'lang');       // first time: ask which language

/* ---------------- DRESS-UP ---------------- */
function openDress() { destroyGame(); renderDress(); show('dress'); }
/* DRESS-UP: one panel per item (hair, top, bottom, footwear). Pick a style; "Change color" opens that item's colours.
   Boys and girls each have their own clothes and keep their own outfit. */
let dressOpen = null;
const DRESS_PANELS = [
  { k: 'hairStyle', c: 'hair', t: 'dress_hair_p', lbl: 'hs_', em: '💇' },
  { k: 'top', c: 'shirt', t: 'dress_top', lbl: 'top_', em: '👕', vb: '22 18 56 70' },
  { k: 'bottom', c: 'shorts', t: 'dress_bottom', lbl: 'bot_', em: '🩳', vb: '24 52 52 52' },
  { k: 'foot', c: 'shoe', t: 'dress_foot', lbl: 'ft_', em: '👟', vb: '28 91 44 19' }
];
function renderDress() {
  const g = FZ.gender(), L = FZ.look(), W = FZ.WARDROBE[g];
  $('#dressPreview').innerHTML = FZ.me('stand');
  $$('#dress .dgender button[data-g]').forEach(b => b.classList.toggle('active', b.dataset.g === g));
  const sw = (k, list) => `<div class="swatches">${list.map(c => `<button type="button" class="sw ${L[k] === c ? 'on' : ''}" data-k="${k}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`;
  const panel = P => {
    const hidden = P.k === 'bottom' && (L.top === 'dress' || L.top === 'filipiniana');
    const pic = v => P.k === 'hairStyle' ? FZ.kidHead({ skin: L.skin, hair: L.hair, hairStyle: v })
      : FZ.kidPart(Object.assign({}, L, { [P.k]: v }, P.k === 'bottom' && hidden ? { top: 'tee' } : {}), P.vb);
    const noColor = P.k === 'foot' && L.foot === 'barefoot' || P.k === 'top' && L.top === 'barong';
    return `<div class="pcard dpart dpanel" data-p="${P.k}">
      <div class="dphead"><h3>${P.em} ${FZ.t(P.t)}</h3>${noColor ? '' : `<button type="button" class="chip dcolor ${dressOpen === P.k ? 'active' : ''}" data-open="${P.k}">🎨 ${FZ.t('dress_change_color')}</button>`}</div>
      ${dressOpen === P.k && !noColor ? sw(P.c, FZ.LOOK_OPTS[P.c]) : ''}
      <div class="swatches clothes">${W[P.k].map(v => `<button type="button" class="sw hs cl ${P.k === 'hairStyle' ? 'hair' : ''} ${L[P.k] === v ? 'on' : ''}" data-k="${P.k}" data-c="${v}" aria-label="${FZ.t(P.lbl + v)}">${pic(v)}<span>${FZ.t(P.lbl + v)}</span></button>`).join('')}</div>
      ${hidden ? `<p class="muted">${FZ.t('dress_hidden')}</p>` : ''}</div>`;
  };
  $('#dressParts').innerHTML = `<div class="pcard dpart dpanel"><div class="dphead"><h3>🖐️ ${FZ.t('dress_skin')}</h3></div>${sw('skin', FZ.LOOK_OPTS.skin)}</div>` + DRESS_PANELS.map(panel).join('');
  renderAvatars();
}
$('#btnDress').onclick = () => { FZ.sfx('pop'); openDress(); };
$('#dressBack').onclick = () => goGames();
$$('#dress .dgender button[data-g]').forEach(b => b.onclick = () => { FZ.settings.gender = b.dataset.g; FZ.saveSettings(); dressOpen = null; FZ.sfx('pop'); renderDress(); });
$('#dressSurprise').onclick = () => {
  const g = FZ.gender(), W = FZ.WARDROBE[g], O = FZ.LOOK_OPTS;
  FZ.setLook({ skin: pick(O.skin), hair: pick(O.hair), hairStyle: pick(W.hairStyle), top: pick(W.top), bottom: pick(W.bottom), foot: pick(W.foot), shirt: pick(O.shirt), shorts: pick(O.shorts), shoe: pick(O.shoe) });
  FZ.sfx('good'); renderDress();
};
$('#dressParts').onclick = e => {
  const o = e.target.closest('[data-open]');
  if (o) { dressOpen = dressOpen === o.dataset.open ? null : o.dataset.open; FZ.sfx('pop'); return renderDress(); }
  const b = e.target.closest('.sw'); if (!b) return;
  FZ.setLook({ [b.dataset.k]: b.dataset.c }); FZ.sfx('pop'); renderDress();
};


/* keep a copy of FunZone on this phone or tablet so it works without internet (only on a published https site) */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  /* when a new version of FunZone has been published, reload once so every file is from the same version */
  const hadOld = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadOld && !reloaded && FZ.screen !== 'play') { reloaded = true; location.reload(); } });
}
