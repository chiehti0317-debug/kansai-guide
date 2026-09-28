/* Only the public shell and encrypted data are cached. Never plaintext or external URLs. */
'use strict';
const CACHE='kansai-gh-20260928-v1';
const FILES=['index.html','app.js','guide.enc.json','manifest.webmanifest','icon-512.png'];
const urls=FILES.map(x=>new URL(x,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(urls.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{for(const name of await caches.keys()){if(name.startsWith('kansai-gh-')&&name!==CACHE)await caches.delete(name);}await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{try{const r=await fetch(req);if(r.ok)return r;}catch(_){}const cache=await caches.open(CACHE);return await cache.match(new URL('index.html',self.registration.scope).href)||new Response('尚未完成離線準備，請連網開啟。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});})());return;
 }
 if(!urls.includes(u.href))return;
 event.respondWith((async()=>{try{const r=await fetch(req);if(r.ok)return r;}catch(_){}const cache=await caches.open(CACHE);return await cache.match(req)||new Response('Offline file missing',{status:503});})());
});
