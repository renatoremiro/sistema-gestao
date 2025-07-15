export class PerformanceMonitor {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      enabled: true,
      autoReport: true,
      reportInterval: 30000,
      maxMetricsHistory: 100,
      thresholds: {
        slowOperation: 1000,
        memoryWarning: 50 * 1024 * 1024,
        fpsWarning: 30
      }
    };

    this.metrics = {
      operations: new Map(),
      memory: [],
      fps: [],
      loadTimes: new Map(),
      errors: [],
      networkRequests: [],
      cacheStats: new Map(),
      userInteractions: []
    };

    this.observers = {
      performance: null,
      memory: null,
      fps: null
    };

    this.startTime = performance.now();
    this.isMonitoring = false;
  }

  init() {
    if (!this.config.enabled) return;

    this._setupPerformanceObserver();
    this._setupMemoryMonitoring();
    this._setupFPSMonitoring();
    this._setupNetworkMonitoring();
    this._setupErrorTracking();
    this._setupUserInteractionTracking();

    if (this.config.autoReport) {
      this._startAutoReporting();
    }

    this.isMonitoring = true;
    console.log('📊 Performance Monitor iniciado');
  }

  _setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver não suportado');
      return;
    }

    this.observers.performance = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        this._processPerformanceEntry(entry);
      });
    });

    try {
      this.observers.performance.observe({ 
        entryTypes: ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint']
      });
    } catch (error) {
      console.warn('Erro ao configurar PerformanceObserver:', error);
    }
  }

  _processPerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'measure':
        this._recordOperation(entry.name, entry.duration);
        break;
      
      case 'navigation':
        this._recordLoadTime('navigation', entry.duration);
        break;
      
      case 'resource':
        this._recordNetworkRequest(entry);
        break;
      
      case 'paint':
      case 'largest-contentful-paint':
        this._recordPaintMetric(entry);
        break;
    }
  }

  _recordOperation(name, duration) {
    if (!this.metrics.operations.has(name)) {
      this.metrics.operations.set(name, []);
    }

    const operations = this.metrics.operations.get(name);
    operations.push({
      duration,
      timestamp: Date.now()
    });

    if (operations.length > this.config.maxMetricsHistory) {
      operations.shift();
    }

    if (duration > this.config.thresholds.slowOperation) {
      this._logSlowOperation(name, duration);
    }
  }

  _recordLoadTime(type, duration) {
    if (!this.metrics.loadTimes.has(type)) {
      this.metrics.loadTimes.set(type, []);
    }

    const loadTimes = this.metrics.loadTimes.get(type);
    loadTimes.push({
      duration,
      timestamp: Date.now()
    });

    if (loadTimes.length > this.config.maxMetricsHistory) {
      loadTimes.shift();
    }
  }

  _recordNetworkRequest(entry) {
    this.metrics.networkRequests.push({
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      responseStart: entry.responseStart,
      responseEnd: entry.responseEnd,
      timestamp: Date.now()
    });

    if (this.metrics.networkRequests.length > this.config.maxMetricsHistory) {
      this.metrics.networkRequests.shift();
    }
  }

  _recordPaintMetric(entry) {
    console.log(`🎨 Paint Metric: ${entry.name} - ${entry.startTime.toFixed(2)}ms`);
  }

  _setupMemoryMonitoring() {
    if (!('memory' in performance)) {
      console.warn('Memory API não suportada');
      return;
    }

    const monitorMemory = () => {
      const memInfo = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      this.metrics.memory.push(memInfo);

      if (this.metrics.memory.length > this.config.maxMetricsHistory) {
        this.metrics.memory.shift();
      }

      if (memInfo.used > this.config.thresholds.memoryWarning) {
        this._logMemoryWarning(memInfo);
      }
    };

    monitorMemory();
    setInterval(monitorMemory, 5000);
  }

  _setupFPSMonitoring() {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        this.metrics.fps.push({
          fps,
          timestamp: Date.now()
        });

        if (this.metrics.fps.length > this.config.maxMetricsHistory) {
          this.metrics.fps.shift();
        }

        if (fps < this.config.thresholds.fpsWarning) {
          this._logFPSWarning(fps);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  _setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this._recordFetchMetric(args[0], endTime - startTime, response.status, 'success');
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        this._recordFetchMetric(args[0], endTime - startTime, 0, 'error');
        throw error;
      }
    };
  }

  _recordFetchMetric(url, duration, status, result) {
    this.metrics.networkRequests.push({
      url: typeof url === 'string' ? url : url.url,
      duration,
      status,
      result,
      timestamp: Date.now()
    });
  }

  _setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this._recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this._recordError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });
  }

  _recordError(errorInfo) {
    this.metrics.errors.push(errorInfo);

    if (this.metrics.errors.length > this.config.maxMetricsHistory) {
      this.metrics.errors.shift();
    }

    console.error('🐛 Erro capturado pelo Performance Monitor:', errorInfo);
  }

  _setupUserInteractionTracking() {
    ['click', 'keydown', 'scroll', 'resize'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this._recordUserInteraction(eventType);
      }, { passive: true });
    });
  }

  _recordUserInteraction(type) {
    this.metrics.userInteractions.push({
      type,
      timestamp: Date.now()
    });

    if (this.metrics.userInteractions.length > this.config.maxMetricsHistory) {
      this.metrics.userInteractions.shift();
    }
  }

  _startAutoReporting() {
    setInterval(() => {
      this._generateReport();
    }, this.config.reportInterval);
  }

  _logSlowOperation(name, duration) {
    console.warn(`⚠️ Operação lenta detectada: ${name} - ${duration.toFixed(2)}ms`);
  }

  _logMemoryWarning(memInfo) {
    const usedMB = (memInfo.used / (1024 * 1024)).toFixed(2);
    console.warn(`⚠️ Alto uso de memória: ${usedMB}MB`);
  }

  _logFPSWarning(fps) {
    console.warn(`⚠️ FPS baixo detectado: ${fps} fps`);
  }

  measure(name, operation) {
    const startTime = performance.now();
    
    try {
      const result = operation();
      
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now();
          this._recordOperation(name, endTime - startTime);
        });
      } else {
        const endTime = performance.now();
        this._recordOperation(name, endTime - startTime);
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      this._recordOperation(name, endTime - startTime);
      throw error;
    }
  }

  async measureAsync(name, asyncOperation) {
    const startTime = performance.now();
    
    try {
      const result = await asyncOperation();
      const endTime = performance.now();
      this._recordOperation(name, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this._recordOperation(name, endTime - startTime);
      throw error;
    }
  }

  recordCacheMetric(cacheName, operation, hit) {
    if (!this.metrics.cacheStats.has(cacheName)) {
      this.metrics.cacheStats.set(cacheName, {
        hits: 0,
        misses: 0,
        operations: []
      });
    }

    const stats = this.metrics.cacheStats.get(cacheName);
    
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }

    stats.operations.push({
      operation,
      hit,
      timestamp: Date.now()
    });

    if (stats.operations.length > this.config.maxMetricsHistory) {
      stats.operations.shift();
    }
  }

  _calculateAverages() {
    const averages = {};

    this.metrics.operations.forEach((operations, name) => {
      if (operations.length > 0) {
        const total = operations.reduce((sum, op) => sum + op.duration, 0);
        averages[name] = {
          avg: total / operations.length,
          min: Math.min(...operations.map(op => op.duration)),
          max: Math.max(...operations.map(op => op.duration)),
          count: operations.length
        };
      }
    });

    return averages;
  }

  _calculateMemoryStats() {
    if (this.metrics.memory.length === 0) return null;

    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    const peak = Math.max(...this.metrics.memory.map(m => m.used));
    
    return {
      current: latest.used,
      peak,
      limit: latest.limit,
      utilization: (latest.used / latest.limit * 100).toFixed(2)
    };
  }

  _calculateFPSStats() {
    if (this.metrics.fps.length === 0) return null;

    const fpsValues = this.metrics.fps.map(f => f.fps);
    
    return {
      current: fpsValues[fpsValues.length - 1],
      avg: fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length,
      min: Math.min(...fpsValues),
      max: Math.max(...fpsValues)
    };
  }

  _generateReport() {
    const report = {
      timestamp: Date.now(),
      uptime: performance.now() - this.startTime,
      operations: this._calculateAverages(),
      memory: this._calculateMemoryStats(),
      fps: this._calculateFPSStats(),
      errors: this.metrics.errors.length,
      networkRequests: this.metrics.networkRequests.length,
      cacheStats: Object.fromEntries(
        Array.from(this.metrics.cacheStats.entries()).map(([name, stats]) => [
          name,
          {
            hitRate: stats.hits + stats.misses > 0 ? 
              (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) : 0,
            totalOperations: stats.hits + stats.misses
          }
        ])
      )
    };

    console.log('📊 Performance Report:', report);
    
    this._dispatchReportEvent(report);
    
    return report;
  }

  _dispatchReportEvent(report) {
    window.dispatchEvent(new CustomEvent('performance-report', {
      detail: report
    }));
  }

  getMetrics() {
    return {
      operations: Object.fromEntries(this.metrics.operations),
      memory: this.metrics.memory.slice(-10),
      fps: this.metrics.fps.slice(-10),
      errors: this.metrics.errors.slice(-10),
      networkRequests: this.metrics.networkRequests.slice(-10),
      cacheStats: Object.fromEntries(this.metrics.cacheStats)
    };
  }

  getReport() {
    return this._generateReport();
  }

  clear() {
    this.metrics.operations.clear();
    this.metrics.memory = [];
    this.metrics.fps = [];
    this.metrics.errors = [];
    this.metrics.networkRequests = [];
    this.metrics.cacheStats.clear();
    this.metrics.userInteractions = [];
    
    console.log('📊 Métricas de performance limpas');
  }

  stop() {
    this.isMonitoring = false;
    
    if (this.observers.performance) {
      this.observers.performance.disconnect();
    }
    
    console.log('📊 Performance Monitor parado');
  }
}

const performanceMonitor = new PerformanceMonitor();

if (typeof window !== 'undefined') {
  performanceMonitor.init();
  window.PerformanceMonitor = performanceMonitor;
  
  window.measurePerformance = (name, operation) => 
    performanceMonitor.measure(name, operation);
    
  window.getPerformanceReport = () => 
    performanceMonitor.getReport();
}

export default PerformanceMonitor;
