/* ========== 📋 SISTEMA HÍBRIDO - MINHA AGENDA v6.5.0 ========== */

const PersonalAgenda = {
    // ✅ CONFIGURAÇÕES HÍBRIDAS
    config: {
        // Mantém configurações existentes do Tasks.js
        tipos: [
            { value: 'pessoal', label: 'Pessoal', icon: '👤', cor: '#f59e0b' },
            { value: 'equipe', label: 'Equipe', icon: '👥', cor: '#06b6d4' },
            { value: 'projeto', label: 'Projeto', icon: '🏗️', cor: '#8b5cf6' },
            { value: 'urgente', label: 'Urgente', icon: '🚨', cor: '#ef4444' },
            { value: 'rotina', label: 'Rotina', icon: '🔄', cor: '#6b7280' }
        ],
        prioridades: [
            { value: 'baixa', label: 'Baixa', cor: '#22c55e' },
            { value: 'media', label: 'Média', cor: '#f59e0b' },
            { value: 'alta', label: 'Alta', cor: '#ef4444' },
            { value: 'critica', label: 'Crítica', cor: '#dc2626' }
        ],
        status: [
            { value: 'pendente', label: 'Pendente', cor: '#6b7280' },
            { value: 'andamento', label: 'Em andamento', cor: '#3b82f6' },
            { value: 'revisao', label: 'Em revisão', cor: '#f59e0b' },
            { value: 'concluida', label: 'Concluída', cor: '#22c55e' },
            { value: 'cancelada', label: 'Cancelada', cor: '#ef4444' },
            { value: 'pausada', label: 'Pausada', cor: '#6b7280' }
        ],
        // NOVO: Configurações da agenda pessoal
        viewModes: [
            { value: 'dashboard', label: 'Dashboard', icon: '📊' },
            { value: 'semanal', label: 'Visão Semanal', icon: '📅' },
            { value: 'lista', label: 'Lista de Tarefas', icon: '📝' },
            { value: 'kanban', label: 'Kanban', icon: '📋' }
        ],
        diasSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    },

    // ✅ ESTADO HÍBRIDO
    state: {
        modalAberto: false,
        viewModeAtual: 'dashboard',
        usuarioAtual: null,
        semanaAtual: new Date(),
        filtros: {
            tipo: 'todos',
            status: 'todos',
            prioridade: 'todos'
        },
        estatisticasPessoais: null,
        tarefaEditando: null,
        sincronizacaoEvents: true
    },

    // ✅ ABRIR MODAL MINHA AGENDA - FUNÇÃO PRINCIPAL
    abrirMinhaAgenda(usuario = null) {
        try {
            console.log('📋 Abrindo Minha Agenda para:', usuario || 'usuário atual');
            
            // Configurar usuário
            this.state.usuarioAtual = usuario || this._obterUsuarioAtual();
            
            // Calcular estatísticas pessoais
            this._calcularEstatisticasPessoais();
            
            // Criar modal full-screen
            this._criarModalMinhaAgenda();
            
            // Renderizar view inicial (dashboard)
            this._renderizarViewAtual();
            
            this.state.modalAberto = true;
            console.log('✅ Minha Agenda aberta com sucesso');

        } catch (error) {
            console.error('❌ Erro ao abrir Minha Agenda:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir agenda pessoal');
            }
        }
    },

    // ✅ CRIAR MODAL FULL-SCREEN
    _criarModalMinhaAgenda() {
        // Remover modal existente
        const modalExistente = document.getElementById('modalMinhaAgenda');
        if (modalExistente) {
            modalExistente.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'modalMinhaAgenda';
        modal.className = 'modal modal-fullscreen active';
        
        modal.innerHTML = `
            <div class="modal-content-fullscreen">
                <!-- Header da Agenda -->
                <div class="agenda-header">
                    <div class="agenda-header-left">
                        <h2>📋 Minha Agenda - ${this.state.usuarioAtual}</h2>
                        <p class="agenda-subtitle">Organize suas tarefas e maximize sua produtividade</p>
                    </div>
                    
                    <div class="agenda-header-right">
                        <div class="agenda-controls">
                            ${this._renderizarControlesView()}
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="PersonalAgenda.fecharModal()">
                            ✕ Fechar
                        </button>
                    </div>
                </div>

                <!-- Navegação da Agenda -->
                <div class="agenda-nav">
                    ${this._renderizarNavegacao()}
                </div>

                <!-- Conteúdo Principal -->
                <div id="agendaConteudo" class="agenda-conteudo">
                    <!-- Será preenchido pela _renderizarViewAtual() -->
                </div>

                <!-- Footer da Agenda -->
                <div class="agenda-footer">
                    <div class="agenda-footer-left">
                        <span class="agenda-sync-status">
                            ${this.state.sincronizacaoEvents ? '🔄 Sincronizado com eventos' : '⚠️ Sincronização desativada'}
                        </span>
                    </div>
                    
                    <div class="agenda-footer-right">
                        <button class="btn btn-primary" onclick="PersonalAgenda.mostrarNovaTarefa()">
                            ➕ Nova Tarefa
                        </button>
                        <button class="btn btn-success" onclick="PersonalAgenda.promoverTarefa()">
                            ↗️ Promover ao Calendário
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos específicos
        this._adicionarEstilosModal();
        
        document.body.appendChild(modal);
        
        // Configurar eventos
        this._configurarEventosModal();
    },

    // ✅ RENDERIZAR CONTROLES DE VIEW
    _renderizarControlesView() {
        return `
            <div class="view-selector">
                ${this.config.viewModes.map(mode => `
                    <button class="view-btn ${this.state.viewModeAtual === mode.value ? 'active' : ''}"
                            onclick="PersonalAgenda.mudarView('${mode.value}')"
                            title="${mode.label}">
                        ${mode.icon}
                    </button>
                `).join('')}
            </div>
        `;
    },

    // ✅ RENDERIZAR NAVEGAÇÃO
    _renderizarNavegacao() {
        const stats = this.state.estatisticasPessoais || {};
        
        return `
            <div class="agenda-nav-stats">
                <div class="stat-card stat-pendentes">
                    <div class="stat-numero">${stats.pendentes || 0}</div>
                    <div class="stat-label">Pendentes</div>
                </div>
                
                <div class="stat-card stat-andamento">
                    <div class="stat-numero">${stats.emAndamento || 0}</div>
                    <div class="stat-label">Em Andamento</div>
                </div>
                
                <div class="stat-card stat-concluidas">
                    <div class="stat-numero">${stats.concluidas || 0}</div>
                    <div class="stat-label">Concluídas</div>
                </div>
                
                <div class="stat-card stat-urgentes">
                    <div class="stat-numero">${stats.urgentes || 0}</div>
                    <div class="stat-label">Urgentes</div>
                </div>
                
                <div class="stat-card stat-progresso">
                    <div class="stat-numero">${stats.progressoMedio || 0}%</div>
                    <div class="stat-label">Progresso</div>
                </div>
            </div>
            
            <div class="agenda-filtros">
                ${this._renderizarFiltros()}
            </div>
        `;
    },

    // ✅ RENDERIZAR FILTROS
    _renderizarFiltros() {
        return `
            <div class="filtros-container">
                <select id="filtroTipo" onchange="PersonalAgenda.aplicarFiltro('tipo', this.value)">
                    <option value="todos">📂 Todos os tipos</option>
                    ${this.config.tipos.map(tipo => `
                        <option value="${tipo.value}" ${this.state.filtros.tipo === tipo.value ? 'selected' : ''}>
                            ${tipo.icon} ${tipo.label}
                        </option>
                    `).join('')}
                </select>
                
                <select id="filtroStatus" onchange="PersonalAgenda.aplicarFiltro('status', this.value)">
                    <option value="todos">📊 Todos os status</option>
                    ${this.config.status.map(status => `
                        <option value="${status.value}" ${this.state.filtros.status === status.value ? 'selected' : ''}>
                            ${status.label}
                        </option>
                    `).join('')}
                </select>
                
                <select id="filtroPrioridade" onchange="PersonalAgenda.aplicarFiltro('prioridade', this.value)">
                    <option value="todos">⚡ Todas as prioridades</option>
                    ${this.config.prioridades.map(prioridade => `
                        <option value="${prioridade.value}" ${this.state.filtros.prioridade === prioridade.value ? 'selected' : ''}>
                            ${prioridade.label}
                        </option>
                    `).join('')}
                </select>
                
                <button class="btn btn-secondary btn-sm" onclick="PersonalAgenda.limparFiltros()">
                    🔄 Limpar
                </button>
            </div>
        `;
    },

    // ✅ MUDAR VIEW DA AGENDA
    mudarView(novaView) {
        this.state.viewModeAtual = novaView;
        
        // Atualizar botões
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[onclick="PersonalAgenda.mudarView('${novaView}')"]`)?.classList.add('active');
        
        // Renderizar nova view
        this._renderizarViewAtual();
        
        console.log('📱 View alterada para:', novaView);
    },

    // ✅ RENDERIZAR VIEW ATUAL
    _renderizarViewAtual() {
        const container = document.getElementById('agendaConteudo');
        if (!container) return;

        let conteudo = '';
        
        switch (this.state.viewModeAtual) {
            case 'dashboard':
                conteudo = this._renderizarDashboard();
                break;
            case 'semanal':
                conteudo = this._renderizarVisaoSemanal();
                break;
            case 'lista':
                conteudo = this._renderizarListaTarefas();
                break;
            case 'kanban':
                conteudo = this._renderizarKanban();
                break;
            default:
                conteudo = this._renderizarDashboard();
        }
        
        container.innerHTML = conteudo;
        
        // Configurar eventos específicos da view
        this._configurarEventosView();
    },

    // ✅ RENDERIZAR DASHBOARD PESSOAL
    _renderizarDashboard() {
        const stats = this.state.estatisticasPessoais || {};
        const tarefas = this._obterMinhasTarefas();
        const proximasTarefas = tarefas.slice(0, 5);
        const tarefasUrgentes = tarefas.filter(t => t.prioridade === 'critica' || t.prioridade === 'alta');

        return `
            <div class="dashboard-pessoal">
                <!-- Métricas Principais -->
                <div class="dashboard-metricas">
                    <div class="metrica-card produtividade">
                        <h3>📈 Produtividade Hoje</h3>
                        <div class="metrica-valor">${stats.produtividadeHoje || 0}%</div>
                        <div class="metrica-desc">${stats.tarefasConcluidasHoje || 0} de ${stats.tarefasTotalHoje || 0} tarefas</div>
                    </div>
                    
                    <div class="metrica-card tempo">
                        <h3>⏱️ Tempo Estimado</h3>
                        <div class="metrica-valor">${stats.tempoEstimado || 0}h</div>
                        <div class="metrica-desc">Restantes para conclusão</div>
                    </div>
                    
                    <div class="metrica-card streak">
                        <h3>🔥 Sequência</h3>
                        <div class="metrica-valor">${stats.diasConsecutivos || 0}</div>
                        <div class="metrica-desc">Dias produtivos seguidos</div>
                    </div>
                </div>

                <!-- Gráfico de Progresso -->
                <div class="dashboard-progresso">
                    <h3>📊 Progresso Semanal</h3>
                    <div class="progresso-graph">
                        ${this._renderizarGraficoProgresso()}
                    </div>
                </div>

                <!-- Próximas Tarefas -->
                <div class="dashboard-proximas">
                    <h3>🎯 Próximas Tarefas</h3>
                    <div class="tarefas-lista-mini">
                        ${proximasTarefas.map(tarefa => this._renderizarTarefaMini(tarefa)).join('')}
                    </div>
                    ${proximasTarefas.length === 0 ? '<p class="texto-vazio">🎉 Nenhuma tarefa pendente!</p>' : ''}
                </div>

                <!-- Tarefas Urgentes -->
                ${tarefasUrgentes.length > 0 ? `
                    <div class="dashboard-urgentes">
                        <h3>🚨 Atenção Urgente</h3>
                        <div class="tarefas-urgentes">
                            ${tarefasUrgentes.map(tarefa => this._renderizarTarefaUrgente(tarefa)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ✅ RENDERIZAR VISÃO SEMANAL
    _renderizarVisaoSemanal() {
        const inicioSemana = this._obterInicioSemana(this.state.semanaAtual);
        const tarefasPorDia = this._organizarTarefasPorDia(inicioSemana);

        return `
            <div class="visao-semanal">
                <div class="semana-header">
                    <button class="btn btn-secondary" onclick="PersonalAgenda.navegarSemana(-1)">
                        ← Semana Anterior
                    </button>
                    <h3>${this._formatarSemana(inicioSemana)}</h3>
                    <button class="btn btn-secondary" onclick="PersonalAgenda.navegarSemana(1)">
                        Próxima Semana →
                    </button>
                </div>
                
                <div class="semana-grid">
                    ${this.config.diasSemana.map((dia, index) => {
                        const data = new Date(inicioSemana);
                        data.setDate(inicioSemana.getDate() + index);
                        const dataStr = data.toISOString().split('T')[0];
                        const tarefasDia = tarefasPorDia[dataStr] || [];
                        
                        return `
                            <div class="dia-card ${this._isHoje(data) ? 'hoje' : ''}">
                                <div class="dia-header">
                                    <h4>${dia}</h4>
                                    <span class="dia-numero">${data.getDate()}</span>
                                </div>
                                
                                <div class="dia-tarefas">
                                    ${tarefasDia.map(tarefa => this._renderizarTarefaDia(tarefa)).join('')}
                                </div>
                                
                                <button class="btn btn-sm btn-add-tarefa" 
                                        onclick="PersonalAgenda.adicionarTarefaDia('${dataStr}')">
                                    ➕ Adicionar
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // ✅ RENDERIZAR LISTA DE TAREFAS
    _renderizarListaTarefas() {
        const tarefas = this._obterMinhasTarefasFiltradas();
        
        return `
            <div class="lista-tarefas">
                <div class="lista-header">
                    <h3>📝 Todas as Minhas Tarefas (${tarefas.length})</h3>
                    <div class="lista-ordenacao">
                        <select onchange="PersonalAgenda.ordenarTarefas(this.value)">
                            <option value="prioridade">Ordenar por Prioridade</option>
                            <option value="prazo">Ordenar por Prazo</option>
                            <option value="criacao">Ordenar por Criação</option>
                            <option value="progresso">Ordenar por Progresso</option>
                        </select>
                    </div>
                </div>
                
                <div class="tarefas-container">
                    ${tarefas.length > 0 ? 
                        tarefas.map(tarefa => this._renderizarTarefaCompleta(tarefa)).join('') :
                        '<div class="lista-vazia">📭 Nenhuma tarefa encontrada com os filtros aplicados</div>'
                    }
                </div>
            </div>
        `;
    },

    // ✅ RENDERIZAR KANBAN
    _renderizarKanban() {
        const tarefasPorStatus = this._agruparTarefasPorStatus();
        
        return `
            <div class="kanban-board">
                ${this.config.status.map(status => `
                    <div class="kanban-coluna" data-status="${status.value}">
                        <div class="kanban-header" style="border-color: ${status.cor}">
                            <h3>${status.label}</h3>
                            <span class="kanban-count">${(tarefasPorStatus[status.value] || []).length}</span>
                        </div>
                        
                        <div class="kanban-tarefas" ondrop="PersonalAgenda.dropTarefa(event)" ondragover="event.preventDefault()">
                            ${(tarefasPorStatus[status.value] || []).map(tarefa => 
                                this._renderizarTarefaKanban(tarefa)
                            ).join('')}
                        </div>
                        
                        <button class="btn btn-sm btn-add-kanban" 
                                onclick="PersonalAgenda.adicionarTarefaStatus('${status.value}')">
                            ➕ Adicionar ${status.label}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ✅ OBTER MINHAS TAREFAS
    _obterMinhasTarefas() {
        try {
            if (!App.dados?.tarefas) return [];
            
            return App.dados.tarefas.filter(tarefa => {
                // Filtrar por usuário atual
                if (tarefa.responsavel === this.state.usuarioAtual) {
                    return true;
                }
                
                // FUTURO: Também incluir tarefas de eventos onde sou participante
                return false;
            });

        } catch (error) {
            console.error('❌ Erro ao obter minhas tarefas:', error);
            return [];
        }
    },

    // ✅ OBTER MINHAS TAREFAS FILTRADAS
    _obterMinhasTarefasFiltradas() {
        let tarefas = this._obterMinhasTarefas();
        
        // Aplicar filtros
        if (this.state.filtros.tipo !== 'todos') {
            tarefas = tarefas.filter(t => t.tipo === this.state.filtros.tipo);
        }
        
        if (this.state.filtros.status !== 'todos') {
            tarefas = tarefas.filter(t => t.status === this.state.filtros.status);
        }
        
        if (this.state.filtros.prioridade !== 'todos') {
            tarefas = tarefas.filter(t => t.prioridade === this.state.filtros.prioridade);
        }
        
        return tarefas;
    },

    // ✅ APLICAR FILTRO
    aplicarFiltro(tipoFiltro, valor) {
        this.state.filtros[tipoFiltro] = valor;
        this._renderizarViewAtual();
        console.log('🔽 Filtro aplicado:', tipoFiltro, '=', valor);
    },

    // ✅ LIMPAR FILTROS
    limparFiltros() {
        this.state.filtros = {
            tipo: 'todos',
            status: 'todos',
            prioridade: 'todos'
        };
        
        // Atualizar selects
        document.getElementById('filtroTipo').value = 'todos';
        document.getElementById('filtroStatus').value = 'todos';
        document.getElementById('filtroPrioridade').value = 'todos';
        
        this._renderizarViewAtual();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('🔄 Filtros limpos');
        }
    },

    // ✅ MOSTRAR NOVA TAREFA (integração com Tasks.js)
    mostrarNovaTarefa() {
        if (typeof Tasks !== 'undefined') {
            Tasks.mostrarNovaTarefa('pessoal', this.state.usuarioAtual);
        } else {
            console.warn('⚠️ Módulo Tasks não disponível');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Módulo de tarefas não disponível');
            }
        }
    },

    // ✅ PROMOVER TAREFA (futuro - integração com Events.js)
    promoverTarefa(tarefaId = null) {
        // FUTURO: Implementar promoção de tarefa para calendário principal
        console.log('↗️ Promover tarefa para calendário principal:', tarefaId);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('🔄 Funcionalidade de promoção será implementada na próxima versão');
        }
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        const modal = document.getElementById('modalMinhaAgenda');
        if (modal) {
            modal.remove();
        }
        
        this.state.modalAberto = false;
        console.log('✅ Minha Agenda fechada');
    },

    // ✅ CALCULAR ESTATÍSTICAS PESSOAIS
    _calcularEstatisticasPessoais() {
        try {
            const tarefas = this._obterMinhasTarefas();
            const hoje = new Date().toISOString().split('T')[0];
            
            const stats = {
                total: tarefas.length,
                pendentes: 0,
                emAndamento: 0,
                concluidas: 0,
                urgentes: 0,
                progressoMedio: 0,
                tarefasTotalHoje: 0,
                tarefasConcluidasHoje: 0,
                produtividadeHoje: 0,
                tempoEstimado: 0,
                diasConsecutivos: 0
            };
            
            let somaProgresso = 0;
            
            tarefas.forEach(tarefa => {
                // Contar por status
                switch (tarefa.status) {
                    case 'pendente': stats.pendentes++; break;
                    case 'andamento': stats.emAndamento++; break;
                    case 'concluida': stats.concluidas++; break;
                }
                
                // Urgentes
                if (tarefa.prioridade === 'critica' || tarefa.prioridade === 'alta') {
                    stats.urgentes++;
                }
                
                // Progresso
                somaProgresso += tarefa.progresso || 0;
                
                // Tempo estimado
                if (tarefa.estimativa && tarefa.status !== 'concluida') {
                    stats.tempoEstimado += tarefa.estimativa;
                }
                
                // Tarefas de hoje
                if (tarefa.dataFim === hoje || tarefa.dataInicio === hoje) {
                    stats.tarefasTotalHoje++;
                    if (tarefa.status === 'concluida') {
                        stats.tarefasConcluidasHoje++;
                    }
                }
            });
            
            // Calcular médias
            if (tarefas.length > 0) {
                stats.progressoMedio = Math.round(somaProgresso / tarefas.length);
            }
            
            if (stats.tarefasTotalHoje > 0) {
                stats.produtividadeHoje = Math.round((stats.tarefasConcluidasHoje / stats.tarefasTotalHoje) * 100);
            }
            
            // Converter tempo para horas
            stats.tempoEstimado = Math.round(stats.tempoEstimado / 60 * 10) / 10;
            
            this.state.estatisticasPessoais = stats;

        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas pessoais:', error);
            this.state.estatisticasPessoais = {};
        }
    },

    // ✅ OBTER USUÁRIO ATUAL
    _obterUsuarioAtual() {
        // Tentar várias fontes para identificar o usuário atual
        if (App.estadoSistema?.usuarioNome) {
            return App.estadoSistema.usuarioNome;
        }
        
        if (App.usuarioAtual?.displayName) {
            return App.usuarioAtual.displayName;
        }
        
        if (App.usuarioAtual?.email) {
            return App.usuarioAtual.email.split('@')[0];
        }
        
        // Fallback
        return 'Usuário Atual';
    },

    // ✅ ADICIONAR ESTILOS DO MODAL
    _adicionarEstilosModal() {
        const styleId = 'personalAgendaStyles';
        
        // Remover estilos existentes
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Modal Full-Screen */
            .modal-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-content-fullscreen {
                width: 95vw;
                height: 95vh;
                background: white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            }
            
            /* Header da Agenda */
            .agenda-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px 12px 0 0;
            }
            
            .agenda-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            
            .agenda-subtitle {
                margin: 4px 0 0 0;
                opacity: 0.9;
                font-size: 14px;
            }
            
            .agenda-controls {
                display: flex;
                gap: 8px;
                margin-right: 16px;
            }
            
            .view-selector {
                display: flex;
                gap: 4px;
                background: rgba(255, 255, 255, 0.1);
                padding: 4px;
                border-radius: 8px;
            }
            
            .view-btn {
                background: transparent;
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 16px;
            }
            
            .view-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .view-btn.active {
                background: rgba(255, 255, 255, 0.2);
                font-weight: bold;
            }
            
            /* Navegação */
            .agenda-nav {
                padding: 16px 24px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .agenda-nav-stats {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .stat-card {
                background: white;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                border: 2px solid #e2e8f0;
                transition: all 0.2s;
            }
            
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .stat-numero {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .stat-pendentes .stat-numero { color: #f59e0b; }
            .stat-andamento .stat-numero { color: #3b82f6; }
            .stat-concluidas .stat-numero { color: #10b981; }
            .stat-urgentes .stat-numero { color: #ef4444; }
            .stat-progresso .stat-numero { color: #8b5cf6; }
            
            /* Filtros */
            .filtros-container {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .filtros-container select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }
            
            /* Conteúdo Principal */
            .agenda-conteudo {
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                background: #f9fafb;
            }
            
            /* Dashboard Pessoal */
            .dashboard-pessoal {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto auto auto;
                gap: 24px;
                height: 100%;
            }
            
            .dashboard-metricas {
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
            }
            
            .metrica-card {
                background: white;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .metrica-card h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #374151;
            }
            
            .metrica-valor {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .metrica-desc {
                font-size: 14px;
                color: #6b7280;
            }
            
            .produtividade .metrica-valor { color: #10b981; }
            .tempo .metrica-valor { color: #f59e0b; }
            .streak .metrica-valor { color: #ef4444; }
            
            /* Footer */
            .agenda-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px;
                background: white;
                border-top: 1px solid #e2e8f0;
                border-radius: 0 0 12px 12px;
            }
            
            .agenda-sync-status {
                font-size: 14px;
                color: #6b7280;
            }
            
            .agenda-footer-right {
                display: flex;
                gap: 12px;
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .modal-content-fullscreen {
                    width: 100vw;
                    height: 100vh;
                    border-radius: 0;
                }
                
                .agenda-nav-stats {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .dashboard-metricas {
                    grid-template-columns: 1fr;
                }
                
                .filtros-container {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
        `;
        
        document.head.appendChild(style);
    },

    // ✅ CONFIGURAR EVENTOS DO MODAL
    _configurarEventosModal() {
        // Fechar com ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    },

    // ✅ RENDERIZAR HELPERS (implementação básica)
    _renderizarGraficoProgresso() {
        return '<div style="text-align: center; color: #6b7280; padding: 20px;">📊 Gráfico será implementado</div>';
    },

    _renderizarTarefaMini(tarefa) {
        const corPrioridade = this.config.prioridades.find(p => p.value === tarefa.prioridade)?.cor || '#6b7280';
        return `
            <div class="tarefa-mini" style="border-left: 3px solid ${corPrioridade}">
                <span class="tarefa-titulo">${tarefa.titulo}</span>
                <span class="tarefa-progresso">${tarefa.progresso || 0}%</span>
            </div>
        `;
    },

    _renderizarTarefaUrgente(tarefa) {
        return `
            <div class="tarefa-urgente">
                🚨 <strong>${tarefa.titulo}</strong>
                ${tarefa.dataFim ? ` - Prazo: ${new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}` : ''}
            </div>
        `;
    },

    // ✅ PLACEHOLDER METHODS (a implementar)
    _organizarTarefasPorDia(inicioSemana) { return {}; },
    _formatarSemana(data) { return 'Semana atual'; },
    _isHoje(data) { return false; },
    _renderizarTarefaDia(tarefa) { return ''; },
    _renderizarTarefaCompleta(tarefa) { return ''; },
    _agruparTarefasPorStatus() { return {}; },
    _renderizarTarefaKanban(tarefa) { return ''; },
    _obterInicioSemana(data) { return new Date(); },
    _configurarEventosView() {},
    
    navegarSemana(direcao) { console.log('Navegar semana:', direcao); },
    adicionarTarefaDia(data) { console.log('Adicionar tarefa:', data); },
    ordenarTarefas(criterio) { console.log('Ordenar por:', criterio); },
    adicionarTarefaStatus(status) { console.log('Adicionar tarefa status:', status); },
    dropTarefa(event) { console.log('Drop tarefa:', event); }
};

// ✅ INTEGRAÇÃO COM TASKS.JS EXISTENTE
if (typeof Tasks !== 'undefined') {
    // Estender Tasks.js com funcionalidade híbrida
    Tasks.abrirMinhaAgenda = PersonalAgenda.abrirMinhaAgenda.bind(PersonalAgenda);
    
    // Sobrescrever método para fechar modal da agenda
    const originalFecharModal = Tasks.fecharModal;
    Tasks.fecharModal = function() {
        if (PersonalAgenda.state.modalAberto) {
            PersonalAgenda.fecharModal();
        } else {
            originalFecharModal.call(this);
        }
    };
}

// ✅ FUNÇÃO GLOBAL PARA DEBUG
window.PersonalAgenda_Debug = {
    abrirAgenda: (usuario) => PersonalAgenda.abrirMinhaAgenda(usuario),
    stats: () => PersonalAgenda.state.estatisticasPessoais,
    tarefas: () => PersonalAgenda._obterMinhasTarefas(),
    usuario: () => PersonalAgenda.state.usuarioAtual,
    views: () => PersonalAgenda.config.viewModes.map(v => v.value)
};

// ✅ ADICIONAR BOTÃO AO DASHBOARD (se não existir)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const dashboard = document.getElementById('dashboardExecutivo');
        if (dashboard && !document.getElementById('btnMinhaAgenda')) {
            const botaoAgenda = document.createElement('button');
            botaoAgenda.id = 'btnMinhaAgenda';
            botaoAgenda.className = 'btn btn-primary btn-agenda';
            botaoAgenda.innerHTML = '📋 Minha Agenda';
            botaoAgenda.onclick = () => PersonalAgenda.abrirMinhaAgenda();
            
            botaoAgenda.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            `;
            
            document.body.appendChild(botaoAgenda);
            console.log('📋 Botão "Minha Agenda" adicionado ao dashboard');
        }
    }, 2000);
});

console.log('📋 Sistema Híbrido - Minha Agenda v6.5.0 carregado!');
console.log('🎯 Funcionalidades: Modal full-screen, Dashboard pessoal, 4 views diferentes');
console.log('✅ Integração: Tasks.js estendido, PersonalAgenda independente');
console.log('🧪 Debug: PersonalAgenda_Debug.abrirAgenda(), PersonalAgenda_Debug.stats()');
