/**
 * Debounce Utility - Versão Otimizada
 * Sistema BIAPO v8.12.1-optimized
 */

/**
 * Cria uma função debounced que atrasa a execução até que 
 * um tempo especificado tenha passado desde a última invocação
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let result;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return immediate ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0));
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timeout = undefined;

    if (lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  let lastArgs, lastThis;

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = function() {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = undefined;
  };

  debounced.flush = function() {
    return timeout === undefined ? result : trailingEdge(Date.now());
  };

  debounced.pending = function() {
    return timeout !== undefined;
  };

  return debounced;
}

/**
 * Throttle - executa no máximo uma vez por período
 */
export function throttle(func, wait, options = {}) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  
  const later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function(...newArgs) {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    
    const remaining = wait - (now - previous);
    context = this;
    args = newArgs;
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    
    return result;
  };
}

/**
 * Memoize - cache resultados de função
 */
export function memoize(func, resolver) {
  if (typeof func !== 'function' || (resolver != null && typeof resolver !== 'function')) {
    throw new TypeError('Expected a function');
  }
  
  const memoized = function(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  
  memoized.cache = new (memoize.Cache || Map);
  return memoized;
}

memoize.Cache = Map;

/**
 * Cancelable Promise para operações assíncronas
 */
export function makeCancelable(promise) {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
      error => hasCanceled ? reject({ isCanceled: true }) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}

/**
 * RequestIdleCallback wrapper com fallback
 */
export function scheduleWork(callback, options = {}) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, {
      timeout: options.timeout || 1000,
      ...options
    });
  } else {
    // Fallback para navegadores sem suporte
    return setTimeout(callback, 16);
  }
}

/**
 * Batch processor - processa itens em lotes
 */
export function createBatchProcessor(processor, batchSize = 50, delay = 16) {
  let queue = [];
  let isProcessing = false;

  const processBatch = () => {
    if (queue.length === 0) {
      isProcessing = false;
      return;
    }

    const batch = queue.splice(0, batchSize);
    processor(batch);

    scheduleWork(processBatch);
  };

  return {
    add(item) {
      queue.push(item);
      
      if (!isProcessing) {
        isProcessing = true;
        scheduleWork(processBatch);
      }
    },

    addMany(items) {
      queue.push(...items);
      
      if (!isProcessing) {
        isProcessing = true;
        scheduleWork(processBatch);
      }
    },

    clear() {
      queue = [];
    },

    get queueSize() {
      return queue.length;
    }
  };
}

// Exports para compatibilidade
export default {
  debounce,
  throttle,
  memoize,
  makeCancelable,
  scheduleWork,
  createBatchProcessor
};

// Global exposure
if (typeof window !== 'undefined') {
  window.debounce = debounce;
  window.throttle = throttle;
}
