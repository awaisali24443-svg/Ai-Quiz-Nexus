
const CACHE_NAME = 'knowledge-tester-v2';
// This list now includes all the core files needed for the app to run offline.
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/dashboard.html',
    '/css/style.css',
    '/js/auth.js',
    '/js/login.js',
    '/js/signup.js',
    '/js/main.js',
    '/js/dashboard.js',
    '/js/supabase-client.js', // New Supabase client
    '/js/quiz_controller.js', // The new dynamically loaded module
    '/js/questions.js',
    '/js/3d/sceneManager.js',
    '/js/3d/biology.js',
    '/js/3d/history_geography.js',
    '/js/3d/islamic_knowledge.js',
    '/js/3d/mathematics_logic.js',
    '/js/3d/programming.js',
    '/js/3d/science_inventions.js',
    '/js/3d/space_astronomy.js',
    '/js/3d/technology_ai.js',
    '/js/3d/world_knowledge.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap'
];

// Fired when the service worker is first installed.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                // Add all the app shell URLs to the cache.
                return cache.addAll(APP_SHELL_URLS);
            })
    );
});

// Fired when the service worker is activated.
self.addEventListener('activate', event => {
    // Clean up old caches.
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fired for every network request.
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Strategy: Stale-While-Revalidate for fallback questions.
    // This serves the cached version first for speed, then updates the cache in the background.
    if (requestUrl.pathname === '/js/questions.js') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Return cached response if available, otherwise wait for the network.
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Strategy: Network First for API calls.
    // Always try the network first to get the latest data. Fallback is handled by app logic.
    if (requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ message: 'You are offline. AI is not available.' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 503
                });
            })
        );
        return;
    }
    
    // Strategy: Cache First for all other requests (the app shell).
    // If it's in the cache, serve it, otherwise fetch from the network.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});