const C='golden-v42',F=['./','index.html','home.html','student.html','home-core.js','fb-config.js','diagnose.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.allSettled(F.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('golden-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(/(^|\.)gstatic\.com$|^fonts\.googleapis\.com$/.test(u.hostname)){e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);return m||f})));return}
if(!r.url.startsWith(self.registration.scope))return;
e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}return res}).catch(()=>caches.open(C).then(c=>c.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?c.match('index.html'):undefined)||Response.error()))))});
