/* ========== 📋 SISTEMA HÍBRIDO - MINHA AGENDA v6.5.2 - USUÁRIO DINÂMICO ========== */

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

    // ✅ ESTADO INTERNO - REMOVIDO HARDCODE ISABELLA
    state: {
        pessoaAtual: null, // 🔧 CORREÇÃO: Removido hardcode 'Isabella'
        modalAberto: false,
        editandoTarefa: null,
        agendaSelecionada: 'semanal',
        filtroAtivo: 'todos',
        sincronizacaoAtiva: true
    },

    // ✅ INICIALIZAÇÃO
    init() {
        try {
            console.log('📋 Inicializando PersonalAgenda v6.5.2 (Dinâmico)...');
            
            // 🔧 CORREÇÃO: Definir usuário atual dinamicamente
            this._definirUsuarioAtual();
            
            // Verificar dependências
            if (!this._verificarDependencias()) {
                console.warn('⚠️ Algumas dependências não disponíveis');
            }
            
            // Configurar eventos globais
            this._configurarEventosGlobais();
            
            console.log(`✅ PersonalAgenda inicializado para: ${this.state.pessoaAtual}`);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar PersonalAgenda:', error);
        }
    },

    // 🔧 NOVA FUNÇÃO: DEFINIR USUÁRIO ATUAL DINAMICAMENTE
    _definirUsuarioAtual() {
        try {
            // Prioridade 1: Usuário do App.js (Firebase Auth)
            if (App && App.usuarioAtual && App.usuarioAtual.email) {
                this.state.pessoaAtual = this._extrairNomeDoEmail(App.usuarioAtual.email);
                console.log(`👤 Usuário definido via App.usuarioAtual: ${this.state.pessoaAtual}`);
                return;
            }
            
            // Prioridade 2: Usuário do Auth.js
            if (typeof Auth !== 'undefined' && Auth.state && Auth.state.usuarioAtual) {
                const usuario = Auth.state.usuarioAtual;
                this.state.pessoaAtual = usuario.displayName || this._extrairNomeDoEmail(usuario.email);
                console.log(`👤 Usuário definido via Auth.state: ${this.state.pessoaAtual}`);
                return;
            }
            
            // Prioridade 3: Função global obterUsuarioAtual (se existir)
            if (typeof obterUsuarioAtual === 'function') {
                const usuario = obterUsuarioAtual();
                if (usuario && usuario.nome) {
                    this.state.pessoaAtual = usuario.nome;
                    console.log(`👤 Usuário definido via obterUsuarioAtual(): ${this.state.pessoaAtual}`);
                    return;
                }
            }
            
            // Fallback: Usuário padrão para desenvolvimento
            this.state.pessoaAtual = 'Usuário';
            console.warn(`⚠️ Usuário não identificado - usando fallback: ${this.state.pessoaAtual}`);
            
        } catch (error) {
            console.error('❌ Erro ao definir usuário atual:', error);
            this.state.pessoaAtual = 'Usuário';
        }
    },

    // 🔧 NOVA FUNÇÃO: EXTRAIR NOME DO EMAIL
    _extrairNomeDoEmail(email) {
        if (!email) return 'Usuário';
        
        // Para renatoremiro@biapo.com.br -> Renato Remiro
        const parteLocal = email.split('@')[0];
        
        // Casos especiais conhecidos
        const mapaUsuarios = {
            'renatoremiro': 'Renato Remiro',
            'isabella': 'Isabella',
            'eduardo': 'Eduardo', 
            'lara': 'Lara',
            'beto': 'Beto',
            'admin': 'Administrador'
        };
        
        if (mapaUsuarios[parteLocal.toLowerCase()]) {
            return mapaUsuarios[parteLocal.toLowerCase()];
        }
        
        // Caso geral: capitalizar primeira letra
        return parteLocal.charAt(0).toUpperCase() + parteLocal.slice(1);
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

    // ✅ ABRIR MINHA AGENDA - FUNÇÃO PRINCIPAL COM CORREÇÃO
    abrirMinhaAgenda(pessoa = null) {
        try {
            // 🔧 CORREÇÃO: Usar usuário passado ou usuário atual dinâmico
            if (pessoa) {
                this.state.pessoaAtual = pessoa;
            } else {
                // Re-definir usuário atual se não foi passado
                this._definirUsuarioAtual();
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

    // ✅ CRIAR MODAL DA AGENDA - ATUALIZADO COM USUÁRIO DINÂMICO
    _criarModalAgenda() {
        const modal = document.createElement('div');
        modal.id = 'modalMinhaAgenda';
        modal.className = 'modal';
        
        // 🔧 CORREÇÃO: Título dinâmico com usuário atual
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 80vh;">
                <div class="modal-header">
                    <h3>📋 Minha Agenda - ${this.state.pessoaAtual}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                
                <div class="modal-body" style="overflow-y: auto;">
                    <!-- Info do Usuário -->
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #0ea5e9;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">👤</span>
                            <div>
                                <strong style="color: #0369a1;">Usuário Logado: ${this.state.pessoaAtual}</strong>
                                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                                    Email: ${this._obterEmailUsuarioAtual() || 'Não disponível'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
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

    // 🔧 NOVA FUNÇÃO: OBTER EMAIL DO USUÁRIO ATUAL
    _obterEmailUsuarioAtual() {
        try {
            if (App && App.usuarioAtual && App.usuarioAtual.email) {
                return App.usuarioAtual.email;
            }
            
            if (typeof Auth !== 'undefined' && Auth.state && Auth.state.usuarioAtual) {
                return Auth.state.usuarioAtual.email;
            }
            
            if (typeof obterUsuarioAtual === 'function') {
                const usuario = obterUsuarioAtual();
                return usuario ? usuario.email : null;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao obter email do usuário:', error);
            return null;
        }
    },

    // ✅ RENDERIZAR CONTEÚDO DA AGENDA - COM FILTRO POR USUÁRIO
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
            
            return html || `
                <div style="text-align: center; color: #6b7280; padding: 40px;">
                    <p>📭 Nenhuma tarefa encontrada para <strong>${this.state.pessoaAtual}</strong>.</p>
                    <p style="font-size: 14px; margin-top: 8px;">
                        <button class="btn btn-primary btn-sm" onclick="PersonalAgenda.mostrarNovaTarefa()">
                            ➕ Criar primeira tarefa
                        </button>
                    </p>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Erro ao renderizar agenda:', error);
            return '<p style="text-align: center; color: #ef4444; padding: 40px;">Erro ao carregar agenda.</p>';
        }
    },

    // ✅ OBTER AGENDA SEMANAL - COM FILTRO POR USUÁRIO DINÂMICO
    _obterAgendaSemanal() {
        try {
            if (!App.dados?.agendas?.[this.state.pessoaAtual]) {
                console.log(`📋 Nenhuma agenda semanal encontrada para: ${this.state.pessoaAtual}`);
                return {};
            }
            
            const agenda = App.dados.agendas[this.state.pessoaAtual] || {};
            console.log(`📋 Agenda semanal carregada para ${this.state.pessoaAtual}:`, Object.keys(agenda));
            
            return agenda;
            
        } catch (error) {
            console.error('❌ Erro ao obter agenda semanal:', error);
            return {};
        }
    },

    // ✅ OBTER TAREFAS ESPECÍFICAS - COM FILTRO POR USUÁRIO DINÂMICO  
    _obterTarefasEspecificas() {
        try {
            if (!App.dados?.tarefas) {
                console.log('📋 Nenhuma tarefa específica encontrada nos dados');
                return [];
            }
            
            // 🔧 CORREÇÃO: Filtrar tarefas por usuário atual dinâmico
            const tarefasDoUsuario = App.dados.tarefas.filter(tarefa => {
                // Tarefa é do usuário atual se:
                // 1. responsavel é o usuário atual
                // 2. pessoas inclui o usuário atual
                // 3. nome do usuário atual está na lista de participantes
                
                const ehResponsavel = tarefa.responsavel === this.state.pessoaAtual;
                const ehParticipante = tarefa.pessoas?.includes(this.state.pessoaAtual);
                const ehNaAgendaSemanal = tarefa.agendaSemanal === false || !tarefa.agendaSemanal;
                
                return ehNaAgendaSemanal && (ehResponsavel || ehParticipante);
            });
            
            console.log(`📋 ${tarefasDoUsuario.length} tarefas específicas encontradas para: ${this.state.pessoaAtual}`);
            
            return tarefasDoUsuario;
            
        } catch (error) {
            console.error('❌ Erro ao obter tarefas específicas:', error);
            return [];
        }
    },

    // ✅ MOSTRAR NOVA TAREFA - COM USUÁRIO DINÂMICO
    mostrarNovaTarefa(tipo = 'pessoal') {
        try {
            // Verificar se Tasks está disponível
            if (typeof Tasks !== 'undefined' && typeof Tasks.mostrarNovaTarefa === 'function') {
                // 🔧 CORREÇÃO: Passar usuário atual como responsável
                Tasks.mostrarNovaTarefa(tipo, this.state.pessoaAtual);
            } else {
                // Implementação simplificada
                this._mostrarModalNovaTarefa(tipo);
            }
            
        } catch (error) {
            console.error('❌ Erro ao mostrar nova tarefa:', error);
        }
    },

    // ✅ MODAL SIMPLIFICADO NOVA TAREFA - COM USUÁRIO DINÂMICO
    _mostrarModalNovaTarefa(tipo) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📝 Nova Tarefa - ${this.state.pessoaAtual}</h3>
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
                            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Responsável:</label>
                            <input type="text" name="responsavel" value="${this.state.pessoaAtual}" readonly style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; background: #f9fafb;">
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

    // ✅ SALVAR NOVA TAREFA - COM USUÁRIO DINÂMICO
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
                responsavel: this.state.pessoaAtual, // 🔧 CORREÇÃO: Usar usuário dinâmico
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
                Notifications.success(`Tarefa criada para ${this.state.pessoaAtual}!`);
            }
            
            console.log(`✅ Nova tarefa criada para ${this.state.pessoaAtual}:`, novaTarefa.titulo);
            
        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao salvar tarefa');
            }
        }
    },

    // ✅ RENDERIZAR AGENDA SEMANAL - MANTIDO IGUAL
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

    // ✅ RENDERIZAR TAREFAS ESPECÍFICAS - MANTIDO IGUAL
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

    // ✅ TODAS AS OUTRAS FUNÇÕES MANTIDAS IGUAIS...
    // (renderizarItemTarefa, filtrarTarefas, marcarConcluida, etc.)
    
    // ✅ RENDERIZAR ITEM DE TAREFA - MANTIDO IGUAL
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

    // ✅ FILTRAR TAREFAS - MANTIDO IGUAL
    _filtrarTarefas(tarefas) {
        if (this.state.filtroAtivo === 'todos') {
            return tarefas;
        }
        
        return tarefas.filter(tarefa => tarefa.status === this.state.filtroAtivo);
    },

    // ✅ AGRUPAR TAREFAS POR DATA - MANTIDO IGUAL
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

    // ✅ CONFIGURAR EVENT LISTENERS DO MODAL - MANTIDO IGUAL
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

    // ✅ ATUALIZAR CONTEÚDO DO MODAL - MANTIDO IGUAL
    _atualizarConteudoModal() {
        const content = document.getElementById('agendaContent');
        if (content) {
            content.innerHTML = this._renderizarConteudoAgenda();
        }
    },

    // ✅ TODAS AS OUTRAS FUNÇÕES MANTIDAS IGUAIS...
    // (marcarConcluida, excluirTarefa, sincronizarComCalendario, etc.)

    // ✅ MARCAR COMO CONCLUÍDA - MANTIDO IGUAL
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

    // ✅ EXCLUIR TAREFA - MANTIDO IGUAL
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

    // ✅ SINCRONIZAR COM CALENDÁRIO - MANTIDO IGUAL
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

    // ✅ ENCONTRAR TAREFA - MANTIDO IGUAL
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

    // ✅ SALVAR ALTERAÇÕES - MANTIDO IGUAL
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

    // ✅ CONFIGURAR EVENTOS GLOBAIS - MANTIDO IGUAL
    _configurarEventosGlobais() {
        // Placeholder para eventos globais se necessário
    },

    // ✅ OBTER STATUS DO SISTEMA - ATUALIZADO COM USUÁRIO DINÂMICO
    obterStatus() {
        return {
            pessoaAtual: this.state.pessoaAtual,
            emailAtual: this._obterEmailUsuarioAtual(),
            modalAberto: this.state.modalAberto,
            agendaSelecionada: this.state.agendaSelecionada,
            filtroAtivo: this.state.filtroAtivo,
            sincronizacaoAtiva: this.state.sincronizacaoAtiva,
            dependenciasOk: this._verificarDependencias(),
            versao: '6.5.2 - Usuário Dinâmico'
        };
    },

    // ✅ FUNÇÕES ADICIONAIS PLACEHOLDER - MANTIDAS IGUAIS
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
console.log('📋 Sistema de Agenda Pessoal v6.5.2 - USUÁRIO DINÂMICO IMPLEMENTADO!');
console.log('✅ CORREÇÃO: Removido hardcode "Isabella" - agora usa usuário logado');
console.log('🧪 Verificar: typeof window.PersonalAgenda =', typeof window.PersonalAgenda);
console.log('🎯 Funcionalidades: Agenda Semanal, Tarefas Específicas, Sincronização, CRUD completo');
console.log('⚙️ Integração: Tasks.js, HybridSync, Calendar.js + Auth dinâmico');
console.log('📱 Uso: PersonalAgenda.abrirMinhaAgenda() - detecta usuário automaticamente');
