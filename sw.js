const CACHE='said-v26';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Firebase: always live, never cached
  if(u.hostname.includes('firebase')||u.hostname.includes('googleapis'))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));}return res;}).catch(()=>caches.match('./index.html')));
    return;
  }
  // other files (icons, scripts, images): cache first, then network
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{
    if(res&&(res.status===200||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));}
    return res;}).catch(()=>h)));
});
// ===== التنبيهات (Web Push): تصل والتطبيق مغلق =====
self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{};}catch(x){d={body:e.data?e.data.text():''};}
  const title=d.title||'قسم الأستاذ سعيد';
  e.waitUntil(self.registration.showNotification(title,{body:d.body||'',icon:'./icon-192.png',badge:'./icon-192.png',dir:'rtl',lang:'ar',tag:d.tag||'said',renotify:true,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const u=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if('focus' in c)return c.focus();}
    return self.clients.openWindow(u);
  }));
});
