'use strict';
/* =====================================================
   GAMES A – Habulan (tag & chase games), played in real time
   on the playground engine (field.js): you walk and run freely.
   Patintero, Agawan Base, Langit-Lupa, Taguan,
   Araw-Lilim, Lawin at Sisiw, Kapitang Bakod
   ===================================================== */
/* ---------- helpers shared by the playground games ---------- */
const L2 = (en, tl) => FZ.lang === 'tl' ? tl : en;
const MK = {
  me: extra => (p, f) => FZ.me(p, Object.assign({ flip: f }, extra || {})),
  pal: (i, extra) => (p, f) => FZ.pal(i, p, Object.assign({ flip: f }, extra || {})),
  rival: extra => (p, f) => FZ.rival(p, Object.assign({ flip: f }, extra || {}))
};
const GRASS = (c1 = '#9be07a', c2 = '#8cd46b') => (ctx, F) => {
  ctx.fillStyle = c1; ctx.fillRect(0, 0, F.W, F.H);
  ctx.fillStyle = c2; for (let i = 0; i < F.W * F.H / 260; i++) { const x = (i * 97.13) % F.W, y = (i * 61.7 + (i % 7) * 13) % F.H; ctx.fillRect(x, y, 1.2, 0.5); }
};
const chalk = (ctx, pts, w = 1.2, c = 'rgba(255,255,255,.95)') => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke(); };
const hudSet = (F, html) => { F.hud.innerHTML = html; };
const chip = (t, cls = '') => `<span class="fchip ${cls}">${t}</span>`;


/* ---------- shared "safe spot" tag (Langit-Lupa, Araw-Lilim, Kapitang Bakod) ----------
   Like the real games: you are safe only on a safe spot, Taya counts to 5 if you stay too long,
   so you must keep running from spot to spot. If you are tagged, YOU are Taya and chase a friend. */
function safeTag(api, cfg) {
  const W = cfg.W || 170, H = cfg.H || 118;
  const HOPS = 3 + Math.round(api.level * 0.3), LIM = api.lv(8, 5.5, 4, 3), TS = api.lv(17, 21, 25, 28), LEAD = api.lv(.15, .4, .6), FS = api.lv(15, 20, 25);   // more spots to reach and a faster, smarter Taya on every level
  const HEARTS = Math.round(api.lv(4, 3, 3, 2));
  const TLIM = Math.round(HOPS * api.lv(15, 10, 7.5, 6));            // a time limit that gets shorter on EVERY level
  let tleft = TLIM;
  const F = FZ.field(api, { W, H, ground: (ctx, F) => cfg.ground(ctx, F), solids: cfg.solids || [], tick, over: cfg.over });
  (cfg.props || []).forEach(p => F.prop(p));
  const zones = cfg.zones;
  const zoneAt = (x, y) => zones.find(z => z.test(x, y, F)) || null;
  const me = F.me = F.actor({ x: W / 2, y: H - 10, make: MK.me(), speed: 32 });
  let taya = F.actor({ x: 18, y: 14, make: MK.rival(), speed: TS, tag: 'Taya', tagBg: '#e03131', tagFg: '#fff' });
  const friends = [0, 1, 3].map((i, k) => F.actor({ x: 30 + k * 50, y: 40 + k * 20, make: MK.pal(i), speed: FS, zone: null, wait: 0 }));
  let role = 'run', hops = 0, last = null, stay = 0, tagged = 0, inv = 1.5, prey = null, warned = false;
  const hud = () => { hudSet(F, role === 'run' ? '' : chip('🏃 ' + L2('You are Taya! Tag a friend', 'Ikaw ang Taya! Tayain ang kaibigan'), 'red')); api.progress(`⭐ ${hops} / ${HOPS} · ⏱️ ${Math.ceil(tleft)}`); };
  api.goal({ en: cfg.goalEn(HOPS) + ` in ${TLIM} seconds`, tl: cfg.goalTl(HOPS) + ` sa loob ng ${TLIM} segundo`, hearts: HEARTS });
  hud();
  api.msg(cfg.startMsg, true);
  function npcRoam(f, dt, avoid) {           // friends run between safe spots, like real players
    const z = zoneAt(f.x, f.y);
    if (z && f.zone === z) { f.wait -= dt; if (f.wait > 0 && !(avoid && f.wait < LIM * .3)) { f.vx = f.vy = 0; return; } }
    if (!f.target || F.dist(f, f.target) < 1.5) {
      const opts = zones.filter(q => q !== f.zone); let zz = pick(opts);
      if (avoid) zz = opts.slice().sort((a, b) => F.dist(avoid, b.c(F)) - F.dist(avoid, a.c(F)))[Math.floor(Math.random() * 2)];
      const c = zz.c(F); f.target = { x: c.x + (Math.random() - .5) * 4, y: c.y + (Math.random() - .5) * 3 }; f.nextZone = zz;
    }
    F.goTo(f, f.target.x, f.target.y, dt, f.speed, 1);
    const z2 = zoneAt(f.x, f.y); if (z2 && z2 !== f.zone) { f.zone = z2; f.wait = .6 + Math.random() * LIM * .55; f.target = null; }
  }
  function tick(dt) {
    inv -= dt; cfg.tick && cfg.tick(dt, F);
    const before = Math.ceil(tleft); tleft -= dt; if (Math.ceil(tleft) !== before) hud();
    if (tleft <= 0) { F.frozen = true; return api.fail(L2('Time is up! Run to the next safe spot a little faster.', 'Ubos na ang oras! Tumakbo nang mas mabilis sa susunod na ligtas na puwesto.')); }
    const z = zoneAt(me.x, me.y);
    me.lift = z && z.lift ? z.lift : 0;
    if (role === 'run') {
      if (z && z !== last) { last = z; stay = 0; warned = false; hops++; api.sfx('good'); hud(); if (hops >= HOPS) return win(); }
      if (z) stay += dt;
      const tired = z && stay > LIM, safe = z && !tired;
      me.ring = safe ? '#2f9e44' : tired ? '#e03131' : null;
      me.tag = z && !tired && stay > LIM - 3.2 ? String(Math.ceil(LIM - stay)) : null;
      if (tired && !warned) { warned = true; api.sfx('oops'); api.msg(cfg.countMsg || L2('Taya counted to 5! Run to another spot!', 'Nagbilang na si Taya ng lima! Lumipat ng puwesto!'), true); }
      /* Taya: chases you when you are not safe, waits close by when you are */
      if (!safe) F.goTo(taya, me.x + me.vx * LEAD, me.y + me.vy * LEAD, dt, TS, 0.3);
      else {
        /* you are safe: Taya goes after a friend who is out in the open (like the real game), and stays close to you otherwise */
        const open = friends.filter(f => !zoneAt(f.x, f.y) && F.dist(f, taya) < 45).sort((a, b) => F.dist(a, taya) - F.dist(b, taya))[0];
        if (open && stay < LIM - 2) { F.goTo(taya, open.x, open.y, dt, TS * .85, .3); if (F.dist(taya, open) < 4.5 && !open.oops) { open.oops = 1.4; open.tag = '😅'; open.target = null; api.sfx('pop'); } }
        else { const a = Math.atan2(taya.y - me.y, taya.x - me.x), R = api.lv(26, 14); F.goTo(taya, me.x + Math.cos(a) * R, me.y + Math.sin(a) * R, dt, TS * .6, 1); }
      }
      friends.forEach(f => { if (f.oops) { f.oops -= dt; if (f.oops <= 0) { f.oops = 0; f.tag = null; } } npcRoam(f, dt, f.oops ? taya : null); });
      if (!safe && inv <= 0 && F.dist(taya, me) < 5) {
        tagged++; if (!api.loseHeart()) { F.frozen = true; return api.fail(L2('Taya tagged you too many times. Move before the count ends!', 'Ilang beses kang nataya. Lumipat bago matapos ang bilang!')); }
        role = 'it'; api.sfx('oops'); me.ring = null; me.tag = 'Taya'; me.tagBg = '#e03131'; me.tagFg = '#fff';
        taya.tag = null; friends.push(taya); prey = null; inv = 1;
        api.msg(cfg.caughtMsg, true); hud();
      }
    } else {
      if (!prey) prey = friends.slice().sort((a, b) => F.dist(a, me) - F.dist(b, me))[0];
      friends.forEach(f => npcRoam(f, dt, f === prey ? me : null));
      const pz = zoneAt(prey.x, prey.y), psafe = pz && prey.wait > 0;
      prey.ring = psafe ? '#2f9e44' : null;
      if (!psafe && inv <= 0 && F.dist(prey, me) < 5.5) {               // you tagged them: they become Taya
        api.sfx('good'); role = 'run'; me.tag = null; me.tagBg = me.tagFg = null;
        friends.splice(friends.indexOf(prey), 1); taya = prey; taya.ring = null; taya.tag = 'Taya'; taya.tagBg = '#e03131'; taya.tagFg = '#fff'; taya.speed = TS;
        taya.x = clamp(taya.x + (taya.x > me.x ? 20 : -20), 6, W - 6); inv = 2; last = null; prey = null; hud();
        api.msg(L2('Tag! Now they are Taya. Run to the safe spots again!', 'Taya! Sila na ang Taya. Takbo ulit sa ligtas na puwesto!'), true);
      }
      if (prey && F.t % 4 < dt) prey = null;                              // pick the nearest friend again now and then
    }
    me.alpha = inv > 0 && role === 'run' ? .55 + .45 * Math.abs(Math.sin(F.t * 12)) : 1;
  }
  function win() { F.frozen = true; api.finish(api.heartStars(), cfg.winMsg); }
  return F;
}


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
    'You are the runner. Drag your finger on the field (or use the arrow keys) to run. You can also tap a spot to run there.',
    'The taggers (red shirts) stay on their chalk lines and slide left and right to block you. Each tagger can only block ONE runner, so when it chases a teammate, that is your chance to dash! From Level 6 the head guard runs along the middle line, and every level has faster, quicker taggers, more lines or more round trips.',
    'Cross every line to the ⭐ end, then run all the way back to 🏠. If you are touched, you go back to the start.'
  ],
  tip: 'Draw 3 lines about 3 big steps apart, and one long line down the middle. Let the child be a runner first, then a defender so they feel both roles.',
  start(api) {
    /* LEVELS: more lines (and taggers) every 5 levels, a head guard from Level 4, more round trips every 10 levels,
       taggers faster and quicker to react on every level, fewer hearts. */
    const NL = Math.min(7, 2 + Math.floor((api.level + 1) / 4));               // one more line (and tagger) every 4 levels: 2 lines on Levels 1–3 … 7 from Level 20
    const DOUBLE = Math.max(0, Math.min(NL, Math.floor((api.level - 19) / 3) + 1)); // from Level 20, more and more lines get a SECOND tagger
    const TRIPS = 1 + Math.floor(api.level / 12);                              // 1, 2, then 3 round trips (Levels 13 and 25)
    const HEARTS = Math.round(api.lv(5, 4, 4, 3));
    /* taggers are almost as fast as you, react quickly and reach far — faster, quicker and longer-armed on EVERY level */
    const GS = api.lv(14, 19, 22.5, 25, 26.5), REACH = api.lv(4.6, 5.8, 6.8, 7.8), LAG = api.lv(.55, .38, .27, .2, .16), BOSS = api.level >= 5, RUSH = api.lv(1, 1.06, 1.12);
    const W = 100, X0 = 12, X1 = 88, TOP = 22, GAP = 24, BOT = TOP + 12 + NL * GAP, H = BOT + 22;
    const lines = Array.from({ length: NL }, (_, i) => TOP + 12 + GAP / 2 + i * GAP);
    const F = FZ.field(api, {
      W, H, view: [W, Math.min(H, 128)], bounds: { x: X0 + 2, y: 6, w: X1 - X0 - 4, h: H - 10 },
      ground(ctx) {
        ctx.fillStyle = '#e8c98f'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#9be07a'; ctx.fillRect(0, 0, X0 - 2, H); ctx.fillRect(X1 + 2, 0, W, H);
        ctx.fillStyle = 'rgba(255,212,59,.35)'; ctx.fillRect(X0, 4, X1 - X0, TOP - 4);
        ctx.fillStyle = 'rgba(77,171,247,.25)'; ctx.fillRect(X0, BOT, X1 - X0, H - BOT - 4);
        chalk(ctx, [X0, 4, X0, H - 4]); chalk(ctx, [X1, 4, X1, H - 4]); chalk(ctx, [X0, TOP, X1, TOP]); chalk(ctx, [X0, BOT, X1, BOT]);
        lines.forEach(y => chalk(ctx, [X0, y, X1, y], 1.6));
        if (BOSS) chalk(ctx, [50, lines[0], 50, lines[NL - 1]], 1.6);
      },
      over(ctx, F) { F.emoji('⭐', 26, TOP - 3, 9); F.emoji('⭐', 74, TOP - 3, 9); F.emoji('🏠', 26, H - 6, 9); F.emoji('🏠', 74, H - 6, 9); },
      tick
    });
    const me = F.me = F.actor({ x: 50, y: BOT + 10, make: MK.me(), speed: 33 });
    const guards = lines.map((y, i) => F.actor({ x: 50 + (i % 2 ? -14 : 14), y, make: MK.rival(i % 2 ? { girl: true, skin: '#dba574' } : {}), pose: 'arms', speed: GS, solid: false, side: 0 }));
    for (let i = 0; i < DOUBLE; i++) {                                         // a second tagger on the line: one covers the left, one the right
      const y = lines[NL - 1 - i];
      guards.find(g => g.y === y).side = -1;
      guards.push(F.actor({ x: 72, y, make: MK.rival({ skin: '#b97a4a', shirt: '#c92a2a' }), pose: 'arms', speed: GS, solid: false, side: 1 }));
    }
    const boss = BOSS ? F.actor({ x: 50, y: lines[0], make: MK.me({ shirt: '#7048e8', shorts: '#212529', girl: false, hairStyle: 'short', top: 'tee', bottom: 'shorts' }), pose: 'arms', speed: GS * api.lv(.6, .9), solid: false, tag: L2('Head', 'Patotot') }) : null;
    /* two teammates run too, like the real game: a tagger blocks whichever runner is closest to its line */
    const mates = [0, 1].map(i => F.actor({ x: 30 + i * 40, y: BOT + 8, make: MK.pal(i), speed: 26, solid: false, up: true, wait: .4 + i * .9, tx: 50 }));
    let phase = 'out', trips = 0, safeT = 2.2, seenX = me.x, seenY = me.y;     // taggers react to where you WERE a moment ago, so quick fakes work
    api.goal({
      en: `Get past ${guards.length + (boss ? 1 : 0)} taggers on ${NL} lines to ⭐ and back to 🏠${TRIPS > 1 ? ` ${TRIPS} times` : ''}`,
      tl: `Lampasan ang ${guards.length + (boss ? 1 : 0)} bantay sa ${NL} linya papuntang ⭐ at bumalik sa 🏠${TRIPS > 1 ? ` nang ${TRIPS} beses` : ''}`, hearts: HEARTS
    });
    const hud = () => { hudSet(F, chip(phase === 'out' ? L2('Run to ⭐', 'Takbo sa ⭐') : L2('Back to 🏠', 'Balik sa 🏠'))); api.progress(`🔁 ${trips} / ${TRIPS}`); };
    hud();
    api.msg(L2('Drag to run! The taggers will try hard to touch you. Fake left and right!', 'I-drag para tumakbo! Pipilitin ka nilang tayain. Lumihis pakaliwa at pakanan!'), true);
    function tick(dt) {
      safeT -= dt; seenX += (me.x - seenX) * Math.min(1, dt / LAG); seenY += (me.y - seenY) * Math.min(1, dt / LAG);
      mates.forEach(m => {                                          // teammates run across and back, waiting for gaps
        if (m.wait > 0) { m.wait -= dt; return; }
        const yGoal = m.up ? TOP - 8 : BOT + 8;
        const g = guards.filter(g => m.up ? g.y < m.y - 1 : g.y > m.y + 1).sort((a, b) => Math.abs(a.y - m.y) - Math.abs(b.y - m.y))[0];
        if (g && Math.abs(g.y - m.y) < 12 && Math.abs(g.x - m.x) < 12) { if (Math.random() < dt * 1.5) m.tx = clamp(m.x + (m.x > g.x ? 22 : -22), X0 + 4, X1 - 4); F.goTo(m, m.tx, m.y + (m.up ? 2 : -2), dt, 22, .5); }
        else if (F.goTo(m, m.tx, yGoal, dt, 24, 1.5)) { m.up = !m.up; m.wait = .4 + Math.random() * .9; m.tx = 20 + Math.random() * 60; }
        if (guards.some(g => Math.abs(m.x - g.x) < REACH * .9 && Math.abs(m.y - g.y) < REACH * .6)) { m.y = m.up ? BOT + 8 : TOP - 8; m.up = !m.up; m.wait = .8; }   // a tagged teammate starts over
      });
      guards.forEach(g => {
        /* a tagger stays on its own line and always tries to stand right in front of you: it watches where you are heading,
           and when you come close to its line it rushes at you. It only turns to a teammate when you are far away. */
        /* like the real game a tagger can only block ONE runner: whoever is closest to its line (you or a teammate).
           So when a teammate pulls a tagger away, that is your chance to dash! */
        const myGap = Math.abs(me.y - g.y), mate = mates.filter(m => m.wait <= 0).sort((a, b) => Math.abs(a.y - g.y) - Math.abs(b.y - g.y))[0];
        const lead = api.lv(.05, .25) * me.vx;                                    // later levels: it guesses where you are going
        const onMate = mate && Math.abs(mate.y - g.y) + 3 < myGap && Math.abs(mate.y - g.y) < 14;
        let tx = onMate ? mate.x : seenX + lead;
        if (g.side && myGap < 55) tx = g.side < 0 ? Math.min(tx, 56) : Math.max(tx, 44);   // two on a line: each guards its half
        const near = !onMate && myGap < 9;                                       // you are right at its line: it lunges
        F.goTo(g, clamp(tx, X0 + 2, X1 - 2), g.y, dt, near ? Math.min(31, GS * RUSH) : GS * .9, 0.2);
      });
      if (boss) {                                                  // the head guard runs along the middle line
        const near = Math.abs(me.x - 50) < api.lv(10, 18);
        const ty = near ? seenY : (lines[0] + lines[NL - 1]) / 2 + Math.sin(F.t) * 20;
        F.goTo(boss, 50, clamp(ty, lines[0], lines[NL - 1]), dt, boss.speed, 0.3);
      }
      if (safeT <= 0) {
        const hit = guards.some(g => Math.abs(me.x - g.x) < REACH && Math.abs(me.y - g.y) < REACH * .55) || (boss && Math.abs(me.x - boss.x) < REACH * .7 && Math.abs(me.y - boss.y) < REACH);
        if (hit) {
          api.sfx('oops'); const left = api.loseHeart(); F.goal = null;
          if (!left) { F.frozen = true; return api.fail(L2('The taggers caught you too many times. Watch them, then fake and dash!', 'Ilang beses kang nataya. Bantayan sila, lumihis, saka tumakbo!')); }
          safeT = 1.6; me.x = me.x < 50 ? 28 : 72; me.y = phase === 'out' ? BOT + 10 : TOP - 8;
          api.msg(L2('Touched! 😅 Try that part again.', 'Nataya ka! 😅 Ulitin ang bahaging iyan.'), true); return;
        }
      }
      if (phase === 'out' && me.y < TOP - 2) { phase = 'back'; api.sfx('good'); hud(); api.msg(L2('You crossed! ⭐ Now run back home 🏠!', 'Nakatawid ka! ⭐ Ngayon, takbo pabalik sa 🏠!'), true); }
      else if (phase === 'back' && me.y > BOT + 2) {
        trips++; api.sfx('good'); hud();
        if (trips >= TRIPS) { F.frozen = true; return api.finish(api.heartStars(), L2('You crossed every line and came back safely!', 'Natawid mo ang lahat ng linya at nakabalik nang ligtas!')); }
        phase = 'out'; hud(); api.msg(L2(`Great! Again — ${TRIPS - trips} more to go!`, `Galing! Ulit — ${TRIPS - trips} pa!`), true);
      }
      me.alpha = safeT > 0 ? .55 + .45 * Math.abs(Math.sin(F.t * 12)) : 1;
    }
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
    'You are on the blue team (left). Drag on the field or tap where to run. Your goal: touch the red team\'s base 🚩 on the far right.',
    'The red team chases you anywhere on the field. You are only safe when you touch your own base 🏳️. More red players join as the levels go up.',
    'Caught? You go to their jail 🔒 — tap "Call a friend" so a teammate runs to free you. From level 16 a red runner also tries to steal YOUR base: touch them on your side to send them to jail!'
  ],
  tip: 'Use trees or two buckets as bases. Younger kids can play without the "who left later" rule; just tag and jail.',
  start(api) {
    const W = 230, H = 112, MID = W / 2, BASE = { x: 14, y: 56 }, EBASE = { x: W - 14, y: 56 }, JAIL = { x: W - 26, y: 14 }, MYJAIL = { x: 26, y: 98 };
    /* LEVELS: one more guard every 7 levels, guards faster and smarter on every level, more captures needed every 12 levels,
       a raider attacks your base from Level 16, fewer hearts. */
    /* LEVELS: one more red player every 4 levels (1 → 5), all of them faster, smarter and chasing from further away on EVERY level,
       one more capture every 8 levels, a raider from Level 16, fewer hearts. Like the real game they chase you ANYWHERE —
       you are only safe touching your own base. */
    const N = Math.min(5, 1 + Math.floor(api.level / 4)), SP = api.lv(19, 22, 24.5, 26.5), LEAD = api.lv(.2, .45, .65), AGGRO = api.lv(50, 80, 120, 160);
    const CAP = 1 + Math.floor(api.level / 8), HEARTS = Math.round(api.lv(4, 3, 3, 2)), SAFE = 13;
    const RAID = api.level >= 15, RSP = api.lv(12, 16, 20);
    const F = FZ.field(api, {
      W, H, view: [140, H],
      ground(ctx) {
        ctx.fillStyle = '#a5e08a'; ctx.fillRect(0, 0, MID, H); ctx.fillStyle = '#f2b8a6'; ctx.fillRect(MID, 0, W - MID, H);
        chalk(ctx, [MID, 3, MID, H - 3], 1.6);
        [[JAIL, '#ff6b6b'], [MYJAIL, '#4dabf7']].forEach(([j, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(j.x, j.y, 9, 0, 7); ctx.stroke(); ctx.setLineDash([]); });
      },
      over(ctx, F) { F.text('🔒', JAIL.x, JAIL.y - 11, 6); F.text('🔒', MYJAIL.x, MYJAIL.y - 11, 6); },
      solids: [{ x: BASE.x, y: BASE.y, r: 2.4 }, { x: EBASE.x, y: EBASE.y, r: 2.4 }],
      tick
    });
    [[BASE, '🏳️', '#339af0'], [EBASE, '🚩', '#e03131']].forEach(([b, e, c]) => F.prop({ x: b.x, y: b.y, draw(ctx, F) { ctx.fillStyle = '#7a5230'; ctx.fillRect(b.x - .9, b.y - 22, 1.8, 22); F.emoji(e, b.x + 4, b.y - 16, 10); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(b.x, b.y, 4, 1.6, 0, 0, 7); ctx.fill(); } }));
    const me = F.me = F.actor({ x: 26, y: 56, make: MK.me(), speed: 32 });
    const POSTS = [[W - 40, 56], [W - 75, 30], [W - 75, 82], [W - 28, 26], [W - 105, 56]];
    const reds = POSTS.slice(0, N).map(([x, y], i) => F.actor({ x, y, px: x, py: y, make: MK.rival(i % 2 ? { girl: true, skin: '#dba574' } : {}), speed: SP }));
    const raider = RAID ? F.actor({ x: W - 30, y: 90, make: MK.rival({ skin: '#b97a4a', shirt: '#c92a2a' }), speed: RSP, tag: L2('Raider', 'Lusob'), wait: 4, jailed: false }) : null;
    const pals = [0, 1].map(i => F.actor({ x: 20 + i * 8, y: 30 + i * 52, make: MK.pal(i), speed: 24, solid: false }));
    let jailed = false, caught = 0, safeT = 2.2, friend = null, lost = 0, caps = 0, seenX = me.x, seenY = me.y;
    const RLAG = api.lv(.45, .32, .22, .16);
    const act = h('<div class="actions"></div>'); api.stage.append(act);
    const hud = () => { hudSet(F, chip('🚩 ' + L2('Touch their base!', 'Hawakan ang base nila!')) + (RAID ? chip('🏳️ ' + L2('Guard yours', 'Bantayan ang inyo')) : '')); api.progress(`🚩 ${caps} / ${CAP}`); };
    api.goal({ en: `Touch the red base${CAP > 1 ? ` ${CAP} times` : ''} · ${N} red player${N > 1 ? 's' : ''} chasing`, tl: `Hawakan ang pulang base${CAP > 1 ? ` nang ${CAP} beses` : ''} · ${N} kalabang humahabol`, hearts: HEARTS });
    hud();
    api.msg(L2('Run to the red 🚩 base! The red team chases you anywhere — only your own base is safe.', 'Takbo sa pulang 🚩 base! Hahabulin ka nila kahit saan — ligtas ka lang sa base ninyo.'), true);
    function goJail() {
      caught++; api.sfx('oops');
      if (!api.loseHeart()) { F.frozen = true; return api.fail(L2('The red team caught you too many times. Wait for a gap, then run!', 'Ilang beses kang nahuli. Maghintay ng puwang, saka tumakbo!')); }
      jailed = true; me.locked = true; F.goal = null; me.x = JAIL.x; me.y = JAIL.y; me.ring = '#e03131'; hud();
      api.msg(L2('Caught! You are in jail 🔒. Call a friend to free you!', 'Nahuli! Nasa kulungan ka 🔒. Tumawag ng kakampi!'), true);
      const b = h(`<button class="btn big">🙋 ${L2('Call a friend!', 'Tawagin ang kakampi!')}</button>`);
      b.onclick = () => { b.remove(); friend = pals[0]; api.msg(L2('Your friend is running to free you! 🏃', 'Tumatakbo ang kakampi mo para palayain ka! 🏃'), true); };
      act.append(b);
    }
    function tick(dt) {
      safeT -= dt;
      if (friend) {
        if (F.goTo(friend, JAIL.x - 4, JAIL.y + 3, dt, 26 + api.lv(6, 0), 2)) {
          /* like the real game, a freed player first goes back to their own base */
          jailed = false; me.locked = false; me.ring = null; safeT = 1.6; api.sfx('good'); friend.x = 20; friend.y = 30; friend = null;
          me.x = BASE.x + 10; me.y = BASE.y; F.goal = null; seenX = me.x; seenY = me.y;
          api.msg(L2('Free! You are back at your base. Try again! 🚩', 'Malaya ka na! Nasa base ninyo ka na. Subukan ulit! 🚩'), true);
        }
      }
      /* the red team chases you ANYWHERE once you leave your base (aiming where you are going); the closest ones come first.
         With 3 or more, one always guards their base like a goalkeeper. Touch your own base and they back off. */
      const safe = jailed || F.dist(me, BASE) < SAFE;
      seenX += (me.x - seenX) * Math.min(1, dt / RLAG); seenY += (me.y - seenY) * Math.min(1, dt / RLAG);   // they react to where you WERE a moment ago
      const order = reds.map((r, i) => [F.dist(r, me), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      reds.forEach((r, i) => {
        let tx, ty, sp = SP;
        const keeper = N >= 3 && api.level >= 11 && i === 0, hunting = !safe && !keeper && (F.dist(r, me) < AGGRO || order.indexOf(i) < (api.level < 12 ? 1 : 2));
        if (keeper) { const a = Math.atan2(seenY - EBASE.y, seenX - EBASE.x); tx = EBASE.x + Math.cos(a) * 20; ty = EBASE.y + Math.sin(a) * 20; sp = SP * .72; }   // stays near their flag, on your side of it
        else if (hunting) { tx = seenX + me.vx * LEAD; ty = seenY + me.vy * LEAD; }
        else { tx = r.px - api.lv(0, 40); ty = r.py + (me.y - r.py) * api.lv(.2, .6); sp = SP * .7; }            // wait near the middle, leaning toward you
        if (safe && !keeper) tx = Math.max(tx, BASE.x + SAFE + 10);                                             // they may not touch your base
        F.goTo(r, clamp(tx, 4, W - 4), clamp(ty, 4, H - 4), dt, sp, 0.5);
        if (!safe && safeT <= 0 && F.dist(r, me) < 5.5) goJail();
      });
      if (F.frozen) return;
      if (raider && !raider.jailed) {
        raider.wait -= dt;
        if (raider.wait <= 0) {
          if (F.goTo(raider, BASE.x + 4, BASE.y, dt, RSP, 2)) {
            lost++; hud(); api.sfx('oops'); raider.x = W - 30; raider.y = 90; raider.wait = 5;
            if (!api.loseHeart()) { F.frozen = true; return api.fail(L2('The red team took your base too many times. Guard it!', 'Ilang beses naagaw ang base ninyo. Bantayan ito!')); }
            api.msg(L2('Oh no! A red runner touched YOUR base. Guard it!', 'Naku! Nahawakan ng kalaban ang base ninyo. Bantayan mo!'), true);
          }
          if (!jailed && raider.x < MID && F.dist(raider, me) < 5.5) {
            raider.jailed = true; raider.x = MYJAIL.x; raider.y = MYJAIL.y; raider.ring = '#339af0'; raider.vx = raider.vy = 0; api.sfx('good');
            api.msg(L2('You tagged the raider! Off to your jail! 🔒', 'Nataya mo ang lumusob! Sa kulungan ninyo siya! 🔒'), true);
          }
        }
      }
      /* your teammates really play: they run out toward the red side, back off when a red player comes close, then try again */
      pals.forEach((p, i) => {
        if (p === friend) return;
        p.wait = (p.wait || 0) - dt;
        const near = reds.find(r => F.dist(r, p) < 15);
        if (near && p.state !== 'home') { p.state = 'home'; p.ty = i ? 80 : 32; }
        if (p.state === 'home') { if (F.goTo(p, 16 + i * 6, p.ty, dt, p.speed, 1.5)) { p.state = 'rest'; p.wait = 1 + Math.random() * 2; } }
        else if (p.state === 'rest' || !p.state) { if (p.wait <= 0) { p.state = 'out'; p.tx = MID + 6 + Math.random() * 30; p.ty = 18 + Math.random() * (H - 36); } }
        else if (F.goTo(p, p.tx, p.ty, dt, p.speed * .8, 2)) { p.state = 'home'; p.ty = 20 + Math.random() * (H - 40); }
      });
      if (!jailed && F.dist(me, EBASE) < 6.5) {
        caps++; api.sfx('good'); hud();
        if (caps >= CAP) { F.frozen = true; return api.finish(api.heartStars(), L2('You captured the red base! 🚩', 'Naagaw mo ang pulang base! 🚩')); }
        me.x = 26; me.y = 56; F.goal = null; safeT = 1.5; reds.forEach(r => { r.x = r.px; r.y = r.py; });
        api.msg(L2(`Captured! 🚩 Now do it again — ${CAP - caps} more!`, `Naagaw! 🚩 Ulitin — ${CAP - caps} pa!`), true);
      }
      me.alpha = safeT > 0 && !jailed ? .55 + .45 * Math.abs(Math.sin(F.t * 12)) : 1;
    }
  }
});


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
    'Drag (or tap) to run. Raised places — rocks, benches, steps and stumps — are <b>Langit</b>: stand on one to be safe (green ring).',
    'Taya counts if you stay too long! When your number runs out, run to a DIFFERENT langit. Each new langit you reach is a ⭐.',
    'If Taya touches you on the <b>lupa</b> (ground), you become Taya: chase and tag a friend!'
  ],
  tip: 'Safe spots must be a little raised. Add a rule that you can only stay on langit while counting to 5 so everyone keeps moving!',
  start(api) {
    const W = 170, H = 118;
    const spots = [
      { k: 'rock', x: 28, y: 30, r: 8 }, { k: 'bench', x: 70, y: 22, w: 26, h: 8 }, { k: 'stump', x: 130, y: 30, r: 7 },
      { k: 'steps', x: 140, y: 74, w: 20, h: 16 }, { k: 'rock', x: 88, y: 66, r: 9 }, { k: 'bench', x: 26, y: 88, w: 24, h: 8 }, { k: 'stump', x: 64, y: 104, r: 6.5 }, { k: 'rock', x: 112, y: 104, r: 7 }
    ].slice(0, Math.round(api.lv(8, 7, 6)));                      // fewer safe places on harder levels
    const zones = spots.map(s => ({
      lift: 2.6,
      test: s.r ? (x, y) => ((x - s.x) / s.r) ** 2 + ((y - s.y) / (s.r * .62)) ** 2 < 1 : (x, y) => x > s.x - s.w / 2 && x < s.x + s.w / 2 && y > s.y - s.h / 2 && y < s.y + s.h / 2,
      c: () => ({ x: s.x, y: s.y })
    }));
    const props = spots.map(s => ({
      x: s.x, y: s.y, z: s.y - (s.r ? s.r * .62 : s.h / 2),
      draw(ctx) {
        ctx.save();
        if (s.k === 'rock') { ctx.fillStyle = '#8d8d8d'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 1.6, s.r, s.r * .62, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#b5b5b5'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * .62, 0, 0, 7); ctx.fill(); }
        else if (s.k === 'stump') { ctx.fillStyle = '#7a4b2a'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 2, s.r, s.r * .62, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#d4a373'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * .62, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#a07040'; ctx.lineWidth = .5; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * .55, s.r * .33, 0, 0, 7); ctx.stroke(); }
        else if (s.k === 'bench') { ctx.fillStyle = '#7a4b2a'; ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2 + 2, s.w, s.h); ctx.fillStyle = '#c08552'; ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h); ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = .4; for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s.x - s.w / 2, s.y - s.h / 2 + i * s.h / 3); ctx.lineTo(s.x + s.w / 2, s.y - s.h / 2 + i * s.h / 3); ctx.stroke(); } }
        else { for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#c9c9c9' : '#dedede'; ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2 + i * s.h / 3, s.w, s.h / 3 + .5); } ctx.fillStyle = '#9a9a9a'; ctx.fillRect(s.x - s.w / 2, s.y + s.h / 2, s.w, 2); }
        ctx.restore();
      }
    }));
    safeTag(api, {
      W, H, zones, props, ground: GRASS(),
      goalEn: n => `Reach ${n} different high places (langit)`, goalTl: n => `Umabot sa ${n} iba't ibang mataas na lugar (langit)`,
      startMsg: L2('Stand on high places (langit) to be safe. Keep hopping to new ones!', 'Tumayo sa matataas na lugar (langit) para ligtas. Lumipat-lipat!'),
      caughtMsg: L2('Tagged on the lupa! Now YOU are Taya — tag a friend!', 'Nataya ka sa lupa! Ikaw na ang Taya — tayain ang kaibigan!'),
      winMsg: L2('You hopped from langit to langit like a pro!', 'Ang galing mong lumipat-lipat ng langit!')
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
    'Each level has its own place and role. Sometimes you are the <b>seeker</b> (Taya), sometimes you <b>hide</b>!',
    'Seeker: count, then walk around and explore. Tap a hiding place to go and look behind it. Found someone? Race them back to the 🚩 base and get there first to call "Pung!"',
    'Hider: walk around while Taya counts, then tap a hiding place to hide in it. When Taya is far away, sneak back and touch the 🚩 base before Taya does — "Save!"'
  ],
  tip: 'Agree on boundaries before playing. For tiny kids, hide in plain sight and count only to 10 so it stays exciting, not scary.',
  start(api) {
    const W = 240, H = 172, BASE = { x: 120, y: 124 };
    const PLACES = [
      { id: 'village', name: L2('Village', 'Baryo'), g: ['#b9e48f', '#a8d87c'], path: '#e3c48d', spots: ['🛖', '🌳', '🏠', '🌴', '🛺', '🪵', '🧺', '🌳', '🌴', '🏠', '🪣', '🛖'], deco: ['🌼', '🐓', '🌱'] },
      { id: 'playground', name: L2('Playground', 'Palaruan'), g: ['#a6e38a', '#95d679'], path: '#f1d9a6', spots: ['🛝', '🌳', '🎠', '🌳', '🪑', '🚲', '⛲', '🌳', '🗑️', '🛝', '🌳', '🪑'], deco: ['🌼', '🦋', '🌷'] },
      { id: 'school', name: L2('School', 'Paaralan'), g: ['#b4e09a', '#a2d488'], path: '#d9d4c7', spots: ['🏫', '🚌', '🌳', '🥅', '🪑', '🚲', '⛲', '🌳', '🗑️', '🌳', '🚌', '🪑'], deco: ['🌼', '📚', '🌱'] },
      { id: 'forest', name: L2('Forest', 'Gubat'), g: ['#7fc46a', '#70b65c'], path: '#a98560', spots: ['🌳', '🌲', '🌲', '🪨', '🪵', '🌿', '⛺', '🌳', '🌲', '🪨', '🌿', '🌲'], deco: ['🍄', '🌿', '🐦'] },
      { id: 'beach', name: L2('Beach', 'Dalampasigan'), g: ['#f5e1a4', '#ecd592'], path: '#e9d08a', spots: ['🏖️', '🌴', '🛶', '🪨', '🏰', '🌴', '⛱️', '🪨', '🌴', '🛶', '🛟', '🌴'], deco: ['🐚', '🦀', '⭐'] }
    ];
    const P = PLACES[Math.min(PLACES.length - 1, Math.floor(api.level / 6))];        // the place changes every 6 levels
    const SEEK = api.level % 2 === 0;                                                // levels 1, 3, 5… you seek; 2, 4, 6… you hide
    const POS = [[38, 42], [94, 30], [150, 44], [206, 36], [26, 96], [76, 92], [176, 86], [218, 112], [56, 150], [176, 150], [222, 158], [150, 112]];
    const NSP = Math.round(api.lv(7, 9, 12));
    const sizeOf = e => /🏠|🏫|🛖|🚌|🌳|🌲|🌴|🛝|🎠|⛺|🏖️|⛱️/.test(e) ? 26 : 17;
    const spots = POS.slice(0, NSP).map(([x, y], i) => { const e = P.spots[i], s = sizeOf(e); return { x, y, e, s, who: null, wig: 0 }; });
    let seed = api.level * 7 + 3; const rng = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const decos = Array.from({ length: 26 }, () => ({ x: 8 + rng() * (W - 16), y: 16 + rng() * (H - 24), e: P.deco[Math.floor(rng() * P.deco.length)] })).filter(d => Math.hypot(d.x - BASE.x, d.y - BASE.y) > 14 && spots.every(s => Math.hypot(d.x - s.x, d.y - s.y) > 14));
    let tickFn = () => { };
    const F = FZ.field(api, {
      W, H, view: [126, 88], room: 230,
      solids: spots.map(s => ({ x: s.x, y: s.y - 1.5, r: s.s * .2 })).concat([{ x: BASE.x, y: BASE.y, r: 2 }]),
      ground(ctx, F) {
        GRASS(P.g[0], P.g[1])(ctx, F);
        ctx.strokeStyle = P.path; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(BASE.x, BASE.y); ctx.quadraticCurveTo(60, 120, 30, 70); ctx.moveTo(BASE.x, BASE.y); ctx.quadraticCurveTo(170, 70, 210, 60); ctx.moveTo(BASE.x, BASE.y); ctx.lineTo(BASE.x, H); ctx.stroke();
        if (P.id === 'beach') { ctx.fillStyle = '#74c0fc'; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(0, 11, W, 1.4); }
        decos.forEach(d => F.emoji(d.e, d.x, d.y, 6, .9));
      },
      tick: dt => tickFn(dt)
    });
    spots.forEach(s => F.prop({ x: s.x, y: s.y, draw(ctx, F) { const w = s.wig > 0 ? Math.sin(F.t * 40) * .9 : 0; F.emoji(s.e, s.x + w, s.y + 2, s.s); if (s.mark) F.text(s.mark, s.x, s.y - s.s - 1, 6); } }));
    F.prop({ x: BASE.x, y: BASE.y, draw(ctx, F) { ctx.fillStyle = '#7a5230'; ctx.fillRect(BASE.x - .9, BASE.y - 20, 1.8, 20); F.emoji('🚩', BASE.x + 4, BASE.y - 14, 10); F.text(L2('BASE', 'BASE'), BASE.x, BASE.y + 4, 4.2, '#c92a2a'); } });
    if (api.level >= 12) { F.dark = api.lv(0, .6, .8, .9); F.darkR = api.lv(70, 55, 42, 34); }     // later: tagu-taguan at dusk, under the moon
    const names = ['Ana', 'Ben', 'Lito', 'Mia'];
    const SPF = api.lv(15, 20, 25, 29);           // how fast the other kids run
    const countBox = h(`<div class="tgcount"><div class="countnum">🙈</div><div class="countword"></div></div>`); F.el.append(countBox);
    const words = FZ.lang === 'tl' ? ['Isa', 'Dalawa', 'Tatlo', 'Apat', 'Lima', 'Anim', 'Pito', 'Walo', 'Siyam', 'Sampu'] : ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const near = (a, s) => Math.hypot(a.x - s.x, a.y - (s.y + 4)) < s.s * .3 + 7;
    const me = F.me = F.actor({ x: BASE.x - 8, y: BASE.y + 6, make: MK.me(), speed: 34 });
    function count(ms, onDone, showOverlay) {
      let i = 0; countBox.classList.toggle('see', !showOverlay); countBox.classList.remove('hidden');
      const id = api.every(() => {
        if (i < 10) { $('.countnum', countBox).textContent = i + 1; $('.countword', countBox).textContent = words[i]; FZ.say(words[i], false); api.sfx('pop'); i++; }
        else { api.stopEvery(id); countBox.classList.add('hidden'); onDone(); }
      }, ms);
    }

    if (SEEK) {
      /* ---------------- YOU ARE THE SEEKER ---------------- */
      const NK = Math.min(5, 2 + Math.floor(api.level / 7)), SNEAK = api.level >= 14, HINT = api.level < 10;   // more friends to find every 7 levels
      const NEED = Math.max(1, NK - (api.level < 12 ? 1 : 0)), TIME = Math.round(api.lv(150, 120, 95, 75));          // less time on every level
      let timeLeft = TIME;
      const hideIn = shuffle(spots.slice()).slice(0, NK);
      const kids = hideIn.map((s, i) => { s.who = i; return F.actor({ x: s.x, y: s.y + 4, make: MK.pal(i), speed: SPF, hidden: true, name: names[i], spot: s, state: 'hid' }); });
      let pung = 0, saved = 0, busy = false, pend = null, lastSneak = 0;
      const hud = () => { hudSet(F, chip('🔍 ' + L2('Seeker', 'Taya')) + chip('⏱️ ' + Math.ceil(timeLeft)) + (saved ? chip(`🏃 ${saved}`) : '') + chip(`👀 ${NK - pung - saved}`)); api.progress(`✅ ${pung} / ${NEED}`); };
      api.goal({ en: `Find and "Pung!" at least ${NEED} of ${NK} friends in ${TIME} seconds`, tl: `Hanapin at "Pung!" ang ${NEED} o higit pa sa ${NK} kaibigan sa loob ng ${TIME} segundo` });
      F.frozen = true; me.pose = 'arms';
      api.msg(L2(`${P.name}: you are Taya! Close your eyes and count…`, `${P.name}: ikaw ang Taya! Pumikit at magbilang…`), true);
      count(api.lv(800, 650), () => { F.frozen = false; me.pose = null; hud(); api.msg(L2('Ready or not, here I come! Walk around and tap a hiding place to look. 🔍', 'Handa man o hindi, hahanapin ko kayo! Maglakad at i-tap ang taguan para silipin. 🔍'), true); }, true);
      F.onTap = (x, y) => {
        const s = spots.find(s => Math.abs(x - s.x) < s.s * .45 && y < s.y + 4 && y > s.y - s.s);
        if (!s || busy) return false;
        if (near(me, s)) look(s); else { F.goal = { x: s.x, y: s.y + 5 }; pend = s; }
        return true;
      };
      F.onArrive = () => { if (pend && near(me, pend)) look(pend); pend = null; };
      function look(s) {
        if (s.checked && s.who === null) { api.msg(L2('You already looked there.', 'Nasilip mo na iyan.')); return; }
        busy = true; s.mark = '🔍'; api.sfx('pop');
        api.later(() => {
          busy = false; s.mark = null; s.checked = true;
          const k = s.who !== null ? kids[s.who] : null;
          if (k && k.state === 'hid') {
            s.who = null; k.hidden = false; k.state = 'race'; k.delay = api.lv(1, .5, .2); api.sfx('good');
            api.msg(L2(`Found ${k.name}! 👀 Race to the base and call "Pung!"`, `Nakita si ${k.name}! 👀 Takbo sa base at sumigaw ng "Pung!"`), true);
          } else { s.mark = '💨'; api.later(() => s.mark = null, 900); api.msg(L2('Nobody here! Try another place.', 'Walang tao rito! Subukan ang iba.')); }
        }, 550);
      }
      let hudT = 0;
      tickFn = dt => {
        timeLeft -= dt; hudT += dt; if (hudT > .5) { hudT = 0; hud(); }
        if (timeLeft <= 0) { F.frozen = true; return pung >= NEED ? api.finish(saved === 0 ? 2 : 1, L2('Time is up! You found enough friends.', 'Tapos na ang oras! Sapat ang nahanap mo.')) : api.fail(L2('Time is up! Look faster — check places near you first.', 'Tapos na ang oras! Sa susunod, silipin muna ang malalapit.')); }
        spots.forEach(s => { s.wig = Math.max(0, s.wig - dt); if (HINT && s.who !== null && Math.random() < dt * .3) s.wig = .45; });
        if (SNEAK && F.t - lastSneak > 5) {                                   // a hider sneaks home when you are far away
          const k = kids.find(k => k.state === 'hid' && F.dist(me, k) > 70 && F.dist(me, BASE) > 30);
          if (k && Math.random() < .5) { k.spot.who = null; k.hidden = false; k.state = 'sneak'; k.delay = 0; lastSneak = F.t; }
          else lastSneak = F.t - 3;
        }
        kids.forEach(k => {
          if (k.state !== 'race' && k.state !== 'sneak') return;
          if (k.delay > 0) { k.delay -= dt; return; }
          if (F.goTo(k, BASE.x + 6, BASE.y + 2, dt, k.state === 'sneak' ? SPF * .8 : SPF, 3)) {
            k.state = 'saved'; saved++; api.sfx('oops'); hud();
            api.msg(L2(`${k.name} touched the base first: "Save!" 🏃`, `Naunang humawak si ${k.name} sa base: "Save!" 🏃`), true); check();
          } else if (F.dist(me, BASE) < 8) {
            k.state = 'caught'; pung++; api.sfx('good'); k.ring = '#2f9e44'; hud();
            api.msg(L2(`"Pung, ${k.name}!" ✅`, `"Pung, ${k.name}!" ✅`), true); check();
          }
        });
        kids.filter(k => k.state === 'caught' || k.state === 'saved').forEach((k, i) => F.goTo(k, BASE.x - 14 + i * 7, BASE.y + 14, dt, 20, 1));
      };
      function check() { if (pung + saved >= NK && pung < NEED) { F.frozen = true; return api.later(() => api.fail(L2('Too many friends got back to the base first. Run back faster after you find them!', 'Maraming naunang nakabalik sa base. Bumalik agad pagkakita mo sa kanila!')), 700); }
        if (pung + saved >= NK) { F.frozen = true; api.later(() => api.finish(saved === 0 ? 3 : saved === 1 ? 2 : 1, saved === 0 ? L2('You found everyone! Pung, pung, pung!', 'Nahanap mo silang lahat! Pung, pung, pung!') : L2('You found everyone! Some friends were too quick for you.', 'Nahanap mo silang lahat! Pero may naunang nakabalik.')), 700); } }
      hud();
    } else {
      /* ---------------- YOU HIDE ---------------- */
      const SS = api.lv(16, 20, 24, 28), VIS = api.lv(20, 26, 32, 38), SMART = api.lv(.15, .4, .6, .8), CMS = api.lv(1100, 850, 650, 480);
      const seeker = F.actor({ x: BASE.x + 4, y: BASE.y - 2, make: MK.rival(), pose: 'arms', speed: SS, tag: 'Taya', tagBg: '#e03131', tagFg: '#fff' });
      const others = shuffle(spots.slice()).slice(0, 2).map((s, i) => { s.who = 'npc'; return F.actor({ x: s.x, y: s.y + 4, make: MK.pal(i + 1), hidden: true, spot: s, state: 'hid', speed: SPF * .9 }); });
      let phase = 'count', hiddenIn = null, target = null, seen = false, plan = [], wait = 0, pend = null;
      const hud = () => hudSet(F, chip('🙈 ' + L2('Hide!', 'Magtago!')) + chip(hiddenIn ? '🤫 ' + L2('Hiding', 'Nakatago') : '🚶 ' + L2('Not hidden', 'Hindi nakatago'), hiddenIn ? '' : 'red'));
      api.msg(L2(`${P.name}: you HIDE this time! Taya is counting — find a hiding place and tap it!`, `${P.name}: ikaw ang MAGTATAGO! Nagbibilang si Taya — humanap ng taguan at i-tap ito!`), true);
      count(CMS, () => { phase = 'seek'; seeker.pose = null; api.msg(L2('"Here I come!" Stay hidden… or sneak to the 🚩 base when Taya is far away!', '"Hahanapin ko na kayo!" Manatiling nakatago… o pumuslit sa 🚩 base kapag malayo si Taya!'), true); }, false);
      F.onTap = (x, y) => {
        const s = spots.find(s => Math.abs(x - s.x) < s.s * .45 && y < s.y + 4 && y > s.y - s.s);
        if (!s) return false;
        if (s.who === 'npc') { api.msg(L2('Someone is already hiding there!', 'May nakatago na riyan!')); return true; }
        if (near(me, s)) hide(s); else { F.goal = { x: s.x, y: s.y + 5 }; pend = s; }
        return true;
      };
      F.onArrive = () => { if (pend && near(me, pend)) hide(pend); pend = null; };
      function hide(s) { hiddenIn = s; me.x = s.x; me.y = s.y + 3; me.alpha = .45; me.locked = false; api.sfx('pop'); hud(); api.msg(L2('Shh… you are hiding! 🤫 Move to come out.', 'Shh… nakatago ka! 🤫 Gumalaw para lumabas.')); }
      const planNext = () => {
        const open = spots.filter(s => !s.checked);
        if (!open.length) return null;
        if (hiddenIn && !hiddenIn.checked && Math.random() < SMART) return hiddenIn;         // "I heard something over there…"
        return open.sort((a, b) => F.dist(seeker, a) - F.dist(seeker, b))[0];
      };
      const end = (stars, en, tl) => { if (F.frozen) return; F.frozen = true; api.later(() => stars ? api.finish(stars, L2(en, tl)) : api.fail(L2(en, tl)), 600); };
      const CS = Math.round(CMS * 11 / 1000);                       // Taya counts faster on every level
      api.goal({ en: `Hide before Taya counts to 10 (${CS} seconds), then reach the 🚩 base first: "Save!"`, tl: `Magtago bago matapos magbilang si Taya hanggang 10 (${CS} segundo), saka unahan siya sa 🚩 base: "Save!"` });
      tickFn = dt => {
        if (hiddenIn && F.moving(me)) { hiddenIn = null; me.alpha = 1; hud(); }
        if (phase === 'count') return;
        /* reached the base first? */
        if (F.dist(me, BASE) < 9) return seen ? end(2, 'You beat Taya to the base! "Save!" 🏃', 'Naunahan mo si Taya sa base! "Save!" 🏃') : end(3, 'You sneaked back to base without being seen! "Save!" 🤫', 'Nakabalik ka sa base nang hindi nakikita! "Save!" 🤫');
        if (phase === 'race') {                                               // Taya runs to the base to call "Pung!"
          if (F.goTo(seeker, BASE.x + 4, BASE.y, dt, SS * 1.15, 2)) end(0, 'Taya reached the base first: "Pung!" Try again!', 'Naunang nakarating si Taya: "Pung!" Subukan ulit!');
          return;
        }
        if (!hiddenIn && F.dist(seeker, me) < VIS) { seen = true; phase = 'race'; seeker.tag = '👀!'; api.sfx('oops'); api.msg(L2('Taya saw you! Race to the base! 🏃', 'Nakita ka ni Taya! Takbo sa base! 🏃'), true); return; }
        if (wait > 0) { wait -= dt; return; }
        if (!target) { target = planNext(); if (!target) { return end(3, 'Taya gave up — you are the best hider!', 'Sumuko si Taya — ikaw ang pinakamagaling magtago!'); } }
        if (F.goTo(seeker, target.x, target.y + 5, dt, SS, 2)) {
          target.checked = true; target.mark = '🔍'; wait = .8; const t = target; api.later(() => t.mark = null, 800);
          if (hiddenIn === target) { seen = true; phase = 'race'; hiddenIn = null; me.alpha = 1; seeker.tag = '👀!'; api.sfx('oops'); hud(); api.msg(L2('Taya found you! Race to the base! 🏃', 'Nakita ka ni Taya! Takbo sa base! 🏃'), true); }
          else if (target.who === 'npc') { const o = others.find(o => o.spot === target); o.hidden = false; o.state = 'out'; target.who = null; api.msg(L2('Taya found a friend! Pung!', 'May nahanap si Taya! Pung!')); }
          target = null;
        }
        others.forEach((o, i) => { if (o.state === 'out') F.goTo(o, BASE.x - 12 + i * 7, BASE.y + 14, dt, 20, 1); });
      };
      hud();
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
    'Drag (or tap) to run. The dark <b>shade</b> (lilim) under the trees is safe. In the bright <b>sun</b> (araw) Taya can tag you!',
    'The sun moves across the sky, so the shadows slide and shrink — keep watching them! Taya also counts if you stay too long.',
    'Run across the sunshine to a different tree\'s shade to earn a ⭐. If tagged, you are Taya!'
  ],
  tip: 'Play on a sunny morning or afternoon. Ask your child where the shadow will be in a few minutes — a fun way to learn about the sun!',
  start(api) {
    const W = 170, H = 118;
    const trees = [[34, 30], [116, 26], [74, 64], [146, 80], [28, 92], [100, 104]].slice(0, Math.round(api.lv(6, 5, 4)));
    const SR = api.lv(15, 12, 9.5, 8), SUN = api.lv(.05, .09, .14);     // smaller shadows and a faster sun every level
    let ang = 0.2;
    const sh = (t) => { const L = 9 + 6 * Math.abs(Math.cos(ang)); return { x: t[0] + Math.cos(ang) * L, y: t[1] + 4 + Math.sin(ang) * L * .35 }; };
    const zones = trees.map(t => ({ test: (x, y) => { const c = sh(t); return ((x - c.x) / SR) ** 2 + ((y - c.y) / (SR * .55)) ** 2 < 1; }, c: () => sh(t) }));
    const props = trees.map(t => ({ x: t[0], y: t[1], draw(ctx, F) { F.emoji('🌳', t[0], t[1] + 2, 26); } }));
    const F = safeTag(api, {
      W, H, zones, props, solids: trees.map(t => ({ x: t[0], y: t[1], r: 2.2 })),
      ground(ctx, F) {
        GRASS('#b8ec8c', '#a6e07a')(ctx, F);
        ctx.fillStyle = 'rgba(255,240,150,.25)'; ctx.fillRect(0, 0, W, H);
        trees.forEach(t => { const c = sh(t); ctx.fillStyle = 'rgba(20,70,40,.42)'; ctx.beginPath(); ctx.ellipse(c.x, c.y, SR, SR * .55, 0, 0, 7); ctx.fill(); });
      },
      over(ctx, F) { const sx = W / 2 - Math.cos(ang) * 70; F.emoji('☀️', clamp(sx, 8, W - 8), 14, 12); },
      tick(dt) { ang += dt * SUN; if (ang > Math.PI - .2) ang = .2; },
      goalEn: n => `Run to ${n} different shadows`, goalTl: n => `Tumakbo sa ${n} iba't ibang lilim`,
      startMsg: L2('Stay in the shade! The shadows move with the sun ☀️.', 'Manatili sa lilim! Gumagalaw ang anino kasama ng araw ☀️.'),
      caughtMsg: L2('Tagged in the sunshine! Now YOU are Taya — tag a friend!', 'Nataya ka sa araw! Ikaw na ang Taya — tayain ang kaibigan!'),
      winMsg: L2('You played tag in the sun and the shade!', 'Ang galing mo sa araw at lilim!')
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
    'You are the Mother Hen (Inahin). Your chicks hold on in a line behind you and follow you everywhere.',
    'The Hawk (Lawin) tries to run around you and touch the LAST chick. Drag (or use the arrows) to move and keep your body between the hawk and your chicks!',
    'Keep your chicks safe until the time runs out. The hawk gets faster and trickier every level.'
  ],
  tip: 'Chicks hold on firmly (but gently!) and the hen should mirror the hawk. Start slow so little ones can follow along.',
  start(api) {
    const W = 140, H = 112, N = Math.min(6, 3 + Math.floor(api.level / 8)), DUR = Math.round(api.lv(20, 28, 36, 45)), HS = api.lv(19, 23, 27, 31), FEINT = api.lv(.25, .6, 1);   // more chicks every 8 levels; a faster, trickier hawk and a longer time on every level
    const MAYLOSE = Math.round(api.lv(2, 1.5, 1, 1));
    const F = FZ.field(api, { W, H, ground: GRASS('#a6e38a', '#95d679'), tick, solids: [] });
    const me = F.me = F.actor({ x: W / 2, y: 62, make: MK.me(), pose: 'arms', speed: 30, r: 4 });
    const chicks = Array.from({ length: N }, (_, i) => F.actor({ x: W / 2, y: 70 + i * 7, make: MK.pal(i, { flip: false }), speed: 40, solid: false, h: 14 }));
    const hawk = F.actor({ x: W / 2, y: 12, make: MK.rival({ shirt: '#8b5e34', shorts: '#4a2f12', skin: '#c58a55' }), pose: 'arms', speed: HS, tag: L2('Lawin', 'Lawin'), tagBg: '#8b5e34', tagFg: '#fff', side: 1, rest: 1.5 });
    const taken = [];
    let left = DUR, lost = 0;
    const hud = () => { hudSet(F, chip('⏱️ ' + Math.ceil(left))); api.progress('🐥 ' + chicks.length + ' / ' + N); };
    api.goal({ en: `Keep at least ${N - MAYLOSE} of ${N} chicks safe for ${DUR} seconds`, tl: `Iligtas ang ${N - MAYLOSE} o higit pa sa ${N} sisiw sa loob ng ${DUR} segundo`, hearts: MAYLOSE + 1 });
    api.msg(L2('Protect your chicks! Stay between the hawk and the last chick.', 'Protektahan ang mga sisiw! Pumagitna sa lawin at sa huling sisiw.'), true);
    function tick(dt) {
      left -= dt; hud();
      if (left <= 0) return end();
      let prev = me;                                          // the line of chicks holds on behind you
      chicks.forEach(c => { const d = F.dist(c, prev), sp = 7; if (d > sp) { c.x = prev.x + (c.x - prev.x) / d * sp; c.y = prev.y + (c.y - prev.y) / d * sp; c.vx = (prev.vx || 0); c.vy = (prev.vy || 0); c.step += dt * 3; c.face = c.x > prev.x ? -1 : 1; } else { c.vx = c.vy = 0; } c.x = clamp(c.x, 4, W - 4); c.y = clamp(c.y, 6, H - 3); prev = c; });
      taken.forEach((t, i) => F.goTo(t, 10 + i * 7, 10, dt, 30, .5));
      if (hawk.rest > 0) { hawk.rest -= dt; F.goTo(hawk, W / 2 + Math.sin(F.t) * 30, 14, dt, HS * .7, 1); return; }
      const tail = chicks[chicks.length - 1]; if (!tail) return end();
      /* the hawk runs around the hen toward the last chick; sometimes it fakes one way and goes the other */
      if (Math.random() < FEINT * dt) hawk.side *= -1;
      let dx = tail.x - hawk.x, dy = tail.y - hawk.y; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
      const hx = me.x - hawk.x, hy = me.y - hawk.y, hd = Math.hypot(hx, hy);
      if (hd < 18) { const px = -hy / hd * hawk.side, py = hx / hd * hawk.side, k = (18 - hd) / 18 * 2.2; dx += px * k - hx / hd * k * .4; dy += py * k - hy / hd * k * .4; }
      F.walk(hawk, dx, dy, dt, HS);
      /* bodies can't pass through each other: the hen blocks the hawk */
      [me, ...chicks.slice(0, -1)].forEach((b, i) => { const m = i === 0 ? 8 : 5.5, ex = hawk.x - b.x, ey = hawk.y - b.y, e = Math.hypot(ex, ey); if (e < m && e > .01) { hawk.x = b.x + ex / e * m; hawk.y = b.y + ey / e * m; } });
      if (F.dist(hawk, tail) < 5) {
        lost++; api.sfx('oops'); chicks.pop();
        if (!api.loseHeart() || lost > MAYLOSE) { F.frozen = true; return api.fail(L2('The hawk took too many chicks. Keep your body between the hawk and the last chick!', 'Maraming sisiw ang nakuha ng lawin. Iharang ang katawan mo sa pagitan ng lawin at ng huling sisiw!')); } tail.ring = '#8b5e34'; taken.push(tail); hawk.rest = 1.8;
        api.msg(chicks.length ? L2('The hawk got a chick! Keep the others safe!', 'Nakuha ng lawin ang isang sisiw! Bantayan ang iba!') : L2('The hawk got all the chicks!', 'Nakuha ng lawin ang lahat ng sisiw!'), true);
        if (!chicks.length) end();
      }
    }
    function end() { if (F.frozen) return; F.frozen = true; const s = api.heartStars(); api.finish(s, chicks.length ? L2(`You kept ${chicks.length} chick${chicks.length > 1 ? 's' : ''} safe!`, `Ligtas ang ${chicks.length} sisiw mo!`) : L2('Nice try, Inahin! Play again to save them all.', 'Magaling, Inahin! Subukan ulit para mailigtas silang lahat.')); }
    hud();
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
    'Drag (or tap) to run. Touch a <b>fence</b> or <b>post</b> to be safe (green ring).',
    'You can\'t hold on forever — Taya counts! When your number runs out, run to a DIFFERENT fence. Each new fence is a ⭐.',
    'If Taya tags you away from the fence, you are Taya: chase and tag a friend!'
  ],
  tip: 'Pick a few different fences or posts so children keep moving between them. Make a rule: only 5 seconds on one fence!',
  start(api) {
    const W = 170, H = 118;
    const all = [
      { x: 20, y: 22, w: 34, h: 2.4 }, { x: 116, y: 22, w: 34, h: 2.4 }, { x: 78, y: 54, w: 2.4, h: 28 },
      { x: 20, y: 96, w: 30, h: 2.4 }, { x: 122, y: 96, w: 30, h: 2.4 }, { r: 2, x: 46, y: 60 }, { r: 2, x: 126, y: 60 }, { r: 2, x: 84, y: 104 }
    ];
    const fences = all.slice(0, Math.round(api.lv(8, 7, 6, 5)));
    const TOUCH = api.lv(4.2, 3.4);
    const dToF = (f, x, y) => f.r ? Math.hypot(x - f.x, y - f.y) - f.r : Math.hypot(x - clamp(x, f.x, f.x + f.w), y - clamp(y, f.y, f.y + f.h));
    const zones = fences.map(f => ({ test: (x, y) => dToF(f, x, y) < TOUCH, c: () => f.r ? { x: f.x, y: f.y + f.r + 2 } : { x: f.x + f.w / 2, y: f.y + f.h + 2.5 } }));
    const props = fences.map(f => ({
      x: f.x, y: f.r ? f.y : f.y + f.h,
      draw(ctx) {
        if (f.r) { ctx.fillStyle = '#7a4b2a'; ctx.fillRect(f.x - 1.6, f.y - 14, 3.2, 14); ctx.fillStyle = '#a0703f'; ctx.beginPath(); ctx.ellipse(f.x, f.y - 14, 1.6, .7, 0, 0, 7); ctx.fill(); return; }
        ctx.fillStyle = '#8a5a2c';
        if (f.w > f.h) { for (let x = f.x; x <= f.x + f.w; x += 5) ctx.fillRect(x - .8, f.y + f.h - 11, 1.6, 11); ctx.fillStyle = '#c08552'; ctx.fillRect(f.x, f.y + f.h - 9, f.w, 1.8); ctx.fillRect(f.x, f.y + f.h - 4.5, f.w, 1.8); }
        else { ctx.fillStyle = '#c08552'; ctx.fillRect(f.x - .3, f.y - 10, f.w + .6, f.h + 10); ctx.fillStyle = '#8a5a2c'; for (let y = f.y - 10; y < f.y + f.h; y += 5) ctx.fillRect(f.x - .6, y, f.w + 1.2, 1); }
      }
    }));
    safeTag(api, {
      W, H, zones, props, solids: fences.map(f => f.r ? { x: f.x, y: f.y, r: f.r } : { x: f.x, y: f.y, w: f.w, h: f.h }), ground: GRASS('#a9df8a', '#98d27a'),
      goalEn: n => `Touch ${n} different fences or posts`, goalTl: n => `Humawak sa ${n} iba't ibang bakod o poste`,
      startMsg: L2('Touch a fence or post to be safe. Keep moving to new ones!', 'Humawak sa bakod o poste para ligtas. Lumipat-lipat!'),
      caughtMsg: L2('Tagged away from the fence! Now YOU are Taya — tag a friend!', 'Nataya ka malayo sa bakod! Ikaw na ang Taya — tayain ang kaibigan!'),
      countMsg: L2('Taya counted! Let go and run to another fence!', 'Nagbilang na si Taya! Bitaw at takbo sa ibang bakod!'),
      winMsg: L2('You are a fence-hugging champion!', 'Kampeon ka sa Kapitang Bakod!')
    });
  }
});


