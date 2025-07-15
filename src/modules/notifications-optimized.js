export class OptimizedNotifications {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      defaultDuration: 5000,
      maxNotifications: 5,
      enableSound: false,
      enableAnimations: true,
      position: 'top-right',
      autoRemove: true
    };

    this.notifications = new Map();
    this.container = null;
    this.soundEnabled = false;
    this.queue = [];
    this.isProcessingQueue = false;
  }

  init() {
    this._createContainer();
    this._setupStyles();
    this._checkSoundSupport();
  }

  _createContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'notification-container-optimized';
    this.container.className = 'notification-container';
    
    document.body.appendChild(this.container);
  }

  _setupStyles() {
    if (document.getElementById('notification-styles-optimized')) return;

    const styles = document.createElement('style');
    styles.id = 'notification-styles-optimized';
    styles.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        pointer-events: none;
        max-width: 400px;
      }

      .notification-item {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid #3b82f6;
        pointer-events: auto;
        transform: translateX(100%);
        transition: all 0.3s ease;
        opacity: 0;
        max-width: 100%;
        word-wrap: break-word;
      }

      .notification-item.show {
        transform: translateX(0);
        opacity: 1;
      }

      .notification-item.success {
        border-left-color: #10b981;
      }

      .notification-item.error {
        border-left-color: #ef4444;
      }

      .notification-item.warning {
        border-left-color: #f59e0b;
      }

      .notification-item.info {
        border-left-color: #3b82f6;
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .notification-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: #374151;
        margin: 0;
        word-break: break-word;
      }

      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        margin: 0;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .notification-close:hover {
        background-color: #f3f4f6;
        color: #374151;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(59, 130, 246, 0.3);
        border-radius: 0 0 8px 8px;
        transition: width linear;
      }

      @media (max-width: 480px) {
        .notification-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .notification-item {
          margin-bottom: 8px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  _checkSoundSupport() {
    this.soundEnabled = this.config.enableSound && typeof Audio !== 'undefined';
  }

  success(message, options = {}) {
    return this._show(message, 'success', options);
  }

  error(message, options = {}) {
    return this._show(message, 'error', options);
  }

  warning(message, options = {}) {
    return this._show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this._show(message, 'info', options);
  }

  _show(message, type = 'info', options = {}) {
    const notification = {
      id: this._generateId(),
      message,
      type,
      options: {
        duration: options.duration || this.config.defaultDuration,
        persistent: options.persistent || false,
        showProgress: options.showProgress !== false,
        allowClose: options.allowClose !== false,
        ...options
      },
      timestamp: Date.now()
    };

    if (this.notifications.size >= this.config.maxNotifications) {
      this._removeOldest();
    }

    this.notifications.set(notification.id, notification);
    this._render(notification);

    if (!notification.options.persistent) {
      setTimeout(() => {
        this._remove(notification.id);
      }, notification.options.duration);
    }

    return notification.id;
  }

  _render(notification) {
    if (!this.container) {
      this._createContainer();
    }

    const element = document.createElement('div');
    element.className = `notification-item ${notification.type}`;
    element.id = `notification-${notification.id}`;
    
    element.innerHTML = `
      <div class="notification-content">
        <p class="notification-text">${this._escapeHtml(notification.message)}</p>
        ${notification.options.allowClose ? 
          `<button class="notification-close" onclick="window.Notifications._remove('${notification.id}')">&times;</button>` : 
          ''
        }
      </div>
      ${notification.options.showProgress && !notification.options.persistent ? 
        `<div class="notification-progress" style="width: 100%;"></div>` : 
        ''
      }
    `;

    this.container.appendChild(element);

    requestAnimationFrame(() => {
      element.classList.add('show');
    });

    if (notification.options.showProgress && !notification.options.persistent) {
      this._animateProgress(element, notification.options.duration);
    }

    if (this.soundEnabled) {
      this._playSound(notification.type);
    }
  }

  _animateProgress(element, duration) {
    const progressBar = element.querySelector('.notification-progress');
    if (!progressBar) return;

    progressBar.style.transition = `width ${duration}ms linear`;
    
    requestAnimationFrame(() => {
      progressBar.style.width = '0%';
    });
  }

  _remove(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.classList.remove('show');
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    }

    this.notifications.delete(id);
  }

  _removeOldest() {
    const oldest = Array.from(this.notifications.values())
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    if (oldest) {
      this._remove(oldest.id);
    }
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _playSound(type) {
    try {
      const frequency = {
        success: 800,
        error: 300,
        warning: 600,
        info: 500
      }[type] || 500;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Sound notification failed:', error);
    }
  }

  clear() {
    this.notifications.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  removeById(id) {
    this._remove(id);
  }

  updatePosition(position) {
    this.config.position = position;
    if (this.container) {
      this._updateContainerPosition();
    }
  }

  _updateContainerPosition() {
    const positions = {
      'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
      'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
      'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' },
      'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)', right: 'auto', bottom: 'auto' }
    };

    const pos = positions[this.config.position] || positions['top-right'];
    Object.assign(this.container.style, pos);
  }

  enableSound() {
    this.config.enableSound = true;
    this._checkSoundSupport();
  }

  disableSound() {
    this.config.enableSound = false;
    this.soundEnabled = false;
  }

  getStatus() {
    return {
      versao: this.config.versao,
      activeNotifications: this.notifications.size,
      maxNotifications: this.config.maxNotifications,
      soundEnabled: this.soundEnabled,
      position: this.config.position,
      config: this.config
    };
  }
}

const optimizedNotifications = new OptimizedNotifications();

if (typeof window !== 'undefined') {
  optimizedNotifications.init();
  window.Notifications = optimizedNotifications;
}

export default OptimizedNotifications;
