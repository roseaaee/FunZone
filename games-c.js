'use strict';
/* =====================================================
   GAMES C – Husay (skill) & board games
   Sipa, Holen, Sungka, Dama
   ===================================================== */

/* ---------------- SIPA ---------------- */
FZ.reg({
  id: 'sipa', cat: 'skill', name: 'Sipa', emoji: '🦵', color: '#e8590c',
  tag: 'Keep the sipa in the air — no hands!',
  players: '1 or more kids', props: 'A sipa (a washer wrapped in plastic strands) or a light ball',
  real: [
    'The <b>sipa</b> is a metal washer with colourful plastic strips attached, so it flutters down slowly.',
    'Toss it up and kick it with the inside of your foot, your knee, or even your elbow to keep it from falling.',
    'You may <b>never use your hands</b>! Count how many kicks you can do in a row.',
    'Sipa is considered the Philippines\' traditional national game. Kids can play alone, or pass it around a circle.'
  ],
  how: [
    '<b>Move:</b> drag or swipe left and right (or use the ← → keys) to get under the falling sipa.',
    '<b>Kick:</b> when the sipa comes down to you, tap the screen. Your player uses the right part by itself: foot when it is low, knee in the middle, elbow when it is high.',
    'No hands! Each level has a kick goal (🎯 at the top). If the sipa touches the ground you lose a heart.'
  ],
  tip: 'Make a homemade sipa from a washer and a few strips of plastic bag. Start by letting your child kick it low, close to the ground.',
  start(api) {
    /* LEVELS: more kicks needed, the sipa falls faster and flies further sideways, and your reach is a little smaller every level */
    const GF = api.lv(0.36, 0.48, 0.6, 0.72), DRIFT = api.lv(.08, .22, .36, .48), REACH = api.lv(.15, .12, .1, .085);
    const KICKS = 5 + api.level;
    api.goal({ en: `Kick the sipa ${KICKS} times without hands`, tl: `Sipain ang sipa nang ${KICKS} beses nang walang kamay`, hearts: 3 });
    const arena = h(`<div class="sipaarena sipa2"><div class="gnd"></div><div class="kid" role="button" aria-label="Kick">${FZ.me('stand')}</div><div class="sipa"><div class="strands"></div><div class="washer"></div></div><div class="swipe">⬅️ ${FZ.lang === 'tl' ? 'i-swipe' : 'swipe'} ➡️</div></div>`);
    const hud = h(`<div class="sipa-cnt">${FZ.lang === 'tl' ? 'Sipa' : 'Kicks'}: <span id="sk">0</span>/${KICKS}</div>`);
    api.stage.append(hud); api.stage.append(arena);
    const sp = $('.sipa', arena), kidEl = $('.kid', arena);
    let W = arena.clientWidth, H = arena.clientHeight;
    api.on(window, 'resize', () => { W = arena.clientWidth; H = arena.clientHeight; });
    const GROUND = () => H * .9, KH = () => Math.min(H * .42, W * .5);                 // where the feet are, and how tall the player is
    let kx = W / 2, tx = W / 2, x = W / 2, y = 10, vx = 0, vy = 0, count = 0, lives = 3, wait = .8, posing = 0;
    const SPEED = () => W * 1.6;                                                     // how fast your player runs
    const g = () => H * 1.9 * GF;
    function place() {
      const kh = KH(); kidEl.style.height = kh + 'px'; kidEl.style.width = kh * .68 + 'px';
      kidEl.style.left = (kx - kh * .34) + 'px'; kidEl.style.top = (GROUND() - kh) + 'px';
      sp.style.transform = `translate(${x}px,${y}px) rotate(${vx * .05}deg)`;
    }
    function drop() { y = 10; vy = 0; x = clamp(kx + rnd(-W * DRIFT, W * DRIFT), 30, W - 30); vx = 0; wait = 1; }
    api.frame(dt => {
      /* your player runs toward your finger (or the arrow keys) */
      const d = tx - kx; kx += Math.sign(d) * Math.min(Math.abs(d), SPEED() * dt); kx = clamp(kx, 30, W - 30);
      if (posing > 0 && (posing -= dt) <= 0) kidEl.innerHTML = FZ.me('stand');
      if (wait > 0) { wait -= dt; place(); return; }
      vy += g() * dt; y += vy * dt; x += vx * dt;
      if (x < 16 || x > W - 16) { vx = -vx; x = clamp(x, 16, W - 16); }
      if (y + 50 > GROUND()) {                                                       // the sipa touched the ground
        lives--; api.loseHeart(); api.sfx('oops');
        if (lives <= 0) return api.fail(FZ.lang === 'tl' ? 'Bumagsak ang sipa nang 3 beses. Habulin ito at sipain bago bumagsak!' : 'The sipa fell 3 times. Chase it and kick it before it lands!');
        api.msg(FZ.lang === 'tl' ? 'Bumagsak! Habulin ang sipa — i-swipe pakaliwa o pakanan.' : 'It fell! Chase the sipa — swipe left or right.', true); drop();
      }
      place();
    });
    /* ONE tap kicks. Your player picks the body part by itself: foot (low), knee (middle) or elbow (high) */
    function kick() {
      if (wait > 0) return;
      const kh = KH(), sy = y + 50, h = (GROUND() - sy) / kh;                        // how high the sipa is: 0 = ground, 1 = top of your head
      const close = Math.abs(x - kx) < Math.max(34, W * REACH);
      const pose = h > .62 ? 'elbow' : h > .3 ? 'knee' : 'kick';
      kidEl.innerHTML = FZ.me(pose); posing = .4;
      if (!close || h > 1 || vy < -50) {
        api.sfx('pop');
        if (!close) api.msg(FZ.lang === 'tl' ? 'Masyadong malayo! Lumapit muna sa sipa.' : 'Too far! Move under the sipa first.');
        else api.msg(FZ.lang === 'tl' ? 'Mataas pa — hintaying bumaba ang sipa, saka pumindot!' : 'Still too high — wait for it to come down, then tap!');
        return;
      }
      count++; $('#sk').textContent = count; api.sfx('good');
      vy = -Math.sqrt(2 * g() * H * .55); vx = rnd(-1, 1) * W * DRIFT * 1.2;
      const plus = h_('+1'); plus.style.left = x + 'px'; plus.style.top = (y - 10) + 'px'; arena.append(plus); setTimeout(() => plus.remove(), 800);
      api.progress(`🦶 ${count} / ${KICKS}`);
      if (count >= KICKS) return api.finish(api.heartStars(), FZ.lang === 'tl' ? `Nasipa mo ang sipa nang ${count} beses nang walang kamay!` : `You kicked the sipa ${count} times without hands!`);
      if (count === 1) api.msg(FZ.lang === 'tl' ? 'Galing! Sundan ito habang bumabagsak.' : 'Great! Follow it as it falls.', true);
    }
    const h_ = t => h(`<div class="plus">${t}</div>`);
    /* touch and mouse: a quick TAP anywhere kicks; SWIPE / drag left and right to run */
    let drag = null;
    const fx = e => e.clientX - arena.getBoundingClientRect().left;
    api.on(arena, 'pointerdown', e => {
      e.preventDefault();
      if (e.target.closest('.kid')) { drag = null; return kick(); }                  // tapping your player kicks at once
      drag = { id: e.pointerId, x0: fx(e), moved: false }; try { arena.setPointerCapture(e.pointerId); } catch (x) { }
    });
    api.on(arena, 'pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const X = fx(e); if (!drag.moved && Math.abs(X - drag.x0) > 10) drag.moved = true; if (drag.moved) tx = X; });
    api.on(arena, 'pointerup', e => { if (drag && e.pointerId === drag.id && !drag.moved) kick(); drag = null; });
    api.on(arena, 'pointercancel', () => { drag = null; });
    const held = new Set();
    api.on(window, 'keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { held.add(e.key); e.preventDefault(); }
      if (e.code === 'Space' || e.key === 'k' || e.key === 'f' || e.key === 'e') { e.preventDefault(); kick(); }
    });
    api.on(window, 'keyup', e => held.delete(e.key));
    api.every(() => { if (held.has('ArrowLeft')) tx = kx - 40; else if (held.has('ArrowRight')) tx = kx + 40; }, 30);
    place();
    api.msg(FZ.lang === 'tl' ? 'I-swipe para lumapit sa sipa, saka pumindot para sumipa!' : 'Swipe to get under the sipa, then tap to kick!', true);
  }
});

FZ.reg({
  id: 'holen', cat: 'skill', name: 'Holen', emoji: '<svg class="emsvg" viewBox="0 0 64 64" width="1em" height="1em" aria-hidden="true" style="vertical-align:-0.12em"><ellipse cx="32" cy="44" rx="30" ry="15" fill="#d9a066"/><ellipse cx="34" cy="42" rx="20" ry="9.5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/><circle cx="28" cy="40" r="5" fill="#e7f5ff" stroke="#74c0fc" stroke-width="1"/><path d="M25 41 q3 -5 6 0" fill="none" stroke="#e03131" stroke-width="2.2" stroke-linecap="round"/><circle cx="26.2" cy="38" r="1.2" fill="#fff"/><circle cx="39" cy="38" r="5" fill="#e7f5ff" stroke="#74c0fc" stroke-width="1"/><path d="M36 39 q3 -5 6 0" fill="none" stroke="#2f9e44" stroke-width="2.2" stroke-linecap="round"/><circle cx="37.2" cy="36" r="1.2" fill="#fff"/><circle cx="44" cy="45" r="5" fill="#e7f5ff" stroke="#74c0fc" stroke-width="1"/><path d="M41 46 q3 -5 6 0" fill="none" stroke="#f59f00" stroke-width="2.2" stroke-linecap="round"/><circle cx="42.2" cy="43" r="1.2" fill="#fff"/><circle cx="32" cy="47" r="5" fill="#e7f5ff" stroke="#74c0fc" stroke-width="1"/><path d="M29 48 q3 -5 6 0" fill="none" stroke="#1c7ed6" stroke-width="2.2" stroke-linecap="round"/><circle cx="30.2" cy="45" r="1.2" fill="#fff"/><path d="M2 25 l6 3 M1 32 l6 1" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/><circle cx="14" cy="31" r="6.5" fill="#e7f5ff" stroke="#339af0" stroke-width="1.2"/><path d="M10 32 q4 -6.5 8 0" fill="none" stroke="#7048e8" stroke-width="2.6" stroke-linecap="round"/><circle cx="11.6" cy="28.4" r="1.6" fill="#fff"/></svg>', color: '#1c7ed6',   // glass marbles in a chalk ring (there is no marble emoji)
  tag: 'Flick your pamato and win marbles from the circle!',
  players: '2–5 kids', props: 'Glass marbles (holen) and chalk to draw a circle',
  real: [
    '<b>Bilog</b> (the ring game): draw a circle on the ground and put everyone\'s bet marbles in the middle.',
    'To decide who goes first, each player shoots toward a line drawn far away (<b>pitik sa guhit</b>). Closest to the line goes first.',
    'Shoot your <b>pamato</b> (shooter marble) from the edge of the circle with a <b>pitik</b>: knuckle on the ground, flick with your thumb. No moving your hand forward (<b>bawal ang sungkit</b>)!',
    'Every marble you knock OUT of the circle is yours. If you knock one out and your pamato stays inside, shoot again from where it stopped. Most marbles wins!'
  ],
  how: [
    '<b>Pitik sa guhit:</b> first, flick toward the line 〰️. Whoever stops closest to the line shoots first.',
    '<b>Flick:</b> put your finger down, <b>pull back</b> (away from where you want to shoot), then let go. A longer pull is a harder flick.',
    'Knock marbles OUT of the circle to win them. Knock one out and stay inside → shoot again! Get more than your opponent to win.'
  ],
  tip: 'Play on flat, smooth ground. Keep marbles away from toddlers and babies, who may put them in their mouths. Always count marbles before and after!',
  start(api) {
    /* LEVELS: more marbles in the ring, a better opponent (aims straighter, judges power better), a bigger ring,
       and a shorter aiming guide every level. Goal: win more marbles than your opponent. */
    const L = FZ.lang === 'tl';
    const OPP = api.lv([{ n: 'Bunso', e: '🧒' }], [{ n: 'Ate Mae', e: '👧' }], [{ n: 'Kuya Ben', e: '👦' }], [{ n: 'Lolo Ambo', e: '👴' }])[0];
    const NM = Math.min(13, 5 + 2 * Math.floor(api.level / 5)), ERR = api.lv(16, 9, 5, 2.5), POWERR = api.lv(.35, .2, .1, .05), GUIDE = api.lv(1, .65, .35, .18);
    const S = 100, RR = api.lv(30, 33, 36, 38), C = { x: 50, y: 52 }, mr = 2.1, sr = 2.7, FR = 0.985;
    api.goal({ en: `Win more marbles than ${OPP.n} ${OPP.e} (${NM} in the ring)`, tl: `Makakuha ng mas maraming holen kaysa kay ${OPP.n} ${OPP.e} (${NM} sa bilog)` });
    const size = () => Math.max(220, Math.min(api.stage.clientWidth || innerWidth, 520, (window.visualViewport ? visualViewport.height : innerHeight) - api.stage.getBoundingClientRect().top - 70));
    const wrap = h(`<div class="holen2"><canvas></canvas></div>`), cv = $('canvas', wrap), ctx = cv.getContext('2d');
    const score = h(`<div class="hscore"><span class="me">🔵 ${L ? 'Ikaw' : 'You'}: <b id="hsMe">0</b></span><span class="op">🔴 ${OPP.n}: <b id="hsOp">0</b></span></div>`);
    api.stage.append(score); api.stage.append(wrap);
    /* the ground fills ALL the free space; the 100×100 play area (line, circle) sits in the middle of it */
    let px = 1, VW = S, VH = S, OX = 0, OY = 0;
    const fit = () => {
      const fh = parseFloat(getComputedStyle(wrap).getPropertyValue('--fh')) || 0, d = Math.min(2, devicePixelRatio || 1);
      const w = Math.max(220, (api.stage.clientWidth || innerWidth) - 10), hh = fh ? Math.max(220, fh - 10) : size();
      VW = Math.max(S, S * w / hh); VH = Math.max(S, S * hh / w); OX = (VW - S) / 2; OY = (VH - S) / 2;
      cv.style.width = w + 'px'; cv.style.height = hh + 'px'; cv.width = Math.round(w * d); cv.height = Math.round(hh * d); px = cv.width / VW;
    };
    fit(); api.on(window, 'resize', fit);
    const cols = ['#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8', '#ff922b', '#22b8cf', '#f06595'];
    let balls = [];
    const me = { x: 40, y: 92, vx: 0, vy: 0, r: sr, col: '#1c7ed6', who: 'me', shooter: true };
    const op = { x: 60, y: 92, vx: 0, vy: 0, r: sr, col: '#e03131', who: 'op', shooter: true };
    let phase = 'lag', turn = 'me', won = { me: 0, op: 0 }, aim = null, moving = false, shotBy = null, gotThisShot = 0, hitShooter = false, lagDone = {};
    const LAGY = 12;
    function setupRing() {
      balls = [];
      for (let i = 0; i < NM; i++) {                                               // a little cross of marbles in the middle, like real life
        const a = i * 2.399, r = i === 0 ? 0 : 2.8 * Math.sqrt(i) * 1.3;
        balls.push({ x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r, vx: 0, vy: 0, r: mr, col: cols[i % cols.length] });
      }
      me.inRing = op.inRing = false;
    }
    const inRing = b => Math.hypot(b.x - C.x, b.y - C.y) < RR;
    const all = () => balls.concat(phase === 'ring' ? [me, op].filter(s => s.inRing || s === (turn === 'me' ? me : op)) : [me, op]);
    /* ---------------- drawing ---------------- */
    function draw() {
      ctx.setTransform(px, 0, 0, px, OX * px, OY * px);
      ctx.fillStyle = '#d9b382'; ctx.fillRect(-OX, -OY, VW, VH);
      ctx.fillStyle = 'rgba(120,80,40,.12)'; for (let i = 0; i < 120 * VW * VH / S / S; i++) ctx.fillRect(-OX + (i * 53.7) % VW, -OY + (i * 31.3 + i % 5 * 7) % VH, 1, .6);
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = .9;
      if (phase === 'lag') {
        ctx.setLineDash([2, 1.5]); ctx.beginPath(); ctx.moveTo(6, LAGY); ctx.lineTo(S - 6, LAGY); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(6, 96); ctx.lineTo(S - 6, 96); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 4px system-ui'; ctx.textAlign = 'center'; ctx.fillText(L ? 'GUHIT' : 'LINE', 50, LAGY - 2.5);
      } else { ctx.beginPath(); ctx.arc(C.x, C.y, RR, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); }
      const list = phase === 'lag' ? [me, op] : balls.concat([me, op].filter(s => s.placed));
      list.forEach(b => {
        if (b.gone) return;
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(b.x + .5, b.y + .7, b.r, b.r * .8, 0, 0, 7); ctx.fill();
        const g = ctx.createRadialGradient(b.x - b.r * .35, b.y - b.r * .4, b.r * .1, b.x, b.y, b.r); g.addColorStop(0, '#fff'); g.addColorStop(.35, b.col); g.addColorStop(1, b.col);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
        if (!b.shooter) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * .5, .3, 2.6); ctx.stroke(); }
      });
      const mine = turn === 'me' && !moving;
      if (mine && phase === 'ring' && !me.inRing) {                              // you may pick any spot on the edge
        ctx.strokeStyle = 'rgba(28,126,214,.5)'; ctx.lineWidth = 2.2; ctx.setLineDash([1.5, 2]); ctx.beginPath(); ctx.arc(C.x, C.y, RR + 3.5, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      if (aim && mine) {                                                          // the aiming guide (shorter on later levels)
        const L2_ = 6 + aim.p * 60 * GUIDE;
        ctx.strokeStyle = 'rgba(28,126,214,.95)'; ctx.lineWidth = .9; ctx.setLineDash([1.6, 1.2]);
        ctx.beginPath(); ctx.moveTo(me.x, me.y); ctx.lineTo(me.x + Math.cos(aim.a) * L2_, me.y + Math.sin(aim.a) * L2_); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#fff'; ctx.fillRect(me.x - 8, me.y + 4.5, 16, 2.4); ctx.fillStyle = aim.p > .92 ? '#e03131' : '#40c057'; ctx.fillRect(me.x - 8, me.y + 4.5, 16 * aim.p, 2.4);
      }
    }
    /* ---------------- physics: rolling, bumping, slowing down ---------------- */
    function step(dt) {
      const L_ = all(); let any = false;
      for (let k = 0; k < 4; k++) {
        L_.forEach(b => { if (b.gone) return; b.x += b.vx * dt / 4; b.y += b.vy * dt / 4; });
        for (let i = 0; i < L_.length; i++) for (let j = i + 1; j < L_.length; j++) {
          const a = L_[i], b = L_[j]; if (a.gone || b.gone) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
          if (d < m && d > 0.001) {
            const nx = dx / d, ny = dy / d, rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            const ov = (m - d) / 2; a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
            if (rel > 0) {
              const ma = a.shooter ? 1.3 : 1, mb = b.shooter ? 1.3 : 1, J = 2 * rel / (ma + mb) * .95;   // the pamato is a little heavier
              a.vx -= J * mb * nx; a.vy -= J * mb * ny; b.vx += J * ma * nx; b.vy += J * ma * ny;
              if (rel > 8) api.sfx('pop');
              if (phase === 'ring' && ((a === shotBy && b === (shotBy === me ? op : me)) || (b === shotBy && a === (shotBy === me ? op : me)))) hitShooter = true;
            }
          }
        }
      }
      const f = Math.pow(FR, dt * 60);
      L_.forEach(b => { b.vx *= f; b.vy *= f; const sp = Math.hypot(b.vx, b.vy); if (sp < 1.2) { b.vx = b.vy = 0; } else any = true;
        const x0 = 1 - OX, x1 = S + OX - 1, y0 = 1 - OY, y1 = S + OY - 1;                   // marbles stop at the edge of the screen
        if (b.x < x0 || b.x > x1) { b.vx *= -.5; b.x = clamp(b.x, x0, x1); } if (b.y < y0 || b.y > y1) { b.vy *= -.5; b.y = clamp(b.y, y0, y1); } });
      return any;
    }
    api.frame(dt => {
      dt = Math.min(dt, 1 / 30);
      if (moving) { const any = step(dt); if (!any) { moving = false; settled(); } }
      draw();
    });
    /* ---------------- shooting ---------------- */
    function shoot(b, ang, pow) { b.vx = Math.cos(ang) * pow * 95; b.vy = Math.sin(ang) * pow * 95; shotBy = b; gotThisShot = 0; hitShooter = false; moving = true; api.sfx('jump'); }
    function settled() {
      if (phase === 'lag') {
        lagDone[shotBy.who] = true;
        if (!lagDone.op) { api.later(() => aiLag(), 600); return; }
        const dm = Math.abs(me.y - LAGY), dop = Math.abs(op.y - LAGY);
        turn = dm <= dop ? 'me' : 'op';
        api.msg(turn === 'me' ? (L ? 'Mas malapit ka sa guhit — ikaw ang mauuna! 🔵' : 'You are closest to the line — you go first! 🔵') : (L ? `Mas malapit si ${OPP.n} — siya ang mauuna.` : `${OPP.n} is closer — ${OPP.n} goes first.`), true);
        api.later(() => { phase = 'ring'; setupRing(); startTurn(); }, 1600);
        return;
      }
      /* count the marbles that left the ring */
      balls.forEach(b => { if (!b.gone && !inRing(b)) { b.gone = true; won[shotBy.who]++; gotThisShot++; } });
      $('#hsMe').textContent = won.me; $('#hsOp').textContent = won.op;
      const left = balls.filter(b => !b.gone).length;
      api.progress(`🔵 ${won.me} · 🔴 ${won.op}`);
      if (gotThisShot) api.sfx('good');
      if (hitShooter) { won[shotBy.who]++; $('#hsMe').textContent = won.me; $('#hsOp').textContent = won.op; api.msg(L ? 'Patay! Natamaan ang pamato ng kalaban: +1! 💥' : 'Patay! You hit the other pamato: +1! 💥', true); }
      shotBy.inRing = inRing(shotBy);
      if (!left) return end();
      const again = gotThisShot > 0 && shotBy.inRing;                         // real rule: knocked one out AND your pamato stayed inside → shoot again
      if (!again) { turn = turn === 'me' ? 'op' : 'me'; }
      if (turn === 'me') api.msg(again ? (L ? `Nakakuha ka ng ${gotThisShot}! Tira ulit mula sa kinatigilan ng pamato mo.` : `You won ${gotThisShot}! Shoot again from where your pamato stopped.`) : (L ? 'Ikaw na! Pumili ng puwesto sa gilid ng bilog o tumira mula sa pamato mo.' : 'Your turn! Pick a spot on the edge of the circle, or shoot from your pamato.'), true);
      else api.msg(again ? (L ? `Nakakuha si ${OPP.n} — tira ulit siya.` : `${OPP.n} won one — shooting again.`) : (L ? `Si ${OPP.n} naman.` : `${OPP.n}'s turn.`), true);
      api.later(startTurn, 900);
    }
    function startTurn() {
      api.progress(`🔵 ${won.me} · 🔴 ${won.op}`);
      const s = turn === 'me' ? me : op;
      if (!s.inRing) { const a = turn === 'me' ? Math.PI / 2 : -Math.PI / 2; s.x = C.x + Math.cos(a) * (RR + 3.5); s.y = C.y + Math.sin(a) * (RR + 3.5); s.vx = s.vy = 0; }
      s.placed = true;
      if (turn === 'op') api.later(aiShot, 900);
    }
    function end() {
      if (won.me > won.op) api.finish(won.op === 0 ? 3 : won.me - won.op >= 3 ? 3 : 2, L ? `Panalo ka! ${won.me} laban sa ${won.op} na holen.` : `You win! ${won.me} marbles to ${won.op}.`);
      else if (won.me === won.op) api.fail(L ? `Tabla! ${won.me} laban sa ${won.op}. Subukan ulit para manalo!` : `A tie! ${won.me} to ${won.op}. Try again to win!`);
      else api.fail(L ? `Panalo si ${OPP.n}, ${won.op} laban sa ${won.me}. Hilahin nang tama at asintahin ang gilid ng holen!` : `${OPP.n} wins, ${won.op} to ${won.me}. Pull back just right and aim at the edge of a marble!`);
    }
    /* ---------------- the computer player ---------------- */
    function aiLag() { const want = (op.y - LAGY) / 95 / .985 * .75; shoot(op, -Math.PI / 2 + (Math.random() - .5) * ERR * .02, clamp(want * (1 + (Math.random() - .5) * POWERR * 2), .2, 1)); }
    function aiShot() {
      /* pick the marble that is easiest to push out: close to the edge and lined up with the shooter */
      const targets = balls.filter(b => !b.gone);
      if (!op.inRing) {                                                           // choose the best spot on the edge first
        const t = targets.slice().sort((a, b) => Math.hypot(b.x - C.x, b.y - C.y) - Math.hypot(a.x - C.x, a.y - C.y))[0];
        const a = Math.atan2(t.y - C.y, t.x - C.x) + Math.PI + (Math.random() - .5) * .6; op.x = C.x + Math.cos(a) * (RR + 3.5); op.y = C.y + Math.sin(a) * (RR + 3.5);
      }
      const t = targets.map(b => { const d = Math.hypot(b.x - op.x, b.y - op.y), out = RR - Math.hypot(b.x - C.x, b.y - C.y); return [d * .6 + out, b]; }).sort((a, b) => a[0] - b[0])[0][1];
      const ang = Math.atan2(t.y - op.y, t.x - op.x) + (Math.random() - .5) * ERR * Math.PI / 90;
      const pow = clamp((Math.hypot(t.x - op.x, t.y - op.y) + 30) / 95 * (1 + (Math.random() - .5) * POWERR * 2), .3, 1);
      shoot(op, ang, pow);
    }
    /* ---------------- your flick: finger down, pull back, let go ---------------- */
    const W2 = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * VW - OX, y: (e.clientY - r.top) / r.height * VH - OY }; };
    cv.style.touchAction = 'none';
    api.on(cv, 'pointerdown', e => {
      e.preventDefault(); if (turn !== 'me' || moving || (phase === 'lag' && lagDone.me)) return;
      const w = W2(e);
      if (phase === 'ring' && !me.inRing) {                                    // tap near the edge to move your pamato there
        const dc = Math.hypot(w.x - C.x, w.y - C.y);
        if (Math.abs(dc - RR) < 9 && Math.hypot(w.x - me.x, w.y - me.y) > 6) { const a = Math.atan2(w.y - C.y, w.x - C.x); me.x = C.x + Math.cos(a) * (RR + 3.5); me.y = C.y + Math.sin(a) * (RR + 3.5); return; }
      }
      if (phase === 'lag') { const w2 = W2(e); if (w2.y > 80) me.x = clamp(w2.x, 10, 90); }
      aim = { s: w, a: -Math.PI / 2, p: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (x) { }
    });
    api.on(cv, 'pointermove', e => { if (!aim) return; const w = W2(e), dx = aim.s.x - w.x, dy = aim.s.y - w.y, d = Math.hypot(dx, dy); if (d < 1.5) return; aim.a = Math.atan2(dy, dx); aim.p = clamp(d / 32, 0, 1); });
    const rel = () => { if (!aim) return; const a = aim; aim = null; if (a.p < .06) return; shoot(me, a.a, a.p); };
    api.on(cv, 'pointerup', rel); api.on(cv, 'pointercancel', rel);
    const F_peek = () => ({ VW, VH, OX, OY, phase, turn, moving, me: { x: me.x, y: me.y, inRing: me.inRing }, won, left: balls.filter(b => !b.gone).map(b => ({ x: b.x, y: b.y })), C, RR, lag: lagDone });
    FZ.holenPeek = F_peek;                                                      // (for automatic tests)
    api.msg(L ? 'Pitik sa guhit! Hilahin pababa at bitawan — sino ang pinakamalapit sa guhit ang mauuna.' : 'Shoot to the line first! Pull back (down) and let go — closest to the line goes first.', true);
    api.progress(`🔵 0 · 🔴 0`);
  }
});

FZ.reg({
  id: 'sungka', cat: 'board', name: 'Sungka', emoji: '🐚', color: '#0b7285', match: true,
  tag: 'Sow the shells and fill your bahay!',
  players: '2 players', props: 'A sungka board (or an egg carton!) and 98 shells, seeds or small stones',
  real: [
    'A carved wooden board has two rows of <b>7 small pits</b> and a large <b>bahay</b> (house) at each end. Every small pit starts with 7 shells (sigay).',
    'On your turn you scoop all the shells from one of your pits and drop them one by one, going around toward your own bahay.',
    'If your last shell lands in your own bahay you get another turn. If it lands in a pit with shells, scoop them up and keep going!',
    'If your last shell lands in an empty pit on your side, you capture the shells opposite. The player with the most shells in their bahay wins!'
  ],
  how: [
    'You are the bottom row (blue glow). Tap one of your pits to scoop and sow the shells 🐚 to the right.',
    'Last shell in your 🏠 bahay (right side) = extra turn! Last shell in a full pit = keep going. Last shell in an empty pit of yours = steal the shells opposite!',
    'When one side runs out, the game ends. Most shells in the bahay wins!'
  ],
  tip: 'Make a board from an egg carton and two bowls. Counting shells while sowing is a great way to practise numbers and addition. (This version is turn-by-turn, which is easier than the real game\'s simultaneous first move.)',
  start(api) {
    /* who to play against: the kids choose, so it is not always Lolo */
    const OPPS = [
      { name: 'Lola Nena', emoji: '👵', level: 'easy', en: 'Gentle. She makes simple moves.', tl: 'Mahinahon. Simpleng galaw ang ginagawa niya.' },
      { name: 'Ate Mae', emoji: '👧', level: 'normal', en: 'A fair match.', tl: 'Patas na laban.' },
      { name: 'Lolo', emoji: '👴', level: 'normal', en: 'Loves grabbing big piles.', tl: 'Mahilig kumuha ng malalaking tumpok.' },
      { name: 'Kuya Ben', emoji: '👦', level: 'hard', en: 'A clever player. Watch out!', tl: 'Matalinong kalaro. Mag-ingat!' },
      { name: 'Kalaro', emoji: '🧑‍🤝‍🧑', level: 'human', en: 'A friend plays on the same phone or tablet. Take turns.', tl: 'Kaibigang kalaro sa iisang telepono o tablet. Magpalitan.' }
    ];
    const L = FZ.lang === 'tl' ? 'tl' : 'en';
    const lvOpps = OPPS;                                   // no levels: the opponent you pick sets how hard it is
    if (api.saved && api.saved.bd) { const o = OPPS[api.saved.opp] || OPPS[0]; return begin(o, api.saved); }
    const picker = h(`<div class="oppwrap"><h3 class="opp-title">${L === 'tl' ? 'Sino ang gusto mong kalaban?' : 'Who do you want to play against?'}</h3><div class="oppgrid"></div></div>`);
    const grid = $('.oppgrid', picker);
    lvOpps.forEach(o => {
      const b = h(`<button class="oppbtn" type="button"><span class="oe">${o.emoji}</span><b>${o.name}</b><small>${o[L]}</small></button>`);
      b.onclick = () => { picker.remove(); begin(o); };
      grid.append(b);
    });
    api.stage.append(picker);
    api.msg(L === 'tl' ? 'Pumili ng kalaban! 👇' : 'Pick your opponent! 👇', true);

    function begin(opp, saved) {
      const OPP = opp.name, human = opp.level === 'human';
      const bd = saved ? saved.bd.slice() : [7, 7, 7, 7, 7, 7, 7, 0, 7, 7, 7, 7, 7, 7, 7, 0];   // 0-6 you, 7 your bahay, 8-14 top row, 15 their bahay
      const wrap = h('<div class="sungka"></div>'); api.stage.append(wrap);
      const els = Array(16);
      /* each pit has a place on the long board (--r/--c) and on the upright board used on phones held upright (--vr/--vc) */
      function mk(i, r, c, vr, vc, cls) { const e = h(`<div class="pit ${cls}" style="--r:${r};--c:${c};--vr:${vr};--vc:${vc}"></div>`); e.dataset.i = i; wrap.append(e); els[i] = e; return e; }
      mk(15, '1 / 3', 1, 1, '1 / 3', 'store');
      for (let i = 0; i < 7; i++) mk(14 - i, 1, i + 2, i + 2, 2, '');
      for (let i = 0; i < 7; i++) mk(i, 2, i + 2, i + 2, 1, 'mine');
      mk(7, '1 / 3', 9, 9, '1 / 3', 'store');
      const info = h('<div class="side"></div>'); api.stage.append(info);
      let turn = saved ? saved.turn : 0, busy = false, last = -1;
      const keep = () => api.save({ opp: OPPS.indexOf(opp), bd: bd.slice(), turn });

      function render() {
        els.forEach((e, i) => {
          const n = bd[i], store = i === 7 || i === 15;
          const mine = turn === 0 ? i <= 6 : (human && i >= 8 && i <= 14);
          e.classList.toggle('last', i === last);
          e.classList.toggle('glow', !busy && n > 0 && mine);
          e.innerHTML = store
            ? `<small>${i === 7 ? '🏠 You' : '🏠 ' + OPP}</small><b>${n}</b><span class="shells">${'🐚'.repeat(Math.min(n, 12))}</span>`
            : `${n}<span class="shells">${'🐚'.repeat(Math.min(n, 7))}</span>`;
        });
        info.textContent = busy ? '' : turn === 0 ? '👇 Your turn!' : human ? `👆 ${OPP}'s turn! (top row)` : `${opp.emoji} ${OPP} is thinking…`;
      }
      /* where the last shell lands if it is sown from pit `start` (no animation) */
      const landing = (side, start, n) => { let pos = start; const skip = side ? 7 : 15; while (n > 0) { pos = (pos + 1) % 16; if (pos === skip) continue; n--; } return pos; };
      /* simulate a move on a copy of the board: shells gained and whether it gives another turn */
      function sim(b0, side, start) {
        const c = b0.slice(), mine = side ? 15 : 7, skip = side ? 7 : 15;
        let pos = start, n = c[pos], gain = 0, extra = false; c[pos] = 0;
        for (let guard = 0; guard < 200; guard++) {
          while (n > 0) { pos = (pos + 1) % 16; if (pos === skip) continue; c[pos]++; n--; if (pos === mine) gain++; }
          if (pos === mine) { extra = true; break; }
          if (c[pos] > 1) { n = c[pos]; c[pos] = 0; continue; }
          const own = side ? (pos >= 8 && pos <= 14) : (pos >= 0 && pos <= 6);
          if (own && c[14 - pos] > 0) { const got = c[14 - pos] + 1; gain += got; c[14 - pos] = 0; c[pos] = 0; }
          break;
        }
        return { gain, extra };
      }
      function aiPick(opts) {
        if (opp.level === 'easy') return pick(opts);
        if (opp.level === 'normal') { const goodies = opts.filter(i => landing(1, i, bd[i]) === 15); return goodies.length && Math.random() < .6 ? pick(goodies) : pick(opts); }
        let best = opts[0], bestScore = -Infinity;      // hard: choose the move that gains the most
        opts.forEach(i => { const r = sim(bd, 1, i); const sc = r.gain * 2 + (r.extra ? 3 : 0) + Math.random() * .5; if (sc > bestScore) { bestScore = sc; best = i; } });
        return best;
      }

      async function play(side, start) {
        busy = true; const mine = side ? 15 : 7, skip = side ? 7 : 15; let pos = start, n = bd[pos], extra = false; bd[pos] = 0; last = pos; render(); await api.sleep(300);
        while (true) {
          while (n > 0) { pos = (pos + 1) % 16; if (pos === skip) continue; bd[pos]++; n--; last = pos; api.sfx('step'); render(); await api.sleep(300); }
          if (pos === mine) { extra = true; api.msg(side ? `${OPP} got another turn! 🎉` : 'Last shell in YOUR bahay! Go again! 🎉', true); api.sfx('good'); break; }
          if (bd[pos] > 1) { n = bd[pos]; bd[pos] = 0; render(); api.msg('Pit had shells — keep sowing! 🐚', false); await api.sleep(450); continue; }
          const own = side ? (pos >= 8 && pos <= 14) : (pos >= 0 && pos <= 6);
          if (own && bd[14 - pos] > 0) { const got = bd[14 - pos] + 1; bd[mine] += got; bd[14 - pos] = 0; bd[pos] = 0; api.sfx('good'); api.msg(side ? `${OPP} captured ${got} shells!` : `You captured ${got} shells! 🎉`, true); }
          break;
        }
        last = -1; render(); await api.sleep(350);
        const a = bd.slice(0, 7).reduce((x, y) => x + y, 0), b = bd.slice(8, 15).reduce((x, y) => x + y, 0);
        if (a === 0 || b === 0) { bd[7] += a; bd[15] += b; for (let i = 0; i < 7; i++) { bd[i] = 0; bd[8 + i] = 0; } render(); return end(); }
        if (!extra) turn = 1 - turn;
        keep(); busy = false; render(); if (turn === 1 && !human) aiTurn();
      }
      async function aiTurn() {
        await api.sleep(900);
        const opts = []; for (let i = 8; i <= 14; i++) if (bd[i] > 0) opts.push(i);
        if (opts.length) play(1, aiPick(opts));
      }
      function end() {
        const me = bd[7], op = bd[15];
        api.finish(me > op ? 3 : me === op ? 2 : 1, me > op ? `You won ${me} to ${op}! 🏆` : me === op ? `A tie, ${me} to ${op}!` : `${OPP} won ${op} to ${me}. Play again!`);
      }
      wrap.addEventListener('click', e => {
        const p = e.target.closest('.pit'); if (!p || busy) return;
        const i = +p.dataset.i, ownRange = turn === 0 ? i <= 6 : (i >= 8 && i <= 14);
        if (!ownRange || (turn === 1 && !human)) return;
        if (bd[i] === 0) { api.sfx('oops'); return; }
        play(turn, i);
      });
      api.on(window, 'keydown', e => {
        if (!/^[1-7]$/.test(e.key)) return;
        const k = +e.key - 1, idx = turn === 0 ? k : 14 - k;      // player 2 counts from their own left
        const p = $(`.pit[data-i="${idx}"]`, wrap); if (p) p.click();
      });
      api.msg(saved ? (L === 'tl' ? 'Ituloy natin ang laro! 🐚' : 'Let\'s continue your game! 🐚') : human ? 'Take turns! Tap a pit on your side.' : 'Tap one of your pits (bottom row) to sow the shells!', true);
      keep(); render(); if (turn === 1 && !human) aiTurn();
    }
  }
});

/* ---------------- DAMA ---------------- */
FZ.reg({
  id: 'dama', cat: 'board', name: 'Dama', emoji: '♟️', color: '#364fc7', match: true,
  tag: 'Filipino checkers with bottle caps!',
  players: '2 players', props: 'A checkerboard drawn on cardboard and 24 bottle caps (two colours)',
  real: [
    'Dama is played on an 8×8 board using only the dark squares. Each player has <b>12 pieces</b> — often bottle caps, stones or wooden discs.',
    'Pieces move one step <b>diagonally forward</b> onto an empty square.',
    'To capture, jump diagonally over an enemy piece into the empty square behind it. If you can capture, you <b>must</b>!',
    'A piece that reaches the far row becomes a <b>dama</b> (king) and can move both forwards and backwards. Capture all enemy pieces to win!'
  ],
  how: [
    'You play the blue caps 🔵 at the bottom and move first. Tap a cap, then tap a green dot to move.',
    'Jump over red caps to capture them. If a capture is possible you must take it (those caps pulse).',
    'Reach the top row to become a king 👑!'
  ],
  tip: 'Make a board from cardboard and use two kinds of bottle caps. Let your child play with fewer pieces (6 each) to learn the moves first.',
  start(api) {
    /* no levels: pick who to play against. Each opponent plays a little more carefully. */
    const L = FZ.lang === 'tl' ? 'tl' : 'en';
    const OPPS = [
      { name: 'Bunso', emoji: '🧒', rows: 2, smart: 0, en: 'Small game (8 caps each). Just learning!', tl: 'Maliit na laro (8 takip bawat isa). Nag-aaral pa lang!' },
      { name: 'Ate Mae', emoji: '👧', rows: 3, smart: .5, en: 'Full game. A fair match.', tl: 'Buong laro. Patas na laban.' },
      { name: 'Lolo', emoji: '👴', rows: 3, smart: 1, en: 'Never leaves a cap for you to jump!', tl: 'Hindi nag-iiwan ng takip na matatalunan mo!' }
    ];
    if (api.saved && api.saved.bd) return play(OPPS[api.saved.opp] || OPPS[0], api.saved);
    const picker = h(`<div class="oppwrap"><h3 class="opp-title">${L === 'tl' ? 'Sino ang gusto mong kalaban?' : 'Who do you want to play against?'}</h3><div class="oppgrid"></div></div>`);
    OPPS.forEach(o => { const b = h(`<button class="oppbtn" type="button"><span class="oe">${o.emoji}</span><b>${o.name}</b><small>${o[L]}</small></button>`); b.onclick = () => { picker.remove(); play(o); }; $('.oppgrid', picker).append(b); });
    api.stage.append(picker); api.msg(L === 'tl' ? 'Pumili ng kalaban! 👇' : 'Pick your opponent! 👇', true);
    function play(opp, saved) {
    const N = 8; let bd = Array.from({ length: N }, () => Array(N).fill(''));
    const ROWS = opp.rows, SMART = () => Math.random() < opp.smart;
    if (saved) bd = saved.bd.map(r => r.slice());
    else for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) { if (r < ROWS) bd[r][c] = 'r'; else if (r > N - 1 - ROWS) bd[r][c] = 'b'; }
    const keep = () => api.save({ opp: OPPS.indexOf(opp), bd: bd.map(r => r.slice()) });
    const el = h('<div class="dama"></div>'); api.stage.append(el);
    const info = h('<div class="side"></div>'); api.stage.append(info);
    let sel = null, turn = 'b', locked = null, over = false, targets = [];
    const side = p => p.toLowerCase();
    const isK = p => p === p.toUpperCase();
    function movesOf(r, c, jumpsOnly) {
      const p = bd[r][c], out = []; if (!p) return out;
      const dirs = isK(p) ? [-1, 1] : [side(p) === 'b' ? -1 : 1];
      for (const dr of dirs) for (const dc of [-1, 1]) {
        const nr = r + dr, nc = c + dc; if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
        if (!bd[nr][nc]) { if (!jumpsOnly) out.push({ r: nr, c: nc }); }
        else if (side(bd[nr][nc]) !== side(p)) { const jr = nr + dr, jc = nc + dc; if (jr >= 0 && jc >= 0 && jr < N && jc < N && !bd[jr][jc]) out.push({ r: jr, c: jc, cap: { r: nr, c: nc } }); }
      }
      return out;
    }
    const allJumps = s => { const l = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (bd[r][c] && side(bd[r][c]) === s) { const j = movesOf(r, c, true); if (j.length) l.push({ r, c, j }); } return l; };
    const hasAny = s => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (bd[r][c] && side(bd[r][c]) === s && movesOf(r, c).length) return true; return false; };
    function draw() {
      el.innerHTML = '';
      const must = turn === 'b' && !over ? allJumps('b') : [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const d = h(`<div class="dsq ${(r + c) % 2 ? 'd' : 'l'}"></div>`); d.dataset.r = r; d.dataset.c = c;
        if (sel && sel.r === r && sel.c === c) d.classList.add('sel');
        if (targets.some(t => t.r === r && t.c === c)) d.classList.add('mv');
        const p = bd[r][c];
        if (p) { const cap = h(`<div class="cap ${side(p)}">${isK(p) ? '👑' : ''}</div>`); if (must.some(m => m.r === r && m.c === c) && !sel) cap.classList.add('must'); d.append(cap); }
        el.append(d);
      }
      info.textContent = over ? '' : turn === 'b' ? (must.length ? '👆 You must capture! Tap a pulsing cap.' : '👆 Your turn! Tap a blue cap.') : '🔴 Red is thinking…';
    }
    function crown(r, c) { const p = bd[r][c]; if (p === 'b' && r === 0) bd[r][c] = 'B'; if (p === 'r' && r === N - 1) bd[r][c] = 'R'; return bd[r][c] !== p; }
    function doMove(from, m) {
      bd[m.r][m.c] = bd[from.r][from.c]; bd[from.r][from.c] = ''; if (m.cap) { bd[m.cap.r][m.cap.c] = ''; api.sfx('good'); } else api.sfx('step');
      const crowned = crown(m.r, m.c); const more = m.cap && !crowned ? movesOf(m.r, m.c, true) : [];
      return more;
    }
    function checkEnd() {
      const mine = bd.flat().filter(p => p && side(p) === 'b').length, theirs = bd.flat().filter(p => p && side(p) === 'r').length;
      if (!theirs || !hasAny('r') && turn === 'r') { over = true; draw(); api.finish(3, 'You captured the red caps! Panalo! 🏆'); return true; }
      if (!mine || !hasAny('b') && turn === 'b') { over = true; draw(); api.finish(1, 'Red won this time. Try again!'); return true; }
      return false;
    }
    el.addEventListener('click', e => {
      if (turn !== 'b' || over) return; const d = e.target.closest('.dsq'); if (!d) return; const r = +d.dataset.r, c = +d.dataset.c;
      const mv = targets.find(t => t.r === r && t.c === c);
      if (mv && sel) {
        const more = doMove(sel, mv); targets = [];
        if (more.length) { sel = { r, c }; locked = sel; targets = more; api.msg('Jump again! 🦘', true); draw(); return; }
        sel = null; locked = null; turn = 'r'; draw(); if (checkEnd()) return; aiMove(); return;
      }
      if (locked) return;
      const p = bd[r][c];
      if (p && side(p) === 'b') {
        const must = allJumps('b'); let mm = movesOf(r, c);
        if (must.length) { const m = must.find(x => x.r === r && x.c === c); if (!m) { api.sfx('oops'); api.msg('You must capture! Pick a pulsing cap.', true); return; } mm = m.j; }
        sel = { r, c }; targets = mm; api.sfx('pop'); draw();
      }
    });
    function wouldBeTaken(from, m) {
      const keep = bd.map(row => row.slice());
      bd[m.r][m.c] = bd[from.r][from.c]; bd[from.r][from.c] = '';
      const risk = allJumps('b').some(j => j.j.some(t => t.cap.r === m.r && t.cap.c === m.c));
      bd = keep; return risk;
    }
    async function aiMove() {
      await api.sleep(800); if (over) return;
      let jumps = allJumps('r'), pickM;
      if (jumps.length) { const j = pick(jumps); pickM = { from: { r: j.r, c: j.c }, m: pick(j.j) }; }
      else {
        const all = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (bd[r][c] && side(bd[r][c]) === 'r') movesOf(r, c).forEach(m => all.push({ from: { r, c }, m }));
        if (!all.length) { turn = 'b'; checkEnd(); return; }
        const safe = SMART() ? all.filter(x => !wouldBeTaken(x.from, x.m)) : [];      // level 3: Red avoids moves that give you a capture
        pickM = pick(safe.length ? safe : all);
      }
      let from = pickM.from, m = pickM.m, more;
      while (true) {
        more = doMove(from, m); draw(); await api.sleep(550);
        if (more.length) { from = { r: m.r, c: m.c }; m = pick(more); } else break;
      }
      turn = 'b'; draw(); if (checkEnd()) return;
      keep();
      if (allJumps('b').length) api.msg('Red left a cap to capture! Jump it! 🦘', true);
    }
    api.msg(saved ? (L === 'tl' ? 'Ituloy natin ang laro! ♟️' : 'Let\'s continue your game! ♟️') : 'You are blue 🔵. Tap a cap, then a green dot!', true); keep(); draw();
    }
  }
});
