const cacheName = "Crosspollinate-v1";

const appShellFiles = [
    "/",
    "/index.html",
    "/src/main.js",
    "/lib/phaser.js",
    "/src/DSL/ExternalConditions.json",
    "/src/Helper_files/board.js",
    "/src/Helper_files/funcLibrary.js",
    "/src/Helper_files/plantType.js",
    "/src/Helper_files/weather.js",
    "/src/Scenes/Farm.js",
    "/src/Scenes/Load.js",
    "/src/Scenes/Menu.js",
    "/src/Sprites/Crop.js",
    "/src/Sprites/Player.js",
    "/Crosspollinate.webmanifest",
    "/assets/plantA-0.png",
    "/assets/plantA-1.png",
    "/assets/plantA-2.png",
    "/assets/plantA-3.png",
    "/assets/plantB-0.png",
    "/assets/plantB-1.png",
    "/assets/plantB-2.png",
    "/assets/plantB-3.png",
    "/assets/plantC-0.png",
    "/assets/plantC-1.png",
    "/assets/plantC-2.png",
    "/assets/player.png"
]

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(caches.open(cacheName).then((cache => {
        console.log("[Service Worker] Caching all: app shell and content");
        cache.addAll(appShellFiles);
    })))
});


self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            console.log(`[Service Worker] Fetched resource ${e.request.url}`);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
        })(),
    );
});