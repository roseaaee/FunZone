'use strict';
/* =====================================================
   GAMES B – Talon (jumping) & race games
   Luksong Tinik, Luksong Baka, Chinese Garter, Piko,
   Kadang-Kadang, Tumbang Preso
   ===================================================== */

/* ---------- shared jump scene (Luksong Tinik / Luksong Baka) ---------- */
function jumpGame(api, cfg) {
  const scene = h(`<div class="jscene"><div class="jground"></div><div class="jobst"></div><div class="jumper">${FZ.me('stand')}</div><div class="jlabel"></div></div>`);
  const obst = $('.jobst', scene), jm = $('.jumper', scene), label = $('.jlabel', scene);
  const setPose = p => { jm.innerHTML = FZ.me(p); };
  api.stage.append(scene);
  const ctl = h(`<div class="jctl"><div class="meter"><div class="mfill"></div><div class="mreq"></div><div class="mmark"></div></div><button class="btn big jbtn">${cfg.mode === 'hold' ? '🦘 Hold… then let go!' : '🦘 Talon!'}</button></div>`);
  api.stage.append(ctl);
  const MAXJ = 0.7, fill = $('.mfill', ctl), mark = $('.mmark', ctl), reqEl = $('.mreq', ctl), btn = $('.jbtn', ctl);
  const lv = Math.min(cfg.levels.length - 1, Math.floor(api.level * cfg.levels.length / 30));   // the thorn/cow gets taller every few levels
  const BAND = api.lv(1, 0.45, 0.22, 0.12);       // later levels: too strong a jump fails too, so aim for the green zone
  let fails = 0, busy = false, val = 0, dir = 1, holding = false, hold0 = 0, clears = 0;
  /* GOAL: clear the height 1, 2 or 3 times in a row (more every 10 levels) before your hearts run out */
  const CLEARS = 1 + Math.floor(api.level / 10), HEARTS = Math.round(api.lv(4, 3, 3, 2));
  const needed = () => cfg.levels[lv].need !== undefined ? cfg.levels[lv].need : (cfg.levels[lv].h + 0.07) / MAXJ;
  function showLevel() {
    cfg.draw(obst, cfg.levels[lv], scene);
    label.textContent = cfg.levels[lv].name;
    const N2 = cfg.names && cfg.names[lv], nm = N2 ? (FZ.lang === 'tl' ? N2.tl : N2.en).toLowerCase() : '';     // e.g. "knee" / "tuhod" 
    api.goal({ en: `Jump over the ${cfg.what || 'obstacle'}${nm ? ` (${nm})` : ''}${CLEARS > 1 ? ` ${CLEARS} times` : ''}`, tl: `Lundagan ang ${cfg.whatTl || 'harang'}${nm ? ` (${nm})` : ''}${CLEARS > 1 ? ` nang ${CLEARS} beses` : ''}`, hearts: HEARTS });
    api.progress(`🦘 ${clears} / ${CLEARS}`);
    reqEl.style.left = (needed() * 100) + '%'; reqEl.style.width = (Math.min(BAND, 1 - needed()) * 100) + '%';
    api.msg(cfg.levelMsg, true);
  }
  function attempt(power) {
    if (busy) return; busy = true;
    const ok = power >= needed() && power <= needed() + BAND;
    const W = scene.clientWidth, Hh = scene.clientHeight, xt = W * 0.2, xe = W * 0.78;
    jm.getAnimations().forEach(a => a.cancel());
    api.sfx('jump'); setPose('run');
    const run = jm.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${xt}px,0)` }], { duration: 350, fill: 'forwards', easing: 'ease-in' });
    run.onfinish = () => {
      const endX = ok ? xe : W * 0.37, hh = ok ? power * MAXJ * Hh : Math.min(power * MAXJ * Hh, cfg.levels[lv].h * Hh * 0.85);
      const fr = []; for (let i = 0; i <= 20; i++) { const t = i / 20; fr.push({ transform: `translate(${xt + (endX - xt) * t}px,${-4 * hh * t * (1 - t)}px)` }); }
      setPose('jump');
      const j = jm.animate(fr, { duration: ok ? 850 : 600, fill: 'forwards' });
      j.onfinish = () => {
        if (api.dead) return; setPose('stand');
        if (ok) {
          api.sfx('good'); api.msg('Wow! You jumped over it! 🎉', true); clears++; api.progress(`🦘 ${clears} / ${CLEARS}`);
          if (clears >= CLEARS) api.later(() => api.finish(api.heartStars(), api.level === 29 ? cfg.winMsg : 'You cleared this height! 🎉'), 900);
          else api.later(() => { jm.getAnimations().forEach(a => a.cancel()); busy = false; api.msg(FZ.lang === 'tl' ? `Ulit! ${CLEARS - clears} pa.` : `Again! ${CLEARS - clears} more.`, true); }, 1000);
        } else {
          api.sfx('oops'); jm.classList.add('oops'); api.msg(power > needed() + BAND ? 'Too strong! Stop in the green zone. 🟩' : cfg.failMsg, true); fails++;
          if (!api.loseHeart()) { return api.later(() => api.fail(FZ.lang === 'tl' ? 'Naubos ang puso. Bantayan ang bar at bitawan sa berde!' : 'Out of hearts. Watch the bar and stop it in the green!'), 900); }
          api.later(() => { jm.classList.remove('oops'); jm.getAnimations().forEach(a => a.cancel()); busy = false; }, 1100);
        }
      };
    };
  }
  if (cfg.mode === 'hold') {
    btn.addEventListener('pointerdown', e => { e.preventDefault(); if (busy) return; holding = true; hold0 = performance.now(); });
    api.on(window, 'pointerup', () => { if (holding) { holding = false; const p = val; val = 0; attempt(p); } });
    api.on(window, 'keydown', e => { if (e.code === 'Space' && !holding && !busy) { holding = true; hold0 = performance.now(); } });
    api.on(window, 'keyup', e => { if (e.code === 'Space' && holding) { holding = false; const p = val; val = 0; attempt(p); } });
  } else {
    btn.addEventListener('pointerdown', e => { e.preventDefault(); attempt(val); });
    api.on(window, 'keydown', e => { if (e.code === 'Space') attempt(val); });
  }
  api.frame(dt => {
    if (busy) return;
    if (cfg.mode === 'hold') val = holding ? Math.min(1, (performance.now() - hold0) / api.lv(1500, 1150, 900)) : 0;
    else { val += dir * dt * api.lv(0.7, 1.1, 1.5, 1.9); if (val >= 1) { val = 1; dir = -1; } if (val <= 0) { val = 0; dir = 1; } }
    fill.style.width = (val * 100) + '%'; mark.style.left = (val * 100) + '%';
  });
  showLevel();
}

/* ---------------- LUKSONG TINIK ---------------- */
FZ.reg({
  id: 'tinik', cat: 'jump', name: 'Luksong Tinik', emoji: '🌵', color: '#51cf66',
  levels: [{ en: 'Feet', tl: 'Paa' }, { en: '1 hand', tl: 'Isang kamay' }, { en: '2 hands', tl: 'Dalawang kamay' }, { en: '3 hands', tl: 'Tatlong kamay' }, { en: '4 hands', tl: 'Apat na kamay' }],
  tag: 'Jump over the "thorns" of stacked hands!',
  players: '3 or more kids', props: 'Just your hands and feet!',
  real: [
    'Two players sit on the ground facing each other, with the soles of their feet touching. This is the first "tinik" (thorn).',
    'They stack their hands, one above the other, to make the thorn taller and taller — each level is a <b>dangkal</b> (hand-span) higher.',
    'The other players take turns running and jumping over the thorn <b>without touching it</b>.',
    'If you touch it, you take the place of a sitter!'
  ],
  how: [
    'Watch the 🔴 marker slide back and forth on the bar.',
    'Tap <b>Talon!</b> when the marker is past the green ✅ line — that is high enough!',
    'Each level the thorn gets taller 🦶✋✋. Clear 5 levels!'
  ],
  tip: 'Start with just feet, then add one hand at a time. Always cushion the sitters\' hands: gentle jumps only, and a soft grassy spot is best.',
  start(api) {
    const names = ['Paa (feet)', 'Isang kamay (1 hand)', 'Dalawang kamay (2 hands)', 'Tatlong kamay (3 hands)', 'Apat na kamay (4 hands)'];
    jumpGame(api, {
      names: this.levels,
      mode: 'meter',
      levels: [1, 2, 3, 4, 5].map((p, i) => ({ p, h: FZ.TINIK_U[i] / 112 * 0.4, need: 0.3 + 0.12 * i, name: names[i] })),
      draw(el, L, scene) {                       // the two friends sit; the pile of feet and hands comes from THEIR arms and legs
        const u = scene.clientHeight * 0.4 / 112;
        el.innerHTML = `<div class="fig" style="height:${63 * u}px">${FZ.tinikFig(L.p)}</div>`;
      },
      what: 'thorn', whatTl: 'tinik',
      levelMsg: 'Tap Talon! when the marker is past the green line.',
      failMsg: 'Oops! You touched the tinik. Try again! 🌵',
      winMsg: 'You jumped over every tinik without touching it!'
    });
  }
});

/* ---------------- LUKSONG BAKA ---------------- */
FZ.reg({
  id: 'baka', cat: 'jump', name: 'Luksong Baka', emoji: '🐄', color: '#f783ac',
  levels: [{ en: 'Hands on ground', tl: 'Kamay sa lupa' }, { en: 'Hands on feet', tl: 'Kamay sa paa' }, { en: 'Hands on knees', tl: 'Kamay sa tuhod' }, { en: 'Hands on thighs', tl: 'Kamay sa hita' }],
  tag: 'Leap over the bending cow!',
  players: '3 or more kids', props: 'A soft, grassy space',
  real: [
    'One player is the <b>baka</b> (cow). At first they crouch low with hands on the ground and head tucked in.',
    'Other players run up and leap over the cow\'s back like leap-frog, without touching their head.',
    'After each round the baka rises higher: hands on the feet, then the knees, then the thighs.',
    'If someone touches the cow or falls, they become the next baka!'
  ],
  how: [
    'Press and HOLD the jump button — the bar fills up with power!',
    'Let go when the bar is past the green ✅ line so you leap high enough.',
    'Your bending friend gets taller each level. Clear all 4 levels!'
  ],
  tip: 'The cow should tuck their head in and keep their back flat. Teach kids to run first, then push off with both feet.',
  start(api) {
    const names = ['Kamay sa lupa (hands on ground)', 'Kamay sa paa (hands on feet)', 'Kamay sa tuhod (hands on knees)', 'Kamay sa hita (hands on thighs)'];
    jumpGame(api, {
      names: this.levels,
      mode: 'hold',
      levels: [1, 2, 3, 4].map((lvl, i) => ({ lvl, h: FZ.BAKA_U[i] / 112 * 0.4, need: 0.36 + 0.15 * i, name: names[i] })),
      draw(el, L, scene) {                       // a real kid bends: hands on the ground, then feet, knees, thighs
        const u = scene.clientHeight * 0.4 / 112;
        el.innerHTML = `<div class="fig" style="height:${80 * u}px;margin-bottom:${-4 * u}px">${FZ.bakaFig(L.lvl)}</div>`;
      },
      what: 'cow', whatTl: 'baka',
      levelMsg: 'Hold the button, let go past the green line!',
      failMsg: 'Oops! You bumped the baka. Hold a little longer! 🐄',
      winMsg: 'You leaped over the baka at every height!'
    });
  }
});

/* ---------------- CHINESE GARTER ---------------- */
FZ.reg({
  id: 'garter', cat: 'jump', name: 'Chinese Garter', emoji: '🎀', color: '#ff6b6b',
  levels: [{ en: 'Ankle', tl: 'Bukong-bukong' }, { en: 'Knee', tl: 'Tuhod' }, { en: 'Thigh', tl: 'Hita' }, { en: 'Waist', tl: 'Baywang' }, { en: 'Chest', tl: 'Dibdib' }, { en: 'Armpit', tl: 'Kili-kili' }, { en: 'Shoulder', tl: 'Balikat' }, { en: 'Neck', tl: 'Leeg' }, { en: 'Ear', tl: 'Tainga' }, { en: 'Head', tl: 'Ulo' }],
  tag: 'Run, jump and clear the stretchy garter!',
  players: '3 or more kids', props: 'A long elastic band (about 3–4 metres), tied in a loop',
  real: [
    'Two players stand apart and hold a long elastic band (the "garter") stretched between them.',
    'The jumper runs up and jumps over the garter <b>without getting caught on it</b>.',
    'After each round the garter goes higher: <b>ankle → knee → thigh → waist → chest → armpit → shoulder → neck → ear → head</b>!',
    'For the high levels, big kids kick one leg up to hook the garter down, then jump over. If you fail, you take a turn holding the garter.'
  ],
  how: [
    'Your two friends hold the garter. It starts at their ankles and goes higher every few levels.',
    'Press and HOLD the jump button to gather power, then let go when the bar is inside the green zone.',
    'Jump high enough to clear the garter — but not too wild, or you will trip on landing!'
  ],
  tip: 'Make a loop from rubber bands tied together, or buy a 3-metre elastic. Start at the ankles and only go higher when your child is ready. Jump on grass or a mat.',
  start(api) {
    const PARTS = [.06, .22, .33, .45, .57, .64, .70, .77, .86, .97];     // where on the holders' bodies the garter sits
    const names = this.levels.map(l => FZ.lang === 'tl' ? l.tl : `${l.en} (${l.tl.toLowerCase()})`);
    jumpGame(api, {
      names: this.levels,
      mode: 'hold',
      levels: PARTS.map((p, i) => ({ h: p * 0.4, name: '🎀 ' + names[i] })),         // the garter rises every 3 levels
      draw(el, L, scene) {
        const Hh = scene.clientHeight, W = scene.clientWidth, kh = Hh * .4, g0 = Hh * .16;
        const x1 = W * .4, x2 = W * .64, y = Hh - g0 - L.h * Hh;      // two friends stand apart; the garter stretches between them
        el.innerHTML = `<div class="kid" style="left:${x1 - kh * .5}px;bottom:${g0}px;height:${kh}px">${FZ.pal(1, 'stand')}</div>
          <div class="kid" style="left:${x2 - kh * .18}px;bottom:${g0}px;height:${kh}px">${FZ.pal(2, 'stand', { flip: true })}</div>
          <svg class="gband" width="${W}" height="${Hh}" style="position:absolute;left:0;top:0;pointer-events:none"><path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 3} ${x2} ${y}" fill="none" stroke="#ff6b6b" stroke-width="7" stroke-linecap="round"/><path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 3} ${x2} ${y}" fill="none" stroke="#ffd43b" stroke-width="3" stroke-dasharray="6 6"/></svg>`;
      },
      what: 'garter', whatTl: 'garter',
      levelMsg: 'Hold the button, let go in the green zone, and jump over the garter!',
      failMsg: 'Oops! Your foot caught the garter. Try again! 🎀',
      winMsg: 'You cleared every height of Chinese Garter!'
    });
  }
});

/* Piko's icon: a child hopping on one foot on the chalk boxes (built from our own kid drawing) */
const PIKO_ICON = (() => {
  const kid = FZ.kid({ pose: 'kick', skin: '#c58a55', hair: '#241713', hairStyle: 'pigtails', girl: true, top: 'tee', shirt: '#ff922b', bottom: 'shorts', shorts: '#845ef7', foot: 'tsinelas', shoe: '#ffd43b' })
    .replace(/<svg class="kidsvg"/, '<svg x="0" y="-6" width="64" height="66"');
  const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fff" stroke-width="1.8"/>`;
  return '<svg class="emsvg" viewBox="0 0 64 64" width="1em" height="1em" aria-hidden="true" style="vertical-align:-0.12em">'
    + '<rect x="2" y="40" width="60" height="23" rx="6" fill="#ced4da"/>'
    + box(23, 55, 18, 7) + box(14, 48, 18, 7) + box(32, 48, 18, 7) + box(23, 41, 18, 7)
    + '<ellipse cx="32" cy="53" rx="8" ry="2" fill="rgba(0,0,0,.2)"/>' + kid + '</svg>';
})();
/* ---------------- PIKO ---------------- */
FZ.reg({
  id: 'piko', cat: 'jump', name: 'Piko', emoji: PIKO_ICON, color: '#ff922b',
  tag: 'Filipino hopscotch — hop, hop, rest!',
  players: '2–6 kids', props: 'Chalk (or a stick) and a flat stone called the "maru"',
  real: [
    'Draw a big grid on the ground with numbered boxes and a half-circle at the end called <b>Langit</b> (heaven).',
    'Throw your flat stone (<b>maru</b>) into box number 1. Then hop through the boxes: <b>one foot</b> on single boxes and <b>two feet</b> on side-by-side boxes. Skip the box with the stone!',
    'At Langit you may rest on both feet and turn around. Hop back, bend down and pick up the stone.',
    'Then throw to box 2, and so on. Stepping on a line, or into the stone\'s box, ends your turn.'
  ],
  how: [
    'First TAP the glowing box to throw the 🪨 stone there.',
    'Then tap the glowing boxes in order to hop: one box = one foot 🦶, two side-by-side boxes = both feet 🦶🦶.',
    'Skip the stone box, rest in Langit 🌈, hop back, and tap the stone to pick it up!'
  ],
  tip: 'Draw a grid with chalk on the pavement. Little ones can use both feet on every box first, then learn the one-foot hops.',
  start(api) {
    const S = [[1], [2], [3, 4], [5], [6, 7], [8], ['L']];
    const board = h('<div class="piko"></div>');
    for (let i = S.length - 1; i >= 0; i--) {
      const row = h('<div class="prow"></div>');
      S[i].forEach(id => row.append(h(`<button class="sq ${id === 'L' ? 'langit' : ''}" data-id="${id}">${id === 'L' ? '🌈 Langit' : id}</button>`)));
      board.append(row);
    }
    board.append(h('<div class="pstart">🏁</div>'));
    api.stage.append(board);
    const sq = id => $(`.sq[data-id="${id}"]`, board);
    /* the player herself hops on the boxes: one foot on single boxes, two feet on side-by-side boxes */
    const kid = h(`<div class="pkid" aria-hidden="true"></div>`); board.append(kid);
    let kidAt = null;
    function hopTo(ids, pose) {
      const br = board.getBoundingClientRect();
      let x, y;
      if (!ids) { const st = $('.pstart', board).getBoundingClientRect(); x = st.left + st.width / 2 - br.left; y = st.bottom - br.top; }
      else { const rs = ids.map(id => sq(id).getBoundingClientRect()); x = rs.reduce((n, r) => n + r.left + r.width / 2, 0) / rs.length - br.left; y = rs[0].top + rs[0].height * .82 - br.top; }
      const hh = Math.min(140, Math.max(70, sq(1).getBoundingClientRect().height * 1.7));
      kid.style.height = hh + 'px'; kid.style.width = hh * .68 + 'px';
      const go = () => { kid.style.left = (x - hh * .34) + 'px'; kid.style.top = (y - hh) + 'px'; };
      if (kidAt === null) { kid.innerHTML = FZ.me(pose || 'stand'); go(); kidAt = ids; return; }
      kid.innerHTML = FZ.me('jump'); kid.classList.remove('hop'); void kid.offsetWidth; kid.classList.add('hop'); go();
      api.later(() => { kid.innerHTML = FZ.me(pose || 'stand'); }, 280);
      kidAt = ids;
    }
    api.on(window, 'resize', () => api.later(() => { const k = kidAt; kidAt = null; hopTo(k); }, 80));   // keep the kid on its box when the screen changes
    api.later(() => hopTo(null, 'stand'), 30);
    api.on(window, 'resize', () => kidAt !== null && hopTo(kidAt, null));
    const rounds = Array.from({ length: Math.min(8, 1 + Math.floor(api.level / 4)) }, (_, i) => (api.level + i * 2) % 6);   // one more throw every 4 levels, landing further along
    const HEARTS = Math.round(api.lv(5, 4, 3, 2));
    api.later(() => { api.goal({ en: `Throw the stone and hop through ${rounds.length} time${rounds.length > 1 ? 's' : ''} (${BAL.toFixed(1)} seconds on each box)`, tl: `Ihagis ang bato at tumalon nang ${rounds.length} beses (${BAL.toFixed(1)} segundo sa bawat kahon)`, hearts: HEARTS }); api.progress(`🪨 0 / ${rounds.length}`); }, 0);
    const NOGLOW = api.level >= 15;                    // from level 16: remember the hops yourself (no glowing boxes)
    const BAL = api.lv(7, 4.5, 3, 2);                 // seconds you can balance on one foot before you wobble: shorter every level
    let round = 0, queue = [], need = new Set(), mistakes = 0, stone = 0, balT = null;
    const balance = () => { clearTimeout(balT); if (phase !== 'hop') return; balT = api.later(() => { mistakes++; if (!api.loseHeart()) return api.fail(FZ.lang === 'tl' ? 'Naubos ang puso. Tumalon nang mas mabilis at sa tamang kahon!' : 'Out of hearts. Hop a little faster and on the right boxes!'); api.sfx('oops'); board.classList.add('wiggle'); setTimeout(() => board.classList.remove('wiggle'), 400); api.msg(FZ.lang === 'tl' ? 'Muntik kang matumba! Bilisan ang talon. 🦶' : 'You wobbled! Hop a little faster. 🦶', true); balance(); }, BAL * 1000); };
    const stoneIds = () => S[stone];
    function clear() { $$('.sq', board).forEach(s => { s.classList.remove('target', 'done', 'stone'); s.innerHTML = s.dataset.id === 'L' ? '🌈 Langit' : s.dataset.id; }); }
    function next() {
      $$('.sq', board).forEach(s => s.classList.remove('target'));
      if (!queue.length) { // round complete
        clearTimeout(balT); round++; api.sfx('good');
        if (round >= rounds.length) return api.finish(api.heartStars(), 'You hopped all the way through Piko!');
        api.progress(`🪨 ${round} / ${rounds.length}`);
        api.msg('Great! Now a new throw. 🪨', true); return api.later(startRound, 900);
      }
      const st = queue.shift(); cur = st; need = new Set(st.ids.map(String));
      if (!NOGLOW) st.ids.forEach(id => sq(id).classList.add('target'));
      api.msg(st.msg, true); balance();
    }
    function startRound() {
      clearTimeout(balT); clear(); stone = rounds[round]; queue = []; const ids = stoneIds(); if (kidAt !== null) { kidAt = null; hopTo(null, 'stand'); }
      need = new Set([String(ids[0])]); phase = 'throw';
      sq(ids[0]).classList.add('target');
      api.msg(`Throw the stone 🪨 into box ${ids.join(' & ')}: tap the glowing box!`, true);
    }
    let phase = 'throw', cur = null;
    function plan() {
      queue = [];
      S.forEach((ids, i) => { if (i === S.length - 1) return; if (i === stone) return; queue.push({ ids, msg: ids.length === 1 ? `Hop on ONE foot 🦶 → box ${ids[0]}` : `Land on TWO feet 🦶🦶 → boxes ${ids.join(' & ')}` }); });
      queue.push({ ids: ['L'], msg: 'Rest in Langit 🌈! Tap it, then turn around.' });
      for (let i = S.length - 2; i >= 0; i--) {
        if (i === stone) queue.push({ ids: [S[i][0]], msg: 'Bend down and pick up your stone 🪨!', pick: true });
        else queue.push({ ids: S[i], msg: S[i].length === 1 ? `Hop back on ONE foot 🦶 → box ${S[i][0]}` : `Hop back on TWO feet 🦶🦶 → boxes ${S[i].join(' & ')}` });
      }
    }
    api.on(board, 'click', e => {
      const s = e.target.closest('.sq'); if (!s) return;
      const id = s.dataset.id;
      if (need.has(id)) {
        need.delete(id); s.classList.remove('target');
        if (phase === 'throw') { kid.innerHTML = FZ.me('arms'); s.classList.add('stone'); s.innerHTML = `${id}<small>🪨</small>`; api.sfx('pop'); phase = 'hop'; plan(); return api.later(next, 500); }
        s.classList.add('done'); api.sfx('step');
        if (!need.size) { const st = cur; hopTo(st.ids, st.pick ? 'kick' : st.ids.length > 1 || st.ids[0] === 'L' ? 'wide' : 'knee'); if (st.pick) { const sb = $('.sq.stone', board); if (sb) { sb.classList.remove('stone'); sb.innerHTML = sb.dataset.id; } } }
        if (!need.size) api.later(next, 250);
      } else { mistakes++; api.sfx('oops'); if (!api.loseHeart()) return api.fail(FZ.lang === 'tl' ? 'Naubos ang puso. Laktawan ang kahong may bato!' : 'Out of hearts. Remember to skip the box with the stone!'); s.classList.add('wiggle'); setTimeout(() => s.classList.remove('wiggle'), 400); }
    });
    startRound();
  }
});

/* ---------------- KADANG-KADANG ---------------- */
FZ.reg({
  id: 'kadang', cat: 'jump', name: 'Kadang-Kadang', emoji: '🎋', color: '#74b816',
  tag: 'Race on coconut shells and bamboo stilts!',
  players: '2–6 kids (or teams)', props: 'Bamboo stilts (tayakad) with foot rests, or half coconut shells with a rope through each',
  real: [
    '<b>Kadang-kadang sa bao:</b> stand on two half coconut shells. A rope goes through a hole in each shell; hold the ropes tight and grip the shells with your toes.',
    '<b>Kadang-kadang sa kawayan (tayakad):</b> two tall bamboo poles with a small foot rest on each. Stand on the rests and hold the tops of the poles.',
    'Walk <b>left, right, left, right</b>, lifting each pole or shell with your hand and foot together. Keep your balance!',
    'It is a race (often a relay with teams). If you fall off or your foot touches the ground, climb back on where you fell — or start again, if that is your group\'s rule.'
  ],
  how: [
    '<b>Step:</b> tap <b>🦶 Left</b> and <b>Right 🦶</b> one after the other (or the ← → keys). The same foot twice makes you wobble!',
    '<b>Balance:</b> step when the marker on the balance bar is in the <b>green</b>. Stepping in the red makes you wobble. Wobble too much and you fall off!',
    'If you fall, you climb back on a few steps back. Race your friends to the 🏁 finish line.'
  ],
  tip: 'Start with coconut shells on grass. For bamboo stilts, keep the foot rests low (a hand\'s width) and always have a grown-up nearby. Count "kaliwa, kanan" out loud together!',
  start(api) {
    /* LEVELS: coconut shells (Levels 1–10), then bamboo stilts that get taller. The race gets longer, the balance marker swings
       faster and the green part gets smaller, friends walk faster, and later you must finish 2nd or 1st. */
    const L = FZ.lang === 'tl', BAMBOO = api.level >= 10, TALL = BAMBOO ? .22 + (api.level - 10) / 19 * .22 : .07;   // the foot rests go higher on later levels
    const STEPS = Math.round(api.lv(12, 18, 24, 30)), GZ = api.lv(.55, .42, .32, .25), SPD = api.lv(2.1, 2.9, 3.7, 4.4), STEPT = .26;
    const AIR = [api.lv(.8, 1.0, 1.25, 1.5), api.lv(.9, 1.1, 1.35, 1.65)];                  // friends' steps per second
    const PLACE = api.level < 9 ? 3 : api.level < 19 ? 2 : 1, HEARTS = 3;
    const NAME = BAMBOO ? (L ? 'kawayan' : 'bamboo stilts') : (L ? 'bao' : 'coconut shells');
    api.goal(PLACE === 3 ? { en: `Reach the 🏁 finish on ${NAME} (${STEPS} steps)`, tl: `Umabot sa 🏁 dulo gamit ang ${NAME} (${STEPS} hakbang)`, hearts: HEARTS }
      : PLACE === 2 ? { en: `Finish 1st or 2nd on ${NAME} (${STEPS} steps)`, tl: `Matapos nang 1st o 2nd gamit ang ${NAME} (${STEPS} hakbang)`, hearts: HEARTS }
      : { en: `Win the race on ${NAME} (${STEPS} steps)`, tl: `Manalo sa karera gamit ang ${NAME} (${STEPS} hakbang)`, hearts: HEARTS });
    const scene = h(`<div class="kdg ${BAMBOO ? 'bamboo' : 'bao'}"><div class="ksky"></div>
      <svg class="kvlanes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="33,24 39,24 18,100 0,100" fill="#d9b382"/><polygon points="47,24 53,24 62,100 38,100" fill="#d9b382"/><polygon points="61,24 67,24 100,100 82,100" fill="#d9b382"/></svg>
      <div class="kfin">🏁</div>
      <div class="kbal"><span class="kg"></span><span class="km"></span></div></div>`);
    const btns = h(`<div class="foot2"><button class="btn big" data-f="L">🦶 ${L ? 'Kaliwa' : 'Left'}</button><button class="btn big" data-f="R">${L ? 'Kanan' : 'Right'} 🦶</button></div>`);
    api.stage.append(scene); api.stage.append(btns);
    $('.kg', scene).style.cssText = `left:${50 - GZ * 50}%;width:${GZ * 100}%`;
    /* racers: two friends in the back lanes, you in front */
    const lanes = [{ y: .40, s: .74 }, { y: .58, s: .86 }, { y: .80, s: 1 }];
    const mk = (svg, lane, me) => {
      const el = h(`<div class="kr${me ? ' me' : ''}"><div class="kbody"><i class="st L"><b></b></i><i class="st R"><b></b></i><div class="kk">${svg}</div></div></div>`);
      scene.append(el); return { el, lane, p: 0, lean: 0, lift: null, me, fall: 0, wait: 0, last: null };
    };
    const rs = [mk(FZ.pal(0, 'stand'), lanes[0]), mk(FZ.pal(1, 'stand'), lanes[1]), mk(FZ.me('stand'), lanes[2], true)];
    rs.forEach((r, i) => r.col = [-1, 1, 0][i]);                                      // upright screens: friends left and right, you in the middle
    let VERT = false;
    const me = rs[2];
    let K = 100, Wd = 300, Ht = 300;
    function layout() {
      Wd = scene.clientWidth; Ht = scene.clientHeight;
      VERT = Ht > Wd * 1.15; scene.classList.toggle('vert', VERT);                    // tall screen: the race comes TOWARD you, finish at the bottom
      K = VERT ? Math.min(Ht * (BAMBOO ? .26 - TALL * .15 : .27), Wd * .36, 300) : Math.min(Ht * (BAMBOO ? .34 - TALL * .25 : .34), Wd * .3, 300);                  // the kid's height in pixels (front lane)
      scene.style.setProperty('--k', K + 'px'); scene.style.setProperty('--tall', TALL);
    }
    layout(); api.on(window, 'resize', layout);
    function draw() {
      rs.forEach(r => {
        let x, y, sc;
        if (VERT) { const t = r.p / STEPS; sc = .5 + .5 * t; y = .36 + t * .52; x = .5 + r.col * (.183 + .185 * t); r.el.style.zIndex = Math.round(y * 100); }
        else { x = .07 + r.p / STEPS * .8; y = r.lane.y; sc = r.lane.s; r.el.style.zIndex = ''; }
        r.el.style.left = (x * 100) + '%'; r.el.style.top = (y * 100) + '%';
        r.el.style.transform = `translate(-50%,-100%) scale(${sc}) rotate(${r.lean * 14}deg)`;
        r.el.classList.toggle('upL', r.lift === 'L'); r.el.classList.toggle('upR', r.lift === 'R'); r.el.classList.toggle('down', r.fall > 0);
      });
    }
    /* finishing */
    const finished = [];
    function reach(r) {
      if (r.p < STEPS || finished.includes(r)) return; finished.push(r);
      const n = finished.length;
      if (r.me) {
        if (n <= PLACE) return api.finish(Math.min(api.heartStars(), n === 1 ? 3 : n === 2 ? 2 : 1), n === 1 ? (L ? 'Nanalo ka sa karera! 🥇' : 'You won the race! 🥇') : (L ? `Nakarating ka! Ika-${n} ka.` : `You made it! You came ${n === 2 ? '2nd' : '3rd'}.`));
      }
      if (!finished.includes(me) && finished.length >= PLACE) api.fail(L ? 'Naunahan ka. Kaliwa, kanan — at hakbang kapag nasa berde!' : 'The others were faster. Left, right — and step when the marker is in the green!');
    }
    /* your steps */
    let go = false, ph = Math.random() * 6, mk_ = 0, wob = 0, busy = 0, hearts = HEARTS;
    function fallOff(r) {
      r.fall = 1.3; r.lean = r.lean >= 0 ? 1.3 : -1.3; r.lift = null; api.sfx('oops');
      if (r.me) {
        hearts--; api.loseHeart(); wob = 0; r.p = Math.max(0, r.p - 2);
        if (hearts <= 0) return api.fail(L ? 'Nahulog ka nang 3 beses. Hakbang lang kapag nasa berde ang marka!' : 'You fell off 3 times. Only step when the marker is in the green!');
        api.msg(L ? 'Nahulog! Aakyat ulit… (bumalik nang 2 hakbang)' : 'You fell off! Climbing back on… (2 steps back)', true);
      }
    }
    function step(f) {
      if (!go || me.fall > 0 || busy > 0 || me.p >= STEPS) return;
      const good = Math.abs(mk_) <= GZ, same = f === me.last;
      busy = STEPT; me.lift = f; api.later(() => { me.lift = null; }, STEPT * 900);
      if (same || !good) {
        wob += same ? .5 : .45; me.lean = (mk_ >= 0 ? 1 : -1) * (.4 + wob * .5); api.sfx('pop');
        api.msg(same ? (L ? 'Pagewang! Salitan: kaliwa, kanan!' : 'Wobble! Take turns: left, right!') : (L ? 'Pagewang! Hintaying nasa berde ang marka.' : 'Wobble! Wait for the marker to be in the green.'));
        if (wob >= 1) fallOff(me);
        return;
      }
      wob = Math.max(0, wob - .25); me.p++; me.last = f; api.sfx('step');
      api.progress(`🎋 ${me.p} / ${STEPS}`); reach(me);
    }
    $$('button', btns).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); step(b.dataset.f); }));
    api.on(window, 'keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); step('L'); } if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); step('R'); } });
    /* friends: steady steps, with a wobble now and then (and sometimes a fall) */
    rs.slice(0, 2).forEach((r, i) => { r.rate = AIR[i]; r.t = .6 + Math.random() * .5; });
    api.frame(dt => {
      dt = Math.min(dt, .05);
      if (go) {
        ph += dt * SPD; mk_ = Math.sin(ph) * (1 + wob * .15);
        $('.km', scene).style.left = (50 + clamp(mk_, -1.1, 1.1) * 45) + '%';
        $('.kbal', scene).classList.toggle('ok', Math.abs(mk_) <= GZ);
      }
      busy = Math.max(0, busy - dt);
      rs.forEach(r => {
        if (r.fall > 0) { r.fall -= dt; if (r.fall <= 0) { r.fall = 0; r.lean = 0; } }
        else if (r.me) r.lean += ((mk_ * (.15 + wob * .5)) - r.lean) * Math.min(1, dt * 6);
        else r.lean += (Math.sin(ph * .8 + r.rate * 3) * .12 - r.lean) * Math.min(1, dt * 5);
        if (!r.me && go && r.fall <= 0 && r.p < STEPS) {
          r.t -= dt;
          if (r.t <= 0) {
            if (Math.random() < .05 + api.level * .002) { r.t = 1.2; r.lean = .6; }                // a wobble: a short stop
            else if (Math.random() < .015) { fallOff(r); r.p = Math.max(0, r.p - 2); r.t = 1.4; }
            else { r.p++; r.lift = r.lift === 'L' ? 'R' : 'L'; api.later(() => { r.lift = null; }, 230); r.t = 1 / r.rate * (.85 + Math.random() * .3); reach(r); }
          }
        }
      });
      wob = Math.max(0, wob - dt * .08);
      draw();
    });
    draw();
    let c = 3; api.msg(L ? 'Humanda… sumakay sa ' + NAME + '!' : 'Get ready… climb on your ' + NAME + '!', true);
    const id = api.every(() => {
      if (c > 0) { api.msg(String(c), false); FZ.say(String(c)); api.sfx('pop'); c--; }
      else { api.stopEvery(id); go = true; api.msg(L ? 'TAKBO! Kaliwa, kanan — hakbang kapag nasa berde!' : 'GO! Left, right — step when the marker is in the green!', true); }
    }, 900);
    FZ.kadangPeek = () => ({ go, mk: mk_, GZ, busy, wob, me: me.p, fall: me.fall, last: me.last, others: rs.slice(0, 2).map(r => r.p), STEPS });
  }
});

/* ---------------- TUMBANG PRESO ---------------- */
FZ.reg({
  id: 'tumbang', cat: 'skill', name: 'Tumbang Preso', emoji: '🥫', color: '#868e96',
  tag: 'Knock down the can with your tsinelas!',
  players: '4–10 kids', props: 'An empty tin can and a flip-flop (tsinelas) for each player',
  real: [
    'A tin can (the <b>preso</b>, "prisoner") stands in a small circle. One player is <b>Taya</b> and guards it.',
    'Players stand behind a line and throw their <b>tsinelas</b> to knock the can down.',
    'When the can falls, everyone runs to grab their slippers while Taya puts the can back up.',
    'Taya may tag players who are away from their slippers — whoever is tagged becomes the next Taya!'
  ],
  how: [
    '<b>Aim:</b> drag your finger from your player toward the can 🥫 and let go to throw your tsinelas. A longer drag throws further. Too short falls in front of the can; too long flies over it!',
    '<b>Tumba!</b> When the can falls, run (drag or tap) to pick up your 🩴 and run back behind the white line before Taya stands the can up and tags you.',
    'Missed? You still have to go get your slipper — Taya guards the can, so wait for a good moment!'
  ],
  tip: 'Play on soft ground, aim low, and throw underhand. Taya should not guard too close — keep it fair for the little ones.',
  start(api) {
    /* LEVELS: the can stands further away and is guarded more closely, Taya runs faster and sets the can up quicker,
       your hand wobbles more, the arrow stops showing where the slipper lands, and you must knock the can down more times */
    const W = 120, H = 156, LINE = 128, CAN = { x: 60, y: Math.round(api.lv(74, 56, 42, 34)) };
    const NEED = 1 + Math.floor(api.level / 8), HEARTS = Math.round(api.lv(4, 3, 3, 2));
    const TS = api.lv(13, 17.5, 21.5, 25), FIX = api.lv(3, 2.3, 1.7, 1.2), WOB = api.lv(0, 2, 3.5, 5), GUARD = api.lv(0, .5, 1), SHOWLAND = api.level < 12;
    const CANR = 2.6, RANGE = 120;
    let state = 'aim', downs = 0, canUp = true, roll = { x: CAN.x, y: CAN.y }, holding = false, fixT = 0, slip = null, carrying = false, aim = null, safeT = 0, hitThis = false;
    const F = FZ.field(api, {
      W, H, ground(ctx) {
        ctx.fillStyle = '#d9b382'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(120,80,40,.12)'; for (let i = 0; i < 160; i++) ctx.fillRect((i * 53.7) % W, (i * 31.3 + i % 5 * 7) % H, 1.4, .7);
        chalk(ctx, [4, LINE, W - 4, LINE], 1.6);
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(CAN.x, CAN.y, 9, 5, 0, 0, 7); ctx.stroke();
      },
      over(ctx, F) {
        if (slip && !slip.z && state === 'fetch' && !carrying) {        // always show where your slipper is
          const b = Math.abs(Math.sin(F.t * 5)) * 1.5; ctx.fillStyle = '#7048e8'; ctx.beginPath(); ctx.moveTo(slip.x, slip.y - 3 - b); ctx.lineTo(slip.x - 2.2, slip.y - 6.5 - b); ctx.lineTo(slip.x + 2.2, slip.y - 6.5 - b); ctx.fill();
        }
        if (aim && state === 'aim') {                               // the aiming arrow
          const L = aim.p * RANGE, ex = me.x + Math.cos(aim.a) * L, ey = me.y - 6 + Math.sin(aim.a) * L;
          ctx.setLineDash([2.5, 2]); ctx.strokeStyle = 'rgba(132,94,247,.95)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(me.x, me.y - 6); ctx.lineTo(SHOWLAND ? ex : me.x + Math.cos(aim.a) * 16, SHOWLAND ? ey : me.y - 6 + Math.sin(aim.a) * 16); ctx.stroke(); ctx.setLineDash([]);
          if (SHOWLAND) { ctx.strokeStyle = '#7048e8'; ctx.beginPath(); ctx.ellipse(ex, ey, 3, 1.8, 0, 0, 7); ctx.stroke(); }
          ctx.fillStyle = '#fff'; F.round(me.x - 10, me.y + 3, 20, 3.2, 1.6); ctx.fill();                 // power bar
          ctx.fillStyle = aim.p > .9 ? '#e03131' : '#40c057'; F.round(me.x - 10, me.y + 3, 20 * aim.p, 3.2, 1.6); ctx.fill();
        }
      },
      tick
    });
    const drawCan = ctx => {
      if (holding) return;                                          // Taya is carrying it
      ctx.save(); canUp ? ctx.translate(CAN.x, CAN.y) : ctx.translate(roll.x, roll.y);
      if (canUp) { ctx.fillStyle = '#adb5bd'; ctx.fillRect(-2.2, -7, 4.4, 7); ctx.fillStyle = '#e03131'; ctx.fillRect(-2.2, -5.2, 4.4, 3); ctx.fillStyle = '#ced4da'; ctx.beginPath(); ctx.ellipse(0, -7, 2.2, .8, 0, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = '#adb5bd'; ctx.fillRect(-3.5, -4.4, 7, 4.4); ctx.fillStyle = '#e03131'; ctx.fillRect(-1.6, -4.4, 3, 4.4); ctx.fillStyle = '#868e96'; ctx.beginPath(); ctx.ellipse(3.5, -2.2, .8, 2.2, 0, 0, 7); ctx.fill(); }
      ctx.restore();
    };
    F.prop({ x: CAN.x, y: CAN.y, draw: drawCan });
    const slipProp = F.prop({ x: 0, y: 0, gone: true, draw(ctx) {
      const s = slip; if (!s) return; const z = s.z || 0;
      if (z > .3) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 2.6, 1, 0, 0, 7); ctx.fill(); }
      ctx.save(); ctx.translate(s.x, s.y - z); ctx.rotate(s.r || 0); ctx.fillStyle = '#ffd43b'; ctx.strokeStyle = '#e67700'; ctx.lineWidth = .5; ctx.beginPath(); ctx.ellipse(0, 0, 4.6, 2.3, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, -1.8); ctx.lineTo(.6, 0); ctx.lineTo(-2, 1.8); ctx.stroke(); ctx.restore();
    } });
    const me = F.me = F.actor({ x: W / 2, y: LINE + 12, make: MK.me(), speed: 32, locked: true });
    const taya = F.actor({ x: CAN.x + 12, y: CAN.y + 2, make: MK.rival(), speed: TS, tag: 'Taya', tagBg: '#e03131', tagFg: '#fff' });
    const pals = [0, 1].map(i => F.actor({ x: i ? W - 16 : 16, y: LINE + 10, make: MK.pal(i + 1), speed: 20, solid: false }));
    api.goal({ en: `Knock down the can ${NEED} time${NEED > 1 ? 's' : ''} and get your slipper back safely`, tl: `Patumbahin ang lata nang ${NEED} beses at makuha ang tsinelas nang ligtas`, hearts: HEARTS });
    const prog = () => api.progress(`🥫 ${downs} / ${NEED}`);
    prog();
    api.msg(L2('Drag from your player toward the can 🥫, then let go to throw!', 'I-drag mula sa iyo papunta sa lata 🥫, saka bitawan para ihagis!'), true);
    /* ---- aiming with a finger or the mouse ---- */
    const toWorld = e => { const r = F.canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
    api.on(F.canvas, 'pointerdown', e => { if (state !== 'aim') return; aim = { s: toWorld(e), a: -Math.PI / 2, p: 0 }; });
    api.on(F.canvas, 'pointermove', e => {
      if (!aim || state !== 'aim') return; const w = toWorld(e), dx = w.x - aim.s.x, dy = w.y - aim.s.y, d = Math.hypot(dx, dy);
      if (d < 2) return; aim.a = Math.atan2(dy, dx); aim.p = clamp(d / 60, 0, 1);
    });
    const release = () => { if (!aim || state !== 'aim') return; const a = aim; aim = null; if (a.p < .08) return; throwIt(a.a, a.p); };
    api.on(F.canvas, 'pointerup', release); api.on(F.canvas, 'pointercancel', release);
    F.onTap = () => state === 'aim';                                // taps don't walk while aiming
    function throwIt(ang, pow) {
      state = 'fly'; api.sfx('jump'); me.pose = 'arms'; api.later(() => me.pose = null, 300);
      ang += (Math.random() - .5) * 2 * WOB * Math.PI / 180;                       // the hand wobbles a little
      const sx = me.x, sy = me.y - 6, L = pow * RANGE, ex = sx + Math.cos(ang) * L, ey = sy + Math.sin(ang) * L;
      /* where would it hit? the slipper comes DOWN over the last 35% of its flight: only there can it knock the can */
      let end = 1, what = null;
      for (let t = .65; t <= 1.001; t += .01) {
        const x = sx + (ex - sx) * t, y = sy + (ey - sy) * t;
        if (Math.hypot(x - CAN.x, (y - CAN.y) * 1.3) < CANR + 2.2) { end = t; what = 'can'; break; }
        if (Math.hypot(x - taya.x, y - taya.y + 4) < 4.5) { end = t; what = 'taya'; break; }
      }
      slip = { x: sx, y: sy, z: 0, r: 0 }; slipProp.gone = false;
      const t0 = F.t, DUR = .75 * end + .1;
      fly = dt => {
        const k = Math.min(1, (F.t - t0) / DUR), t = k * end;
        slip.x = sx + (ex - sx) * t; slip.y = sy + (ey - sy) * t; slip.z = Math.sin(Math.PI * t) * L * .28; slip.r += dt * 14;
        if (k < 1) return;
        fly = null; slip.z = 0; slip.x = clamp(slip.x, 4, W - 4); slip.y = clamp(slip.y, 4, H - 4);
        if (what === 'can') {
          /* the can rolls away and the slipper flies on past it, like in real life */
          canUp = false; hitThis = true; holding = false; api.sfx('good');
          roll = { x: clamp(CAN.x + Math.cos(ang) * 8 + (Math.random() - .5) * 8, 6, W - 6), y: clamp(CAN.y + Math.sin(ang) * 8, 6, LINE - 8) };
          slip.x = clamp(slip.x + Math.cos(ang) * 24 + (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 10), 5, W - 5); slip.y = clamp(slip.y + Math.sin(ang) * 24, 5, H - 5);
          api.msg(L2('TUMBA! 🥫 Run and get your 🩴, then back behind the line!', 'TUMBA! 🥫 Takbo, kunin ang 🩴, saka bumalik sa likod ng linya!'), true); }
        else { api.sfx('oops'); api.msg(what === 'taya' ? L2('Taya blocked it! Now go get your 🩴 — carefully!', 'Naharang ni Taya! Kunin ang 🩴 mo — mag-ingat!') : L2('Mintis! Missed. Go get your 🩴 — watch out for Taya!', 'Mintis! Kunin ang 🩴 mo — bantayan si Taya!'), true); }
        state = 'fetch'; me.locked = false; F.goal = null; carrying = false; fixT = 0;
      };
    }
    let fly = null;
    F.peek = () => ({ state, slip, canUp, carrying, downs });     // (for automatic tests)
    function tagged() {
      api.sfx('oops'); safeT = 1.5;
      if (!api.loseHeart()) { F.frozen = true; return api.fail(L2('Taya tagged you too many times. Throw, then run fast to your slipper!', 'Maraming beses kang nataya. Ihagis, saka tumakbo nang mabilis sa tsinelas mo!')); }
      api.msg(L2('Natayaan! 😅 Taya tagged you. Back to the line — try again!', 'Natayaan! 😅 Balik sa linya — subukan ulit!'), true);
      backToLine(false);
    }
    function backToLine(ok) {
      state = 'aim'; me.locked = true; F.goal = null; me.x = clamp(me.x, 10, W - 10); me.y = LINE + 12; slip = null; slipProp.gone = true; carrying = false;
      canUp = true; holding = false; hitThis = false; taya.x = CAN.x + 12; taya.y = CAN.y + 2; taya.pose = null; fixT = 0;
      if (ok) { downs++; prog(); if (downs >= NEED) { F.frozen = true; return api.finish(api.heartStars(), L2('Tumbang preso champion! 🥫', 'Kampeon sa tumbang preso! 🥫')); } }
      api.later(() => state === 'aim' && api.msg(L2('Your turn! Drag toward the can and let go. 🩴', 'Ikaw na! I-drag papunta sa lata at bitawan. 🩴'), true), 900);
    }
    function tick(dt) {
      safeT -= dt;
      if (fly) fly(dt);
      if (slip) slipProp.y = slip.y + (slip.z > .5 ? 40 : 0);            // a flying slipper is drawn in front
      pals.forEach((p, i) => F.goTo(p, (i ? W - 16 : 16) + Math.sin(F.t * .8 + i) * 4, LINE + 10, dt, 10, .5));
      if (state === 'aim' || state === 'fly') {
        /* like the real game, Taya stands BESIDE the can (not in front of it) and keeps walking around it — closer and quicker on later levels */
        const side = Math.sin(F.t * api.lv(.5, 1.2)), R = 12 - 3.5 * GUARD;
        F.goTo(taya, CAN.x + side * R, CAN.y - 4 + Math.abs(side) * 4, dt, TS * .5, .5); return;
      }
      /* state fetch: run to your slipper, then back behind the line */
      const out = me.y < LINE;
      if (slip && !carrying && F.dist(me, slip) < 5) { carrying = true; slip = null; slipProp.gone = true; api.sfx('pop'); api.msg(L2('Got it! 🩴 Now run back behind the line!', 'Nakuha mo! 🩴 Takbo pabalik sa likod ng linya!'), true); }
      if (carrying && !out) return backToLine(hitThis);
      if (!canUp) {                                               // Taya must fetch the can, carry it back to the circle and stand it up
        if (!holding) { if (F.goTo(taya, roll.x, roll.y + 1, dt, TS, 1.5)) { holding = true; taya.pose = 'arms'; } }
        else if (F.goTo(taya, CAN.x + 1, CAN.y + 1, dt, TS * .8, 1.2)) {
          fixT += dt; taya.pose = 'kick';
          if (fixT >= FIX) { canUp = true; holding = false; taya.pose = null; api.sfx('pop'); api.msg(L2('The can is up! Taya can tag you now — run!', 'Nakatayo na ang lata! Puwede ka nang tayain — takbo!'), true); }
        }
        return;
      }
      /* the can is up: Taya chases you when you are out on the field (but not too far from the can) */
      if (out) {
        const leash = hitThis ? 999 : 34, tx = me.x + me.vx * .3, ty = me.y + me.vy * .3;
        const cx = Math.hypot(tx - CAN.x, ty - CAN.y) > leash ? CAN.x + (tx - CAN.x) / Math.hypot(tx - CAN.x, ty - CAN.y) * leash : tx;
        const cy = Math.hypot(tx - CAN.x, ty - CAN.y) > leash ? CAN.y + (ty - CAN.y) / Math.hypot(tx - CAN.x, ty - CAN.y) * leash : ty;
        F.goTo(taya, cx, Math.min(cy, LINE - 2), dt, TS, .3);
        if (safeT <= 0 && F.dist(taya, me) < 5) tagged();
      } else F.goTo(taya, CAN.x + 10, CAN.y + 3, dt, TS * .6, .5);
    }
  }
});
