self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("spotify-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js"
      ]);
    })
  );
});
