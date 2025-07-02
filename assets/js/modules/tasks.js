/* ========== 📝 SISTEMA DE GESTÃO DE TAREFAS v6.2 ========== */

const Tasks = {
    // ✅ CONFIGURAÇÕES
    config: {
        TIPOS_TAREFA: {
            'pessoal': { nome: 'Pessoal', icone: '👤', cor: '#8b5cf6' },
            'equipe': { nome: 'Equipe', icone: '👥', cor: '#3b82f6' },
            'projeto': { nome: 'Projeto', icone: '🎯', cor: '#10b981' },
            'urgente': { nome: 'Urgente', icone: '🚨', cor: '#ef4444' },
            'rotina': { nome: 'Rotina', icone: '🔄', cor: '#6b7280' }
        },
        PRIORIDADES: {
            'baixa': { nome: 'Baixa', valor: 1, cor: '#10b981' },
            'media': { nome: 'Média', valor: 2, cor: '#f59e0b' },
            'alta': { nome: 'Alta', valor: 3, cor: '#ef4444' },
            'critica': { nome: 'Crítica', valor: 4, cor: '#dc2626' }
        },
        STATUS: {
            'pendente': { nome: 'Pendente', icone: '⏳', cor: '#6b7280' },
            'andamento': { nome: 'Em Andamento', icone: '🔄', cor: '#3b82f6' },
            'revisao': { nome: 'Em Revisão', icone: '👀', cor: '#f59e0b' },
            'concluida': { nome: 'Concluída', icone: '✅', cor: '#10b981' },
            'cancelada': { nome: 'Cancelada', icone: '❌', cor: '#ef4444' },
            'bloqueada': { nome: 'Bloqueada', icone: '🔒', cor: '#8b5cf6' }
        },
        DIAS_SEMANA: {
            'segunda': 'Segunda-feira',
            'terca': 'Terça-feira', 
            'quarta': 'Quarta-feira',
            'quinta': 'Quinta-feira',
            'sexta': 'Sexta-feira',
            'sabado': 'Sábado',
            'domingo': 'Domingo'
        },
        MAX_SUBTAREFAS: 10,
        AUTO_SAVE_DELAY: 2000
    },

    // ✅ ESTADO DO SISTEMA
    state: {
        modalAtivo: null,
        tarefaEditando: null,
        filtroAtivo: 'todas',
        ordenacaoAtiva: 'prioridade',
        pessoaSelecionada: null,
        subtarefasTemp: [],
        dependenciasTemp: new Set(),
        autoSaveTimeout: null,
        paginacao: {
            pagina: 1,
            itensPorPagina: 20,
            total: 0
        }
    },

    // ✅ INICIALIZAR SISTEMA DE TAREFAS
    init() {
        console.log('📝 Inicializando sistema de tarefas...');
        
        this._configurarEventosGlobais();
        this._sincronizarComOutrosModulos();
        this._carregarTemplates();
        
        console.log('✅ Sistema de tarefas inicializado');
    },

    // ✅ MOSTRAR MODAL NOVA TAREFA
    mostrarNovaTarefa(tipo = 'pessoal', pessoa = null) {
        this._fecharModaisAtivos();
        
        this.state.tarefaEditando = null;
        this.state.subtarefasTemp = [];
        this.state.dependenciasTemp.clear();
        this.state.pessoaSelecionada = pessoa;
        
        const modal = this._criarModalTarefa(tipo);
        this.state.modalAtivo = modal;
        document.body.appendChild(modal);
        
        // Focar no primeiro campo
        setTimeout(() => {
            const primeiroInput = modal.querySelector('input[type="text"]');
            if (primeiroInput) primeiroInput.focus();
        }, 100);
    },

    // ✅ EDITAR TAREFA EXISTENTE
    editarTarefa(tarefaId) {
        const tarefa = this._buscarTarefaPorId(tarefaId);
        if (!tarefa) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Tarefa não encontrada');
            }
            return;
        }

        this._fecharModaisAtivos();
        
        this.state.tarefaEditando = tarefaId;
        this.state.subtarefasTemp = [...(tarefa.subtarefas || [])];
        this.state.dependenciasTemp = new Set(tarefa.dependencias || []);
        this.state.pessoaSelecionada = tarefa.responsavel;
        
        const modal = this._criarModalTarefa(tarefa.tipo, tarefa);
        this.state.modalAtivo = modal;
        document.body.appendChild(modal);
    },

    // ✅ CRIAR MODAL DE TAREFA
    _criarModalTarefa(tipoDefault = 'pessoal', tarefaExistente = null) {
        const isEdicao = !!tarefaExistente;
        const titulo = isEdicao ? 'Editar Tarefa' : 'Nova Tarefa';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'modalTarefa';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 750px;">
                <h3 style="margin-bottom: 24px;">${titulo}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Tipo de Tarefa <span style="color: #ef4444;">*</span></label>
                        <select id="tarefaTipo" required>
                            ${Object.entries(this.config.TIPOS_TAREFA).map(([key, tipo]) => `
                                <option value="${key}" ${(tarefaExistente?.tipo || tipoDefault) === key ? 'selected' : ''}>
                                    ${tipo.icone} ${tipo.nome}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Prioridade <span style="color: #ef4444;">*</span></label>
                        <select id="tarefaPrioridade" required>
                            ${Object.entries(this.config.PRIORIDADES).map(([key, prioridade]) => `
                                <option value="${key}" ${(tarefaExistente?.prioridade || 'media') === key ? 'selected' : ''}>
                                    ${prioridade.nome}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Título da Tarefa <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="tarefaTitulo" placeholder="Digite o título da tarefa" 
                           value="${tarefaExistente?.titulo || ''}" required>
                    <span class="error-message hidden" id="tarefaTituloError">Título é obrigatório</span>
                </div>
                
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="tarefaDescricao" rows="3" placeholder="Descreva a tarefa em detalhes...">${tarefaExistente?.descricao || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Responsável</label>
                        <select id="tarefaResponsavel">
                            <option value="">Selecionar pessoa...</option>
                            ${this._obterOpcoesResponsaveis(tarefaExistente?.responsavel)}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Status</label>
                        <select id="tarefaStatus">
                            ${Object.entries(this.config.STATUS).map(([key, status]) => `
                                <option value="${key}" ${(tarefaExistente?.status || 'pendente') === key ? 'selected' : ''}>
                                    ${status.icone} ${status.nome}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Progresso (%)</label>
                        <input type="range" id="tarefaProgresso" min="0" max="100" value="${tarefaExistente?.progresso || 0}" 
                               oninput="Tasks._atualizarDisplayProgresso(this.value)">
                        <div style="text-align: center; font-size: 12px; margin-top: 4px;">
                            <span id="progressoDisplay">${tarefaExistente?.progresso || 0}%</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Data de Início</label>
                        <input type="date" id="tarefaDataInicio" value="${tarefaExistente?.dataInicio || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>Prazo Final</label>
                        <input type="date" id="tarefaDataFim" value="${tarefaExistente?.dataFim || ''}">
                    </div>
                </div>
                
                <!-- Seção de Agenda Semanal -->
                <div class="form-group">
                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="Tasks._toggleAgendaSemanal()">
                        <input type="checkbox" id="tarefaAgendaSemanal" ${tarefaExistente?.agendaSemanal ? 'checked' : ''}>
                        <label style="cursor: pointer;">📅 Adicionar à agenda semanal</label>
                    </div>
                    
                    <div id="agendaSemanalContainer" style="display: ${tarefaExistente?.agendaSemanal ? 'block' : 'none'}; margin-top: 12px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; margin-bottom: 4px;">Dia da Semana</label>
                                <select id="tarefaDiaSemana">
                                    ${Object.entries(this.config.DIAS_SEMANA).map(([key, nome]) => `
                                        <option value="${key}" ${tarefaExistente?.diaSemana === key ? 'selected' : ''}>${nome}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; margin-bottom: 4px;">Horário</label>
                                <input type="time" id="tarefaHorario" value="${tarefaExistente?.horario || '09:00'}">
                            </div>
                            <div>
                                <label style="font-size: 12px; margin-bottom: 4px;">Duração (min)</label>
                                <input type="number" id="tarefaDuracao" min="15" max="480" step="15" value="${tarefaExistente?.duracao || 60}" placeholder="60">
                            </div>
                        </div>
                        <div style="margin-top: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                                <input type="checkbox" id="tarefaMostrarCalendario" ${tarefaExistente?.mostrarNoCalendario ? 'checked' : ''}>
                                Mostrar no calendário principal
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Seção de Subtarefas -->
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label>📋 Subtarefas (${this.state.subtarefasTemp.length}/${this.config.MAX_SUBTAREFAS})</label>
                        <button type="button" class="btn btn-sm btn-primary" onclick="Tasks._adicionarSubtarefa()" 
                                ${this.state.subtarefasTemp.length >= this.config.MAX_SUBTAREFAS ? 'disabled' : ''}>
                            + Adicionar
                        </button>
                    </div>
                    <div id="subtarefasContainer" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;">
                        ${this._renderizarSubtarefas()}
                    </div>
                </div>
                
                <!-- Seção de Dependências -->
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label>🔗 Dependências (${this.state.dependenciasTemp.size})</label>
                        <select id="seletorDependencias" onchange="Tasks._adicionarDependencia()">
                            <option value="">Selecionar tarefa...</option>
                            ${this._obterOpcoesDependencias()}
                        </select>
                    </div>
                    <div id="dependenciasContainer">
                        ${this._renderizarDependencias()}
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="Tasks.fecharModal()">
                        Cancelar
                    </button>
                    ${isEdicao ? `
                        <button class="btn btn-danger btn-sm" onclick="Tasks.excluirTarefa(${tarefaExistente.id})">
                            🗑️ Excluir
                        </button>
                        <button class="btn btn-primary" onclick="Tasks.salvarTarefa()" id="btnSalvarTarefa">
                            ✏️ Atualizar Tarefa
                        </button>
                    ` : `
                        <button class="btn btn-success btn-sm" onclick="Tasks._salvarComoTemplate()">
                            📁 Salvar Template
                        </button>
                        <button class="btn btn-primary" onclick="Tasks.salvarTarefa()" id="btnSalvarTarefa">
                            💾 Criar Tarefa
                        </button>
                    `}
                </div>
            </div>
        `;
        
        // Configurar eventos específicos do modal
        this._configurarEventosModal(modal);
        
        return modal;
    },

    // ✅ SALVAR TAREFA (CRIAR OU EDITAR)
    salvarTarefa() {
        const dadosTarefa = this._coletarDadosFormulario();
        
        if (!this._validarDadosTarefa(dadosTarefa)) {
            return;
        }

        const isEdicao = !!this.state.tarefaEditando;

        if (isEdicao) {
            this._atualizarTarefaExistente(dadosTarefa);
        } else {
            this._criarTarefaNova(dadosTarefa);
        }
    },

    // ✅ EXCLUIR TAREFA
    excluirTarefa(tarefaId) {
        if (typeof Notifications !== 'undefined' && typeof Notifications.confirmar === 'function') {
            Notifications.confirmar(
                'Confirmar Exclusão',
                'Deseja realmente excluir esta tarefa? Subtarefas também serão removidas.',
                (confirmado) => {
                    if (confirmado) {
                        this._executarExclusaoTarefa(tarefaId);
                    }
                }
            );
        } else {
            if (confirm('Deseja realmente excluir esta tarefa?')) {
                this._executarExclusaoTarefa(tarefaId);
            }
        }
    },

    // ✅ DUPLICAR TAREFA
    duplicarTarefa(tarefaId) {
        const tarefa = this._buscarTarefaPorId(tarefaId);
        if (!tarefa) return;

        const novaTarefa = {
            ...tarefa,
            id: Date.now(),
            titulo: `${tarefa.titulo} (Cópia)`,
            status: 'pendente',
            progresso: 0,
            dataInicio: new Date().toISOString().split('T')[0],
            subtarefas: tarefa.subtarefas?.map(sub => ({
                ...sub,
                id: Date.now() + Math.random(),
                concluida: false
            })) || []
        };

        this._adicionarTarefaAoSistema(novaTarefa);
        
        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa duplicada com sucesso!');
            }
            this._atualizarIntegracoes();
        });
    },

    // ✅ MARCAR TAREFA COMO CONCLUÍDA
    marcarConcluida(tarefaId) {
        const tarefa = this._buscarTarefaPorId(tarefaId);
        if (!tarefa) return;

        tarefa.status = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
        tarefa.progresso = tarefa.status === 'concluida' ? 100 : 0;
        tarefa.dataConclusao = tarefa.status === 'concluida' ? new Date().toISOString() : null;

        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                const acao = tarefa.status === 'concluida' ? 'concluída' : 'reaberta';
                Notifications.success(`Tarefa ${acao}!`);
            }
            this._atualizarIntegracoes();
        });
    },

    // ✅ BUSCAR TAREFAS
    buscarTarefas(termo = '', filtros = {}) {
        let tarefas = this._obterTodasTarefas();

        // Filtro por termo
        if (termo.trim()) {
            const termoLower = termo.toLowerCase();
            tarefas = tarefas.filter(tarefa =>
                tarefa.titulo.toLowerCase().includes(termoLower) ||
                tarefa.descricao?.toLowerCase().includes(termoLower) ||
                tarefa.responsavel?.toLowerCase().includes(termoLower)
            );
        }

        // Filtros específicos
        if (filtros.tipo) {
            tarefas = tarefas.filter(tarefa => tarefa.tipo === filtros.tipo);
        }

        if (filtros.status) {
            tarefas = tarefas.filter(tarefa => tarefa.status === filtros.status);
        }

        if (filtros.prioridade) {
            tarefas = tarefas.filter(tarefa => tarefa.prioridade === filtros.prioridade);
        }

        if (filtros.responsavel) {
            tarefas = tarefas.filter(tarefa => tarefa.responsavel === filtros.responsavel);
        }

        if (filtros.dataInicio) {
            tarefas = tarefas.filter(tarefa => tarefa.dataInicio >= filtros.dataInicio);
        }

        if (filtros.dataFim) {
            tarefas = tarefas.filter(tarefa => tarefa.dataFim <= filtros.dataFim);
        }

        // Ordenação
        return this._ordenarTarefas(tarefas, this.state.ordenacaoAtiva);
    },

    // ✅ OBTER TAREFAS POR PRIORIDADE
    obterTarefasPorPrioridade(prioridade) {
        return this.buscarTarefas('', { prioridade });
    },

    // ✅ OBTER TAREFAS URGENTES
    obterTarefasUrgentes() {
        const hoje = new Date();
        const proximosDias = new Date(hoje);
        proximosDias.setDate(hoje.getDate() + 3);

        const dataHoje = hoje.toISOString().split('T')[0];
        const dataLimite = proximosDias.toISOString().split('T')[0];

        return this.buscarTarefas('', {
            status: 'pendente'
        }).filter(tarefa => 
            tarefa.dataFim && tarefa.dataFim >= dataHoje && tarefa.dataFim <= dataLimite
        );
    },

    // ✅ OBTER ESTATÍSTICAS DE TAREFAS
    obterEstatisticas() {
        const tarefas = this._obterTodasTarefas();
        
        const stats = {
            total: tarefas.length,
            porTipo: {},
            porStatus: {},
            porPrioridade: {},
            porResponsavel: {},
            urgentes: 0,
            atrasadas: 0,
            concluidas: 0,
            progressoMedio: 0
        };

        const hoje = new Date().toISOString().split('T')[0];
        let somaProgresso = 0;

        tarefas.forEach(tarefa => {
            // Por tipo
            if (!stats.porTipo[tarefa.tipo]) {
                stats.porTipo[tarefa.tipo] = 0;
            }
            stats.porTipo[tarefa.tipo]++;

            // Por status
            if (!stats.porStatus[tarefa.status]) {
                stats.porStatus[tarefa.status] = 0;
            }
            stats.porStatus[tarefa.status]++;

            // Por prioridade
            if (!stats.porPrioridade[tarefa.prioridade]) {
                stats.porPrioridade[tarefa.prioridade] = 0;
            }
            stats.porPrioridade[tarefa.prioridade]++;

            // Por responsável
            if (tarefa.responsavel) {
                if (!stats.porResponsavel[tarefa.responsavel]) {
                    stats.porResponsavel[tarefa.responsavel] = 0;
                }
                stats.porResponsavel[tarefa.responsavel]++;
            }

            // Urgentes (próximos 3 dias)
            if (tarefa.dataFim && tarefa.dataFim <= new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0] && tarefa.status !== 'concluida') {
                stats.urgentes++;
            }

            // Atrasadas
            if (tarefa.dataFim && tarefa.dataFim < hoje && tarefa.status !== 'concluida') {
                stats.atrasadas++;
            }

            // Concluídas
            if (tarefa.status === 'concluida') {
                stats.concluidas++;
            }

            // Progresso
            somaProgresso += tarefa.progresso || 0;
        });

        stats.progressoMedio = tarefas.length > 0 ? Math.round(somaProgresso / tarefas.length) : 0;

        return stats;
    },

    // ✅ EXPORTAR TAREFAS
    exportarTarefas(formato = 'json', filtros = {}) {
        const tarefas = this.buscarTarefas('', filtros);
        
        if (formato === 'csv') {
            return this._exportarCSV(tarefas);
        } else {
            return this._exportarJSON(tarefas);
        }
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        this._fecharModaisAtivos();
        this.state.tarefaEditando = null;
        this.state.subtarefasTemp = [];
        this.state.dependenciasTemp.clear();
        this.state.pessoaSelecionada = null;
    },

    // ========== MÉTODOS PRIVADOS ==========

    // ✅ CONFIGURAR EVENTOS GLOBAIS
    _configurarEventosGlobais() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.modalAtivo) {
                this.fecharModal();
            }
            
            // Ctrl+T para nova tarefa
            if (e.ctrlKey && e.key === 't' && !this.state.modalAtivo) {
                e.preventDefault();
                this.mostrarNovaTarefa();
            }
        });

        // Auto-save nos campos (debounced)
        document.addEventListener('input', (e) => {
            if (e.target.closest('#modalTarefa')) {
                clearTimeout(this.state.autoSaveTimeout);
                this.state.autoSaveTimeout = setTimeout(() => {
                    this._salvarRascunho();
                }, this.config.AUTO_SAVE_DELAY);
            }
        });
    },

    // ✅ SINCRONIZAR COM OUTROS MÓDULOS
    _sincronizarComOutrosModulos() {
        // Registrar Tasks nos outros módulos para integração
        if (typeof Calendar !== 'undefined') {
            Calendar._integracaoTasks = this;
        }
        
        if (typeof Events !== 'undefined') {
            Events._integracaoTasks = this;
        }
    },

    // ✅ CARREGAR TEMPLATES
    _carregarTemplates() {
        // Templates padrão de tarefas comuns
        if (typeof App !== 'undefined' && App.dados && !App.dados.templatesTarefas) {
            App.dados.templatesTarefas = [
                {
                    id: 'template_reuniao',
                    nome: 'Preparar Reunião',
                    tipo: 'equipe',
                    prioridade: 'media',
                    subtarefas: [
                        { titulo: 'Definir agenda', concluida: false },
                        { titulo: 'Convidar participantes', concluida: false },
                        { titulo: 'Preparar apresentação', concluida: false },
                        { titulo: 'Reservar sala', concluida: false }
                    ]
                },
                {
                    id: 'template_projeto',
                    nome: 'Iniciar Novo Projeto',
                    tipo: 'projeto',
                    prioridade: 'alta',
                    subtarefas: [
                        { titulo: 'Análise de requisitos', concluida: false },
                        { titulo: 'Definir cronograma', concluida: false },
                        { titulo: 'Alocar recursos', concluida: false },
                        { titulo: 'Kickoff meeting', concluida: false }
                    ]
                }
            ];
        }
    },

    // ✅ OBTER TODAS AS TAREFAS
    _obterTodasTarefas() {
        if (typeof App === 'undefined' || !App.dados) return [];

        let tarefas = [];

        // Tarefas diretas
        if (App.dados.tarefas) {
            tarefas = [...App.dados.tarefas];
        }

        // Tarefas das atividades das áreas
        if (App.dados.areas) {
            Object.values(App.dados.areas).forEach(area => {
                if (area.atividades) {
                    area.atividades.forEach(atividade => {
                        if (atividade.tarefas) {
                            atividade.tarefas.forEach(tarefa => {
                                tarefas.push({
                                    ...tarefa,
                                    origem: 'atividade',
                                    atividade: atividade.nome,
                                    area: area.nome
                                });
                            });
                        }
                    });
                }
            });
        }

        // Tarefas das agendas pessoais
        if (App.dados.agendas) {
            Object.entries(App.dados.agendas).forEach(([pessoa, agenda]) => {
                Object.entries(agenda).forEach(([dia, tarefas]) => {
                    if (Array.isArray(tarefas)) {
                        tarefas.forEach(tarefa => {
                            tarefas.push({
                                ...tarefa,
                                origem: 'agenda',
                                responsavel: pessoa,
                                diaSemana: dia,
                                tipo: 'pessoal'
                            });
                        });
                    }
                });
            });
        }

        return tarefas;
    },

    // ✅ BUSCAR TAREFA POR ID
    _buscarTarefaPorId(id) {
        return this._obterTodasTarefas().find(tarefa => tarefa.id === id);
    },

    // ✅ COLETAR DADOS DO FORMULÁRIO
    _coletarDadosFormulario() {
        return {
            id: this.state.tarefaEditando || Date.now(),
            titulo: document.getElementById('tarefaTitulo').value.trim(),
            descricao: document.getElementById('tarefaDescricao').value.trim(),
            tipo: document.getElementById('tarefaTipo').value,
            prioridade: document.getElementById('tarefaPrioridade').value,
            responsavel: document.getElementById('tarefaResponsavel').value,
            status: document.getElementById('tarefaStatus').value,
            progresso: parseInt(document.getElementById('tarefaProgresso').value) || 0,
            dataInicio: document.getElementById('tarefaDataInicio').value,
            dataFim: document.getElementById('tarefaDataFim').value,
            agendaSemanal: document.getElementById('tarefaAgendaSemanal').checked,
            diaSemana: document.getElementById('tarefaDiaSemana').value,
            horario: document.getElementById('tarefaHorario').value,
            duracao: parseInt(document.getElementById('tarefaDuracao').value) || 60,
            mostrarNoCalendario: document.getElementById('tarefaMostrarCalendario').checked,
            subtarefas: [...this.state.subtarefasTemp],
            dependencias: Array.from(this.state.dependenciasTemp)
        };
    },

    // ✅ VALIDAR DADOS DA TAREFA
    _validarDadosTarefa(dados) {
        let valido = true;

        // Limpar erros anteriores
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Validar título
        if (!dados.titulo) {
            this._mostrarErroValidacao('tarefaTitulo', 'tarefaTituloError', 'Título é obrigatório');
            valido = false;
        }

        // Validar datas se fornecidas
        if (dados.dataInicio && dados.dataFim) {
            if (dados.dataInicio > dados.dataFim) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Data de fim deve ser posterior à data de início');
                }
            }
        }

        // Validar dependências circulares
        if (dados.dependencias.includes(dados.id)) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Uma tarefa não pode depender de si mesma');
            }
            valido = false;
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

    // ✅ CRIAR TAREFA NOVA
    _criarTarefaNova(dados) {
        const tarefa = {
            ...dados,
            dataCriacao: new Date().toISOString(),
            criadoPor: typeof App !== 'undefined' && App.usuarioAtual ? App.usuarioAtual.email : 'sistema'
        };

        this._adicionarTarefaAoSistema(tarefa);
        
        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa criada com sucesso!');
            }
            this.fecharModal();
            this._atualizarIntegracoes();
        });
    },

    // ✅ ATUALIZAR TAREFA EXISTENTE
    _atualizarTarefaExistente(dados) {
        const tarefa = this._buscarTarefaPorId(this.state.tarefaEditando);
        if (!tarefa) return;

        // Atualizar dados
        Object.assign(tarefa, {
            ...dados,
            dataModificacao: new Date().toISOString(),
            modificadoPor: typeof App !== 'undefined' && App.usuarioAtual ? App.usuarioAtual.email : 'sistema'
        });

        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa atualizada com sucesso!');
            }
            this.fecharModal();
            this._atualizarIntegracoes();
        });
    },

    // ✅ ADICIONAR TAREFA AO SISTEMA
    _adicionarTarefaAoSistema(tarefa) {
        if (typeof App === 'undefined' || !App.dados) return;

        // Garantir que existe array de tarefas
        if (!App.dados.tarefas) {
            App.dados.tarefas = [];
        }

        App.dados.tarefas.push(tarefa);

        // Se tem agenda semanal, adicionar à agenda da pessoa
        if (tarefa.agendaSemanal && tarefa.responsavel && tarefa.diaSemana) {
            this._adicionarTarefaAgenda(tarefa);
        }
    },

    // ✅ ADICIONAR À AGENDA SEMANAL
    _adicionarTarefaAgenda(tarefa) {
        if (typeof App === 'undefined' || !App.dados) return;

        if (!App.dados.agendas) {
            App.dados.agendas = {};
        }

        if (!App.dados.agendas[tarefa.responsavel]) {
            App.dados.agendas[tarefa.responsavel] = {};
        }

        if (!App.dados.agendas[tarefa.responsavel][tarefa.diaSemana]) {
            App.dados.agendas[tarefa.responsavel][tarefa.diaSemana] = [];
        }

        const tarefaAgenda = {
            id: tarefa.id,
            titulo: tarefa.titulo,
            tipo: tarefa.tipo,
            horarioInicio: tarefa.horario,
            duracao: tarefa.duracao,
            descricao: tarefa.descricao,
            mostrarNoCalendario: tarefa.mostrarNoCalendario,
            origem: 'tarefa_sistema'
        };

        App.dados.agendas[tarefa.responsavel][tarefa.diaSemana].push(tarefaAgenda);
    },

    // ✅ EXECUTAR EXCLUSÃO DE TAREFA
    _executarExclusaoTarefa(tarefaId) {
        if (typeof App === 'undefined' || !App.dados) return;

        // Remover das tarefas principais
        if (App.dados.tarefas) {
            App.dados.tarefas = App.dados.tarefas.filter(t => t.id !== tarefaId);
        }

        // Remover das agendas
        if (App.dados.agendas) {
            Object.values(App.dados.agendas).forEach(agenda => {
                Object.keys(agenda).forEach(dia => {
                    if (Array.isArray(agenda[dia])) {
                        agenda[dia] = agenda[dia].filter(t => t.id !== tarefaId);
                    }
                });
            });
        }

        // Remover dependências em outras tarefas
        this._obterTodasTarefas().forEach(tarefa => {
            if (tarefa.dependencias) {
                tarefa.dependencias = tarefa.dependencias.filter(dep => dep !== tarefaId);
            }
        });

        this._salvarComFeedback(() => {
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa excluída com sucesso!');
            }
            this.fecharModal();
            this._atualizarIntegracoes();
        });
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

    // ✅ ATUALIZAR INTEGRAÇÕES
    _atualizarIntegracoes() {
        // Atualizar calendário
        if (typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function') {
            Calendar.gerar();
        }
        
        // Atualizar estatísticas do app
        if (typeof App !== 'undefined' && typeof App.atualizarEstatisticas === 'function') {
            App.atualizarEstatisticas();
        }
    },

    // ✅ ORDENAR TAREFAS
    _ordenarTarefas(tarefas, criterio) {
        switch (criterio) {
            case 'prioridade':
                return tarefas.sort((a, b) => 
                    this.config.PRIORIDADES[b.prioridade].valor - this.config.PRIORIDADES[a.prioridade].valor
                );
            case 'prazo':
                return tarefas.sort((a, b) => {
                    if (!a.dataFim && !b.dataFim) return 0;
                    if (!a.dataFim) return 1;
                    if (!b.dataFim) return -1;
                    return a.dataFim.localeCompare(b.dataFim);
                });
            case 'titulo':
                return tarefas.sort((a, b) => a.titulo.localeCompare(b.titulo));
            case 'progresso':
                return tarefas.sort((a, b) => (b.progresso || 0) - (a.progresso || 0));
            default:
                return tarefas;
        }
    },

    // ✅ OBTER OPÇÕES DE RESPONSÁVEIS
    _obterOpcoesResponsaveis(responsavelSelecionado = null) {
        if (typeof App === 'undefined' || !App.dados) return '';
        
        const pessoas = new Set();
        
        // Adicionar pessoas das áreas
        if (App.dados.areas) {
            Object.values(App.dados.areas).forEach(area => {
                if (area.equipe) {
                    area.equipe.forEach(membro => {
                        if (membro.nome) pessoas.add(membro.nome);
                    });
                }
            });
        }
        
        // Adicionar pessoas das agendas
        if (App.dados.agendas) {
            Object.keys(App.dados.agendas).forEach(pessoa => pessoas.add(pessoa));
        }
        
        const pessoasArray = Array.from(pessoas).sort();
        
        return pessoasArray.map(pessoa => 
            `<option value="${pessoa}" ${pessoa === responsavelSelecionado ? 'selected' : ''}>${pessoa}</option>`
        ).join('');
    },

    // ✅ OBTER OPÇÕES DE DEPENDÊNCIAS
    _obterOpcoesDependencias() {
        const todasTarefas = this._obterTodasTarefas();
        const tarefaAtual = this.state.tarefaEditando;
        
        return todasTarefas
            .filter(tarefa => tarefa.id !== tarefaAtual && !this.state.dependenciasTemp.has(tarefa.id))
            .map(tarefa => 
                `<option value="${tarefa.id}">${tarefa.titulo} (${this.config.TIPOS_TAREFA[tarefa.tipo]?.nome})</option>`
            ).join('');
    },

    // ✅ FUNÇÕES DE INTERFACE DO MODAL

    _atualizarDisplayProgresso(valor) {
        const display = document.getElementById('progressoDisplay');
        if (display) {
            display.textContent = `${valor}%`;
        }
    },

    _toggleAgendaSemanal() {
        const checkbox = document.getElementById('tarefaAgendaSemanal');
        const container = document.getElementById('agendaSemanalContainer');
        
        if (container) {
            container.style.display = checkbox.checked ? 'block' : 'none';
        }
    },

    _adicionarSubtarefa() {
        if (this.state.subtarefasTemp.length >= this.config.MAX_SUBTAREFAS) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning(`Máximo de ${this.config.MAX_SUBTAREFAS} subtarefas permitido`);
            }
            return;
        }

        const titulo = prompt('Título da subtarefa:');
        if (titulo && titulo.trim()) {
            const subtarefa = {
                id: Date.now() + Math.random(),
                titulo: titulo.trim(),
                concluida: false
            };
            
            this.state.subtarefasTemp.push(subtarefa);
            this._atualizarDisplaySubtarefas();
        }
    },

    _removerSubtarefa(index) {
        this.state.subtarefasTemp.splice(index, 1);
        this._atualizarDisplaySubtarefas();
    },

    _renderizarSubtarefas() {
        if (this.state.subtarefasTemp.length === 0) {
            return '<div style="text-align: center; color: #6b7280; padding: 20px;">Nenhuma subtarefa adicionada</div>';
        }

        return this.state.subtarefasTemp.map((subtarefa, index) => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9fafb; border-radius: 4px; margin-bottom: 4px;">
                <input type="checkbox" ${subtarefa.concluida ? 'checked' : ''} 
                       onchange="Tasks._toggleSubtarefa(${index})">
                <span style="flex: 1; ${subtarefa.concluida ? 'text-decoration: line-through; color: #6b7280;' : ''}">${subtarefa.titulo}</span>
                <button type="button" onclick="Tasks._removerSubtarefa(${index})" 
                        style="color: #ef4444; background: none; border: none; cursor: pointer;">×</button>
            </div>
        `).join('');
    },

    _atualizarDisplaySubtarefas() {
        const container = document.getElementById('subtarefasContainer');
        if (container) {
            container.innerHTML = this._renderizarSubtarefas();
        }
    },

    _toggleSubtarefa(index) {
        if (this.state.subtarefasTemp[index]) {
            this.state.subtarefasTemp[index].concluida = !this.state.subtarefasTemp[index].concluida;
            this._atualizarDisplaySubtarefas();
        }
    },

    _adicionarDependencia() {
        const select = document.getElementById('seletorDependencias');
        const tarefaId = parseInt(select.value);
        
        if (tarefaId && !this.state.dependenciasTemp.has(tarefaId)) {
            this.state.dependenciasTemp.add(tarefaId);
            this._atualizarDisplayDependencias();
            select.value = '';
            select.innerHTML = '<option value="">Selecionar tarefa...</option>' + this._obterOpcoesDependencias();
        }
    },

    _removerDependencia(tarefaId) {
        this.state.dependenciasTemp.delete(tarefaId);
        this._atualizarDisplayDependencias();
        
        // Atualizar select
        const select = document.getElementById('seletorDependencias');
        if (select) {
            select.innerHTML = '<option value="">Selecionar tarefa...</option>' + this._obterOpcoesDependencias();
        }
    },

    _renderizarDependencias() {
        if (this.state.dependenciasTemp.size === 0) {
            return '<div style="text-align: center; color: #6b7280; padding: 12px;">Nenhuma dependência adicionada</div>';
        }

        const todasTarefas = this._obterTodasTarefas();
        
        return Array.from(this.state.dependenciasTemp).map(tarefaId => {
            const tarefa = todasTarefas.find(t => t.id === tarefaId);
            if (!tarefa) return '';
            
            return `
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #fef3c7; border-radius: 4px; margin-bottom: 4px; border-left: 3px solid #f59e0b;">
                    <span style="flex: 1;">🔗 ${tarefa.titulo}</span>
                    <span style="font-size: 11px; color: #92400e; background: #fbbf24; padding: 2px 6px; border-radius: 3px;">
                        ${this.config.STATUS[tarefa.status]?.nome || tarefa.status}
                    </span>
                    <button type="button" onclick="Tasks._removerDependencia(${tarefaId})" 
                            style="color: #ef4444; background: none; border: none; cursor: pointer;">×</button>
                </div>
            `;
        }).join('');
    },

    _atualizarDisplayDependencias() {
        const container = document.getElementById('dependenciasContainer');
        if (container) {
            container.innerHTML = this._renderizarDependencias();
        }
    },

    _salvarComoTemplate() {
        const dados = this._coletarDadosFormulario();
        
        if (!dados.titulo) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Título é obrigatório para salvar template');
            }
            return;
        }

        const nomeTemplate = prompt('Nome do template:', dados.titulo);
        if (!nomeTemplate) return;

        const template = {
            id: 'template_' + Date.now(),
            nome: nomeTemplate,
            tipo: dados.tipo,
            prioridade: dados.prioridade,
            descricao: dados.descricao,
            subtarefas: dados.subtarefas.map(sub => ({ titulo: sub.titulo, concluida: false })),
            duracao: dados.duracao
        };

        if (typeof App !== 'undefined' && App.dados) {
            if (!App.dados.templatesTarefas) {
                App.dados.templatesTarefas = [];
            }
            App.dados.templatesTarefas.push(template);
            
            this._salvarComFeedback(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success(`Template "${nomeTemplate}" salvo!`);
                }
            });
        }
    },

    _configurarEventosModal(modal) {
        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });
    },

    _salvarRascunho() {
        if (!this.state.modalAtivo) return;
        
        try {
            const dados = this._coletarDadosFormulario();
            sessionStorage.setItem('tarefaRascunho', JSON.stringify(dados));
        } catch (error) {
            console.warn('Erro ao salvar rascunho:', error);
        }
    },

    // ✅ EXPORTAR JSON
    _exportarJSON(tarefas) {
        const dados = {
            exportadoEm: new Date().toISOString(),
            total: tarefas.length,
            tarefas: tarefas,
            estatisticas: this.obterEstatisticas()
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tarefas_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Tarefas exportadas em JSON!');
        }
    },

    // ✅ EXPORTAR CSV
    _exportarCSV(tarefas) {
        const headers = ['ID', 'Título', 'Tipo', 'Prioridade', 'Status', 'Responsável', 'Progresso', 'Data Início', 'Data Fim', 'Descrição'];
        const csvContent = [
            headers.join(','),
            ...tarefas.map(tarefa => [
                tarefa.id,
                `"${tarefa.titulo}"`,
                tarefa.tipo,
                tarefa.prioridade,
                tarefa.status,
                tarefa.responsavel || '',
                tarefa.progresso || 0,
                tarefa.dataInicio || '',
                tarefa.dataFim || '',
                `"${(tarefa.descricao || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tarefas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Tarefas exportadas em CSV!');
        }
    },

    // ✅ FECHAR MODAIS ATIVOS
    _fecharModaisAtivos() {
        if (this.state.modalAtivo && this.state.modalAtivo.parentElement) {
            this.state.modalAtivo.parentElement.removeChild(this.state.modalAtivo);
            this.state.modalAtivo = null;
        }
        
        // Remover qualquer modal órfão
        document.querySelectorAll('#modalTarefa').forEach(modal => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        });
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        const stats = this.obterEstatisticas();
        
        return {
            modalAtivo: !!this.state.modalAtivo,
            tarefaEditando: this.state.tarefaEditando,
            filtroAtivo: this.state.filtroAtivo,
            ordenacaoAtiva: this.state.ordenacaoAtiva,
            pessoaSelecionada: this.state.pessoaSelecionada,
            totalTarefas: stats.total,
            tarefasUrgentes: this.obterTarefasUrgentes().length,
            estatisticas: stats,
            templatesDisponiveis: (typeof App !== 'undefined' && App.dados && App.dados.templatesTarefas) ? App.dados.templatesTarefas.length : 0
        };
    }
};

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
window.mostrarNovaTarefa = (tipo, pessoa) => Tasks.mostrarNovaTarefa(tipo, pessoa);
window.editarTarefa = (id) => Tasks.editarTarefa(id);
window.excluirTarefa = (id) => Tasks.excluirTarefa(id);
window.marcarTarefaConcluida = (id) => Tasks.marcarConcluida(id);

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Tasks.init();
    }, 400);
});

console.log('📝 Sistema de Gestão de Tarefas v6.2 carregado!');
