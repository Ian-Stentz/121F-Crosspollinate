const cacheName = "Crosspollinate-v0.07";

const appShellFiles = [
    "./",
    "./index.html",
    "./src/main.js",
    "./lib/phaser.js",
    "./Crosspollinate.webmanifest",
    "./assets/localization.json",
    "./src/DSL/ExternalConditions.json",
    "./src/Helper_Files/board.js",
    "./src/Helper_Files/funcLibrary.js",
    "./src/Helper_Files/plantType.js",
    "./src/Helper_Files/weather.js",
    "./src/Scenes/Farm.js",
    "./src/Scenes/Load.js",
    "./src/Scenes/Menu.js",
    "./src/Scenes/LanguageSelectionScene.js",
    "./src/Sprites/Crop.js",
    "./src/Sprites/Player.js",
    "./assets/plantA-0.png",
    "./assets/plantA-1.png",
    "./assets/plantA-2.png",
    "./assets/plantA-3.png",
    "./assets/plantB-0.png",
    "./assets/plantB-1.png",
    "./assets/plantB-2.png",
    "./assets/plantB-3.png",
    "./assets/plantC-0.png",
    "./assets/plantC-1.png",
    "./assets/plantC-2.png",
    "./assets/player.png"
]

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(caches.open(cacheName).then(async (cache) => {
        try {
            console.log("[Service Worker] Caching all: app shell and content");
            await cache.addAll(appShellFiles);
        } catch (err) {
            console.error('sw: cache.addAll');
            for(let asf of appShellFiles) {
                try {
                    await cache.add(asf);
                } catch (err) {
                    console.warn('sw: cache.add', asf);
                }
            }
        }
    }))
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
            caches.open(cacheName).then(function (cache) {
                if (!/^https?:$/i.test(new URL(e.request.url).protocol)) return;
                console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
                cache.put(e.request, response.clone());
            })
            return response;
        })(),
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key === cacheName) {
              return;
            }
            return caches.delete(key);
          }),
        );
      }),
    );
  });