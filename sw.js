// 앱처럼 설치·오프라인용: 한 번 열어 본 화면과 자료를 휴대폰에 저장해 두고,
// 인터넷이 되면 항상 최신 내용을 먼저 받아 와요.
const CACHE = "madang-v1";
const SHELL = ["./", "./index.html", "./data.json", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin){
    e.respondWith(fetch(req).then(r => { if (r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : undefined))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});
