'use strict';
/* =====================================================
   FunZone app: navigation, child mode, parent mode
   ===================================================== */
let curCat = 'all', curGame = null, curApi = null, prevScreen = 'home', playedSec = 0, resting = false;

const CHILD_SCREENS = ['home', 'intro', 'play'];
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  const sc = $('#' + id); if (sc) sc.scrollTop = 0;
  FZ.screen = id;
}
const totalStars = () => Object.values(FZ.progress).reduce((a, p) => a + (p.stars || 0), 0);

/* ---------------- HOME ---------------- */
function renderCats() {
  const nav = $('#cats'); nav.innerHTML = '';
  FZ.cats.forEach(c => {
    const b = h(`<button class="chip ${c.id === curCat ? 'active' : ''}">${c.emoji} ${c.label}</button>`);
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
  const say = ['Kumusta! I\'m Kabaw. Pick a game to play!', 'Let\'s play like the kids of long ago!', 'Which game do you want to try today?', 'Tara, laro tayo! 🎉'];
  $('#mascotSay').textContent = pick(say);
}
function goHome() { destroyGame(); renderHome(); show('home'); }

/* ---------------- INTRO (how it is played for real + in the game) ---------------- */
const bullets = (arr, icon) => arr.map((t, i) => `<li data-i="${Array.isArray(icon) ? icon[i % icon.length] : icon}">${t}</li>`).join('');
function openIntro(g) {
  destroyGame(); curGame = g;
  const sc = $('#intro');
  sc.innerHTML = `
    <div class="ihead">
      <button class="round" id="iBack" aria-label="Back">⬅️</button>
      <div class="title"><span class="big-em">${g.emoji}</span><h2>${g.name}</h2></div>
      <button class="round" id="iRead" aria-label="Read to me">🔊</button>
    </div>
    <p class="tagline">${g.tag}</p>
    <div class="meta"><span class="chip">👥 ${g.players}</span><span class="chip">🧰 ${g.props}</span></div>
    <div class="panels">
      <article class="panel real"><h3>🌳 In real life</h3><ul>${bullets(g.real, ['👣', '🙌', '🏃', '🎉'])}</ul></article>
      <article class="panel how"><h3>🎮 In FunZone</h3><ul>${bullets(g.how, ['👆', '✨', '⭐', '🎯'])}</ul></article>
    </div>
    <div class="intro-actions">
      <button class="btn big" id="iPlay">▶️ Let's Play!</button>
    </div>`;
  $('#iBack').onclick = goHome;
  $('#iRead').onclick = () => FZ.say([g.name, g.tag, 'In real life.', ...g.real, 'In this game.', ...g.how].join('. '), true);
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
    msg(t, speak) { $('#hint').textContent = t; if (speak) FZ.say(t); },
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
  const cheers = ['Galing!', 'Bravo!', 'Magaling!', 'Hooray!', 'Ang husay mo!'];
  m.innerHTML = `<div class="mcard">
    <div class="stars">${[0, 1, 2].map(i => `<span>${i < stars ? '⭐' : '☆'}</span>`).join('')}</div>
    <h2>${pick(cheers)} 🎉</h2>
    <p>${text || 'Great job playing ' + g.name + '!'}</p>
    <div class="actions">
      <button class="btn" id="mAgain">🔁 Play again</button>
      <button class="btn ghost" id="mHome">🏠 More games</button>
    </div></div>`;
  m.classList.remove('hidden');
  FZ.say('Great job!');
  $('#mAgain').onclick = () => { m.classList.add('hidden'); startGame(g); };
  $('#mHome').onclick = () => { m.classList.add('hidden'); goHome(); };
}
function openHow(g) {
  const m = $('#modal');
  m.innerHTML = `<div class="mcard" style="text-align:left">
    <h2 style="text-align:center">${g.emoji} ${g.name}</h2>
    <p><b>🎮 How to play:</b></p><ul style="padding-left:22px;margin-bottom:14px;font-size:19px">${g.how.map(t => `<li>${t}</li>`).join('')}</ul>
    <div class="actions"><button class="btn" id="mClose">👍 OK!</button></div></div>`;
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
function askPin(cb, title) {
  pinCb = cb; pinBuf = ''; updPin();
  $('#lockTitle').textContent = title || 'Parents only';
  prevScreen = FZ.screen && FZ.screen !== 'lock' ? FZ.screen : 'home';
  show('lock');
}
$('#lockCancel').onclick = () => { pinCb = null; show(resting ? 'rest' : prevScreen); };
$('#btnParent').onclick = () => askPin(openParent, 'Parents only');

/* ---------------- PARENT MODE ---------------- */
function openParent() { destroyGame(); renderParent(); show('parent'); }
$('#btnExitParent').onclick = goHome;
$$('#ptabs button').forEach(b => b.onclick = () => {
  $$('#ptabs button').forEach(x => x.classList.toggle('active', x === b));
  $$('.ptab').forEach(t => t.classList.toggle('active', t.id === 'ptab-' + b.dataset.tab));
});
function renderParent() {
  /* progress */
  const tried = FZ.games.filter(g => (FZ.progress[g.id] || {}).plays).length;
  $('#ptab-progress').innerHTML = `
    <div class="pcard"><h3>📊 Summary</h3>
      <div class="prow2"><span class="n">Total stars collected</span><b>⭐ ${totalStars()} / ${FZ.games.length * 3}</b></div>
      <div class="prow2"><span class="n">Games tried</span><b>${tried} / ${FZ.games.length}</b></div>
      <div class="prow2"><span class="n">Play time this session</span><b>${Math.round(playedSec / 60)} min</b></div></div>
    <div class="pcard"><h3>🎮 Each game</h3>${FZ.games.map(g => {
      const p = FZ.progress[g.id] || { stars: 0, plays: 0 };
      return `<div class="prow2"><span style="font-size:28px">${g.emoji}</span><span class="n">${g.name}</span><span>${'⭐'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</span><span class="muted">${p.plays}× played</span></div>`;
    }).join('')}</div>`;

  /* settings */
  const S = FZ.settings;
  $('#ptab-settings').innerHTML = `
    <div class="pcard"><h3>🔊 Sound & voice</h3>
      <div class="row"><label for="sSound">Sound effects</label><label class="switch"><input type="checkbox" id="sSound" ${S.sound ? 'checked' : ''}><span></span></label></div>
      <div class="row"><label for="sVoice">Read hints out loud (great for kids who can't read yet)</label><label class="switch"><input type="checkbox" id="sVoice" ${S.voice ? 'checked' : ''}><span></span></label></div>
    </div>
    <div class="pcard"><h3>⏰ Screen-time limit</h3>
      <div class="row"><label for="sLimit">Remind child to rest after</label>
        <select id="sLimit">${[[0, 'No limit'], [10, '10 minutes'], [15, '15 minutes'], [20, '20 minutes'], [30, '30 minutes'], [45, '45 minutes']].map(([v, t]) => `<option value="${v}" ${+S.limit === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <p class="muted">When time is up, FunZone shows a rest screen. Only a grown-up can unlock it with the PIN.</p>
    </div>
    <div class="pcard"><h3>🔐 Parent PIN</h3>
      <div class="row"><input id="sPin" type="password" inputmode="numeric" maxlength="4" placeholder="New 4-digit PIN"><button class="btn" id="sPinSave">Save PIN</button></div>
      <p class="muted" id="pinMsg"></p>
    </div>
    <div class="pcard"><h3>🧹 Data</h3>
      <div class="row"><label>Erase all stars and progress</label><button class="btn warn" id="sReset">Reset</button></div>
    </div>
    <div class="pcard"><h3>🔒 Privacy notice</h3>
      <ul style="padding-left:22px;display:grid;gap:6px;font-size:17px">
        <li><b>Nothing is collected.</b> FunZone has no accounts and never asks for your child's name, age, photo, voice or location.</li>
        <li><b>Everything stays on this device.</b> Stars, settings and your PIN (stored scrambled) are saved only in this browser. Nothing is uploaded or shared, and there are no ads or trackers.</li>
        <li><b>Read-aloud</b> uses your device's built-in voice. Some devices may process speech online, depending on the voice installed.</li>
        <li><b>Delete anytime:</b> use "Reset" above, or clear this site's data in your browser settings.</li>
      </ul>
    </div>`;
  $('#sSound').onchange = e => { S.sound = e.target.checked; FZ.saveSettings(); FZ.sfx('good'); };
  $('#sVoice').onchange = e => { S.voice = e.target.checked; FZ.saveSettings(); if (S.voice) FZ.say('Hello!'); };
  $('#sLimit').onchange = e => { S.limit = +e.target.value; FZ.saveSettings(); playedSec = 0; };
  $('#sPinSave').onclick = () => {
    const v = $('#sPin').value.trim();
    if (/^\d{4}$/.test(v)) { S.pinHash = FZ.hash(v); FZ.saveSettings(); $('#pinMsg').textContent = '✅ PIN saved!'; $('#sPin').value = ''; }
    else $('#pinMsg').textContent = '⚠️ Please enter exactly 4 digits.';
  };
  $('#sReset').onclick = () => { if (confirm('Erase all stars and progress?')) { FZ.progress = {}; FZ.saveProgress(); renderParent(); } };

  /* real-life guide */
  $('#ptab-guide').innerHTML = `<div class="pcard"><h3>📖 Play these games for real!</h3>
    <p class="muted" style="margin-bottom:8px">Tap a game to see how it is played in real life, what you need, and tips for playing with your child offline.</p>
    ${FZ.games.map(g => `<details><summary>${g.emoji} ${g.name} <span class="muted" style="font-weight:600">· ${g.players}</span></summary>
      <div class="tipbox">🧰 <b>You need:</b> ${g.props}</div>
      <b>🌳 In real life</b><ul>${g.real.map(t => `<li>${t}</li>`).join('')}</ul>
      <b>🎮 In FunZone</b><ul>${g.how.map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="tipbox">💡 <b>Parent tip:</b> ${g.tip}</div></details>`).join('')}</div>`;
}

/* ---------------- TIME LIMIT / REST ---------------- */
setInterval(() => {
  if (!CHILD_SCREENS.includes(FZ.screen) || resting) return;
  playedSec += 5;
  if (FZ.settings.limit > 0 && playedSec >= FZ.settings.limit * 60) {
    resting = true; destroyGame(); show('rest'); FZ.say('Time to rest! Ask a grown up.');
  }
}, 5000);
$('#btnUnlock').onclick = () => askPin(() => { resting = false; playedSec = 0; goHome(); }, 'Grown-up unlock');

/* ---------------- BOOT ---------------- */
renderCats(); renderHome(); show('home');
if ('speechSynthesis' in window) speechSynthesis.getVoices();