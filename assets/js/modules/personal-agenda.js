/* ========== 📋 SISTEMA HÍBRIDO - MINHA AGENDA v6.5.1 - COMPLETO + WINDOW ========== */

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
            { value: 'concluida', label: 'Concluída', cor: '#10b981' },
            { value: 'cancelada', label: 'Cancelada', cor: '#ef4444' }
        ],
        diasSemana: [
            { value: 'segunda', label: 'Segunda-feira', abrev: 'Seg' },
            { value: 'terca', label: 'Terça-feira', abrev: 'Ter' },
            { value: 'quarta', label: 'Quarta-feira', abrev: 'Qua' },
            { value: 'quinta', label: 'Quinta-feira', abrev: 'Qui' },
            { value: 'sexta', label: 'Sexta-feira', abrev: 'Sex' },
            { value: 'sabado', label: 'Sábado', abrev: 'Sáb' },
            { value: 'domingo', label: 'Domingo', abrev: 'Dom' }
        ]
    },

    // ✅ ESTADO INTERNO
    state: {
        pessoaAtual: 'Isabella',
        modalAberto: false,
        editandoTarefa: null,
        agendaSelecionada: 'semanal',
        filtroAtivo: 'todos',
        sincronizacaoAtiva: true
    },

    // ✅ INICIALIZAÇÃO
    init() {
        try {
            console.log('📋 Inicializando PersonalAgenda v6.5.1...');
            
            // Verificar dependências
            if (!this._verificarDependencias()) {
                console.warn('⚠️ Algumas dependências não disponíveis');
            }
            
            // Configurar eventos globais
            this._configurarEventosGlobais();
            
            console.log('✅ PersonalAgenda inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar PersonalAgenda:', error);
        }
    },

    // ✅ VERIFICAR DEPENDÊNCIAS
    _verificarDependencias() {
        const dependencias = {
            App: typeof App !== 'undefined' && App.dados,
            Helpers: typeof Helpers !== 'undefined',
            Notifications: typeof Notifications !== 'undefined'
        };
        
        Object.entries(dependencias).forEach(([nome, disponivel]) => {
            if (!disponivel) {
                console.warn(`⚠️ ${nome} não disponível para PersonalAgenda`);
            }
        });
        
        return dependencias.App;
    },

    // ✅ ABRIR MINHA AGENDA - FUNÇÃO PRINCIPAL
    abrirMinhaAgenda(pessoa = null) {
        try {
            if (pessoa) {
                this.state.pessoaAtual = pessoa;
            }
            
            console.log(`📋 Abrindo agenda de ${this.state.pessoaAtual}`);
            
            // Remover modal existente
            const modalExistente = document.getElementById('modalMinhaAgenda');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            // Criar modal da agenda
            this._criarModalAgenda();
            
        } catch (error) {
            console.error('❌ Erro ao abrir agenda:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir agenda pessoal');
            }
        }
    },

    // ✅ CRIAR MODAL DA AGENDA
    _criarModalAgenda() {
        const modal = document.createElement('div');
        modal.id = 'modalMinhaAgenda';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 80vh;">
                <div class="modal-header">
                    <h3>📋 Minha Agenda - ${this.state.pessoaAtual}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                
                <div class="modal-body" style="overflow-y: auto;">
                    <!-- Controles -->
                    <div class="agenda-controles" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <select id="tipoAgendaSelect" style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <option value="semanal">📅 Agenda Semanal</option>
                                <option value="tarefas">📝 Tarefas Específicas</option>
                                <option value="ambas">🔄 Todas</option>
                            </select>
                            
                            <select id="filtroStatusSelect" style="padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <option value="todos">Todos os status</option>
                                <option value="pendente">Pendentes</option>
                                <option value="andamento">Em andamento</option>
                                <option value="concluida">Concluídas</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-success btn-sm" onclick="PersonalAgenda.mostrarNovaTarefa()">
                                ➕ Nova Tarefa
                            </button>
                            <button class="btn btn-info btn-sm" onclick="PersonalAgenda.sincronizarComCalendario()">
                                🔄 Sincronizar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Conteúdo da Agenda -->
                    <div id="agendaContent">
                        ${this._renderizarConteudoAgenda()}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        ✅ Fechar
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar event listeners
        this._configurarEventListenersModal(modal);
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        this.state.modalAberto = true;
    },

    // ✅ RENDERIZAR CONTEÚDO DA AGENDA
    _renderizarConteudoAgenda() {
        try {
            const agendaSemanal = this._obterAgendaSemanal();
            const tarefasEspecificas = this._obterTarefasEspecificas();
            
            let html = '';
            
            // Agenda Semanal
            if (this.state.agendaSelecionada === 'semanal' || this.state.agendaSelecionada === 'ambas') {
                html += this._renderizarAgendaSemanal(agendaSemanal);
            }
            
            // Tarefas Específicas
            if (this.state.agendaSelecionada === 'tarefas' || this.state.agendaSelecionada === 'ambas') {
                html += this._renderizarTarefasEspecificas(tarefasEspecificas);
            }
            
            return html || '<p style="text-align: center; color: #6b7280; padding: 40px;">Nenhuma tarefa encontrada.</p>';
            
        } catch (error) {
            console.error('❌ Erro ao renderizar agenda:', error);
            return '<p style="text-align: center; color: #ef4444; padding: 40px;">Erro ao carregar agenda.</p>';
        }
    },

    // ✅ RENDERIZAR AGENDA SEMANAL
    _renderizarAgendaSemanal(agenda) {
        let html = '<h4 style="color: #3b82f6; margin: 16px 0 8px 0;">📅 Agenda Semanal Recorrente</h4>';
        
        this.config.diasSemana.forEach(dia => {
            const tarefasDia = agenda[dia.value] || [];
            const tarefasFiltradas = this._filtrarTarefas(tarefasDia);
            
            if (tarefasFiltradas.length > 0) {
                html += `
                    <div class="dia-agenda" style="margin: 12px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <div style="background: #f3f4f6; padding: 8px 12px; font-weight: bold; color: #374151;">
                            ${dia.icon || '📅'} ${dia.label}
                        </div>
                        <div style="padding: 8px;">
                            ${tarefasFiltradas.map(tarefa => this._renderizarItemTarefa(tarefa, true)).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        return html;
    },

    // ✅ RENDERIZAR TAREFAS ESPECÍFICAS
    _renderizarTarefasEspecificas(tarefas) {
        const tarefasFiltradas = this._filtrarTarefas(tarefas);
        
        if (tarefasFiltradas.length === 0) {
            return '';
        }
        
        let html = '<h4 style="color: #f59e0b; margin: 16px 0 8px 0;">📝 Tarefas Específicas</h4>';
        
        // Agrupar por data
        const tarefasPorData = this._agruparTarefasPorData(tarefasFiltradas);
        
        Object.entries(tarefasPorData).forEach(([data, tarefasData]) => {
            const dataFormatada = data === 'sem_data' ? 'Sem data definida' : new Date(data).toLocaleDateString('pt-BR');
            
            html += `
                <div class="data-agenda" style="margin: 12px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background: #fef3c7; padding: 8px 12px; font-weight: bold; color: #92400e;">
                        📅 ${dataFormatada}
                    </div>
                    <div style="padding: 8px;">
                        ${tarefasData.map(tarefa => this._renderizarItemTarefa(tarefa, false)).join('')}
                    </div>
                </div>
            `;
        });
        
        return html;
    },

    // ✅ RENDERIZAR ITEM DE TAREFA
    _renderizarItemTarefa(tarefa, ehSemanal) {
        const tipoConfig = this.config.tipos.find(t => t.value === tarefa.tipo) || this.config.tipos[0];
        const statusConfig = this.config.status.find(s => s.value === tarefa.status) || this.config.status[0];
        const prioridadeConfig = this.config.prioridades.find(p => p.value === tarefa.prioridade) || this.config.prioridades[1];
        
        const horario = tarefa.horarioInicio || tarefa.horario || '';
        const indicadorSincronizacao = tarefa.sincronizada ? '🔄' : (tarefa.promovido ? '⬆️' : '');
        
        return `
            <div class="tarefa-item" style="
                border-left: 4px solid ${tipoConfig.cor};
                padding: 12px;
                margin: 8px 0;
                background: ${tarefa.status === 'concluida' ? '#f0f9ff' : 'white'};
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                opacity: ${tarefa.status === 'concluida' ? '0.7' : '1'};
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-weight: bold; ${tarefa.status === 'concluida' ? 'text-decoration: line-through;' : ''}">${tarefa.titulo}</span>
                            ${indicadorSincronizacao ? `<span title="${tarefa.sincronizada ? 'Sincronizada com calendário' : 'Promovida para evento'}">${indicadorSincronizacao}</span>` : ''}
                        </div>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <span style="background: ${tipoConfig.cor}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px;">
                                ${tipoConfig.icon} ${tipoConfig.label}
                            </span>
                            <span style="background: ${statusConfig.cor}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px;">
                                ${statusConfig.label}
                            </span>
                            <span style="background: ${prioridadeConfig.cor}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px;">
                                ${prioridadeConfig.label}
                            </span>
                            ${ehSemanal ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px;">Recorrente</span>' : ''}
                        </div>
                    </div>
                    
                    ${horario ? `<span style="color: #6b7280; font-size: 12px; font-weight: bold;">${horario}</span>` : ''}
                </div>
                
                ${tarefa.descricao ? `<p style="margin: 8px 0; color: #6b7280; font-size: 13px;">${tarefa.descricao}</p>` : ''}
                
                ${tarefa.progresso !== undefined ? `
                    <div style="margin: 8px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 12px; color: #6b7280;">Progresso</span>
                            <span style="font-size: 12px; font-weight: bold; color: #374151;">${tarefa.progresso}%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${tarefa.progresso}%; height: 100%; background: ${tipoConfig.cor}; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Botões de Ação -->
                <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="PersonalAgenda.editarTarefa(${tarefa.id})" style="font-size: 11px; padding: 4px 8px;">
                        ✏️ Editar
                    </button>
                    
                    ${tarefa.status !== 'concluida' ? `
                        <button class="btn btn-success btn-sm" onclick="PersonalAgenda.marcarConcluida(${tarefa.id})" style="font-size: 11px; padding: 4px 8px;">
                            ✅ Concluir
                        </button>
                    ` : `
                        <button class="btn btn-warning btn-sm" onclick="PersonalAgenda.reabrirTarefa(${tarefa.id})" style="font-size: 11px; padding: 4px 8px;">
                            🔄 Reabrir
                        </button>
                    `}
                    
                    ${!tarefa.sincronizada && !tarefa.promovido ? `
                        <button class="btn btn-info btn-sm" onclick="PersonalAgenda.promoverParaEvento(${tarefa.id})" style="font-size: 11px; padding: 4px 8px;">
                            ⬆️ Promover
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-danger btn-sm" onclick="PersonalAgenda.excluirTarefa(${tarefa.id})" style="font-size: 11px; padding: 4px 8px;">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    },

    // ✅ OBTER AGENDA SEMANAL
    _obterAgendaSemanal() {
        try {
            if (!App.dados?.agendas?.[this.state.pessoaAtual]) {
                return {};
            }
            
            return App.dados.agendas[this.state.pessoaAtual] || {};
            
        } catch (error) {
            console.error('❌ Erro ao obter agenda semanal:', error);
            return {};
        }
    },

    // ✅ OBTER TAREFAS ESPECÍFICAS
    _obterTarefasEspecificas() {
        try {
            if (!App.dados?.tarefas) {
                return [];
            }
            
            return App.dados.tarefas.filter(tarefa => 
                !tarefa.agendaSemanal && 
                (tarefa.responsavel === this.state.pessoaAtual || 
                 tarefa.pessoas?.includes(this.state.pessoaAtual))
            );
            
        } catch (error) {
            console.error('❌ Erro ao obter tarefas específicas:', error);
            return [];
        }
    },

    // ✅ FILTRAR TAREFAS
    _filtrarTarefas(tarefas) {
        if (this.state.filtroAtivo === 'todos') {
            return tarefas;
        }
        
        return tarefas.filter(tarefa => tarefa.status === this.state.filtroAtivo);
    },

    // ✅ AGRUPAR TAREFAS POR DATA
    _agruparTarefasPorData(tarefas) {
        const grupos = {};
        
        tarefas.forEach(tarefa => {
            const data = tarefa.dataInicio || tarefa.dataFim || 'sem_data';
            
            if (!grupos[data]) {
                grupos[data] = [];
            }
            grupos[data].push(tarefa);
        });
        
        return grupos;
    },

    // ✅ CONFIGURAR EVENT LISTENERS DO MODAL
    _configurarEventListenersModal(modal) {
        // Filtro de tipo de agenda
        const tipoSelect = modal.querySelector('#tipoAgendaSelect');
        if (tipoSelect) {
            tipoSelect.addEventListener('change', (e) => {
                this.state.agendaSelecionada = e.target.value;
                this._atualizarConteudoModal();
            });
        }
        
        // Filtro de status
        const statusSelect = modal.querySelector('#filtroStatusSelect');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.state.filtroAtivo = e.target.value;
                this._atualizarConteudoModal();
            });
        }
    },

    // ✅ ATUALIZAR CONTEÚDO DO MODAL
    _atualizarConteudoModal() {
        const content = document.getElementById('agendaContent');
        if (content) {
            content.innerHTML = this._renderizarConteudoAgenda();
        }
    },

    // ✅ MOSTRAR NOVA TAREFA
    mostrarNovaTarefa(tipo = 'pessoal') {
        try {
            // Verificar se Tasks está disponível
            if (typeof Tasks !== 'undefined' && typeof Tasks.mostrarNovaTarefa === 'function') {
                Tasks.mostrarNovaTarefa(tipo);
            } else {
                // Implementação simplificada
                this._mostrarModalNovaTarefa(tipo);
            }
            
        } catch (error) {
            console.error('❌ Erro ao mostrar nova tarefa:', error);
        }
    },

    // ✅ MODAL SIMPLIFICADO NOVA TAREFA
    _mostrarModalNovaTarefa(tipo) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📝 Nova Tarefa</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovaTarefa">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Título:</label>
                            <input type="text" name="titulo" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Tipo:</label>
                            <select name="tipo" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                ${this.config.tipos.map(t => `<option value="${t.value}" ${t.value === tipo ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Descrição:</label>
                            <textarea name="descricao" rows="3" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"></textarea>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Data:</label>
                            <input type="date" name="dataInicio" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn btn-primary" onclick="PersonalAgenda._salvarNovaTarefa(this)">Salvar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    },

    // ✅ SALVAR NOVA TAREFA
    _salvarNovaTarefa(botao) {
        try {
            const form = document.getElementById('formNovaTarefa');
            const formData = new FormData(form);
            
            const novaTarefa = {
                id: Date.now(),
                titulo: formData.get('titulo'),
                tipo: formData.get('tipo'),
                descricao: formData.get('descricao'),
                dataInicio: formData.get('dataInicio') || null,
                status: 'pendente',
                prioridade: 'media',
                responsavel: this.state.pessoaAtual,
                progresso: 0,
                dataCriacao: new Date().toISOString()
            };
            
            // Adicionar aos dados
            if (!App.dados.tarefas) {
                App.dados.tarefas = [];
            }
            App.dados.tarefas.push(novaTarefa);
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }
            
            // Fechar modal
            botao.closest('.modal').remove();
            
            // Atualizar agenda se estiver aberta
            if (this.state.modalAberto) {
                this._atualizarConteudoModal();
            }
            
            // Notificação
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa criada com sucesso!');
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao salvar tarefa');
            }
        }
    },

    // ✅ MARCAR COMO CONCLUÍDA
    marcarConcluida(tarefaId) {
        try {
            const tarefa = this._encontrarTarefa(tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            tarefa.status = 'concluida';
            tarefa.progresso = 100;
            tarefa.dataConclusao = new Date().toISOString();
            
            this._salvarAlteracoes();
            this._atualizarConteudoModal();
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Tarefa "${tarefa.titulo}" concluída!`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao marcar tarefa como concluída:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao concluir tarefa');
            }
        }
    },

    // ✅ EXCLUIR TAREFA
    excluirTarefa(tarefaId) {
        try {
            const tarefa = this._encontrarTarefa(tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            if (!confirm(`Excluir tarefa "${tarefa.titulo}"?`)) {
                return;
            }
            
            // Remover da agenda semanal se for o caso
            if (tarefa.agendaSemanal && tarefa.diaSemana) {
                const agenda = App.dados.agendas[this.state.pessoaAtual];
                if (agenda && agenda[tarefa.diaSemana]) {
                    agenda[tarefa.diaSemana] = agenda[tarefa.diaSemana].filter(t => t.id !== tarefaId);
                }
            }
            
            // Remover das tarefas específicas
            if (App.dados.tarefas) {
                App.dados.tarefas = App.dados.tarefas.filter(t => t.id !== tarefaId);
            }
            
            this._salvarAlteracoes();
            this._atualizarConteudoModal();
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa excluída com sucesso!');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao excluir tarefa');
            }
        }
    },

    // ✅ SINCRONIZAR COM CALENDÁRIO
    sincronizarComCalendario() {
        try {
            console.log('🔄 Sincronizando agenda com calendário...');
            
            // Verificar se HybridSync está disponível
            if (typeof HybridSync !== 'undefined' && typeof HybridSync.sincronizarEventosParaTarefas === 'function') {
                HybridSync.sincronizarEventosParaTarefas();
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('Sincronização iniciada!');
                }
            } else {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Sistema de sincronização não disponível');
                }
            }
            
            // Atualizar conteúdo
            setTimeout(() => {
                this._atualizarConteudoModal();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro na sincronização');
            }
        }
    },

    // ✅ ENCONTRAR TAREFA
    _encontrarTarefa(tarefaId) {
        // Buscar em tarefas específicas
        if (App.dados?.tarefas) {
            const tarefa = App.dados.tarefas.find(t => t.id === tarefaId);
            if (tarefa) return tarefa;
        }
        
        // Buscar na agenda semanal
        const agenda = App.dados?.agendas?.[this.state.pessoaAtual];
        if (agenda) {
            for (const dia of Object.values(agenda)) {
                if (Array.isArray(dia)) {
                    const tarefa = dia.find(t => t.id === tarefaId);
                    if (tarefa) return tarefa;
                }
            }
        }
        
        return null;
    },

    // ✅ SALVAR ALTERAÇÕES
    _salvarAlteracoes() {
        try {
            if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
                Persistence.salvarDadosCritico();
            } else {
                // Fallback para localStorage
                if (typeof Helpers !== 'undefined' && Helpers.storage) {
                    Helpers.storage.set('app_dados_backup', App.dados);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    },

    // ✅ CONFIGURAR EVENTOS GLOBAIS
    _configurarEventosGlobais() {
        // Placeholder para eventos globais se necessário
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            pessoaAtual: this.state.pessoaAtual,
            modalAberto: this.state.modalAberto,
            agendaSelecionada: this.state.agendaSelecionada,
            filtroAtivo: this.state.filtroAtivo,
            sincronizacaoAtiva: this.state.sincronizacaoAtiva,
            dependenciasOk: this._verificarDependencias(),
            versao: '6.5.1'
        };
    },

    // ✅ FUNÇÕES ADICIONAIS PLACEHOLDER
    editarTarefa(tarefaId) {
        console.log('📝 Editando tarefa:', tarefaId);
        // Implementação futura ou delegação para Tasks.js
        if (typeof Tasks !== 'undefined' && typeof Tasks.editarTarefa === 'function') {
            Tasks.editarTarefa(tarefaId);
        } else {
            if (typeof Notifications !== 'undefined') {
                Notifications.info('Função de edição será implementada em breve');
            }
        }
    },

    reabrirTarefa(tarefaId) {
        try {
            const tarefa = this._encontrarTarefa(tarefaId);
            if (!tarefa) return;
            
            tarefa.status = 'pendente';
            tarefa.progresso = 0;
            delete tarefa.dataConclusao;
            
            this._salvarAlteracoes();
            this._atualizarConteudoModal();
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Tarefa reaberta!');
            }
        } catch (error) {
            console.error('❌ Erro ao reabrir tarefa:', error);
        }
    },

    promoverParaEvento(tarefaId) {
        console.log('⬆️ Promovendo tarefa para evento:', tarefaId);
        // Implementação futura ou delegação para HybridSync
        if (typeof HybridSync !== 'undefined') {
            // HybridSync.promoverTarefaParaEvento(tarefaId);
        }
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Função de promoção será implementada em breve');
        }
    }
};

// 🔧 CORREÇÃO CRÍTICA: EXPOR NO WINDOW GLOBAL
window.PersonalAgenda = PersonalAgenda;

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    if (typeof PersonalAgenda !== 'undefined') {
        PersonalAgenda.init();
    }
});

// ✅ LOG DE INICIALIZAÇÃO
console.log('📋 Sistema de Agenda Pessoal v6.5.1 COMPLETO e exposto no window!');
console.log('✅ CORREÇÃO: window.PersonalAgenda = PersonalAgenda adicionada');
console.log('🧪 Verificar: typeof window.PersonalAgenda =', typeof window.PersonalAgenda);
console.log('🎯 Funcionalidades: Agenda Semanal, Tarefas Específicas, Sincronização, CRUD completo');
console.log('⚙️ Integração: Tasks.js, HybridSync, Calendar.js');
console.log('📱 Uso: PersonalAgenda.abrirMinhaAgenda("Isabella")');
