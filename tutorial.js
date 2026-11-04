'use strict';
/* =====================================================
   FunZone picture tutorials
   Every game has 3 steps. Each step has a picture for "In real life" and one for "In FunZone",
   shown side by side with a short caption [English, Tagalog].
   Scenes are drawn from kids (FZ.kid), emoji and shapes on a 100 x 100 stage (x, y in %).
   ===================================================== */
(function () {
  /* ---------- tiny scene language ---------- */
  const K = (x, y, pose, h, kind, a, o) => ({ ty: 'k', x, y, pose, h, kind: kind === undefined ? 'me' : kind, a, o });  // kid, feet at (x,y), h = height in %
  const E = (e, x, y, s, a) => ({ ty: 'e', e, x, y, s, a });                         // emoji centred at (x,y), s = size in cqw
  const T = (t, x, y, s, c, a) => ({ ty: 't', t, x, y, s, c, a });                    // text
  const R = (x, y, w, h, bg, rad, a, ex) => ({ ty: 'r', x, y, w, h, bg, rad, a, ex }); // rectangle (top-left)
  const G = (x, y, w, h, rows, cols, bg) => ({ ty: 'g', x, y, w, h, rows, cols, bg });  // grid
  const S = (svg, x, y, w) => ({ ty: 's', svg, x, y, w });                            // svg, top-left, width %
  const kidSvg = it => { const o = it.o || {}; return it.kind === 'me' ? FZ.me(it.pose, o) : it.kind === 'r' ? FZ.rival(it.pose, o) : FZ.pal(it.kind, it.pose, o); };
  const an = a => a ? ` a-${a}` : '';
  const item = it => {
    switch (it.ty) {
      case 'k': return `<div class="ti tk" style="left:${it.x}%;top:${it.y}%;height:${it.h}%"><div class="tia${an(it.a)}">${kidSvg(it)}</div></div>`;
      case 'e': return `<div class="ti te" style="left:${it.x}%;top:${it.y}%;font-size:${it.s}cqw"><span class="tia${an(it.a)}">${it.e}</span></div>`;
      case 't': return `<div class="ti tt" style="left:${it.x}%;top:${it.y}%;font-size:${it.s}cqw;color:${it.c || '#3b2f63'}"><span class="tia${an(it.a)}">${it.t}</span></div>`;
      case 'r': return `<div class="ti tr${an(it.a)}" style="left:${it.x}%;top:${it.y}%;width:${it.w}%;height:${it.h}%;${it.rad === 50 && it.w === it.h ? 'aspect-ratio:1;height:auto;' : ''}background:${it.bg};border-radius:${it.rad || 0}${it.rad > 40 ? '%' : 'cqw'};${it.ex || ''}"></div>`;
      case 'g': return `<div class="ti tgrid" style="left:${it.x}%;top:${it.y}%;width:${it.w}%;height:${it.h}%;--r:${it.rows};--c:${it.cols};background-color:${it.bg}"></div>`;
      case 's': return `<div class="ti ts" style="left:${it.x}%;top:${it.y}%;width:${it.w}%">${it.svg}</div>`;
    }
    return '';
  };
  FZ.tutScene = st => `<div class="tsc bg-${st.bg || 'grass'}">${st.i.map(item).join('')}</div>`;

  /* ---------- reusable bits ---------- */
  const btn = (label, x, y, w, c) => [R(x - w / 2, y - 5, w, 10, c || '#6fcf97', 99), T(label, x, y, 3.6, '#fff')];
  const tap = (x, y) => E('👆', x, y, 9, 'tap');
  const dpad = (x, y) => [E('⬆️', x, y - 9, 6.5), E('⬅️', x - 8, y, 6.5), E('⬇️', x, y, 6.5), E('➡️', x + 8, y, 6.5)];
  const meter = (x, y, w, fill, req) => [R(x, y - 2.5, w, 5, '#fff', 99), R(x, y - 2.5, w * fill, 5, '#ffb066', 99), R(x + w * req, y - 4, 1.2, 8, '#2f9e44'), R(x + w * fill - .7, y - 2.5, 1.5, 5, '#e03131')];
  /* mini game board: columns x rows, cells are square */
  const brd = (cols, rows, x = 25, y = 4, cs = 7, bg = '#a6e57f') => ({
    cx: c => x + cs * (c + .5), cy: r => y + cs * 4 / 3 * (r + 1) - .8, kh: cs * 4 / 3 * 1.25,
    g: G(x, y, cs * cols, cs * 4 / 3 * rows, rows, cols, bg)
  });
  const blue = { shirt: '#339af0' }, rival = (o) => o;
  const D = (id, real, game) => { (FZ.tut = FZ.tut || {})[id] = { real, game }; };
  const st = (c, i, bg) => ({ c, i, bg });
  const SIPA = `<svg viewBox="0 0 30 56" xmlns="http://www.w3.org/2000/svg"><polygon points="15,44 2,0 28,0" fill="#ff6b6b"/><polygon points="15,44 10,0 20,0" fill="#ffd43b"/><polygon points="15,44 20,0 26,0" fill="#51cf66"/><circle cx="15" cy="49" r="7" fill="#c9ced4" stroke="#868e96" stroke-width="2"/><circle cx="15" cy="49" r="2.6" fill="#fff"/></svg>`;
  const tinik = n => FZ.tinikFig(n), baka = n => FZ.bakaFig(n);
  const lines = ys => ys.map(y => R(8, y, 84, 1.3, '#fff'));

  /* ================= PATINTERO ================= */
  { const b = brd(7, 5);
    D('patintero', [
      st(['Draw lines on the ground. The defenders stand ON the lines.', 'Gumuhit ng mga linya sa lupa. Ang mga taya ay nakatayo SA mga linya.'], [...lines([30, 50, 70]), R(49.4, 14, 1.3, 60, '#fff'), K(22, 30, 'wide', 24, 'r'), K(76, 50, 'wide', 24, 'r', 0, { girl: true }), K(24, 70, 'wide', 24, 'r'), K(50, 24, 'wide', 22, 'r', 0, { shirt: '#7048e8' }), K(50, 94, 'stand', 26)], 'ground'),
      st(['Runners sneak across every line without being touched.', 'Tatawid ang mga takbuhan sa bawat linya nang hindi nahahawakan.'], [...lines([30, 50, 70]), K(60, 50, 'wide', 24, 'r'), K(34, 62, 'run', 26, 'me', 'bob'), E('⬆️', 34, 38, 8, 'bob'), K(30, 30, 'wide', 24, 'r', 0, { girl: true })], 'ground'),
      st(['Tagged? Teams switch! Back safely? Score a point!', 'Natayaan? Magpalitan ng koponan! Nakabalik nang ligtas? May puntos!'], [...lines([30, 50, 70]), K(30, 26, 'jump', 26, 'me', 'hop'), E('⭐', 30, 8, 8, 'bob'), K(64, 72, 'run', 24, 1), K(78, 70, 'wide', 24, 'r'), E('👆', 71, 56, 8, 'tap')], 'ground')
    ], [
      st(['You are the runner. Tap the arrows to move.', 'Ikaw ang takbuhan. Pindutin ang mga arrow para gumalaw.'], [b.g, K(b.cx(3), b.cy(4), 'stand', b.kh), ...dpad(50, 76), tap(58, 82)], 'ui'),
      st(['The guards slide along their lines. Wait for a gap!', 'Gumagalaw sa linya ang mga taya. Hintayin ang bakante!'], [b.g, ...[1, 3].map((r, i) => K(b.cx(i ? 5 : 1), b.cy(r), 'wide', b.kh, 'r', 'slide')), E('↔️', b.cx(3), b.cy(1) - 8, 5), K(b.cx(3), b.cy(4), 'stand', b.kh)], 'ui'),
      st(['Reach the ⭐, then run back home 🏠 to win!', 'Abutin ang ⭐, saka tumakbo pabalik sa 🏠 para manalo!'], [b.g, E('⭐', b.cx(0), b.cy(0) - 3, 6), E('🏠', b.cx(6), b.cy(4) - 3, 6), K(b.cx(1), b.cy(0), 'jump', b.kh, 'me', 'hop'), E('➡️', b.cx(3), b.cy(0) - 4, 6, 'slide')], 'ui')
    ]); }

  /* ================= AGAWAN BASE ================= */
  { const b = brd(9, 5, 19, 4, 6.4);
    D('agawan', [
      st(['Two teams. Each has a base far away from the other.', 'Dalawang koponan. May sariling base ang bawat isa, magkalayo.'], [R(49.4, 10, 1, 80, '#fff'), E('🌳', 12, 62, 15), K(26, 84, 'stand', 26, 0, 0, blue), K(14, 90, 'stand', 26, 'me', 0, blue), E('🚩', 88, 60, 13), K(74, 84, 'stand', 26, 'r'), K(86, 90, 'stand', 26, 'r', 0, { girl: true })], 'ground'),
      st(['Tag opponents. Tagged players go to jail 🔒.', 'Tayain ang kalaban. Ang natayaan ay mapupunta sa 🔒 kulungan.'], [R(49.4, 10, 1, 80, '#fff'), K(40, 82, 'run', 28, 'me', 'bob', blue), K(58, 82, 'run', 28, 'r', 'bob'), E('👆', 49, 56, 8, 'tap'), R(74, 12, 20, 26, '#adb5bd', 8), K(84, 34, 'stand', 20, 1), E('🔒', 84, 16, 7)], 'ground'),
      st(['A friend frees you with a touch. Touch the enemy base to win!', 'Palalayain ka ng kaibigan sa isang hawak. Hawakan ang base ng kalaban para manalo!'], [R(74, 12, 20, 26, '#adb5bd', 8), K(84, 34, 'stand', 20, 1), K(70, 52, 'run', 26, 'me', 'bob', blue), E('🙌', 77, 40, 7, 'tap'), E('🚩', 88, 84, 13, 'bob'), K(60, 90, 'jump', 26, 3, 'hop', blue)], 'ground')
    ], [
      st(['Run to the red 🚩 flag on the right.', 'Tumakbo sa pulang 🚩 sa kanan.'], [b.g, R(19, 4, 6.4 * 4, 6.4 * 4 / 3 * 5, 'rgba(51,154,240,.35)'), R(19 + 6.4 * 5, 4, 6.4 * 4, 6.4 * 4 / 3 * 5, 'rgba(250,82,82,.35)'), K(b.cx(1), b.cy(2), 'run', b.kh, 'me', 0, blue), E('🚩', b.cx(8), b.cy(2) - 2, 6), ...dpad(50, 76), tap(58, 82)], 'ui'),
      st(['The red team only chases you on their side.', 'Hinahabol ka lang ng pulang koponan sa kanilang panig.'], [b.g, R(19 + 6.4 * 5, 4, 6.4 * 4, 6.4 * 4 / 3 * 5, 'rgba(250,82,82,.35)'), K(b.cx(6), b.cy(1), 'wide', b.kh, 'r', 'bob'), K(b.cx(6), b.cy(3), 'wide', b.kh, 'r', 'bob'), K(b.cx(3), b.cy(2), 'run', b.kh, 'me', 0, blue)], 'ui'),
      st(['Caught? Tap “Call a friend” to be rescued!', 'Nahuli? Pindutin ang “Tumawag ng kaibigan” para maligtas!'], [b.g, R(b.cx(8) - 3, b.cy(0) - 8, 6.4, 8.6, '#adb5bd'), K(b.cx(8), b.cy(0), 'stand', b.kh, 'me', 0, blue), E('🔒', b.cx(8), b.cy(0) - 4, 4), K(b.cx(3), b.cy(0), 'run', b.kh, 3, 'slide', blue), ...btn('🙋 Call a friend!', 50, 80, 56), tap(66, 86)], 'ui')
    ]); }

  /* ================= LANGIT-LUPA ================= */
  { const b = brd(8, 5, 22, 4, 7);
    const rock = (c, r) => R(b.cx(c) - 3.2, b.cy(r) - 8.5, 6.4, 8.6, '#d8b98d', 2, 0, 'box-shadow:0 .6cqw 0 #b98f5a');
    D('langit', [
      st(['Taya chases. Everyone else stays near raised spots like steps and rocks.', 'Hinahabol ng Taya ang iba. Nasa paligid sila ng matataas na lugar gaya ng hagdan at bato.'], [R(8, 64, 26, 10, '#d8b98d', 3), R(14, 56, 14, 8, '#d8b98d', 3), K(21, 56, 'stand', 26, 1), E('🪨', 56, 82, 13), K(56, 76, 'stand', 24, 'me'), K(84, 90, 'run', 28, 'r', 'bob')], 'grass'),
      st(['On the raised spot (langit) you are safe. On the ground (lupa) you can be tagged!', 'Ligtas ka sa mataas (langit). Sa lupa (lupa), puwede kang matayaan!'], [R(10, 62, 34, 10, '#d8b98d', 3), K(27, 62, 'stand', 28, 1), T('☁️ Langit', 27, 30, 4), E('✅', 38, 40, 7), K(70, 90, 'run', 28, 3, 'bob'), K(82, 90, 'run', 28, 'r', 'bob'), E('👆', 76, 66, 8, 'tap'), T('🌱 Lupa', 76, 44, 4)], 'grass'),
      st(['Tagged on the lupa? You become the new Taya!', 'Natayaan sa lupa? Ikaw na ang bagong Taya!'], [K(30, 88, 'run', 30, 'r', 'bob'), E('🏷️', 30, 50, 8), E('🔄', 52, 62, 10, 'spin'), K(76, 88, 'run', 28, 'me', 'bob')], 'grass')
    ], [
      st(['Move with the arrows. Collect 3 ⭐.', 'Gumalaw gamit ang arrow. Kolektahin ang 3 ⭐.'], [b.g, rock(2, 1), rock(5, 2), rock(1, 3), E('⭐', b.cx(6), b.cy(0) - 3, 5, 'bob'), E('⭐', b.cx(3), b.cy(3) - 3, 5, 'bob'), K(b.cx(0), b.cy(4), 'stand', b.kh), ...dpad(50, 76), tap(58, 82)], 'ui'),
      st(['Stand on a 🪨 rock to be safe ✅.', 'Tumayo sa 🪨 para ligtas ✅.'], [b.g, rock(2, 2), K(b.cx(2), b.cy(2) - .5, 'stand', b.kh, 'me', 0, {}), E('✅', b.cx(2) + 3, b.cy(2) - 12, 5, 'bob'), K(b.cx(5), b.cy(2), 'run', b.kh, 'r', 'bob')], 'ui'),
      st(['Tagged? Now YOU chase your friend!', 'Natayaan? Ngayon IKAW ang hahabol sa kaibigan!'], [b.g, K(b.cx(2), b.cy(3), 'run', b.kh, 'me', 'bob'), E('🏷️', b.cx(2) + 3, b.cy(3) - 12, 5), K(b.cx(5), b.cy(3), 'run', b.kh, 3, 'slide')], 'ui')
    ]); }

  /* ================= TAGUAN ================= */
  D('taguan', [
    st(['Taya covers their eyes at the base and counts. Everyone runs to hide!', 'Tinatakpan ng Taya ang mata sa base at nagbibilang. Nagtatago ang lahat!'], [E('🌳', 20, 60, 22), K(34, 88, 'arms', 32, 'me'), T('1… 2… 3…', 30, 34, 5, '#7048e8', 'bob'), K(62, 88, 'run', 24, 1, 'bob'), K(82, 80, 'run', 22, 2, 'bob'), E('🏠', 64, 60, 18)], 'grass'),
    st(['Taya searches everywhere.', 'Hinahanap ng Taya ang bawat sulok.'], [E('🏠', 68, 64, 22), K(76, 68, 'stand', 20, 1, 'bob'), E('🌴', 88, 60, 16), K(34, 88, 'run', 30, 'me', 'bob'), E('🔍', 46, 58, 9, 'bob')], 'grass'),
    st(['Found someone? Race back to base and shout “Pung!”', 'May nakita? Tumakbo pabalik sa base at isigaw ang “Pung!”'], [E('🌳', 22, 62, 22), K(34, 88, 'jump', 30, 'me', 'hop'), T('PUNG!', 34, 28, 8, '#e5383b', 'bob'), K(72, 86, 'stand', 24, 1), E('😮', 72, 54, 7)], 'grass')
  ], [
    st(['Pick a place: village, forest, playground, school or beach.', 'Pumili ng lugar: baryo, gubat, palaruan, paaralan o dalampasigan.'], [...['🏘️', '🌲', '🛝', '🏫', '🏖️'].map((e, i) => [R(7 + i * 18, 30, 16, 26, ['#74b816', '#2b8a3e', '#f59f00', '#4263eb', '#15aabf'][i], 6), E(e, 15 + i * 18, 43, 9)]).flat(), tap(33, 62)], 'ui'),
    st(['Count to ten together. Eyes closed!', 'Magbilang hanggang sampu nang sabay. Pikit ang mata!'], [R(32, 8, 36, 30, '#fff', 8), T('5', 50, 24, 11, '#7048e8'), T(FZ.lang === 'tl' ? 'Lima' : 'Five', 50, 34, 4.5, '#7048e8'), K(50, 92, 'arms', 44, 'me')], 'ui'),
    st(['Tap a hiding place. Found a friend? Tap PUNG!', 'Pindutin ang taguan. May nakita? Pindutin ang PUNG!'], [R(8, 6, 84, 56, '#9be37a', 6), E('🛖', 26, 44, 16), E('🌴', 74, 40, 16), K(38, 46, 'stand', 20, 1, 'bob'), E('👀', 38, 24, 5), ...btn('🏁 PUNG!', 50, 80, 40, '#ff6b6b'), tap(60, 86)], 'ui')
  ]);

  /* ================= ARAW-LILIM ================= */
  { const b = brd(8, 5, 22, 4, 7);
    const sh = (c0, c1, r0, r1) => R(b.cx(c0) - 3.5, b.cy(r0) - 8.7, 7 * (c1 - c0 + 1), 9.3 * (r1 - r0 + 1), '#3d9a55', 0);
    D('araw', [
      st(['Stay in the shade (lilim) where you cannot be tagged.', 'Manatili sa lilim kung saan hindi ka matatayaan.'], [E('🌞', 86, 14, 12, 'spin'), E('🌳', 26, 60, 22), R(8, 62, 40, 12, 'rgba(0,0,0,.22)', 50), K(26, 76, 'stand', 26, 1), K(72, 88, 'run', 28, 'r', 'bob')], 'grass'),
      st(['The sun moves, so the shade moves. Find new shade!', 'Gumagalaw ang araw kaya gumagalaw ang lilim. Maghanap ng bagong lilim!'], [E('🌞', 22, 14, 12, 'slide'), E('🌳', 72, 60, 22), R(50, 62, 42, 12, 'rgba(0,0,0,.22)', 50), K(66, 76, 'stand', 26, 1, 'bob'), E('➡️', 40, 74, 8, 'slide')], 'grass'),
      st(['In the sunshine (araw) you can be tagged!', 'Sa araw (araw), puwede kang matayaan!'], [E('🌞', 84, 14, 12, 'spin'), K(40, 88, 'run', 30, 'r', 'bob'), K(60, 88, 'run', 28, 3, 'bob'), E('👆', 50, 66, 8, 'tap'), E('😅', 60, 50, 7)], 'grass')
    ], [
      st(['Dark green squares are shade. Stand there to be safe ✅.', 'Ang madilim na berdeng kahon ay lilim. Tumayo roon para ligtas ✅.'], [b.g, sh(1, 3, 1, 2), E('🌳', b.cx(1), b.cy(1) - 3, 7), K(b.cx(2), b.cy(2), 'stand', b.kh, 'me'), E('✅', b.cx(2) + 3, b.cy(2) - 12, 5)], 'ui'),
      st(['Watch the ☀️ bar: when the sun moves, the shade moves!', 'Bantayan ang ☀️: kapag gumalaw ang araw, gumagalaw ang lilim!'], [R(22, 4, 56, 8, '#ffe066', 99), E('☀️', 30, 8, 7, 'slide'), b.g && { ...b.g, y: 16 }, R(b.cx(4) - 3.5, 16 + 3, 21, 9.3 * 2, '#3d9a55', 0, 'pulse')], 'ui'),
      st(['Collect 3 ⭐ in the sunshine. Tagged? Then you chase!', 'Kolektahin ang 3 ⭐ sa araw. Natayaan? Ikaw ang hahabol!'], [b.g, sh(1, 3, 1, 2), E('⭐', b.cx(6), b.cy(1) - 3, 5, 'bob'), E('⭐', b.cx(5), b.cy(3) - 3, 5, 'bob'), K(b.cx(4), b.cy(2), 'run', b.kh, 'me', 'bob'), K(b.cx(7), b.cy(0), 'run', b.kh, 'r', 'bob')], 'ui')
    ]); }

  /* ================= LAWIN AT SISIW ================= */
  { const b = brd(7, 5);
    D('lawin', [
      st(['Chicks line up behind Mother Hen, holding each other\'s waist.', 'Nakapila ang mga sisiw sa likod ng Inahin, nakahawak sa baywang.'], [K(50, 50, 'arms', 30, 'me'), K(50, 62, 'stand', 26, 1), K(50, 74, 'stand', 26, 2), K(50, 86, 'stand', 26, 3), K(50, 28, 'wide', 22, 'r'), E('🐔', 24, 44, 9), E('🐥', 24, 64, 7), E('🐥', 24, 78, 7)], 'ground'),
      st(['The hawk tries to touch the last chick. The hen spreads her arms to block!', 'Susubukan ng lawin na hawakan ang huling sisiw. Haharangan ito ng inahin!'], [K(50, 56, 'wide', 34, 'me'), K(50, 70, 'stand', 26, 1), K(50, 84, 'stand', 26, 2), K(72, 50, 'run', 26, 'r', 'bob'), E('↙️', 62, 66, 8, 'bob')], 'ground'),
      st(['A tagged chick joins the hawk!', 'Ang nahuling sisiw ay sasama sa lawin!'], [K(36, 86, 'stand', 28, 'me'), K(60, 70, 'run', 26, 'r', 'bob'), K(76, 86, 'run', 24, 1, 'bob', { shirt: '#e5383b' }), E('🏷️', 76, 62, 6), E('😮', 36, 54, 6)], 'ground')
    ], [
      st(['You are Mother Hen 🐔. Your chicks 🐥 follow you.', 'Ikaw ang Inahing 🐔. Sumusunod ang mga sisiw 🐥.'], [b.g, K(b.cx(3), b.cy(3), 'arms', b.kh, 'me'), E('🐥', b.cx(2), b.cy(4) - 2, 5), E('🐥', b.cx(3), b.cy(4) - 2, 5), E('🐥', b.cx(4), b.cy(4) - 2, 5), ...dpad(50, 80).slice(1, 4).map(x => x), tap(58, 86)], 'ui'),
      st(['⚠️ shows where the hawk will dive.', 'Ipinapakita ng ⚠️ kung saan sisisid ang lawin.'], [b.g, K(b.cx(5), b.cy(0), 'wide', b.kh, 'r', 'bob'), E('⚠️', b.cx(5), b.cy(2), 6, 'pulse'), K(b.cx(3), b.cy(3), 'arms', b.kh, 'me')], 'ui'),
      st(['Move left or right to be under it and block!', 'Lumipat pakaliwa o pakanan para mapunta sa ilalim at humarang!'], [b.g, K(b.cx(5), b.cy(2), 'wide', b.kh, 'r'), K(b.cx(5), b.cy(3), 'wide', b.kh, 'me', 'bob'), E('✅', b.cx(5) + 3, b.cy(3) - 12, 5), E('➡️', b.cx(4), b.cy(3) - 5, 6, 'slide')], 'ui')
    ]); }

  /* ================= KAPITANG BAKOD ================= */
  { const b = brd(8, 5, 22, 4, 7);
    const log = (c, r) => R(b.cx(c) - 3.2, b.cy(r) - 8.5, 6.4, 8.6, '#c08457', 2);
    D('bakod', [
      st(['Touching a fence, post or wall? You are safe!', 'Nakahawak sa bakod, poste o pader? Ligtas ka!'], [R(8, 52, 84, 4, '#a9744f'), ...[12, 40, 68, 88].map(x => R(x, 46, 3, 16, '#8d5a34')), K(26, 70, 'stand', 28, 1), E('✋', 30, 56, 6), E('✅', 38, 44, 7), K(70, 92, 'run', 28, 'r', 'bob')], 'grass'),
      st(['You cannot stay forever. Run to another fence!', 'Hindi ka puwedeng magtagal. Tumakbo sa ibang bakod!'], [R(6, 56, 26, 4, '#a9744f'), R(68, 56, 26, 4, '#a9744f'), K(24, 76, 'run', 28, 'me', 'bob'), E('➡️', 48, 64, 9, 'slide'), T('5… 4… 3…', 50, 28, 6, '#e5383b', 'bob'), K(84, 90, 'stand', 28, 'r')], 'grass'),
      st(['Tagged away from the fence? You are the new Taya!', 'Natayaan nang malayo sa bakod? Ikaw na ang bagong Taya!'], [R(8, 52, 30, 4, '#a9744f'), K(60, 86, 'run', 30, 'r', 'bob'), K(78, 86, 'run', 28, 3, 'bob'), E('👆', 69, 62, 8, 'tap'), E('🏷️', 78, 52, 7)], 'grass')
    ], [
      st(['Brown logs are the fence. Yellow squares touch it: safe ✅.', 'Ang mga troso ang bakod. Ang dilaw na kahon ay nakahawak dito: ligtas ✅.'], [b.g, ...[1, 2, 3].map(r => log(4, r)), ...[1, 2, 3].map(r => [R(b.cx(3) - 3.5, b.cy(r) - 9.2, 7, 9.3, '#f1f8a8'), R(b.cx(5) - 3.5, b.cy(r) - 9.2, 7, 9.3, '#f1f8a8')]).flat(), K(b.cx(3), b.cy(2), 'stand', b.kh, 'me'), E('✅', b.cx(3) + 3, b.cy(2) - 12, 5)], 'ui'),
      st(['Collect 3 ⭐ away from the fence.', 'Kolektahin ang 3 ⭐ na malayo sa bakod.'], [b.g, ...[1, 2, 3].map(r => log(4, r)), E('⭐', b.cx(1), b.cy(1) - 3, 5, 'bob'), E('⭐', b.cx(7), b.cy(3) - 3, 5, 'bob'), K(b.cx(2), b.cy(3), 'run', b.kh, 'me', 'bob'), K(b.cx(6), b.cy(0), 'run', b.kh, 'r', 'bob'), ...dpad(50, 80).slice(0, 0)], 'ui'),
      st(['Tagged? Now YOU are It. Tag your friend!', 'Natayaan? Ikaw na ang Taya. Tayain ang kaibigan mo!'], [b.g, ...[1, 2, 3].map(r => log(4, r)), K(b.cx(1), b.cy(2), 'run', b.kh, 'me', 'bob'), E('🏷️', b.cx(1) + 3, b.cy(2) - 12, 5), K(b.cx(2), b.cy(2), 'run', b.kh, 3, 'slide')], 'ui')
    ]); }

  /* ================= LUKSONG TINIK ================= */
  D('tinik', [
    st(['Two friends sit, soles touching. That is the first thorn (tinik).', 'Magkaupo ang dalawang kaibigan, magkadikit ang talampakan. Ito ang unang tinik.'], [S(tinik(1), 34, 61.5, 32), K(12, 88, 'stand', 40, 'me', 'bob')], 'jump'),
    st(['They pile their hands up, one on top of the other.', 'Pinapatong nila ang mga kamay, isa sa ibabaw ng isa.'], [S(tinik(3), 34, 61.5, 32), K(12, 88, 'stand', 40, 'me', 'bob')], 'jump'),
    st(['Run and jump over the tinik without touching it!', 'Tumakbo at lundagan ang tinik nang hindi ito nahahawakan!'], [S(tinik(4), 34, 61.5, 32), K(50, 50, 'jump', 40, 'me', 'hop'), E('🎉', 82, 40, 9, 'bob')], 'jump')
  ], [
    st(['Watch the red marker slide on the bar.', 'Panoorin ang pulang marka na gumagalaw sa bar.'], [S(tinik(2), 34, 38, 32), K(12, 64, 'stand', 40, 'me'), ...meter(8, 84, 52, .3, .45), ...btn('🦘 Talon!', 80, 84, 24)], 'jump'),
    st(['Tap Talon! when the marker is past the green line.', 'Pindutin ang Talon! kapag lampas na sa berdeng linya ang marka.'], [S(tinik(2), 34, 38, 32), K(12, 64, 'stand', 40, 'me'), ...meter(8, 84, 52, .62, .45), ...btn('🦘 Talon!', 80, 84, 24), tap(84, 90)], 'jump'),
    st(['Each level the tinik is taller. Clear all 5 levels!', 'Tumataas ang tinik sa bawat antas. Lampasan ang 5 antas!'], [S(tinik(5), 34, 38, 32), K(52, 28, 'jump', 40, 'me', 'hop'), T('5 / 5', 14, 12, 5, '#7048e8'), E('⭐', 84, 18, 9, 'bob')], 'jump')
  ]);

  /* ================= LUKSONG BAKA ================= */
  D('baka', [
    st(['The baka crouches low with hands on the ground.', 'Nakayuko nang mababa ang baka, nakapatong ang kamay sa lupa.'], [S(baka(1), 40, 56.8, 21.4), K(14, 88, 'stand', 40, 'me', 'bob')], 'jump'),
    st(['Run and leap over the back like leap-frog. Never touch!', 'Tumakbo at lumundag sa likod na parang leap-frog. Huwag hahawak!'], [S(baka(2), 40, 56.8, 21.4), K(50, 52, 'jump', 40, 'me', 'hop')], 'jump'),
    st(['Each round the baka rises: feet, knees, thighs.', 'Bawat ikot ay tumataas ang baka: paa, tuhod, hita.'], [S(baka(4), 40, 56.8, 21.4), K(14, 88, 'stand', 40, 'me', 'bob'), E('⬆️', 70, 62, 9, 'bob')], 'jump')
  ], [
    st(['Press and HOLD the button. The bar fills with power!', 'Pindutin at I-HOLD ang pindutan. Pupuno ng lakas ang bar!'], [S(baka(1), 40, 38, 21.4), K(14, 64, 'stand', 40, 'me'), ...meter(8, 84, 52, .35, .55), ...btn('🦘 Hold…', 80, 84, 24), tap(84, 90)], 'jump'),
    st(['Let go when the bar passes the green line!', 'Bitawan kapag lampas na sa berdeng linya ang bar!'], [S(baka(2), 40, 38, 21.4), K(52, 30, 'jump', 40, 'me', 'hop'), ...meter(8, 84, 52, .7, .55), ...btn('🦘 Hold…', 80, 84, 24)], 'jump'),
    st(['The baka rises higher every level. Clear all 4!', 'Tumataas ang baka sa bawat antas. Lampasan ang 4!'], [S(baka(4), 40, 38, 21.4), K(14, 64, 'stand', 40, 'me', 'bob'), T('4 / 4', 14, 12, 5, '#7048e8'), E('⭐', 84, 18, 9, 'bob')], 'jump')
  ]);

  /* ================= CHINESE GARTER ================= */
  { const band = (y, w = 56) => R(22, y, w, 1.8, 'repeating-linear-gradient(90deg,#ff6b6b 0 3cqw,#ffd43b 3cqw 6cqw)', 2);
    D('garter', [
      st(['Two friends hold the elastic band around their ankles.', 'Hawak ng dalawang kaibigan ang garter sa kanilang bukong-bukong.'], [K(18, 86, 'wide', 44, 1), K(84, 86, 'wide', 44, 2, 0, { flip: true }), band(82), K(50, 86, 'stand', 34, 'me')], 'jump'),
      st(['The jumper hops in a pattern: sideways, on the band, then over!', 'Tumatalon ang manlalaro sa ayos: patagilid, sa garter, saka lampas!'], [K(18, 86, 'wide', 44, 1), K(84, 86, 'wide', 44, 2, 0, { flip: true }), band(82), K(50, 62, 'jump', 34, 'me', 'hop'), E('⬅️', 36, 54, 6, 'bob'), E('➡️', 64, 54, 6, 'bob')], 'jump'),
      st(['The band rises: ankle, knee, waist, neck!', 'Tumataas ang garter: bukong-bukong, tuhod, baywang, leeg!'], [K(18, 86, 'wide', 44, 1), K(84, 86, 'wide', 44, 2, 0, { flip: true }), band(80), band(66), band(54), band(40), E('⬆️', 50, 28, 9, 'bob')], 'jump')
    ], [
      st(['Copy the pattern shown in the chips.', 'Gayahin ang ayos na nasa mga chip.'], [...['⬅️🦶', '🦶➡️', '⬆️🦘'].map((c, i) => [R(18 + i * 22, 14, 20, 16, '#fff', 4), T(c, 28 + i * 22, 22, 6)]).flat(), R(18, 14, 20, 16, 'transparent', 4, 'pulse', 'outline:.8cqw solid #b38cff'), K(50, 92, 'stand', 40, 'me')], 'ui'),
      st(['Tap Left, Talon or Right in the same order.', 'Pindutin ang Kaliwa, Talon o Kanan sa parehong ayos.'], [...['⬅️🦶', '🦶➡️', '⬆️🦘'].map((c, i) => [R(18 + i * 22, 8, 20, 14, i < 1 ? '#8ce99a' : '#fff', 4), T(c, 28 + i * 22, 15, 5.5)]).flat(), ...btn('⬅️ Left', 22, 56, 24), ...btn('⬆️ Talon', 50, 56, 24), ...btn('Right ➡️', 78, 56, 24), tap(24, 66), K(50, 94, 'stand', 26, 'me')], 'ui'),
      st(['Mistake? Start again. Done? The rope goes higher!', 'Nagkamali? Ulitin. Tapos na? Tataas ang garter!'], [K(18, 86, 'wide', 44, 1), K(84, 86, 'wide', 44, 2, 0, { flip: true }), band(64), K(50, 86, 'stand', 34, 'me', 'bob'), E('⬆️', 50, 44, 9, 'bob'), T('Level 2 / 5', 20, 14, 4.5, '#7048e8')], 'ui')
    ]); }

  /* ================= PIKO ================= */
  { const rows = [['L'], [8], [6, 7], [5], [3, 4], [2], [1]];       // drawn top to bottom
    const pk = (hi, done, stone) => { const out = []; let y = 6;
      rows.forEach(r => { const w = r[0] === 'L' ? 30 : 15; const x0 = 50 - (r.length * w) / 2;
        r.forEach((id, j) => { out.push(R(x0 + j * w, y, w - 1, 11, hi.includes(id) ? '#f3f0ff' : done.includes(id) ? '#d3f9d8' : '#fff', 2, hi.includes(id) ? 'pulse' : 0, 'border:.7cqw solid #8d6e4a;' + (hi.includes(id) ? 'outline:.9cqw solid #b38cff' : '')), T(id === 'L' ? '🌈 Langit' : (stone === id ? id + '🪨' : id), x0 + j * w + (w - 1) / 2, y + 5.5, id === 'L' ? 4 : 5, '#5c3a14')); });
        y += 12; });
      return out; };
    D('piko', [
      st(['Draw numbered boxes with chalk and a Langit (heaven) at the end.', 'Gumuhit ng may numerong kahon gamit ang tisa, at Langit sa dulo.'], [...pk([], [], 0), K(86, 92, 'stand', 34, 'me', 'bob')], 'ground'),
      st(['Throw your stone (maru) into box 1. Hop: one foot on single boxes, two feet on boxes side by side.', 'Ihagis ang bato (maru) sa kahon 1. Lundag: isang paa sa isang kahon, dalawang paa sa magkatabing kahon.'], [...pk([], [1, 2], 1), K(18, 92, 'knee', 34, 'me', 'hop'), E('🪨', 40, 86, 7, 'bob')], 'ground'),
      st(['Rest in Langit, turn around, hop back and pick up your stone.', 'Magpahinga sa Langit, lumingon, lumundag pabalik at kunin ang bato.'], [...pk([], [1, 2, 3, 4, 5, 6, 7, 8], 0), K(20, 30, 'jump', 34, 'me', 'hop'), E('🎉', 80, 20, 9, 'bob')], 'ground')
    ], [
      st(['Tap the glowing box to throw your stone 🪨.', 'Pindutin ang kumikinang na kahon para ihagis ang bato 🪨.'], [...pk([1], [], 0), tap(60, 82)], 'ui'),
      st(['Tap the glowing boxes: one box = one foot, two boxes = both feet.', 'Pindutin ang mga kumikinang na kahon: isang kahon = isang paa, dalawa = dalawang paa.'], [...pk([3, 4], [1], 2), tap(62, 62)], 'ui'),
      st(['Rest in Langit 🌈, hop back and tap your stone.', 'Magpahinga sa Langit 🌈, lumundag pabalik at pindutin ang bato.'], [...pk(['L'], [8, 6, 7, 5], 2), tap(62, 14)], 'ui')
    ]); }

  /* ================= KADANG-KADANG ================= */
  D('kadang', [
    st(['Stand on coconut shells and hold the ropes tight.', 'Tumayo sa bao ng niyog at hawakan nang mahigpit ang lubid.'], [K(50, 80, 'stand', 46, 'me', 'bob'), E('🥥', 44, 86, 11), E('🥥', 56, 86, 11), R(36, 42, 1, 42, '#8d5524'), R(63, 42, 1, 42, '#8d5524')], 'grass'),
    st(['Step left, right, left, right while you balance.', 'Humakbang: kaliwa, kanan, kaliwa, kanan habang nagbabalanse.'], [K(50, 82, 'run', 46, 'me', 'bob'), E('🥥', 42, 88, 11), E('🥥', 60, 84, 11), T('⬅️ ➡️ ⬅️ ➡️', 50, 24, 7, '#7048e8', 'bob')], 'grass'),
    st(['First to the finish line wins!', 'Ang unang makarating sa finish line ang panalo!'], [K(34, 56, 'run', 26, 'me', 'bob'), K(24, 72, 'run', 26, 1, 'bob'), K(30, 90, 'run', 26, 2, 'bob'), E('🏁', 86, 56, 12), E('🏁', 86, 74, 12), E('🏁', 86, 92, 12), E('🏆', 70, 28, 11, 'bob')], 'grass')
  ], [
    st(['Wait for “Takbo!” at the start line.', 'Hintayin ang “Takbo!” sa simula.'], [...[14, 36, 58].map((y, i) => [R(6, y, 88, 18, '#fff6c9', 4), K(14, y + 16, 'run', 20, i === 0 ? 'me' : i)]).flat(), E('🏁', 88, 24, 8), E('🏁', 88, 46, 8), E('🏁', 88, 68, 8), T('3… 2… 1…', 50, 86, 6, '#7048e8', 'bob')], 'ui'),
    st(['Tap Left, then Right, then Left, then Right…', 'Pindutin ang Kaliwa, Kanan, Kaliwa, Kanan…'], [R(6, 14, 88, 18, '#fff6c9', 4), K(48, 30, 'run', 20, 'me', 'slide'), E('🏁', 88, 24, 8), ...btn('🥥 Left', 30, 62, 34), ...btn('Right 🥥', 70, 62, 34), tap(34, 72), E('➡️', 50, 78, 6, 'slide')], 'ui'),
    st(['Same side twice? You wobble and slide back!', 'Parehong panig dalawang beses? Magwawagayway ka at aatras!'], [R(6, 14, 88, 18, '#fff6c9', 4), K(30, 30, 'run', 20, 'me', 'bob'), E('💫', 30, 14, 7, 'spin'), E('⬅️', 48, 26, 7, 'slide'), ...btn('🥥 Left', 30, 62, 34, '#ff8787'), E('2×', 30, 52, 7)], 'ui')
  ]);

  /* ================= TUMBANG PRESO ================= */
  D('tumbang', [
    st(['A tin can stands in a circle. Taya guards it. Players stand behind the line.', 'May lata sa loob ng bilog. Binabantayan ito ng Taya. Nasa likod ng linya ang mga manlalaro.'], [R(36, 22, 28, 38, 'rgba(255,255,255,.4)', 50, 0, 'border:.9cqw dashed #fff'), E('🥫', 50, 42, 11), K(72, 52, 'stand', 26, 'r'), R(6, 72, 88, 1.2, '#fff'), K(30, 92, 'stand', 28, 'me'), K(60, 92, 'stand', 28, 1), E('🩴', 30, 80, 6), E('🩴', 60, 80, 6)], 'ground'),
    st(['Throw your tsinelas to knock the can down!', 'Ihagis ang tsinelas para matumba ang lata!'], [R(36, 22, 28, 38, 'rgba(255,255,255,.4)', 50, 0, 'border:.9cqw dashed #fff'), E('🥫', 50, 42, 11, 'shake'), E('🩴', 42, 62, 9, 'slide'), K(30, 92, 'throw' in {} ? 'stand' : 'arms', 30, 'me'), K(74, 52, 'stand', 26, 'r')], 'ground'),
    st(['Everyone runs to grab their slippers. Taya tags anyone away from theirs!', 'Tatakbo ang lahat para kunin ang tsinelas. Tatayain ng Taya ang malayo sa tsinelas niya!'], [E('🥫', 50, 30, 11), K(36, 70, 'run', 28, 'r', 'bob'), K(26, 90, 'run', 28, 'me', 'bob'), K(72, 90, 'run', 28, 1, 'bob'), E('🩴', 50, 82, 7), E('🩴', 84, 82, 7)], 'ground')
  ], [
    st(['Watch the red marker slide on the bar.', 'Panoorin ang pulang marka na gumagalaw.'], [R(14, 8, 72, 40, '#d8f5a2', 6), E('🥫', 50, 30, 10), K(50, 46, 'stand', 24, 'me'), R(10, 62, 80, 8, '#fff', 99), R(40, 62, 20, 8, '#8ce99a', 99), R(26, 62, 1.8, 8, '#e03131', 99, 'slide')], 'ui'),
    st(['Tap Hagis! when the marker is in the green zone.', 'Pindutin ang Hagis! kapag nasa berdeng bahagi ang marka.'], [R(14, 8, 72, 40, '#d8f5a2', 6), E('🥫', 50, 30, 10), E('🩴', 50, 40, 7, 'bob'), R(10, 58, 80, 8, '#fff', 99), R(40, 58, 20, 8, '#8ce99a', 99), R(49, 58, 1.8, 8, '#e03131', 99), ...btn('🩴 Hagis!', 50, 82, 40), tap(60, 88)], 'ui'),
    st(['Can fell? Tap Takbo! fast to grab your tsinelas before Taya!', 'Natumba ang lata? Pindutin ang Takbo! nang mabilis para makuha ang tsinelas bago ang Taya!'], [E('🥫', 50, 22, 10), R(10, 40, 80, 7, '#fff', 99), R(10, 40, 56, 7, '#6fcf97', 99), R(10, 52, 80, 7, '#fff', 99), R(10, 52, 30, 7, '#ff8787', 99), ...btn('🏃 Takbo!', 50, 80, 40), tap(60, 86)], 'ui')
  ]);

  /* ================= SIPA ================= */
  D('sipa', [
    st(['A sipa is a metal washer with colorful plastic strips.', 'Ang sipa ay metal na washer na may makukulay na plastik na tali.'], [S(SIPA, 40, 20, 20), E('✨', 36, 30, 8, 'bob'), E('✨', 66, 36, 8, 'bob'), K(50, 96, 'stand', 36, 'me')], 'grass'),
    st(['Kick it up with your foot, knee or elbow. Never your hands!', 'Sipain pataas gamit ang paa, tuhod o siko. Bawal ang kamay!'], [S(SIPA, 56, 12, 12), K(44, 90, 'kick', 46, 'me', 'bob'), E('🚫', 70, 64, 9), E('✋', 70, 64, 6)], 'grass'),
    st(['Count how many times you keep it in the air!', 'Bilangin kung ilang beses mo itong mapapanatili sa hangin!'], [S(SIPA, 56, 8, 12), K(44, 90, 'knee', 46, 'me', 'hop'), T('1  2  3  4 …', 50, 22, 8, '#e8590c', 'bob')], 'grass')
  ], [
    st(['Watch the sipa fall into the yellow zone.', 'Panoorin ang sipa na bumabagsak sa dilaw na bahagi.'], [R(10, 36, 80, 28, 'rgba(255,224,102,.55)', 0, 0, 'border-top:.7cqw dashed #f59f00;border-bottom:.7cqw dashed #f59f00'), S(SIPA, 44, 8, 12), K(50, 92, 'stand', 40, 'me'), E('⬇️', 74, 22, 8, 'bob')], 'jump'),
    st(['Tap the body part the hint asks for: foot, knee or elbow.', 'Pindutin ang bahagi ng katawan na hinihingi: paa, tuhod o siko.'], [T('Use your KNEE 🦵!', 50, 12, 6, '#3b2f63'), S(SIPA, 44, 30, 12), K(50, 70, 'stand', 36, 'me'), ...btn('🦶 Foot', 22, 86, 26), ...btn('🦵 Knee', 50, 86, 26), ...btn('💪 Elbow', 78, 86, 26), tap(52, 94)], 'ui'),
    st(['Make 8 kicks! If it touches the ground you lose a heart 💛.', 'Gumawa ng 8 sipa! Kapag bumagsak, mawawalan ng puso 💛.'], [T('Kicks: 5/8', 50, 22, 8, '#7048e8'), T('💛💛🤍', 50, 40, 8), S(SIPA, 44, 52, 12), K(50, 94, 'knee', 34, 'me', 'hop')], 'jump')
  ]);

  /* ================= TSATO ================= */
  { const stick = (x, y, w, c, a, rot) => R(x, y, w, 2.6, c, 3, a, `transform:rotate(${rot || 0}deg);border:.4cqw solid rgba(0,0,0,.25)`);
    D('tsato', [
      st(['You need a long stick and a short stick.', 'Kailangan ng mahabang patpat at maikling patpat.'], [stick(20, 78, 50, '#e8c07d'), stick(30, 62, 14, '#8d5524'), E('👈', 24, 52, 7), T('long', 45, 90, 4, '#7a6fa3'), T('short', 37, 54, 4, '#7a6fa3'), K(84, 88, 'stand', 40, 'me')], 'grass'),
      st(['Tap the tip so the short stick flips up. Then swing and hit it!', 'Tapikin ang dulo para tumalbog ang maikling patpat. Saka palo!'], [stick(18, 80, 40, '#e8c07d', 0, -25), stick(40, 40, 14, '#8d5524', 'spin'), E('💥', 46, 38, 8, 'pulse'), K(78, 90, 'stand', 40, 'me', 'bob')], 'grass'),
      st(['Measure how far it flew with the long stick. Farthest wins!', 'Sukatin gamit ang mahabang patpat. Ang pinakamalayo ang panalo!'], [stick(10, 78, 20, '#e8c07d'), stick(30, 78, 20, '#e8c07d'), stick(50, 78, 20, '#e8c07d'), stick(70, 78, 20, '#e8c07d'), stick(82, 66, 12, '#8d5524'), E('📏', 50, 60, 9, 'bob'), T('1  2  3  4', 50, 90, 5, '#7a6fa3')], 'grass')
    ], [
      st(['Tap Tuklap! to flip the short stick up.', 'Pindutin ang Tuklap! para tumalbog ang maikling patpat.'], [stick(16, 74, 40, '#e8c07d', 0, -8), stick(22, 68, 12, '#8d5524'), ...btn('🪵 Tuklap!', 30, 90, 30), tap(40, 94)], 'jump'),
      st(['Tap Palo! when the stick is in the green dashed box.', 'Pindutin ang Palo! kapag nasa berdeng kahon ang patpat.'], [R(30, 22, 26, 12, 'transparent', 6, 0, 'border:.8cqw dashed #2f9e44'), stick(36, 26, 12, '#8d5524', 'spin'), stick(10, 70, 36, '#e8c07d', 0, -20), ...btn('🏏 Palo!', 70, 88, 30, '#ff6b6b'), tap(80, 94)], 'jump'),
      st(['3 hits. Count the stick-lengths you scored!', '3 palo. Bilangin ang mga haba ng patpat na naabot!'], [T('Total: 18', 50, 22, 9, '#7048e8', 'bob'), E('🚩', 76, 62, 10), stick(22, 72, 20, '#8d5524'), E('⭐', 24, 40, 8, 'bob'), E('⭐', 50, 40, 8, 'bob'), E('⭐', 76, 40, 8, 'bob')], 'jump')
    ]); }

  /* ================= HOLEN ================= */
  { const ball = (x, y, c, s = 6) => R(x - s / 2, y - s / 2, s, s, c, 50, 0, 'box-shadow:inset -.5cqw -.6cqw 1cqw rgba(0,0,0,.28)');
    const ring = R(28, 12, 44, 58, 'rgba(255,255,255,.3)', 50, 0, 'border:1cqw solid #fff');
    D('holen', [
      st(['Draw a circle and put marbles inside.', 'Gumuhit ng bilog at maglagay ng holen sa loob.'], [ring, ball(44, 36, '#ff6b6b'), ball(56, 44, '#ffd43b'), ball(46, 52, '#51cf66'), ball(58, 30, '#cc5de8'), K(50, 96, 'stand', 30, 'me')], 'sand'),
      st(['Kneel at the line and flick your shooter with your thumb.', 'Lumuhod sa linya at pitikin ang holen gamit ang hinlalaki.'], [ring, ball(44, 36, '#ff6b6b'), ball(56, 44, '#ffd43b'), ball(46, 52, '#51cf66'), K(50, 96, 'stand', 30, 'me'), ball(50, 76, '#339af0', 7), E('👆', 53, 82, 8, 'tap'), E('⬆️', 50, 66, 7, 'bob')], 'sand'),
      st(['Every marble knocked out of the circle is yours!', 'Ang bawat holen na mapalabas sa bilog ay sa iyo!'], [ring, ball(46, 40, '#51cf66'), ball(14, 48, '#ff6b6b'), ball(86, 36, '#ffd43b'), E('🎉', 50, 14, 9, 'bob'), K(50, 96, 'jump', 30, 'me', 'hop')], 'sand')
    ], [
      st(['Put your finger down and pull back like a slingshot.', 'Idiin ang daliri at hilahin pabalik na parang tirador.'], [ring, ball(44, 36, '#ff6b6b'), ball(56, 44, '#ffd43b'), ball(46, 52, '#51cf66'), ball(50, 80, '#339af0', 8), E('👆', 53, 90, 9, 'tap'), R(49.5, 80, 1.5, 12, '#e03131')], 'sand'),
      st(['Let go to flick your blue shooter 🔵!', 'Bitawan para mapitik ang asul na holen 🔵!'], [ring, ball(44, 36, '#ff6b6b'), ball(56, 44, '#ffd43b'), E('⬆️', 50, 62, 10, 'bob'), ball(50, 78, '#339af0', 8)], 'sand'),
      st(['Knock 3 coloured marbles out of the circle.', 'Pabagsakin palabas ng bilog ang 3 makukulay na holen.'], [ring, ball(14, 40, '#ff6b6b'), ball(86, 50, '#ffd43b'), ball(50, 4, '#51cf66'), T('3 / 3', 50, 40, 9, '#7048e8', 'bob'), ball(50, 84, '#339af0', 8)], 'sand')
    ]); }

  /* ================= PALOSEBO ================= */
  { const pole = [R(47, 18, 6, 74, 'repeating-linear-gradient(#c68642 0 5cqw,#e0a96d 5cqw 6.4cqw)', 3), E('🚩', 50, 12, 10, 'bob'), E('🎁', 60, 12, 9)];
    D('palosebo', [
      st(['A tall pole is rubbed with grease. A flag and prize wait at the top.', 'May mataas na poste na pinahiran ng sebo. Nasa tuktok ang bandila at premyo.'], [...pole, E('🧈', 30, 60, 10, 'bob'), K(20, 92, 'stand', 30, 'me'), K(80, 92, 'stand', 30, 1)], 'grass'),
      st(['It is slippery! Rub sand on your hands for a better grip.', 'Madulas! Magpahid ng buhangin sa kamay para mas kumapit.'], [...pole, K(50, 70, 'climb', 30, 'me', 'bob'), E('💦', 66, 58, 8, 'bob'), E('🏖️', 20, 80, 11), E('🤲', 34, 80, 8, 'bob')], 'grass'),
      st(['Friends make a human ladder to reach the top!', 'Gumagawa ng tao-tao na hagdan ang magkakaibigan para maabot ang tuktok!'], [...pole, K(50, 94, 'stand', 26, 1), K(50, 70, 'stand', 24, 2), K(50, 48, 'climb', 24, 'me', 'bob'), E('🎉', 76, 30, 9, 'bob')], 'grass')
    ], [
      st(['Tap Akyat! again and again to climb.', 'Pindutin nang paulit-ulit ang Akyat! para umakyat.'], [...pole.map(it => it.ty === 'r' ? { ...it, x: 22 } : it.ty === 'e' ? { ...it, x: it.x - 28 } : it), K(25, 80, 'climb', 26, 'me', 'bob'), ...btn('🤲 Akyat!', 72, 60, 44), tap(82, 68)], 'ui'),
      st(['Tap 🏖️ Buhangin for a better grip.', 'Pindutin ang 🏖️ Buhangin para mas mahigpit ang kapit.'], [...pole.map(it => it.ty === 'r' ? { ...it, x: 22 } : it.ty === 'e' ? { ...it, x: it.x - 28 } : it), K(25, 64, 'climb', 26, 'me'), ...btn('🏖️ Buhangin', 72, 60, 44, '#fff'), tap(82, 68), T('🏖️ Sandy grip!', 72, 36, 4.5, '#7048e8', 'bob')], 'ui'),
      st(['Tap 👫 Kaibigan once so your friends lift you to the 🚩!', 'Pindutin ng isang beses ang 👫 Kaibigan para maiangat ka sa 🚩!'], [...pole.map(it => it.ty === 'r' ? { ...it, x: 22 } : it.ty === 'e' ? { ...it, x: it.x - 28 } : it), K(25, 34, 'climb', 26, 'me', 'bob'), ...btn('👫 Kaibigan', 72, 60, 44, '#fff'), tap(82, 68), E('⬆️', 40, 50, 8, 'bob')], 'ui')
    ]); }

    /* ================= SUNGKA ================= */
  { const pits = (hiRow, shells) => { const out = [R(6, 26, 88, 46, '#a9743f', 5), R(8, 30, 11, 38, '#4a2e12', 50), R(81, 30, 11, 38, '#4a2e12', 50)];
      for (let c = 0; c < 7; c++) [0, 1].forEach(r => out.push(R(23 + c * 8.4, 31 + r * 19, 7, 14, hiRow === r ? '#6b4a22' : '#4a2e12', 50, hiRow === r ? 'pulse' : 0, hiRow === r ? 'outline:.8cqw solid #ffe066' : ''))); if (shells) out.push(...shells); return out; };
    D('sungka', [
      st(['Two rows of 7 pits and 2 big houses (bahay). 7 shells in each pit.', 'Dalawang hanay ng 7 lubak at 2 malaking bahay. May 7 sigay sa bawat lubak.'], [...pits(-1), T('🐚×7', 34, 52, 4), K(50, 94, 'sit', 20, 'me'), E('7️⃣', 50, 18, 7)], 'wood'),
      st(['Scoop all the shells from one pit and drop one in each pit that follows.', 'Kunin ang lahat ng sigay sa isang lubak at maglagay ng isa sa bawat sunod na lubak.'], [...pits(-1), E('🤲', 30, 80, 10, 'bob'), E('🐚', 38, 58, 6, 'slide'), E('🐚', 50, 58, 6, 'slide'), E('➡️', 62, 82, 8, 'slide')], 'wood'),
      st(['Last shell in your bahay? Play again! Most shells wins!', 'Huling sigay sa bahay mo? Laro ulit! Ang pinakamaraming sigay ang panalo!'], [...pits(-1), E('🐚', 86, 48, 8, 'bob'), E('🎉', 50, 14, 10, 'bob'), E('🏆', 86, 82, 9)], 'wood')
    ], [
      st(['Tap one of your pits (bottom row).', 'Pindutin ang isa sa mga lubak mo (ibabang hanay).'], [...pits(1), tap(54, 66), T('👇 Your turn!', 50, 84, 5, '#7048e8', 'bob')], 'ui'),
      st(['The shells drop one by one to the right.', 'Isa-isang ihuhulog ang mga sigay pakanan.'], [...pits(1), E('🐚', 30, 60, 6, 'slide'), E('🐚', 40, 60, 6, 'slide'), E('➡️', 50, 84, 8, 'slide')], 'ui'),
      st(['Most shells in your 🏠 bahay wins!', 'Ang may pinakamaraming sigay sa 🏠 bahay ang panalo!'], [...pits(-1), T('🏠 You  18', 86, 24, 3.2), T('🏠  12', 14, 24, 3.2), E('🏆', 86, 84, 9, 'bob')], 'ui')
    ]); }

  /* ================= DAMA ================= */
  { const cs = 9, X0 = 28, Y0 = 6, H = cs * 4 / 3;
    const bd = (caps, hl) => { const out = [R(X0, Y0, cs * 8, H * 8, 'transparent', 3, 0, `background:repeating-conic-gradient(#a9743f 0 25%,#f6e3bf 0 50%) 0 0/${cs * 2}% ${H * 2}%`)];
      caps.forEach(([c, r, col, k]) => out.push(R(X0 + c * cs + cs * .12, Y0 + r * H + H * .12, cs * .76, H * .76, col === 'b' ? '#339af0' : '#f03e3e', 50, 0, 'box-shadow:0 .6cqw 0 rgba(0,0,0,.3)'), ...(k ? [T('👑', X0 + c * cs + cs / 2, Y0 + r * H + H / 2, 4)] : [])));
      (hl || []).forEach(([c, r]) => out.push(R(X0 + c * cs + cs * .32, Y0 + r * H + H * .32, cs * .36, H * .36, 'rgba(47,158,68,.75)', 50, 'pulse'))); return out; };
    const start = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2) { if (r < 3) start.push([c, r, 'r']); else if (r > 4) start.push([c, r, 'b']); }
    D('dama', [
      st(['Play on a checkerboard with bottle caps. 12 caps each.', 'Maglaro sa tablerong checkers gamit ang takip ng bote. 12 takip bawat isa.'], [...bd(start), E('🍾', 12, 40, 9), E('🧢', 12, 62, 9)], 'wood'),
      st(['Move one step diagonally forward onto an empty square.', 'Humakbang nang pahilis pasulong sa bakanteng parisukat.'], [...bd([[2, 5, 'b'], [5, 2, 'r']]), E('↗️', X0 + 3 * cs + cs / 2, Y0 + 4 * H + H / 2, 7, 'bob')], 'wood'),
      st(['Jump over an enemy cap to capture it. Reach the end to become a king 👑!', 'Lumundag sa takip ng kalaban para makuha ito. Abutin ang dulo para maging hari 👑!'], [...bd([[2, 5, 'b'], [3, 4, 'r']]), E('⤴️', X0 + 3 * cs + cs / 2, Y0 + 4 * H + H / 2 - 4, 8, 'bob'), ...bd([[6, 0, 'b', 1]]).slice(1)], 'wood')
    ], [
      st(['Tap a blue cap, then a green dot.', 'Pindutin ang asul na takip, saka ang berdeng tuldok.'], [...bd(start, [[0, 4], [2, 4]]), tap(X0 + cs * 1.5, Y0 + H * 6)], 'ui'),
      st(['If you can capture, you must! Those caps pulse.', 'Kapag puwedeng kumuha, kailangang kumuha! Kumikislap ang mga takip.'], [...bd([[2, 5, 'b'], [3, 4, 'r'], [5, 6, 'b'], [6, 1, 'r']], [[4, 3]]), R(X0 + 2 * cs + cs * .12, Y0 + 5 * H + H * .12, cs * .76, H * .76, 'transparent', 50, 'pulse', 'outline:.8cqw solid #ffe066')], 'ui'),
      st(['Reach the top row to become a king 👑.', 'Abutin ang itaas na hanay para maging hari 👑.'], [...bd([[4, 1, 'b'], [1, 5, 'r']], [[3, 0], [5, 0]]), E('⬆️', X0 + 4 * cs + cs / 2, Y0 + H * .4, 6, 'bob'), ...bd([[0, 0, 'b', 1]]).slice(1)], 'ui')
    ]); }
})();
