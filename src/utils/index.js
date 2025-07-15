export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function memoize(fn, getKey = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function(...args) {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

export function retry(fn, maxAttempts = 3, delay = 1000) {
  return async function(...args) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        await sleep(delay * attempt);
      }
    }
    
    throw lastError;
  };
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

export function generateId(prefix = '', length = 8) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, length);
  return `${prefix}${timestamp}_${random}`;
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

export function isEqual(a, b) {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  
  if (a.prototype !== b.prototype) return false;
  
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }
  
  return keys.every(k => isEqual(a[k], b[k]));
}

export function parseDate(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export function formatDate(date, format = 'dd/mm/yyyy') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('dd', day)
    .replace('mm', month)
    .replace('yyyy', year)
    .replace('hh', hours)
    .replace('MM', minutes);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function unescapeHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
}

export function sortBy(array, key, direction = 'asc') {
  return array.slice().sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique(array, key) {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function pick(object, keys) {
  const result = {};
  keys.forEach(key => {
    if (key in object) {
      result[key] = object[key];
    }
  });
  return result;
}

export function omit(object, keys) {
  const result = { ...object };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

export function camelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function createEventBus() {
  const events = {};
  
  return {
    on(event, callback) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
    },
    
    off(event, callback) {
      if (!events[event]) return;
      events[event] = events[event].filter(cb => cb !== callback);
    },
    
    emit(event, data) {
      if (!events[event]) return;
      events[event].forEach(callback => callback(data));
    },
    
    once(event, callback) {
      const onceCallback = (data) => {
        callback(data);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
    }
  };
}

export function createCache(maxSize = 100, ttl = 300000) {
  const cache = new Map();
  const timestamps = new Map();
  
  const cleanup = () => {
    const now = Date.now();
    for (const [key, timestamp] of timestamps) {
      if (now - timestamp > ttl) {
        cache.delete(key);
        timestamps.delete(key);
      }
    }
  };
  
  return {
    get(key) {
      cleanup();
      if (cache.has(key)) {
        const timestamp = timestamps.get(key);
        if (Date.now() - timestamp <= ttl) {
          return cache.get(key);
        } else {
          cache.delete(key);
          timestamps.delete(key);
        }
      }
      return undefined;
    },
    
    set(key, value) {
      cleanup();
      
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        timestamps.delete(firstKey);
      }
      
      cache.set(key, value);
      timestamps.set(key, Date.now());
    },
    
    has(key) {
      return this.get(key) !== undefined;
    },
    
    delete(key) {
      cache.delete(key);
      timestamps.delete(key);
    },
    
    clear() {
      cache.clear();
      timestamps.clear();
    },
    
    size() {
      cleanup();
      return cache.size;
    }
  };
}

if (typeof window !== 'undefined') {
  window.Utils = {
    debounce,
    throttle,
    memoize,
    retry,
    sleep,
    formatBytes,
    formatDuration,
    generateId,
    deepClone,
    isEqual,
    parseDate,
    formatDate,
    validateEmail,
    normalizeText,
    escapeHtml,
    unescapeHtml,
    chunk,
    groupBy,
    sortBy,
    unique,
    isEmpty,
    pick,
    omit,
    camelCase,
    kebabCase,
    createEventBus,
    createCache
  };
}

export default {
  debounce,
  throttle,
  memoize,
  retry,
  sleep,
  formatBytes,
  formatDuration,
  generateId,
  deepClone,
  isEqual,
  parseDate,
  formatDate,
  validateEmail,
  normalizeText,
  escapeHtml,
  unescapeHtml,
  chunk,
  groupBy,
  sortBy,
  unique,
  isEmpty,
  pick,
  omit,
  camelCase,
  kebabCase,
  createEventBus,
  createCache
};
