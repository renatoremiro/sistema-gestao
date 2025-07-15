export class OptimizedCalendar {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      locale: 'pt-BR',
      firstDayOfWeek: 1, // Segunda-feira
      showWeekNumbers: false,
      enableKeyboard: true,
      enableTouch: true,
      
      performance: {
        virtualScrolling: true,
        lazyRender: true,
        batchSize: 20,
        cacheSize: 100,
        debounceDelay: 100
      },
      
      view: {
        defaultView: 'month',
        availableViews: ['month', 'week', 'day'],
        showHours: true,
        hourRange: { start: 6, end: 22 },
        slotDuration: 30 // minutos
      }
    };

    this.state = {
      currentDate: new Date(),
      selectedDate: null,
      view: 'month',
      eventos: new Map(),
      tarefas: new Map(),
      
      cache: new Map(),
      renderedDates: new Set(),
      eventListeners: new Map(),
      
      performanceMetrics: {
        renderTimes: [],
        eventCount: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    };

    this.container = null;
    this.intersectionObserver = null;
    this.resizeObserver = null;
    
    this.debouncedRender = this._debounce(
      () => this._renderCalendar(), 
      this.config.performance.debounceDelay
    );
  }

  init(containerId = 'calendario') {
    try {
      performance.mark('calendar-init-start');
      
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container ${containerId} não encontrado`);
      }
      
      this._setupContainer();
      this._setupEventListeners();
      this._setupObservers();
      this._loadInitialData();
      this._renderCalendar();
      
      performance.mark('calendar-init-end');
      performance.measure('calendar-init', 'calendar-init-start', 'calendar-init-end');
      
      console.log('📅 Calendar Otimizado inicializado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Calendar:', error);
      throw error;
    }
  }

  _setupContainer() {
    this.container.className = 'calendar-optimized';
    this.container.innerHTML = `
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="nav-btn" id="prevMonth" title="Mês anterior">‹</button>
          <button class="nav-btn" id="nextMonth" title="Próximo mês">›</button>
          <h2 class="calendar-title" id="calendarTitle"></h2>
        </div>
        <div class="calendar-controls">
          <select class="view-selector" id="viewSelector">
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="day">Dia</option>
          </select>
          <button class="today-btn" id="todayBtn">Hoje</button>
        </div>
      </div>
      <div class="calendar-body" id="calendarBody">
        <!-- Calendário será renderizado aqui -->
      </div>
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-color event"></span>
          <span>Eventos</span>
        </div>
        <div class="legend-item">
          <span class="legend-color task"></span>
          <span>Tarefas</span>
        </div>
      </div>
    `;
  }

  _setupEventListeners() {
    // Navegação
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      this._navigateMonth(-1);
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
      this._navigateMonth(1);
    });
    
    document.getElementById('todayBtn')?.addEventListener('click', () => {
      this._goToToday();
    });
    
    // Mudança de visualização
    document.getElementById('viewSelector')?.addEventListener('change', (e) => {
      this._changeView(e.target.value);
    });
    
    // Teclado
    if (this.config.enableKeyboard) {
      document.addEventListener('keydown', (e) => {
        this._handleKeyboard(e);
      });
    }
    
    // Touch
    if (this.config.enableTouch) {
      this._setupTouchEvents();
    }
    
    // App events
    document.addEventListener('app-evento-criado', (e) => {
      this._onEventCreated(e.detail.dados);
    });
    
    document.addEventListener('app-evento-editado', (e) => {
      this._onEventUpdated(e.detail.dados);
    });
    
    document.addEventListener('app-tarefa-criada', (e) => {
      this._onTaskCreated(e.detail.dados);
    });
  }

  _setupObservers() {
    // Intersection Observer para lazy loading
    if ('IntersectionObserver' in window && this.config.performance.lazyRender) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this._renderDateCell(entry.target);
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
    
    // Resize Observer para responsividade
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.debouncedRender();
      });
      
      this.resizeObserver.observe(this.container);
    }
  }

  async _loadInitialData() {
    try {
      if (this._checkApp()) {
        const dadosApp = App._obterTodosItensUnificados();
        
        dadosApp.eventos.forEach(evento => {
          this.state.eventos.set(evento.id, evento);
        });
        
        dadosApp.tarefas.forEach(tarefa => {
          if (tarefa.aparecerNoCalendario) {
            this.state.tarefas.set(tarefa.id, tarefa);
          }
        });
        
        this.state.performanceMetrics.eventCount = 
          this.state.eventos.size + this.state.tarefas.size;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados iniciais:', error);
    }
  }

  _renderCalendar() {
    const startTime = performance.now();
    
    try {
      this._updateTitle();
      
      const body = document.getElementById('calendarBody');
      if (!body) return;
      
      switch (this.state.view) {
        case 'month':
          this._renderMonthView(body);
          break;
        case 'week':
          this._renderWeekView(body);
          break;
        case 'day':
          this._renderDayView(body);
          break;
      }
      
      const endTime = performance.now();
      this.state.performanceMetrics.renderTimes.push(endTime - startTime);
      
    } catch (error) {
      console.error('❌ Erro ao renderizar calendário:', error);
    }
  }

  _renderMonthView(container) {
    const year = this.state.currentDate.getFullYear();
    const month = this.state.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() - this.config.firstDayOfWeek + 7) % 7);
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay() + this.config.firstDayOfWeek) % 7);
    
    container.innerHTML = `
      <div class="calendar-grid month-view">
        ${this._renderWeekHeader()}
        ${this._renderMonthDays(startDate, endDate, month)}
      </div>
    `;
    
    // Setup lazy loading para células
    if (this.intersectionObserver) {
      container.querySelectorAll('.day-cell').forEach(cell => {
        this.intersectionObserver.observe(cell);
      });
    }
  }

  _renderWeekHeader() {
    const weekDays = this._getWeekDayNames();
    
    return `
      <div class="week-header">
        ${weekDays.map(day => `
          <div class="week-day-header">${day}</div>
        `).join('')}
      </div>
    `;
  }

  _renderMonthDays(startDate, endDate, currentMonth) {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const isCurrentMonth = current.getMonth() === currentMonth;
      const isToday = this._isToday(current);
      const isSelected = this._isSelected(current);
      
      const dayEvents = this._getEventsForDate(current);
      const dayTasks = this._getTasksForDate(current);
      
      days.push(`
        <div class="day-cell ${isCurrentMonth ? 'current-month' : 'other-month'} 
                    ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             data-date="${current.toISOString().split('T')[0]}"
             onclick="OptimizedCalendar._onDateClick('${current.toISOString().split('T')[0]}')">
          
          <div class="day-number">${current.getDate()}</div>
          
          <div class="day-events">
            ${this._renderDayItems(dayEvents, dayTasks)}
          </div>
        </div>
      `);
      
      current.setDate(current.getDate() + 1);
    }
    
    return days.join('');
  }

  _renderDayItems(events, tasks) {
    const items = [];
    const maxVisible = 3;
    
    // Eventos
    events.slice(0, maxVisible).forEach(event => {
      items.push(`
        <div class="calendar-event" 
             title="${event.titulo}"
             onclick="OptimizedCalendar._onItemClick('evento', '${event.id}', event)">
          <span class="event-icon">📅</span>
          <span class="event-title">${this._truncateText(event.titulo, 15)}</span>
        </div>
      `);
    });
    
    // Tarefas
    const remainingSpace = maxVisible - events.length;
    tasks.slice(0, remainingSpace).forEach(task => {
      items.push(`
        <div class="calendar-task" 
             title="${task.titulo}"
             onclick="OptimizedCalendar._onItemClick('tarefa', '${task.id}', event)">
          <span class="task-icon">📝</span>
          <span class="task-title">${this._truncateText(task.titulo, 15)}</span>
        </div>
      `);
    });
    
    // Indicador de mais itens
    const totalHidden = (events.length + tasks.length) - items.length;
    if (totalHidden > 0) {
      items.push(`
        <div class="more-items">+${totalHidden} mais</div>
      `);
    }
    
    return items.join('');
  }

  _getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `events_${dateStr}`;
    
    if (this.state.cache.has(cacheKey)) {
      this.state.performanceMetrics.cacheHits++;
      return this.state.cache.get(cacheKey);
    }
    
    const events = Array.from(this.state.eventos.values())
      .filter(evento => evento.data === dateStr)
      .sort((a, b) => {
        if (a.horarioInicio && b.horarioInicio) {
          return a.horarioInicio.localeCompare(b.horarioInicio);
        }
        return a.titulo.localeCompare(b.titulo);
      });
    
    this.state.cache.set(cacheKey, events);
    this.state.performanceMetrics.cacheMisses++;
    
    // Cleanup cache se muito grande
    if (this.state.cache.size > this.config.performance.cacheSize) {
      const firstKey = this.state.cache.keys().next().value;
      this.state.cache.delete(firstKey);
    }
    
    return events;
  }

  _getTasksForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `tasks_${dateStr}`;
    
    if (this.state.cache.has(cacheKey)) {
      this.state.performanceMetrics.cacheHits++;
      return this.state.cache.get(cacheKey);
    }
    
    const tasks = Array.from(this.state.tarefas.values())
      .filter(tarefa => tarefa.dataInicio === dateStr || tarefa.dataFim === dateStr)
      .sort((a, b) => a.titulo.localeCompare(b.titulo));
    
    this.state.cache.set(cacheKey, tasks);
    this.state.performanceMetrics.cacheMisses++;
    
    return tasks;
  }

  _navigateMonth(direction) {
    const newDate = new Date(this.state.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.state.currentDate = newDate;
    this.debouncedRender();
  }

  _goToToday() {
    this.state.currentDate = new Date();
    this.state.selectedDate = new Date();
    this.debouncedRender();
  }

  _changeView(view) {
    this.state.view = view;
    this.debouncedRender();
  }

  _updateTitle() {
    const titleElement = document.getElementById('calendarTitle');
    if (!titleElement) return;
    
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      year: 'numeric',
      month: 'long'
    });
    
    titleElement.textContent = formatter.format(this.state.currentDate);
  }

  _getWeekDayNames() {
    const formatter = new Intl.DateTimeFormat(this.config.locale, { weekday: 'short' });
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, this.config.firstDayOfWeek + i);
      weekDays.push(formatter.format(date));
    }
    
    return weekDays;
  }

  _isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  _isSelected(date) {
    return this.state.selectedDate && 
           date.toDateString() === this.state.selectedDate.toDateString();
  }

  _truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  _checkApp() {
    return typeof App !== 'undefined' && App._obterTodosItensUnificados;
  }

  _onEventCreated(evento) {
    this.state.eventos.set(evento.id, evento);
    this._invalidateCache();
    this.debouncedRender();
  }

  _onEventUpdated(evento) {
    this.state.eventos.set(evento.id, evento);
    this._invalidateCache();
    this.debouncedRender();
  }

  _onTaskCreated(tarefa) {
    if (tarefa.aparecerNoCalendario) {
      this.state.tarefas.set(tarefa.id, tarefa);
      this._invalidateCache();
      this.debouncedRender();
    }
  }

  _invalidateCache() {
    this.state.cache.clear();
  }

  _onDateClick(dateStr) {
    this.state.selectedDate = new Date(dateStr);
    
    if (typeof Events !== 'undefined' && Events.mostrarNovoEvento) {
      Events.mostrarNovoEvento(dateStr);
    }
  }

  _onItemClick(type, id, event) {
    event.stopPropagation();
    
    if (type === 'evento' && typeof Events !== 'undefined') {
      Events.abrirModalEdicao(id);
    } else if (type === 'tarefa') {
      console.log('Abrir edição de tarefa:', id);
    }
  }

  _handleKeyboard(event) {
    if (!this.container.contains(document.activeElement)) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this._navigateMonth(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this._navigateMonth(1);
        event.preventDefault();
        break;
      case 'Home':
        this._goToToday();
        event.preventDefault();
        break;
      case 'Escape':
        this.state.selectedDate = null;
        this.debouncedRender();
        break;
    }
  }

  _setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) return;
      
      const diffX = e.touches[0].clientX - startX;
      const diffY = e.touches[0].clientY - startY;
      
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this._navigateMonth(-1);
        } else {
          this._navigateMonth(1);
        }
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // API Pública
  atualizarEventos() {
    this._loadInitialData();
    this.debouncedRender();
  }

  irParaData(date) {
    this.state.currentDate = new Date(date);
    this.debouncedRender();
  }

  obterStatus() {
    return {
      versao: this.config.versao,
      view: this.state.view,
      currentDate: this.state.currentDate.toISOString(),
      eventCount: this.state.eventos.size,
      taskCount: this.state.tarefas.size,
      performanceMetrics: {
        ...this.state.performanceMetrics,
        avgRenderTime: this.state.performanceMetrics.renderTimes.length > 0 ?
          this.state.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / 
          this.state.performanceMetrics.renderTimes.length : 0,
        cacheHitRate: this.state.performanceMetrics.cacheHits + this.state.performanceMetrics.cacheMisses > 0 ?
          (this.state.performanceMetrics.cacheHits / 
           (this.state.performanceMetrics.cacheHits + this.state.performanceMetrics.cacheMisses) * 100).toFixed(2) : 0
      }
    };
  }

  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.state.cache.clear();
    this.state.eventListeners.clear();
  }
}

// Instância global
const optimizedCalendar = new OptimizedCalendar();

if (typeof window !== 'undefined') {
  window.OptimizedCalendar = optimizedCalendar;
  window.Calendar = optimizedCalendar;
  
  // Auto-inicialização
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendario')) {
      optimizedCalendar.init();
    }
  });
}

export default OptimizedCalendar;
