// Vendor Bundle - Bibliotecas Externas Otimizadas

// Firebase (scripts externos já incluídos via CDN)
// Verificação de disponibilidade
function checkFirebaseAvailability() {
  return new Promise((resolve) => {
    if (typeof firebase !== 'undefined') {
      resolve(true);
    } else {
      // Aguardar carregamento
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkInterval = setInterval(() => {
        attempts++;
        if (typeof firebase !== 'undefined') {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    }
  });
}

// Lodash mínimo (apenas debounce)
const lodashDebounce = function(func, wait, options) {
  let lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime;

  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  wait = +wait || 0;
  if (options) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc, wait) {
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id) {
    clearTimeout(id);
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
};

// IndexedDB Promise wrapper mínimo
const idbWrapper = {
  async openDB(name, version, upgradeCallback) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        if (upgradeCallback) {
          upgradeCallback(event.target.result, event);
        }
      };
    });
  },

  async get(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async set(db, storeName, value) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async delete(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
};

// Polyfills essenciais
function addPolyfills() {
  // Promise.allSettled polyfill
  if (!Promise.allSettled) {
    Promise.allSettled = function(promises) {
      return Promise.all(promises.map(promise => 
        Promise.resolve(promise).then(
          value => ({ status: 'fulfilled', value }),
          reason => ({ status: 'rejected', reason })
        )
      ));
    };
  }

  // Array.prototype.flat polyfill
  if (!Array.prototype.flat) {
    Array.prototype.flat = function(depth = 1) {
      const flatten = (arr, d) => {
        return d > 0 ? arr.reduce((acc, val) => 
          acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), []) : arr.slice();
      };
      return flatten(this, depth);
    };
  }

  // Object.fromEntries polyfill
  if (!Object.fromEntries) {
    Object.fromEntries = function(iterable) {
      return [...iterable].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    };
  }

  // String.prototype.replaceAll polyfill
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(searchValue, replaceValue) {
      return this.split(searchValue).join(replaceValue);
    };
  }
}

// Utilitários de compatibilidade
const compatUtils = {
  supportsES6: () => {
    try {
      new Function('(a = 0) => a');
      return true;
    } catch (e) {
      return false;
    }
  },

  supportsModules: () => {
    const script = document.createElement('script');
    return 'noModule' in script;
  },

  supportsServiceWorker: () => {
    return 'serviceWorker' in navigator;
  },

  supportsIndexedDB: () => {
    return 'indexedDB' in window;
  },

  supportsLocalStorage: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  supportsPushNotifications: () => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }
};

// CSS Variables fallback
function setupCSSVariablesFallback() {
  if (!window.CSS || !window.CSS.supports || !window.CSS.supports('color', 'var(--primary)')) {
    const style = document.createElement('style');
    style.textContent = `
      /* Fallback para variáveis CSS */
      .btn-primary { background: #C53030 !important; }
      .notification-item.success { border-left-color: #10b981 !important; }
      .notification-item.error { border-left-color: #ef4444 !important; }
      .notification-item.warning { border-left-color: #f59e0b !important; }
      .notification-item.info { border-left-color: #3b82f6 !important; }
    `;
    document.head.appendChild(style);
  }
}

// Inicialização do vendor bundle
async function initVendorBundle() {
  console.log('📦 Inicializando Vendor Bundle...');
  
  // Adicionar polyfills
  addPolyfills();
  
  // Setup CSS Variables fallback
  setupCSSVariablesFallback();
  
  // Verificar Firebase
  const firebaseAvailable = await checkFirebaseAvailability();
  
  // Expor bibliotecas globalmente
  if (typeof window !== 'undefined') {
    window.vendorLibs = {
      debounce: lodashDebounce,
      idb: idbWrapper,
      compat: compatUtils,
      firebase: {
        available: firebaseAvailable,
        check: checkFirebaseAvailability
      }
    };
    
    // Lodash compatibility
    if (typeof window._ === 'undefined') {
      window._ = {
        debounce: lodashDebounce
      };
    }
    
    // IDB compatibility
    if (!window.idb) {
      window.idb = idbWrapper;
    }
  }
  
  console.log('✅ Vendor Bundle inicializado');
  
  // Relatório de compatibilidade
  const report = {
    es6: compatUtils.supportsES6(),
    modules: compatUtils.supportsModules(),
    serviceWorker: compatUtils.supportsServiceWorker(),
    indexedDB: compatUtils.supportsIndexedDB(),
    localStorage: compatUtils.supportsLocalStorage(),
    pushNotifications: compatUtils.supportsPushNotifications(),
    firebase: firebaseAvailable
  };
  
  console.log('🔍 Relatório de Compatibilidade:', report);
  
  return report;
}

// Auto-inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVendorBundle);
} else {
  initVendorBundle();
}

// Exports para module bundler
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce: lodashDebounce,
    idb: idbWrapper,
    compat: compatUtils,
    init: initVendorBundle
  };
}

console.log('📦 Vendor Bundle v8.12.1-optimized carregado');
