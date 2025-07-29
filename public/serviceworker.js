const CACHE_NAME = "fuoye-archive-cache-v1"
const urlsToCache = ["/", "/index.html"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
})
self.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault()
  event.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }
  })
})
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  )
})
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || "New notification",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/badge.png",
    data: data.data || {},
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", options)
  )
})
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification)
})