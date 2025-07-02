/**
 * 📝 Sistema de Gestão de Tarefas v6.2.1 - INTEGRAÇÃO CORRIGIDA
 * 
 * CORREÇÕES APLICADAS:
 * ✅ Referências ao Events.js corrigidas
 * ✅ Validação de datas corrigida (Date objects vs strings)
 * ✅ Integração perfeita com Calendar.js e PDF.js
 * ✅ Verificações de dependências melhoradas
 * ✅ Performance otimizada
 * ✅ Validações robustas implementadas
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
        debounceTimer: null,
        dependenciasVerificadas: false
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

    // ✅ VERIFICAR DEPENDÊNCIAS - NOVO
    _verificarDependencias() {
        try {
            const dependencias = {
                App: typeof App !== 'undefined' && App.dados,
                Calendar: typeof Calendar !== 'undefined',
                Events: typeof Events !== 'undefined',
                PDF: typeof PDF !== 'undefined',
                Notifications: typeof Notifications !== 'undefined',
                Persistence: typeof Persistence !== 'undefined'
            };

            this.state.dependenciasVerificadas = true;
            
            // Log das dependências disponíveis
            Object.entries(dependencias).forEach(([nome, disponivel]) => {
                if (disponivel) {
                    console.log(`✅ ${nome} disponível para Tasks`);
                } else {
                    console.warn(`⚠️ ${nome} não disponível para Tasks`);
                }
            });

            return dependencias.App; // App é obrigatório

        } catch (error) {
            console.error('❌ Erro ao verificar dependências:', error);
            return false;
        }
    },

    // ✅ MOSTRAR MODAL DE NOVA TAREFA
    mostrarNovaTarefa(tipo = 'pessoal', responsavel = null) {
        try {
            console.log('📝 Abrindo modal de nova tarefa...', { tipo, responsavel });
            
            // Verificar dependências
            if (!this._verificarDependencias()) {
                console.warn('⚠️ Algumas dependências não estão disponíveis');
            }
            
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
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir modal de tarefa');
            }
            this.state.modalAtivo = false;
        }
    },

    // ✅ EDITAR TAREFA EXISTENTE
    editarTarefa(tarefaId) {
        try {
            console.log('✏️ Editando tarefa:', tarefaId);
            
            // Verificar dependências
            if (!this._verificarDependencias()) {
                console.warn('⚠️ Algumas dependências não estão disponíveis');
            }
            
            // Buscar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Tarefa não encontrada');
                }
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
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir tarefa para edição');
            }
            this.state.modalAtivo = false;
        }
    },

    // ✅ SALVAR TAREFA - INTEGRAÇÃO PERFEITA
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
                    if (typeof Notifications !== 'undefined') {
                        Notifications.success(`Tarefa "${dadosTarefa.titulo}" atualizada`);
                    }
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
                if (typeof Notifications !== 'undefined') {
                    Notifications.success(`Tarefa "${novaTarefa.titulo}" criada`);
                }
            }

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // INTEGRAÇÃO PERFEITA: Atualizar calendário automaticamente
            this._sincronizarComCalendario();

            // Fechar modal
            this.fecharModal();

            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao salvar tarefa');
            }
            return false;
        }
    },

    // ✅ SINCRONIZAR COM CALENDÁRIO - INTEGRAÇÃO CORRIGIDA
    _sincronizarComCalendario() {
        try {
            // Atualizar calendário se disponível
            if (typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function') {
                // Pequeno delay para garantir que os dados foram salvos
                setTimeout(() => {
                    Calendar.gerar();
                    console.log('🔄 Calendário sincronizado com tarefas');
                }, 100);
            } else {
                console.warn('⚠️ Módulo Calendar não disponível para sincronização');
            }
            
            // Atualizar estatísticas gerais se disponível
            if (typeof App !== 'undefined' && typeof App.atualizarEstatisticas === 'function') {
                App.atualizarEstatisticas();
            }

        } catch (error) {
            console.error('❌ Erro ao sincronizar com calendário:', error);
        }
    },

    // ✅ EXCLUIR TAREFA - INTEGRAÇÃO PERFEITA
    excluirTarefa(tarefaId) {
        try {
            // Buscar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Tarefa não encontrada');
                }
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

            // INTEGRAÇÃO PERFEITA: Sincronizar com calendário
            this._sincronizarComCalendario();

            console.log('🗑️ Tarefa excluída:', tarefa.titulo);
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Tarefa "${tarefa.titulo}" excluída`);
            }

        } catch (error) {
            console.error('❌ Erro ao excluir tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao excluir tarefa');
            }
        }
    },

    // ✅ MARCAR COMO CONCLUÍDA - INTEGRAÇÃO PERFEITA
    marcarConcluida(tarefaId) {
        try {
            const tarefa = App.dados?.tarefas?.find(t => t.id === tarefaId);
            if (!tarefa) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Tarefa não encontrada');
                }
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

            // INTEGRAÇÃO PERFEITA: Sincronizar com calendário
            this._sincronizarComCalendario();

            console.log('✅ Tarefa marcada como concluída:', tarefa.titulo);
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Tarefa "${tarefa.titulo}" concluída! 🎉`);
            }

        } catch (error) {
            console.error('❌ Erro ao marcar tarefa como concluída:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao marcar tarefa como concluída');
            }
        }
    },

    // ✅ BUSCAR TAREFAS - OTIMIZADA
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

            if (filtros.agendaSemanal !== undefined) {
                tarefas = tarefas.filter(t => !!t.agendaSemanal === filtros.agendaSemanal);
            }

            if (filtros.dataInicio && filtros.dataFim) {
                tarefas = tarefas.filter(t => {
                    const dataT = t.dataInicio || t.dataFim;
                    return dataT && dataT >= filtros.dataInicio && dataT <= filtros.dataFim;
                });
            }

            // Ordenação otimizada
            tarefas.sort((a, b) => {
                // Por prioridade (padrão)
                const prioridadeA = this.config.PRIORIDADES[a.prioridade]?.valor || 0;
                const prioridadeB = this.config.PRIORIDADES[b.prioridade]?.valor || 0;
                
                if (prioridadeA !== prioridadeB) {
                    return prioridadeB - prioridadeA; // Maior prioridade primeiro
                }

                // Por status (tarefas em andamento primeiro)
                const statusA = this.config.STATUS[a.status]?.valor || 0;
                const statusB = this.config.STATUS[b.status]?.valor || 0;
                
                if (statusA !== statusB) {
                    // Priorizar: andamento > pendente > revisao > bloqueada > concluida > cancelada
                    const ordemStatus = { andamento: 0, pendente: 1, revisao: 2, bloqueada: 3, concluida: 4, cancelada: 5 };
                    return (ordemStatus[a.status] || 6) - (ordemStatus[b.status] || 6);
                }

                // Por data de fim - CORRIGIDO (usar Date objects)
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

    // ✅ OBTER TAREFAS DA AGENDA SEMANAL - INTEGRAÇÃO PERFEITA PARA PDF
    obterTarefasAgendaSemanal(pessoa = null, diaSemana = null) {
        try {
            let tarefas = this.buscarTarefas('', { agendaSemanal: true });
            
            // Filtrar por pessoa se especificada
            if (pessoa) {
                tarefas = tarefas.filter(t => t.responsavel === pessoa);
            }
            
            // Filtrar por dia da semana se especificado
            if (diaSemana !== null) {
                const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                const nomeDia = typeof diaSemana === 'number' ? diasSemana[diaSemana] : diaSemana;
                tarefas = tarefas.filter(t => t.diaSemana === nomeDia);
            }
            
            // Ordenar por horário
            tarefas.sort((a, b) => {
                if (a.horario && b.horario) {
                    return a.horario.localeCompare(b.horario);
                }
                if (a.horario && !b.horario) return -1;
                if (!a.horario && b.horario) return 1;
                return 0;
            });
            
            return tarefas;

        } catch (error) {
            console.error('❌ Erro ao obter tarefas da agenda semanal:', error);
            return [];
        }
    },

    // ✅ OBTER TAREFAS URGENTES (≤ 3 dias) - CORRIGIDO
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
                    // CORREÇÃO: Usar Date objects para comparação
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

    // ✅ OBTER TAREFAS ATRASADAS - CORRIGIDO
    _obterTarefasAtrasadas() {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            return App.dados?.tarefas?.filter(tarefa => {
                if (tarefa.status === 'concluida' || tarefa.status === 'cancelada') {
                    return false;
                }

                if (tarefa.dataFim) {
                    // CORREÇÃO: Usar Date objects para comparação
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
            const agendaSemanais = tarefas.filter(t => t.agendaSemanal).length;

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
                agendaSemanais,
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
                agendaSemanais: 0,
                porTipo: {},
                porStatus: {},
                porPrioridade: {},
                porResponsavel: {},
                progressoMedio: 0
            };
        }
    },

    // ✅ EXPORTAR AGENDA SEMANAL EM PDF - INTEGRAÇÃO CORRIGIDA
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
                    Notifications.error('Função de agenda PDF não disponível');
                }
                console.error('❌ PDF.mostrarModalAgenda não é uma função');
                return;
            }

            // Abrir modal de configuração da agenda semanal
            PDF.mostrarModalAgenda();
            
            console.log('✅ Modal de configuração da agenda semanal aberto');
            if (typeof Notifications !== 'undefined') {
                Notifications.info('📋 Configure sua agenda semanal e gere o PDF personalizado');
            }

        } catch (error) {
            console.error('❌ Erro ao exportar agenda semanal em PDF:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir configurações da agenda PDF');
            }
        }
    },

    // ✅ EXPORTAR DADOS DE TAREFAS
    exportarTarefas(formato = 'json', filtros = {}) {
        try {
            console.log('📤 Exportando tarefas...', { formato, filtros });

            const tarefas = this.buscarTarefas('', filtros);

            if (tarefas.length === 0) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Nenhuma tarefa encontrada para exportar');
                }
                return;
            }

            const nomeArquivo = `tarefas_${new Date().toISOString().split('T')[0]}`;
            
            if (formato === 'csv') {
                this._exportarCSV(tarefas, nomeArquivo);
            } else {
                this._exportarJSON(tarefas, nomeArquivo);
            }

            if (typeof Notifications !== 'undefined') {
                Notifications.success(`${tarefas.length} tarefas exportadas em ${formato.toUpperCase()}`);
            }

        } catch (error) {
            console.error('❌ Erro ao exportar tarefas:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao exportar tarefas');
            }
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

    // ✅ OBTER STATUS DO SISTEMA - ATUALIZADO
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
            tarefasAgendaSemanal: stats.agendaSemanais,
            templatesDisponiveis: Object.keys(this.templates).length,
            integracaoCalendar: typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function',
            integracaoEvents: typeof Events !== 'undefined' && typeof Events.mostrarNovoEvento === 'function',
            integracaoPDF: typeof PDF !== 'undefined' && typeof PDF.mostrarModalAgenda === 'function',
            dependenciasOk: this.state.dependenciasVerificadas
        };
    },

    // ✅ === MÉTODOS PRIVADOS MELHORADOS ===

    // Criar modal de tarefa - VISUAL MELHORADO
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
                    <div class="form-section" style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">📋 Informações Básicas</h4>
                        
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
                    <div class="form-section" style="margin-bottom: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px;">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">👤 Responsável e Prazos</h4>
                        
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

                    <!-- Agenda Semanal - MELHORADA -->
                    <div class="form-section" style="margin-bottom: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px;">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">🔄 Agenda Semanal (Recorrente)</h4>
                        <div style="margin-bottom: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="tarefaAgendaSemanal">
                                📅 Esta tarefa faz parte da agenda semanal recorrente
                            </label>
                            <small style="color: #6b7280; margin-left: 24px;">
                                Tarefas da agenda semanal aparecem automaticamente no calendário no dia especificado
                            </small>
                        </div>
                        
                        <div id="configAgendaSemanal" style="display: none; background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1fae5;">
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
                                    <input type="time" id="tarefaHorario" value="09:00">
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
                    <div class="form-section" style="margin-bottom: 24px; padding: 16px; background: #fef3c7; border-radius: 8px;">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">📊 Progresso e Subtarefas</h4>
                        
                        <div class="form-group">
                            <label>📈 Progresso: <span id="progressoValor" style="font-weight: bold; color: #059669;">0%</span></label>
                            <input type="range" id="tarefaProgresso" min="0" max="100" value="0" 
                                   oninput="document.getElementById('progressoValor').textContent = this.value + '%'" 
                                   style="width: 100%; accent-color: #059669;">
                        </div>
                        
                        <div class="form-group">
                            <label>📋 Subtarefas:</label>
                            <div id="subtarefasContainer" style="min-height: 60px; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; background: white;">
                                <!-- Subtarefas serão adicionadas aqui -->
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="Tasks._adicionarSubtarefa()" 
                                    style="margin-top: 8px;">
                                ➕ Adicionar Subtarefa
                            </button>
                        </div>
                    </div>

                    <!-- Templates e Ações -->
                    <div class="form-section" style="padding: 16px; background: #fdf2f8; border-radius: 8px;">
                        <h4 style="margin: 0 0 16px 0; color: #1f2937;">🎯 Ações Rápidas</h4>
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

    // Configurar event listeners do modal - MELHORADO
    _configurarEventListeners() {
        try {
            // Toggle agenda semanal
            const agendaCheckbox = document.getElementById('tarefaAgendaSemanal');
            const configAgenda = document.getElementById('configAgendaSemanal');
            
            if (agendaCheckbox && configAgenda) {
                agendaCheckbox.addEventListener('change', (e) => {
                    configAgenda.style.display = e.target.checked ? 'block' : 'none';
                    if (e.target.checked) {
                        // Pré-selecionar segunda-feira e horário padrão se não definidos
                        if (!document.getElementById('tarefaDiaSemana').value) {
                            document.getElementById('tarefaDiaSemana').value = 'segunda';
                        }
                        if (!document.getElementById('tarefaHorario').value) {
                            document.getElementById('tarefaHorario').value = '09:00';
                        }
                    }
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

            // Validação em tempo real de datas - CORRIGIDA
            const dataInicio = document.getElementById('tarefaDataInicio');
            const dataFim = document.getElementById('tarefaDataFim');
            
            if (dataInicio && dataFim) {
                const validarDatas = () => {
                    if (dataInicio.value && dataFim.value) {
                        // CORREÇÃO: Usar Date objects para comparação
                        const inicio = new Date(dataInicio.value);
                        const fim = new Date(dataFim.value);
                        
                        if (inicio > fim) {
                            dataFim.style.borderColor = '#ef4444';
                            dataFim.title = 'Data de fim deve ser posterior à data de início';
                        } else {
                            dataFim.style.borderColor = '';
                            dataFim.title = '';
                        }
                    }
                };
                
                dataInicio.addEventListener('change', validarDatas);
                dataFim.addEventListener('change', validarDatas);
            }

        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    },

    // Preencher campos com dados da tarefa - CORRIGIDO
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

    // Coletar dados da tarefa do formulário - VALIDAÇÕES CORRIGIDAS
    _coletarDadosTarefa() {
        try {
            // Validações básicas
            const titulo = document.getElementById('tarefaTitulo').value.trim();
            if (!titulo) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Título da tarefa é obrigatório');
                }
                document.getElementById('tarefaTitulo').focus();
                return null;
            }

            const responsavel = document.getElementById('tarefaResponsavel').value;
            if (!responsavel) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Responsável é obrigatório');
                }
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

            // Validar datas - CORRIGIDO
            if (dados.dataInicio && dados.dataFim) {
                const inicio = new Date(dados.dataInicio);
                const fim = new Date(dados.dataFim);
                
                if (inicio > fim) {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Data de início não pode ser posterior à data de fim');
                    }
                    return null;
                }
            }

            // Agenda semanal
            const agendaSemanal = document.getElementById('tarefaAgendaSemanal').checked;
            if (agendaSemanal) {
                dados.agendaSemanal = true;
                dados.diaSemana = document.getElementById('tarefaDiaSemana').value;
                dados.horario = document.getElementById('tarefaHorario').value;
                dados.duracao = parseInt(document.getElementById('tarefaDuracao').value);
                dados.mostrarNoCalendario = document.getElementById('tarefaMostrarCalendario').checked;
                
                // Validar campos da agenda semanal
                if (!dados.diaSemana) {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Dia da semana é obrigatório para agenda semanal');
                    }
                    return null;
                }
                
                if (!dados.horario) {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Horário é obrigatório para agenda semanal');
                    }
                    return null;
                }
            }

            // Coletar subtarefas
            dados.subtarefas = this._coletarSubtarefas();

            return dados;

        } catch (error) {
            console.error('❌ Erro ao coletar dados da tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao validar dados da tarefa');
            }
            return null;
        }
    },

    // Coletar subtarefas - MANTIDO
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

    // Adicionar subtarefa - MANTIDO
    _adicionarSubtarefa(subtarefa = null) {
        try {
            const container = document.getElementById('subtarefasContainer');
            if (!container) return;

            const contadorAtual = container.children.length;
            if (contadorAtual >= this.config.MAX_SUBTAREFAS) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning(`Máximo de ${this.config.MAX_SUBTAREFAS} subtarefas permitidas`);
                }
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

    // Aplicar template - MANTIDO
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

            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Template "${template.nome}" aplicado`);
            }

        } catch (error) {
            console.error('❌ Erro ao aplicar template:', error);
        }
    },

    // Salvar rascunho - MANTIDO
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

    // Obter lista de pessoas - MELHORADO
    _obterListaPessoas() {
        try {
            const pessoas = new Set();
            
            // Pessoas das áreas
            if (App.dados?.areas) {
                Object.values(App.dados.areas).forEach(area => {
                    if (area.pessoas) {
                        area.pessoas.forEach(pessoa => pessoas.add(pessoa));
                    }
                    // Também buscar em area.equipe se existir
                    if (area.equipe) {
                        area.equipe.forEach(membro => {
                            if (typeof membro === 'string') {
                                pessoas.add(membro);
                            } else if (membro.nome) {
                                pessoas.add(membro.nome);
                            }
                        });
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

            // Usuário atual
            if (App.usuarioAtual?.displayName) {
                pessoas.add(App.usuarioAtual.displayName);
            }

            // Pessoas padrão se nenhuma encontrada
            if (pessoas.size === 0) {
                pessoas.add('Administrador');
                pessoas.add('Usuário Teste');
            }

            return Array.from(pessoas).sort();

        } catch (error) {
            console.error('❌ Erro ao obter lista de pessoas:', error);
            return ['Administrador', 'Usuário Teste'];
        }
    },

    // Exportar JSON - MANTIDO
    _exportarJSON(tarefas, nomeArquivo) {
        try {
            const dados = {
                tarefas,
                metadados: {
                    dataExportacao: new Date().toISOString(),
                    totalTarefas: tarefas.length,
                    versaoSistema: '6.2.1',
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

    // Exportar CSV - MANTIDO
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
    console.log('📝 Sistema de Gestão de Tarefas v6.2.1 carregado!');
    
    // Verificar dependências na inicialização
    setTimeout(() => {
        Tasks._verificarDependencias();
    }, 500);
    
    // Garantir estrutura de dados
    if (typeof App !== 'undefined' && App.dados && !App.dados.tarefas) {
        App.dados.tarefas = [];
        console.log('📊 Array de tarefas inicializado');
    }
});

// ✅ LOG DE CARREGAMENTO
console.log('📝 Sistema de Gestão de Tarefas v6.2.1 CORRIGIDO - Integração Perfeita!');
console.log('🎯 Funcionalidades: CRUD, Subtarefas, Agenda Semanal, Templates, PDF Export');
console.log('⚙️ Integração PERFEITA: Calendar.js, Events.js, PDF.js, Persistence.js');
console.log('✅ CORREÇÕES: Referências Events corrigidas, validação de datas, verificação dependências');
console.log('⌨️ Atalhos: Ctrl+T (nova tarefa), Esc (fechar modal)');
