import { debounce } from './utils/debounce.js';
// import { openDB } from 'idb'; // Comentado temporariamente
// Usar IndexedDB nativo simplificado

class OptimizedApp {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      ambiente: 'production',
      debugAtivo: false,
      
      sistemaUnificado: true,
      estruturaUnificada: true,
      
      firebaseOfflineMode: true,
      tentarFirebase: true,
      salvarLocalStorage: true,
      salvarIndexedDB: true,
      
      suporteHorarios: true,
      deepLinksAtivo: true,
      syncRealtime: true,
      
      performance: {
        cacheEnabled: true,
        cacheTTL: 300000,
        maxCacheSize: 1000,
        debounceDelay: 2000,
        batchSize: 50,
        lazyLoadThreshold: 100
      }
    };

    this.dados = {
      areas: new Map(),
      eventos: new Map(),
      tarefas: new Map(),
      usuarios: new Map(),
      metadata: {
        versao: this.config.versao,
        ultimaAtualizacao: null,
        totalItens: 0,
        indices: new Map()
      }
    };

    this.estadoSistema = {
      inicializado: false,
      carregando: false,
      salvando: false,
      modoAnonimo: false,
      usuarioAutenticado: false,
      usuarioEmail: null,
      usuarioNome: null,
      firebaseDisponivel: false,
      usandoLocalStorage: false,
      usandoIndexedDB: false,
      performanceMetrics: {
        tempoInicializacao: 0,
        tempoCarregamento: 0,
        memoriaUsada: 0,
        operacoesPorSegundo: 0
      }
    };

    this.usuarioAtual = null;
    this.cache = new Map();
    this.indices = {
      eventosPorData: new Map(),
      tarefasPorUsuario: new Map(),
      tarefasPorStatus: new Map(),
      eventosPorParticipante: new Map()
    };

    this.debouncedSave = debounce(() => this._salvarDadosUnificados(), this.config.performance.debounceDelay);
    this.performanceObserver = null;
    this.idbPromise = null;
    
    this._singleton = null;
    this._initPromise = null;
  }

  static getInstance() {
    if (!OptimizedApp._singleton) {
      OptimizedApp._singleton = new OptimizedApp();
    }
    return OptimizedApp._singleton;
  }

  async init() {
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._performInit();
    return this._initPromise;
  }

  async _performInit() {
    const startTime = performance.now();
    
    try {
      this.estadoSistema.carregando = true;
      this._startPerformanceMonitoring();

      await this._initIndexedDB();
      
      this.estadoSistema.firebaseDisponivel = await this._verificarFirebase();
      
      this._detectarUsuario();
      
      await this._carregarDados();
      
      this._buildIndices();
      
      this._configurarListeners();
      
      this._configurarServiceWorker();
      
      const endTime = performance.now();
      this.estadoSistema.performanceMetrics.tempoInicializacao = endTime - startTime;
      
      this.estadoSistema.inicializado = true;
      this.estadoSistema.carregando = false;
      
      this._dispatchEvent('app-inicializado', { 
        versao: this.config.versao,
        tempoInicializacao: this.estadoSistema.performanceMetrics.tempoInicializacao
      });
      
      return true;
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.estadoSistema.carregando = false;
      
      if (this.config.salvarLocalStorage) {
        this._carregarDadosLocal();
        this.estadoSistema.inicializado = true;
        this.estadoSistema.usandoLocalStorage = true;
      }
      
      throw error;
    }
  }

  async _initIndexedDB() {
    try {
      // Temporariamente desabilitado para simplicidade
      console.log('IndexedDB: Usando fallback para localStorage');
      this.estadoSistema.usandoIndexedDB = false;
      /*
      this.idbPromise = openDB('BiapoSystemDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('eventos')) {
            const eventStore = db.createObjectStore('eventos', { keyPath: 'id' });
            eventStore.createIndex('data', 'data');
            eventStore.createIndex('participantes', 'participantes', { multiEntry: true });
          }
          
          if (!db.objectStoreNames.contains('tarefas')) {
            const taskStore = db.createObjectStore('tarefas', { keyPath: 'id' });
            taskStore.createIndex('responsavel', 'responsavel');
            taskStore.createIndex('status', 'status');
            taskStore.createIndex('dataInicio', 'dataInicio');
          }
          
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        }
      });
      
      this.estadoSistema.usandoIndexedDB = true;
      */
    } catch (error) {
      console.warn('IndexedDB não disponível:', error);
      this.estadoSistema.usandoIndexedDB = false;
    }
  }

  async _verificarFirebase() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 3000);
      
      try {
        if (typeof firebase === 'undefined' || typeof database === 'undefined') {
          clearTimeout(timeout);
          resolve(false);
          return;
        }

        database.ref('.info/connected').once('value', (snapshot) => {
          clearTimeout(timeout);
          resolve(snapshot.val() === true);
        }).catch(() => {
          clearTimeout(timeout);
          resolve(false);
        });
        
      } catch (error) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  async criarTarefa(dadosTarefa) {
    const startTime = performance.now();
    
    try {
      if (!dadosTarefa.titulo) {
        throw new Error('Título da tarefa é obrigatório');
      }

      const tarefa = {
        id: this._gerarIdUnico('tarefa'),
        ...dadosTarefa,
        _tipoItem: 'tarefa',
        titulo: dadosTarefa.titulo,
        descricao: dadosTarefa.descricao || '',
        tipo: dadosTarefa.tipo || 'pessoal',
        status: dadosTarefa.status || 'pendente',
        prioridade: dadosTarefa.prioridade || 'media',
        escopo: dadosTarefa.escopo || 'pessoal',
        visibilidade: dadosTarefa.visibilidade || 'privada',
        dataInicio: dadosTarefa.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: dadosTarefa.dataFim || null,
        horarioInicio: dadosTarefa.horarioInicio || null,
        horarioFim: dadosTarefa.horarioFim || null,
        duracaoEstimada: dadosTarefa.duracaoEstimada || null,
        horarioFlexivel: dadosTarefa.horarioFlexivel !== false,
        lembretesAtivos: dadosTarefa.lembretesAtivos === true,
        responsavel: dadosTarefa.responsavel || this.usuarioAtual?.email || 'Sistema',
        participantes: dadosTarefa.participantes || [],
        progresso: 0,
        tempoGasto: 0,
        aparecerNoCalendario: dadosTarefa.aparecerNoCalendario === true,
        criadoPor: this.usuarioAtual?.email || 'Sistema',
        dataCriacao: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString(),
        _origem: `app_otimizado_${this.config.versao}`,
        _sincronizado: false,
        _performanceMetric: performance.now() - startTime
      };

      this.dados.tarefas.set(tarefa.id, tarefa);
      this._updateIndices('tarefa', tarefa);
      this._invalidateCache(['tarefas', `tarefas_${tarefa.responsavel}`]);
      
      this.debouncedSave();
      
      this._dispatchEvent('tarefa-criada', tarefa);
      
      return tarefa;
      
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  async editarTarefa(id, atualizacoes) {
    try {
      const tarefa = this.dados.tarefas.get(id);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }

      const tarefaAtualizada = {
        ...tarefa,
        ...atualizacoes,
        ultimaAtualizacao: new Date().toISOString(),
        _sincronizado: false
      };

      this.dados.tarefas.set(id, tarefaAtualizada);
      this._updateIndices('tarefa', tarefaAtualizada);
      this._invalidateCache(['tarefas', `tarefas_${tarefaAtualizada.responsavel}`]);
      
      this.debouncedSave();
      this._dispatchEvent('tarefa-editada', tarefaAtualizada);
      
      return tarefaAtualizada;
      
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      throw error;
    }
  }

  async excluirTarefa(id) {
    try {
      const tarefa = this.dados.tarefas.get(id);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }

      this.dados.tarefas.delete(id);
      this._removeFromIndices('tarefa', tarefa);
      this._invalidateCache(['tarefas', `tarefas_${tarefa.responsavel}`]);
      
      this.debouncedSave();
      this._dispatchEvent('tarefa-excluida', { id, tarefa });
      
      return true;
      
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  }

  obterTarefasUsuario(emailUsuario = null) {
    const email = this._normalizarEmail(emailUsuario || this.usuarioAtual?.email);
    const cacheKey = `tarefas_${email}`;
    
    if (this.cache.has(cacheKey) && this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    let tarefas;
    
    if (!email) {
      tarefas = Array.from(this.dados.tarefas.values());
    } else {
      tarefas = Array.from(this.dados.tarefas.values()).filter(tarefa => {
        return this._normalizarEmail(tarefa.responsavel) === email ||
               this._normalizarEmail(tarefa.criadoPor) === email ||
               (tarefa.participantes || []).map(this._normalizarEmail).includes(email) ||
               tarefa.escopo === 'publico' ||
               tarefa.visibilidade === 'publica';
      });
    }

    this._setCache(cacheKey, tarefas);
    return tarefas;
  }

  async criarEvento(dadosEvento) {
    try {
      if (!dadosEvento.titulo || !dadosEvento.data) {
        throw new Error('Título e data do evento são obrigatórios');
      }

      const evento = {
        id: this._gerarIdUnico('evento'),
        ...dadosEvento,
        _tipoItem: 'evento',
        titulo: dadosEvento.titulo,
        data: dadosEvento.data,
        tipo: dadosEvento.tipo || 'outro',
        status: dadosEvento.status || 'agendado',
        descricao: dadosEvento.descricao || '',
        local: dadosEvento.local || '',
        horarioInicio: dadosEvento.horarioInicio || null,
        horarioFim: dadosEvento.horarioFim || null,
        participantes: dadosEvento.participantes || [],
        criadoPor: dadosEvento.criadoPor || this.usuarioAtual?.email || 'Sistema',
        dataCriacao: dadosEvento.dataCriacao || new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString(),
        _origem: `app_otimizado_${this.config.versao}`,
        _sincronizado: false
      };

      this.dados.eventos.set(evento.id, evento);
      this._updateIndices('evento', evento);
      this._invalidateCache(['eventos', `eventos_${evento.data}`]);
      
      this.debouncedSave();
      this._dispatchEvent('evento-criado', evento);
      
      return evento;
      
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async _salvarDadosUnificados() {
    if (this.estadoSistema.salvando) return;
    
    try {
      this.estadoSistema.salvando = true;
      
      this.dados.metadata.ultimaAtualizacao = new Date().toISOString();
      this.dados.metadata.totalItens = this.dados.eventos.size + this.dados.tarefas.size;
      
      const dadosParaSalvar = this._serializarDados();

      const salvarPromises = [];
      
      if (this.estadoSistema.firebaseDisponivel) {
        salvarPromises.push(this._salvarFirebase(dadosParaSalvar));
      }
      
      if (this.estadoSistema.usandoIndexedDB) {
        salvarPromises.push(this._salvarIndexedDB(dadosParaSalvar));
      }
      
      if (this.config.salvarLocalStorage) {
        salvarPromises.push(this._salvarDadosLocal(dadosParaSalvar));
      }

      await Promise.allSettled(salvarPromises);
      
      this._markAllSynced();
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      this._salvarBackupEmergencia();
      throw error;
    } finally {
      this.estadoSistema.salvando = false;
    }
  }

  async _salvarIndexedDB(dados) {
    // Temporariamente desabilitado
    console.log('IndexedDB save: usando localStorage como fallback');
    return;
    /*
    if (!this.idbPromise) return;
    
    try {
      const db = await this.idbPromise;
      const tx = db.transaction(['eventos', 'tarefas'], 'readwrite');
      
      const eventosStore = tx.objectStore('eventos');
      const tarefasStore = tx.objectStore('tarefas');
      
      await eventosStore.clear();
      await tarefasStore.clear();
      
      const eventos = Array.from(this.dados.eventos.values());
      const tarefas = Array.from(this.dados.tarefas.values());
      
      const eventoPromises = eventos.map(evento => eventosStore.add(evento));
      const tarefaPromises = tarefas.map(tarefa => tarefasStore.add(tarefa));
      
      await Promise.all([...eventoPromises, ...tarefaPromises]);
      await tx.done;
      
    } catch (error) {
      console.warn('Erro ao salvar no IndexedDB:', error);
    }
    */
  }

  _buildIndices() {
    this.indices.eventosPorData.clear();
    this.indices.tarefasPorUsuario.clear();
    this.indices.tarefasPorStatus.clear();
    this.indices.eventosPorParticipante.clear();

    for (const evento of this.dados.eventos.values()) {
      this._updateIndices('evento', evento);
    }

    for (const tarefa of this.dados.tarefas.values()) {
      this._updateIndices('tarefa', tarefa);
    }
  }

  _updateIndices(tipo, item) {
    if (tipo === 'evento') {
      if (!this.indices.eventosPorData.has(item.data)) {
        this.indices.eventosPorData.set(item.data, []);
      }
      this.indices.eventosPorData.get(item.data).push(item.id);

      (item.participantes || []).forEach(participante => {
        if (!this.indices.eventosPorParticipante.has(participante)) {
          this.indices.eventosPorParticipante.set(participante, []);
        }
        this.indices.eventosPorParticipante.get(participante).push(item.id);
      });
    } else if (tipo === 'tarefa') {
      if (!this.indices.tarefasPorUsuario.has(item.responsavel)) {
        this.indices.tarefasPorUsuario.set(item.responsavel, []);
      }
      this.indices.tarefasPorUsuario.get(item.responsavel).push(item.id);

      if (!this.indices.tarefasPorStatus.has(item.status)) {
        this.indices.tarefasPorStatus.set(item.status, []);
      }
      this.indices.tarefasPorStatus.get(item.status).push(item.id);
    }
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.performance.cacheTTL
    });

    if (this.cache.size > this.config.performance.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < cached.ttl;
  }

  _invalidateCache(keys) {
    keys.forEach(key => this.cache.delete(key));
  }

  _startPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.estadoSistema.performanceMetrics.operacoesPorSegundo++;
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }

    setInterval(() => {
      if (performance.memory) {
        this.estadoSistema.performanceMetrics.memoriaUsada = performance.memory.usedJSHeapSize;
      }
    }, 5000);
  }

  async _configurarServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        console.warn('Service Worker não pôde ser registrado:', error);
      }
    }
  }

  _serializarDados() {
    return {
      areas: Object.fromEntries(this.dados.areas),
      eventos: Object.fromEntries(this.dados.eventos),
      tarefas: Object.fromEntries(this.dados.tarefas),
      usuarios: Object.fromEntries(this.dados.usuarios),
      metadata: {
        ...this.dados.metadata,
        indices: Object.fromEntries(this.dados.metadata.indices)
      }
    };
  }

  _deserializarDados(dados) {
    this.dados.areas = new Map(Object.entries(dados.areas || {}));
    this.dados.eventos = new Map(Object.entries(dados.eventos || {}));
    this.dados.tarefas = new Map(Object.entries(dados.tarefas || {}));
    this.dados.usuarios = new Map(Object.entries(dados.usuarios || {}));
    this.dados.metadata = {
      ...dados.metadata,
      indices: new Map(Object.entries(dados.metadata?.indices || {}))
    };
  }

  _detectarUsuario() {
    try {
      if (typeof Auth !== 'undefined' && Auth.obterUsuario) {
        const usuario = Auth.obterUsuario();
        if (usuario) {
          this.usuarioAtual = usuario;
          this.estadoSistema.usuarioAutenticado = true;
          this.estadoSistema.usuarioEmail = usuario.email;
          this.estadoSistema.usuarioNome = usuario.displayName || usuario.nome;
          this.estadoSistema.modoAnonimo = false;
          return;
        }
      }
      
      this.estadoSistema.modoAnonimo = true;
      this.estadoSistema.usuarioAutenticado = false;
      
    } catch (error) {
      console.error('Erro ao detectar usuário:', error);
      this.estadoSistema.modoAnonimo = true;
    }
  }

  _gerarIdUnico(tipo = 'item') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${tipo}_${timestamp}_${random}`;
  }

  _normalizarEmail(email) {
    return (email || '').toLowerCase().trim();
  }

  _dispatchEvent(evento, dados) {
    try {
      const eventoCustomizado = new CustomEvent(`app-${evento}`, {
        detail: { 
          tipo: evento, 
          dados: dados,
          timestamp: Date.now() 
        }
      });
      
      document.dispatchEvent(eventoCustomizado);
      
    } catch (error) {
      console.error('Erro ao disparar evento:', error);
    }
  }

  _configurarListeners() {
    window.addEventListener('biapo-login', (e) => {
      this._detectarUsuario();
      this._carregarDados();
    });
    
    window.addEventListener('biapo-logout', () => {
      this.usuarioAtual = null;
      this.estadoSistema.modoAnonimo = true;
      this.estadoSistema.usuarioAutenticado = false;
    });

    setInterval(() => {
      if (this._temMudancasPendentes()) {
        this.debouncedSave();
      }
    }, 60000);
  }

  _temMudancasPendentes() {
    const eventosPendentes = Array.from(this.dados.eventos.values()).some(e => !e._sincronizado);
    const tarefasPendentes = Array.from(this.dados.tarefas.values()).some(t => !t._sincronizado);
    
    return eventosPendentes || tarefasPendentes;
  }

  _markAllSynced() {
    for (const evento of this.dados.eventos.values()) {
      evento._sincronizado = true;
    }
    
    for (const tarefa of this.dados.tarefas.values()) {
      tarefa._sincronizado = true;
    }
  }

  obterStatusSistema() {
    return {
      versao: this.config.versao,
      inicializado: this.estadoSistema.inicializado,
      firebaseDisponivel: this.estadoSistema.firebaseDisponivel,
      usandoLocalStorage: this.estadoSistema.usandoLocalStorage,
      usandoIndexedDB: this.estadoSistema.usandoIndexedDB,
      modoAnonimo: this.estadoSistema.modoAnonimo,
      usuarioAutenticado: this.estadoSistema.usuarioAutenticado,
      totalEventos: this.dados.eventos.size,
      totalTarefas: this.dados.tarefas.size,
      sistemaUnificado: this.config.sistemaUnificado,
      performanceMetrics: this.estadoSistema.performanceMetrics,
      cacheStats: {
        entradas: this.cache.size,
        maxSize: this.config.performance.maxCacheSize,
        hitRate: this._calculateCacheHitRate()
      }
    };
  }

  _calculateCacheHitRate() {
    return 0;
  }

  ehAdmin() {
    try {
      if (typeof Auth !== 'undefined' && Auth.ehAdmin) {
        return Auth.ehAdmin();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  podeEditar() {
    return !this.estadoSistema.modoAnonimo;
  }

  _buscarEvento(id) {
    return this.dados.eventos.get(id) || null;
  }

  async _carregarDados() {
    try {
      if (this.estadoSistema.firebaseDisponivel && database) {
        try {
          const snapshot = await database.ref('dados').once('value');
          const dados = snapshot.val();
          
          if (dados) {
            this._deserializarDados(dados);
            return;
          }
        } catch (error) {
          console.warn('Erro ao carregar do Firebase:', error);
        }
      }
      
      this._carregarDadosLocal();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this._estruturaVazia();
    }
  }

  _carregarDadosLocal() {
    try {
      const dadosString = localStorage.getItem('biapo_dados_v8_optimized');
      
      if (dadosString) {
        const dados = JSON.parse(dadosString);
        this._deserializarDados(dados);
        this.estadoSistema.usandoLocalStorage = true;
      } else {
        this._estruturaVazia();
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      this._estruturaVazia();
    }
  }

  _estruturaVazia() {
    this.dados = {
      areas: new Map(),
      eventos: new Map(),
      tarefas: new Map(),
      usuarios: new Map(),
      metadata: {
        versao: this.config.versao,
        ultimaAtualizacao: new Date().toISOString(),
        totalItens: 0,
        indices: new Map()
      }
    };
  }

  async _salvarDadosLocal(dados) {
    try {
      const dadosString = JSON.stringify(dados);
      localStorage.setItem('biapo_dados_v8_optimized', dadosString);
      localStorage.setItem('biapo_dados_timestamp_optimized', new Date().toISOString());
      this.estadoSistema.usandoLocalStorage = true;
    } catch (error) {
      console.error('Erro ao salvar localmente:', error);
      
      try {
        sessionStorage.setItem('biapo_dados_backup_optimized', JSON.stringify(dados));
      } catch (e) {
        console.error('Falha total no salvamento local');
      }
    }
  }

  async _salvarFirebase(dados) {
    try {
      await database.ref('dados').set(dados);
    } catch (error) {
      console.warn('Erro ao salvar no Firebase:', error);
      this.estadoSistema.firebaseDisponivel = false;
      throw error;
    }
  }

  _salvarBackupEmergencia() {
    try {
      const backup = {
        dados: this._serializarDados(),
        timestamp: new Date().toISOString(),
        versao: this.config.versao,
        tipo: 'emergencia'
      };
      
      try {
        localStorage.setItem('biapo_backup_emergencia_optimized', JSON.stringify(backup));
      } catch (e) {
        sessionStorage.setItem('biapo_backup_emergencia_optimized', JSON.stringify(backup));
      }
      
    } catch (error) {
      console.error('Falha crítica no backup de emergência');
    }
  }

  _removeFromIndices(tipo, item) {
    if (tipo === 'evento') {
      const eventosData = this.indices.eventosPorData.get(item.data);
      if (eventosData) {
        const index = eventosData.indexOf(item.id);
        if (index > -1) eventosData.splice(index, 1);
      }

      (item.participantes || []).forEach(participante => {
        const eventosParticipante = this.indices.eventosPorParticipante.get(participante);
        if (eventosParticipante) {
          const index = eventosParticipante.indexOf(item.id);
          if (index > -1) eventosParticipante.splice(index, 1);
        }
      });
    } else if (tipo === 'tarefa') {
      const tarefasUsuario = this.indices.tarefasPorUsuario.get(item.responsavel);
      if (tarefasUsuario) {
        const index = tarefasUsuario.indexOf(item.id);
        if (index > -1) tarefasUsuario.splice(index, 1);
      }

      const tarefasStatus = this.indices.tarefasPorStatus.get(item.status);
      if (tarefasStatus) {
        const index = tarefasStatus.indexOf(item.id);
        if (index > -1) tarefasStatus.splice(index, 1);
      }
    }
  }
}

const App = OptimizedApp.getInstance();

if (typeof window !== 'undefined') {
  window.App = App;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      App.init().catch(console.error);
    });
  } else {
    App.init().catch(console.error);
  }
}

export default App;
