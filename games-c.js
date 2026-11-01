'use strict';
/* =====================================================
   GAMES C – Husay (skill) & board games
   Sipa, Pitik-Bulag, Tsato, Holen, Palosebo, Sungka, Dama
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
    'Watch the sipa fall. When it is inside the yellow zone, tap the body part that the hint asks for!',
    'Foot 🦶, knee 🦵 or elbow 💪 — no hands allowed.',
    'Make 8 kicks! You have 3 lives (💛). If the sipa touches the ground you lose one.'
  ],
  tip: 'Make a homemade sipa from a washer and a few strips of plastic bag. Start by letting your child kick it low, close to the ground.',
  start(api) {
    const parts = { foot: ['🦶', 'foot'], knee: ['🦵', 'knee'], elbow: ['💪', 'elbow'] };
    const arena = h(`<div class="sipaarena"><div class="gnd"></div><div class="zone"></div><div class="kid">${FZ.me('stand')}</div><div class="sipa"><div class="strands"></div><div class="washer"></div></div></div>`);
    const hud = h('<div class="sipa-cnt">Kicks: <span id="sk">0</span>/8 · <span id="sl">💛💛💛</span></div>');
    const btns = h(`<div class="partbtns">${Object.entries(parts).map(([k, v]) => `<button class="btn big" data-p="${k}">${v[0]} ${v[1][0].toUpperCase() + v[1].slice(1)}</button>`).join('')}</div>`);
    api.stage.append(hud); api.stage.append(arena); api.stage.append(btns);
    const sp = $('.sipa', arena), zone = $('.zone', arena);
    const H = arena.clientHeight, W = arena.clientWidth, G = 1000;
    zone.style.top = (H * 0.42) + 'px'; zone.style.height = (H * 0.34) + 'px';
    let y = 10, x = W / 2, vy = 0, count = 0, lives = 3, want = pick(Object.keys(parts)), wait = 0.6;
    const hint = () => api.msg(`Use your ${parts[want][1].toUpperCase()} ${parts[want][0]}! (no hands ✋❌)`, true);
    const draw = () => { sp.style.transform = `translate(${x}px,${y}px) rotate(${vy * 0.03}deg)`; };
    api.frame(dt => {
      if (wait > 0) { wait -= dt; draw(); return; }
      vy += G * dt * 0.55; y += vy * dt;
      if (y > H * 0.88 - 56) { lives--; $('#sl').textContent = '💛'.repeat(lives) + '🤍'.repeat(3 - lives); api.sfx('oops'); y = 10; vy = 0; x = W / 2; wait = 1; if (lives <= 0) { api.finish(1, 'Good try! Keep practising your sipa kicks.'); return false; } api.msg('Oops! It touched the ground. Try again!', true); }
      draw();
    });
    function kick(p) {
      if (wait > 0) return;
      const inZone = y + 28 > H * 0.42 && y + 28 < H * 0.76 && vy > 0;
      if (!inZone) { api.sfx('pop'); api.msg('Wait for the yellow zone! ⏳'); return; }
      if (p !== want) { api.sfx('oops'); api.msg(`Not that one! Use your ${parts[want][1].toUpperCase()} ${parts[want][0]}!`); return; }
      const kidEl = $('.kid', arena); kidEl.innerHTML = FZ.me(p === 'foot' ? 'kick' : p === 'knee' ? 'knee' : 'elbow'); setTimeout(() => { kidEl.innerHTML = FZ.me('stand'); }, 450);
      count++; $('#sk').textContent = count; vy = -Math.sqrt(2 * G * 0.55 * H * 0.55); x = clamp(x + rnd(-60, 60), 30, W - 30); api.sfx('good');
      const plus = h('<div class="plus">+1</div>'); plus.style.left = x + 'px'; plus.style.top = (y - 10) + 'px'; arena.append(plus); setTimeout(() => plus.remove(), 800);
      if (count >= 8) { api.finish(lives, `You kicked the sipa ${count} times without hands!`); return; }
      want = pick(Object.keys(parts)); hint();
    }
    $$('button', btns).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); kick(b.dataset.p); }));
    api.on(window, 'keydown', e => { const m = { f: 'foot', k: 'knee', e: 'elbow' }[e.key]; if (m) kick(m); });
    hint();
  }
});

/* ---------------- PITIK-BULAG ---------------- */
FZ.reg({
  id: 'pitik', cat: 'skill', name: 'Pitik-Bulag', emoji: '👆', color: '#be4bdb',
  tag: 'Close your eyes and guess the flicked finger!',
  players: '2 kids', props: 'Just your hands!',
  real: [
    '<b>Pitik</b> means "flick" and <b>bulag</b> means "blind". One player closes their eyes (or is blindfolded).',
    'The other player holds out a hand and gives one finger a quick little <b>pitik</b> (flick).',
    'The player with closed eyes must guess <b>which finger</b> was flicked.',
    'If the guess is right, you swap roles! If it is wrong, the same player guesses again.'
  ],
  how: [
    'First YOU guess. Close your eyes 🙈 — then a finger on the hand will flick and play a note 🎵!',
    'Every finger has its own sound, going up from the thumb to the pinky. Remember the note, then tap the finger!',
    'Then it\'s your turn to flick a finger of your friend\'s hand — will they guess it?'
  ],
  tip: 'In real life, play gently! Do a very light flick. For little kids, make the flick a soft tap with one finger so it never hurts.',
  start(api) {
    const names = [['Thumb', 'Hinlalaki'], ['Index', 'Hintuturo'], ['Middle', 'Hinlalato'], ['Ring', 'Palasingsingan'], ['Pinky', 'Hinliliit']];
    const freq = [262, 330, 392, 494, 587];
    const top = h('<div class="eyes">🙈</div>');
    const hand = h(`<div class="hand">${names.map((n, i) => `<button class="finger f${i}" data-i="${i}" disabled><b>${i + 1}</b>${FZ.lang === 'tl' ? n[1] : n[0]}<small>${FZ.lang === 'tl' ? n[0] : n[1]}</small></button>`).join('')}</div>`);
    const score = h('<div class="score">Points: <span id="pp">0</span>/4</div>');
    api.stage.append(top); api.stage.append(hand); api.stage.append(score);
    const fs = $$('.finger', hand);
    let rounds = 0, pts = 0, role = 'guess', target = 0;
    const enable = on => fs.forEach(f => f.disabled = !on);
    const clear = () => fs.forEach(f => f.classList.remove('flash', 'ok', 'no'));
    function flick(i) { fs[i].classList.add('flash'); FZ.tone(freq[i], .3, 'triangle', .18); setTimeout(() => fs[i].classList.remove('flash'), 350); }
    function next() {
      clear(); enable(false);
      if (rounds >= 4) return api.finish(pts >= 3 ? 3 : pts >= 2 ? 2 : 1, `You scored ${pts} out of 4 points!`);
      role = rounds < 2 ? 'guess' : 'flick';
      if (role === 'guess') {
        top.textContent = '🙈'; api.msg('Close your eyes… 🙈 Your friend will flick one finger!', true);
        api.later(() => { target = rnd(0, 4); flick(target); top.textContent = '🤔'; api.msg('Which finger was flicked? Remember the note! 🎵', true); enable(true); }, 2200);
      } else {
        top.innerHTML = FZ.pal(1, 'stand'); api.msg('Your turn! Pick a finger on your friend\'s hand to flick!', true); enable(true);
      }
    }
    fs.forEach(f => f.onclick = () => {
      const i = +f.dataset.i; enable(false);
      if (role === 'guess') {
        const ok = i === target; fs[target].classList.add('ok'); if (!ok) f.classList.add('no');
        if (ok) { pts++; api.sfx('good'); api.msg('Tama! ✅ Correct!', true); } else { api.sfx('oops'); api.msg(`Sayang! It was finger ${target + 1}. 😅`, true); }
      } else {
        flick(i); top.innerHTML = FZ.pal(1, 'stand') + '🤔';
        api.later(() => {
          const g = Math.random() < .2 ? i : rnd(0, 4); fs[g].classList.add(g === i ? 'ok' : 'no');
          if (g === i) { api.sfx('oops'); api.msg('Your friend guessed right! Good guess!', true); } else { pts++; api.sfx('good'); api.msg('Your friend guessed wrong! You win a point! 🎉', true); }
          $('#pp').textContent = pts; api.later(() => { rounds++; next(); }, 1600);
        }, 1500);
        return;
      }
      $('#pp').textContent = pts; api.later(() => { rounds++; next(); }, 1800);
    });
    next();
  }
});

/* ---------------- TSATO ---------------- */
FZ.reg({
  id: 'tsato', cat: 'skill', name: 'Tsato', emoji: '🏏', color: '#c92a2a',
  tag: 'Flick the little stick and whack it far!',
  players: '2–6 kids', props: 'One long stick and one short stick (like a broom handle cut in two)',
  real: [
    'Play with two sticks: a long one for hitting and a short one that flies. Rest the short stick across a small hole or on a stone.',
    'Tap its tip with the long stick so it <b>flips up</b> into the air.',
    'While it is in the air, swing the long stick and hit it as far as you can!',
    'Measure how far it flew using the length of the long stick. The farthest hit gets the most points.'
  ],
  how: [
    'Tap <b>Tuklap!</b> to flip the short stick up into the air.',
    'Tap <b>Palo!</b> when the stick is inside the green dashed box — a perfect hit flies farthest!',
    'You get 3 hits. Count how many stick-lengths you scored in total!'
  ],
  tip: 'Smooth the sticks so no one gets splinters. Play in an open field away from other kids and windows, and measure with the long stick.',
  start(api) {
    const scene = h(`<div class="tsato"><div class="jground"></div><div class="sweet"></div><div class="long"></div><div class="short"></div><div class="flag" style="left:20%">🚩</div>
      <div class="ruler">${Array.from({ length: 11 }, (_, i) => `<i>${i}</i>`).join('')}</div></div>`);
    const tot = h('<div class="score">Total: <span id="tt">0</span> stick-lengths</div>');
    const btns = h('<div class="actions"><button class="btn big" id="tk">🪵 Tuklap!</button><button class="btn big warn" id="tp" disabled>🏏 Palo!</button></div>');
    api.stage.append(scene); api.stage.append(tot); api.stage.append(btns);
    const short = $('.short', scene), long = $('.long', scene), flag = $('.flag', scene), sweet = $('.sweet', scene), tk = $('#tk', btns), tp = $('#tp', btns);
    const H = scene.clientHeight, W = scene.clientWidth, base = H * 0.18, apex = H * 0.52, T = 1.25, TP = 0.72;
    let turn = 0, total = 0, t = -1, stopFrame = null, flying = false;
    sweet.style.bottom = (base + apex * 4 * TP * (1 - TP) - 8) + 'px';
    function reset() { short.style.transition = 'none'; short.style.left = '20%'; short.style.bottom = base + 'px'; short.style.transform = ''; long.classList.remove('swing'); scene.classList.remove('air'); flag.style.left = '20%'; tk.disabled = false; tp.disabled = true; api.msg(`Turn ${turn + 1} of 3: tap Tuklap! to flip the stick.`, true); }
    function end(dist) {
      flying = false; if (stopFrame) stopFrame(); scene.classList.remove('air'); tp.disabled = true;
      total += dist; $('#tt').textContent = total;
      if (dist > 0) { short.style.transition = 'left .8s ease-out,bottom .8s ease-in'; short.style.left = (20 + dist * 6.6) + '%'; short.style.bottom = base + 'px'; flag.style.left = (20 + dist * 6.6) + '%'; api.sfx('good'); api.msg(`Ang layo! It flew ${dist} stick-lengths! 🎉`, true); }
      else { api.sfx('oops'); api.msg('Missed! The stick fell down. 😅', true); }
      turn++; api.later(() => { if (turn >= 3) api.finish(total >= 20 ? 3 : total >= 10 ? 2 : 1, `You hit a total of ${total} stick-lengths!`); else reset(); }, 1900);
    }
    tk.onclick = () => {
      if (flying) return; flying = true; tk.disabled = true; tp.disabled = false; t = 0; api.sfx('jump'); scene.classList.add('air'); api.msg('Now tap Palo! when it is in the green box!', true);
      stopFrame = api.frame(dt => {
        if (!flying) return false; t += dt / T;
        if (t >= 1) { end(0); return false; }
        short.style.bottom = (base + apex * 4 * t * (1 - t)) + 'px'; short.style.transform = `rotate(${t * 720}deg)`;
      });
    };
    tp.onclick = () => {
      if (!flying) return; const err = Math.abs(t - TP); long.classList.add('swing'); api.sfx('pop');
      end(clamp(Math.round(10 - err * 32), 1, 10));
    };
    api.on(window, 'keydown', e => { if (e.code === 'Space') { if (!flying && !tk.disabled) tk.onclick(); else if (flying) tp.onclick(); } });
    reset();
  }
});

/* ---------------- HOLEN ---------------- */
FZ.reg({
  id: 'holen', cat: 'skill', name: 'Holen', emoji: '🔮', color: '#1c7ed6',
  tag: 'Flick your marble and knock others out of the circle!',
  players: '2–5 kids', props: 'Glass marbles (holen) and chalk to draw a circle',
  real: [
    'Draw a circle on the ground and place several marbles inside it.',
    'Each player has a bigger "shooter" marble. Kneel behind the line and flick it with your thumb.',
    'Hit the marbles in the circle and knock them <b>out</b> — every marble you knock out is yours to keep!',
    'Another version uses small holes in the ground: roll your marble into the holes in order.'
  ],
  how: [
    'Put your finger on the screen, <b>pull back</b> like a slingshot, then let go to flick your blue shooter 🔵.',
    'Knock 3 coloured marbles OUT of the circle!',
    'You have 6 shots. Fewer shots used = more stars.'
  ],
  tip: 'Play on flat, smooth ground. Keep marbles away from toddlers and babies, who may put them in their mouths. Always count marbles before and after!',
  start(api) {
    const W = Math.min(window.innerWidth * 0.92, 400), H = W * 1.15, mr = W * 0.045, RR = W * 0.36, cx = W / 2, cy = W * 0.44;
    const arena = h(`<div class="holen" style="width:${W}px;height:${H}px"><div class="ring" style="left:${cx - RR}px;top:${cy - RR}px;width:${RR * 2}px;height:${RR * 2}px"></div></div>`);
    const hud = h('<div class="score">Out: <span id="ho">0</span>/3 · Shots left: <span id="hs">6</span></div>');
    api.stage.append(hud); api.stage.append(arena);
    const cols = ['#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8', '#ff922b'];
    const balls = [];
    function mk(x, y, color, shooter) {
      const el = document.createElement('div'); el.className = 'marble';
      el.style.width = el.style.height = (mr * 2) + 'px'; el.style.background = `radial-gradient(circle at 35% 30%,#fff 0 10%,${color} 40%,${color})`;
      arena.append(el); const b = { x, y, vx: 0, vy: 0, el, shooter, out: false }; balls.push(b); place(b); return b;
    }
    const place = b => b.el.style.transform = `translate(${b.x - mr}px,${b.y - mr}px)`;
    const targets = [];
    for (let i = 0; i < 5; i++) { let x, y, ok, n = 0; do { const a = Math.random() * Math.PI * 2, r = Math.random() * RR * 0.55; x = cx + Math.cos(a) * r; y = cy + Math.sin(a) * r; ok = targets.every(t => Math.hypot(t.x - x, t.y - y) > mr * 2.4); n++; } while (!ok && n < 50); targets.push(mk(x, y, cols[i], false)); }
    const SX = cx, SY = H - mr * 2.2, sh = mk(SX, SY, '#339af0', true); sh.el.style.width = sh.el.style.height = (mr * 2.4) + 'px';
    sh.r = mr * 1.2;
    let shots = 6, outN = 0, fired = false, drag = null;
    const line = h('<div class="aimline" style="display:none"></div>'); arena.append(line);
    const pos = e => { const r = arena.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    api.on(arena, 'pointerdown', e => { if (fired) return; e.preventDefault(); drag = pos(e); });
    api.on(window, 'pointermove', e => {
      if (!drag) return; const p = pos(e), dx = SX - p.x, dy = SY - p.y, len = Math.min(Math.hypot(dx, dy), 150);
      line.style.display = 'block'; line.style.left = SX + 'px'; line.style.top = (SY - 3) + 'px'; line.style.width = len + 'px'; line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    });
    api.on(window, 'pointerup', e => {
      if (!drag) return; const p = pos(e), dx = SX - p.x, dy = SY - p.y, l = Math.hypot(dx, dy); drag = null; line.style.display = 'none';
      if (l < 12) return; const k = Math.min(l, 150) / l * 6.5; sh.vx = dx * k; sh.vy = dy * k; fired = true; shots--; $('#hs').textContent = shots; api.sfx('jump');
    });
    api.msg('Pull back like a slingshot, then let go! 🔵', true);
    api.frame(dt => {
      balls.forEach(b => {
        if (b.out) return;
        b.x += b.vx * dt; b.y += b.vy * dt; const f = Math.pow(0.32, dt); b.vx *= f; b.vy *= f;
        const r = b.shooter ? mr * 1.2 : mr;
        if (b.x < r) { b.x = r; b.vx *= -.7; } if (b.x > W - r) { b.x = W - r; b.vx *= -.7; } if (b.y < r) { b.y = r; b.vy *= -.7; } if (b.y > H - r) { b.y = H - r; b.vy *= -.7; }
        if (Math.hypot(b.vx, b.vy) < 10) b.vx = b.vy = 0;
      });
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j]; if (a.out || b.out) continue;
        const ra = a.shooter ? mr * 1.2 : mr, rb = b.shooter ? mr * 1.2 : mr, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01;
        if (d < ra + rb) {
          const nx = dx / d, ny = dy / d, ov = (ra + rb - d) / 2; a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
          const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (vn > 0) { const m = vn * 0.95; a.vx -= m * nx; a.vy -= m * ny; b.vx += m * nx; b.vy += m * ny; api.sfx('pop'); }
        }
      }
      balls.forEach(b => {
        place(b);
        if (!b.shooter && !b.out && Math.hypot(b.x - cx, b.y - cy) > RR + mr * 0.6) { b.out = true; b.el.classList.add('gone'); outN++; $('#ho').textContent = outN; api.sfx('good'); api.msg('Labas! 🎉 One marble out!', true); }
      });
      if (fired && Math.hypot(sh.vx, sh.vy) < 1) {
        fired = false; sh.x = SX; sh.y = SY; sh.vx = sh.vy = 0; place(sh);
        if (outN >= 3) { api.finish(shots >= 3 ? 3 : shots >= 1 ? 2 : 1, `You knocked ${outN} marbles out of the circle!`); return false; }
        if (shots <= 0) { api.finish(1, `You knocked out ${outN} marbles. Try again!`); return false; }
      }
    });
  }
});

/* ---------------- PALOSEBO ---------------- */
FZ.reg({
  id: 'palosebo', cat: 'skill', name: 'Palosebo', emoji: '🎋', color: '#d9480f',
  tag: 'Climb the greasy pole to grab the prize!',
  players: 'Teams of 3–5 kids', props: 'A tall bamboo pole rubbed with grease (sebo) — this is a fiesta game for grown-ups and big kids!',
  real: [
    'A tall bamboo pole is planted in the ground and rubbed with <b>sebo</b> (slippery grease). A flag or prize hangs at the top.',
    'Players try to climb it, but it is very slippery — they slide back down again and again!',
    'Teams use sand or ash on their hands for grip, and friends form a <b>human ladder or pyramid</b> to reach higher.',
    'It is played during town fiestas, and the whole crowd cheers!'
  ],
  how: [
    'Tap <b>Akyat!</b> again and again to climb. The grease makes you slip back a little!',
    'Tap 🏖️ <b>Buhangin</b> to rub sand on your hands (less slipping for a while).',
    'Tap 👫 <b>Kaibigan</b> once so your friends lift you up! Reach the 🚩 at the top!'
  ],
  tip: 'In real life, only older kids with adult supervision should try this. At home, play it as a "pretend climb" with a soft rope or a play-gym wall.',
  start(api) {
    const sc = h(`<div class="psc"><div class="top">🚩🎁</div><div class="pole"></div><div class="gnd"></div><div class="climber">${FZ.me('climb')}</div><div class="tag">Height: <span id="ph">0</span>%</div><div class="grip" id="pg">🧈 Slippery!</div></div>`);
    const btns = h('<div class="pbtns"><button class="btn big main" id="pc">🤲 Akyat!</button><button class="btn big ghost" id="ps">🏖️ Buhangin</button><button class="btn big ghost" id="pf">👫 Kaibigan</button></div>');
    api.stage.append(sc); api.stage.append(btns);
    const cl = $('.climber', sc);
    let p = 0.03, sand = 0, friends = 1, sandUses = 3, t0 = 0, done = false;
    const upd = () => { cl.style.bottom = (6 + p * 74) + '%'; $('#ph').textContent = Math.round(p * 100); $('#pg').textContent = sand > 0 ? '🏖️ Sandy grip!' : '🧈 Slippery!'; };
    function win() { if (done) return; done = true; const s = (performance.now() - t0) / 1000; api.finish(s <= 22 ? 3 : s <= 40 ? 2 : 1, `You reached the flag in ${Math.round(s)} seconds! 🚩`); }
    $('#pc').addEventListener('pointerdown', e => { e.preventDefault(); if (!t0) t0 = performance.now(); p = Math.min(1, p + 0.03); api.sfx('step'); upd(); if (p >= 1) win(); });
    $('#ps').onclick = () => { if (sandUses <= 0) return; sandUses--; sand = 7; api.sfx('pop'); api.msg(`Buhangin on your hands! 🏖️ (${sandUses} left)`, true); upd(); };
    $('#pf').onclick = () => { if (!friends) return; friends--; p = Math.min(1, p + 0.16); api.sfx('good'); api.msg('Your friends lifted you up! 👫', true); $('#pf').disabled = true; upd(); if (p >= 1) { if (!t0) t0 = performance.now(); win(); } };
    api.every(() => { if (!t0 || done) return; p = Math.max(0.03, p - (sand > 0 ? 0.005 : 0.017)); if (sand > 0) sand -= 0.45; upd(); }, 450);
    api.msg('Tap Akyat! again and again to climb! The grease makes you slip!', true); upd();
  }
});

/* ---------------- SUNGKA ---------------- */
FZ.reg({
  id: 'sungka', cat: 'board', name: 'Sungka', emoji: '🐚', color: '#0b7285',
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
    const bd = [7, 7, 7, 7, 7, 7, 7, 0, 7, 7, 7, 7, 7, 7, 7, 0];
    const wrap = h('<div class="sungka"></div>'); api.stage.append(wrap);
    const els = Array(16);
    function mk(i, r, c, cls) { const e = h(`<div class="pit ${cls}" style="grid-row:${r};grid-column:${c}"></div>`); e.dataset.i = i; wrap.append(e); els[i] = e; return e; }
    mk(15, '1 / 3', 1, 'store');
    for (let i = 0; i < 7; i++) mk(14 - i, 1, i + 2, ''); // top row, opponent (index 14 at left)
    for (let i = 0; i < 7; i++) mk(i, 2, i + 2, 'mine');
    mk(7, '1 / 3', 9, 'store');
    const info = h('<div class="side"></div>'); api.stage.append(info);
    let turn = 0, busy = false, last = -1;
    function render() {
      els.forEach((e, i) => {
        const n = bd[i], store = i === 7 || i === 15;
        e.classList.toggle('last', i === last);
        e.classList.toggle('glow', turn === 0 && !busy && i < 7 && n > 0);
        e.innerHTML = store ? `<small>${i === 7 ? '🏠 You' : '🏠 Lolo'}</small><b>${n}</b><span class="shells">${'🐚'.repeat(Math.min(n, 12))}</span>` : `${n}<span class="shells">${'🐚'.repeat(Math.min(n, 7))}</span>`;
      });
      info.textContent = busy ? '' : turn === 0 ? '👇 Your turn!' : '👴 Lolo is thinking…';
    }
    const landing = (side, start, n) => { let pos = start; const skip = side ? 7 : 15; while (n > 0) { pos = (pos + 1) % 16; if (pos === skip) continue; n--; } return pos; };
    async function play(side, start) {
      busy = true; const mine = side ? 15 : 7, skip = side ? 7 : 15; let pos = start, n = bd[pos], extra = false; bd[pos] = 0; last = pos; render(); await api.sleep(300);
      while (true) {
        while (n > 0) { pos = (pos + 1) % 16; if (pos === skip) continue; bd[pos]++; n--; last = pos; api.sfx('step'); render(); await api.sleep(300); }
        if (pos === mine) { extra = true; api.msg(side ? '👴 Last shell in Lolo\'s house — another turn!' : 'Last shell in YOUR bahay! Go again! 🎉', true); api.sfx('good'); break; }
        if (bd[pos] > 1) { n = bd[pos]; bd[pos] = 0; render(); api.msg('Pit had shells — keep sowing! 🐚', false); await api.sleep(450); continue; }
        const own = side ? (pos >= 8 && pos <= 14) : (pos >= 0 && pos <= 6);
        if (own && bd[14 - pos] > 0) { const got = bd[14 - pos] + 1; bd[mine] += got; bd[14 - pos] = 0; bd[pos] = 0; api.sfx('good'); api.msg(side ? `👴 Lolo captured ${got} shells!` : `You captured ${got} shells! 🎉`, true); }
        break;
      }
      last = -1; render(); await api.sleep(350);
      const a = bd.slice(0, 7).reduce((x, y) => x + y, 0), b = bd.slice(8, 15).reduce((x, y) => x + y, 0);
      if (a === 0 || b === 0) { bd[7] += a; bd[15] += b; for (let i = 0; i < 7; i++) { bd[i] = 0; bd[8 + i] = 0; } render(); return end(); }
      if (!extra) turn = 1 - turn;
      busy = false; render(); if (turn === 1) aiTurn();
    }
    async function aiTurn() {
      await api.sleep(900);
      const opts = []; for (let i = 8; i <= 14; i++) if (bd[i] > 0) opts.push(i);
      const goodies = opts.filter(i => landing(1, i, bd[i]) === 15);
      const c = goodies.length && Math.random() < .6 ? pick(goodies) : pick(opts);
      play(1, c);
    }
    function end() {
      const me = bd[7], op = bd[15];
      api.finish(me > op ? 3 : me === op ? 2 : 1, me > op ? `You won ${me} to ${op}! 🏆` : me === op ? `A tie, ${me} to ${op}!` : `Lolo won ${op} to ${me}. Play again!`);
    }
    wrap.addEventListener('click', e => {
      const p = e.target.closest('.pit'); if (!p || busy || turn !== 0) return;
      const i = +p.dataset.i; if (i > 6 || bd[i] === 0) { api.sfx('oops'); return; }
      play(0, i);
    });
    api.msg('Tap one of your pits (bottom row) to sow the shells!', true); render();
  }
});

/* ---------------- DAMA ---------------- */
FZ.reg({
  id: 'dama', cat: 'board', name: 'Dama', emoji: '♟️', color: '#364fc7',
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
    const N = 8; let bd = Array.from({ length: N }, () => Array(N).fill(''));
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) { if (r < 3) bd[r][c] = 'r'; else if (r > 4) bd[r][c] = 'b'; }
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
    async function aiMove() {
      await api.sleep(800); if (over) return;
      let jumps = allJumps('r'), pickM;
      if (jumps.length) { const j = pick(jumps); pickM = { from: { r: j.r, c: j.c }, m: pick(j.j) }; }
      else { const all = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (bd[r][c] && side(bd[r][c]) === 'r') movesOf(r, c).forEach(m => all.push({ from: { r, c }, m })); if (!all.length) { turn = 'b'; checkEnd(); return; } pickM = pick(all); }
      let from = pickM.from, m = pickM.m, more;
      while (true) {
        more = doMove(from, m); draw(); await api.sleep(550);
        if (more.length) { from = { r: m.r, c: m.c }; m = pick(more); } else break;
      }
      turn = 'b'; draw(); if (checkEnd()) return;
      if (allJumps('b').length) api.msg('Red left a cap to capture! Jump it! 🦘', true);
    }
    api.msg('You are blue 🔵. Tap a cap, then a green dot!', true); draw();
  }
});