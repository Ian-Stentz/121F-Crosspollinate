const cacheName = "Crosspollinate-v1";

const appShellFiles = [
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
    "/assets/player.png",
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
    "/src/main.js",
    "/Crosspollinate.webmanifest",
    "/index.html"
]

self.addEventListener("install", (e) => {
    e.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(cacheName);
                await cache.addAll(appShellFiles);
            }
            catch {
                console.log("error occured while caching...");
            }
        })(),
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            cache.put(e.request, response.clone());
            return response;
        })(),
    );
});