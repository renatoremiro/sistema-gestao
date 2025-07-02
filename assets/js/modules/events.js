/* ========== 📅 SISTEMA DE GESTÃO DE EVENTOS v6.2 ========== */

const Events = {
    // ✅ CONFIGURAÇÕES
    config: {
        TIPOS_EVENTO: {
            'reuniao': { nome: 'Reunião', icone: '📅', cor: '#3b82f6' },
            'entrega': { nome: 'Entrega', icone: '📦', cor: '#10b981' },
            'prazo': { nome: 'Prazo', icone: '⏰', cor: '#ef4444' },
            'marco': { nome: 'Marco', icone: '🎯', cor: '#8b5cf6' },
            'outro': { nome: 'Outro', icone: '📌', cor: '#6b7280' }
        },
        RECORRENCIA_TIPOS: {
            'diaria': { nome: 'Diária', dias: 1 },
            'semanal': { nome: 'Semanal', dias: 7 },
            'quinzenal': { nome: 'Quinzenal', dias: 14 },
            'mensal': { nome: 'Mensal', dias: 30 },
            'bimestral': { nome: 'Bimestral', dias: 60 }
        },
        MAX_PARTICIPANTES: 20,
        TEMPO_AUTO_SAVE: 2000
    },

    // ✅ ESTADO DO SISTEMA
    state: {
        modalAtivo: null,
        eventoEditando: null,
        participantesSelecionados: new Set(),
        autoSaveTimeout: null,
        eventosPaginacao: {
            pagina: 1,
            itensPorPagina: 10,
            total: 0
        }
    },

    // ✅ INICIALIZAR SISTEMA DE EVENTOS
    init() {
        console.log('📅 Inicializando sistema de eventos...');
        
        this._configurarEventosGlobais();
        this._sincronizarComCalendar();
        
        console.log('✅ Sistema de eventos inicializado');
    },

    // ✅ MOSTRAR MODAL NOVO EVENTO
    mostrarNovoEvento(dataPreSelecionada = null) {
        this._fecharModaisAtivos();
        
        this.state.eventoEditando = null;
        this.state.participantesSelecionados.clear();
        
        const modal = this._criarModalEvento(dataPreSelecionada);
        this.state.modalAtivo = modal;
        document.body.appendChild(modal);
        
        // Focar no primeiro campo
        setTimeout(() => {
            const primeiroInput = modal.querySelector('input, select');
            if (primeiroInput) primeiroInput.focus();
        }, 100);
    },

    // ✅ EDITAR EVENTO EXISTENTE
    editarEvento(eventoId) {
        if (typeof App === 'undefined' || !App.dados) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Sistema não inicializado');
            }
            return;
        }

        const evento = App.dados.eventos.find(e => e.id === eventoId);
        if (!evento) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Evento não encontrado');
            }
            return;
        }

        this._fecharModaisAtivos();
        
        this.state.eventoEditando = eventoId;
        this.state.participantesSelecionados = new Set(evento.pessoas || []);
        
        const modal = this._criarModalEvento(null, evento);
        this.state.modalAtivo = modal;
        document.body.appendChild(modal);
    },

    // ✅ CRIAR MODAL DE EVENTO
    _criarModalEvento(dataPreSelecionada = null, eventoExistente = null) {
        const isEdicao = !!eventoExistente;
        const titulo = isEdicao ? 'Editar Evento' : 'Novo Evento';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'modalEvento';
        
        // Data padrão
        const dataDefault = dataPreSelecionada || 
                          eventoExistente?.data || 
                          new Date().toISOString().split('T')[0];

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 650px;">
                <h3 style="margin-bottom: 24px;">${titulo}</h3>
                
                <div class="form-group">
                    <label>Tipo de Evento <span style="color: #ef4444;">*</span></label>
                    <select id="eventoTipo" required>
                        ${Object.entries(this.config.TIPOS_EVENTO).map(([key, tipo]) => `
                            <option value="${key}" ${eventoExistente?.tipo === key ? 'selected' : ''}>
                                ${tipo.icone} ${tipo.nome}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Título <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="eventoTitulo" placeholder="Digite o título do evento" 
                           value="${eventoExistente?.titulo || ''}" required>
                    <span class="error-message hidden" id="eventoTituloError">Título é obrigatório</span>
                </div>
                
                <div class="form-group">
                    <label>Data <span style="color: #ef4444;">*</span></label>
                    <input type="date" id="eventoData" value="${dataDefault}" required>
                    <span class="error-message hidden" id="eventoDataError">Data é obrigatória</span>
                </div>
                
                <div class="form-group">
                    <label>Horário</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="font-size: 12px; margin-bottom: 4px;">Início</label>
                            <input type="time" id="eventoHorarioInicio" 
                                   value="${eventoExistente?.horarioInicio || '09:00'}">
                        </div>
                        <div>
                            <label style="font-size: 12px; margin-bottom: 4px;">Fim (opcional)</label>
                            <input type="time" id="eventoHorarioFim" 
                                   value="${eventoExistente?.horarioFim || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Participantes</label>
                    <select id="eventoParticipantes" onchange="Events._adicionarParticipante()">
                        <option value="">Selecionar pessoa...</option>
                        ${this._obterOpcoesParticipantes()}
                    </select>
                    <div id="participantesSelecionados" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${this._renderizarParticipantesSelecionados()}
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="eventoDescricao" rows="3" placeholder="Descrição opcional do evento...">${eventoExistente?.descricao || ''}</textarea>
                </div>
                
                <!-- Seção de Recorrência -->
                <div class="form-group">
                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="Events._toggleRecorrencia()">
                        <input type="checkbox" id="eventoRecorrencia" ${eventoExistente?.recorrente ? 'checked' : ''}>
                        <label style="cursor: pointer;">🔄 Evento recorrente</label>
                    </div>
                    
                    <div id="recorrenciaContainer" style="display: ${eventoExistente?.recorrente ? 'block' : 'none'}; margin-top: 12px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; margin-bottom: 4px;">Tipo de Recorrência</label>
                                <select id="tipoRecorrencia">
                                    ${Object.entries(this.config.RECORRENCIA_TIPOS).map(([key, tipo]) => `
                                        <option value="${key}">${tipo.nome}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; margin-bottom: 4px;">Quantas vezes?</label>
                                <input type="number" id="quantidadeRecorrencia" min="1" max="52" value="4" placeholder="Repetições">
                            </div>
                        </div>
                        <div id="infoRecorrencia" style="margin-top: 8px; padding: 8px; background: #dbeafe; border-radius: 4px; font-size: 12px; color: #1e40af;">
                            ℹ️ Este evento será criado 4 vezes
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="Events.fecharModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="Events.salvarEvento()" id="btnSalvarEvento">
                        ${isEdicao ? '✏️ Atualizar' : '💾 Salvar'} Evento
                    </button>
                </div>
            </div>
        `;
        
        // Configurar eventos específicos do modal
        this._configurarEventosModal(modal);
        
        return modal;
    },

    // ✅ SALVAR EVENTO (CRIAR OU EDITAR)
    salvarEvento() {
        const dadosEvento = this._coletarDadosFormulario();
        
        if (!this._validarDadosEvento(dadosEvento)) {
            return;
        }

        const isEdicao = !!this.state.eventoEditando;
        const isRecorrente = document.getElementById('eventoRecorrencia').checked;

        if (isEdicao) {
            this._atualizarEventoExistente(dadosEvento);
        } else if (isRecorrente && !isEdicao) {
            this._criarEventosRecorrentes(dadosEvento);
        } else {
            this._criarEventoUnico(dadosEvento);
        }
    },

    // ✅ EXCLUIR EVENTO
    excluirEvento(eventoId) {
        if (typeof Notifications !== 'undefined' && typeof Notifications.confirmar === 'function') {
            Notifications.confirmar(
                'Confirmar Exclusão',
                'Deseja realmente excluir este evento?',
                (confirmado) => {
                    if (confirmado) {
                        this._executarExclusaoEvento(eventoId);
                    }
                }
            );
        } else {
            if (confirm('Deseja realmente excluir este evento?')) {
                this._executarExclusaoEvento(eventoId);
            }
        }
    },

    // ✅ DUPLICAR EVENTO
    duplicarEvento(eventoId) {
        if (typeof App === 'undefined' || !App.dados) return;

        const evento = App.dados.eventos.find(e => e.id === eventoId);
        if (!evento) return;

        const novoEvento = {
            ...evento,
            id: Date.now(),
            titulo: `${evento.titulo} (Cópia)`,
            data: new Date().toISOString().split('T')[0] // Data de hoje
        };

        App.dados.eventos.push(novoEvento);
        
        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Evento duplicado com sucesso!');
            }
            this._atualizarCalendario();
        });
    },

    // ✅ BUSCAR EVENTOS
    buscarEventos(termo = '', filtros = {}) {
        if (typeof App === 'undefined' || !App.dados || !App.dados.eventos) {
            return [];
        }

        let eventos = App.dados.eventos;

        // Filtro por termo
        if (termo.trim()) {
            const termoLower = termo.toLowerCase();
            eventos = eventos.filter(evento =>
                evento.titulo.toLowerCase().includes(termoLower) ||
                evento.descricao?.toLowerCase().includes(termoLower) ||
                evento.pessoas?.some(pessoa => pessoa.toLowerCase().includes(termoLower))
            );
        }

        // Filtros específicos
        if (filtros.tipo) {
            eventos = eventos.filter(evento => evento.tipo === filtros.tipo);
        }

        if (filtros.dataInicio) {
            eventos = eventos.filter(evento => evento.data >= filtros.dataInicio);
        }

        if (filtros.dataFim) {
            eventos = eventos.filter(evento => evento.data <= filtros.dataFim);
        }

        if (filtros.pessoa) {
            eventos = eventos.filter(evento => 
                evento.pessoas?.includes(filtros.pessoa)
            );
        }

        // Ordenar por data
        return eventos.sort((a, b) => {
            const dataA = new Date(a.data + 'T' + (a.horarioInicio || '00:00'));
            const dataB = new Date(b.data + 'T' + (b.horarioInicio || '00:00'));
            return dataA - dataB;
        });
    },

    // ✅ LISTAR PRÓXIMOS EVENTOS
    obterProximosEventos(limite = 5) {
        const hoje = new Date().toISOString().split('T')[0];
        const eventos = this.buscarEventos('', { dataInicio: hoje });
        return eventos.slice(0, limite);
    },

    // ✅ OBTER ESTATÍSTICAS DE EVENTOS
    obterEstatisticas() {
        if (typeof App === 'undefined' || !App.dados || !App.dados.eventos) {
            return { total: 0, porTipo: {}, porMes: {}, proximoEvento: null };
        }

        const eventos = App.dados.eventos;
        const hoje = new Date().toISOString().split('T')[0];

        const stats = {
            total: eventos.length,
            porTipo: {},
            porMes: {},
            proximoEvento: null,
            eventosPassados: 0,
            eventosFuturos: 0
        };

        // Contar por tipo
        eventos.forEach(evento => {
            // Por tipo
            if (!stats.porTipo[evento.tipo]) {
                stats.porTipo[evento.tipo] = 0;
            }
            stats.porTipo[evento.tipo]++;

            // Por mês
            const mes = evento.data.substring(0, 7); // YYYY-MM
            if (!stats.porMes[mes]) {
                stats.porMes[mes] = 0;
            }
            stats.porMes[mes]++;

            // Passados vs futuros
            if (evento.data < hoje) {
                stats.eventosPassados++;
            } else {
                stats.eventosFuturos++;
            }
        });

        // Próximo evento
        const proximosEventos = this.obterProximosEventos(1);
        if (proximosEventos.length > 0) {
            stats.proximoEvento = proximosEventos[0];
        }

        return stats;
    },

    // ✅ EXPORTAR EVENTOS
    exportarEventos(formato = 'json', filtros = {}) {
        const eventos = this.buscarEventos('', filtros);
        
        if (formato === 'csv') {
            return this._exportarCSV(eventos);
        } else {
            return this._exportarJSON(eventos);
        }
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        this._fecharModaisAtivos();
        this.state.eventoEditando = null;
        this.state.participantesSelecionados.clear();
    },

    // ========== MÉTODOS PRIVADOS ==========

    // ✅ CONFIGURAR EVENTOS GLOBAIS
    _configurarEventosGlobais() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.modalAtivo) {
                this.fecharModal();
            }
        });

        // Auto-save nos campos (debounced)
        document.addEventListener('input', (e) => {
            if (e.target.closest('#modalEvento')) {
                clearTimeout(this.state.autoSaveTimeout);
                this.state.autoSaveTimeout = setTimeout(() => {
                    this._salvarRascunho();
                }, this.config.TEMPO_AUTO_SAVE);
            }
        });
    },

    // ✅ SINCRONIZAR COM CALENDÁRIO
    _sincronizarComCalendar() {
        if (typeof Calendar !== 'undefined') {
            // Registrar Events no Calendar para integração
            Calendar._integracaoEvents = this;
        }
    },

    // ✅ COLETAR DADOS DO FORMULÁRIO
    _coletarDadosFormulario() {
        return {
            id: this.state.eventoEditando || Date.now(),
            titulo: document.getElementById('eventoTitulo').value.trim(),
            tipo: document.getElementById('eventoTipo').value,
            data: document.getElementById('eventoData').value,
            horarioInicio: document.getElementById('eventoHorarioInicio').value,
            horarioFim: document.getElementById('eventoHorarioFim').value,
            pessoas: Array.from(this.state.participantesSelecionados),
            descricao: document.getElementById('eventoDescricao').value.trim(),
            recorrente: document.getElementById('eventoRecorrencia').checked,
            tipoRecorrencia: document.getElementById('tipoRecorrencia').value,
            quantidadeRecorrencia: parseInt(document.getElementById('quantidadeRecorrencia').value) || 1
        };
    },

    // ✅ VALIDAR DADOS DO EVENTO
    _validarDadosEvento(dados) {
        let valido = true;

        // Limpar erros anteriores
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Validar título
        if (!dados.titulo) {
            this._mostrarErroValidacao('eventoTitulo', 'eventoTituloError', 'Título é obrigatório');
            valido = false;
        }

        // Validar data
        if (!dados.data) {
            this._mostrarErroValidacao('eventoData', 'eventoDataError', 'Data é obrigatória');
            valido = false;
        } else if (typeof Validation !== 'undefined' && !Validation.isValidDate(dados.data)) {
            this._mostrarErroValidacao('eventoData', 'eventoDataError', 'Data inválida');
            valido = false;
        }

        // Validar horários se fornecidos
        if (dados.horarioInicio && dados.horarioFim) {
            if (dados.horarioInicio >= dados.horarioFim) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Horário de fim deve ser posterior ao início');
                }
            }
        }

        if (!valido && typeof Notifications !== 'undefined') {
            Notifications.error('Corrija os campos obrigatórios');
        }

        return valido;
    },

    // ✅ MOSTRAR ERRO DE VALIDAÇÃO
    _mostrarErroValidacao(inputId, errorId, mensagem) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        
        if (input) input.classList.add('input-error');
        if (error) {
            error.textContent = mensagem;
            error.classList.remove('hidden');
        }
    },

    // ✅ CRIAR EVENTO ÚNICO
    _criarEventoUnico(dados) {
        if (typeof App === 'undefined' || !App.dados) return;

        const evento = {
            id: dados.id,
            titulo: dados.titulo,
            tipo: dados.tipo,
            data: dados.data,
            horarioInicio: dados.horarioInicio,
            horarioFim: dados.horarioFim,
            pessoas: dados.pessoas,
            descricao: dados.descricao
        };

        App.dados.eventos.push(evento);
        
        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Evento criado com sucesso!');
            }
            this.fecharModal();
            this._atualizarCalendario();
        });
    },

    // ✅ CRIAR EVENTOS RECORRENTES
    _criarEventosRecorrentes(dados) {
        if (typeof App === 'undefined' || !App.dados) return;

        const tipoRecorrencia = this.config.RECORRENCIA_TIPOS[dados.tipoRecorrencia];
        const eventos = [];
        
        for (let i = 0; i < dados.quantidadeRecorrencia; i++) {
            const dataEvento = new Date(dados.data);
            dataEvento.setDate(dataEvento.getDate() + (i * tipoRecorrencia.dias));
            
            const evento = {
                id: dados.id + i,
                titulo: dados.titulo,
                tipo: dados.tipo,
                data: dataEvento.toISOString().split('T')[0],
                horarioInicio: dados.horarioInicio,
                horarioFim: dados.horarioFim,
                pessoas: dados.pessoas,
                descricao: dados.descricao,
                recorrente: true,
                serieRecorrencia: dados.id
            };
            
            eventos.push(evento);
        }

        App.dados.eventos.push(...eventos);
        
        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`${eventos.length} eventos recorrentes criados!`);
            }
            this.fecharModal();
            this._atualizarCalendario();
        });
    },

    // ✅ ATUALIZAR EVENTO EXISTENTE
    _atualizarEventoExistente(dados) {
        if (typeof App === 'undefined' || !App.dados) return;

        const index = App.dados.eventos.findIndex(e => e.id === this.state.eventoEditando);
        if (index !== -1) {
            App.dados.eventos[index] = {
                ...App.dados.eventos[index],
                titulo: dados.titulo,
                tipo: dados.tipo,
                data: dados.data,
                horarioInicio: dados.horarioInicio,
                horarioFim: dados.horarioFim,
                pessoas: dados.pessoas,
                descricao: dados.descricao
            };

            this._salvarComFeedback(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('Evento atualizado com sucesso!');
                }
                this.fecharModal();
                this._atualizarCalendario();
            });
        }
    },

    // ✅ EXECUTAR EXCLUSÃO DE EVENTO
    _executarExclusaoEvento(eventoId) {
        if (typeof App === 'undefined' || !App.dados) return;

        const index = App.dados.eventos.findIndex(e => e.id === eventoId);
        if (index !== -1) {
            App.dados.eventos.splice(index, 1);
            
            this._salvarComFeedback(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('Evento excluído com sucesso!');
                }
                this._atualizarCalendario();
            });
        }
    },

    // ✅ SALVAR COM FEEDBACK
    _salvarComFeedback(callback) {
        if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
            Persistence.salvarDadosCritico()
                .then(callback)
                .catch(() => {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Erro ao salvar - operação cancelada');
                    }
                });
        } else {
            callback();
        }
    },

    // ✅ ATUALIZAR CALENDÁRIO
    _atualizarCalendario() {
        if (typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function') {
            Calendar.gerar();
        }
        
        if (typeof App !== 'undefined' && typeof App.atualizarEstatisticas === 'function') {
            App.atualizarEstatisticas();
        }
    },

    // ✅ OBTER OPÇÕES DE PARTICIPANTES
    _obterOpcoesParticipantes() {
        if (typeof App === 'undefined' || !App.dados) return '';
        
        const pessoas = [];
        
        // Adicionar pessoas das áreas
        if (App.dados.areas) {
            Object.values(App.dados.areas).forEach(area => {
                if (area.equipe) {
                    area.equipe.forEach(membro => {
                        if (membro.nome && !pessoas.includes(membro.nome)) {
                            pessoas.push(membro.nome);
                        }
                    });
                }
            });
        }
        
        // Adicionar pessoas das agendas
        if (App.dados.agendas) {
            Object.keys(App.dados.agendas).forEach(pessoa => {
                if (!pessoas.includes(pessoa)) {
                    pessoas.push(pessoa);
                }
            });
        }
        
        pessoas.sort();
        
        return pessoas.map(pessoa => 
            `<option value="${pessoa}">${pessoa}</option>`
        ).join('');
    },

    // ✅ ADICIONAR PARTICIPANTE
    _adicionarParticipante() {
        const select = document.getElementById('eventoParticipantes');
        const pessoa = select.value;
        
        if (pessoa && !this.state.participantesSelecionados.has(pessoa)) {
            if (this.state.participantesSelecionados.size >= this.config.MAX_PARTICIPANTES) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning(`Máximo de ${this.config.MAX_PARTICIPANTES} participantes`);
                }
                return;
            }
            
            this.state.participantesSelecionados.add(pessoa);
            this._atualizarDisplayParticipantes();
            select.value = '';
        }
    },

    // ✅ REMOVER PARTICIPANTE
    _removerParticipante(pessoa) {
        this.state.participantesSelecionados.delete(pessoa);
        this._atualizarDisplayParticipantes();
    },

    // ✅ RENDERIZAR PARTICIPANTES SELECIONADOS
    _renderizarParticipantesSelecionados() {
        return Array.from(this.state.participantesSelecionados).map(pessoa => `
            <span style="display: inline-flex; align-items: center; gap: 4px; background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                ${pessoa}
                <span onclick="Events._removerParticipante('${pessoa}')" style="cursor: pointer; margin-left: 4px;">×</span>
            </span>
        `).join('');
    },

    // ✅ ATUALIZAR DISPLAY DE PARTICIPANTES
    _atualizarDisplayParticipantes() {
        const container = document.getElementById('participantesSelecionados');
        if (container) {
            container.innerHTML = this._renderizarParticipantesSelecionados();
        }
    },

    // ✅ TOGGLE RECORRÊNCIA
    _toggleRecorrencia() {
        const checkbox = document.getElementById('eventoRecorrencia');
        const container = document.getElementById('recorrenciaContainer');
        
        if (container) {
            container.style.display = checkbox.checked ? 'block' : 'none';
            
            if (checkbox.checked) {
                this._atualizarInfoRecorrencia();
            }
        }
    },

    // ✅ ATUALIZAR INFO DE RECORRÊNCIA
    _atualizarInfoRecorrencia() {
        const tipo = document.getElementById('tipoRecorrencia').value;
        const quantidade = document.getElementById('quantidadeRecorrencia').value || 4;
        const tipoInfo = this.config.RECORRENCIA_TIPOS[tipo];
        
        const info = document.getElementById('infoRecorrencia');
        if (info && tipoInfo) {
            info.textContent = `ℹ️ Este evento será criado ${quantidade} vezes (${tipoInfo.nome.toLowerCase()})`;
        }
    },

    // ✅ CONFIGURAR EVENTOS DO MODAL
    _configurarEventosModal(modal) {
        // Atualizar info de recorrência quando mudar
        modal.querySelector('#tipoRecorrencia')?.addEventListener('change', () => {
            this._atualizarInfoRecorrencia();
        });
        
        modal.querySelector('#quantidadeRecorrencia')?.addEventListener('input', () => {
            this._atualizarInfoRecorrencia();
        });
        
        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });
    },

    // ✅ SALVAR RASCUNHO (AUTO-SAVE)
    _salvarRascunho() {
        if (!this.state.modalAtivo) return;
        
        try {
            const dados = this._coletarDadosFormulario();
            sessionStorage.setItem('eventoRascunho', JSON.stringify(dados));
        } catch (error) {
            console.warn('Erro ao salvar rascunho:', error);
        }
    },

    // ✅ EXPORTAR JSON
    _exportarJSON(eventos) {
        const dados = {
            exportadoEm: new Date().toISOString(),
            total: eventos.length,
            eventos: eventos
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eventos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Eventos exportados em JSON!');
        }
    },

    // ✅ EXPORTAR CSV
    _exportarCSV(eventos) {
        const headers = ['ID', 'Título', 'Tipo', 'Data', 'Início', 'Fim', 'Participantes', 'Descrição'];
        const csvContent = [
            headers.join(','),
            ...eventos.map(evento => [
                evento.id,
                `"${evento.titulo}"`,
                evento.tipo,
                evento.data,
                evento.horarioInicio || '',
                evento.horarioFim || '',
                `"${(evento.pessoas || []).join('; ')}"`,
                `"${(evento.descricao || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Eventos exportados em CSV!');
        }
    },

    // ✅ FECHAR MODAIS ATIVOS
    _fecharModaisAtivos() {
        if (this.state.modalAtivo && this.state.modalAtivo.parentElement) {
            this.state.modalAtivo.parentElement.removeChild(this.state.modalAtivo);
            this.state.modalAtivo = null;
        }
        
        // Remover qualquer modal órfão
        document.querySelectorAll('#modalEvento').forEach(modal => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        });
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            modalAtivo: !!this.state.modalAtivo,
            eventoEditando: this.state.eventoEditando,
            participantesSelecionados: this.state.participantesSelecionados.size,
            totalEventos: (typeof App !== 'undefined' && App.dados) ? App.dados.eventos.length : 0,
            estatisticas: this.obterEstatisticas()
        };
    }
};

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
window.mostrarNovoEvento = (data) => Events.mostrarNovoEvento(data);
window.editarEvento = (id) => Events.editarEvento(id);
window.excluirEvento = (id) => Events.excluirEvento(id);

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Events.init();
    }, 300);
});

console.log('📅 Sistema de Gestão de Eventos v6.2 carregado!');
