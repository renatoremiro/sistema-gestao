/* ========== 🔄 SISTEMA DE SINCRONIZAÇÃO HÍBRIDA v6.7.0 - CORRIGIDO ========== */

const HybridSync = {
    // ✅ CONFIGURAÇÕES
    config: {
        versao: '6.7.0', // Atualizada
        autoSyncEnabled: true,
        conflictDetectionEnabled: true,
        logLevel: 'info',
        syncDelay: 100,
        maxConflictsShow: 5,
        indicadoresVisuais: {
            sincronizado: '🔄',
            conflito: '⚠️',
            promovido: '⬆️',
            origem: '📅'
        },
        // 🔧 NOVA: Configurações anti-duplicata
        antiDuplicata: {
            enabled: true,
            verificarAntesDecriar: true,
            limparAutomaticamente: true,
            intervaloLimpeza: 60000 // 1 minuto
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
            conflitosResolvidos: 0,
            duplicatasRemovidas: 0 // 🔧 NOVA
        },
        // 🔧 NOVO: Controle de limpeza automática
        intervaloLimpeza: null
    },

    // ✅ INICIALIZAÇÃO DO MÓDULO
    inicializar() {
        try {
            console.log('🔄 Inicializando Sistema de Sincronização Híbrida v6.7.0 CORRIGIDO...');

            if (!this._verificarDependencias()) {
                throw new Error('Dependências não satisfeitas');
            }

            this._configurarListeners();
            this._executarSyncInicial();
            this._iniciarMonitoramentoConflitos();
            
            // 🔧 NOVO: Iniciar limpeza automática
            this._iniciarLimpezaAutomatica();

            this.state.inicializado = true;
            this.state.ultimaSync = new Date();

            console.log('✅ Sistema de Sincronização Híbrida CORRIGIDO inicializado!');
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Sistema híbrido v6.7.0 CORRIGIDO - Anti-duplicatas ativo!');
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

    // 🔧 FUNÇÃO CORRIGIDA: SINCRONIZAÇÃO AUTOMÁTICA SEM DUPLICATAS
    sincronizarEventosParaTarefas() {
        try {
            if (this.state.syncInProgress) {
                console.log('⏳ Sincronização já em andamento...');
                return;
            }

            this.state.syncInProgress = true;
            console.log('🔄 Iniciando sincronização CORRIGIDA Events → Tasks...');

            if (!App.dados?.eventos || !App.dados?.tarefas) {
                console.warn('⚠️ Dados não disponíveis para sincronização');
                this.state.syncInProgress = false;
                return;
            }

            let eventosProcessados = 0;
            let tarefasCriadas = 0;

            App.dados.eventos.forEach(evento => {
                if (evento.pessoas && Array.isArray(evento.pessoas)) {
                    evento.pessoas.forEach(participante => {
                        // 🔧 CORREÇÃO PRINCIPAL: Usar função melhorada
                        const tarefaExistente = this._buscarTarefaSincronizadaSegura(evento.id, participante);
                        
                        if (!tarefaExistente) {
                            const novaTarefa = this._criarTarefaSincronizada(evento, participante);
                            
                            if (novaTarefa) {
                                App.dados.tarefas.push(novaTarefa);
                                tarefasCriadas++;
                                this.state.estatisticas.eventosSync++;
                                
                                console.log(`✅ Tarefa criada para ${participante}: ${evento.titulo}`);
                            }
                        } else {
                            console.log(`ℹ️ Tarefa já existe para ${participante}: ${evento.titulo}`);
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
                    Notifications.success(`🔄 ${tarefasCriadas} nova(s) tarefa(s) sincronizada(s)`);
                }
            }

            console.log(`✅ Sincronização CORRIGIDA: ${eventosProcessados} eventos, ${tarefasCriadas} tarefas criadas`);

        } catch (error) {
            console.error('❌ Erro na sincronização CORRIGIDA:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro na sincronização automática');
            }
        } finally {
            this.state.syncInProgress = false;
        }
    },

    // 🔧 FUNÇÃO CORRIGIDA: BUSCA SEGURA DE TAREFA SINCRONIZADA
    _buscarTarefaSincronizadaSegura(eventoId, participante) {
        if (!App.dados?.tarefas) return null;
        
        // Busca rigorosa para evitar duplicatas
        const tarefasSincronizadas = App.dados.tarefas.filter(tarefa => 
            tarefa.eventoOrigemId == eventoId && 
            tarefa.responsavel === participante &&
            tarefa.sincronizada === true &&
            tarefa.tipoSincronizacao === 'evento_para_tarefa'
        );
        
        if (tarefasSincronizadas.length === 0) {
            return null;
        } else if (tarefasSincronizadas.length === 1) {
            return tarefasSincronizadas[0];
        } else {
            // 🔧 Se há múltiplas, retornar a mais recente e marcar outras para remoção
            console.warn(`⚠️ ${tarefasSincronizadas.length} tarefas sincronizadas para evento ${eventoId} e ${participante} - mantendo apenas a mais recente`);
            
            // Ordenar por data de criação (mais recente primeiro)
            tarefasSincronizadas.sort((a, b) => {
                const dataA = new Date(a.dataCriacao || a.dataSincronizacao || 0);
                const dataB = new Date(b.dataCriacao || b.dataSincronizacao || 0);
                return dataB - dataA;
            });
            
            // Agendar remoção das duplicatas (execução assíncrona para não interferir no loop)
            setTimeout(() => {
                this._removerTarefasDuplicadas(tarefasSincronizadas.slice(1));
            }, 100);
            
            return tarefasSincronizadas[0]; // Retornar a mais recente
        }
    },

    // 🔧 NOVA FUNÇÃO: Remover tarefas duplicadas
    _removerTarefasDuplicadas(tarefasParaRemover) {
        try {
            let removidas = 0;
            
            tarefasParaRemover.forEach(tarefa => {
                const index = App.dados.tarefas.findIndex(t => t.id === tarefa.id);
                if (index !== -1) {
                    App.dados.tarefas.splice(index, 1);
                    removidas++;
                    console.log(`🗑️ Duplicata removida automaticamente: ${tarefa.titulo} (${tarefa.responsavel})`);
                }
            });
            
            if (removidas > 0) {
                this.state.estatisticas.duplicatasRemovidas += removidas;
                this._salvarDados();
                
                if (typeof Notifications !== 'undefined') {
                    Notifications.info(`🧹 ${removidas} duplicata(s) removida(s) automaticamente`);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao remover duplicatas:', error);
        }
    },

    // 🔧 NOVA FUNÇÃO: Limpeza automática periódica
    limparDuplicatasAutomaticamente() {
        try {
            if (!this.config.antiDuplicata.enabled) return 0;
            
            console.log('🧹 Executando limpeza automática de duplicatas...');
            
            if (!App.dados?.tarefas) return 0;
            
            const tarefasSincronizadas = App.dados.tarefas.filter(t => t.sincronizada === true);
            const grupos = {};
            let removidas = 0;
            
            // Agrupar por evento e responsável
            tarefasSincronizadas.forEach(tarefa => {
                const chave = `${tarefa.eventoOrigemId}_${tarefa.responsavel}`;
                if (!grupos[chave]) {
                    grupos[chave] = [];
                }
                grupos[chave].push(tarefa);
            });
            
            // Remover duplicatas
            Object.entries(grupos).forEach(([chave, tarefasGrupo]) => {
                if (tarefasGrupo.length > 1) {
                    // Ordenar e manter apenas a mais recente
                    tarefasGrupo.sort((a, b) => {
                        const dataA = new Date(a.dataCriacao || a.dataSincronizacao || 0);
                        const dataB = new Date(b.dataCriacao || b.dataSincronizacao || 0);
                        return dataB - dataA;
                    });
                    
                    // Remover duplicatas
                    const paraRemover = tarefasGrupo.slice(1);
                    paraRemover.forEach(tarefa => {
                        const index = App.dados.tarefas.findIndex(t => t.id === tarefa.id);
                        if (index !== -1) {
                            App.dados.tarefas.splice(index, 1);
                            removidas++;
                            console.log(`🧹 Limpeza automática: removida "${tarefa.titulo}" (${tarefa.responsavel})`);
                        }
                    });
                }
            });
            
            if (removidas > 0) {
                this.state.estatisticas.duplicatasRemovidas += removidas;
                this._salvarDados();
                console.log(`🧹 Limpeza automática: ${removidas} duplicata(s) removida(s)`);
            }
            
            return removidas;
            
        } catch (error) {
            console.error('❌ Erro na limpeza automática:', error);
            return 0;
        }
    },

    // 🔧 NOVA FUNÇÃO: Iniciar limpeza automática
    _iniciarLimpezaAutomatica() {
        if (!this.config.antiDuplicata.limparAutomaticamente) return;
        
        // Limpar intervalo anterior se existir
        if (this.state.intervaloLimpeza) {
            clearInterval(this.state.intervaloLimpeza);
        }
        
        // Configurar novo intervalo
        this.state.intervaloLimpeza = setInterval(() => {
            const removidas = this.limparDuplicatasAutomaticamente();
            if (removidas > 0) {
                console.log(`🔄 Limpeza automática executada: ${removidas} duplicata(s) removida(s)`);
            }
        }, this.config.antiDuplicata.intervaloLimpeza);
        
        console.log(`🤖 Limpeza automática ativada: a cada ${this.config.antiDuplicata.intervaloLimpeza/1000}s`);
    },

    // ✅ PROMOÇÃO MANUAL: TAREFAS → EVENTOS (mantida igual)
    promoverTarefaParaEvento(tarefaId) {
        try {
            console.log('⬆️ Promovendo tarefa para evento:', tarefaId);

            const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }

            if (tarefa.eventoPromovido) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Esta tarefa já foi promovida para evento');
                }
                return false;
            }

            const novoEvento = this._criarEventoPromovido(tarefa);
            
            if (!novoEvento) {
                throw new Error('Erro ao criar evento promovido');
            }

            if (!App.dados.eventos) {
                App.dados.eventos = [];
            }
            App.dados.eventos.push(novoEvento);

            tarefa.eventoPromovido = novoEvento.id;
            tarefa.ultimaAtualizacao = new Date().toISOString();

            this._salvarDados();
            this._atualizarInterface();

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

    // ✅ DETECTAR E EXIBIR CONFLITOS (mantida igual)
    detectarConflitos() {
        try {
            if (!this.config.conflictDetectionEnabled) {
                return [];
            }

            console.log('🔍 Detectando conflitos de agenda...');

            const conflitos = [];
            const eventosETarefas = this._obterEventosETarefasComHorario();

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

            Object.entries(agendaPorPessoa).forEach(([pessoa, agenda]) => {
                Object.entries(agenda).forEach(([data, itens]) => {
                    if (itens.length > 1) {
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

    // ✅ OBTER ESTATÍSTICAS (atualizada)
    obterEstatisticas() {
        return {
            ...this.state.estatisticas,
            inicializado: this.state.inicializado,
            ultimaSync: this.state.ultimaSync,
            conflitosAtivos: this.state.conflitosDetectados.length,
            eventosMonitorados: this.state.eventosObservados.size,
            tarefasMonitoradas: this.state.tarefasObservadas.size,
            // 🔧 NOVA: estatísticas anti-duplicata
            limpezaAutomaticaAtiva: !!this.state.intervaloLimpeza
        };
    },

    // ✅ OBTER STATUS (atualizada)
    obterStatus() {
        const stats = this.obterEstatisticas();
        
        return {
            versao: this.config.versao,
            ativo: this.state.inicializado,
            autoSync: this.config.autoSyncEnabled,
            detectarConflitos: this.config.conflictDetectionEnabled,
            // 🔧 NOVA: status anti-duplicata
            antiDuplicata: this.config.antiDuplicata.enabled,
            limpezaAutomatica: this.config.antiDuplicata.limparAutomaticamente,
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

    // === MÉTODOS PRIVADOS (mantidos iguais) ===

    _verificarDependencias() {
        const dependencias = [
            typeof App !== 'undefined' && App.dados,
            typeof Events !== 'undefined',
            typeof Tasks !== 'undefined'
        ];

        return dependencias.every(dep => dep);
    },

    _configurarListeners() {
        console.log('🔧 Configurando listeners de sincronização...');
        this._configurarEventListeners();

        if (typeof App !== 'undefined' && App.dados) {
            console.log('📡 Listeners configurados para mudanças nos dados');
        }
    },

    _configurarEventListeners() {
        if (typeof Events !== 'undefined' && Events.salvarEvento) {
            const originalSalvarEvento = Events.salvarEvento;
            Events.salvarEvento = async (dadosEvento) => {
                const resultado = await originalSalvarEvento.call(Events, dadosEvento);
                
                if (resultado && this.config.autoSyncEnabled) {
                    setTimeout(() => {
                        this.sincronizarEventosParaTarefas();
                    }, this.config.syncDelay);
                }
                
                return resultado;
            };
        }

        if (typeof Tasks !== 'undefined') {
            console.log('🔗 Integração com Tasks.js configurada');
        }
    },

    _executarSyncInicial() {
        console.log('🔄 Executando sincronização inicial...');
        
        if (this.config.autoSyncEnabled) {
            setTimeout(() => {
                this.sincronizarEventosParaTarefas();
            }, 500);
        }
    },

    _iniciarMonitoramentoConflitos() {
        if (this.config.conflictDetectionEnabled) {
            setInterval(() => {
                this.detectarConflitos();
            }, 30000);
            
            console.log('⚠️ Monitoramento de conflitos ativado');
        }
    },

    // 🔧 FUNÇÃO CORRIGIDA: busca original mantida para compatibilidade
    _buscarTarefaSincronizada(eventoId, participante) {
        // Redirecionar para função segura
        return this._buscarTarefaSincronizadaSegura(eventoId, participante);
    },

    _criarTarefaSincronizada(evento, participante) {
        try {
            const novaTarefa = {
                id: Date.now() + Math.random(),
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

    _criarEventoPromovido(tarefa) {
        try {
            let participantes = [tarefa.responsavel];
            
            if (tarefa.participantes && Array.isArray(tarefa.participantes)) {
                participantes = tarefa.participantes;
            } else if (tarefa.equipe && Array.isArray(tarefa.equipe)) {
                participantes = tarefa.equipe;
            }

            const novoEvento = {
                id: Date.now() + Math.random(),
                titulo: `${this.config.indicadoresVisuais.promovido} ${tarefa.titulo}`,
                tipo: this._mapearTipoParaEvento(tarefa.tipo),
                data: tarefa.dataFim || tarefa.dataInicio || new Date().toISOString().split('T')[0],
                horarioInicio: tarefa.horario || '09:00',
                horarioFim: tarefa.horarioFim || this._calcularHorarioFim(tarefa.horario, tarefa.estimativa),
                pessoas: participantes,
                descricao: tarefa.descricao || `Evento criado a partir da tarefa: ${tarefa.titulo}`,
                local: tarefa.local || '',
                status: 'agendado',
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

    _calcularHorarioFim(horarioInicio, estimativaMinutos) {
        if (!horarioInicio) return '10:00';
        
        try {
            const [hora, minuto] = horarioInicio.split(':').map(Number);
            const estimativa = estimativaMinutos || 60;
            
            const totalMinutos = hora * 60 + minuto + estimativa;
            const horaFim = Math.floor(totalMinutos / 60);
            const minutoFim = totalMinutos % 60;
            
            return `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
            
        } catch (error) {
            return '10:00';
        }
    },

    _obterEventosETarefasComHorario() {
        const itens = [];
        
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

    _converterHorarioParaMinutos(horario) {
        const [hora, minuto] = horario.split(':').map(Number);
        return hora * 60 + minuto;
    },

    _calcularGravidadeConflito(item1, item2) {
        let gravidade = 1;
        
        if (item1.tipo === 'evento' && item2.tipo === 'evento') {
            gravidade += 2;
        }
        
        if (item1.prioridade === 'critica' || item2.prioridade === 'critica') {
            gravidade += 2;
        } else if (item1.prioridade === 'alta' || item2.prioridade === 'alta') {
            gravidade += 1;
        }
        
        return Math.min(gravidade, 5);
    },

    _exibirIndicadoresConflitos(conflitos) {
        if (conflitos.length === 0) return;
        
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

    _salvarDados() {
        try {
            if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
                Persistence.salvarDadosCritico();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    },

    _atualizarInterface() {
        try {
            if (typeof Calendar !== 'undefined' && typeof Calendar.gerar === 'function') {
                Calendar.gerar();
            }
            
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

// ✅ EXTENSÃO PARA TASKS.JS - BOTÃO DE PROMOÇÃO (mantida igual)
const TasksHybridExtension = {
    adicionarBotaoPromocao(tarefaId, container) {
        if (!container) return;
        
        const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
        if (!tarefa) return;
        
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

// ✅ EXTENSÃO PARA PERSONAL AGENDA - INTEGRAÇÃO DE BOTÕES (mantida igual)
const PersonalAgendaHybridExtension = {
    integrarBotoesPromocao() {
        console.log('🔗 Integração com PersonalAgenda configurada');
    }
};

// ✅ FUNÇÕES GLOBAIS PARA DEBUG E CONTROLE (atualizadas)
window.HybridSync_Debug = {
    status: () => HybridSync.obterStatus(),
    estatisticas: () => HybridSync.obterEstatisticas(),
    conflitos: () => HybridSync.detectarConflitos(),
    sincronizar: () => HybridSync.sincronizarEventosParaTarefas(),
    promover: (tarefaId) => HybridSync.promoverTarefaParaEvento(tarefaId),
    inicializar: () => HybridSync.inicializar(),
    // 🔧 NOVAS funções de debug
    limparDuplicatas: () => HybridSync.limparDuplicatasAutomaticamente(),
    
    criarEventoTeste: () => {
        const eventoTeste = {
            id: Date.now(),
            titulo: 'Reunião de Teste Sync v6.7.0',
            tipo: 'reuniao',
            data: new Date().toISOString().split('T')[0],
            horarioInicio: '14:00',
            horarioFim: '15:00',
            pessoas: ['Isabella', 'Lara', 'Eduardo'],
            descricao: 'Evento de teste para sincronização CORRIGIDA'
        };
        
        if (!App.dados.eventos) App.dados.eventos = [];
        App.dados.eventos.push(eventoTeste);
        
        console.log('✅ Evento de teste v6.7.0 criado:', eventoTeste);
        HybridSync.sincronizarEventosParaTarefas();
        
        return eventoTeste;
    },
    
    criarTarefaTeste: () => {
        const tarefaTeste = {
            id: Date.now(),
            titulo: 'Tarefa de Teste para Promoção v6.7.0',
            tipo: 'projeto',
            prioridade: 'alta',
            status: 'pendente',
            responsavel: 'Isabella',
            dataInicio: new Date().toISOString().split('T')[0],
            estimativa: 90,
            participantes: ['Isabella', 'Eduardo', 'Beto'],
            descricao: 'Tarefa de teste para promoção a evento CORRIGIDA'
        };
        
        if (!App.dados.tarefas) App.dados.tarefas = [];
        App.dados.tarefas.push(tarefaTeste);
        
        console.log('✅ Tarefa de teste v6.7.0 criada:', tarefaTeste);
        
        return tarefaTeste;
    }
};

// ✅ AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof App !== 'undefined' && App.dados) {
            HybridSync.inicializar();
        }
    }, 2000);
});

// ✅ LOG DE CARREGAMENTO CORRIGIDO
console.log('🔄 Sistema de Sincronização Híbrida v6.7.0 CORRIGIDO carregado!');
console.log('🎯 CORREÇÕES: Anti-duplicatas, busca segura, limpeza automática');
console.log('✅ Integração: Events.js, Tasks.js, PersonalAgenda.js, Calendar.js');
console.log('🧪 Debug: HybridSync_Debug.status(), HybridSync_Debug.limparDuplicatas()');
console.log('⚡ Auto-inicialização: Aguardando 2 segundos após DOMContentLoaded');
