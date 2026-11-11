'use strict';
/* =====================================================
   FunZone app: navigation, child mode, parent mode, language
   ===================================================== */
let curCat = 'all', curGame = null, curApi = null, prevScreen = 'home', playedSec = 0, resting = false;

const CHILD_SCREENS = ['home', 'intro', 'play'];
function show(id) {
  if (id !== 'intro') { clearInterval(FZ.tutTimer); FZ.tutTimer = null; }
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  const sc = $('#' + id); if (sc) sc.scrollTop = 0;
  FZ.screen = id;
}
const totalStars = () => Object.values(FZ.progress).reduce((a, p) => a + (p.stars || 0), 0);

/* ---------------- LANGUAGE + STATIC TEXT ---------------- */
function applyStatic() {
  $$('[data-i18n]').forEach(el => { el.innerHTML = FZ.t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', FZ.t(el.dataset.i18nAria)));
  document.documentElement.lang = FZ.lang === 'tl' ? 'fil' : 'en';
  $$('.langsw button').forEach(b => b.classList.toggle('active', b.dataset.lang === FZ.lang));
}
function setLang(l) {
  FZ.lang = l; FZ.settings.lang = l; FZ.saveSettings();
  applyStatic(); renderCats(); renderHome(); renderAvatars();
  if (FZ.screen === 'parent') renderParent();
  if (FZ.screen === 'lang') { show('home'); FZ.say(pick(FZ.t('mascot'))); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]'); if (!b) return;
  FZ.sfx('pop'); setLang(b.dataset.lang);
});

/* ---------------- AVATAR (boy or girl) ---------------- */
const avatarSvg = a => FZ.kid(Object.assign({ pose: 'stand' }, FZ.look(), { girl: a === 'girl' }));
function renderAvatars() {
  const row = $('#avatarBtns'); row.innerHTML = '';
  ['boy', 'girl'].forEach(a => {
    const b = h(`<button class="${(FZ.look().girl ? 'girl' : 'boy') === a ? 'active' : ''}" aria-label="${FZ.t(a)}">${avatarSvg(a)}</button>`);
    b.onclick = () => { FZ.settings.look = Object.assign({}, FZ.look(), { girl: a === 'girl' }); FZ.saveSettings(); FZ.sfx('good'); renderAvatars(); };
    row.append(b);
  });
}

/* ---------------- HOME ---------------- */
function renderCats() {
  const nav = $('#cats'); nav.innerHTML = '';
  FZ.cats.forEach(c => {
    const b = h(`<button class="chip ${c.id === curCat ? 'active' : ''}">${c.emoji} ${FZ.t(c.key)}</button>`);
    b.onclick = () => { curCat = c.id; FZ.sfx('pop'); renderCats(); renderHome(); };
    nav.append(b);
  });
}
function renderHome() {
  $('#totalStars').textContent = totalStars();
  const grid = $('#gameGrid'); grid.innerHTML = '';
  FZ.games.filter(g => curCat === 'all' || g.cat === curCat).forEach(g => {
    const p = FZ.progress[g.id] || { stars: 0 };
    const card = h(`<button class="card" style="--c:${g.color}"><span class="em">${g.emoji}</span><span class="nm">${g.name}</span><span class="st">${'⭐'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</span></button>`);
    card.onclick = () => { FZ.sfx('pop'); openIntro(g); };
    grid.append(card);
  });
  $('#mascotSay').textContent = pick(FZ.t('mascot'));
}
function goHome() { destroyGame(); renderHome(); show('home'); }

/* ---------------- INTRO (how it is played for real + in the game) ---------------- */
const bullets = (arr, icon) => arr.map((t, i) => `<li data-i="${icon[i % icon.length]}">${t}</li>`).join('');
/* levels: the highest level this kid has unlocked for a game (level 1 is open from the start) */
function unlockedLevel(g) { return clamp((FZ.progress[g.id] || {}).unlocked || 1, 1, FZ.LEVELS); }
let introLevel = 1;
function openIntro(g) {
  destroyGame(); curGame = g;
  const sc = $('#intro'), TUT = FZ.tut && FZ.tut[g.id];
  const unl = unlockedLevel(g); introLevel = unl;
  const levelChips = Array.from({ length: FZ.LEVELS }, (_, i) => i + 1).map(n => `<button type="button" class="lvl ${n === introLevel ? 'active' : ''}" data-l="${n}" ${n > unl ? `disabled aria-label="${FZ.t('lvl_locked')}"` : ''}>${n > unl ? '🔒' : '⭐'.repeat(n)} ${FZ.t('lvl_title')} ${n}</button>`).join('');
  sc.innerHTML = `
    <div class="ihead">
      <button class="round" id="iBack" aria-label="${FZ.t('back')}">⬅️</button>
      <div class="title"><span class="big-em">${g.emoji}</span><h2>${g.name}</h2></div>
      <button class="round" id="iRead" aria-label="${FZ.t('read_me')}">🔊</button>
    </div>
    <p class="tagline">${FZ.g(g, 'tag')}</p>
    <div class="meta"><span class="chip">👥 ${FZ.g(g, 'players')}</span><span class="chip">🧰 ${FZ.g(g, 'props')}</span></div>
    <div class="levels" role="group" aria-label="${FZ.t('lvl_title')}">${levelChips}</div>
    ${TUT ? `<section class="tutor">
      <div class="tcols">
        <article class="tcol real"><h3>${FZ.t('in_real')}</h3><div class="tpic" id="tsReal"></div><p class="tcap" id="tcReal"></p></article>
        <article class="tcol how"><h3>${FZ.t('in_game')}</h3><div class="tpic" id="tsGame"></div><p class="tcap" id="tcGame"></p></article>
      </div>
      <div class="tctl">
        <button type="button" class="round" id="tPrev" aria-label="${FZ.t('tut_prev')}">◀</button>
        <div class="tdots" id="tDots">${[0, 1, 2].map(i => `<button type="button" data-i="${i}" aria-label="${FZ.t('tut_step')} ${i + 1}">${i + 1}</button>`).join('')}</div>
        <button type="button" class="round" id="tNext" aria-label="${FZ.t('tut_next')}">▶</button>
        <button type="button" class="round" id="tPlay" aria-label="${FZ.t('tut_pause')}">⏸</button>
      </div>
    </section>` : ''}
    <div class="digi"><b>${FZ.t('digi_title')}</b> ${FZ.digi(g.id)}</div>
    <div class="intro-actions">
      <button class="btn big" id="iPlay">${FZ.t('lets_play')}</button>
    </div>
    <details class="tmore"${TUT ? '' : ' open'}><summary>${FZ.t('tut_more')}</summary>
      <div class="panels">
        <article class="panel real"><h3>${FZ.t('in_real')}</h3><ul>${bullets(FZ.g(g, 'real'), ['👣', '🙌', '🏃', '🎉'])}</ul></article>
        <article class="panel how"><h3>${FZ.t('in_game')}</h3><ul>${bullets(FZ.g(g, 'how'), ['👆', '✨', '⭐', '🎯'])}</ul></article>
      </div>
    </details>`;
  if (TUT) runTutorial(TUT);
  $('#iBack').onclick = goHome;
  $$('#intro .lvl').forEach(b => b.onclick = () => { if (b.disabled) return; introLevel = +b.dataset.l; $$('#intro .lvl').forEach(x => x.classList.toggle('active', x === b)); FZ.sfx('pop'); });
  $('#iRead').onclick = () => { const [a, b] = FZ.t('read_intro'); const cap = s => s.c[FZ.lang === 'tl' ? 1 : 0]; FZ.say(TUT ? [g.name, FZ.g(g, 'tag'), a, ...TUT.real.map(cap), b, ...TUT.game.map(cap)].join('. ') : [g.name, FZ.g(g, 'tag'), a, ...FZ.g(g, 'real'), b, ...FZ.g(g, 'how')].join('. '), true); };
  $('#iPlay').onclick = () => { try { window.speechSynthesis.cancel(); } catch (e) { } FZ.sfx('good'); startGame(g, introLevel); };
  show('intro');
  try { $('#iPlay').focus({ preventScroll: true }); } catch (e) { }          // keyboard users: Enter starts the game
}

/* ---------------- picture tutorial: 3 steps, real life and FunZone side by side ---------------- */
function runTutorial(T) {
  let step = 0, auto = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const li = FZ.lang === 'tl' ? 1 : 0;
  const draw = () => {
    $('#tsReal').innerHTML = FZ.tutScene(T.real[step]); $('#tsGame').innerHTML = FZ.tutScene(T.game[step]);
    $('#tcReal').innerHTML = `<b>${step + 1}</b> ${T.real[step].c[li]}`; $('#tcGame').innerHTML = `<b>${step + 1}</b> ${T.game[step].c[li]}`;
    $$('#tDots button').forEach((b, i) => b.classList.toggle('active', i === step));
    $('#tPlay').textContent = auto ? '⏸' : '▶'; $('#tPlay').setAttribute('aria-label', FZ.t(auto ? 'tut_pause' : 'tut_play'));
  };
  const go = n => { step = (n + 3) % 3; draw(); };
  $('#tPrev').onclick = () => { auto = false; go(step - 1); };
  $('#tNext').onclick = () => { auto = false; go(step + 1); };
  $('#tPlay').onclick = () => { auto = !auto; draw(); };
  $$('#tDots button').forEach(b => b.onclick = () => { auto = false; go(+b.dataset.i); });
  clearInterval(FZ.tutTimer);
  FZ.tutTimer = setInterval(() => { if (auto && FZ.screen === 'intro') go(step + 1); }, 4500);
  draw();
}

/* ---------------- PLAY ---------------- */
function makeApi(def, level) {
  const T = [], I = [], L = [], F = []; let dead = false;
  const stage = $('#stage'); stage.innerHTML = '';
  const api = {
    def, stage, level: level || 1,
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
    sfx: FZ.sfx,
    finish(stars, text) {
      if (dead) return; stars = clamp(stars, 1, 3);
      const p = FZ.progress[def.id] || { stars: 0, plays: 0 };
      const newBadge = stars === 3 && !p.badge;
      p.plays++; p.stars = Math.max(p.stars, stars); if (newBadge) p.badge = 1;
      p.unlocked = Math.max(p.unlocked || 1, Math.min(FZ.LEVELS, api.level + 1));   // winning opens the next level
      FZ.progress[def.id] = p; FZ.saveProgress();
      api.freeze();                                   // the game stops here, so kids are not interrupted by more moves
      newBadge ? FZ.sfx('win') : FZ.sfx('coin');
      showResult(def, stars, text, newBadge, api.level);
    },
    freeze() { dead = true; T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach(s => s.on = false); L.forEach(([t, e, f, o]) => t.removeEventListener(e, f, o)); },
    destroy() { api.freeze(); try { speechSynthesis.cancel(); } catch (e) { } }
  };
  return api;
}
function destroyGame() { if (curApi) { curApi.destroy(); curApi = null; } $('#modal').classList.add('hidden'); hideToast(); }
/* keyboard hints for laptop users (shown only when a mouse/keyboard is the main input) */
const ARROWS = ['←', '↑', '↓', '→'];
FZ.keys = {
  patintero: [[ARROWS, '🏃']], agawan: [[ARROWS, '🏃']], langit: [[ARROWS, '🏃']], araw: [[ARROWS, '🏃']], bakod: [[ARROWS, '🏃']],
  lawin: [[['←', '→'], '🐔']], taguan: [[['Enter'], '🏁']], tinik: [[['Space'], '🦘']], baka: [[['Space'], '🦘⏳']], garter: [[['←', '↑', '→'], '🦘']],
  kadang: [[['←', '→'], '🥥']], tumbang: [[['Space'], '🩴']], sipa: [[['F', 'K', 'E'], '🦶🦵💪']],
  tsato: [[['Space'], '🏏']], palosebo: [[['Space'], '🤲'], [['S'], '🏖️'], [['F'], '👫']], sungka: [[['1', '…', '7'], '🐚']],
  hulaan: [[['1', '2', '3'], '🧩']], riddle: [[['1', '2', '3', '4'], '💡']], basa: [[['1', '2', '3', '4'], '📖']], kulay: [[['1', '…', '8'], '🎨']]
};
function renderKeyHint(g) {
  const el = $('#keyhint'); if (!el) return;
  const groups = (FZ.keys[g.id] || []).concat([[['Esc'], '⬅️']]);
  el.innerHTML = `<span class="kg">⌨️</span>` + groups.map(([ks, ic]) => `<span class="kg">${ks.map(k => `<kbd>${k}</kbd>`).join('')}<span class="ki">${ic}</span></span>`).join('');
}
function startGame(g, level) {
  destroyGame(); curGame = g; renderKeyHint(g);
  $('#playTitle').textContent = g.emoji + ' ' + g.name + ' · ' + FZ.t('lvl_title') + ' ' + (level || 1);
  $('#hint').textContent = '';
  show('play');
  curApi = makeApi(g, level || 1);
  try { g.start(curApi); } catch (e) { console.error(e); curApi.msg('Oops, something went wrong. Try another game!'); }
}
/* ---------------- REWARD BANNER (replaces the full-screen popup) ---------------- */
let toastTimer = null;
function hideToast() { const t = $('#toast'); if (!t) return; clearTimeout(toastTimer); t.classList.add('hidden'); t.classList.remove('gone'); }
/* the game after this one in the list (wraps around at the end) */
function nextGame(g) { const i = FZ.games.indexOf(g); return FZ.games[(i + 1) % FZ.games.length]; }
function showResult(g, stars, text, badge, level) {
  const t = $('#toast'), total = totalStars(), hasNextLevel = level < FZ.LEVELS;
  t.innerHTML = `<div class="tstars" aria-label="${stars} stars">${[0, 1, 2].map(i => i < stars ? '⭐' : '☆').join('')}</div>
    <div class="tmid">
      <div class="ttext">${text ? FZ.tr(text) : FZ.t('great_play', g.name)}</div>
      ${badge ? `<div class="tbadge">🏅 ${FZ.t('badge_new')}</div>` : ''}
      <div class="tcoins">⭐ ${FZ.t('total_short')}: <b>${total}</b></div>
    </div>
    <div class="tbtns">
      ${hasNextLevel ? `<button class="tbtn go" id="tCont">${FZ.t('btn_continue')}</button>` : ''}
      <button class="tbtn next" id="tNext">${FZ.t('btn_next')}</button>
      <button class="tbtn home" id="tBack">${FZ.t('btn_back')}</button>
    </div>`;
  t.classList.remove('hidden', 'gone');
  if ($('#totalStars')) $('#totalStars').textContent = total;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.add('gone'); setTimeout(hideToast, 450); }, 9000);
  if (hasNextLevel) $('#tCont').onclick = () => startGame(g, level + 1);
  $('#tNext').onclick = () => { hideToast(); openIntro(nextGame(g)); };
  $('#tBack').onclick = () => goHome();
  t.onclick = e => { if (!e.target.closest('button')) hideToast(); };
  FZ.say(FZ.t('say_great'));
}
function openHow(g) {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard" style="text-align:left">
    <h2 style="text-align:center">${g.emoji} ${g.name}</h2>
    <p><b>${FZ.t('how_title')}</b></p><ul style="padding-left:22px;margin-bottom:14px;font-size:19px">${FZ.g(g, 'how').map(t => `<li>${t}</li>`).join('')}</ul>
    <div class="actions"><button class="btn" id="mClose">${FZ.t('ok')}</button></div></div>`;
  m.classList.remove('hidden'); $('#mClose').onclick = () => m.classList.add('hidden');
}
$('#btnBack').onclick = () => { if (curGame) openIntro(curGame); else goHome(); };
$('#btnHow').onclick = () => curGame && openHow(curGame);

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
  else if (e.key === 'Escape' && FZ.screen === 'intro') goHome();
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
  $('#ptab-progress').innerHTML = `
    <div class="pcard"><h3>${FZ.t('summary')}</h3>
      <div class="prow2"><span class="n">${FZ.t('total_stars')}</span><b>⭐ ${totalStars()} / ${FZ.games.length * 3}</b></div>
      <div class="prow2"><span class="n">${FZ.t('games_tried')}</span><b>${tried} / ${FZ.games.length}</b></div>
      <div class="prow2"><span class="n">${FZ.t('play_time')}</span><b>${Math.round(playedSec / 60)} ${FZ.t('min')}</b></div></div>
    <div class="pcard"><h3>${FZ.t('each_game')}</h3>${FZ.games.map(g => {
      const p = FZ.progress[g.id] || { stars: 0, plays: 0 };
      return `<div class="prow2"><span style="font-size:28px">${g.emoji}</span><span class="n">${g.name}</span><span>${'⭐'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</span><span class="muted">${FZ.t('times_played', p.plays)} · ${FZ.t('lvl_done')} ${unlockedLevel(g)}/${FZ.LEVELS}</span></div>`;
    }).join('')}</div>`;

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
    </div>
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
  $('#sVoice').onchange = e => { S.voice = e.target.checked; FZ.saveSettings(); if (S.voice) FZ.say(FZ.t('hello')); };
  $('#sLimit').onchange = e => { S.limit = +e.target.value; FZ.saveSettings(); playedSec = 0; };
  $('#sPinSave').onclick = () => {
    const v = $('#sPin').value.trim();
    if (/^\d{4}$/.test(v)) { S.pinHash = FZ.hash(v); FZ.saveSettings(); $('#pinMsg').textContent = FZ.t('pin_saved'); $('#sPin').value = ''; }
    else $('#pinMsg').textContent = FZ.t('pin_bad');
  };
  $('#sReset').onclick = () => { if (confirm(FZ.t('confirm_reset'))) { FZ.progress = {}; FZ.saveProgress(); renderParent(); } };

}

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
applyStatic(); renderCats(); renderAvatars(); renderHome();
show(FZ.settings.lang ? 'home' : 'lang');       // first time: ask which language

/* ---------------- DRESS-UP ---------------- */
function openDress() { destroyGame(); renderDress(); show('dress'); }
function renderDress() {
  const L = FZ.look();
  $('#dressPreview').innerHTML = FZ.me('stand');
  $$('#dress .dgender button[data-g]').forEach(b => b.classList.toggle('active', (b.dataset.g === 'girl') === !!L.girl));
  $('#dressParts').innerHTML = [['skin', 'dress_skin'], ['hair', 'dress_hair'], ['shirt', 'dress_shirt'], ['shorts', 'dress_shorts'], ['shoe', 'dress_shoes']]
    .map(([k, t]) => `<div class="pcard dpart"><h3>${FZ.t(t)}</h3><div class="swatches">${FZ.LOOK_OPTS[k].map(c => `<button type="button" class="sw ${L[k] === c ? 'on' : ''}" data-k="${k}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div></div>`).join('');
}
$('#btnDress').onclick = () => { FZ.sfx('pop'); openDress(); };
$('#dressBack').onclick = () => goHome();
$$('#dress .dgender button[data-g]').forEach(b => b.onclick = () => { FZ.settings.look = Object.assign({}, FZ.look(), { girl: b.dataset.g === 'girl' }); FZ.saveSettings(); FZ.sfx('pop'); renderDress(); });
$('#dressSurprise').onclick = () => {
  const r = k => pick(FZ.LOOK_OPTS[k]);
  FZ.settings.look = { girl: Math.random() < .5, skin: r('skin'), hair: r('hair'), shirt: r('shirt'), shorts: r('shorts'), shoe: r('shoe') };
  FZ.saveSettings(); FZ.sfx('good'); renderDress();
};
$('#dressParts').onclick = e => {
  const b = e.target.closest('.sw'); if (!b) return;
  FZ.settings.look = Object.assign({}, FZ.look(), { [b.dataset.k]: b.dataset.c }); FZ.saveSettings(); FZ.sfx('pop'); renderDress();
};

