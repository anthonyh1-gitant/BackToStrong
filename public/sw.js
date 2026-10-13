/* Production only. Cache the static shell; no workout or personal data is cached here. */
const ROOT = new URL('./', self.location.href).pathname
const CACHE_PREFIX = `back-to-strong-shell-${ROOT}-`
const CACHE = `${CACHE_PREFIX}v2`
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll([ROOT, `${ROOT}manifest.webmanifest`, `${ROOT}icon.svg`])
    const html = await (await cache.match(ROOT)).text()
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map(match => new URL(match[1], self.location.href))
      .filter(url => url.origin === self.location.origin && url.pathname.startsWith(`${ROOT}assets/`))
      .map(url => url.href)
    await cache.addAll(assets)
    await self.skipWaiting()
  })())
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if ((key.startsWith(CACHE_PREFIX) && key !== CACHE) || (ROOT === '/' && key === 'back-to-strong-shell-v1')) await caches.delete(key)
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      try {
        const response = await fetch(event.request)
        if (!response.ok) throw new Error('Unavailable')
        await cache.put(ROOT, response.clone())
        return response
      } catch {
        return (await cache.match(ROOT)) || Response.error()
      }
    })())
  } else if (url.pathname.startsWith(`${ROOT}assets/`) || [`${ROOT}icon.svg`, `${ROOT}manifest.webmanifest`].includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      // These are public static files. Vite's Vary: Origin header must not make
      // an identical same-origin module miss its precached copy when offline.
      const cached = await cache.match(event.request, { ignoreVary: true })
      if (cached) return cached
      const response = await fetch(event.request)
      if (response.ok) await cache.put(event.request, response.clone())
      return response
    })())
  }
})
