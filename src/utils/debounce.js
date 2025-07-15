// Sistema BIAPO - Debounce standalone
// Versão simplificada sem dependências externas

function debounce(func, wait, immediate = false) {
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

function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export para uso no sistema
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debounce, throttle };
} else if (typeof window !== 'undefined') {
  window.debounce = debounce;
  window.throttle = throttle;
}

// Export ES6
export { debounce, throttle };
export default { debounce, throttle };
