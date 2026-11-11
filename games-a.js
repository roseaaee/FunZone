'use strict';
/* =====================================================
   GAMES A – Habulan (tag & chase games)
   Patintero, Agawan Base, Langit-Lupa, Taguan,
   Araw-Lilim, Lawin at Sisiw, Kapitang Bakod
   ===================================================== */

/* ---------------- PATINTERO ---------------- */
FZ.reg({
  id: 'patintero', cat: 'tag', name: 'Patintero', emoji: '🏃', color: '#ff7aa2',
  tag: 'Cross the lines… and don\'t get tagged!',
  players: '6–10 kids (2 teams)', props: 'Chalk or a stick to draw lines on the ground',
  real: [
    'Two teams play on a grid drawn on the ground: several lines side by side, plus one long line down the middle.',
    'The <b>defenders</b> (taya) stand ON the lines and may only slide along their own line. The <b>head defender</b> (patotot) guards the long middle line.',
    'The <b>runners</b> try to cross every line, reach the end, and come all the way back without being touched.',
    'If a runner is tagged, the teams swap places. Every runner who comes back safely earns a point!'
  ],
  how: [
    'You are the runner 🧒. Use the arrows to move one square at a time.',
    'The red-shirt taggers slide left and right on their lines. The head defender (purple shirt) slides up and down the middle line.',
    'Run to the ⭐ side, then run back to 🏠. If you get tagged, you start again.'
  ],
  tip: 'Draw 3 lines about 3 big steps apart, and one long line down the middle. Let the child be a runner first, then a defender so they feel both roles.',
  start(api) {
    const R = 7, C = 7, lines = [1, 3, 5], mid = 3;
    const b = FZ.board(R, C, (r, c) => [lines.includes(r) ? 'line' : '', c === mid ? 'vline' : '', r === 0 ? 'goal' : '', r === R - 1 ? 'home' : ''].join(' '));
    api.stage.append(b.el);
    [0, 6].forEach(c => { b.cell(0, c).textContent = '⭐'; b.cell(R - 1, c).textContent = '🏠'; });
    const me = b.ent(FZ.me('stand'), R - 1, 3, 'me');
    const guards = lines.map((r, i) => ({ e: b.ent(FZ.rival('arms', i === 1 ? { girl: true, skin: '#dba574' } : i === 2 ? { skin: '#b97a4a' } : {}), r, i % 2 ? 0 : 6), dir: i % 2 ? 1 : -1, kind: 'h' }));
    guards.push({ e: b.ent(FZ.kid({ pose: 'arms', shirt: '#7048e8', shorts: '#212529', shoe: '#ffd43b' }), 2, mid, 'boss'), dir: 1, kind: 'v' });
    let phase = 'out', tags = 0;
    const hit = () => guards.some(g => g.e.r === me.r && g.e.c === me.c);
    function check() {
      if (hit()) { tags++; api.sfx('oops'); api.msg('Tagged! 😅 Back to start — try again!', true); me.set(R - 1, 3); phase = 'out'; return; }
      if (phase === 'out' && me.r === 0) { phase = 'back'; api.sfx('good'); api.msg('⭐ You crossed! Now run back home 🏠!', true); }
      else if (phase === 'back' && me.r === R - 1) api.finish(tags === 0 ? 3 : tags < 3 ? 2 : 1, 'You crossed every line and came back safely!');
    }
    api.stage.append(FZ.dpad(api, (dr, dc) => { me.set(clamp(me.r + dr, 0, R - 1), clamp(me.c + dc, 0, C - 1)); api.sfx('step'); check(); }));
    api.msg('Run to the ⭐ side! Dodge the taggers on the lines.', true);
    api.every(() => {
      guards.forEach(g => {
        const e = g.e;
        if (g.kind === 'h') { let n = e.c + g.dir; if (n < 0 || n >= C) { g.dir *= -1; n = e.c + g.dir; } e.set(e.r, n); }
        else { let n = e.r + g.dir; if (n < 1 || n > 5) { g.dir *= -1; n = e.r + g.dir; } e.set(n, e.c); }
      });
      check();
    }, FZ.lv(api.level, 760, 540, 380));
  }
});

/* ---------------- AGAWAN BASE ---------------- */
FZ.reg({
  id: 'agawan', cat: 'tag', name: 'Agawan Base', emoji: '🚩', color: '#ff6b6b',
  tag: 'Capture the other team\'s base!',
  players: '8–16 kids (2 teams)', props: 'Two "bases" (trees, poles or chalk circles) far apart',
  real: [
    'Two teams, each with a <b>base</b>. The bases are far from each other, with a middle line between the teams\' areas.',
    'Players run out to tag opponents. The player who left base <b>later</b> can tag the one who left earlier.',
    'A tagged player goes to <b>jail</b> next to the enemy base. A teammate can free them by touching them without getting tagged.',
    'Win by touching the enemy base, or by jailing every opponent.'
  ],
  how: [
    'You are the runner in the orange shirt. Use the arrows to run toward the red base 🚩 on the right side.',
    'The kids in red shirts chase you ONLY on their side (the red half).',
    'If you get caught you go to jail 🔒. Tap "Call a friend" and your teammate will run over to free you!'
  ],
  tip: 'Use trees or two buckets as bases. Younger kids can play without the "who left later" rule; just tag and jail.',
  start(api) {
    const R = 7, C = 9;
    const b = FZ.board(R, C, (r, c) => c < 4 ? 'blueSide' : c > 4 ? 'redSide' : 'midline');
    api.stage.append(b.el);
    for (let r = 2; r <= 4; r++) { b.cell(r, 0).classList.add('baseB'); b.cell(r, C - 1).classList.add('baseR'); }
    b.cell(3, 0).textContent = '🏠'; b.cell(3, C - 1).textContent = '🚩';
    b.cell(0, C - 1).textContent = '🔒'; b.cell(0, C - 1).classList.add('jail');
    const me = b.ent(FZ.me('run'), 3, 1, 'me');
    const gs = [b.ent(FZ.rival('arms'), 1, 6), b.ent(FZ.rival('arms', { girl: true, skin: '#dba574' }), 5, 6)];
    let jailed = false, caught = 0;
    const actions = h('<div class="actions"></div>');
    function check() {
      if (jailed) return;
      if (me.c >= 4 && gs.some(g => g.r === me.r && g.c === me.c)) { jail(); return; }
      if (me.r === 3 && me.c === C - 1) api.finish(caught === 0 ? 3 : caught === 1 ? 2 : 1, 'You captured the red base! 🚩');
    }
    function jail() {
      caught++; jailed = true; api.sfx('oops'); me.set(0, C - 1); me.el.classList.add('jailed');
      api.msg('Oh no, you\'re in jail! 🔒 Call a friend to free you!', true);
      const btn = h('<button class="btn big">🙋 Call a friend!</button>');
      btn.onclick = () => { btn.remove(); rescue(); }; actions.append(btn);
    }
    function rescue() {
      const f = b.ent(FZ.pal(0, 'run'), 0, 0, 'friend'); api.msg('Your friend is running to rescue you! 🏃', true);
      let c = 0;
      const id = api.every(() => {
        c++; f.set(0, c); api.sfx('step');
        if (c >= C - 1) {
          api.stopEvery(id);
          api.later(() => { f.el.remove(); jailed = false; me.el.classList.remove('jailed'); me.set(0, C - 3); api.sfx('good'); api.msg('You\'re free! Run to the 🚩 flag!', true); }, 400);
        }
      }, 280);
    }
    api.stage.append(FZ.dpad(api, (dr, dc) => { if (jailed) return; me.set(clamp(me.r + dr, 0, R - 1), clamp(me.c + dc, 0, C - 1)); api.sfx('step'); check(); }));
    api.stage.append(actions);
    api.msg('Run to the red 🚩 flag! Watch out for the red team.', true);
    api.every(() => {
      if (jailed) return;
      gs.forEach((g, i) => {
        if (Math.random() < .25) return;
        const tgt = me.c >= 4 ? me : { r: i ? 5 : 1, c: 6 };
        const p = stepToward(g, tgt, R, C, (r, c) => c < 4);
        if (p) g.set(p.r, p.c);
      });
      check();
    }, FZ.lv(api.level, 820, 640, 460));
  }
});

/* ---------------- shared chase engine (Langit-Lupa, Araw-Lilim, Kapitang Bakod) ---------------- */
function chase(api, cfg) {
  const R = cfg.R, C = cfg.C, st = {};
  const b = FZ.board(R, C, () => 'grass');
  api.stage.append(b.el);
  cfg.build(b, st, api);
  const blocked = (r, c) => cfg.blocked ? cfg.blocked(r, c, st) : false;
  const safe = (r, c) => cfg.safe(r, c, st);
  const me = b.ent(FZ.me('stand'), R - 1, 0, 'me');
  const it = b.ent(cfg.itEmoji, 0, C - 1, 'it');
  let mode = 'run', caught = 0, got = 0, itTicks = 0;
  /* stars to collect on the ground */
  const spots = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!blocked(r, c) && Math.abs(r - (R - 1)) + c > 3 && Math.abs(r) + Math.abs(c - (C - 1)) > 2) spots.push({ r, c });
  let stars = shuffle(spots).slice(0, 3).map(p => b.ent('⭐', p.r, p.c, 'star'));
  const refresh = () => { me.el.classList.toggle('safe', mode === 'run' && safe(me.r, me.c)); me.el.classList.toggle('taya', mode === 'it'); };
  function check() {
    if (mode === 'run') {
      if (it.r === me.r && it.c === me.c && !safe(me.r, me.c)) {
        caught++; mode = 'it'; itTicks = 0; it.say(cfg.friendEmoji || FZ.pal(1)); api.sfx('oops'); api.msg(cfg.caughtMsg, true);
      }
    } else if (it.r === me.r && it.c === me.c) {
      mode = 'run'; it.say(cfg.itEmoji); it.set(0, C - 1); api.sfx('pop'); api.msg('Tag! They\'re "It" again. Collect the ⭐ stars!', true);
    }
    stars = stars.filter(s => { if (s.r === me.r && s.c === me.c) { s.el.remove(); got++; api.sfx('good'); return false; } return true; });
    refresh();
    if (got >= 3) api.finish(caught === 0 ? 3 : caught === 1 ? 2 : 1, cfg.winMsg);
  }
  api.stage.append(FZ.dpad(api, (dr, dc) => {
    const nr = clamp(me.r + dr, 0, R - 1), nc = clamp(me.c + dc, 0, C - 1);
    if (blocked(nr, nc)) { api.sfx('oops'); return; }
    me.set(nr, nc); api.sfx('step'); check();
  }));
  api.msg(cfg.startMsg, true);
  api.every(() => {
    itTicks++;
    if (mode === 'run') {
      const p = (Math.random() < .2) ? stepToward(it, { r: rnd(0, R - 1), c: rnd(0, C - 1) }, R, C, blocked) : stepToward(it, me, R, C, blocked);
      if (p) it.set(p.r, p.c);
    } else {
      if (Math.random() < .55) { const p = stepToward(it, me, R, C, blocked, true); if (p) it.set(p.r, p.c); }
      if (itTicks > 22) { mode = 'run'; it.say(cfg.itEmoji); it.set(0, C - 1); api.msg('Your friend got tired. Back to collecting ⭐!', true); }
    }
    check();
  }, FZ.lv(api.level, 820, 650, 470));
  if (cfg.shift) api.every(() => { cfg.shift(b, st, api); check(); }, cfg.shiftMs);
  refresh();
}

/* ---------------- LANGIT-LUPA ---------------- */
FZ.reg({
  id: 'langit', cat: 'tag', name: 'Langit-Lupa', emoji: '☁️', color: '#4dabf7',
  tag: 'Stay up high where "It" can\'t tag you!',
  players: '4–12 kids', props: 'Steps, rocks, a bench, or anything raised off the ground',
  real: [
    'One player is <b>Taya</b> ("It"). Everyone else stays near raised spots like steps, stones or a bench.',
    '<b>Langit</b> means "heaven" — standing on something raised keeps you safe. <b>Lupa</b> means "earth" — the ground.',
    'Players keep switching spots, and Taya chases anyone standing on the ground.',
    'If you are tagged on the ground, <b>you</b> become the next Taya!'
  ],
  how: [
    'Move with the arrows. Brown 🪨 blocks are <b>Langit</b> — you are safe there (you will see ✅).',
    'Collect 3 ⭐ stars that sit on the ground. Taya (the kid in the red shirt) is "It" and chases you on the lupa!',
    'If you get tagged, now YOU are It! Chase your friend to tag them back.'
  ],
  tip: 'Safe spots must be a little raised. Add a rule that you can only stay on langit while counting to 5 so everyone keeps moving!',
  start(api) {
    const plat = new Set(['1,1', '1,2', '3,4', '3,5', '5,1', '5,6', '2,7', '4,3']);
    chase(api, {
      R: 7, C: 9, itEmoji: FZ.rival('run'), friendEmoji: FZ.pal(1, 'run'),
      build(b) { plat.forEach(k => { const [r, c] = k.split(',').map(Number); const cell = b.cell(r, c); cell.classList.add('raised'); cell.textContent = '🪨'; }); },
      safe: (r, c) => plat.has(r + ',' + c),
      startMsg: 'Stand on 🪨 (langit) to be safe. Collect 3 ⭐ from the ground!',
      caughtMsg: 'Tagged on the lupa! Now YOU are It — tag your friend!',
      winMsg: 'You collected all the stars on the lupa!'
    });
  }
});

/* ---------------- TAGUAN ---------------- */
FZ.reg({
  id: 'taguan', cat: 'tag', name: 'Taguan', emoji: '🙈', color: '#845ef7',
  tag: 'Hide-and-seek, Filipino style!',
  players: '3 or more kids', props: 'A "base" (tree or wall) and good hiding places',
  real: [
    'One player is the <b>Taya</b> (seeker). They cover their eyes at the <b>base</b> and count out loud — "Isa, dalawa, tatlo…"',
    'Everyone else runs to hide. It is often played at dusk or under a bright moon, with a little chant: "Tagu-taguan, maliwanag ang buwan…"',
    'When the count is done, Taya shouts that they are coming and searches.',
    'When Taya finds someone, they race back and shout <b>"Pung!"</b> with the hider\'s name while touching the base. If a hider reaches the base first, they are safe!'
  ],
  how: [
    'Watch the counting: one… to ten! You are the seeker.',
    'Pick a place: village, forest, playground, school or beach. 3 friends are hiding there. Tap a hiding place to look.',
    'When you find a friend, tap the big <b>PUNG!</b> button to catch them.'
  ],
  tip: 'Agree on boundaries before playing. For tiny kids, hide in plain sight and count only to 10 so it stays exciting, not scary.',
  start(api) {
    const L2 = (en, tl) => FZ.lang === 'tl' ? tl : en;
    /* each place: hiding spots as [emoji, x%, feet-y%, size], decoration, and the base (where the seeker counts) */
    const PLACES = [
      { id: 'village', icon: '🏘️', name: L2('Village', 'Baryo'),
        deco: [['☁️', 18, 16, 12], ['☁️', 66, 11, 10], ['🌞', 91, 12, 9]],
        spots: [['🛖', 20, 52, 18], ['🌴', 85, 50, 18], ['🏠', 70, 61, 16], ['🛺', 50, 71, 12], ['🪵', 33, 67, 9], ['🧺', 91, 79, 9], ['🪣', 26, 81, 8], ['🌳', 47, 51, 16]] },
      { id: 'forest', icon: '🌲', name: L2('Forest', 'Gubat'),
        deco: [['🐦', 52, 14, 6], ['☁️', 80, 10, 9]],
        spots: [['🌳', 14, 57, 20], ['🌲', 38, 53, 19], ['🌲', 70, 55, 19], ['🪨', 23, 81, 10], ['🪵', 56, 82, 11], ['🌿', 86, 82, 11], ['⛺', 60, 68, 14], ['🌳', 91, 53, 19]] },
      { id: 'playground', icon: '🛝', name: L2('Playground', 'Palaruan'),
        deco: [['☁️', 30, 12, 11], ['☁️', 74, 16, 9], ['🌞', 92, 10, 9]],
        spots: [['🛝', 18, 56, 20], ['🎠', 72, 58, 17], ['🌳', 91, 52, 18], ['🪑', 45, 72, 10], ['🛖', 34, 81, 12], ['🚲', 62, 89, 9], ['🏖️', 84, 85, 12], ['🌳', 8, 50, 17]] },
      { id: 'school', icon: '🏫', name: L2('School', 'Paaralan'),
        deco: [['☁️', 62, 12, 11], ['🌞', 92, 11, 9]],
        spots: [['🏫', 24, 52, 26], ['🚌', 76, 63, 19], ['🌳', 92, 52, 17], ['🪑', 46, 75, 10], ['🥅', 58, 50, 12], ['🚲', 12, 80, 10], ['🗑️', 34, 91, 8], ['⛲', 50, 64, 12]] },
      { id: 'beach', icon: '🏖️', name: L2('Beach', 'Dalampasigan'),
        deco: [['🌞', 90, 10, 10], ['☁️', 25, 13, 11], ['⛵', 60, 36, 7]],
        spots: [['🏖️', 20, 60, 18], ['🌴', 86, 54, 19], ['🛶', 58, 64, 15], ['🪨', 38, 78, 10], ['🏰', 72, 85, 14], ['🪣', 90, 90, 8], ['🌴', 8, 68, 16], ['🛟', 46, 91, 8]] }
    ];
    const words = FZ.lang === 'tl' ? ['Isa', 'Dalawa', 'Tatlo', 'Apat', 'Lima', 'Anim', 'Pito', 'Walo', 'Siyam', 'Sampu'] : ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

    /* step 1: choose where to play */
    const chooser = h(`<div class="placepick"><h3>${L2('Where shall we play?', 'Saan tayo maglalaro?')}</h3><div class="placegrid"></div></div>`);
    PLACES.forEach(p => {
      const b = h(`<button type="button" class="placecard pl-${p.id}"><span class="pe">${p.icon}</span><span class="pn">${p.name}</span></button>`);
      b.onclick = () => { api.sfx('good'); chooser.remove(); play(p); };
      $('.placegrid', chooser).append(b);
    });
    api.stage.append(chooser);
    api.msg(L2('Pick a place to play hide-and-seek!', 'Pumili ng lugar para maglaro ng taguan!'), true);

    /* step 2: count, then look for friends in the real-looking place */
    function play(P) {
      const nHide = FZ.lv(api.level, 2, 3, 4);            // how many friends to find: 2, 3 or 4
      const kids = shuffle([FZ.pal(0, 'stand'), FZ.pal(1, 'stand'), FZ.pal(2, 'stand'), FZ.pal(3, 'stand')]).slice(0, nHide);
      const hide = shuffle(P.spots.map((_, i) => i)).slice(0, nHide);
      const w = h(`<div class="taguan"><div class="countbox"><div class="countnum">🙈</div><div class="countword">Eyes closed…</div></div>
        <div class="tgscene tg-${P.id}" role="group" aria-label="${P.name}">
          ${P.deco.map(([e, x, y, s]) => `<span class="tgdeco" style="left:${x}%;top:${y}%;font-size:${s}cqw">${e}</span>`).join('')}
          <div class="tgbase" style="left:11%;top:96%;font-size:10cqw">🚩<small>${L2('Base', 'Base')}</small></div>
          <div class="tgme" style="left:25%;top:96%">${FZ.me('arms')}</div>
        </div><button type="button" class="btn pung" disabled>🏁 PUNG!</button></div>`);
      api.stage.append(w);
      const scene = $('.tgscene', w), num = $('.countnum', w), word = $('.countword', w), pung = $('.pung', w), base = $('.tgbase', w), me = $('.tgme', w);
      let ready = false, pending = null, found = 0, taps = 0;
      P.spots.forEach(([e, x, y, s], i) => {
        const sp = h(`<button type="button" class="tgspot" aria-label="${L2('hiding place', 'taguan')}" style="left:${x}%;top:${y}%;font-size:${s}cqw;z-index:${Math.round(y)}">${e}</button>`);
        sp.onclick = () => {
          if (!ready || pending || sp.dataset.done) return;
          sp.dataset.done = 1; taps++;
          const k = hide.indexOf(i);
          if (k >= 0) {
            sp.classList.add('found'); sp.insertAdjacentHTML('beforeend', `<span class="who">${kids[k]}</span><span class="tick">👀</span>`);
            pending = sp; pung.disabled = false; pung.classList.add('pulse'); base.classList.add('pulse'); api.sfx('good');
            api.msg('Found you! 👀 Quick — tap PUNG!', true);
          } else { sp.classList.add('empty'); sp.insertAdjacentHTML('beforeend', '<span class="puff">💨</span>'); api.sfx('pop'); api.msg('Nobody here! Try another spot.'); }
        };
        scene.append(sp);
      });
      api.on(window, 'keydown', e => { if ((e.key === 'Enter' || e.code === 'Space') && !pung.disabled) { e.preventDefault(); pung.click(); } });
      pung.onclick = () => {
        if (!pending) return;
        pending.insertAdjacentHTML('beforeend', '<span class="tick ok">✅</span>'); pending.querySelector('.tick:not(.ok)')?.remove(); pending = null;
        pung.disabled = true; pung.classList.remove('pulse'); base.classList.remove('pulse'); found++; api.sfx('good');
        if (found >= nHide) api.finish(taps <= 5 ? 3 : taps <= 7 ? 2 : 1, 'You found all your friends! Pung! Pung! Pung!');
        else api.msg('Pung! ✅ ' + (nHide - found) + ' more to find…', true);
      };
      api.msg('Close your eyes and count with me!', true);
      let i = 0;
      api.every(() => {
        if (i < 10) { num.textContent = i + 1; word.textContent = words[i]; FZ.say(words[i], false); api.sfx('pop'); i++; }
        else if (i === 10) { i++; num.textContent = '🔦'; word.textContent = 'Here I come!'; ready = true; me.innerHTML = FZ.me('stand'); api.msg('Ready or not, here I come! Tap a place to look. 🔍', true); }
      }, FZ.lv(api.level, 1000, 850, 650));
    }
  }
});

/* ---------------- ARAW-LILIM ---------------- */
FZ.reg({
  id: 'araw', cat: 'tag', name: 'Araw-Lilim', emoji: '🌞', color: '#fab005',
  tag: 'Hide in the shade — stay out of the sun!',
  players: '4–12 kids', props: 'A sunny yard with shady spots under trees or walls',
  real: [
    'One player is <b>Taya</b>. Everyone else tries to stay in the <b>lilim</b> (shade), where they cannot be tagged.',
    'Anyone standing in the <b>araw</b> (bright sunshine) can be tagged.',
    'The sun moves across the sky, so the shadows move too — players must keep finding new shade!',
    'A tagged player becomes the new Taya.'
  ],
  how: [
    'Dark green squares are <b>shade</b> (lilim). Stand there to be safe ✅.',
    'Watch the ☀️ bar: when the sun moves, the shadows move too!',
    'Collect 3 ⭐ stars in the sunshine. Taya (the kid in the red shirt) is It. If tagged, you chase your friend!'
  ],
  tip: 'Play on a sunny morning or afternoon. Ask your child where the shadow will be in a few minutes — a fun way to learn about the sun!',
  start(api) {
    const trees = [[1, 1], [3, 5], [5, 2], [2, 7]];
    const calc = st => {
      st.shade = new Set();
      trees.forEach(([r, c]) => { for (let k = 0; k <= 2; k++) st.shade.add(r + ',' + (c + k * st.d)); st.shade.add((r + 1) + ',' + (c + st.d)); st.shade.add((r + 1) + ',' + c); });
    };
    const draw = (b, st) => {
      b.cells.forEach(c => c.classList.remove('shade', 'sunny'));
      for (let r = 0; r < b.R; r++) for (let c = 0; c < b.C; c++) b.cell(r, c).classList.add(st.shade.has(r + ',' + c) ? 'shade' : 'sunny');
      const s = $('.sun', api.stage); if (s) s.style.left = (st.d > 0 ? '6%' : '84%');
    };
    chase(api, {
      R: 7, C: 9, itEmoji: FZ.rival('run'), friendEmoji: FZ.pal(1, 'run'), shiftMs: FZ.lv(api.level, 12000, 9000, 6500),
      build(b, st) {
        st.d = 1; calc(st);
        trees.forEach(([r, c]) => b.cell(r, c).textContent = '🌳');
        api.stage.prepend(h('<div class="sunbar"><span class="sun">☀️</span></div>'));
        draw(b, st);
      },
      shift(b, st) { st.d *= -1; calc(st); draw(b, st); api.sfx('pop'); api.msg('☀️ The sun moved! The shadows moved too!', true); },
      safe: (r, c, st) => st.shade.has(r + ',' + c),
      startMsg: 'Dark green = shade (safe). Collect 3 ⭐ — and watch the ☀️!',
      caughtMsg: 'Tagged in the sunshine! Now YOU are It — tag your friend!',
      winMsg: 'You played tag in the sun and the shade!'
    });
  }
});

/* ---------------- LAWIN AT SISIW ---------------- */
FZ.reg({
  id: 'lawin', cat: 'tag', name: 'Lawin at Sisiw', emoji: '🦅', color: '#f59f0b',
  tag: 'Mother Hen protects her chicks from the Hawk!',
  players: '5–10 kids', props: 'Open space',
  real: [
    'One player is the <b>Lawin</b> (hawk), one is the <b>Inahin</b> (mother hen), and everyone else is a <b>Sisiw</b> (chick).',
    'The chicks line up behind the hen, each holding the waist of the one in front.',
    'The hawk asks the hen for a chick. The hen says no, and the hawk tries to touch the <b>last chick</b> in line.',
    'The hen spreads her arms and moves left and right to block the hawk. Chicks sway along with her. A tagged chick joins the hawk!'
  ],
  how: [
    'You are the Mother Hen. Your 3 chicks follow in a line right behind you, holding on.',
    'The hawk (brown shirt) runs across the top and then DIVES down a column.',
    'Move left and right to be under the hawk — if you block it, the chicks are safe! Block 5 dives on level 1, 7 on level 2 and 9 on level 3.'
  ],
  tip: 'Chicks hold on firmly (but gently!) and the hen should mirror the hawk. Start slow so little ones can follow along.',
  start(api) {
    const R = 8, C = 7;
    const b = FZ.board(R, C, r => r <= 1 ? 'sky' : 'grass');
    api.stage.append(b.el);
    const hen = b.ent(FZ.me('arms'), 4, 3, 'hen');
    const chicks = [5, 6, 7].map((r, i) => b.ent(FZ.pal(i + 1, 'stand'), r, 3, 'chick'));
    const hawk = b.ent(FZ.kid({ pose: 'arms', shirt: '#b5651d', shorts: '#4a2f12', skin: '#c58a55', deco: 'stripe' }), 0, 3, 'hawk');
    const warn = b.ent('⚠️', 3, 3); warn.el.style.opacity = 0;
    let dives = 0, busy = false;
    const moveHen = c => { c = clamp(c, 0, C - 1); hen.set(4, c); chicks.forEach(k => k.set(k.r, c)); api.sfx('step'); };
    api.stage.append(FZ.dpad(api, (dr, dc) => moveHen(hen.c + dc), true));
    api.on(b.el, 'pointerdown', e => { const rect = b.el.getBoundingClientRect(); moveHen(Math.floor((e.clientX - rect.left) / rect.width * C)); });
    b.el.style.touchAction = 'none';
    b.el.querySelectorAll('.ent').forEach(x => x.style.pointerEvents = 'none');
    api.msg('Stay under the hawk to protect your chicks!', true);
    async function round() {
      if (dives >= FZ.lv(api.level, 5, 7, 9)) return end();
      let nc; do { nc = rnd(0, C - 1); } while (nc === hawk.c);
      hawk.set(1, nc); await api.sleep(FZ.lv(api.level, 1400, 1100, 850));
      warn.set(3, nc); warn.el.style.opacity = 1; api.sfx('pop'); await api.sleep(800);
      warn.el.style.opacity = 0; dives++;
      if (hen.c === hawk.c) { hawk.set(3, hawk.c); api.sfx('good'); api.msg('Blocked! Good job, Inahin!'); }
      else if (chicks.length) { const k = chicks[chicks.length - 1]; hawk.set(k.r, hawk.c); await api.sleep(250); chicks.pop().el.remove(); api.sfx('oops'); api.msg('Oh no! The hawk tagged a chick. Stay closer!', true); }
      await api.sleep(700); hawk.set(1, hawk.c); await api.sleep(300);
      round();
    }
    function end() { api.finish(Math.max(1, chicks.length), chicks.length ? `You kept ${chicks.length} chick${chicks.length > 1 ? 's' : ''} safe!` : 'Nice try, Inahin! Play again to save them all.'); }
    round();
  }
});

/* ---------------- KAPITANG BAKOD ---------------- */
FZ.reg({
  id: 'bakod', cat: 'tag', name: 'Kapitang Bakod', emoji: '🚧', color: '#a9744f',
  tag: 'Touch the fence and you\'re safe!',
  players: '4–10 kids', props: 'A fence, post, wall or tree',
  real: [
    'One player is <b>Taya</b>. Everyone else runs around the yard.',
    '<b>Kapit</b> means "hold" and <b>bakod</b> means "fence". As long as you are touching a fence, post or wall, you are safe.',
    'You cannot stay on the same fence forever — Taya counts, and you must run to another one!',
    'If Taya tags you while you are not touching anything, you become the next Taya.'
  ],
  how: [
    'The 🪵 logs are the fence. Yellow squares touch the fence — you are safe there ✅.',
    'Collect 3 ⭐ stars away from the fence. Taya (the kid in the red shirt) is It!',
    'If you get tagged, you are It — tag your friend!'
  ],
  tip: 'Pick a few different fences or posts so children keep moving between them. Make a rule: only 5 seconds on one fence!',
  start(api) {
    const fence = new Set(['1,4', '2,4', '3,4', '4,4', '5,4', '2,1', '4,7']);
    const near = (r, c) => { for (const k of fence) { const [fr, fc] = k.split(',').map(Number); if (Math.abs(fr - r) <= 1 && Math.abs(fc - c) <= 1) return true; } return false; };
    chase(api, {
      R: 7, C: 9, itEmoji: FZ.rival('run'), friendEmoji: FZ.pal(1, 'run'),
      build(b) {
        for (let r = 0; r < b.R; r++) for (let c = 0; c < b.C; c++) { const k = r + ',' + c; if (fence.has(k)) { b.cell(r, c).classList.add('fence'); b.cell(r, c).textContent = '🪵'; } else if (near(r, c)) b.cell(r, c).classList.add('touch'); }
      },
      blocked: (r, c) => fence.has(r + ',' + c),
      safe: (r, c) => near(r, c),
      startMsg: 'Yellow squares touch the fence — safe! Collect 3 ⭐.',
      caughtMsg: 'Tagged away from the fence! Now YOU are It — tag your friend!',
      winMsg: 'You are a fence-hugging champion!'
    });
  }
});
