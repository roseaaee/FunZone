'use strict';
/* =====================================================
   GAMES D – new categories: Bugtong, Riddles, Reading Area, Coloring
   Hulaan Mo! (Bugtong) · Riddle Time (Riddles) · Basa-Basa (Reading Area) · Kulay-Numero (Coloring)
   Every game has 3 levels. Level 1 is the easiest and each win opens the next level.
   ===================================================== */

const L2 = (en, tl) => (FZ.lang === 'tl' ? tl : en);   // pick a line by the current language
const T2 = o => (FZ.lang === 'tl' ? o.tl : o.en);        // pick a {en, tl} field by the current language

/* ---------- the things that answers and riddles point to: picture, Tagalog name, English name ---------- */
const POOL = [
  { k: 'buwan', e: '🌙', tl: 'buwan', en: 'moon' }, { k: 'araw', e: '☀️', tl: 'araw', en: 'sun' },
  { k: 'tubig', e: '💧', tl: 'tubig', en: 'water' }, { k: 'baka', e: '🐄', tl: 'baka', en: 'cow' },
  { k: 'pato', e: '🦆', tl: 'pato', en: 'duck' }, { k: 'isda', e: '🐟', tl: 'isda', en: 'fish' },
  { k: 'bote', e: '🍾', tl: 'bote', en: 'bottle' }, { k: 'kandila', e: '🕯️', tl: 'kandila', en: 'candle' },
  { k: 'karayom', e: '🪡', tl: 'karayom', en: 'needle' }, { k: 'aklat', e: '📖', tl: 'aklat', en: 'book' },
  { k: 'orasan', e: '🕐', tl: 'orasan', en: 'clock' }, { k: 'ulan', e: '🌧️', tl: 'ulan', en: 'rain' },
  { k: 'piano', e: '🎹', tl: 'piyano', en: 'piano' }, { k: 'ilog', e: '🏞️', tl: 'ilog', en: 'river' },
  { k: 'edad', e: '🎂', tl: 'edad', en: 'age' }, { k: 'hininga', e: '💨', tl: 'hininga', en: 'breath' },
  { k: 'telepono', e: '📞', tl: 'telepono', en: 'phone' }, { k: 'suklay', e: '🪮', tl: 'suklay', en: 'comb' },
  { k: 'yapak', e: '👣', tl: 'yapak', en: 'footprints' }, { k: 'lobo', e: '🎈', tl: 'lobo', en: 'balloon' }
];
const POOL_BY_KEY = k => POOL.find(p => p.k === k);

/* Bugtong: traditional-style riddles in Tagalog, with English translations (written for this app) */
const BUGTONG = [
  { a: 'buwan', tl: 'Bilog ang mukha, nagbibigay ng liwanag kapag gabi. Ano ako?', en: 'My face is round, and I light up the night. What am I?' },
  { a: 'araw', tl: 'Mainit ako at sumisikat tuwing umaga. Ano ako?', en: 'I am hot and I rise every morning. What am I?' },
  { a: 'tubig', tl: 'Dumadaloy ako at nagpapabasa ng kamay. Ano ako?', en: 'I flow and make your hands wet. What am I?' },
  { a: 'baka', tl: 'Apat ang paa ko, may sungay, at nagbibigay ng gatas. Ano ako?', en: 'I have four legs and horns, and I give milk. What am I?' },
  { a: 'pato', tl: 'Lumalangoy ako pero hindi ako isda, at may tuka ako. Ano ako?', en: 'I swim, but I am not a fish, and I have a beak. What am I?' },
  { a: 'bote', tl: 'May leeg ako pero walang ulo. Ano ako?', en: 'I have a neck but no head. What am I?' },
  { a: 'kandila', tl: 'Lumiliit ako habang nauubos. Ano ako?', en: 'I get shorter as I burn. What am I?' },
  { a: 'karayom', tl: 'May mata ako pero hindi nakakakita, at may sinulid na dumadaan sa akin. Ano ako?', en: 'I have an eye but cannot see, and thread goes through me. What am I?' },
  { a: 'aklat', tl: 'Maraming pahina pero hindi ako naglalakad. May kuwento sa loob ko. Ano ako?', en: 'I have many pages but I never walk. I hold stories inside. What am I?' },
  { a: 'orasan', tl: 'May kamay ako pero hindi nakakapalakpak. Ano ako?', en: 'I have hands but I cannot clap. What am I?' },
  { a: 'ulan', tl: 'Bumabagsak ako pero hindi nasasaktan. Ano ako?', en: 'I fall but never get hurt. What am I?' }
];

/* Riddle Time: English riddles with Tagalog translations */
const RIDDLES = [
  { a: 'piano', en: 'I have keys, but I cannot open any lock. What am I?', tl: 'May mga susi ako pero hindi ako nakabubukas ng kandado. Ano ako?' },
  { a: 'ilog', en: 'I have a bed, but I never sleep. What am I?', tl: 'May kama ako pero hindi ako natutulog. Ano ako?' },
  { a: 'aklat', en: 'I have words, but I never speak. What am I?', tl: 'May mga salita ako pero hindi ako nagsasalita. Ano ako?' },
  { a: 'orasan', en: 'I have a face and two hands, but no arms or legs. What am I?', tl: 'May mukha ako at dalawang kamay, pero walang braso o binti. Ano ako?' },
  { a: 'yapak', en: 'The more you take, the more you leave behind. What am I?', tl: 'Habang mas marami kang tinatahak, mas marami kang naiiwan. Ano ako?' },
  { a: 'edad', en: 'I go up, but I never come down. What am I?', tl: 'Tumataas ako pero hindi na bumababa. Ano ako?' },
  { a: 'karayom', en: 'I have one eye, but I cannot see. What am I?', tl: 'May isang mata ako pero hindi nakakakita. Ano ako?' },
  { a: 'hininga', en: 'I am light as a feather, yet the strongest person cannot hold me for long. What am I?', tl: 'Magaan ako na parang balahibo, pero hindi ako mahawakan nang matagal ng pinakamalakas na tao. Ano ako?' },
  { a: 'telepono', en: 'I have a ring, but I am not a bell. What am I?', tl: 'May singsing ako pero hindi ako kampana. Ano ako?' },
  { a: 'suklay', en: 'I have teeth, but I never bite. What am I?', tl: 'May mga ngipin ako pero hindi ako nangangagat. Ano ako?' },
  { a: 'ulan', en: 'I fall but never get hurt. What am I?', tl: 'Bumabagsak ako pero hindi nasasaktan. Ano ako?' }
];

/* Basa-Basa: words to read, with a picture for each */
const WORDS = [
  { e: '🐶', tl: 'aso', en: 'dog' }, { e: '🐱', tl: 'pusa', en: 'cat' }, { e: '🐟', tl: 'isda', en: 'fish' },
  { e: '☀️', tl: 'araw', en: 'sun' }, { e: '🌙', tl: 'buwan', en: 'moon' }, { e: '🏠', tl: 'bahay', en: 'house' },
  { e: '🍌', tl: 'saging', en: 'banana' }, { e: '💧', tl: 'tubig', en: 'water' }, { e: '🥚', tl: 'itlog', en: 'egg' },
  { e: '🚗', tl: 'kotse', en: 'car' }, { e: '⚽', tl: 'bola', en: 'ball' }, { e: '🩴', tl: 'tsinelas', en: 'slippers' },
  { e: '🐄', tl: 'baka', en: 'cow' }, { e: '🌈', tl: 'bahaghari', en: 'rainbow' }, { e: '🪁', tl: 'saranggola', en: 'kite' },
  { e: '🐸', tl: 'palaka', en: 'frog' }
];

/* ---------- builders: turn a bank into questions for the current level ---------- */
function buildRiddles(api, bank) {
  const n = FZ.lv(api.level, 3, 4, 5), k = FZ.lv(api.level, 2, 3, 4);   // riddles, choices per riddle
  return shuffle(bank).slice(0, n).map(r => {
    const ans = POOL_BY_KEY(r.a), decoys = shuffle(POOL.filter(p => p.k !== r.a)).slice(0, k - 1);
    return { tl: r.tl, en: r.en, say: () => T2(r), opts: shuffle([ans, ...decoys]).map(p => ({ e: p.e, tl: p.tl, en: p.en, ok: p.k === r.a })) };
  });
}
function buildWords(api) {
  const n = FZ.lv(api.level, 4, 5, 6), k = FZ.lv(api.level, 2, 3, 4), maxLen = FZ.lv(api.level, 4, 6, 99);
  return shuffle(WORDS.filter(w => w.tl.length <= maxLen)).slice(0, n).map(w => ({
    art: w.e, tl: 'Ano ito? Hanapin ang tamang salita!', en: 'What is this? Find the right word!',
    say: () => T2(w),
    opts: shuffle([w, ...shuffle(WORDS.filter(x => x !== w)).slice(0, k - 1)]).map(x => ({ e: '', tl: x.tl, en: x.en, ok: x === w }))
  }));
}

/* ---------- quiz engine: one question at a time, taps or keys 1–9 to answer ---------- */
function quizGame(api, qs, win) {
  let i = 0, mistakes = 0, busy = false;
  const box = h('<div class="quiz"><div class="qprog"></div><div class="qart"></div><p class="qtext"></p><button type="button" class="round qsay" aria-label="🔊">🔊</button><div class="qopts"></div></div>');
  api.stage.append(box);
  const prog = $('.qprog', box), art = $('.qart', box), text = $('.qtext', box), opts = $('.qopts', box);
  $('.qsay', box).onclick = () => FZ.say(qs[i].say(), true);
  function draw() {
    const q = qs[i];
    prog.textContent = `${i + 1} / ${qs.length}`;
    art.textContent = q.art || ''; art.hidden = !q.art;
    text.textContent = T2(q);
    opts.innerHTML = '';
    q.opts.forEach((o, k) => {
      const b = h(`<button type="button" class="qopt"><span class="qe">${o.e}</span><span class="ql">${T2(o)}</span><kbd>${k + 1}</kbd></button>`);
      b.onclick = () => choose(b, o);
      opts.append(b);
    });
    api.msg(T2(q), true);
  }
  function choose(b, o) {
    if (busy) return;
    if (o.ok) {
      busy = true; b.classList.add('ok'); api.sfx('good'); api.msg(L2('Correct! 🎉', 'Tama! 🎉'), true);
      api.later(() => { i++; if (i >= qs.length) api.finish(mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, T2(win)); else { busy = false; draw(); } }, 900);
    } else {
      mistakes++; b.classList.add('no'); api.sfx('oops'); api.msg(L2('Not that one. Try again!', 'Hindi iyan. Subukan muli!'), true);
      api.later(() => b.classList.remove('no'), 500);
    }
  }
  api.on(window, 'keydown', e => { const n = +e.key; if (n >= 1 && n <= 9) { const b = opts.children[n - 1]; if (b) b.click(); } });
  draw();
}

/* ---------- coloring engine: pick a number, then paint the squares with that number ---------- */
function colorGame(api, pic, palette, names) {
  const C = pic[0].length;
  let sel = 1, mistakes = 0, total = 0, left = 0;
  pic.forEach(row => row.forEach(v => { if (v) total++; }));
  left = total;
  const pal = h('<div class="cpal"></div>');
  palette.forEach((col, i) => {
    const b = h(`<button type="button" class="cswatch" style="--sw:${col}" aria-label="${names[i]}"><span>${i + 1}</span></button>`);
    b.onclick = () => choose(i + 1);
    pal.append(b);
  });
  const grid = h(`<div class="cgrid" style="--n:${C}"></div>`);
  pic.forEach(row => row.forEach(v => {
    const d = h(`<button type="button" class="csq" data-v="${v}">${v}</button>`);
    d.onclick = () => paint(d, v);
    grid.append(d);
  }));
  const prog = h(`<div class="cprog">0 / ${total}</div>`);
  api.stage.append(pal); api.stage.append(grid); api.stage.append(prog);
  function choose(n) {
    sel = n;
    $$('.cswatch', pal).forEach((b, i) => b.classList.toggle('on', i + 1 === n));
    api.sfx('pop');
    api.msg(L2(`Color ${n} selected. Tap the ${n}s to paint them!`, `Napili ang kulay ${n}. Pindutin ang mga ${n} para kulayan!`), true);
  }
  function paint(d, v) {
    if (d.classList.contains('done')) return;
    if (v !== sel) {
      mistakes++; api.sfx('oops'); d.classList.add('wiggle'); setTimeout(() => d.classList.remove('wiggle'), 400);
      api.msg(L2(`That is number ${v}. Pick color ${v} first!`, `Numero ${v} iyan. Piliin muna ang kulay ${v}!`));
      return;
    }
    d.classList.add('done'); d.style.background = palette[v - 1]; d.textContent = ''; left--; api.sfx('pop');
    prog.textContent = `${total - left} / ${total}`;
    if (left === 0) api.finish(mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1, L2('Picture finished! Great coloring!', 'Tapos na ang larawan! Ang galing!'));
  }
  api.on(window, 'keydown', e => { const n = +e.key; if (n >= 1 && n <= palette.length) choose(n); });
  choose(1);
}

/* ---------- the coloring pictures (number = color index, starting at 1) ---------- */
const SUN_PIC = [
  [4, 2, 4, 4, 2, 4],
  [2, 4, 1, 1, 4, 2],
  [4, 1, 1, 1, 1, 4],
  [4, 1, 1, 1, 1, 4],
  [2, 4, 1, 1, 4, 2],
  [3, 3, 3, 3, 3, 3]
];
const SUN_PAL = { colors: ['#ffd43b', '#ff922b', '#51cf66', '#74c0fc'], names: ['Yellow', 'Orange', 'Green', 'Blue'] };

function flowerPic() {
  const g = [];
  for (let r = 0; r < 8; r++) {
    const row = [];
    for (let c = 0; c < 8; c++) {
      const petal = [[1, 3.5], [5, 3.5], [3, 1.5], [3, 5.5]].some(([pr, pc]) => Math.hypot(c - pc, r - pr) <= 1.3);
      let v = 4;                                                          // blue sky
      if (Math.hypot(c - 3.5, r - 3) <= 1.1) v = 3;                      // yellow center
      else if (petal) v = 1;                                             // pink petals
      else if ((c === 3 || c === 4) && r >= 5) v = 2;                    // green stem
      else if (r === 6 && (c === 2 || c === 5)) v = 2;                   // green leaves
      row.push(v);
    }
    g.push(row);
  }
  return g;
}
const FLOWER_PAL = { colors: ['#ff8fab', '#51cf66', '#ffd43b', '#74c0fc'], names: ['Pink', 'Green', 'Yellow', 'Blue'] };

function housePic() {
  const g = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 10; c++) {
      let v = 3;                                                           // sky
      if (Math.hypot(c - 8.5, r - 1.5) <= 1.6) v = 1;                     // sun
      else if (r >= 7) v = (r === 8 && (c === 1 || c === 3 || c === 6 || c === 8)) ? 8 : 2;   // grass and flowers
      else if ((r === 2 && c >= 2 && c <= 7) || (r === 3 && c >= 3 && c <= 6)) v = 4;          // roof
      else if (r >= 4 && r <= 6 && c >= 2 && c <= 7) {                     // walls, door and windows
        if ((r === 4 && (c === 3 || c === 6)) ) v = 7;
        else if (c === 4 && (r === 5 || r === 6)) v = 6;
        else v = 5;
      }
      row.push(v);
    }
    g.push(row);
  }
  return g;
}
const HOUSE_PAL = { colors: ['#ffd43b', '#51cf66', '#a5d8ff', '#e03131', '#ffe8cc', '#8b5a2b', '#74c0fc', '#f783ac'], names: ['Yellow', 'Green', 'Sky', 'Red', 'Cream', 'Brown', 'Light blue', 'Pink'] };

/* ---------- the four games ---------- */
FZ.reg({
  id: 'hulaan', cat: 'bugtong', name: 'Hulaan Mo!', emoji: '🧩', color: '#f59f0b',
  tag: { en: 'Guess the bugtong riddle, then tap the right picture!', tl: 'Hulaan ang bugtong, saka pindutin ang tamang larawan!' },
  players: { en: '1 or more kids', tl: '1 o higit pang bata' },
  props: { en: 'Your voice and your guessing', tl: 'Boses at hula' },
  real: {
    en: ['A bugtong is a short riddle that Filipino families have told children for generations.', 'A grown-up says the riddle slowly, and the children guess the answer out loud.', 'Everyone cheers when someone is right, and the riddle-teller tries to lead them on with clues.'],
    tl: ['Ang bugtong ay maikling palaisipan na ikinukuwento sa mga bata ng mga pamilyang Pilipino sa maraming henerasyon.', 'Dahan-dahang binibigkas ng nakatatanda ang bugtong, at sumisigaw ng hula ang mga bata.', 'Nagpapalakpakan ang lahat kapag tama ang hula, at inaakay ng nagbigay ng bugtong ang mga bata gamit ang mga palatandaan.']
  },
  how: {
    en: ['Listen to the riddle, or tap 🔊 to hear it.', 'Tap the picture that matches the answer. A wrong guess is fine, just try again!', 'Level 1 has 2 pictures to choose from, level 2 has 3, and level 3 has 4. Answer every riddle to unlock the next level.'],
    tl: ['Makinig sa bugtong, o pindutin ang 🔊 para mapakinggan ito.', 'Pindutin ang larawang tumutugma sa sagot. Okay lang ang maling hula, subukan muli!', 'May 2 larawan sa antas 1, 3 sa antas 2, at 4 sa antas 3. Sagutin ang lahat ng bugtong para mabuksan ang susunod na antas.']
  },
  tip: { en: 'Read the riddle aloud and ask your child what clues they heard. Then have them make up one about something at home!', tl: 'Basahin nang malakas ang bugtong at itanong kung anong palatandaan ang narinig nila. Saka sila gumawa ng sariling bugtong tungkol sa bagay sa bahay!' },
  start(api) {
    quizGame(api, buildRiddles(api, BUGTONG), { en: 'You guessed every bugtong!', tl: 'Nahulaan mo ang lahat ng bugtong!' });
  }
});

FZ.reg({
  id: 'riddle', cat: 'riddles', name: 'Riddle Time', emoji: '💡', color: '#7048e8',
  tag: { en: 'English riddles that make you think!', tl: 'Mga English na palaisipan na nagpapaisip!' },
  players: { en: '1 or more kids', tl: '1 o higit pang bata' },
  props: { en: 'Nothing but your thinking cap', tl: 'Wala, isip lang ang kailangan' },
  real: {
    en: ['A riddle is a puzzle with a hidden answer. Many are told at school, at camp and at bedtime.', 'Kids take turns telling riddles, and the others guess. Some riddles play with words, so the answer is not what it first seems.', 'The fun is in thinking carefully about each clue.'],
    tl: ['Ang palaisipan ay bugtong na may nakatagong sagot. Marami ang ikinukuwento sa paaralan, sa kampo at bago matulog.', 'Nagpapalitan ng pagbibigay ng palaisipan ang mga bata, at hinuhulaan ng iba. Ang ibang palaisipan ay may laro sa salita, kaya hindi ito ang inaakala mo sa unang tingin.', 'Ang saya ay nasa maingat na pag-iisip sa bawat palatandaan.']
  },
  how: {
    en: ['Read the riddle and think about each clue. Tap 🔊 to hear it.', 'Tap the picture that answers the riddle. You can also press 1, 2, 3 or 4 on the keyboard!', 'Level 1 has 3 riddles with 2 choices. Level 3 has 5 riddles with 4 choices. Answer them all to win!'],
    tl: ['Basahin ang palaisipan at isipin ang bawat palatandaan. Pindutin ang 🔊 para mapakinggan.', 'Pindutin ang larawang sagot. Puwede ring pindutin ang 1, 2, 3 o 4 sa keyboard!', 'Antas 1: 3 palaisipan at 2 pagpipilian. Antas 3: 5 palaisipan at 4 na pagpipilian. Sagutin lahat para manalo!']
  },
  tip: { en: 'Let your child tell a riddle to you. Guessing their riddle is a fun way to practice listening and thinking.', tl: 'Ipagawa sa bata na magbigay ng palaisipan sa iyo. Ang paghula sa palaisipan nila ay masayang paraan para magsanay makinig at mag-isip.' },
  start(api) {
    quizGame(api, buildRiddles(api, RIDDLES), { en: 'You solved every riddle!', tl: 'Nasagot mo ang lahat ng palaisipan!' });
  }
});

FZ.reg({
  id: 'basa', cat: 'reading', name: 'Basa-Basa', emoji: '📖', color: '#2f9e44',
  tag: { en: 'Read the word and find the matching picture word!', tl: 'Basahin ang salita at hanapin ang tamang salita para sa larawan!' },
  players: { en: '1 kid (a grown-up can read along)', tl: '1 bata (puwedeng samahan ng nakatatanda)' },
  props: { en: 'Picture cards and words written on paper', tl: 'Mga flashcard na may larawan at salita' },
  real: {
    en: ['Reading starts with matching a word to a thing you can see, like a dog or a ball.', 'Write a word on a card and show it next to the real thing or a picture of it.', 'Read it together slowly, sounding out each part (a-so, pu-sa).', 'Practice with words from your home, your street and your school.'],
    tl: ['Nagsisimula ang pagbasa sa pagtutugma ng salita sa nakikitang bagay, gaya ng aso o bola.', 'Sumulat ng salita sa card at ipakita ito sa tabi ng tunay na bagay o larawan nito.', 'Basahin ito nang dahan-dahan, binibigkas ang bawat pantig (a-so, pu-sa).', 'Magsanay sa mga salitang nasa bahay, kalye at paaralan.']
  },
  how: {
    en: ['Look at the big picture, then read the words under it.', 'Tap the word that matches the picture. Tap 🔊 to hear the word read aloud.', 'Level 1 has short words and 2 choices. Level 3 has longer words and 4 choices. Finish every round to unlock the next level.'],
    tl: ['Tingnan ang malaking larawan, saka basahin ang mga salita sa ibaba.', 'Pindutin ang salitang tumutugma sa larawan. Pindutin ang 🔊 para marinig ang salita.', 'Antas 1: maiikling salita at 2 pagpipilian. Antas 3: mas mahahabang salita at 4 na pagpipilian. Tapusin ang lahat ng round para mabuksan ang susunod na antas.']
  },
  tip: { en: 'Sound out each part together, then say the whole word. Praise every try, even the wrong ones!', tl: 'Bigkasin nang sabay ang bawat pantig, saka ang buong salita. Purihin ang bawat pagsubok, pati ang mali!' },
  start(api) {
    quizGame(api, buildWords(api), { en: 'You read every word!', tl: 'Nabasa mo ang lahat ng salita!' });
  }
});

FZ.reg({
  id: 'kulay', cat: 'coloring', name: 'Kulay-Numero', emoji: '🎨', color: '#e64980',
  tag: { en: 'Paint each number with its color, like a picture by numbers!', tl: 'Kulayan ang bawat numero ayon sa kulay nito!' },
  players: { en: '1 kid', tl: '1 bata' },
  props: { en: 'Crayons or pencils, and a paper picture with numbers', tl: 'Krayola o lapis, at papel na may numero' },
  real: {
    en: ['A coloring page has small numbers in the spaces. Each number means one color.', 'Find the crayon for number 1 first, color all the 1s, then pick the next crayon.', 'Staying inside the lines makes the picture neat.', 'When every space is colored, the hidden picture appears!'],
    tl: ['May maliliit na numero ang bawat espasyo sa pahinang kukulayan. Ang bawat numero ay may isang kulay.', 'Unahin ang krayola para sa numero 1, kulayan lahat ng 1, saka kunin ang susunod na krayola.', 'Ang pagkulay sa loob ng linya ay nagpapaganda ng larawan.', 'Kapag nakulayan na ang lahat ng espasyo, lumalabas ang nakatagong larawan!']
  },
  how: {
    en: ['Pick a color number at the bottom, then tap the squares with that number.', 'A wrong square wiggles. Pick the right number first!', 'Level 1 is a 6×6 sun, level 2 is an 8×8 flower and level 3 is a 10×10 house. Fill them all to finish!'],
    tl: ['Pumili ng numero ng kulay sa ibaba, saka pindutin ang mga kahon na may numerong iyon.', 'Gumagalaw ang maling kahon. Piliin muna ang tamang numero!', 'Antas 1: 6×6 na araw, antas 2: 8×8 na bulaklak, antas 3: 10×10 na bahay. Punuan lahat para matapos!']
  },
  tip: { en: 'Use real crayons on a printed grid for an offline version. Let your child choose the colors to make the picture their own!', tl: 'Gumamit ng totoong krayola sa naimprentang grid para sa offline na bersyon. Hayaang pumili ng kulay ang bata para maging sarili nilang likha!' },
  start(api) {
    const [pic, pal] = FZ.lv(api.level, [SUN_PIC, SUN_PAL], [flowerPic(), FLOWER_PAL], [housePic(), HOUSE_PAL]);
    colorGame(api, pic, pal.colors, pal.names);
  }
});

/* how each new game works in real life vs. on screen (shown on the intro screen) */
Object.assign(FZ.DIGI, {
  hulaan: { en: 'You tap a picture instead of saying the answer out loud. In real life a grown-up says the bugtong and the kids guess together, with cheering and laughter.', tl: 'Pumipindot ka ng larawan sa halip na sabihin nang malakas ang sagot. Sa totoong buhay, binibigkas ng nakatatanda ang bugtong at sabay-sabay na hinuhulaan ng mga bata nang may hiyawan at tawanan.' },
  riddle: { en: 'The answer is a tap on the screen. In real life you say the answer out loud and can ask the riddle-teller for clues.', tl: 'Pindot sa screen ang sagot. Sa totoong buhay, sinasabi mo nang malakas ang sagot at puwede kang humingi ng palatandaan sa nagbigay ng palaisipan.' },
  basa: { en: 'Words are shown as big letters to match a picture. In real life you read on paper, signs and books, and you can touch and trace the letters.', tl: 'Ang mga salita ay malalaking letra na itutugma sa larawan. Sa totoong buhay, binabasa mo sa papel, karatula at libro, at puwede mong hawakan at subaybayan ang mga letra.' },
  kulay: { en: 'Numbers are painted with taps on a screen. In real life you hold a real crayon or pencil, and colors can be mixed and shaded.', tl: 'Pinipintahan ng pindot sa screen ang mga numero. Sa totoong buhay, hawak mo ang tunay na krayola o lapis, at puwedeng paghalu-haluin at lagyan ng lilim ang mga kulay.' }
});
