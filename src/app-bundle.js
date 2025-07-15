import App from './app-optimized.js';
import './utils/debounce.js';
import './utils/performance-monitor.js';
import './modules/auth-optimized.js';
import './modules/events-optimized.js';
import './modules/calendar-optimized.js';
import './modules/notifications-optimized.js';

class SystemBundleOptimized {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.initPromises = new Map();
    this.performanceMetrics = {
      bundleLoadTime: 0,
      moduleLoadTimes: new Map(),
      totalModules: 0,
      failedModules: []
    };
  }

  async init() {
    const startTime = performance.now();
    
    try {
      performance.mark('bundle-init-start');
      
      await this.initCore();
      
      await this.initCriticalModules();
      
      this.setupLazyLoading();
      
      this.setupGlobalErrorHandling();
      
      performance.mark('bundle-init-end');
      performance.measure('bundle-init', 'bundle-init-start', 'bundle-init-end');
      
      const endTime = performance.now();
      this.performanceMetrics.bundleLoadTime = endTime - startTime;
      
      console.log(`🚀 Bundle Otimizado carregado em ${this.performanceMetrics.bundleLoadTime.toFixed(2)}ms`);
      
      this.dispatchReadyEvent();
      
    } catch (error) {
      console.error('❌ Erro na inicialização do bundle:', error);
      this.handleBundleError(error);
    }
  }

  async initCore() {
    try {
      performance.mark('core-init-start');
      
      await App.init();
      this.modules.set('App', App);
      this.loadedModules.add('App');
      
      performance.mark('core-init-end');
      performance.measure('core-init', 'core-init-start', 'core-init-end');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar núcleo:', error);
      throw error;
    }
  }

  async initCriticalModules() {
    const criticalModules = [
      { name: 'Auth', init: () => this.loadAuth() },
      { name: 'Notifications', init: () => this.loadNotifications() }
    ];
    
    const promises = criticalModules.map(async (module) => {
      try {
        performance.mark(`${module.name}-init-start`);
        
        await module.init();
        this.loadedModules.add(module.name);
        
        performance.mark(`${module.name}-init-end`);
        performance.measure(`${module.name}-init`, `${module.name}-init-start`, `${module.name}-init-end`);
        
      } catch (error) {
        console.error(`❌ Erro ao carregar ${module.name}:`, error);
        this.performanceMetrics.failedModules.push(module.name);
      }
    });
    
    await Promise.allSettled(promises);
  }

  setupLazyLoading() {
    const lazyModules = {
      Events: () => this.loadEvents(),
      Calendar: () => this.loadCalendar(),
      AdminUsersManager: () => this.loadAdminUsersManager()
    };
    
    Object.entries(lazyModules).forEach(([moduleName, loader]) => {
      Object.defineProperty(window, moduleName, {
        get: () => {
          if (!this.loadedModules.has(moduleName)) {
            this.loadModule(moduleName, loader);
          }
          return this.modules.get(moduleName);
        },
        configurable: true
      });
    });
  }

  async loadModule(name, loader) {
    if (this.initPromises.has(name)) {
      return this.initPromises.get(name);
    }
    
    const promise = this.performModuleLoad(name, loader);
    this.initPromises.set(name, promise);
    
    return promise;
  }

  async performModuleLoad(name, loader) {
    try {
      performance.mark(`${name}-load-start`);
      
      const module = await loader();
      
      this.modules.set(name, module);
      this.loadedModules.add(name);
      
      performance.mark(`${name}-load-end`);
      performance.measure(`${name}-load`, `${name}-load-start`, `${name}-load-end`);
      
      const measures = performance.getEntriesByName(`${name}-load`);
      if (measures.length > 0) {
        this.performanceMetrics.moduleLoadTimes.set(name, measures[0].duration);
      }
      
      console.log(`✅ ${name} carregado via lazy loading`);
      
      return module;
      
    } catch (error) {
      console.error(`❌ Erro ao carregar ${name}:`, error);
      this.performanceMetrics.failedModules.push(name);
      throw error;
    }
  }

  async loadAuth() {
    try {
      const { OptimizedAuth } = await import('./modules/auth-optimized.js');
      const authInstance = new OptimizedAuth();
      await authInstance.init();
      
      window.Auth = authInstance;
      this.modules.set('Auth', authInstance);
      
      return authInstance;
    } catch (error) {
      console.error('❌ Fallback: Auth básico');
      
      const basicAuth = {
        login: () => console.warn('Auth não disponível'),
        logout: () => console.warn('Auth não disponível'),
        estaLogado: () => false
      };
      
      window.Auth = basicAuth;
      this.modules.set('Auth', basicAuth);
      return basicAuth;
    }
  }

  async loadNotifications() {
    try {
      const { OptimizedNotifications } = await import('./modules/notifications-optimized.js');
      const notificationsInstance = new OptimizedNotifications();
      
      window.Notifications = notificationsInstance;
      this.modules.set('Notifications', notificationsInstance);
      
      return notificationsInstance;
    } catch (error) {
      console.error('❌ Fallback: Notifications básico');
      
      const basicNotifications = {
        success: (msg) => console.log('✅', msg),
        error: (msg) => console.error('❌', msg),
        warning: (msg) => console.warn('⚠️', msg),
        info: (msg) => console.info('ℹ️', msg)
      };
      
      window.Notifications = basicNotifications;
      this.modules.set('Notifications', basicNotifications);
      return basicNotifications;
    }
  }

  async loadEvents() {
    try {
      const { OptimizedEvents } = await import('./modules/events-optimized.js');
      const eventsInstance = new OptimizedEvents();
      
      window.Events = eventsInstance;
      this.modules.set('Events', eventsInstance);
      
      return eventsInstance;
    } catch (error) {
      console.error('❌ Events não disponível:', error);
      throw error;
    }
  }

  async loadCalendar() {
    try {
      const { OptimizedCalendar } = await import('./modules/calendar-optimized.js');
      const calendarInstance = new OptimizedCalendar();
      
      window.Calendar = calendarInstance;
      this.modules.set('Calendar', calendarInstance);
      
      return calendarInstance;
    } catch (error) {
      console.error('❌ Calendar não disponível:', error);
      throw error;
    }
  }

  async loadAdminUsersManager() {
    try {
      const { OptimizedAdminUsersManager } = await import('./modules/admin-users-manager-optimized.js');
      const adminInstance = new OptimizedAdminUsersManager();
      
      window.AdminUsersManager = adminInstance;
      this.modules.set('AdminUsersManager', adminInstance);
      
      return adminInstance;
    } catch (error) {
      console.error('❌ AdminUsersManager não disponível:', error);
      throw error;
    }
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('❌ Erro global capturado:', event.error);
      this.handleGlobalError(event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Promise rejeitada:', event.reason);
      this.handleGlobalError(event.reason);
    });
  }

  handleGlobalError(error) {
    if (this.modules.has('Notifications')) {
      const notifications = this.modules.get('Notifications');
      notifications.error('Erro interno do sistema');
    }
    
    this.reportError(error);
  }

  handleBundleError(error) {
    console.error('❌ Erro crítico no bundle:', error);
    
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #fee2e2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui;
        z-index: 999999;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        ">
          <h1 style="color: #dc2626; margin: 0 0 20px 0;">⚠️ Erro de Sistema</h1>
          <p style="color: #374151; margin-bottom: 20px;">
            Houve um problema ao carregar o Sistema BIAPO. 
            Tente recarregar a página.
          </p>
          <button onclick="window.location.reload()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          ">🔄 Recarregar Página</button>
        </div>
      </div>
    `;
  }

  reportError(error) {
    if (typeof error === 'object' && error !== null) {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        loadedModules: Array.from(this.loadedModules),
        failedModules: this.performanceMetrics.failedModules
      };
      
      console.error('🐛 Relatório de erro:', errorReport);
      
      localStorage.setItem('biapo_last_error', JSON.stringify(errorReport));
    }
  }

  dispatchReadyEvent() {
    const readyEvent = new CustomEvent('biapo-system-ready', {
      detail: {
        modules: Array.from(this.loadedModules),
        performanceMetrics: this.performanceMetrics,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(readyEvent);
  }

  getStatus() {
    return {
      loadedModules: Array.from(this.loadedModules),
      failedModules: this.performanceMetrics.failedModules,
      bundleLoadTime: this.performanceMetrics.bundleLoadTime,
      moduleLoadTimes: Object.fromEntries(this.performanceMetrics.moduleLoadTimes),
      totalModules: this.modules.size
    };
  }

  async preloadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return this.modules.get(moduleName);
    }
    
    const moduleLoaders = {
      Events: () => this.loadEvents(),
      Calendar: () => this.loadCalendar(),
      AdminUsersManager: () => this.loadAdminUsersManager()
    };
    
    if (moduleLoaders[moduleName]) {
      return this.loadModule(moduleName, moduleLoaders[moduleName]);
    }
    
    throw new Error(`Módulo ${moduleName} não encontrado`);
  }

  async warmupModules() {
    const moduleNames = ['Events', 'Calendar'];
    
    const warmupPromises = moduleNames.map(name => 
      this.preloadModule(name).catch(error => 
        console.warn(`⚠️ Warmup failed for ${name}:`, error)
      )
    );
    
    await Promise.allSettled(warmupPromises);
  }
}

const systemBundle = new SystemBundleOptimized();

document.addEventListener('DOMContentLoaded', () => {
  systemBundle.init().catch(error => {
    console.error('❌ Falha na inicialização do sistema:', error);
  });
});

setTimeout(() => {
  systemBundle.warmupModules().catch(error => {
    console.warn('⚠️ Warmup de módulos falhou:', error);
  });
}, 2000);

window.SystemBundle = systemBundle;
window.preloadModule = (name) => systemBundle.preloadModule(name);
window.getBundleStatus = () => systemBundle.getStatus();

console.log('📦 Bundle Otimizado v8.12.1 carregado!');

export default systemBundle;
