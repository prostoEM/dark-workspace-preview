/* Generated with a content-based revision. Personal API responses are never cached. */
const CACHE = 'dw-shell-1e774e2176c4d40d';
const APP_BASE = "/dark-workspace-preview/";
const PRECACHE = ["/dark-workspace-preview/","/dark-workspace-preview/manifest.webmanifest","/dark-workspace-preview/Methodologies-DMWq8Nnr.js","/dark-workspace-preview/Methodologies-EHoLE3kZ.css","/dark-workspace-preview/Roadmap-OavpYggQ.js","/dark-workspace-preview/firestore-api-DlQN02Lb.js","/dark-workspace-preview/glass-renderer-CQNzZasN.js","/dark-workspace-preview/index-C6c4GCOM.js","/dark-workspace-preview/index-STqmfZzF.css","/dark-workspace-preview/planning-DtN5IvXH.js","/dark-workspace-preview/apple-touch-icon.png","/dark-workspace-preview/icon-192.png","/dark-workspace-preview/icon-512.png","/dark-workspace-preview/icon-maskable-512.png","/dark-workspace-preview/icon.svg"];
const KNOWN = new Set(PRECACHE);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    for (const name of await caches.keys()) if(name.startsWith('dw-shell-') && name!==CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if(event.data?.type==='ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const req=event.request, url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/health') return;
  if(req.mode==='navigate') {
    event.respondWith(fetch(req).catch(async()=>{
      const cached=await caches.match(APP_BASE);
      return cached||new Response('Нет подключения. Откройте приложение при доступной сети.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }));
    return;
  }
  if(KNOWN.has(url.pathname)) event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
