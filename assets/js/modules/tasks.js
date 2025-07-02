/**
 * 📝 Sistema de Gestão de Tarefas v6.2 - INTEGRADO COM PDF
 * 
 * Funcionalidades:
 * ✅ Criação e edição completa de tarefas
 * ✅ Sistema de tipos, prioridades e status
 * ✅ Gestão de subtarefas e dependências
 * ✅ Agenda semanal recorrente
 * ✅ Sistema de templates
 * ✅ Busca e filtros avançados
 * ✅ Controle de progresso e urgências
 * ✅ Estatísticas completas
 * ✅ NOVO: Exportação da agenda semanal em PDF 📋
 * ✅ Integração total com Calendar.js
 * ✅ Exportação de dados
 */

const Tasks = {
    // ✅ CONFIGURAÇÕES
    config: {
        TIPOS: {
            pessoal: { nome: 'Pessoal', icone: '👤', cor: '#f59e0b' },
            equipe: { nome: 'Equipe', icone: '👥', cor: '#06b6d4' },
            projeto: { nome: 'Projeto', icone: '📊', cor: '#8b5cf6' },
            urgente: { nome: 'Urgente', icone: '🚨', cor: '#ef4444' },
            rotina: { nome: 'Rotina', icone: '🔄', cor: '#6b7280' }
        },
        STATUS: {
            pendente: { nome: 'Pendente', cor: '#6b7280', valor: 0 },
            andamento: { nome: 'Em Andamento', cor: '#3b82f6', valor: 1 },
            revisao: { nome: 'Em Revisão', cor: '#f59e0b', valor: 2 },
            concluida: { nome: 'Concluída', cor: '#10b981', valor: 3 },
            cancelada: { nome: 'Cancelada', cor: '#ef4444', valor: 4 },
            bloqueada: { nome: 'Bloqueada', cor: '#8b5cf6', valor: 5 }
        },
        PRIORIDADES: {
            baixa: { nome: 'Baixa', cor: '#10b981', valor: 1 },
            media: { nome: 'Média', cor: '#f59e0b', valor: 2 },
            alta: { nome: 'Alta', cor: '#ef4444', valor: 3 },
            critica: { nome: 'Crítica', cor: '#7c2d12', valor: 4 }
        },
        DURACOES: [
            { valor: 15, texto: '15 minutos' },
            { valor: 30, texto: '30 minutos' },
            { valor: 45, texto: '45 minutos' },
            { valor: 60, texto: '1 hora' },
            { valor: 90, texto: '1h 30min' },
            { valor: 120, texto: '2 horas' },
            { valor: 180, texto: '3 horas' },
            { valor: 240, texto: '4 horas' },
            { valor: 480, texto: '8 horas' }
        ],
        DIAS_SEMANA: [
            { valor: 'segunda', nome: 'Segunda-feira' },
            { valor: 'terca', nome: 'Terça-feira' },
            { valor: 'quarta', nome: 'Quarta-feira' },
            { valor: 'quinta', nome: 'Quinta-feira' },
            { valor: 'sexta', nome: 'Sexta-feira' },
            { valor: 'sabado', nome: 'Sábado' },
            { valor: 'domingo', nome: 'Domingo' }
        ],
        MAX_SUBTAREFAS: 10,
        DIAS_URGENCIA: 3
    },

    // ✅ ESTADO INTERNO
    state: {
        modalAtivo: false,
        tarefaEditando: null,
        filtroAtivo: '',
        ordenacaoAtiva: 'prioridade',
        pessoaSelecionada: null,
        rascunhoAtivo: null,
        ultimaBusca: '',
        debounceTimer: null
    },

    // ✅ TEMPLATES DE TAREFAS
    templates: {
        reuniao: {
            nome: 'Preparar Reunião',
            tipo: 'equipe',
            prioridade: 'media',
            subtarefas: [
                { titulo: 'Definir agenda', concluida: false },
                { titulo: 'Convidar participantes', concluida: false },
                { titulo: 'Preparar apresentação', concluida: false },
                { titulo: 'Reservar sala', concluida: false }
            ],
            duracao: 120
        },
        projeto: {
            nome: 'Iniciar Projeto',
            tipo: 'projeto',
            prioridade: 'alta',
            subtarefas: [
                { titulo: 'Análise de requisitos', concluida: false },
                { titulo: 'Definir cronograma', concluida: false },
                { titulo: 'Alocar recursos', concluida: false },
                { titulo: 'Kickoff meeting', concluida: false }
            ],
            duracao: 240
        }
    },

    // ✅ MOSTRAR MODAL DE NOVA TAREFA
    mostrarNovaTarefa(tipo = 'pessoal', responsavel = null) {
        try {
            console.log('📝 Abrindo modal de nova tarefa...', { tipo, responsavel });
            
            // Verificar se modal já existe
            if (this.state.modalAtivo) {
                console.log('⚠️ Modal já está ativo');
                return;
            }

            this.state.modalAtivo = true;
            this.state.tarefaEditando = null;

            // Criar modal
            const modal = this._criarModalTarefa();
            document.body.appendChild(modal);

            // Pré-preencher campos se fornecidos
            if (tipo && document.getElementById('tarefaTipo')) {
                document.getElementById('tarefaTipo').value = tipo;
            }

            if (responsavel && document.getElementById('tarefaResponsavel')) {
                document.getElementById('tarefaResponsavel').value = responsavel;
            }

            // Configurar data padrão
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('tarefaDataInicio').value = hoje;

            // Exibir modal
            setTimeout(() => modal.classList.add('show'), 10);

            // Focar no título
            setTimeout(() => {
                const tituloInput = document.getElementById('tarefaTitulo');
                if (tituloInput) tituloInput.focus();
            }, 100);

            console.log('✅ Modal de nova tarefa aberto');

        } catch (error) {
            console.error('❌ Erro ao mostrar nova tarefa:', error);
            Notifications.error('Erro ao abrir modal de tarefa');
            this.state.modalAtivo = false;
        }
    },

    // ✅ EDITAR TAREFA EXISTENTE
    editarTarefa(tarefaId) {
        try {
            console.log('✏️ Editando tarefa:', tarefaId);
            
            // Buscar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                Notifications.error('Tarefa não encontrada');
                return;
            }

            this.state.modalAtivo = true;
            this.state.tarefaEditando = tarefaId;

            // Criar modal
            const modal = this._criarModalTarefa(tarefa);
            document.body.appendChild(modal);

            // Preencher campos com dados da tarefa
            this._preencherCamposTarefa(tarefa);

            // Exibir modal
            setTimeout(() => modal.classList.add('show'), 10);

            console.log('✅ Modal de edição aberto para tarefa:', tarefa.titulo);

        } catch (error) {
            console.error('❌ Erro ao editar tarefa:', error);
            Notifications.error('Erro ao abrir tarefa para edição');
            this.state.modalAtivo = false;
        }
    },

    // ✅ SALVAR TAREFA
    salvarTarefa() {
        try {
            console.log('💾 Salvando tarefa...');
            
            // Validar campos obrigatórios
            const dadosTarefa = this._coletarDadosTarefa();
            if (!dadosTarefa) {
                return; // Erro já mostrado na validação
            }

            // Garantir estrutura de tarefas
            if (!App.dados.tarefas) {
                App.dados.tarefas = [];
            }

            if (this.state.tarefaEditando) {
                // Editar tarefa existente
                const index = App.dados.tarefas.findIndex(t => t.id === this.state.tarefaEditando);
                if (index !== -1) {
                    App.dados.tarefas[index] = { ...App.dados.tarefas[index], ...dadosTarefa };
                    App.dados.tarefas[index].dataModificacao = new Date().toISOString();
                    App.dados.tarefas[index].modificadoPor = App.usuarioAtual?.email || 'usuario';
                    
                    console.log('✅ Tarefa editada:', dadosTarefa.titulo);
                    Notifications.success(`Tarefa "${dadosTarefa.titulo}" atualizada`);
                }
            } else {
                // Criar nova tarefa
                const novaTarefa = {
                    id: Date.now(),
                    ...dadosTarefa,
                    progresso: 0,
                    dataCriacao: new Date().toISOString(),
                    criadoPor: App.usuarioAtual?.email || 'usuario'
                };

                App.dados.tarefas.push(novaTarefa);
                
                console.log('✅ Nova tarefa criada:', novaTarefa.titulo);
                Notifications.success(`Tarefa "${novaTarefa.titulo}" criada`);
            }

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // Atualizar calendário se disponível
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }

            // Fechar modal
            this.fecharModal();

            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            Notifications.error('Erro ao salvar tarefa');
            return false;
        }
    },

    // ✅ EXCLUIR TAREFA
    excluirTarefa(tarefaId) {
        try {
            // Buscar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                Notifications.error('Tarefa não encontrada');
                return;
            }

            // Confirmar exclusão
            const confirmacao = confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?\n\nEsta ação não pode ser desfeita.`);
            if (!confirmacao) {
                return;
            }

            // Verificar dependências
            const tarefasDependentes = App.dados.tarefas.filter(t => 
                t.dependencias && t.dependencias.includes(tarefaId)
            );

            if (tarefasDependentes.length > 0) {
                const nomes = tarefasDependentes.map(t => t.titulo).join(', ');
                const continuarExclusao = confirm(
                    `Atenção: Esta tarefa possui ${tarefasDependentes.length} tarefa(s) dependente(s):\n${nomes}\n\nAs dependências serão removidas. Continuar?`
                );
                
                if (!continuarExclusao) {
                    return;
                }

                // Remover dependências
                tarefasDependentes.forEach(t => {
                    t.dependencias = t.dependencias.filter(dep => dep !== tarefaId);
                });
            }

            // Remover tarefa
            App.dados.tarefas = App.dados.tarefas.filter(t => t.id !== tarefaId);

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }

            console.log('🗑️ Tarefa excluída:', tarefa.titulo);
            Notifications.success(`Tarefa "${tarefa.titulo}" excluída`);

        } catch (error) {
            console.error('❌ Erro ao excluir tarefa:', error);
            Notifications.error('Erro ao excluir tarefa');
        }
    },

    // ✅ DUPLICAR TAREFA
    duplicarTarefa(tarefaId) {
        try {
            // Buscar tarefa original
            const tarefaOriginal = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefaOriginal) {
                Notifications.error('Tarefa não encontrada');
                return;
            }

            // Criar cópia
            const tarefaDuplicada = {
                ...tarefaOriginal,
                id: Date.now(),
                titulo: `${tarefaOriginal.titulo} (Cópia)`,
                progresso: 0,
                status: 'pendente',
                dataCriacao: new Date().toISOString(),
                criadoPor: App.usuarioAtual?.email || 'usuario',
                dataModificacao: null,
                modificadoPor: null,
                // Duplicar subtarefas
                subtarefas: tarefaOriginal.subtarefas?.map(sub => ({
                    ...sub,
                    id: Date.now() + Math.random(),
                    concluida: false
                })) || []
            };

            App.dados.tarefas.push(tarefaDuplicada);

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            console.log('📋 Tarefa duplicada:', tarefaDuplicada.titulo);
            Notifications.success(`Tarefa duplicada: "${tarefaDuplicada.titulo}"`);

        } catch (error) {
            console.error('❌ Erro ao duplicar tarefa:', error);
            Notifications.error('Erro ao duplicar tarefa');
        }
    },

    // ✅ MARCAR COMO CONCLUÍDA
    marcarConcluida(tarefaId) {
        try {
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                Notifications.error('Tarefa não encontrada');
                return;
            }

            tarefa.status = 'concluida';
            tarefa.progresso = 100;
            tarefa.dataModificacao = new Date().toISOString();
            tarefa.modificadoPor = App.usuarioAtual?.email || 'usuario';

            // Marcar todas as subtarefas como concluídas
            if (tarefa.subtarefas) {
                tarefa.subtarefas.forEach(sub => sub.concluida = true);
            }

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }

            console.log('✅ Tarefa marcada como concluída:', tarefa.titulo);
            Notifications.success(`Tarefa "${tarefa.titulo}" concluída! 🎉`);

        } catch (error) {
            console.error('❌ Erro ao marcar tarefa como concluída:', error);
            Notifications.error('Erro ao marcar tarefa como concluída');
        }
    },

    // ✅ BUSCAR TAREFAS
    buscarTarefas(termo = '', filtros = {}) {
        try {
            if (!App.dados?.tarefas) return [];

            let tarefas = [...App.dados.tarefas];

            // Filtro por termo de busca
            if (termo) {
                const termoLower = termo.toLowerCase();
                tarefas = tarefas.filter(tarefa => 
                    tarefa.titulo?.toLowerCase().includes(termoLower) ||
                    tarefa.descricao?.toLowerCase().includes(termoLower) ||
                    tarefa.responsavel?.toLowerCase().includes(termoLower)
                );
            }

            // Filtros específicos
            if (filtros.tipo) {
                tarefas = tarefas.filter(t => t.tipo === filtros.tipo);
            }

            if (filtros.status) {
                tarefas = tarefas.filter(t => t.status === filtros.status);
            }

            if (filtros.prioridade) {
                tarefas = tarefas.filter(t => t.prioridade === filtros.prioridade);
            }

            if (filtros.responsavel) {
                tarefas = tarefas.filter(t => t.responsavel === filtros.responsavel);
            }

            if (filtros.dataInicio && filtros.dataFim) {
                tarefas = tarefas.filter(t => {
                    const dataT = t.dataInicio || t.dataFim;
                    return dataT && dataT >= filtros.dataInicio && dataT <= filtros.dataFim;
                });
            }

            // Ordenação
            tarefas.sort((a, b) => {
                // Por prioridade (padrão)
                const prioridadeA = this.config.PRIORIDADES[a.prioridade]?.valor || 0;
                const prioridadeB = this.config.PRIORIDADES[b.prioridade]?.valor || 0;
                
                if (prioridadeA !== prioridadeB) {
                    return prioridadeB - prioridadeA; // Maior prioridade primeiro
                }

                // Por data de fim
                if (a.dataFim && b.dataFim) {
                    return new Date(a.dataFim) - new Date(b.dataFim);
                }

                // Por título
                return a.titulo.localeCompare(b.titulo);
            });

            return tarefas;

        } catch (error) {
            console.error('❌ Erro ao buscar tarefas:', error);
            return [];
        }
    },

    // ✅ OBTER TAREFAS URGENTES (≤ 3 dias)
    obterTarefasUrgentes() {
        try {
            const hoje = new Date();
            const limitUrgencia = new Date();
            limitUrgencia.setDate(hoje.getDate() + this.config.DIAS_URGENCIA);

            return this.buscarTarefas().filter(tarefa => {
                if (tarefa.status === 'concluida' || tarefa.status === 'cancelada') {
                    return false;
                }

                if (tarefa.dataFim) {
                    const dataFim = new Date(tarefa.dataFim);
                    return dataFim <= limitUrgencia;
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
        try {
            return this.buscarTarefas('', { prioridade });
        } catch (error) {
            console.error('❌ Erro ao obter tarefas por prioridade:', error);
            return [];
        }
    },

    // ✅ OBTER ESTATÍSTICAS COMPLETAS
    obterEstatisticas() {
        try {
            const tarefas = App.dados?.tarefas || [];

            // Estatísticas básicas
            const total = tarefas.length;
            const urgentes = this.obterTarefasUrgentes().length;
            const atrasadas = this._obterTarefasAtrasadas().length;
            const concluidas = tarefas.filter(t => t.status === 'concluida').length;

            // Por tipo
            const porTipo = {};
            Object.keys(this.config.TIPOS).forEach(tipo => {
                porTipo[tipo] = tarefas.filter(t => t.tipo === tipo).length;
            });

            // Por status
            const porStatus = {};
            Object.keys(this.config.STATUS).forEach(status => {
                porStatus[status] = tarefas.filter(t => t.status === status).length;
            });

            // Por prioridade
            const porPrioridade = {};
            Object.keys(this.config.PRIORIDADES).forEach(prioridade => {
                porPrioridade[prioridade] = tarefas.filter(t => t.prioridade === prioridade).length;
            });

            // Por responsável
            const porResponsavel = {};
            tarefas.forEach(tarefa => {
                if (tarefa.responsavel) {
                    porResponsavel[tarefa.responsavel] = (porResponsavel[tarefa.responsavel] || 0) + 1;
                }
            });

            // Progresso médio
            const progressoMedio = total > 0 ? 
                Math.round(tarefas.reduce((acc, t) => acc + (t.progresso || 0), 0) / total) : 0;

            return {
                total,
                urgentes,
                atrasadas,
                concluidas,
                porTipo,
                porStatus,
                porPrioridade,
                porResponsavel,
                progressoMedio
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                total: 0,
                urgentes: 0,
                atrasadas: 0,
                concluidas: 0,
                porTipo: {},
                porStatus: {},
                porPrioridade: {},
                porResponsavel: {},
                progressoMedio: 0
            };
        }
    },

    // ✅ EXPORTAR DADOS DE TAREFAS
    exportarTarefas(formato = 'json', filtros = {}) {
        try {
            console.log('📤 Exportando tarefas...', { formato, filtros });

            const tarefas = this.buscarTarefas('', filtros);

            if (tarefas.length === 0) {
                Notifications.warning('Nenhuma tarefa encontrada para exportar');
                return;
            }

            const nomeArquivo = `tarefas_${new Date().toISOString().split('T')[0]}`;
            
            if (formato === 'csv') {
                this._exportarCSV(tarefas, nomeArquivo);
            } else {
                this._exportarJSON(tarefas, nomeArquivo);
            }

            Notifications.success(`${tarefas.length} tarefas exportadas em ${formato.toUpperCase()}`);

        } catch (error) {
            console.error('❌ Erro ao exportar tarefas:', error);
            Notifications.error('Erro ao exportar tarefas');
        }
    },

    // ✅ EXPORTAR AGENDA SEMANAL EM PDF
    exportarAgendaPDF() {
        try {
            console.log('📋 Solicitando exportação da agenda semanal em PDF...');
            
            // Verificar se módulo PDF está disponível
            if (typeof PDF === 'undefined') {
                Notifications.error('Módulo PDF não disponível - verifique se o arquivo pdf.js foi carregado');
                console.error('❌ Módulo PDF.js não carregado');
                return;
            }

            // Abrir modal de configuração da agenda semanal
            PDF.mostrarModalAgenda();
            
            console.log('✅ Modal de configuração da agenda semanal aberto');
            Notifications.info('📋 Configure sua agenda semanal e gere o PDF personalizado');

        } catch (error) {
            console.error('❌ Erro ao exportar agenda semanal em PDF:', error);
            Notifications.error('Erro ao abrir configurações da agenda PDF');
        }
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        try {
            const modals = [
                document.getElementById('modalTarefa'),
                document.getElementById('modalTemplate')
            ];

            modals.forEach(modal => {
                if (modal) {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    }, 300);
                }
            });

            this.state.modalAtivo = false;
            this.state.tarefaEditando = null;
            this.state.rascunhoAtivo = null;

        } catch (error) {
            console.error('❌ Erro ao fechar modal:', error);
        }
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        const stats = this.obterEstatisticas();
        
        return {
            modalAtivo: this.state.modalAtivo,
            tarefaEditando: this.state.tarefaEditando,
            filtroAtivo: this.state.filtroAtivo,
            ordenacaoAtiva: this.state.ordenacaoAtiva,
            pessoaSelecionada: this.state.pessoaSelecionada,
            totalTarefas: stats.total,
            tarefasUrgentes: stats.urgentes,
            templatesDisponiveis: Object.keys(this.templates).length,
            integracaoCalendar: typeof Calendar !== 'undefined',
            integracaoPDF: typeof PDF !== 'undefined'
        };
    },

    // ✅ === MÉTODOS PRIVADOS ===

    // Obter tarefas atrasadas
    _obterTarefasAtrasadas() {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            return App.dados?.tarefas?.filter(tarefa => {
                if (tarefa.status === 'concluida' || tarefa.status === 'cancelada') {
                    return false;
                }

                if (tarefa.dataFim) {
                    const dataFim = new Date(tarefa.dataFim);
                    dataFim.setHours(23, 59, 59, 999);
                    return dataFim < hoje;
                }

                return false;
            }) || [];

        } catch (error) {
            console.error('❌ Erro ao obter tarefas atrasadas:', error);
            return [];
        }
    },

    // Criar modal de tarefa
    _criarModalTarefa(tarefa = null) {
        const ehEdicao = tarefa !== null;
        const titulo = ehEdicao ? 'Editar Tarefa' : 'Nova Tarefa';

        const modal = document.createElement('div');
        modal.id = 'modalTarefa';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>📝 ${titulo}</h3>
                    <button class="modal-close" onclick="Tasks.fecharModal()">&times;</button>
                </div>
                
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <!-- Informações Básicas -->
                    <div class="form-section">
                        <h4>📋 Informações Básicas</h4>
                        
                        <div class="form-group">
                            <label>📝 Título da Tarefa: *</label>
                            <input type="text" id="tarefaTitulo" placeholder="Descreva a tarefa..." required maxlength="200">
                        </div>
                        
                        <div class="form-group">
                            <label>📄 Descrição:</label>
                            <textarea id="tarefaDescricao" placeholder="Detalhes da tarefa..." rows="3" maxlength="1000"></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>🏷️ Tipo: *</label>
                                <select id="tarefaTipo" required>
                                    ${Object.entries(this.config.TIPOS).map(([key, tipo]) => 
                                        `<option value="${key}">${tipo.icone} ${tipo.nome}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>⚡ Prioridade: *</label>
                                <select id="tarefaPrioridade" required>
                                    ${Object.entries(this.config.PRIORIDADES).map(([key, prioridade]) => 
                                        `<option value="${key}">${prioridade.nome}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>📊 Status:</label>
                                <select id="tarefaStatus">
                                    ${Object.entries(this.config.STATUS).map(([key, status]) => 
                                        `<option value="${key}">${status.nome}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Responsável e Datas -->
                    <div class="form-section">
                        <h4>👤 Responsável e Prazos</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>👤 Responsável: *</label>
                                <select id="tarefaResponsavel" required>
                                    <option value="">🔸 Selecione...</option>
                                    ${this._obterListaPessoas().map(pessoa => 
                                        `<option value="${pessoa}">${pessoa}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>📅 Data Início:</label>
                                <input type="date" id="tarefaDataInicio">
                            </div>
                            
                            <div class="form-group">
                                <label>⏰ Data Fim:</label>
                                <input type="date" id="tarefaDataFim">
                            </div>
                        </div>
                    </div>

                    <!-- Agenda Semanal -->
                    <div class="form-section">
                        <h4>🔄 Agenda Semanal (Recorrente)</h4>
                        <div style="margin-bottom: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="tarefaAgendaSemanal">
                                📅 Esta tarefa faz parte da agenda semanal recorrente
                            </label>
                        </div>
                        
                        <div id="configAgendaSemanal" style="display: none; background: #f9fafb; padding: 12px; border-radius: 6px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>📅 Dia da Semana:</label>
                                    <select id="tarefaDiaSemana">
                                        ${this.config.DIAS_SEMANA.map(dia => 
                                            `<option value="${dia.valor}">${dia.nome}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>⏰ Horário:</label>
                                    <input type="time" id="tarefaHorario">
                                </div>
                                
                                <div class="form-group">
                                    <label>⏱️ Duração:</label>
                                    <select id="tarefaDuracao">
                                        ${this.config.DURACOES.map(duracao => 
                                            `<option value="${duracao.valor}">${duracao.texto}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div style="margin-top: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="tarefaMostrarCalendario" checked>
                                    📅 Mostrar no calendário principal
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Progresso e Subtarefas -->
                    <div class="form-section">
                        <h4>📊 Progresso e Subtarefas</h4>
                        
                        <div class="form-group">
                            <label>📈 Progresso: <span id="progressoValor">0%</span></label>
                            <input type="range" id="tarefaProgresso" min="0" max="100" value="0" 
                                   oninput="document.getElementById('progressoValor').textContent = this.value + '%'">
                        </div>
                        
                        <div class="form-group">
                            <label>📋 Subtarefas:</label>
                            <div id="subtarefasContainer">
                                <!-- Subtarefas serão adicionadas aqui -->
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="Tasks._adicionarSubtarefa()" 
                                    style="margin-top: 8px;">
                                ➕ Adicionar Subtarefa
                            </button>
                        </div>
                    </div>

                    <!-- Templates e PDF -->
                    <div class="form-section">
                        <h4>🎯 Ações Rápidas</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="Tasks._aplicarTemplate('reuniao')">
                                📅 Template Reunião
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="Tasks._aplicarTemplate('projeto')">
                                📊 Template Projeto
                            </button>
                            <button type="button" class="btn btn-pdf btn-sm" onclick="Tasks.exportarAgendaPDF()">
                                📋 Agenda PDF
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="Tasks.fecharModal()">
                        ❌ Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="Tasks.salvarTarefa()">
                        💾 ${ehEdicao ? 'Atualizar' : 'Criar'} Tarefa
                    </button>
                </div>
            </div>
        `;

        // Adicionar event listeners
        setTimeout(() => {
            this._configurarEventListeners();
        }, 100);

        return modal;
    },

    // Configurar event listeners do modal
    _configurarEventListeners() {
        try {
            // Toggle agenda semanal
            const agendaCheckbox = document.getElementById('tarefaAgendaSemanal');
            const configAgenda = document.getElementById('configAgendaSemanal');
            
            if (agendaCheckbox && configAgenda) {
                agendaCheckbox.addEventListener('change', (e) => {
                    configAgenda.style.display = e.target.checked ? 'block' : 'none';
                });
            }

            // Auto-save de rascunho
            const campos = ['tarefaTitulo', 'tarefaDescricao'];
            campos.forEach(campo => {
                const elemento = document.getElementById(campo);
                if (elemento) {
                    elemento.addEventListener('input', () => {
                        clearTimeout(this.state.debounceTimer);
                        this.state.debounceTimer = setTimeout(() => {
                            this._salvarRascunho();
                        }, 1000);
                    });
                }
            });

        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    },

    // Preencher campos com dados da tarefa
    _preencherCamposTarefa(tarefa) {
        try {
            const campos = {
                tarefaTitulo: tarefa.titulo,
                tarefaDescricao: tarefa.descricao || '',
                tarefaTipo: tarefa.tipo,
                tarefaPrioridade: tarefa.prioridade,
                tarefaStatus: tarefa.status,
                tarefaResponsavel: tarefa.responsavel,
                tarefaDataInicio: tarefa.dataInicio || '',
                tarefaDataFim: tarefa.dataFim || '',
                tarefaProgresso: tarefa.progresso || 0
            };

            Object.entries(campos).forEach(([id, valor]) => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.value = valor;
                    if (id === 'tarefaProgresso') {
                        document.getElementById('progressoValor').textContent = valor + '%';
                    }
                }
            });

            // Agenda semanal
            if (tarefa.agendaSemanal) {
                document.getElementById('tarefaAgendaSemanal').checked = true;
                document.getElementById('configAgendaSemanal').style.display = 'block';
                
                if (tarefa.diaSemana) document.getElementById('tarefaDiaSemana').value = tarefa.diaSemana;
                if (tarefa.horario) document.getElementById('tarefaHorario').value = tarefa.horario;
                if (tarefa.duracao) document.getElementById('tarefaDuracao').value = tarefa.duracao;
                if (tarefa.mostrarNoCalendario !== undefined) {
                    document.getElementById('tarefaMostrarCalendario').checked = tarefa.mostrarNoCalendario;
                }
            }

            // Subtarefas
            if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
                tarefa.subtarefas.forEach(subtarefa => {
                    this._adicionarSubtarefa(subtarefa);
                });
            }

        } catch (error) {
            console.error('❌ Erro ao preencher campos:', error);
        }
    },

    // Coletar dados da tarefa do formulário
    _coletarDadosTarefa() {
        try {
            // Validações básicas
            const titulo = document.getElementById('tarefaTitulo').value.trim();
            if (!titulo) {
                Notifications.error('Título da tarefa é obrigatório');
                document.getElementById('tarefaTitulo').focus();
                return null;
            }

            const responsavel = document.getElementById('tarefaResponsavel').value;
            if (!responsavel) {
                Notifications.error('Responsável é obrigatório');
                document.getElementById('tarefaResponsavel').focus();
                return null;
            }

            // Coletar dados básicos
            const dados = {
                titulo,
                descricao: document.getElementById('tarefaDescricao').value.trim(),
                tipo: document.getElementById('tarefaTipo').value,
                prioridade: document.getElementById('tarefaPrioridade').value,
                status: document.getElementById('tarefaStatus').value,
                responsavel,
                dataInicio: document.getElementById('tarefaDataInicio').value || null,
                dataFim: document.getElementById('tarefaDataFim').value || null,
                progresso: parseInt(document.getElementById('tarefaProgresso').value) || 0
            };

            // Validar datas
            if (dados.dataInicio && dados.dataFim && dados.dataInicio > dados.dataFim) {
                Notifications.error('Data de início não pode ser posterior à data de fim');
                return null;
            }

            // Agenda semanal
            const agendaSemanal = document.getElementById('tarefaAgendaSemanal').checked;
            if (agendaSemanal) {
                dados.agendaSemanal = true;
                dados.diaSemana = document.getElementById('tarefaDiaSemana').value;
                dados.horario = document.getElementById('tarefaHorario').value;
                dados.duracao = parseInt(document.getElementById('tarefaDuracao').value);
                dados.mostrarNoCalendario = document.getElementById('tarefaMostrarCalendario').checked;
            }

            // Coletar subtarefas
            dados.subtarefas = this._coletarSubtarefas();

            return dados;

        } catch (error) {
            console.error('❌ Erro ao coletar dados da tarefa:', error);
            Notifications.error('Erro ao validar dados da tarefa');
            return null;
        }
    },

    // Coletar subtarefas
    _coletarSubtarefas() {
        try {
            const subtarefas = [];
            const container = document.getElementById('subtarefasContainer');
            
            if (container) {
                const itensSubtarefa = container.querySelectorAll('.subtarefa-item');
                itensSubtarefa.forEach(item => {
                    const input = item.querySelector('input[type="text"]');
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    
                    if (input && input.value.trim()) {
                        subtarefas.push({
                            id: Date.now() + Math.random(),
                            titulo: input.value.trim(),
                            concluida: checkbox ? checkbox.checked : false
                        });
                    }
                });
            }

            return subtarefas;

        } catch (error) {
            console.error('❌ Erro ao coletar subtarefas:', error);
            return [];
        }
    },

    // Adicionar subtarefa
    _adicionarSubtarefa(subtarefa = null) {
        try {
            const container = document.getElementById('subtarefasContainer');
            if (!container) return;

            const contadorAtual = container.children.length;
            if (contadorAtual >= this.config.MAX_SUBTAREFAS) {
                Notifications.warning(`Máximo de ${this.config.MAX_SUBTAREFAS} subtarefas permitidas`);
                return;
            }

            const div = document.createElement('div');
            div.className = 'subtarefa-item';
            div.style.cssText = 'display: flex; gap: 8px; align-items: center; margin: 4px 0;';
            
            div.innerHTML = `
                <input type="checkbox" ${subtarefa?.concluida ? 'checked' : ''}>
                <input type="text" placeholder="Título da subtarefa..." 
                       value="${subtarefa?.titulo || ''}" 
                       style="flex: 1; padding: 4px 8px;">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
                    🗑️
                </button>
            `;

            container.appendChild(div);

        } catch (error) {
            console.error('❌ Erro ao adicionar subtarefa:', error);
        }
    },

    // Aplicar template
    _aplicarTemplate(templateKey) {
        try {
            const template = this.templates[templateKey];
            if (!template) return;

            // Preencher campos básicos
            if (template.tipo) document.getElementById('tarefaTipo').value = template.tipo;
            if (template.prioridade) document.getElementById('tarefaPrioridade').value = template.prioridade;
            if (template.duracao) document.getElementById('tarefaDuracao').value = template.duracao;

            // Limpar e adicionar subtarefas do template
            document.getElementById('subtarefasContainer').innerHTML = '';
            if (template.subtarefas) {
                template.subtarefas.forEach(subtarefa => {
                    this._adicionarSubtarefa(subtarefa);
                });
            }

            Notifications.success(`Template "${template.nome}" aplicado`);

        } catch (error) {
            console.error('❌ Erro ao aplicar template:', error);
        }
    },

    // Salvar rascunho
    _salvarRascunho() {
        try {
            const rascunho = {
                titulo: document.getElementById('tarefaTitulo')?.value || '',
                descricao: document.getElementById('tarefaDescricao')?.value || '',
                timestamp: new Date().toISOString()
            };

            this.state.rascunhoAtivo = rascunho;
            console.log('💾 Rascunho salvo automaticamente');

        } catch (error) {
            console.error('❌ Erro ao salvar rascunho:', error);
        }
    },

    // Obter lista de pessoas
    _obterListaPessoas() {
        try {
            const pessoas = new Set();
            
            // Pessoas das áreas
            if (App.dados?.areas) {
                Object.values(App.dados.areas).forEach(area => {
                    if (area.pessoas) {
                        area.pessoas.forEach(pessoa => pessoas.add(pessoa));
                    }
                });
            }

            // Pessoas dos eventos
            if (App.dados?.eventos) {
                App.dados.eventos.forEach(evento => {
                    if (evento.pessoas) {
                        evento.pessoas.forEach(pessoa => pessoas.add(pessoa));
                    }
                });
            }

            // Responsáveis existentes das tarefas
            if (App.dados?.tarefas) {
                App.dados.tarefas.forEach(tarefa => {
                    if (tarefa.responsavel) {
                        pessoas.add(tarefa.responsavel);
                    }
                });
            }

            return Array.from(pessoas).sort();

        } catch (error) {
            console.error('❌ Erro ao obter lista de pessoas:', error);
            return [];
        }
    },

    // Exportar JSON
    _exportarJSON(tarefas, nomeArquivo) {
        try {
            const dados = {
                tarefas,
                metadados: {
                    dataExportacao: new Date().toISOString(),
                    totalTarefas: tarefas.length,
                    versaoSistema: '6.2',
                    estatisticas: this.obterEstatisticas()
                }
            };

            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${nomeArquivo}.json`;
            link.click();
            
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('❌ Erro ao exportar JSON:', error);
            throw error;
        }
    },

    // Exportar CSV
    _exportarCSV(tarefas, nomeArquivo) {
        try {
            const headers = [
                'ID', 'Título', 'Descrição', 'Tipo', 'Prioridade', 'Status', 
                'Responsável', 'Progresso', 'Data Início', 'Data Fim',
                'Agenda Semanal', 'Dia Semana', 'Horário', 'Duração',
                'Subtarefas', 'Data Criação'
            ];

            const linhas = tarefas.map(tarefa => [
                tarefa.id,
                `"${tarefa.titulo || ''}"`,
                `"${tarefa.descricao || ''}"`,
                tarefa.tipo,
                tarefa.prioridade,
                tarefa.status,
                tarefa.responsavel,
                tarefa.progresso || 0,
                tarefa.dataInicio || '',
                tarefa.dataFim || '',
                tarefa.agendaSemanal ? 'Sim' : 'Não',
                tarefa.diaSemana || '',
                tarefa.horario || '',
                tarefa.duracao || '',
                tarefa.subtarefas ? tarefa.subtarefas.length : 0,
                tarefa.dataCriacao ? new Date(tarefa.dataCriacao).toLocaleDateString('pt-BR') : ''
            ]);

            const csv = [headers.join(','), ...linhas.map(linha => linha.join(','))].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${nomeArquivo}.csv`;
            link.click();
            
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
            throw error;
        }
    }
};

// ✅ ATALHOS DE TECLADO
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        Tasks.mostrarNovaTarefa();
    } else if (e.key === 'Escape' && Tasks.state.modalAtivo) {
        Tasks.fecharModal();
    }
});

// ✅ INICIALIZAÇÃO DO MÓDULO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Sistema de Gestão de Tarefas v6.2 carregado!');
    
    // Garantir estrutura de dados
    if (typeof App !== 'undefined' && App.dados && !App.dados.tarefas) {
        App.dados.tarefas = [];
        console.log('📊 Array de tarefas inicializado');
    }
});

// ✅ LOG DE CARREGAMENTO
console.log('📝 Sistema de Gestão de Tarefas v6.2 carregado!');
console.log('🎯 Funcionalidades: CRUD, Subtarefas, Agenda Semanal, Templates, PDF Export');
console.log('⚙️ Integração: Calendar.js, Events.js, PDF.js, Persistence.js');
console.log('⌨️ Atalhos: Ctrl+T (nova tarefa), Esc (fechar modal)');
