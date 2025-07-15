const CACHE_NAME = 'biapo-system-v8.12.1-optimized';
const STATIC_CACHE = 'biapo-static-v8.12.1';
const DYNAMIC_CACHE = 'biapo-dynamic-v8.12.1';

// ✅ CORRIGIDO: Apenas arquivos que realmente existem
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dist/app.b743e0d3.min.js',
  '/dist/vendor.364a4aa9.min.js',
  '/dist/app.0a8075b5.min.css'
];

const FIREBASE_URLS = [
  'https://www.gstatic.com/firebasejs/',
  'https://firebaseinstallations.googleapis.com/',
  'https://identitytoolkit.googleapis.com/'
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

const URL_STRATEGIES = {
  '/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/index.html': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/dist/': CACHE_STRATEGIES.CACHE_FIRST,
  'firebase': CACHE_STRATEGIES.NETWORK_FIRST,
  'api': CACHE_STRATEGIES.NETWORK_FIRST
};

self.addEventListener('install', event => {
  console.log('Service Worker: Installing v8.12.1-optimized');
  
  event.waitUntil(
    Promise.all([
      // ✅ Cache apenas com fallback de erro
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static files');
        return Promise.allSettled(
          STATIC_FILES.map(async url => {
            try {
              const response = await fetch(url, { cache: 'no-cache' });
              if (response.ok) {
                return cache.put(url, response);
              } else {
                console.warn(`Arquivo não encontrado para cache: ${url}`);
              }
            } catch (error) {
              console.warn(`Erro ao cachear: ${url}`, error);
            }
          })
        );
      }),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v8.12.1-optimized');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('biapo-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  
  if (url.origin !== location.origin && !isFirebaseRequest(request)) return;
  
  const strategy = getStrategyForRequest(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

function getStrategyForRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  for (const [pattern, strategy] of Object.entries(URL_STRATEGIES)) {
    if (pathname.includes(pattern) || request.url.includes(pattern)) {
      return strategy;
    }
  }
  
  if (isFirebaseRequest(request)) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  if (pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.png') || pathname.endsWith('.jpg')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
    
    default:
      return networkFirst(request);
  }
}

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await updateCache(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await updateCache(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.warn('Network First fallback to cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse(request);
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      updateCache(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('Stale While Revalidate network error:', error);
  });
  
  return cachedResponse || networkPromise || createOfflineResponse(request);
}

async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || createOfflineResponse(request);
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return createOfflineResponse(request);
  }
}

async function updateCache(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put(request, response);
    await cleanupCache(cache);
  } catch (error) {
    console.warn('Erro ao atualizar cache:', error);
  }
}

async function cleanupCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > 100) {
      const oldestKey = keys[0];
      await cache.delete(oldestKey);
    }
  } catch (error) {
    console.warn('Erro ao limpar cache:', error);
  }
}

function isFirebaseRequest(request) {
  return FIREBASE_URLS.some(url => request.url.includes(url));
}

function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sistema BIAPO - Offline</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          h1 { color: #C53030; margin-bottom: 20px; }
          .icon { font-size: 48px; margin-bottom: 20px; }
          button {
            background: #C53030;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1>Sistema BIAPO</h1>
          <h2>Modo Offline</h2>
          <p>Você está offline. O sistema está funcionando com dados em cache.</p>
          <p>Algumas funcionalidades podem estar limitadas.</p>
          <button onclick="window.location.reload()">🔄 Tentar Reconectar</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  if (url.pathname.endsWith('.json')) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Dados não disponíveis offline',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Offline', { 
    status: 503,
    statusText: 'Service Unavailable'
  });
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_STATUS') {
    event.ports[0].postMessage({
      caches: {
        static: STATIC_CACHE,
        dynamic: DYNAMIC_CACHE
      }
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    console.log('Service Worker: Background sync triggered');
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'SYNC_DATA'
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

console.log('Service Worker: Loaded v8.12.1-optimized - Fixed 404 errors');