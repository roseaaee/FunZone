'use strict';
/* =====================================================
   FunZone app: navigation, child mode, parent mode, language
   ===================================================== */
let curCat = 'all', curGame = null, curApi = null, prevScreen = 'home', playedSec = 0, resting = false;

const CHILD_SCREENS = ['home', 'intro', 'play'];
function show(id) {
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
const avatarSvg = a => { const old = FZ.settings.avatar; FZ.settings.avatar = a; const s = FZ.me('stand'); FZ.settings.avatar = old; return s; };
function renderAvatars() {
  const row = $('#avatarBtns'); row.innerHTML = '';
  ['boy', 'girl'].forEach(a => {
    const b = h(`<button class="${FZ.settings.avatar === a ? 'active' : ''}" aria-label="${FZ.t(a)}">${avatarSvg(a)}</button>`);
    b.onclick = () => { FZ.settings.avatar = a; FZ.saveSettings(); FZ.sfx('good'); renderAvatars(); };
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
function openIntro(g) {
  destroyGame(); curGame = g;
  const sc = $('#intro');
  sc.innerHTML = `
    <div class="ihead">
      <button class="round" id="iBack" aria-label="${FZ.t('back')}">⬅️</button>
      <div class="title"><span class="big-em">${g.emoji}</span><h2>${g.name}</h2></div>
      <button class="round" id="iRead" aria-label="${FZ.t('read_me')}">🔊</button>
    </div>
    <p class="tagline">${FZ.g(g, 'tag')}</p>
    <div class="meta"><span class="chip">👥 ${FZ.g(g, 'players')}</span><span class="chip">🧰 ${FZ.g(g, 'props')}</span></div>
    <div class="panels">
      <article class="panel real"><h3>${FZ.t('in_real')}</h3><ul>${bullets(FZ.g(g, 'real'), ['👣', '🙌', '🏃', '🎉'])}</ul></article>
      <article class="panel how"><h3>${FZ.t('in_game')}</h3><ul>${bullets(FZ.g(g, 'how'), ['👆', '✨', '⭐', '🎯'])}</ul></article>
    </div>
    <div class="intro-actions">
      <button class="btn big" id="iPlay">${FZ.t('lets_play')}</button>
    </div>`;
  $('#iBack').onclick = goHome;
  $('#iRead').onclick = () => { const [a, b] = FZ.t('read_intro'); FZ.say([g.name, FZ.g(g, 'tag'), a, ...FZ.g(g, 'real'), b, ...FZ.g(g, 'how')].join('. '), true); };
  $('#iPlay').onclick = () => { try { window.speechSynthesis.cancel(); } catch (e) { } FZ.sfx('good'); startGame(g); };
  show('intro');
}

/* ---------------- PLAY ---------------- */
function makeApi(def) {
  const T = [], I = [], L = [], F = []; let dead = false;
  const stage = $('#stage'); stage.innerHTML = '';
  const api = {
    def, stage,
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
      p.plays++; p.stars = Math.max(p.stars, stars); FZ.progress[def.id] = p; FZ.saveProgress();
      FZ.sfx('win'); showResult(def, stars, text);
    },
    destroy() { dead = true; T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach(s => s.on = false); L.forEach(([t, e, f, o]) => t.removeEventListener(e, f, o)); try { speechSynthesis.cancel(); } catch (e) { } }
  };
  return api;
}
function destroyGame() { if (curApi) { curApi.destroy(); curApi = null; } $('#modal').classList.add('hidden'); }
function startGame(g) {
  destroyGame(); curGame = g;
  $('#playTitle').textContent = g.emoji + ' ' + g.name;
  $('#hint').textContent = '';
  show('play');
  curApi = makeApi(g);
  try { g.start(curApi); } catch (e) { console.error(e); curApi.msg('Oops, something went wrong. Try another game!'); }
}
function showResult(g, stars, text) {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard">
    <div class="stars">${[0, 1, 2].map(i => `<span>${i < stars ? '⭐' : '☆'}</span>`).join('')}</div>
    <h2>${pick(FZ.t('cheers'))} 🎉</h2>
    <p>${text ? FZ.tr(text) : FZ.t('great_play', g.name)}</p>
    <div class="actions">
      <button class="btn" id="mAgain">${FZ.t('again')}</button>
      <button class="btn ghost" id="mHome">${FZ.t('more')}</button>
    </div></div>`;
  m.classList.remove('hidden');
  FZ.say(FZ.t('say_great'));
  $('#mAgain').onclick = () => { m.classList.add('hidden'); startGame(g); };
  $('#mHome').onclick = () => { m.classList.add('hidden'); goHome(); };
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
    const b = h(`<button>${k}</button>`);
    b.onclick = () => {
      FZ.sfx('pop');
      if (k === '⌫') pinBuf = pinBuf.slice(0, -1);
      else if (k === 'OK') { /* auto-checks at 4 digits */ }
      else if (pinBuf.length < 4) pinBuf += k;
      updPin();
      if (pinBuf.length === 4) {
        if (FZ.hash(pinBuf) === FZ.settings.pinHash) { const cb = pinCb; pinCb = null; cb && cb(); }
        else { FZ.sfx('oops'); const d = $('#pinDots'); d.classList.add('bad'); setTimeout(() => { d.classList.remove('bad'); pinBuf = ''; updPin(); }, 450); }
      }
    };
    kp.append(b);
  });
})();
function updPin() { $$('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pinBuf.length)); }
function askPin(cb, titleKey) {
  pinCb = cb; pinBuf = ''; updPin();
  $('#lockTitle').textContent = FZ.t(titleKey || 'parents_only');
  prevScreen = FZ.screen && FZ.screen !== 'lock' ? FZ.screen : 'home';
  show('lock');
}
$('#lockCancel').onclick = () => { pinCb = null; show(resting ? 'rest' : prevScreen); };
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
      return `<div class="prow2"><span style="font-size:28px">${g.emoji}</span><span class="n">${g.name}</span><span>${'⭐'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</span><span class="muted">${FZ.t('times_played', p.plays)}</span></div>`;
    }).join('')}</div>`;

  /* settings */
  const S = FZ.settings;
  $('#ptab-settings').innerHTML = `
    <div class="pcard"><h3>${FZ.t('lang_row')}</h3>
      <div class="row"><label>${FZ.t('lang_title')}</label><div class="langsw"><button data-lang="en" class="${FZ.lang === 'en' ? 'active' : ''}">🇺🇸 English</button><button data-lang="tl" class="${FZ.lang === 'tl' ? 'active' : ''}">🇵🇭 Tagalog</button></div></div>
    </div>
    <div class="pcard"><h3>${FZ.t('snd_title')}</h3>
      <div class="row"><label for="sSound">${FZ.t('snd_fx')}</label><label class="switch"><input type="checkbox" id="sSound" ${S.sound ? 'checked' : ''}><span></span></label></div>
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
  $('#sSound').onchange = e => { S.sound = e.target.checked; FZ.saveSettings(); FZ.sfx('good'); };
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

  /* real-life guide */
  $('#ptab-guide').innerHTML = `<div class="pcard"><h3>${FZ.t('guide_title')}</h3>
    <p class="muted" style="margin-bottom:8px">${FZ.t('guide_note')}</p>
    ${FZ.games.map(g => `<details><summary>${g.emoji} ${g.name} <span class="muted" style="font-weight:600">· ${FZ.g(g, 'players')}</span></summary>
      <div class="tipbox">${FZ.t('you_need')} ${FZ.g(g, 'props')}</div>
      <b>${FZ.t('in_real')}</b><ul>${FZ.g(g, 'real').map(t => `<li>${t}</li>`).join('')}</ul>
      <b>${FZ.t('in_game')}</b><ul>${FZ.g(g, 'how').map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="tipbox">${FZ.t('parent_tip')} ${FZ.g(g, 'tip')}</div></details>`).join('')}</div>`;
}

/* ---------------- TIME LIMIT / REST ---------------- */
setInterval(() => {
  if (!CHILD_SCREENS.includes(FZ.screen) || resting) return;
  playedSec += 5;
  if (FZ.settings.limit > 0 && playedSec >= FZ.settings.limit * 60) {
    resting = true; destroyGame(); show('rest'); FZ.say(FZ.t('rest_say'));
  }
}, 5000);
$('#btnUnlock').onclick = () => askPin(() => { resting = false; playedSec = 0; goHome(); }, 'unlock_title');

/* ---------------- BOOT ---------------- */
FZ.watchText($('#stage')); FZ.watchText($('#hint'));
applyStatic(); renderCats(); renderAvatars(); renderHome();
show(FZ.settings.lang ? 'home' : 'lang');       // first time: ask which language