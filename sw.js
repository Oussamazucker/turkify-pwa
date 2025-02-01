const CACHE_NAME = "turkify-cache-v1";
const OFFLINE_PAGE = "https://turkifyy.blogspot.com/2025/01/test59.html";
const ASSETS_TO_CACHE = [
    "/",
    OFFLINE_PAGE,
    "https://turkifyy.blogspot.com/2025/01/test59.html",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgt-kMZ7aJXyctrVtUyomjDP_LZxTc0Xd2EP-pthpW80y6TW1SiwyOiJfA-ae0xxhlcRdTyGHaE_nrT6b5TOzek-zx39-fqjXqLLNn8mm8-aWXdalya7xlEJ2EQZ7kam7zntIr3eRDKoAY7Y3qRpe6lazr5vSkNAR59CUgxzU8cvzHOX24lCGNSMyINP6E/s192/logo-192%C3%97192.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgIi5EvZy5tdpJGdNj2wve_6RJrv0rQWtwIeITvq-9NmO08KteLhV8gJFIZhZ18dKiRuu80CmQYQN6R1pu9YC8DU1pw6jeXxWrh2DdjzEFg0Ug5MkIiwRg6z7xpY5P6MDkm8uibtTnnV2cw9zFH_vpACFcbyNbXOcka_4N_rp1DwQvF3Z2UufP2cbtiKpM/s512/logo-512x512.png"
];

// 🔹 تثبيت الـ Service Worker وتخزين الموارد الأساسية
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// 🔹 تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 🔹 جلب الموارد من الكاش أو الشبكة مع دعم الأوفلاين
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => caches.match(OFFLINE_PAGE))
    );
});

// 🔹 تخزين البيانات في IndexedDB عند فقدان الاتصال
async function saveToIndexedDB(storeName, data) {
    const db = await openDB("BazaarTeechDB", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" });
            }
        }
    });
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    data.forEach(item => store.put(item));
    await tx.done;
}

// 🔹 تحميل البيانات المخزنة عند استعادة الاتصال
async function loadFromIndexedDB(storeName) {
    const db = await openDB("BazaarTeechDB", 1);
    const tx = db.transaction(storeName, "readonly");
    return tx.objectStore(storeName).getAll();
}

// 🔹 مزامنة البيانات عند استعادة الاتصال
self.addEventListener("sync", event => {
    if (event.tag === "sync-data") {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    const data = await loadFromIndexedDB("offline-requests");
    await fetch("/sync-endpoint", { method: "POST", body: JSON.stringify(data) });
    console.log("تمت مزامنة البيانات بنجاح.");
}

// 🔹 إرسال إشعار ترحيبي عند زيارة الموقع لأول مرة
if ("Notification" in window && navigator.serviceWorker) {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            navigator.serviceWorker.ready.then(registration => {
                sendWelcomeNotification(registration);
            });
        }
    });
}

function sendWelcomeNotification(registration) {
    registration.showNotification("🎉 مرحبًا بك في BazaarTeech!", {
        body: "🔥 جديدنا متاح الآن! لا تفوت العروض الحصرية.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        vibrate: [200, 100, 200],
        tag: "bazaarteech-welcome",
        actions: [
            { action: "explore", title: "🔍 تصفح الآن" },
            { action: "close", title: "❌ إغلاق" }
        ]
    });
}

// 🔹 التفاعل مع الإشعار عند النقر عليه
self.addEventListener("notificationclick", event => {
    event.notification.close();
    if (event.action === "explore") {
        clients.openWindow("https://bazaarteech.com");
    }
 
// 🔹 قياس مدة تنفيذ ميزة معينة
performance.mark("start-feature");

setTimeout(() => {
    performance.mark("end-feature");
    performance.measure("feature-duration", "start-feature", "end-feature");

    const duration = performance.getEntriesByName("feature-duration")[0].duration;
    console.log("⏱️ مدة تنفيذ الميزة:", duration.toFixed(2), "مللي ثانية");
}, 2000);
  });       

