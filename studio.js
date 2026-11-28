'use strict';
/* =====================================================
   TAGALOG VOICE STUDIO (Parent Mode)
   A grown-up reads every Tagalog line of FunZone out loud, one after another:
   tap Record, read the line, tap Next — each line is saved as its own little recording.
   The app plays these recordings right away on this phone or tablet (instead of the robot voice).
   "Save all recordings" makes one .zip file to send, so the voice can be added to FunZone for everyone.
   Recordings stay on this device (IndexedDB) until you save and send them.
   ===================================================== */
(() => {
  const ST = { lines: [], i: 0, mr: null, stream: null, chunks: [], live: false, have: new Set(), card: null, audio: null };
  const LK = k => 'tl|' + k;                                     // where a line's recording is kept
  FZ.localVoice = new Set();                                     // keys of lines recorded on this device

  async function loadLines() {
    if (ST.lines.length) return ST.lines;
    try { const r = await fetch('voice/tl/lines.json'); ST.lines = r.ok ? await r.json() : []; } catch (e) { ST.lines = []; }
    return ST.lines;
  }
  async function refreshHave() {
    const keys = await FZ.rec.keys();
    ST.have = new Set(keys.filter(k => String(k).startsWith('tl|')).map(k => String(k).slice(3)));
    FZ.localVoice = ST.have;
  }
  refreshHave();

  /* the app's voice: a line recorded on this device plays before anything else */
  const sayBefore = FZ.say;
  let localAudio = null;
  FZ.say = (t, force) => {
    if (FZ.settings.voice || force) {
      const k = FZ.voiceKey(t);
      if (FZ.localVoice.has(k)) {
        try { speechSynthesis.cancel(); } catch (e) { }
        if (localAudio) { localAudio.pause(); localAudio = null; }
        FZ.rec.get(LK(k)).then(b => { if (!b) return sayBefore(t, force); const u = URL.createObjectURL(b); localAudio = new Audio(u); localAudio.onended = () => URL.revokeObjectURL(u); localAudio.play().catch(() => { }); });
        return;
      }
    }
    sayBefore(t, force);
  };

  /* ---------- the card in Parent Mode > Settings ---------- */
  FZ.renderStudioCard = async card => {
    if (!card) return; ST.card = card;
    const lines = await loadLines(); await refreshHave();
    const done = lines.filter(l => ST.have.has(l.key)).length, stories = (await FZ.rec.keys()).filter(k => !String(k).startsWith('tl|') && !String(k).endsWith('|t')).length;
    const canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    card.innerHTML = `<h3>🎙️ ${FZ.t('stu_title')}</h3>
      <p class="muted">${FZ.t('stu_note')}</p>
      <div class="stubar"><span style="width:${lines.length ? done / lines.length * 100 : 0}%"></span></div>
      <p><b>${done} / ${lines.length}</b> ${FZ.t('stu_count')}</p>
      ${canRec ? '' : `<p class="muted warn">${FZ.t('rec_nomic')}</p>`}
      <div class="row stubtns">
        <button class="btn" id="stuGo" ${canRec && lines.length ? '' : 'disabled'}>🎙️ ${FZ.t(done ? 'stu_continue' : 'stu_start')}</button>
        <button class="btn alt" id="stuZip" ${done || stories ? '' : 'disabled'}>📦 ${FZ.t('stu_zip')}</button>
      </div>
      <p class="muted">${FZ.t('stu_tips')}</p>`;
    $('#stuGo', card).onclick = () => openStudio(Math.max(0, lines.findIndex(l => !ST.have.has(l.key))));
    $('#stuZip', card).onclick = saveZip;
  };

  /* ---------- the studio window ---------- */
  function view() {
    const L = ST.lines[ST.i], m = $('#modal'), has = ST.have.has(L.key), n = ST.lines.length;
    m.innerHTML = `<div class="mcard studio" role="dialog" aria-label="${FZ.t('stu_title')}">
      <div class="stuhead"><b>${L.section}</b><span>${L.n} / ${n}</span><button class="round" id="stuX" aria-label="${FZ.t('rec_done')}">✕</button></div>
      <div class="stubar"><span style="width:${(ST.i + 1) / n * 100}%"></span></div>
      <div class="stuline ${ST.live ? 'live' : ''}">${L.show || L.text}</div>
      ${L.note ? `<div class="stunote">🗣️ ${L.note}</div>` : ''}
      <div class="stustate" id="stuState">${ST.live ? '🔴 ' + FZ.t('stu_live') : has ? '✅ ' + FZ.t('stu_saved') : FZ.t('stu_ready')}</div>
      <div class="stubig">
        ${ST.live ? `<button class="btn big" id="stuNext">✔ ${FZ.t('stu_next')}</button>` : `<button class="btn big rec" id="stuRec">⏺ ${FZ.t(has ? 'rec_again' : 'rec_start')}</button>`}
      </div>
      <div class="recnav">
        <button class="round" id="stuPrev" aria-label="${FZ.t('rec_prev')}" ${ST.i > 0 ? '' : 'disabled'}>◀</button>
        ${ST.live ? `<button class="btn small" id="stuRedo">↺ ${FZ.t('stu_redo')}</button><button class="btn small" id="stuPause">⏸ ${FZ.t('stu_pause')}</button>`
        : `<button class="btn small" id="stuPlay" ${has ? '' : 'disabled'}>▶ ${FZ.t('rec_play')}</button>`}
        <button class="round" id="stuSkip" aria-label="${FZ.t('rec_next')}" ${ST.i < n - 1 ? '' : 'disabled'}>▶</button>
      </div>
      <p class="muted stukeys">${FZ.t('stu_keys')}</p></div>`;
    m.classList.remove('hidden');
    const on = (id, f) => { const b = $('#' + id); if (b) b.onclick = f; };
    on('stuRec', () => startLine());
    on('stuNext', () => stopLine(true, true));
    on('stuRedo', () => { ST.redo = true; stopLine(false, false).then(() => startLine()); });
    on('stuPause', () => stopLine(true, false));
    on('stuPlay', play);
    on('stuPrev', () => go(ST.i - 1));
    on('stuSkip', () => go(ST.i + 1));
    on('stuX', closeStudio);
  }
  async function openStudio(i) {
    await loadLines(); await refreshHave();
    ST.i = clamp(i, 0, ST.lines.length - 1); FZ.studioOpen = true; view();
  }
  async function go(i) {
    if (ST.live) await stopLine(true, false);
    ST.i = clamp(i, 0, ST.lines.length - 1); view();
  }
  async function closeStudio() {
    if (ST.live) await stopLine(true, false);
    if (ST.stream) { ST.stream.getTracks().forEach(t => t.stop()); ST.stream = null; }
    FZ.studioOpen = false; $('#modal').classList.add('hidden');
    FZ.renderStudioCard(ST.card);
  }
  async function startLine() {
    try {
      if (!ST.stream) ST.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) { const s = $('#stuState'); if (s) s.textContent = FZ.t('rec_denied'); return; }
    try { speechSynthesis.cancel(); } catch (e) { }
    ST.chunks = []; ST.mr = new MediaRecorder(ST.stream);
    ST.mr.ondataavailable = e => { if (e.data && e.data.size) ST.chunks.push(e.data); };
    ST.mr.start(); ST.live = true; view();
  }
  /* stop this line; keep = save it; thenNext = go on to the next line and start recording it straight away */
  function stopLine(keep, thenNext) {
    return new Promise(res => {
      const mr = ST.mr; if (!mr || mr.state === 'inactive') { ST.live = false; return res(); }
      mr.onstop = async () => {
        const L = ST.lines[ST.i];
        if (keep && ST.chunks.length) { await FZ.rec.set(LK(L.key), new Blob(ST.chunks, { type: mr.mimeType || 'audio/webm' })); ST.have.add(L.key); FZ.localVoice = ST.have; }
        ST.live = false; ST.mr = null;
        if (thenNext && ST.i < ST.lines.length - 1) { ST.i++; await startLine(); } else view();
        res();
      };
      mr.stop();
    });
  }
  async function play() {
    const b = await FZ.rec.get(LK(ST.lines[ST.i].key)); if (!b) return;
    if (ST.audio) ST.audio.pause();
    const u = URL.createObjectURL(b); ST.audio = new Audio(u); ST.audio.onended = () => URL.revokeObjectURL(u); ST.audio.play().catch(() => { });
  }
  /* keyboard: Space or Enter = next, R = redo, P = pause */
  document.addEventListener('keydown', e => {
    if (!FZ.studioOpen || e.target.closest('input, textarea, select')) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (ST.live) stopLine(true, true); else startLine(); }
    else if (e.key === 'r' && ST.live) { stopLine(false, false).then(() => startLine()); }
    else if (e.key === 'p' && ST.live) stopLine(true, false);
  });

  /* ---------- save everything as one .zip (no compression needed: the sound files are already small) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {                                         // files: [{ name, data: Uint8Array }]
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    files.forEach(f => {
      const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true);
      parts.push(new Uint8Array(lh.buffer), name, f.data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
      central.push(new Uint8Array(ch.buffer), name);
      off += 30 + name.length + size;
    });
    const csize = central.reduce((n, p) => n + p.length, 0), end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  }
  const ext = b => /mp4|m4a|aac/.test(b.type) ? 'm4a' : /ogg/.test(b.type) ? 'ogg' : 'webm';
  async function saveZip() {
    const btn = $('#stuZip'); if (btn) { btn.disabled = true; btn.textContent = '⏳ ' + FZ.t('stu_zipping'); }
    const files = [], list = [], keys = await FZ.rec.keys(), enc = new TextEncoder(), lines = await loadLines();
    const byKey = Object.fromEntries(lines.map(l => [l.key, l]));
    for (const k of keys) {
      const ks = String(k), v = await FZ.rec.get(k); if (!v) continue;
      if (ks.endsWith('|t')) { files.push({ name: 'stories/' + ks.slice(0, -2).replace(/\|/g, '_') + '.json', data: enc.encode(JSON.stringify(v)) }); continue; }
      const data = new Uint8Array(await v.arrayBuffer());
      if (ks.startsWith('tl|')) { const key = ks.slice(3); files.push({ name: `tl/${key}.${ext(v)}`, data }); list.push({ key, n: byKey[key] && byKey[key].n, text: byKey[key] ? byKey[key].text : '' }); }
      else files.push({ name: 'stories/' + ks.replace(/\|/g, '_') + '.' + ext(v), data });
    }
    files.push({ name: 'tl/lines.json', data: enc.encode(JSON.stringify(list.sort((a, b) => (a.n || 0) - (b.n || 0)), null, 1)) });
    const blob = zip(files), a = document.createElement('a'), d = new Date();
    a.href = URL.createObjectURL(blob); a.download = `FunZone-voice-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.zip`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    if (btn) { btn.disabled = false; btn.textContent = '📦 ' + FZ.t('stu_zip'); }
  }
  FZ.studio = { open: openStudio, saveZip };
})();
