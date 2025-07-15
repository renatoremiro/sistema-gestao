// 🚀 Service Worker Otimizado para GitHub Pages
// Versão simplificada sem erros 404

const CACHE_NAME = 'biapo-v8.12.1-final';

// ✅ Cache dinâmico - sem lista pré-definida de arquivos
self.addEventListener('install', event => {
  console.log('🚀 Service Worker instalado - Sem cache pré-definido');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(
    // Limpar caches antigos
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('biapo-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      console.log('🧹 Caches antigos removidos');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Apenas interceptar requisições GET do mesmo domínio
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    // Estratégia: Network First com Cache Fallback
    fetch(request)
      .then(response => {
        // Se sucesso, salvar no cache e retornar
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tentar cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se não há cache, retornar página offline
          if (request.headers.get('accept').includes('text/html')) {
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
                  <div class="icon">🏗️</div>
                  <h1>Sistema BIAPO</h1>
                  <h2>Modo Offline</h2>
                  <p>Você está offline. Algumas funcionalidades podem estar limitadas.</p>
                  <button onclick="window.location.reload()">🔄 Tentar Reconectar</button>
                </div>
              </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          
          // Para outros tipos de arquivo
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Message handler
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎉 Service Worker carregado - Versão GitHub Pages otimizada');