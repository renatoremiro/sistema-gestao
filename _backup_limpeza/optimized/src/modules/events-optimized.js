export class OptimizedEvents {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      tipos: [
        { value: 'reuniao', label: 'Reunião', icon: '📅', cor: '#3b82f6' },
        { value: 'entrega', label: 'Entrega', icon: '📦', cor: '#10b981' },
        { value: 'prazo', label: 'Prazo', icon: '⏰', cor: '#ef4444' },
        { value: 'marco', label: 'Marco', icon: '🏁', cor: '#8b5cf6' },
        { value: 'reuniao_equipe', label: 'Reunião de Equipe', icon: '👥', cor: '#06b6d4' },
        { value: 'treinamento', label: 'Treinamento', icon: '📚', cor: '#f59e0b' },
        { value: 'outro', label: 'Outro', icon: '📌', cor: '#6b7280' }
      ],
      
      status: [
        { value: 'agendado', label: 'Agendado', cor: '#3b82f6' },
        { value: 'confirmado', label: 'Confirmado', cor: '#10b981' },
        { value: 'concluido', label: 'Concluído', cor: '#22c55e' },
        { value: 'cancelado', label: 'Cancelado', cor: '#ef4444' }
      ],
      
      integracaoApp: true,
      suporteHorariosUnificados: true,
      deepLinksAtivo: true,
      sincronizacaoCalendar: true,
      verificacaoPermissoes: true,
      modalEdicaoUnificado: true,
      
      participantesBiapoFallback: [
        'Renato Remiro',
        'Bruna Britto', 
        'Alex',
        'Carlos Mendonça (Beto)',
        'Isabella',
        'Eduardo Santos',
        'Nayara',
        'Juliana',
        'Jean',
        'Lara',
        'Nominato'
      ],
      
      performance: {
        cacheEnabled: true,
        cacheTTL: 180000,
        timeoutModal: 50,
        timeoutValidacao: 30,
        maxModalHistory: 10
      }
    };

    this.state = {
      modalAtivo: false,
      eventoEditando: null,
      modoEdicao: false,
      eventoOriginal: null,
      participantesSelecionados: [],
      modoAnonimo: false,
      
      participantesCache: null,
      ultimaAtualizacaoParticipantes: null,
      permissoesCache: new Map(),
      ultimaVerificacaoPermissoes: null,
      
      ultimaSincronizacao: null,
      sincronizacaoEmAndamento: false,
      deepLinkPendente: null,
      
      modalHistory: [],
      performanceMetrics: {
        modalOpenTimes: [],
        submitTimes: [],
        avgModalOpenTime: 0,
        avgSubmitTime: 0
      }
    };

    this.modalInstance = null;
    this.debounceTimeouts = new Map();
  }

  init() {
    performance.mark('events-init-start');
    
    this._setupEventListeners();
    this._checkDeepLinks();
    
    performance.mark('events-init-end');
    performance.measure('events-init', 'events-init-start', 'events-init-end');
  }

  _setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.modalAtivo) {
        this.fecharModal();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (this.state.modalAtivo && this.state.modoEdicao) {
        return 'Você tem alterações não salvas. Deseja realmente sair?';
      }
    });
  }

  _checkDeepLinks() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento');
    const acao = urlParams.get('acao');
    
    if (eventoId && acao === 'editar') {
      this.state.deepLinkPendente = { eventoId, acao };
      
      setTimeout(() => {
        if (this.state.deepLinkPendente) {
          this.abrirModalEdicao(eventoId);
          this.state.deepLinkPendente = null;
        }
      }, 1000);
    }
  }

  async mostrarNovoEvento(dataInicial = null) {
    const startTime = performance.now();
    
    try {
      if (!this._verificarPermissoes()) {
        this._mostrarMensagemModoAnonimo('criar evento');
        return;
      }
      
      const hoje = new Date();
      const dataInput = dataInicial || hoje.toISOString().split('T')[0];
      
      this.state.eventoEditando = null;
      this.state.modoEdicao = false;
      this.state.eventoOriginal = null;
      this.state.participantesSelecionados = [];
      
      await this._prepararParticipantes();
      this._criarModalOtimizado(dataInput);
      this.state.modalAtivo = true;
      
      const endTime = performance.now();
      this.state.performanceMetrics.modalOpenTimes.push(endTime - startTime);
      this._updateAvgModalOpenTime();

    } catch (error) {
      console.error('❌ Erro ao mostrar modal:', error);
      this._mostrarNotificacao('Erro ao abrir modal de evento', 'error');
    }
  }

  async abrirModalEdicao(eventoId) {
    const startTime = performance.now();
    
    try {
      const evento = this._buscarEvento(eventoId);
      if (!evento) {
        this._mostrarNotificacao('❌ Evento não encontrado', 'error');
        return false;
      }
      
      const podeEditar = await this._verificarPermissoesEdicao(evento);
      if (!podeEditar.permitido) {
        this._mostrarAlertaPermissao(podeEditar.motivo, evento);
        return false;
      }
      
      this.state.eventoEditando = eventoId;
      this.state.modoEdicao = true;
      this.state.eventoOriginal = { ...evento };
      this.state.participantesSelecionados = evento.participantes || evento.pessoas || [];
      
      await this._prepararParticipantes();
      this._criarModalOtimizado(evento.data, evento);
      this.state.modalAtivo = true;
      
      this._addToModalHistory(evento);
      
      const endTime = performance.now();
      this.state.performanceMetrics.modalOpenTimes.push(endTime - startTime);
      this._updateAvgModalOpenTime();
      
      return true;

    } catch (error) {
      console.error('❌ Erro ao abrir modal de edição:', error);
      this._mostrarNotificacao('Erro ao abrir edição do evento', 'error');
      return false;
    }
  }

  async _prepararParticipantes() {
    const cacheKey = 'participantes_biapo';
    const agora = Date.now();
    
    if (this.state.participantesCache && 
        this.state.ultimaAtualizacaoParticipantes &&
        (agora - this.state.ultimaAtualizacaoParticipantes) < this.config.performance.cacheTTL) {
      return this.state.participantesCache;
    }

    try {
      let participantes = this.config.participantesBiapoFallback;
      
      if (this._verificarAuth() && typeof Auth.listarUsuarios === 'function') {
        const usuarios = Auth.listarUsuarios({ ativo: true });
        if (usuarios && usuarios.length > 0) {
          participantes = usuarios.map(u => u.nome).filter(Boolean);
        }
      }
      
      this.state.participantesCache = participantes;
      this.state.ultimaAtualizacaoParticipantes = agora;
      
      return participantes;
      
    } catch (error) {
      console.error('❌ Erro ao preparar participantes:', error);
      return this.config.participantesBiapoFallback;
    }
  }

  _criarModalOtimizado(dataInicial, dadosEvento = null) {
    if (this.modalInstance) {
      this._atualizarModalExistente(dataInicial, dadosEvento);
      return;
    }

    this._removerModal();
    
    const ehEdicao = this.state.modoEdicao && !!dadosEvento;
    const titulo = ehEdicao ? 'Editar Evento' : 'Novo Evento';
    
    const modal = document.createElement('div');
    modal.id = 'modalEventoOptimizado';
    modal.className = 'modal-optimized';
    
    modal.innerHTML = this._gerarHtmlModalOtimizado(titulo, dataInicial, dadosEvento, ehEdicao);
    
    document.body.appendChild(modal);
    this.modalInstance = modal;
    
    this._aplicarAnimacaoEntrada(modal);
    this._configurarEventListenersModal(modal);
    
    setTimeout(() => {
      const campoTitulo = document.getElementById('eventoTituloOpt');
      if (campoTitulo) {
        campoTitulo.focus();
        if (ehEdicao) {
          campoTitulo.select();
        }
      }
    }, this.config.performance.timeoutModal);
  }

  _atualizarModalExistente(dataInicial, dadosEvento) {
    if (!this.modalInstance) return;
    
    const content = this.modalInstance.querySelector('.modal-content-optimized');
    if (content) {
      const ehEdicao = this.state.modoEdicao && !!dadosEvento;
      const titulo = ehEdicao ? 'Editar Evento' : 'Novo Evento';
      
      content.innerHTML = this._gerarConteudoModal(titulo, dataInicial, dadosEvento, ehEdicao);
      this._configurarEventListenersModal(this.modalInstance);
    }
  }

  _gerarHtmlModalOtimizado(titulo, dataInicial, dadosEvento, ehEdicao) {
    return `
      <div class="modal-content-optimized">
        ${this._gerarConteudoModal(titulo, dataInicial, dadosEvento, ehEdicao)}
      </div>
    `;
  }

  _gerarConteudoModal(titulo, dataInicial, dadosEvento, ehEdicao) {
    const tiposHtml = this.config.tipos.map(tipo => 
      `<option value="${tipo.value}" ${dadosEvento?.tipo === tipo.value ? 'selected' : ''}>${tipo.icon} ${tipo.label}</option>`
    ).join('');
    
    const participantes = this.state.participantesCache || this.config.participantesBiapoFallback;
    const participantesHtml = participantes.map(pessoa => {
      const selecionado = this.state.participantesSelecionados.includes(pessoa) || 
                         dadosEvento?.pessoas?.includes(pessoa) || 
                         dadosEvento?.participantes?.includes(pessoa);
      
      return `
        <label class="participant-label">
          <input type="checkbox" name="participantes" value="${pessoa}" ${selecionado ? 'checked' : ''}>
          <span>${pessoa}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="modal-header-optimized">
        <div>
          <h3>${titulo}</h3>
          <p>${ehEdicao ? `Editando: "${dadosEvento?.titulo || 'Evento'}"` : 'Criando novo evento'} | v${this.config.versao}</p>
        </div>
        <button onclick="OptimizedEvents.fecharModal()" class="modal-close-btn">&times;</button>
      </div>
      
      <form id="formEventoOpt" class="modal-form-optimized">
        <div class="form-grid">
          <div class="form-group">
            <label for="eventoTituloOpt">📝 Título do Evento *</label>
            <input type="text" id="eventoTituloOpt" required 
                   value="${dadosEvento?.titulo || ''}"
                   placeholder="Ex: Reunião de planejamento semanal"
                   class="form-input-optimized">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="eventoTipoOpt">📂 Tipo *</label>
              <select id="eventoTipoOpt" required class="form-input-optimized">
                ${tiposHtml}
              </select>
            </div>
            
            <div class="form-group">
              <label for="eventoDataOpt">📅 Data *</label>
              <input type="date" id="eventoDataOpt" required 
                     value="${dadosEvento?.data || dataInicial}"
                     class="form-input-optimized">
            </div>
          </div>
          
          <div class="horarios-section">
            <h4>🕐 Horários</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="eventoHorarioInicioOpt">Início</label>
                <input type="time" id="eventoHorarioInicioOpt" 
                       value="${dadosEvento?.horarioInicio || dadosEvento?.horario || ''}"
                       class="form-input-optimized">
              </div>
              
              <div class="form-group">
                <label for="eventoHorarioFimOpt">Fim</label>
                <input type="time" id="eventoHorarioFimOpt" 
                       value="${dadosEvento?.horarioFim || ''}"
                       class="form-input-optimized">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="eventoDescricaoOpt">📄 Descrição</label>
            <textarea id="eventoDescricaoOpt" rows="3" 
                      placeholder="Descreva os detalhes do evento..."
                      class="form-input-optimized">${dadosEvento?.descricao || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label>👥 Participantes BIAPO (${participantes.length} usuários)</label>
            <div class="participants-grid">
              ${participantesHtml}
            </div>
          </div>
          
          <div class="form-group">
            <label for="eventoLocalOpt">📍 Local</label>
            <input type="text" id="eventoLocalOpt" 
                   value="${dadosEvento?.local || ''}"
                   placeholder="Ex: Sala de reuniões A1, Online (Teams)"
                   class="form-input-optimized">
          </div>
        </div>
      </form>
      
      <div class="modal-footer-optimized">
        <button type="button" onclick="OptimizedEvents.fecharModal()" class="btn-secondary">
          ❌ Cancelar
        </button>
        
        ${ehEdicao ? `
          <button type="button" onclick="OptimizedEvents.confirmarExclusao(${dadosEvento.id})" class="btn-danger">
            🗑️ Excluir
          </button>
        ` : ''}
        
        <button type="button" onclick="OptimizedEvents._submeterFormulario()" class="btn-primary">
          ${ehEdicao ? '✅ Salvar Alterações' : '📅 Criar Evento'}
        </button>
      </div>
    `;
  }

  async _submeterFormulario() {
    const startTime = performance.now();
    
    try {
      const titulo = document.getElementById('eventoTituloOpt')?.value?.trim();
      const tipo = document.getElementById('eventoTipoOpt')?.value;
      const data = document.getElementById('eventoDataOpt')?.value;
      const descricao = document.getElementById('eventoDescricaoOpt')?.value?.trim() || '';
      const local = document.getElementById('eventoLocalOpt')?.value?.trim() || '';
      const horarioInicio = document.getElementById('eventoHorarioInicioOpt')?.value || null;
      const horarioFim = document.getElementById('eventoHorarioFimOpt')?.value || null;
      
      if (!this._validarCamposObrigatorios(titulo, tipo, data)) {
        return;
      }
      
      const participantesCheckboxes = document.querySelectorAll('input[name="participantes"]:checked');
      const participantes = Array.from(participantesCheckboxes).map(cb => cb.value);
      
      const dadosEvento = {
        titulo,
        tipo,
        data,
        descricao,
        local,
        horarioInicio,
        horarioFim,
        participantes,
        status: 'agendado',
        criadoPor: this._obterUsuarioAtual(),
        dataCriacao: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      };
      
      if (this.state.modoEdicao && this.state.eventoEditando) {
        dadosEvento.id = this.state.eventoEditando;
      }
      
      await this._salvarEvento(dadosEvento);
      
      const endTime = performance.now();
      this.state.performanceMetrics.submitTimes.push(endTime - startTime);
      this._updateAvgSubmitTime();
      
      this.fecharModal();
      
    } catch (error) {
      console.error('❌ Erro ao submeter formulário:', error);
      this._mostrarNotificacao('Erro interno ao salvar evento', 'error');
    }
  }

  async _salvarEvento(dadosEvento) {
    try {
      if (this._verificarApp() && typeof App.criarEvento === 'function') {
        if (this.state.modoEdicao) {
          await App.editarEvento(this.state.eventoEditando, dadosEvento);
          this._mostrarNotificacao('✅ Evento atualizado com sucesso!', 'success');
        } else {
          await App.criarEvento(dadosEvento);
          this._mostrarNotificacao('✅ Evento criado com sucesso!', 'success');
        }
        
        await this._sincronizarComApp();
      } else {
        this._salvarEventoLocal(dadosEvento);
        this._mostrarNotificacao('✅ Evento salvo localmente!', 'success');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar evento:', error);
      throw error;
    }
  }

  _validarCamposObrigatorios(titulo, tipo, data) {
    if (!titulo) {
      this._mostrarNotificacao('Título do evento é obrigatório', 'error');
      document.getElementById('eventoTituloOpt')?.focus();
      return false;
    }
    
    if (!tipo) {
      this._mostrarNotificacao('Tipo do evento é obrigatório', 'error');
      document.getElementById('eventoTipoOpt')?.focus();
      return false;
    }
    
    if (!data) {
      this._mostrarNotificacao('Data do evento é obrigatória', 'error');
      document.getElementById('eventoDataOpt')?.focus();
      return false;
    }
    
    return true;
  }

  fecharModal() {
    try {
      this._aplicarAnimacaoSaida();
      
      setTimeout(() => {
        this._removerModal();
        this.state.modalAtivo = false;
        this.state.eventoEditando = null;
        this.state.modoEdicao = false;
        this.state.eventoOriginal = null;
        this.state.participantesSelecionados = [];
        this.modalInstance = null;
      }, 300);
      
    } catch (error) {
      console.error('❌ Erro ao fechar modal:', error);
    }
  }

  _aplicarAnimacaoEntrada(modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    requestAnimationFrame(() => {
      modal.style.transition = 'all 0.3s ease';
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });
  }

  _aplicarAnimacaoSaida() {
    if (this.modalInstance) {
      this.modalInstance.style.opacity = '0';
      this.modalInstance.style.transform = 'scale(0.9)';
    }
  }

  _configurarEventListenersModal(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.fecharModal();
      }
    });
  }

  _removerModal() {
    const modais = document.querySelectorAll('#modalEventoOptimizado, .modal-optimized');
    modais.forEach(modal => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
  }

  _verificarAuth() {
    return typeof Auth !== 'undefined' && Auth.listarUsuarios;
  }

  _verificarApp() {
    return typeof App !== 'undefined';
  }

  _verificarPermissoes() {
    try {
      if (this._verificarApp() && typeof App.podeEditar === 'function') {
        return App.podeEditar();
      }
      return !this.state.modoAnonimo;
    } catch (error) {
      return false;
    }
  }

  async _verificarPermissoesEdicao(item) {
    const cacheKey = `perm_${item.id}`;
    
    if (this.state.permissoesCache.has(cacheKey)) {
      return this.state.permissoesCache.get(cacheKey);
    }

    try {
      let resultado;
      
      if (this._verificarApp() && typeof App._verificarPermissoesEdicao === 'function') {
        resultado = App._verificarPermissoesEdicao(item, 'evento');
      } else {
        resultado = this._verificarPermissoesLocal(item);
      }
      
      this.state.permissoesCache.set(cacheKey, resultado);
      
      setTimeout(() => {
        this.state.permissoesCache.delete(cacheKey);
      }, 300000);
      
      return resultado;
      
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      return { 
        permitido: false, 
        motivo: 'Erro ao verificar permissões de edição' 
      };
    }
  }

  _buscarEvento(id) {
    try {
      if (this._verificarApp() && typeof App._buscarEvento === 'function') {
        return App._buscarEvento(id);
      }
      
      if (typeof window.eventos !== 'undefined' && Array.isArray(window.eventos)) {
        return window.eventos.find(e => e.id == id);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar evento:', error);
      return null;
    }
  }

  _obterUsuarioAtual() {
    try {
      if (this._verificarApp() && App.usuarioAtual) {
        return App.usuarioAtual.email || App.usuarioAtual.displayName || 'Sistema';
      }
      
      if (this._verificarAuth() && typeof Auth.obterUsuario === 'function') {
        const usuario = Auth.obterUsuario();
        return usuario?.email || usuario?.displayName || 'Sistema';
      }
      
      return 'Sistema';
    } catch (error) {
      return 'Sistema';
    }
  }

  _mostrarNotificacao(mensagem, tipo = 'info') {
    try {
      if (typeof Notifications !== 'undefined') {
        switch (tipo) {
          case 'success':
            if (Notifications.success) Notifications.success(mensagem);
            break;
          case 'error':
            if (Notifications.error) Notifications.error(mensagem);
            break;
          case 'warning':
            if (Notifications.warning) Notifications.warning(mensagem);
            break;
          default:
            if (Notifications.info) Notifications.info(mensagem);
        }
      } else {
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
      }
    } catch (error) {
      console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    }
  }

  _addToModalHistory(evento) {
    this.state.modalHistory.unshift({
      evento: { ...evento },
      timestamp: Date.now(),
      acao: 'edicao'
    });
    
    if (this.state.modalHistory.length > this.config.performance.maxModalHistory) {
      this.state.modalHistory.pop();
    }
  }

  _updateAvgModalOpenTime() {
    const times = this.state.performanceMetrics.modalOpenTimes;
    this.state.performanceMetrics.avgModalOpenTime = 
      times.reduce((a, b) => a + b, 0) / times.length;
  }

  _updateAvgSubmitTime() {
    const times = this.state.performanceMetrics.submitTimes;
    this.state.performanceMetrics.avgSubmitTime = 
      times.reduce((a, b) => a + b, 0) / times.length;
  }

  async _sincronizarComApp() {
    try {
      if (this._verificarApp() && typeof App._salvarDadosUnificados === 'function') {
        await App._salvarDadosUnificados();
      }
    } catch (error) {
      console.warn('⚠️ Erro na sincronização:', error);
    }
  }

  getStatus() {
    return {
      versao: this.config.versao,
      modalAtivo: this.state.modalAtivo,
      eventoEditando: this.state.eventoEditando,
      modoEdicao: this.state.modoEdicao,
      performanceMetrics: this.state.performanceMetrics,
      cacheStats: {
        participantes: !!this.state.participantesCache,
        permissoes: this.state.permissoesCache.size
      }
    };
  }
}

const optimizedEvents = new OptimizedEvents();

if (typeof window !== 'undefined') {
  optimizedEvents.init();
  window.OptimizedEvents = optimizedEvents;
  window.Events = optimizedEvents;
}

export default OptimizedEvents;
