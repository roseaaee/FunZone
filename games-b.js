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
  let lv = 0, fails = 0, busy = false, val = 0, dir = 1, holding = false, hold0 = 0;
  const needed = () => cfg.levels[lv].need !== undefined ? cfg.levels[lv].need : (cfg.levels[lv].h + 0.07) / MAXJ;
  function showLevel() {
    cfg.draw(obst, cfg.levels[lv], scene);
    label.textContent = `Level ${lv + 1}/${cfg.levels.length} · ${cfg.levels[lv].name}`;
    reqEl.style.left = (needed() * 100) + '%';
    api.msg(cfg.levelMsg, true);
  }
  function attempt(power) {
    if (busy) return; busy = true;
    const ok = power >= needed();
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
          api.sfx('good'); api.msg('Wow! You jumped over it! 🎉', true);
          api.later(() => {
            jm.getAnimations().forEach(a => a.cancel()); lv++;
            if (lv >= cfg.levels.length) api.finish(fails <= 1 ? 3 : fails <= 4 ? 2 : 1, cfg.winMsg);
            else { showLevel(); busy = false; }
          }, 900);
        } else {
          api.sfx('oops'); jm.classList.add('oops'); api.msg(cfg.failMsg, true); fails++;
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
    if (cfg.mode === 'hold') val = holding ? Math.min(1, (performance.now() - hold0) / 1300) : 0;
    else { val += dir * dt * (0.75 + lv * 0.12); if (val >= 1) { val = 1; dir = -1; } if (val <= 0) { val = 0; dir = 1; } }
    fill.style.width = (val * 100) + '%'; mark.style.left = (val * 100) + '%';
  });
  showLevel();
}

/* ---------------- LUKSONG TINIK ---------------- */
FZ.reg({
  id: 'tinik', cat: 'jump', name: 'Luksong Tinik', emoji: '🌵', color: '#51cf66',
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
      mode: 'meter',
      levels: [1, 2, 3, 4, 5].map((p, i) => ({ p, h: FZ.TINIK_U[i] / 112 * 0.4, need: 0.3 + 0.12 * i, name: names[i] })),
      draw(el, L, scene) {                       // the two friends sit; the pile of feet and hands comes from THEIR arms and legs
        const u = scene.clientHeight * 0.4 / 112;
        el.innerHTML = `<div class="fig" style="height:${63 * u}px">${FZ.tinikFig(L.p)}</div>`;
      },
      levelMsg: 'Tap Talon! when the marker is past the green line.',
      failMsg: 'Oops! You touched the tinik. Try again! 🌵',
      winMsg: 'You jumped over every tinik without touching it!'
    });
  }
});

/* ---------------- LUKSONG BAKA ---------------- */
FZ.reg({
  id: 'baka', cat: 'jump', name: 'Luksong Baka', emoji: '🐄', color: '#f783ac',
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
      mode: 'hold',
      levels: [1, 2, 3, 4].map((lvl, i) => ({ lvl, h: FZ.BAKA_U[i] / 112 * 0.4, need: 0.36 + 0.15 * i, name: names[i] })),
      draw(el, L, scene) {                       // a real kid bends: hands on the ground, then feet, knees, thighs
        const u = scene.clientHeight * 0.4 / 112;
        el.innerHTML = `<div class="fig" style="height:${80 * u}px;margin-bottom:${-4 * u}px">${FZ.bakaFig(L.lvl)}</div>`;
      },
      levelMsg: 'Hold the button, let go past the green line!',
      failMsg: 'Oops! You bumped the baka. Hold a little longer! 🐄',
      winMsg: 'You leaped over the baka at every height!'
    });
  }
});

/* ---------------- CHINESE GARTER ---------------- */
FZ.reg({
  id: 'garter', cat: 'jump', name: 'Chinese Garter', emoji: '🎀', color: '#ff6b6b',
  tag: 'Hop in patterns over the stretchy rope!',
  players: '3 or more kids', props: 'A long elastic band (about 3–4 metres), tied in a loop',
  real: [
    'Two players stand apart holding a long elastic band around their ankles. The jumper stands in the middle, between the two strands.',
    'The jumper does a pattern of steps and hops (stepping on the band, hopping sideways, then jumping over it).',
    'After each round the band goes higher: <b>ankle → knee → waist → chest → neck → head → overhead</b>!',
    'If you miss a step or touch it wrong, you take a turn as a holder.'
  ],
  how: [
    'The rope starts low at the ankle. Follow the pattern of chips on screen.',
    'Tap 🦶 Left, 🦶 Right or ⬆️ Talon in the same order as the chips.',
    'If you make a mistake, start the pattern again. The rope rises after every pattern!'
  ],
  tip: 'Make a loop from rubber bands tied together. Kids love singing a rhythm while they hop — it helps them remember the pattern!',
  start(api) {
    const levels = [{ h: 0.07, n: 'Ankle (bukong-bukong)' }, { h: 0.17, n: 'Knee (tuhod)' }, { h: 0.28, n: 'Waist (baywang)' }, { h: 0.39, n: 'Chest (dibdib)' }, { h: 0.5, n: 'Head (ulo)' }];
    const scene = h(`<div class="jscene"><div class="jground"></div><div class="holder" style="left:3%">${FZ.pal(1, 'wide')}</div><div class="holder" style="right:3%">${FZ.pal(2, 'wide', { flip: true })}</div><div class="garter"></div><div class="jumper" style="left:calc(50% - var(--sh) * .136)">${FZ.me('stand')}</div><div class="jlabel"></div></div>`);
    api.stage.append(scene);
    const rope = $('.garter', scene), jm = $('.jumper', scene), label = $('.jlabel', scene);
    const seqBox = h('<div class="seq"></div>'), btns = h(`<div class="gbtns"><button class="btn big" data-t="L">⬅️ Left</button><button class="btn big" data-t="U">⬆️ Talon</button><button class="btn big" data-t="R">Right ➡️</button></div>`);
    api.stage.append(seqBox); api.stage.append(btns);
    const SYM = { L: '⬅️🦶', R: '🦶➡️', U: '⬆️🦘' };
    let lv = 0, idx = 0, seq = [], mistakes = 0, busy = false;
    const place = () => { rope.style.bottom = ((0.16 + levels[lv].h) * scene.clientHeight) + 'px'; label.textContent = `Level ${lv + 1}/5 · ${levels[lv].n}`; };
    function newSeq() {
      const len = 3 + (lv >= 2 ? 1 : 0) + (lv >= 4 ? 1 : 0);
      seq = Array.from({ length: len - 1 }, () => pick(['L', 'R'])).concat('U'); idx = 0; draw();
      api.msg('Copy the pattern: tap the buttons in order!', true);
    }
    function draw() { seqBox.innerHTML = seq.map((t, i) => `<span class="${i < idx ? 'on' : i === idx ? 'now' : ''}">${SYM[t]}</span>`).join(''); }
    function hop(t) {
      jm.innerHTML = FZ.me(t === 'U' ? 'jump' : 'wide'); setTimeout(() => { jm.innerHTML = FZ.me('stand'); }, t === 'U' ? 650 : 320);
      const dx = t === 'L' ? -34 : t === 'R' ? 34 : 0, dy = t === 'U' ? (levels[lv].h + 0.12) * scene.clientHeight : 26;
      jm.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dx}px,${-dy}px)` }, { transform: 'translate(0,0)' }], { duration: t === 'U' ? 650 : 320 });
    }
    function tap(t) {
      if (busy) return;
      if (t === seq[idx]) {
        hop(t); api.sfx(t === 'U' ? 'jump' : 'step'); idx++; draw();
        if (idx >= seq.length) {
          busy = true; api.sfx('good'); api.msg('Super! The rope goes higher! 🎀', true);
          api.later(() => { lv++; if (lv >= levels.length) api.finish(mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1, 'You cleared every height of Chinese Garter!'); else { place(); newSeq(); busy = false; } }, 1000);
        }
      } else { mistakes++; idx = 0; draw(); api.sfx('oops'); api.msg('Oops! Start the pattern again. 😅', true); }
    }
    $$('button', btns).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); tap(b.dataset.t); }));
    api.on(window, 'keydown', e => { const m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ' ': 'U' }[e.key]; if (m) { e.preventDefault(); tap(m); } });
    place(); newSeq();
  }
});

/* ---------------- PIKO ---------------- */
FZ.reg({
  id: 'piko', cat: 'jump', name: 'Piko', emoji: '🦶', color: '#ff922b',
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
    api.stage.append(board);
    const sq = id => $(`.sq[data-id="${id}"]`, board);
    const rounds = [1, 4]; // stone goes to step index 1 (box 2) then index 4 (boxes 6-7)
    let round = 0, queue = [], need = new Set(), mistakes = 0, stone = 0;
    const stoneIds = () => S[stone];
    function clear() { $$('.sq', board).forEach(s => { s.classList.remove('target', 'done', 'stone'); s.innerHTML = s.dataset.id === 'L' ? '🌈 Langit' : s.dataset.id; }); }
    function next() {
      $$('.sq', board).forEach(s => s.classList.remove('target'));
      if (!queue.length) { // round complete
        round++; api.sfx('good');
        if (round >= rounds.length) return api.finish(mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1, 'You hopped all the way through Piko!');
        api.msg('Great! Now a new throw. 🪨', true); return api.later(startRound, 900);
      }
      const st = queue.shift(); need = new Set(st.ids.map(String));
      st.ids.forEach(id => sq(id).classList.add('target'));
      api.msg(st.msg, true);
    }
    function startRound() {
      clear(); stone = rounds[round]; queue = []; const ids = stoneIds();
      need = new Set([String(ids[0])]); phase = 'throw';
      sq(ids[0]).classList.add('target');
      api.msg(`Throw the stone 🪨 into box ${ids.join(' & ')}: tap the glowing box!`, true);
    }
    let phase = 'throw';
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
        if (phase === 'throw') { s.classList.add('stone'); s.innerHTML = `${id}<small>🪨</small>`; api.sfx('pop'); phase = 'hop'; plan(); return api.later(next, 500); }
        s.classList.add('done'); s.innerHTML = `${id === 'L' ? '🌈' : id}<small>${id === 'L' ? '🦶🦶' : '🦶'}</small>`; api.sfx('step');
        if (!need.size) api.later(next, 250);
      } else { mistakes++; api.sfx('oops'); s.classList.add('wiggle'); setTimeout(() => s.classList.remove('wiggle'), 400); }
    });
    startRound();
  }
});

/* ---------------- KADANG-KADANG ---------------- */
FZ.reg({
  id: 'kadang', cat: 'jump', name: 'Kadang-Kadang', emoji: '🥥', color: '#74b816',
  tag: 'Race on coconut-shell stilts!',
  players: '2–6 kids', props: 'Half coconut shells with a rope threaded through each',
  real: [
    'Each racer stands on two halves of a coconut shell. A rope runs through a hole in each shell.',
    'You hold the rope tight with your hands and grip the shell with your toes.',
    'Step <b>left, right, left, right</b> while balancing, and race to the finish line!',
    'If you lose your balance and fall off, you have to start that part again.'
  ],
  how: [
    'Wait for "Takbo!" then tap the 🥥 Left and 🥥 Right buttons <b>one after the other</b>.',
    'Tapping the same side twice makes you wobble and slide back!',
    'Race your two friends to the 🏁 finish line.'
  ],
  tip: 'Use thick rope and sturdy shells; start on grass. Count "kaliwa, kanan" out loud together for the rhythm!',
  start(api) {
    const STEPS = 22;
    const racers = [{ e: FZ.me('run'), p: 0, me: true }, { e: FZ.pal(0, 'run'), p: 0, sp: 540 }, { e: FZ.pal(1, 'run'), p: 0, sp: 640 }];
    const wrap = h('<div class="race"></div>');
    racers.forEach(r => { const l = h(`<div class="lane"><div class="rc">${r.e}<span class="coco">🥥</span></div></div>`); r.el = $('.rc', l); wrap.append(l); });
    api.stage.append(wrap);
    const btns = h('<div class="foot2"><button class="btn big" data-f="L">🥥 Left</button><button class="btn big" data-f="R">Right 🥥</button></div>');
    api.stage.append(btns);
    let go = false, last = null, done = 0, finished = new Set();
    const upd = () => racers.forEach(r => r.el.style.left = (r.p / STEPS * 70) + '%');
    function reach(r) { if (r.p >= STEPS && !finished.has(r)) { finished.add(r); if (r.me) api.finish(finished.size === 1 ? 3 : finished.size === 2 ? 2 : 1, finished.size === 1 ? 'You won the race! 🥇' : 'You finished the race! 🏁'); } }
    function tap(f) {
      if (!go || racers[0].p >= STEPS) return;
      const me = racers[0];
      if (f === last) { me.p = Math.max(0, me.p - 1); api.sfx('oops'); me.el.classList.add('wobble'); setTimeout(() => me.el.classList.remove('wobble'), 400); api.msg('Wobble! Alternate: left, right, left, right!'); }
      else { me.p++; last = f; api.sfx('step'); }
      upd(); reach(me);
    }
    $$('button', btns).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); tap(b.dataset.f); }));
    api.on(window, 'keydown', e => { if (e.key === 'ArrowLeft') tap('L'); if (e.key === 'ArrowRight') tap('R'); });
    racers.slice(1).forEach(r => api.every(() => { if (go && r.p < STEPS) { r.p++; upd(); reach(r); } }, r.sp));
    upd();
    let c = 3; api.msg('Get ready…', true);
    const id = api.every(() => {
      if (c > 0) { api.msg(String(c), false); FZ.say(String(c)); api.sfx('pop'); c--; }
      else { api.stopEvery(id); go = true; api.msg('TAKBO! Tap left, right, left, right! 🥥', true); }
    }, 900);
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
    'Watch the 🔴 marker slide across the bar. Tap <b>Hagis!</b> when it is in the green zone to throw!',
    'If the can falls: tap <b>Takbo!</b> super fast to grab your tsinelas before Taya sets the can up.',
    'You get 3 throws. Try to rescue your slipper every time!'
  ],
  tip: 'Play on soft ground, aim low, and throw underhand. Taya should not guard too close — keep it fair for the little ones.',
  start(api) {
    const scene = h(`<div class="tp"><div class="circle"></div><div class="can">🥫</div><div class="taya">${FZ.rival('arms')}</div><div class="throwline"></div><div class="kid">${FZ.me('stand')}</div><div class="slip">🩴</div></div>`);
    const aim = h('<div class="aim"><div class="zone"></div><div class="cur"></div></div>');
    const bars = h('<div class="bars" style="display:none"><div class="bar"><i></i><span>🏃 You: tap Takbo!</span></div><div class="bar bad"><i></i><span>🥫 Taya sets the can up</span></div></div>');
    const act = h('<div class="actions"><button class="btn big" id="tpThrow">🩴 Hagis!</button></div>');
    api.stage.append(scene); api.stage.append(aim); api.stage.append(bars); api.stage.append(act);
    const can = $('.can', scene), slip = $('.slip', scene), cur = $('.cur', aim), mine = $('.bar i', bars), taya = $('.bar.bad i', bars), tayaEm = $('.taya', scene);
    const throwBtn = $('#tpThrow', act);
    const home = () => { slip.style.left = '64%'; slip.style.top = '86%'; };
    home();
    let state = 'aim', x = 0, d = 1, tries = 0, saved = 0, taps = 0;
    api.frame(dt => { if (state !== 'aim') return; x += d * dt * 1.0; if (x >= 1) { x = 1; d = -1; } if (x <= 0) { x = 0; d = 1; } cur.style.left = (x * 100) + '%'; });
    function nextTry() {
      if (tries >= 3) return api.finish(saved === 0 ? 1 : saved === 1 ? 2 : 3, saved ? `You rescued your tsinelas ${saved} time${saved > 1 ? 's' : ''}!` : 'Nice throws! Try again to rescue your slipper.');
      can.classList.remove('down'); home(); tayaEm.style.left = '68%'; tayaEm.style.top = '30%'; bars.style.display = 'none'; aim.style.display = ''; throwBtn.textContent = '🩴 Hagis!'; state = 'aim';
      api.msg('Tap Hagis! when the marker is in the green zone!', true);
    }
    function doThrow() {
      if (state !== 'aim') return; state = 'busy'; tries++;
      const hit = Math.abs(x - 0.5) <= 0.11; api.sfx('jump');
      if (hit) { slip.style.left = '50%'; slip.style.top = '42%'; }
      else { slip.style.left = (x < .5 ? 22 : 78) + '%'; slip.style.top = '36%'; }
      api.later(() => {
        if (hit) { can.classList.add('down'); api.sfx('good'); api.msg('TUMBANG! 🥫 Run, run! Tap Takbo! as fast as you can!', true); rush(); }
        else { api.sfx('oops'); api.msg('Mintis! Missed — the can is still standing.', true); api.later(nextTry, 1100); }
      }, 550);
    }
    function rush() {
      state = 'rush'; taps = 0; aim.style.display = 'none'; bars.style.display = ''; mine.style.width = '0'; taya.style.width = '0';
      throwBtn.textContent = '🏃 Takbo!'; const t0 = performance.now(), TOTAL = 3800;
      tayaEm.style.left = '56%'; tayaEm.style.top = '40%';
      api.frame(() => {
        if (state !== 'rush') return false;
        const p = (performance.now() - t0) / TOTAL; taya.style.width = clamp(p * 100, 0, 100) + '%';
        if (p >= 1) { state = 'busy'; api.sfx('oops'); api.msg('Natayaan! 😅 Taya tagged you. Try again!', true); api.later(nextTry, 1300); return false; }
      });
    }
    function tapRush() {
      taps++; mine.style.width = clamp(taps / 10 * 100, 0, 100) + '%'; api.sfx('step');
      if (taps >= 10) { state = 'busy'; saved++; api.sfx('good'); slip.style.left = '64%'; slip.style.top = '86%'; api.msg('Nakuha mo ang tsinelas! 🩴 You are safe!', true); api.later(nextTry, 1300); }
    }
    const press = e => { e && e.preventDefault(); if (state === 'aim') doThrow(); else if (state === 'rush') tapRush(); };
    throwBtn.addEventListener('pointerdown', press);
    api.on(window, 'keydown', e => { if (e.code === 'Space') press(e); });
    nextTry();
  }
});