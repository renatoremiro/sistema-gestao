/* ========== 📝 SISTEMA DE GESTÃO DE TAREFAS v6.3.0 ========== */

const Tasks = {
    // ✅ CONFIGURAÇÕES
    config: {
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
        diasSemana: [
            { value: 'domingo', label: 'Domingo' },
            { value: 'segunda', label: 'Segunda-feira' },
            { value: 'terca', label: 'Terça-feira' },
            { value: 'quarta', label: 'Quarta-feira' },
            { value: 'quinta', label: 'Quinta-feira' },
            { value: 'sexta', label: 'Sexta-feira' },
            { value: 'sabado', label: 'Sábado' }
        ],
        templates: [
            {
                nome: 'Reunião de Equipe',
                tipo: 'equipe',
                prioridade: 'media',
                estimativa: 60,
                subtarefas: ['Preparar pauta', 'Revisar relatórios', 'Definir próximos passos']
            },
            {
                nome: 'Revisão de Projeto',
                tipo: 'projeto',
                prioridade: 'alta',
                estimativa: 120,
                subtarefas: ['Analisar documentação', 'Verificar especificações', 'Aprovar entregas']
            },
            {
                nome: 'Tarefa Urgente',
                tipo: 'urgente',
                prioridade: 'critica',
                estimativa: 30,
                subtarefas: ['Avaliar situação', 'Implementar solução', 'Validar resultado']
            },
            {
                nome: 'Atividade Diária',
                tipo: 'rotina',
                prioridade: 'baixa',
                estimativa: 15,
                agendaSemanal: true,
                subtarefas: ['Verificar emails', 'Atualizar status']
            }
        ]
    },

    // ✅ ESTADO INTERNO
    state: {
        modalAtivo: false,
        tarefaEditando: null,
        filtroAtivo: 'todos',
        ordenacaoAtiva: 'prioridade',
        pessoaSelecionada: null,
        buscarTexto: '',
        estatisticas: null,
        agendaSemanaSelecionada: new Date()
    },

    // ✅ MOSTRAR MODAL DE NOVA TAREFA
    mostrarNovaTarefa(tipoInicial = 'pessoal', responsavelInicial = null) {
        try {
            console.log('📝 Abrindo modal de nova tarefa:', tipoInicial);
            
            // Limpar estado anterior
            this.state.tarefaEditando = null;
            
            // Criar modal
            this._criarModalTarefa(tipoInicial, responsavelInicial);
            
            this.state.modalAtivo = true;
            console.log('✅ Modal de nova tarefa criado');

        } catch (error) {
            console.error('❌ Erro ao mostrar modal de nova tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir modal de tarefa');
            }
        }
    },

    // ✅ EDITAR TAREFA EXISTENTE
    editarTarefa(id) {
        try {
            console.log('✏️ Editando tarefa:', id);
            
            if (!App.dados?.tarefas) {
                throw new Error('Dados de tarefas não disponíveis');
            }
            
            const tarefa = App.dados.tarefas.find(t => t.id == id);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            // Configurar estado de edição
            this.state.tarefaEditando = id;
            
            // Criar modal com dados da tarefa
            this._criarModalTarefa(tarefa.tipo, tarefa.responsavel, tarefa);
            
            this.state.modalAtivo = true;
            console.log('✅ Modal de edição criado para tarefa:', tarefa.titulo);

        } catch (error) {
            console.error('❌ Erro ao editar tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao editar tarefa: ${error.message}`);
            }
        }
    },

    // ✅ SALVAR TAREFA (criar ou atualizar)
    async salvarTarefa(dadosTarefa) {
        try {
            console.log('💾 Salvando tarefa:', dadosTarefa.titulo);
            
            // Validar dados
            if (typeof Validation !== 'undefined') {
                const validacao = Validation.validateTask(dadosTarefa);
                if (!validacao.valido) {
                    throw new Error(validacao.erros.join(', '));
                }
            }
            
            // Garantir estrutura de tarefas
            if (!App.dados.tarefas) {
                App.dados.tarefas = [];
            }
            
            if (this.state.tarefaEditando) {
                // Atualizar tarefa existente
                const index = App.dados.tarefas.findIndex(t => t.id == this.state.tarefaEditando);
                if (index !== -1) {
                    App.dados.tarefas[index] = {
                        ...App.dados.tarefas[index],
                        ...dadosTarefa,
                        id: this.state.tarefaEditando,
                        ultimaAtualizacao: new Date().toISOString()
                    };
                    console.log('✅ Tarefa atualizada');
                }
            } else {
                // Criar nova tarefa
                const novaTarefa = {
                    id: Date.now(),
                    ...dadosTarefa,
                    dataCriacao: new Date().toISOString(),
                    ultimaAtualizacao: new Date().toISOString(),
                    progresso: dadosTarefa.progresso || 0
                };
                
                App.dados.tarefas.push(novaTarefa);
                console.log('✅ Nova tarefa criada');
            }
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Atualizar estatísticas
            this._calcularEstatisticas();
            
            // Fechar modal
            this.fecharModal();
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                const acao = this.state.tarefaEditando ? 'atualizada' : 'criada';
                Notifications.success(`Tarefa "${dadosTarefa.titulo}" ${acao} com sucesso!`);
            }
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao salvar tarefa: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ EXCLUIR TAREFA
    async excluirTarefa(id) {
        try {
            console.log('🗑️ Excluindo tarefa:', id);
            
            if (!App.dados?.tarefas) {
                throw new Error('Dados de tarefas não disponíveis');
            }
            
            const tarefaIndex = App.dados.tarefas.findIndex(t => t.id == id);
            if (tarefaIndex === -1) {
                throw new Error('Tarefa não encontrada');
            }
            
            const tarefa = App.dados.tarefas[tarefaIndex];
            
            // Verificar dependências (subtarefas)
            const temSubtarefas = tarefa.subtarefas && tarefa.subtarefas.length > 0;
            
            let mensagemConfirmacao = `Tem certeza que deseja excluir a tarefa?\n\n📝 ${tarefa.titulo}`;
            
            if (temSubtarefas) {
                mensagemConfirmacao += `\n\n⚠️ Esta tarefa possui ${tarefa.subtarefas.length} subtarefa(s) que também serão excluídas.`;
            }
            
            if (tarefa.agendaSemanal) {
                mensagemConfirmacao += `\n\n🔄 Esta é uma tarefa recorrente da agenda semanal.`;
            }
            
            mensagemConfirmacao += `\n\nEsta ação não pode ser desfeita.`;
            
            const confirmacao = confirm(mensagemConfirmacao);
            
            if (!confirmacao) {
                console.log('❌ Exclusão cancelada pelo usuário');
                return false;
            }
            
            // Remover tarefa
            App.dados.tarefas.splice(tarefaIndex, 1);
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Atualizar estatísticas
            this._calcularEstatisticas();
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Tarefa "${tarefa.titulo}" excluída com sucesso!`);
            }
            
            console.log('✅ Tarefa excluída com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao excluir tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao excluir tarefa: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ BUSCAR TAREFAS
    buscarTarefas(termo = '', filtros = {}) {
        try {
            if (!App.dados?.tarefas) {
                return [];
            }
            
            let tarefas = [...App.dados.tarefas];
            
            // Filtrar por termo de busca
            if (termo) {
                const termoLower = termo.toLowerCase();
                tarefas = tarefas.filter(tarefa => 
                    tarefa.titulo.toLowerCase().includes(termoLower) ||
                    tarefa.descricao?.toLowerCase().includes(termoLower) ||
                    tarefa.responsavel?.toLowerCase().includes(termoLower)
                );
            }
            
            // Filtrar por tipo
            if (filtros.tipo) {
                tarefas = tarefas.filter(tarefa => tarefa.tipo === filtros.tipo);
            }
            
            // Filtrar por status
            if (filtros.status) {
                tarefas = tarefas.filter(tarefa => tarefa.status === filtros.status);
            }
            
            // Filtrar por prioridade
            if (filtros.prioridade) {
                tarefas = tarefas.filter(tarefa => tarefa.prioridade === filtros.prioridade);
            }
            
            // Filtrar por responsável
            if (filtros.responsavel) {
                tarefas = tarefas.filter(tarefa => tarefa.responsavel === filtros.responsavel);
            }
            
            // Filtrar por data
            if (filtros.dataInicio && filtros.dataFim) {
                tarefas = tarefas.filter(tarefa => {
                    const dataInicio = tarefa.dataInicio || tarefa.dataCriacao?.split('T')[0];
                    const dataFim = tarefa.dataFim;
                    
                    return (dataInicio >= filtros.dataInicio && dataInicio <= filtros.dataFim) ||
                           (dataFim >= filtros.dataInicio && dataFim <= filtros.dataFim);
                });
            }
            
            // Filtrar agenda semanal
            if (filtros.agendaSemanal !== undefined) {
                tarefas = tarefas.filter(tarefa => !!tarefa.agendaSemanal === filtros.agendaSemanal);
            }
            
            // Ordenar
            const ordenacao = filtros.ordenacao || this.state.ordenacaoAtiva;
            tarefas.sort((a, b) => {
                switch (ordenacao) {
                    case 'prioridade':
                        const prioridadeOrdem = { critica: 4, alta: 3, media: 2, baixa: 1 };
                        return (prioridadeOrdem[b.prioridade] || 0) - (prioridadeOrdem[a.prioridade] || 0);
                    case 'data':
                        const dataA = new Date(a.dataFim || a.dataCriacao || 0);
                        const dataB = new Date(b.dataFim || b.dataCriacao || 0);
                        return dataA - dataB;
                    case 'titulo':
                        return a.titulo.localeCompare(b.titulo);
                    case 'status':
                        return a.status.localeCompare(b.status);
                    case 'progresso':
                        return (b.progresso || 0) - (a.progresso || 0);
                    default:
                        return 0;
                }
            });
            
            return tarefas;

        } catch (error) {
            console.error('❌ Erro ao buscar tarefas:', error);
            return [];
        }
    },

    // ✅ OBTER TAREFAS URGENTES
    obterTarefasUrgentes() {
        try {
            if (!App.dados?.tarefas) {
                return [];
            }
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const amanha = new Date(hoje);
            amanha.setDate(hoje.getDate() + 1);
            
            return App.dados.tarefas.filter(tarefa => {
                // Tarefas com prioridade crítica ou alta
                if (tarefa.prioridade === 'critica' || tarefa.prioridade === 'alta') {
                    return true;
                }
                
                // Tarefas com prazo próximo (hoje ou amanhã)
                if (tarefa.dataFim) {
                    const dataFim = new Date(tarefa.dataFim);
                    return dataFim <= amanha;
                }
                
                // Tarefas urgentes por tipo
                if (tarefa.tipo === 'urgente') {
                    return true;
                }
                
                return false;
            });

        } catch (error) {
            console.error('❌ Erro ao obter tarefas urgentes:', error);
            return [];
        }
    },

    // ✅ OBTER TAREFAS POR PRIORIDADE
    obterTarefasPorPrioridade(prioridade) {
        return this.buscarTarefas('', { prioridade });
    },

    // ✅ OBTER AGENDA SEMANAL
    obterAgendaSemanal(dataInicio = null) {
        try {
            if (!App.dados?.tarefas) {
                return {};
            }
            
            // Se não especificada, usar semana atual
            const inicioSemana = dataInicio ? new Date(dataInicio) : this._obterInicioSemana(new Date());
            
            const agendaSemanal = {};
            
            // Inicializar todos os dias da semana
            this.config.diasSemana.forEach(dia => {
                agendaSemanal[dia.value] = [];
            });
            
            // Filtrar tarefas da agenda semanal
            const tarefasSemanais = App.dados.tarefas.filter(tarefa => tarefa.agendaSemanal);
            
            tarefasSemanais.forEach(tarefa => {
                if (tarefa.diaSemana && agendaSemanal[tarefa.diaSemana]) {
                    agendaSemanal[tarefa.diaSemana].push(tarefa);
                }
            });
            
            // Ordenar tarefas por horário em cada dia
            Object.keys(agendaSemanal).forEach(dia => {
                agendaSemanal[dia].sort((a, b) => {
                    const horarioA = a.horario || '00:00';
                    const horarioB = b.horario || '00:00';
                    return horarioA.localeCompare(horarioB);
                });
            });
            
            return agendaSemanal;

        } catch (error) {
            console.error('❌ Erro ao obter agenda semanal:', error);
            return {};
        }
    },

    // ✅ EXPORTAR AGENDA SEMANAL EM PDF
    exportarAgendaPDF() {
        try {
            console.log('📋 Solicitando exportação da agenda semanal em PDF...');
            
            // Verificar se módulo PDF está disponível
            if (typeof PDF === 'undefined') {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Módulo PDF não disponível - verifique se o arquivo pdf.js foi carregado');
                }
                console.error('❌ Módulo PDF.js não carregado');
                return;
            }

            // Verificar se PDF tem a função correta
            if (typeof PDF.mostrarModalAgenda !== 'function') {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Função de PDF da agenda não disponível');
                }
                console.error('❌ PDF.mostrarModalAgenda não é uma função');
                return;
            }

            // Abrir modal de configuração do PDF
            PDF.mostrarModalAgenda();
            
            console.log('✅ Modal de configuração da agenda PDF aberto');
            if (typeof Notifications !== 'undefined') {
                Notifications.info('📋 Configure as opções e gere sua agenda semanal em PDF');
            }

        } catch (error) {
            console.error('❌ Erro ao exportar agenda em PDF:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir configurações da agenda PDF');
            }
        }
    },

    // ✅ MARCAR TAREFA COMO CONCLUÍDA
    async marcarConcluida(id) {
        try {
            const tarefa = App.dados?.tarefas?.find(t => t.id == id);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            tarefa.status = 'concluida';
            tarefa.progresso = 100;
            tarefa.dataConclusao = new Date().toISOString();
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Tarefa "${tarefa.titulo}" marcada como concluída!`);
            }
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao marcar tarefa como concluída:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ OBTER ESTATÍSTICAS
    obterEstatisticas() {
        try {
            if (!this.state.estatisticas) {
                this._calcularEstatisticas();
            }
            return this.state.estatisticas;

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                total: 0,
                porTipo: {},
                porStatus: {},
                porPrioridade: {},
                urgentes: 0,
                atrasadas: 0,
                concluidas: 0,
                progressoMedio: 0
            };
        }
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            modalAtivo: this.state.modalAtivo,
            tarefaEditando: this.state.tarefaEditando,
            filtroAtivo: this.state.filtroAtivo,
            ordenacaoAtiva: this.state.ordenacaoAtiva,
            pessoaSelecionada: this.state.pessoaSelecionada,
            totalTarefas: App.dados?.tarefas?.length || 0,
            tarefasUrgentes: this.obterTarefasUrgentes().length,
            templatesDisponiveis: this.config.templates.length,
            integracaoPDF: typeof PDF !== 'undefined' && typeof PDF.mostrarModalAgenda === 'function',
            estatisticas: !!this.state.estatisticas
        };
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        try {
            const modal = document.getElementById('modalTarefa');
            if (modal) {
                modal.remove();
            }
            
            // Limpar estado
            this.state.modalAtivo = false;
            this.state.tarefaEditando = null;
            
            console.log('✅ Modal de tarefa fechado');

        } catch (error) {
            console.error('❌ Erro ao fechar modal:', error);
        }
    },

    // === MÉTODOS PRIVADOS ===

    // ✅ CRIAR MODAL DE TAREFA
    _criarModalTarefa(tipoInicial = 'pessoal', responsavelInicial = null, dadosTarefa = null) {
        try {
            // Remover modal existente
            const modalExistente = document.getElementById('modalTarefa');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            const ehEdicao = !!dadosTarefa;
            const titulo = ehEdicao ? 'Editar Tarefa' : 'Nova Tarefa';
            
            // Obter lista de pessoas disponíveis
            const pessoas = this._obterListaPessoas();
            
            const modal = document.createElement('div');
            modal.id = 'modalTarefa';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>${ehEdicao ? '✏️' : '📝'} ${titulo}</h3>
                        <button class="modal-close" onclick="Tasks.fecharModal()">&times;</button>
                    </div>
                    
                    <form id="formTarefa" class="modal-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <!-- Título -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="tarefaTitulo">📝 Título: *</label>
                                <input type="text" id="tarefaTitulo" required 
                                       value="${dadosTarefa?.titulo || ''}"
                                       placeholder="Ex: Revisar documentação do projeto">
                            </div>
                            
                            <!-- Tipo e Prioridade -->
                            <div class="form-group">
                                <label for="tarefaTipo">📂 Tipo: *</label>
                                <select id="tarefaTipo" required>
                                    ${this.config.tipos.map(tipo => 
                                        `<option value="${tipo.value}" ${(dadosTarefa?.tipo || tipoInicial) === tipo.value ? 'selected' : ''}>${tipo.icon} ${tipo.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="tarefaPrioridade">⚡ Prioridade: *</label>
                                <select id="tarefaPrioridade" required>
                                    ${this.config.prioridades.map(prioridade => 
                                        `<option value="${prioridade.value}" ${dadosTarefa?.prioridade === prioridade.value ? 'selected' : ''}>${prioridade.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <!-- Responsável e Status -->
                            <div class="form-group">
                                <label for="tarefaResponsavel">👤 Responsável: *</label>
                                <select id="tarefaResponsavel" required>
                                    <option value="">Selecione...</option>
                                    ${pessoas.map(pessoa => 
                                        `<option value="${pessoa}" ${(dadosTarefa?.responsavel || responsavelInicial) === pessoa ? 'selected' : ''}>${pessoa}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="tarefaStatus">📊 Status:</label>
                                <select id="tarefaStatus">
                                    ${this.config.status.map(status => 
                                        `<option value="${status.value}" ${dadosTarefa?.status === status.value ? 'selected' : ''}>${status.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <!-- Datas -->
                            <div class="form-group">
                                <label for="tarefaDataInicio">📅 Data Início:</label>
                                <input type="date" id="tarefaDataInicio" 
                                       value="${dadosTarefa?.dataInicio || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="tarefaDataFim">⏰ Prazo:</label>
                                <input type="date" id="tarefaDataFim" 
                                       value="${dadosTarefa?.dataFim || ''}">
                            </div>
                            
                            <!-- Progresso e Estimativa -->
                            <div class="form-group">
                                <label for="tarefaProgresso">📈 Progresso: <span id="progressoValor">${dadosTarefa?.progresso || 0}%</span></label>
                                <input type="range" id="tarefaProgresso" min="0" max="100" 
                                       value="${dadosTarefa?.progresso || 0}"
                                       oninput="document.getElementById('progressoValor').textContent = this.value + '%'"
                                       style="width: 100%;">
                            </div>
                            
                            <div class="form-group">
                                <label for="tarefaEstimativa">⏱️ Estimativa (min):</label>
                                <input type="number" id="tarefaEstimativa" min="1" max="999" 
                                       value="${dadosTarefa?.estimativa || ''}"
                                       placeholder="Ex: 60">
                            </div>
                            
                            <!-- Descrição -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="tarefaDescricao">📄 Descrição:</label>
                                <textarea id="tarefaDescricao" rows="3" 
                                          placeholder="Descreva a tarefa em detalhes...">${dadosTarefa?.descricao || ''}</textarea>
                            </div>
                            
                            <!-- Agenda Semanal -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="tarefaAgendaSemanal" 
                                           ${dadosTarefa?.agendaSemanal ? 'checked' : ''}>
                                    <span>🔄 Tarefa recorrente da agenda semanal</span>
                                </label>
                                
                                <div id="opcoesAgendaSemanal" style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 6px; ${dadosTarefa?.agendaSemanal ? '' : 'display: none;'}">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                        <div class="form-group">
                                            <label for="tarefaDiaSemana">📅 Dia da Semana:</label>
                                            <select id="tarefaDiaSemana">
                                                ${this.config.diasSemana.map(dia => 
                                                    `<option value="${dia.value}" ${dadosTarefa?.diaSemana === dia.value ? 'selected' : ''}>${dia.label}</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="tarefaHorario">🕐 Horário:</label>
                                            <input type="time" id="tarefaHorario" 
                                                   value="${dadosTarefa?.horario || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Subtarefas -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>📋 Subtarefas (máximo 10):</label>
                                <div id="subtarefasContainer" style="margin-top: 8px;">
                                    ${this._renderizarSubtarefas(dadosTarefa?.subtarefas || [])}
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="Tasks._adicionarSubtarefa()" style="margin-top: 8px;">
                                    ➕ Adicionar Subtarefa
                                </button>
                            </div>
                            
                            <!-- Templates -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="tarefaTemplate">📋 Usar Template:</label>
                                <select id="tarefaTemplate" onchange="Tasks._aplicarTemplate(this.value)">
                                    <option value="">Nenhum template</option>
                                    ${this.config.templates.map((template, index) => 
                                        `<option value="${index}">${template.nome}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </form>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Tasks.fecharModal()">
                            ❌ Cancelar
                        </button>
                        ${ehEdicao ? `
                            <button type="button" class="btn btn-danger" onclick="Tasks.excluirTarefa(${dadosTarefa.id})">
                                🗑️ Excluir
                            </button>
                        ` : ''}
                        <button type="submit" class="btn btn-primary" onclick="Tasks._submeterFormulario(event)">
                            ${ehEdicao ? '✅ Atualizar' : '📝 Criar'} Tarefa
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Configurar eventos
            this._configurarEventosModal();
            
            // Focar no campo título
            document.getElementById('tarefaTitulo').focus();

        } catch (error) {
            console.error('❌ Erro ao criar modal de tarefa:', error);
            throw error;
        }
    },

    // ✅ CONFIGURAR EVENTOS DO MODAL
    _configurarEventosModal() {
        // Mostrar/ocultar opções de agenda semanal
        const checkboxAgenda = document.getElementById('tarefaAgendaSemanal');
        const opcoesAgenda = document.getElementById('opcoesAgendaSemanal');
        
        checkboxAgenda.addEventListener('change', () => {
            opcoesAgenda.style.display = checkboxAgenda.checked ? 'block' : 'none';
        });
    },

    // ✅ RENDERIZAR SUBTAREFAS
    _renderizarSubtarefas(subtarefas) {
        if (!Array.isArray(subtarefas)) {
            subtarefas = [];
        }
        
        let html = '';
        
        subtarefas.forEach((subtarefa, index) => {
            const checked = subtarefa.concluida ? 'checked' : '';
            const titulo = typeof subtarefa === 'string' ? subtarefa : subtarefa.titulo;
            
            html += `
                <div class="subtarefa-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                    <input type="checkbox" ${checked} onchange="Tasks._toggleSubtarefa(${index})">
                    <input type="text" value="${titulo}" placeholder="Descrição da subtarefa..." style="flex: 1; border: none; outline: none;">
                    <button type="button" onclick="Tasks._removerSubtarefa(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
                </div>
            `;
        });
        
        return html;
    },

    // ✅ ADICIONAR SUBTAREFA
    _adicionarSubtarefa() {
        const container = document.getElementById('subtarefasContainer');
        const subtarefas = container.querySelectorAll('.subtarefa-item');
        
        if (subtarefas.length >= 10) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Máximo de 10 subtarefas permitidas');
            }
            return;
        }
        
        const index = subtarefas.length;
        const novaSubtarefa = document.createElement('div');
        novaSubtarefa.className = 'subtarefa-item';
        novaSubtarefa.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;';
        
        novaSubtarefa.innerHTML = `
            <input type="checkbox" onchange="Tasks._toggleSubtarefa(${index})">
            <input type="text" placeholder="Descrição da subtarefa..." style="flex: 1; border: none; outline: none;">
            <button type="button" onclick="Tasks._removerSubtarefa(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
        `;
        
        container.appendChild(novaSubtarefa);
        
        // Focar no input da nova subtarefa
        novaSubtarefa.querySelector('input[type="text"]').focus();
    },

    // ✅ REMOVER SUBTAREFA
    _removerSubtarefa(index) {
        const container = document.getElementById('subtarefasContainer');
        const subtarefas = container.querySelectorAll('.subtarefa-item');
        
        if (subtarefas[index]) {
            subtarefas[index].remove();
        }
    },

    // ✅ TOGGLE SUBTAREFA
    _toggleSubtarefa(index) {
        // Função para marcar/desmarcar subtarefa
        console.log('Toggle subtarefa:', index);
    },

    // ✅ APLICAR TEMPLATE
    _aplicarTemplate(templateIndex) {
        if (!templateIndex) return;
        
        const template = this.config.templates[templateIndex];
        if (!template) return;
        
        // Preencher campos do formulário
        document.getElementById('tarefaTitulo').value = template.nome;
        document.getElementById('tarefaTipo').value = template.tipo;
        document.getElementById('tarefaPrioridade').value = template.prioridade;
        
        if (template.estimativa) {
            document.getElementById('tarefaEstimativa').value = template.estimativa;
        }
        
        if (template.agendaSemanal) {
            document.getElementById('tarefaAgendaSemanal').checked = true;
            document.getElementById('opcoesAgendaSemanal').style.display = 'block';
        }
        
        // Aplicar subtarefas
        if (template.subtarefas) {
            const container = document.getElementById('subtarefasContainer');
            container.innerHTML = this._renderizarSubtarefas(template.subtarefas);
        }
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`Template "${template.nome}" aplicado!`);
        }
    },

    // ✅ SUBMETER FORMULÁRIO
    _submeterFormulario(event) {
        event.preventDefault();
        
        try {
            // Obter dados do formulário
            const dados = this._obterDadosFormulario();
            
            // Salvar tarefa
            this.salvarTarefa(dados);

        } catch (error) {
            console.error('❌ Erro ao submeter formulário:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao salvar: ${error.message}`);
            }
        }
    },

    // ✅ OBTER DADOS DO FORMULÁRIO
    _obterDadosFormulario() {
        const form = document.getElementById('formTarefa');
        if (!form) {
            throw new Error('Formulário não encontrado');
        }
        
        // Obter subtarefas
        const subtarefasContainer = document.getElementById('subtarefasContainer');
        const subtarefasInputs = subtarefasContainer.querySelectorAll('.subtarefa-item');
        const subtarefas = [];
        
        subtarefasInputs.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const input = item.querySelector('input[type="text"]');
            
            if (input.value.trim()) {
                subtarefas.push({
                    titulo: input.value.trim(),
                    concluida: checkbox.checked
                });
            }
        });
        
        const dados = {
            titulo: document.getElementById('tarefaTitulo').value.trim(),
            tipo: document.getElementById('tarefaTipo').value,
            prioridade: document.getElementById('tarefaPrioridade').value,
            responsavel: document.getElementById('tarefaResponsavel').value,
            status: document.getElementById('tarefaStatus').value || 'pendente',
            dataInicio: document.getElementById('tarefaDataInicio').value,
            dataFim: document.getElementById('tarefaDataFim').value,
            progresso: parseInt(document.getElementById('tarefaProgresso').value) || 0,
            estimativa: parseInt(document.getElementById('tarefaEstimativa').value) || null,
            descricao: document.getElementById('tarefaDescricao').value.trim(),
            subtarefas: subtarefas
        };
        
        // Agenda semanal
        const agendaSemanal = document.getElementById('tarefaAgendaSemanal').checked;
        if (agendaSemanal) {
            dados.agendaSemanal = true;
            dados.diaSemana = document.getElementById('tarefaDiaSemana').value;
            dados.horario = document.getElementById('tarefaHorario').value;
        }
        
        return dados;
    },

    // ✅ OBTER LISTA DE PESSOAS
    _obterListaPessoas() {
        try {
            if (!App.dados?.areas) {
                return ['Usuário Padrão'];
            }
            
            const pessoas = new Set();
            
            Object.values(App.dados.areas).forEach(area => {
                if (area.equipe && Array.isArray(area.equipe)) {
                    area.equipe.forEach(membro => {
                        if (membro.nome) {
                            pessoas.add(membro.nome);
                        }
                    });
                }
            });
            
            return Array.from(pessoas).sort();

        } catch (error) {
            console.error('❌ Erro ao obter lista de pessoas:', error);
            return ['Usuário Padrão'];
        }
    },

    // ✅ CALCULAR ESTATÍSTICAS
    _calcularEstatisticas() {
        try {
            if (!App.dados?.tarefas) {
                this.state.estatisticas = {
                    total: 0,
                    porTipo: {},
                    porStatus: {},
                    porPrioridade: {},
                    urgentes: 0,
                    atrasadas: 0,
                    concluidas: 0,
                    progressoMedio: 0
                };
                return;
            }
            
            const tarefas = App.dados.tarefas;
            const hoje = new Date().toISOString().split('T')[0];
            
            const stats = {
                total: tarefas.length,
                porTipo: {},
                porStatus: {},
                porPrioridade: {},
                urgentes: 0,
                atrasadas: 0,
                concluidas: 0,
                progressoMedio: 0
            };
            
            let somaProgresso = 0;
            
            tarefas.forEach(tarefa => {
                // Contar por tipo
                stats.porTipo[tarefa.tipo] = (stats.porTipo[tarefa.tipo] || 0) + 1;
                
                // Contar por status
                stats.porStatus[tarefa.status] = (stats.porStatus[tarefa.status] || 0) + 1;
                
                // Contar por prioridade
                stats.porPrioridade[tarefa.prioridade] = (stats.porPrioridade[tarefa.prioridade] || 0) + 1;
                
                // Urgentes
                if (tarefa.prioridade === 'critica' || tarefa.prioridade === 'alta' || tarefa.tipo === 'urgente') {
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
            
            // Calcular progresso médio
            stats.progressoMedio = Math.round(somaProgresso / (tarefas.length || 1));
            
            this.state.estatisticas = stats;

        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas:', error);
        }
    },

    // ✅ OBTER INÍCIO DA SEMANA
    _obterInicioSemana(data) {
        const date = new Date(data);
        const diaSemana = date.getDay();
        const diasParaDomingo = diaSemana;
        
        const inicioSemana = new Date(date);
        inicioSemana.setDate(date.getDate() - diasParaDomingo);
        inicioSemana.setHours(0, 0, 0, 0);
        
        return inicioSemana;
    }
};

// ✅ FUNÇÃO GLOBAL PARA DEBUG
window.Tasks_Debug = {
    status: () => Tasks.obterStatus(),
    estatisticas: () => Tasks.obterEstatisticas(),
    buscar: (termo) => Tasks.buscarTarefas(termo),
    urgentes: () => Tasks.obterTarefasUrgentes(),
    agenda: () => Tasks.obterAgendaSemanal(),
    criarTeste: () => {
        Tasks.mostrarNovaTarefa('projeto', 'Isabella');
    },
    templates: () => Tasks.config.templates
};

console.log('📝 Sistema de Gestão de Tarefas v6.3.0 carregado!');
console.log('🎯 Funcionalidades: CRUD completo, Agenda semanal, Templates, Subtarefas');
console.log('✅ Integração: App.dados, Calendar.gerar(), Validation, Persistence');
console.log('🧪 Debug: Tasks_Debug.status(), Tasks_Debug.criarTeste(), Tasks_Debug.agenda()');
