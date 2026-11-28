'use strict';
/* =====================================================
   FunZone figures: kids drawn in special poses
   - FZ.bakaFig(level)  Luksong Baka: a kid bending lower or higher (4 levels)
   - FZ.tinikFig(level) Luksong Tinik: two friends sitting, feet and hands stacked (5 levels)
   Both share one scale (kid = 112 units tall) so heights are honest.
   ===================================================== */
(function () {
  const L = (x1, y1, x2, y2, w, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const C = (x, y, r, f, ex = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${ex}/>`;
  const shoe = (x, y, rx, ry, c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" stroke="#d9a400" stroke-width="1"/>`;
  const unit = (a, b, len) => { const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1; return [a[0] + dx / m * len, a[1] + dy / m * len]; };

  /* a head seen from the side (faces left; flip = faces right; rot tilts it down) */
  function head(cx, cy, d, o = {}) {
    return `<g transform="translate(${cx} ${cy})${o.flip ? ' scale(-1 1)' : ''} rotate(${o.rot || 0})">`
      + (d.girl ? `<circle cx="7" cy="-9" r="5.5" fill="${d.hair}"/><circle cx="9.5" cy="-11.5" r="2.5" fill="#ff5d8f"/>` : '')
      + `<circle cx="2.5" cy="-1.5" r="13.5" fill="${d.hair}"/><circle cx="-2.4" cy="1.2" r="10.8" fill="${d.skin}"/>`
      + `<circle cx="-6.6" cy="1.6" r="1.9" fill="#2b1b17"/><circle cx="-7.4" cy="6.4" r="2.4" fill="#ff7a7a" opacity=".45"/>`
      + `<path d="M-8 8.2 Q-4 11.6 0 7.6" fill="none" stroke="#2b1b17" stroke-width="1.7" stroke-linecap="round"/></g>`;
  }
  const base = o => Object.assign({ skin: '#d39a66', hair: '#241713', shirt: '#22c1a6', shorts: '#e64980', shoe: '#ffd43b', girl: false }, o);

  /* ---------- LUKSONG BAKA: 4 ways to bend, lowest to highest ---------- */
  const BAKA = [
    /* 1 hands on the ground, crouched */  { A: [78, 101], K: [64, 84], H: [86, 88], S: [52, 80], W: [42, 102], hd: [37, 87], rot: -55, u: 36 },
    /* 2 hands on the feet, legs straight */ { A: [82, 101], K: [82, 86], H: [82, 71], S: [50, 85], W: [74, 100], hd: [37, 92], rot: -65, u: 44 },
    /* 3 hands on the knees */             { A: [80, 101], K: [76, 85], H: [88, 72], S: [60, 60], W: [75, 83], hd: [47, 67], rot: -35, u: 55 },
    /* 4 hands on the thighs */            { A: [82, 101], K: [83, 86], H: [86, 72], S: [62, 46], W: [80, 70], hd: [49, 51], rot: -25, u: 69 }
  ];
  FZ.BAKA_U = BAKA.map(p => p.u);                         // height of the back above the ground (units)
  FZ.bakaFig = (level = 1, o = {}) => {
    const d = base(o), p = BAKA[clamp(level, 1, 4) - 1];
    const mid = [(p.H[0] + p.S[0]) / 2, (p.H[1] + p.S[1]) / 2], slv = unit(p.S, p.W, 8);
    return `<svg class="kidsvg figsvg" viewBox="22 28 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
      + `<ellipse cx="66" cy="105" rx="40" ry="2.6" fill="rgba(0,0,0,.13)"/>`
      + L(p.K[0] + 6, p.K[1], p.A[0] + 6, p.A[1], 8, d.skin) + shoe(p.A[0] + 1, p.A[1] + 3, 8, 3.6, d.shoe)              // far leg
      + L(p.K[0], p.K[1], p.A[0], p.A[1], 8, d.skin) + shoe(p.A[0] - 5, p.A[1] + 3, 8, 3.6, d.shoe)                    // near leg
      + L(p.H[0], p.H[1], p.K[0], p.K[1], 13, d.shorts)                                                                 // thigh (shorts)
      + L(p.H[0], p.H[1], p.S[0], p.S[1], 23, d.shirt) + C(mid[0], mid[1], 2.8, '#fff', 'opacity=".9"')                // back (shirt)
      + C(p.H[0], p.H[1], 10.5, d.shorts)
      + L(p.S[0], p.S[1], p.W[0], p.W[1], 6.5, d.skin) + L(p.S[0], p.S[1], slv[0], slv[1], 11, d.shirt) + C(p.W[0], p.W[1], 4, d.skin)
      + head(p.hd[0], p.hd[1], d, { rot: p.rot })
      + `</svg>`;
  };

  /* ---------- LUKSONG TINIK: friends sit, soles touching, hands pile up ---------- */
  const HY = [44, 35, 26, 17];                               // height (y) of hand 1..4 in the pile
  FZ.TINIK_U = [15.5, 26.6, 35.6, 44.6, 53.6];             // height of the pile above the ground (units)
  function sitter(owned, d, mirror) {
    const hands = owned.map(i => [57, HY[i]]), rest = 2 - hands.length;
    let g = L(24, 57, 42, 58, 12.5, d.shorts) + L(42, 59, 55, 60, 7.5, d.skin)                                         // legs stretched to the middle
      + `<ellipse cx="58.5" cy="56" rx="3.1" ry="6.6" fill="${d.shoe}" stroke="#d9a400" stroke-width="1"/>`            // sole
      + L(24, 56, 25, 34, 22, d.shirt) + C(24.5, 46, 2.6, '#fff', 'opacity=".9"') + C(25, 56, 9, d.shorts);
    const arm = (to, up) => { const el = [(25 + to[0]) / 2 + (up ? 0 : 4), (36 + to[1]) / 2 + (up ? 6 : 3)];
      return L(25, 36, el[0], el[1], 6.2, d.skin) + L(el[0], el[1], to[0], to[1], 6, d.skin) + L(25, 36, 29, 41, 11, d.shirt); };
    hands.forEach(h => { g += arm(h, true); });
    for (let i = 0; i < rest; i++) g += arm([39 + i * 4, 52], false) + C(39 + i * 4, 52, 3.8, d.skin);                     // other hand rests on the knee
    g += head(26, 20, d, { flip: true });
    return mirror ? `<g transform="translate(120 0) scale(-1 1)">${g}</g>` : g;
  }
  FZ.tinikFig = (level = 1) => {
    const n = clamp(level, 1, 5) - 1;                           // number of hands in the pile
    const A = FZ.pals[0], B = FZ.pals[2];
    const mk = (pal, extra) => base(Object.assign({}, pal, extra));
    const own = k => [0, 1, 2, 3].filter(i => i < n && i % 2 === k);
    let hands = ''; for (let i = 0; i < n; i++) hands += C(i % 2 ? 63 : 57, HY[i], 4.7, '#d39a66', 'stroke="#a8703c" stroke-width="0.8"');
    return `<svg class="kidsvg figsvg" viewBox="0 4 120 63" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
      + `<ellipse cx="60" cy="66" rx="52" ry="2.4" fill="rgba(0,0,0,.12)"/>`
      + sitter(own(0), mk(A), false) + sitter(own(1), mk(B), true)
      + `<ellipse cx="61.5" cy="56" rx="3.1" ry="6.6" fill="${B.shoe}" stroke="#d9a400" stroke-width="1" opacity="0"/>`
      + hands + `</svg>`;
  };
})();
