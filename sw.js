'use strict';
/* FunZone offline helper: keeps a copy of the app on the phone or tablet so it also works without internet.
   Change VERSION whenever you publish new files, so everyone gets the new copy. */
const VERSION = 'funzone-2026-11-28g';
const APP = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png', 'icons/apple-touch-icon.png', 'voice/tl/index.json', 'core.js', 'lang.js', 'figures.js', 'field.js', 'games-a.js', 'games-b.js', 'games-c.js', 'tutorial.js', 'books.js', 'gameinfo.js', 'app.js', 'reader.js', 'story-voices.js', 'studio.js', 'voice/tl/lines.json', 'coloring-data.js', 'coloring.js'];
/* the recorded Tagalog voice is saved too, so it also works without internet from the start */
const VOICES = c => fetch('voice/tl/index.json').then(r => r.ok ? r.json() : []).then(l => c.addAll((l || []).map(k => `voice/tl/${k}.mp3`))).catch(() => { });
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP).then(() => VOICES(c))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* App files (page, scripts, styles): always the NEWEST copy when there is internet, the saved copy when there is none.
   This way a phone never mixes old and new files after an update.
   Pictures, books and voice files: the saved copy first (they never change), saved the first time they are opened. */
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const isApp = req.mode === 'navigate' || /\.(html|js|css|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  e.respondWith(caches.open(VERSION).then(async c => {
    if (isApp) {
      try { const r = await fetch(req, { cache: 'no-cache' }); if (r.ok) c.put(req, r.clone()); return r; }
      catch (err) { return (await c.match(req, { ignoreSearch: true })) || (await c.match('index.html')) || Response.error(); }
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
  }));
});
