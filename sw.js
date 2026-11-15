const C='sajad-pharmacy-v11';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','firebase-config.js','vendor/firebase-app-compat.js','vendor/firebase-auth-compat.js','vendor/firebase-firestore-compat.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// App files only: network first so updates arrive when online, cache when offline.
// Calls to the shared database (other websites) are left alone.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'));
  // network first, but give up after 3 seconds so a weak connection never leaves the app loading forever
  const net=fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r});
  const slow=new Promise((res,rej)=>setTimeout(()=>fromCache().then(r=>r?res(r):rej()),3000));
  e.respondWith(Promise.race([net.catch(()=>fromCache().then(r=>r||Promise.reject())),slow]).catch(()=>net));
});
