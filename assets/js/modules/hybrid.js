/* ========== 🔄 SISTEMA DE SINCRONIZAÇÃO HÍBRIDA v6.6.0 ========== */

const HybridSync = {
    // ✅ CONFIGURAÇÕES
    config: {
        versao: '6.6.0',
        autoSyncEnabled: true,
        conflictDetectionEnabled: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        syncDelay: 100, // ms para evitar loops
        maxConflictsShow: 5,
        indicadoresVisuais: {
            sincronizado: '🔄',
            conflito: '⚠️',
            promovido: '⬆️',
            origem: '📅'
        }
    },

    // ✅ ESTADO INTERNO
    state: {
        inicializado: false,
        ultimaSync: null,
        eventosObservados: new Set(),
        tarefasObservadas: new Set(),
        conflitosDetectados: [],
        syncInProgress: false,
        estatisticas: {
            eventosSync: 0,
            tarefasPromovidas: 0,
            conflitosResolvidos: 0
        }
    },

    // ✅ INICIALIZAÇÃO DO MÓDULO
    inicializar() {
        try {
            console.log('🔄 Inicializando Sistema de Sincronização Híbrida v6.6.0...');

            // Verificar dependências
            if (!this._verificarDependencias()) {
                throw new Error('Dependências não satisfeitas');
            }

            // Configurar listeners automáticos
            this._configurarListeners();

            // Executar sincronização inicial
            this._executarSyncInicial();

            // Configurar verificação de conflitos
            this._iniciarMonitoramentoConflitos();

            this.state.inicializado = true;
            this.state.ultimaSync = new Date();

            console.log('✅ Sistema de Sincronização Híbrida inicializado com sucesso!');
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Sistema híbrido v6.6.0 - Sincronização ativada!');
            }

            return true;

        } catch (error) {
            console.error('❌ Erro ao inicializar sincronização híbrida:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro na sincronização: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ SINCRONIZAÇÃO AUTOMÁTICA: EVENTOS → TAREFAS PESSOAIS
    sincronizarEventosParaTarefas() {
        try {
            if (this.state.syncInProgress) {
                console.log('⏳ Sincronização já em andamento...');
                return;
            }

            this.state.syncInProgress = true;
            console.log('🔄 Iniciando sincronização Events → Tasks...');

            // Verificar se dados estão disponíveis
            if (!App.dados?.eventos || !App.dados?.tarefas) {
                console.warn('⚠️ Dados não disponíveis para sincronização');
                return;
            }

            let eventosProcessados = 0;
            let tarefasCriadas = 0;

            // Processar cada evento
            App.dados.eventos.forEach(evento => {
                if (evento.pessoas && Array.isArray(evento.pessoas)) {
                    evento.pessoas.forEach(participante => {
                        // Verificar se já existe tarefa sincronizada para este evento/participante
                        const tarefaExistente = this._buscarTarefaSincronizada(evento.id, participante);
                        
                        if (!tarefaExistente) {
                            // Criar nova tarefa pessoal sincronizada
                            const novaTarefa = this._criarTarefaSincronizada(evento, participante);
                            
                            if (novaTarefa) {
                                App.dados.tarefas.push(novaTarefa);
                                tarefasCriadas++;
                                this.state.estatisticas.eventosSync++;
                                
                                console.log(`✅ Tarefa criada para ${participante}: ${evento.titulo}`);
                            }
                        }
                    });
                }
                eventosProcessados++;
            });

            // Salvar dados se houve mudanças
            if (tarefasCriadas > 0) {
                this._salvarDados();
                this._atualizarInterface();
                
                if (typeof Notifications !== 'undefined') {
                    Notifications.success(`🔄 ${tarefasCriadas} tarefa(s) sincronizada(s) automaticamente`);
                }
            }

            console.log(`✅ Sincronização concluída: ${eventosProcessados} eventos processados, ${tarefasCriadas} tarefas criadas`);

        } catch (error) {
            console.error('❌ Erro na sincronização Events → Tasks:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro na sincronização automática');
            }
        } finally {
            this.state.syncInProgress = false;
        }
    },

    // ✅ PROMOÇÃO MANUAL: TAREFAS → EVENTOS
    promoverTarefaParaEvento(tarefaId) {
        try {
            console.log('⬆️ Promovendo tarefa para evento:', tarefaId);

            // Buscar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }

            // Verificar se já foi promovida
            if (tarefa.eventoPromovido) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Esta tarefa já foi promovida para evento');
                }
                return false;
            }

            // Criar evento baseado na tarefa
            const novoEvento = this._criarEventoPromovido(tarefa);
            
            if (!novoEvento) {
                throw new Error('Erro ao criar evento promovido');
            }

            // Adicionar evento aos dados
            if (!App.dados.eventos) {
                App.dados.eventos = [];
            }
            App.dados.eventos.push(novoEvento);

            // Marcar tarefa como promovida (mas mantê-la)
            tarefa.eventoPromovido = novoEvento.id;
            tarefa.ultimaAtualizacao = new Date().toISOString();

            // Salvar dados
            this._salvarDados();
            this._atualizarInterface();

            // Atualizar estatísticas
            this.state.estatisticas.tarefasPromovidas++;

            console.log(`✅ Tarefa "${tarefa.titulo}" promovida para evento ID: ${novoEvento.id}`);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`⬆️ Tarefa promovida para evento: "${tarefa.titulo}"`);
            }

            return novoEvento;

        } catch (error) {
            console.error('❌ Erro ao promover tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro na promoção: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ DETECTAR E EXIBIR CONFLITOS
    detectarConflitos() {
        try {
            if (!this.config.conflictDetectionEnabled) {
                return [];
            }

            console.log('🔍 Detectando conflitos de agenda...');

            const conflitos = [];
            const eventosETarefas = this._obterEventosETarefasComHorario();

            // Agrupar por pessoa e data
            const agendaPorPessoa = {};

            eventosETarefas.forEach(item => {
                const pessoas = item.tipo === 'evento' ? item.pessoas : [item.responsavel];
                
                pessoas.forEach(pessoa => {
                    if (!agendaPorPessoa[pessoa]) {
                        agendaPorPessoa[pessoa] = {};
                    }
                    
                    const data = item.data || item.dataInicio;
                    if (!data) return;
                    
                    if (!agendaPorPessoa[pessoa][data]) {
                        agendaPorPessoa[pessoa][data] = [];
                    }
                    
                    agendaPorPessoa[pessoa][data].push(item);
                });
            });

            // Detectar sobreposições
            Object.entries(agendaPorPessoa).forEach(([pessoa, agenda]) => {
                Object.entries(agenda).forEach(([data, itens]) => {
                    if (itens.length > 1) {
                        // Verificar sobreposições de horário
                        const conflitosData = this._verificarSobreposicaoHorarios(itens, pessoa, data);
                        conflitos.push(...conflitosData);
                    }
                });
            });

            this.state.conflitosDetectados = conflitos;

            if (conflitos.length > 0) {
                console.log(`⚠️ ${conflitos.length} conflito(s) detectado(s)`);
                this._exibirIndicadoresConflitos(conflitos);
            }

            return conflitos;

        } catch (error) {
            console.error('❌ Erro ao detectar conflitos:', error);
            return [];
        }
    },

    // ✅ OBTER ESTATÍSTICAS DO SISTEMA
    obterEstatisticas() {
        return {
            ...this.state.estatisticas,
            inicializado: this.state.inicializado,
            ultimaSync: this.state.ultimaSync,
            conflitosAtivos: this.state.conflitosDetectados.length,
            eventosMonitorados: this.state.eventosObservados.size,
            tarefasMonitoradas: this.state.tarefasObservadas.size
        };
    },

    // ✅ OBTER STATUS COMPLETO
    obterStatus() {
        const stats = this.obterEstatisticas();
        
        return {
            versao: this.config.versao,
            ativo: this.state.inicializado,
            autoSync: this.config.autoSyncEnabled,
            detectarConflitos: this.config.conflictDetectionEnabled,
            ultimaSync: this.state.ultimaSync?.toLocaleString('pt-BR'),
            estatisticas: stats,
            dependenciasOk: this._verificarDependencias(),
            integracoes: {
                Events: typeof Events !== 'undefined',
                Tasks: typeof Tasks !== 'undefined',
                Calendar: typeof Calendar !== 'undefined',
                PersonalAgenda: typeof PersonalAgenda !== 'undefined'
            }
        };
    },

    // === MÉTODOS PRIVADOS ===

    // ✅ VERIFICAR DEPENDÊNCIAS
    _verificarDependencias() {
        const dependencias = [
            typeof App !== 'undefined' && App.dados,
            typeof Events !== 'undefined',
            typeof Tasks !== 'undefined'
        ];

        return dependencias.every(dep => dep);
    },

    // ✅ CONFIGURAR LISTENERS AUTOMÁTICOS
    _configurarListeners() {
        console.log('🔧 Configurando listeners de sincronização...');

        // Listener para novos eventos (simulado - na implementação real seria no Events.js)
        this._configurarEventListeners();

        // Listener para mudanças nos dados (simulado)
        if (typeof App !== 'undefined' && App.dados) {
            // Em uma implementação real, usaríamos Proxy ou observers
            console.log('📡 Listeners configurados para mudanças nos dados');
        }
    },

    // ✅ CONFIGURAR EVENT LISTENERS
    _configurarEventListeners() {
        // Interceptar criação de eventos
        if (typeof Events !== 'undefined' && Events.salvarEvento) {
            const originalSalvarEvento = Events.salvarEvento;
            Events.salvarEvento = async (dadosEvento) => {
                const resultado = await originalSalvarEvento.call(Events, dadosEvento);
                
                if (resultado && this.config.autoSyncEnabled) {
                    // Aguardar um pouco para evitar loops
                    setTimeout(() => {
                        this.sincronizarEventosParaTarefas();
                    }, this.config.syncDelay);
                }
                
                return resultado;
            };
        }

        // Interceptar criação de tarefas (adicionar botão de promoção)
        if (typeof Tasks !== 'undefined') {
            console.log('🔗 Integração com Tasks.js configurada');
        }
    },

    // ✅ EXECUTAR SINCRONIZAÇÃO INICIAL
    _executarSyncInicial() {
        console.log('🔄 Executando sincronização inicial...');
        
        if (this.config.autoSyncEnabled) {
            // Aguardar um pouco para garantir que tudo está carregado
            setTimeout(() => {
                this.sincronizarEventosParaTarefas();
            }, 500);
        }
    },

    // ✅ INICIAR MONITORAMENTO DE CONFLITOS
    _iniciarMonitoramentoConflitos() {
        if (this.config.conflictDetectionEnabled) {
            // Detectar conflitos a cada 30 segundos
            setInterval(() => {
                this.detectarConflitos();
            }, 30000);
            
            console.log('⚠️ Monitoramento de conflitos ativado');
        }
    },

    // ✅ BUSCAR TAREFA SINCRONIZADA
    _buscarTarefaSincronizada(eventoId, participante) {
        if (!App.dados?.tarefas) return null;
        
        return App.dados.tarefas.find(tarefa => 
            tarefa.eventoOrigemId == eventoId && 
            tarefa.responsavel === participante &&
            tarefa.sincronizada === true
        );
    },

    // ✅ CRIAR TAREFA SINCRONIZADA
    _criarTarefaSincronizada(evento, participante) {
        try {
            const novaTarefa = {
                id: Date.now() + Math.random(), // ID único
                titulo: `${this.config.indicadoresVisuais.origem} ${evento.titulo}`,
                tipo: 'equipe',
                prioridade: this._mapearPrioridadePorTipo(evento.tipo),
                status: 'agendado',
                responsavel: participante,
                dataInicio: evento.data,
                dataFim: evento.data,
                horario: evento.horarioInicio,
                horarioFim: evento.horarioFim,
                descricao: evento.descricao || `Participação no evento: ${evento.titulo}`,
                // Campos de sincronização
                sincronizada: true,
                eventoOrigemId: evento.id,
                tipoSincronizacao: 'evento_para_tarefa',
                dataSincronizacao: new Date().toISOString(),
                progresso: 0,
                dataCriacao: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
            };

            return novaTarefa;

        } catch (error) {
            console.error('❌ Erro ao criar tarefa sincronizada:', error);
            return null;
        }
    },

    // ✅ CRIAR EVENTO PROMOVIDO
    _criarEventoPromovido(tarefa) {
        try {
            // Determinar participantes
            let participantes = [tarefa.responsavel];
            
            // Se tarefa tem participantes marcados, usar eles
            if (tarefa.participantes && Array.isArray(tarefa.participantes)) {
                participantes = tarefa.participantes;
            } else if (tarefa.equipe && Array.isArray(tarefa.equipe)) {
                participantes = tarefa.equipe;
            }

            const novoEvento = {
                id: Date.now() + Math.random(), // ID único
                titulo: `${this.config.indicadoresVisuais.promovido} ${tarefa.titulo}`,
                tipo: this._mapearTipoParaEvento(tarefa.tipo),
                data: tarefa.dataFim || tarefa.dataInicio || new Date().toISOString().split('T')[0],
                horarioInicio: tarefa.horario || '09:00',
                horarioFim: tarefa.horarioFim || this._calcularHorarioFim(tarefa.horario, tarefa.estimativa),
                pessoas: participantes,
                descricao: tarefa.descricao || `Evento criado a partir da tarefa: ${tarefa.titulo}`,
                local: tarefa.local || '',
                status: 'agendado',
                // Campos de sincronização
                promovido: true,
                tarefaOrigemId: tarefa.id,
                tipoSincronizacao: 'tarefa_para_evento',
                dataPromocao: new Date().toISOString(),
                dataCriacao: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
            };

            return novoEvento;

        } catch (error) {
            console.error('❌ Erro ao criar evento promovido:', error);
            return null;
        }
    },

    // ✅ MAPEAR PRIORIDADE POR TIPO DE EVENTO
    _mapearPrioridadePorTipo(tipoEvento) {
        const mapeamento = {
            'reuniao': 'media',
            'entrega': 'alta',
            'prazo': 'critica',
            'marco': 'alta',
            'outro': 'baixa'
        };
        
        return mapeamento[tipoEvento] || 'media';
    },

    // ✅ MAPEAR TIPO DE TAREFA PARA TIPO DE EVENTO
    _mapearTipoParaEvento(tipoTarefa) {
        const mapeamento = {
            'pessoal': 'outro',
            'equipe': 'reuniao',
            'projeto': 'marco',
            'urgente': 'prazo',
            'rotina': 'outro'
        };
        
        return mapeamento[tipoTarefa] || 'outro';
    },

    // ✅ CALCULAR HORÁRIO DE FIM
    _calcularHorarioFim(horarioInicio, estimativaMinutos) {
        if (!horarioInicio) return '10:00';
        
        try {
            const [hora, minuto] = horarioInicio.split(':').map(Number);
            const estimativa = estimativaMinutos || 60; // default 1h
            
            const totalMinutos = hora * 60 + minuto + estimativa;
            const horaFim = Math.floor(totalMinutos / 60);
            const minutoFim = totalMinutos % 60;
            
            return `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
            
        } catch (error) {
            return '10:00'; // fallback
        }
    },

    // ✅ OBTER EVENTOS E TAREFAS COM HORÁRIO
    _obterEventosETarefasComHorario() {
        const itens = [];
        
        // Adicionar eventos
        if (App.dados?.eventos) {
            App.dados.eventos.forEach(evento => {
                if (evento.horarioInicio) {
                    itens.push({
                        ...evento,
                        tipo: 'evento',
                        horario: evento.horarioInicio
                    });
                }
            });
        }
        
        // Adicionar tarefas com horário
        if (App.dados?.tarefas) {
            App.dados.tarefas.forEach(tarefa => {
                if (tarefa.horario || tarefa.dataInicio) {
                    itens.push({
                        ...tarefa,
                        tipo: 'tarefa',
                        data: tarefa.dataInicio || tarefa.dataFim
                    });
                }
            });
        }
        
        return itens;
    },

    // ✅ VERIFICAR SOBREPOSIÇÃO DE HORÁRIOS
    _verificarSobreposicaoHorarios(itens, pessoa, data) {
        const conflitos = [];
        
        for (let i = 0; i < itens.length; i++) {
            for (let j = i + 1; j < itens.length; j++) {
                const item1 = itens[i];
                const item2 = itens[j];
                
                if (this._horariosSeSerempem(item1, item2)) {
                    conflitos.push({
                        tipo: 'sobreposicao_horario',
                        pessoa: pessoa,
                        data: data,
                        item1: item1,
                        item2: item2,
                        gravidade: this._calcularGravidadeConflito(item1, item2),
                        detectedAt: new Date()
                    });
                }
            }
        }
        
        return conflitos;
    },

    // ✅ VERIFICAR SE HORÁRIOS SE SOBREPÕEM
    _horariosSeSerempem(item1, item2) {
        try {
            const horario1Inicio = item1.horario || item1.horarioInicio;
            const horario1Fim = item1.horarioFim || this._calcularHorarioFim(horario1Inicio, item1.estimativa);
            
            const horario2Inicio = item2.horario || item2.horarioInicio;
            const horario2Fim = item2.horarioFim || this._calcularHorarioFim(horario2Inicio, item2.estimativa);
            
            if (!horario1Inicio || !horario2Inicio) return false;
            
            const inicio1 = this._converterHorarioParaMinutos(horario1Inicio);
            const fim1 = this._converterHorarioParaMinutos(horario1Fim);
            const inicio2 = this._converterHorarioParaMinutos(horario2Inicio);
            const fim2 = this._converterHorarioParaMinutos(horario2Fim);
            
            return (inicio1 < fim2 && inicio2 < fim1);
            
        } catch (error) {
            return false;
        }
    },

    // ✅ CONVERTER HORÁRIO PARA MINUTOS
    _converterHorarioParaMinutos(horario) {
        const [hora, minuto] = horario.split(':').map(Number);
        return hora * 60 + minuto;
    },

    // ✅ CALCULAR GRAVIDADE DO CONFLITO
    _calcularGravidadeConflito(item1, item2) {
        let gravidade = 1;
        
        // Evento vs evento = mais grave
        if (item1.tipo === 'evento' && item2.tipo === 'evento') {
            gravidade += 2;
        }
        
        // Prioridades altas = mais grave
        if (item1.prioridade === 'critica' || item2.prioridade === 'critica') {
            gravidade += 2;
        } else if (item1.prioridade === 'alta' || item2.prioridade === 'alta') {
            gravidade += 1;
        }
        
        return Math.min(gravidade, 5); // máximo 5
    },

    // ✅ EXIBIR INDICADORES DE CONFLITOS
    _exibirIndicadoresConflitos(conflitos) {
        if (conflitos.length === 0) return;
        
        // Mostrar até 5 conflitos mais graves
        const conflitosParaMostrar = conflitos
            .sort((a, b) => b.gravidade - a.gravidade)
            .slice(0, this.config.maxConflictsShow);
        
        conflitosParaMostrar.forEach(conflito => {
            const mensagem = `⚠️ Conflito: ${conflito.pessoa} tem sobreposição em ${new Date(conflito.data).toLocaleDateString('pt-BR')}`;
            
            if (typeof Notifications !== 'undefined') {
                Notifications.warning(mensagem);
            }
            
            console.log(`⚠️ CONFLITO DETECTADO:`);
            console.log(`   Pessoa: ${conflito.pessoa}`);
            console.log(`   Data: ${conflito.data}`);
            console.log(`   Item 1: ${conflito.item1.titulo} (${conflito.item1.horario || conflito.item1.horarioInicio})`);
            console.log(`   Item 2: ${conflito.item2.titulo} (${conflito.item2.horario || conflito.item2.horarioInicio})`);
            console.log(`   Gravidade: ${conflito.gravidade}/5`);
        });
    },

    // ✅ SALVAR DADOS
    _salvarDados() {
        try {
            if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
                Persistence.salvarDadosCritico();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    },

    // ✅ ATUALIZAR INTERFACE
    _atualizarInterface() {
        try {
            // Atualizar calendário
            if (typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function') {
                Calendar.gerar();
            }
            
            // Atualizar agenda pessoal se estiver aberta
            if (typeof PersonalAgenda !== 'undefined' && PersonalAgenda.state?.modalAberto) {
                if (typeof PersonalAgenda._atualizarDados === 'function') {
                    PersonalAgenda._atualizarDados();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar interface:', error);
        }
    }
};

// ✅ EXTENSÃO PARA TASKS.JS - BOTÃO DE PROMOÇÃO
const TasksHybridExtension = {
    // Adicionar botão de promoção a todas as tarefas
    adicionarBotaoPromocao(tarefaId, container) {
        if (!container) return;
        
        const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
        if (!tarefa) return;
        
        // Não mostrar se já foi promovida
        if (tarefa.eventoPromovido) {
            return;
        }
        
        const botaoPromover = document.createElement('button');
        botaoPromover.className = 'btn btn-success btn-sm';
        botaoPromover.style.cssText = 'font-size: 10px; padding: 2px 6px; margin-left: 4px;';
        botaoPromover.innerHTML = '⬆️ Promover para Evento';
        botaoPromover.title = 'Promover esta tarefa para evento do calendário principal';
        
        botaoPromover.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const confirmacao = confirm(
                `Promover tarefa para evento?\n\n` +
                `📝 ${tarefa.titulo}\n\n` +
                `Isso criará um evento no calendário principal.`
            );
            
            if (confirmacao) {
                HybridSync.promoverTarefaParaEvento(tarefaId);
            }
        });
        
        container.appendChild(botaoPromover);
    }
};

// ✅ EXTENSÃO PARA PERSONAL AGENDA - INTEGRAÇÃO DE BOTÕES
const PersonalAgendaHybridExtension = {
    // Adicionar botões de promoção aos renderizadores
    integrarBotoesPromocao() {
        // Esta função seria integrada ao PersonalAgenda._renderizarTarefaMini
        console.log('🔗 Integração com PersonalAgenda configurada');
    }
};

// ✅ FUNÇÕES GLOBAIS PARA DEBUG E CONTROLE
window.HybridSync_Debug = {
    status: () => HybridSync.obterStatus(),
    estatisticas: () => HybridSync.obterEstatisticas(),
    conflitos: () => HybridSync.detectarConflitos(),
    sincronizar: () => HybridSync.sincronizarEventosParaTarefas(),
    promover: (tarefaId) => HybridSync.promoverTarefaParaEvento(tarefaId),
    inicializar: () => HybridSync.inicializar(),
    
    // Funções de teste
    criarEventoTeste: () => {
        const eventoTeste = {
            id: Date.now(),
            titulo: 'Reunião de Teste Sync',
            tipo: 'reuniao',
            data: new Date().toISOString().split('T')[0],
            horarioInicio: '14:00',
            horarioFim: '15:00',
            pessoas: ['Isabella', 'Lara', 'Eduardo'],
            descricao: 'Evento de teste para sincronização'
        };
        
        if (!App.dados.eventos) App.dados.eventos = [];
        App.dados.eventos.push(eventoTeste);
        
        console.log('✅ Evento de teste criado:', eventoTeste);
        HybridSync.sincronizarEventosParaTarefas();
        
        return eventoTeste;
    },
    
    criarTarefaTeste: () => {
        const tarefaTeste = {
            id: Date.now(),
            titulo: 'Tarefa de Teste para Promoção',
            tipo: 'projeto',
            prioridade: 'alta',
            status: 'pendente',
            responsavel: 'Isabella',
            dataInicio: new Date().toISOString().split('T')[0],
            estimativa: 90,
            participantes: ['Isabella', 'Eduardo', 'Beto'],
            descricao: 'Tarefa de teste para promoção a evento'
        };
        
        if (!App.dados.tarefas) App.dados.tarefas = [];
        App.dados.tarefas.push(tarefaTeste);
        
        console.log('✅ Tarefa de teste criada:', tarefaTeste);
        
        return tarefaTeste;
    }
};

// ✅ AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar outros módulos carregarem
    setTimeout(() => {
        if (typeof App !== 'undefined' && App.dados) {
            HybridSync.inicializar();
        }
    }, 2000);
});

// ✅ LOG DE CARREGAMENTO
console.log('🔄 Sistema de Sincronização Híbrida v6.6.0 carregado!');
console.log('🎯 Funcionalidades: Auto-sync Events→Tasks, Promoção Tasks→Events, Detecção de Conflitos');
console.log('✅ Integração: Events.js, Tasks.js, PersonalAgenda.js, Calendar.js');
console.log('🧪 Debug: HybridSync_Debug.status(), HybridSync_Debug.criarEventoTeste(), HybridSync_Debug.sincronizar()');
console.log('⚡ Auto-inicialização: Aguardando 2 segundos após DOMContentLoaded');
