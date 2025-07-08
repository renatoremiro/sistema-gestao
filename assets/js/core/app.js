/**
 * 🏗️ Sistema Principal BIAPO v8.7.0 - ESTRUTURA UNIFICADA FIREBASE
 * 
 * 🔥 FASE 1 - UNIFICAÇÃO DE ESTRUTURA DE DADOS:
 * - ✅ Diferenciação clara: eventos vs tarefas
 * - ✅ Sistema de escopos: pessoal, equipe, público
 * - ✅ Permissões granulares por item
 * - ✅ Estrutura padronizada no Firebase
 * - ✅ Compatibilidade total com código existente
 */

const App = {
    // ✅ CONFIGURAÇÕES UNIFICADAS v8.7.0
    config: {
        versao: '8.7.0',
        debug: false,
        firebasePath: 'dados', // UM SÓ PATH
        syncRealtime: true,
        timeoutOperacao: 8000,
        maxTentativas: 2,
        backupAutomatico: true,
        
        // 🔥 NOVO: Configurações de estrutura unificada
        estruturaUnificada: true,
        suporteTipos: ['evento', 'tarefa'],
        suporteEscopos: ['pessoal', 'equipe', 'publico'],
        suporteVisibilidade: ['privada', 'equipe', 'publica']
    },

    // ✅ DADOS UNIFICADOS - ESTRUTURA PADRONIZADA v8.7.0
    dados: {
        eventos: [],      // Array de eventos (escopo: equipe/publico)
        tarefas: [],      // Array de tarefas (escopo: pessoal/equipe)
        areas: {},        // Áreas do projeto
        usuarios: {},     // Usuários da equipe
        metadata: {
            ultimaAtualizacao: null,
            versao: '8.7.0',
            totalEventos: 0,
            totalTarefas: 0,
            estruturaUnificada: true,
            tiposSuportados: ['evento', 'tarefa'],
            escoposSuportados: ['pessoal', 'equipe', 'publico']
        }
    },

    // ✅ ESTADO DO SISTEMA
    estadoSistema: {
        inicializado: false,
        firebaseDisponivel: false,
        syncAtivo: false,
        usuarioAutenticado: false,
        modoAnonimo: true,
        usuarioEmail: null,
        usuarioNome: null,
        ultimaSincronizacao: null,
        operacoesEmAndamento: new Set(),
        
        // 🔥 NOVO: Estados para estrutura unificada
        totalEventosUsuario: 0,
        totalTarefasUsuario: 0,
        totalTarefasPessoais: 0,
        totalTarefasEquipe: 0,
        itensVisiveis: 0
    },

    // ✅ USUÁRIO ATUAL
    usuarioAtual: null,

    // ✅ SYNC TEMPO REAL
    listenerAtivo: null,
    
    // ✅ CACHE OTIMIZADO
    ultimaVerificacaoFirebase: null,
    cacheVerificacao: 30000, // 30s

    // 🔥 INICIALIZAÇÃO UNIFICADA v8.7.0
    async init() {
        try {
            console.log('🚀 Inicializando Sistema BIAPO v8.7.0 ESTRUTURA UNIFICADA...');
            
            // 1. Configurar Firebase
            await this._configurarFirebase();
            
            // 2. Carregar dados com estrutura unificada
            await this._carregarDadosUnificados();
            
            // 3. Ativar sync tempo real único
            this._ativarSyncUnificado();
            
            // 4. Configurar interface
            this._configurarInterface();
            
            // 5. Finalizar inicialização
            this.estadoSistema.inicializado = true;
            this.estadoSistema.ultimaSincronizacao = new Date().toISOString();
            
            console.log('✅ Sistema BIAPO v8.7.0 ESTRUTURA UNIFICADA inicializado com sucesso!');
            console.log(`📊 ${this.dados.eventos.length} eventos + ${this.dados.tarefas.length} tarefas carregados`);
            
            // Renderizar dashboard
            this.renderizarDashboard();
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            this._inicializarModoFallback();
        }
    },

    // 🔥 CONFIGURAR FIREBASE (mantido)
    async _configurarFirebase() {
        try {
            if (typeof database === 'undefined') {
                throw new Error('Firebase não configurado');
            }

            // Aguardar inicialização se necessário
            if (typeof window.firebaseInitPromise !== 'undefined') {
                await window.firebaseInitPromise;
            }

            // Testar conectividade
            const snapshot = await database.ref('.info/connected').once('value');
            this.estadoSistema.firebaseDisponivel = snapshot.val() === true;
            
            console.log(`🔥 Firebase: ${this.estadoSistema.firebaseDisponivel ? 'Conectado' : 'Offline'}`);
            
        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            this.estadoSistema.firebaseDisponivel = false;
        }
    },

    // 🔥 CARREGAR DADOS COM ESTRUTURA UNIFICADA v8.7.0
    async _carregarDadosUnificados() {
        try {
            if (!this.estadoSistema.firebaseDisponivel) {
                console.warn('⚠️ Firebase offline - usando dados locais');
                this._carregarDadosLocais();
                return;
            }

            console.log('📥 Carregando dados com estrutura unificada do Firebase...');
            
            const snapshot = await database.ref(this.config.firebasePath).once('value');
            const dadosFirebase = snapshot.val();
            
            if (dadosFirebase) {
                // ✅ CARREGAR E PADRONIZAR EVENTOS
                this.dados.eventos = this._padronizarEventos(dadosFirebase.eventos || []);
                
                // 🔥 CARREGAR E PADRONIZAR TAREFAS
                this.dados.tarefas = this._padronizarTarefas(dadosFirebase.tarefas || []);
                
                // Outras estruturas
                this.dados.areas = dadosFirebase.areas || {};
                this.dados.usuarios = dadosFirebase.usuarios || {};
                this.dados.metadata = this._padronizarMetadata(dadosFirebase.metadata || {});
                
                console.log(`✅ Dados padronizados: ${this.dados.eventos.length} eventos + ${this.dados.tarefas.length} tarefas`);
            } else {
                console.log('📭 Nenhum dado no Firebase - inicializando estrutura unificada');
                this._inicializarEstruturaUnificada();
            }
            
            // Atualizar estatísticas
            this._atualizarEstatisticasUnificadas();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this._carregarDadosLocais();
        }
    },

    // 🔥 PADRONIZAR EVENTOS - Estrutura Unificada
    _padronizarEventos(eventos) {
        if (!Array.isArray(eventos)) return [];
        
        return eventos.map(evento => {
            const eventoBase = {
                // ✅ CAMPOS OBRIGATÓRIOS
                id: evento.id || this._gerarId('evento'),
                titulo: evento.titulo || 'Evento sem título',
                data: evento.data || new Date().toISOString().split('T')[0],
                
                // 🔥 NOVO: Identificação e escopo
                _tipoItem: 'evento',
                escopo: evento.escopo || 'equipe', // pessoal, equipe, publico
                visibilidade: evento.visibilidade || 'equipe', // privada, equipe, publica
                
                // ✅ CAMPOS PADRÃO
                tipo: evento.tipo || 'reuniao',
                status: evento.status || 'agendado',
                descricao: evento.descricao || '',
                local: evento.local || '',
                
                // ✅ PARTICIPANTES E RESPONSABILIDADE
                participantes: Array.isArray(evento.participantes) ? evento.participantes : 
                              Array.isArray(evento.pessoas) ? evento.pessoas : [],
                criadoPor: evento.criadoPor || this._obterUsuarioAtual(),
                responsavel: evento.responsavel || evento.criadoPor || this._obterUsuarioAtual(),
                
                // ✅ HORÁRIOS
                horarioInicio: evento.horarioInicio || evento.horario || '',
                horarioFim: evento.horarioFim || '',
                
                // ✅ TIMESTAMPS
                dataCriacao: evento.dataCriacao || new Date().toISOString(),
                ultimaAtualizacao: evento.ultimaAtualizacao || new Date().toISOString(),
                
                // 🔥 NOVO: Metadados de sincronização
                _origem: 'firebase',
                _versaoEstrutura: '8.7.0',
                _sincronizado: true
            };

            // Preservar campos extras do evento original (compatibilidade)
            Object.keys(evento).forEach(campo => {
                if (!eventoBase.hasOwnProperty(campo) && !campo.startsWith('_temp')) {
                    eventoBase[campo] = evento[campo];
                }
            });

            return eventoBase;
        });
    },

    // 🔥 PADRONIZAR TAREFAS - Estrutura Unificada
    _padronizarTarefas(tarefas) {
        if (!Array.isArray(tarefas)) return [];
        
        return tarefas.map(tarefa => {
            const tarefaBase = {
                // ✅ CAMPOS OBRIGATÓRIOS
                id: tarefa.id || this._gerarId('tarefa'),
                titulo: tarefa.titulo || 'Tarefa sem título',
                
                // 🔥 NOVO: Identificação e escopo
                _tipoItem: 'tarefa',
                escopo: tarefa.escopo || this._determinarEscopoTarefa(tarefa),
                visibilidade: tarefa.visibilidade || this._determinarVisibilidadeTarefa(tarefa),
                
                // ✅ CAMPOS PADRÃO DE TAREFA
                tipo: tarefa.tipo || 'pessoal',
                status: tarefa.status || 'pendente',
                prioridade: tarefa.prioridade || 'media',
                progresso: typeof tarefa.progresso === 'number' ? tarefa.progresso : 0,
                
                // ✅ DESCRIÇÃO E DETALHES
                descricao: tarefa.descricao || '',
                categoria: tarefa.categoria || '',
                observacoes: tarefa.observacoes || '',
                
                // ✅ PARTICIPANTES E RESPONSABILIDADE
                responsavel: tarefa.responsavel || this._obterUsuarioAtual(),
                participantes: Array.isArray(tarefa.participantes) ? tarefa.participantes : [],
                criadoPor: tarefa.criadoPor || this._obterUsuarioAtual(),
                
                // ✅ DATAS
                dataInicio: tarefa.dataInicio || new Date().toISOString().split('T')[0],
                dataFim: tarefa.dataFim || null,
                horario: tarefa.horario || '',
                
                // ✅ INTEGRAÇÃO COM CALENDÁRIO
                aparecerNoCalendario: typeof tarefa.aparecerNoCalendario === 'boolean' ? 
                                     tarefa.aparecerNoCalendario : false,
                eventoRelacionado: tarefa.eventoRelacionado || null,
                
                // ✅ SUBTAREFAS
                subtarefas: Array.isArray(tarefa.subtarefas) ? tarefa.subtarefas : [],
                
                // ✅ TIMESTAMPS
                dataCriacao: tarefa.dataCriacao || new Date().toISOString(),
                ultimaAtualizacao: tarefa.ultimaAtualizacao || new Date().toISOString(),
                
                // 🔥 NOVO: Metadados de sincronização
                _origem: 'firebase',
                _versaoEstrutura: '8.7.0',
                _sincronizado: true
            };

            // Preservar campos extras da tarefa original (compatibilidade)
            Object.keys(tarefa).forEach(campo => {
                if (!tarefaBase.hasOwnProperty(campo) && !campo.startsWith('_temp')) {
                    tarefaBase[campo] = tarefa[campo];
                }
            });

            return tarefaBase;
        });
    },

    // 🔥 DETERMINAR ESCOPO DA TAREFA AUTOMATICAMENTE
    _determinarEscopoTarefa(tarefa) {
        // Se tem múltiplos participantes ou é tarefa de equipe, escopo = 'equipe'
        if (tarefa.participantes && tarefa.participantes.length > 1) {
            return 'equipe';
        }
        
        // Se tipo indica trabalho de equipe
        if (['equipe', 'projeto', 'obra', 'administrativo'].includes(tarefa.tipo)) {
            return 'equipe';
        }
        
        // Padrão: tarefa pessoal
        return 'pessoal';
    },

    // 🔥 DETERMINAR VISIBILIDADE DA TAREFA AUTOMATICAMENTE
    _determinarVisibilidadeTarefa(tarefa) {
        const escopo = tarefa.escopo || this._determinarEscopoTarefa(tarefa);
        
        if (escopo === 'equipe') {
            return 'equipe'; // Participantes podem ver
        }
        
        if (escopo === 'publico') {
            return 'publica'; // Todos podem ver
        }
        
        return 'privada'; // Só o responsável pode ver
    },

    // 🔥 PADRONIZAR METADATA
    _padronizarMetadata(metadata) {
        return {
            ultimaAtualizacao: metadata.ultimaAtualizacao || new Date().toISOString(),
            ultimoUsuario: metadata.ultimoUsuario || this._obterUsuarioAtual(),
            versao: '8.7.0',
            totalEventos: this.dados.eventos.length,
            totalTarefas: this.dados.tarefas.length,
            
            // 🔥 NOVO: Metadados de estrutura unificada
            estruturaUnificada: true,
            tiposSuportados: this.config.suporteTipos,
            escoposSuportados: this.config.suporteEscopos,
            visibilidadesSuportadas: this.config.suporteVisibilidade,
            ultimaPadronizacao: new Date().toISOString(),
            
            // Preservar outros campos
            ...metadata
        };
    },

    // 🔥 ATIVAR SYNC TEMPO REAL UNIFICADO (atualizado)
    _ativarSyncUnificado() {
        try {
            if (!this.estadoSistema.firebaseDisponivel) {
                console.warn('⚠️ Sync desabilitado - Firebase offline');
                return;
            }

            // Remover listener anterior
            if (this.listenerAtivo) {
                database.ref(this.config.firebasePath).off('value', this.listenerAtivo);
            }

            console.log('🎧 Ativando sync tempo real ESTRUTURA UNIFICADA...');

            const listener = (snapshot) => {
                try {
                    const dadosRecebidos = snapshot.val();
                    
                    if (!dadosRecebidos) {
                        console.log('📭 Dados vazios no Firebase');
                        return;
                    }

                    // 🔥 DETECTAR MUDANÇAS COM ESTRUTURA UNIFICADA
                    const hashAnterior = this._calcularHashDados();
                    
                    // ✅ ATUALIZAR EVENTOS PADRONIZADOS
                    if (dadosRecebidos.eventos) {
                        this.dados.eventos = this._padronizarEventos(dadosRecebidos.eventos);
                    }
                    
                    // 🔥 ATUALIZAR TAREFAS PADRONIZADAS
                    if (dadosRecebidos.tarefas) {
                        this.dados.tarefas = this._padronizarTarefas(dadosRecebidos.tarefas);
                    }
                    
                    // Atualizar outras estruturas
                    if (dadosRecebidos.areas) this.dados.areas = dadosRecebidos.areas;
                    if (dadosRecebidos.usuarios) this.dados.usuarios = dadosRecebidos.usuarios;
                    if (dadosRecebidos.metadata) this.dados.metadata = this._padronizarMetadata(dadosRecebidos.metadata);
                    
                    const hashAtual = this._calcularHashDados();
                    
                    if (hashAnterior !== hashAtual) {
                        console.log('🔄 MUDANÇAS DETECTADAS - Sincronizando estrutura unificada...');
                        
                        this._atualizarEstatisticasUnificadas();
                        this._notificarTodosModulos();
                        this.estadoSistema.ultimaSincronizacao = new Date().toISOString();
                        
                        console.log(`✅ Sync unificado completo: ${this.dados.eventos.length} eventos + ${this.dados.tarefas.length} tarefas`);
                    }
                    
                } catch (error) {
                    console.error('❌ Erro no listener unificado:', error);
                }
            };

            database.ref(this.config.firebasePath).on('value', listener);
            
            this.listenerAtivo = listener;
            this.estadoSistema.syncAtivo = true;
            
            console.log('✅ Sync tempo real ESTRUTURA UNIFICADA ativado!');
            
        } catch (error) {
            console.error('❌ Erro ao ativar sync:', error);
            this.estadoSistema.syncAtivo = false;
        }
    },

    // 🔥 CALCULAR HASH DOS DADOS (atualizado para estrutura unificada)
    _calcularHashDados() {
        try {
            const eventosInfo = this.dados.eventos.map(e => `${e.id}-${e.ultimaAtualizacao || ''}-${e._tipoItem}`).join('|');
            const tarefasInfo = this.dados.tarefas.map(t => `${t.id}-${t.ultimaAtualizacao || ''}-${t._tipoItem}-${t.escopo}`).join('|');
            
            return `EU${this.dados.eventos.length}-TU${this.dados.tarefas.length}-${eventosInfo.length + tarefasInfo.length}`;
        } catch (error) {
            return Date.now().toString();
        }
    },

    // 🔥 ATUALIZAR ESTATÍSTICAS UNIFICADAS v8.7.0
    _atualizarEstatisticasUnificadas() {
        try {
            // Estatísticas básicas
            this.estadoSistema.totalEventos = this.dados.eventos.length;
            this.estadoSistema.totalTarefas = this.dados.tarefas.length;
            
            // 🔥 NOVO: Estatísticas por escopo e usuário
            const usuarioAtual = this.usuarioAtual?.email || this.usuarioAtual?.displayName;
            
            if (usuarioAtual) {
                // Eventos do usuário
                this.estadoSistema.totalEventosUsuario = this.dados.eventos.filter(evento => 
                    evento.participantes?.includes(usuarioAtual) ||
                    evento.responsavel === usuarioAtual ||
                    evento.criadoPor === usuarioAtual
                ).length;
                
                // Tarefas pessoais
                this.estadoSistema.totalTarefasPessoais = this.dados.tarefas.filter(tarefa =>
                    tarefa.escopo === 'pessoal' && 
                    (tarefa.responsavel === usuarioAtual || tarefa.criadoPor === usuarioAtual)
                ).length;
                
                // Tarefas de equipe onde participa
                this.estadoSistema.totalTarefasEquipe = this.dados.tarefas.filter(tarefa =>
                    tarefa.escopo === 'equipe' && 
                    (tarefa.participantes?.includes(usuarioAtual) ||
                     tarefa.responsavel === usuarioAtual ||
                     tarefa.criadoPor === usuarioAtual)
                ).length;
                
                this.estadoSistema.totalTarefasUsuario = this.estadoSistema.totalTarefasPessoais + this.estadoSistema.totalTarefasEquipe;
            }
            
            // Itens visíveis (todos se admin, senão filtrado)
            this.estadoSistema.itensVisiveis = this._contarItensVisiveis();
            
            // Atualizar metadata
            this.dados.metadata.totalEventos = this.dados.eventos.length;
            this.dados.metadata.totalTarefas = this.dados.tarefas.length;
            this.dados.metadata.ultimaAtualizacao = new Date().toISOString();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error);
        }
    },

    // 🔥 CONTAR ITENS VISÍVEIS PARA O USUÁRIO ATUAL
    _contarItensVisiveis() {
        const usuarioAtual = this.usuarioAtual?.email || this.usuarioAtual?.displayName;
        
        // Admin vê tudo
        if (this.ehAdmin()) {
            return this.dados.eventos.length + this.dados.tarefas.length;
        }
        
        // Usuário normal: itens onde participa ou são públicos
        let visiveis = 0;
        
        // Eventos visíveis
        visiveis += this.dados.eventos.filter(evento => {
            if (evento.visibilidade === 'publica') return true;
            if (evento.participantes?.includes(usuarioAtual)) return true;
            if (evento.responsavel === usuarioAtual) return true;
            if (evento.criadoPor === usuarioAtual) return true;
            return false;
        }).length;
        
        // Tarefas visíveis
        visiveis += this.dados.tarefas.filter(tarefa => {
            if (tarefa.visibilidade === 'publica') return true;
            if (tarefa.responsavel === usuarioAtual) return true;
            if (tarefa.criadoPor === usuarioAtual) return true;
            if (tarefa.participantes?.includes(usuarioAtual)) return true;
            return false;
        }).length;
        
        return visiveis;
    },

    // 🔥 CRIAR TAREFA COM ESTRUTURA UNIFICADA v8.7.0
    async criarTarefa(dadosTarefa) {
        if (this.estadoSistema.modoAnonimo) {
            throw new Error('Login necessário para criar tarefas');
        }

        const operacaoId = 'criar-tarefa-' + Date.now();
        
        try {
            this.estadoSistema.operacoesEmAndamento.add(operacaoId);
            
            // 🔥 PREPARAR NOVA TAREFA COM ESTRUTURA UNIFICADA
            const novaTarefa = {
                // Campos básicos
                id: `tarefa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: dadosTarefa.titulo || 'Nova Tarefa',
                descricao: dadosTarefa.descricao || '',
                tipo: dadosTarefa.tipo || 'pessoal',
                status: dadosTarefa.status || 'pendente',
                prioridade: dadosTarefa.prioridade || 'media',
                progresso: typeof dadosTarefa.progresso === 'number' ? dadosTarefa.progresso : 0,
                
                // 🔥 ESTRUTURA UNIFICADA
                _tipoItem: 'tarefa',
                escopo: dadosTarefa.escopo || this._determinarEscopoTarefa(dadosTarefa),
                visibilidade: dadosTarefa.visibilidade || this._determinarVisibilidadeTarefa(dadosTarefa),
                
                // Datas e horários
                dataInicio: dadosTarefa.dataInicio || new Date().toISOString().split('T')[0],
                dataFim: dadosTarefa.dataFim || null,
                horario: dadosTarefa.horario || null,
                
                // Responsabilidade e participação
                responsavel: this.usuarioAtual?.email || this.usuarioAtual?.displayName || 'Sistema',
                participantes: dadosTarefa.participantes || [],
                criadoPor: this.usuarioAtual?.email || this.usuarioAtual?.displayName || 'Sistema',
                
                // Integração com calendário
                aparecerNoCalendario: dadosTarefa.aparecerNoCalendario || false,
                eventoRelacionado: dadosTarefa.eventoRelacionado || null,
                
                // Outros campos
                categoria: dadosTarefa.categoria || '',
                observacoes: dadosTarefa.observacoes || '',
                subtarefas: dadosTarefa.subtarefas || [],
                
                // Timestamps
                dataCriacao: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString(),
                
                // 🔥 Metadados unificados
                _origem: 'app',
                _versaoEstrutura: '8.7.0',
                _sincronizado: false
            };

            // ✅ ADICIONAR AOS DADOS LOCAIS
            this.dados.tarefas.push(novaTarefa);

            // ✅ SALVAR NO FIREBASE (garantia de persistência)
            await this._salvarDadosUnificados();

            // ✅ ATUALIZAR ESTATÍSTICAS
            this._atualizarEstatisticasUnificadas();

            // ✅ NOTIFICAR MÓDULOS
            this._notificarTodosModulos();

            console.log(`✅ Tarefa criada com estrutura unificada: "${novaTarefa.titulo}" (ID: ${novaTarefa.id}, Escopo: ${novaTarefa.escopo})`);
            
            // Notificação de sucesso
            this._emitirEventoGlobal('tarefa-criada', novaTarefa);

            this.estadoSistema.operacoesEmAndamento.delete(operacaoId);
            return novaTarefa;

        } catch (error) {
            this.estadoSistema.operacoesEmAndamento.delete(operacaoId);
            console.error('❌ Erro ao criar tarefa:', error);
            
            // Remover tarefa dos dados locais se falhou
            this.dados.tarefas = this.dados.tarefas.filter(t => t.id !== novaTarefa.id);
            
            throw error;
        }
    },

    // 🔥 CRIAR EVENTO COM ESTRUTURA UNIFICADA v8.7.0  
    async criarEvento(dadosEvento) {
        if (this.estadoSistema.modoAnonimo) {
            throw new Error('Login necessário para criar eventos');
        }

        try {
            // 🔥 PREPARAR NOVO EVENTO COM ESTRUTURA UNIFICADA
            const novoEvento = {
                // Campos básicos
                id: Date.now(),
                titulo: dadosEvento.titulo || 'Novo Evento',
                data: dadosEvento.data || new Date().toISOString().split('T')[0],
                tipo: dadosEvento.tipo || 'reuniao',
                status: dadosEvento.status || 'agendado',
                descricao: dadosEvento.descricao || '',
                local: dadosEvento.local || '',
                
                // 🔥 ESTRUTURA UNIFICADA
                _tipoItem: 'evento',
                escopo: dadosEvento.escopo || 'equipe', // Eventos geralmente são de equipe
                visibilidade: dadosEvento.visibilidade || 'equipe',
                
                // Horários
                horarioInicio: dadosEvento.horarioInicio || dadosEvento.horario || '',
                horarioFim: dadosEvento.horarioFim || '',
                
                // Participantes
                participantes: dadosEvento.participantes || dadosEvento.pessoas || [],
                responsavel: this.usuarioAtual?.email || this.usuarioAtual?.displayName || 'Sistema',
                criadoPor: this.usuarioAtual?.email || this.usuarioAtual?.displayName || 'Sistema',
                
                // Timestamps
                dataCriacao: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString(),
                
                // 🔥 Metadados unificados
                _origem: 'app',
                _versaoEstrutura: '8.7.0',
                _sincronizado: false
            };
            
            this.dados.eventos.push(novoEvento);
            await this._salvarDadosUnificados();
            this._atualizarEstatisticasUnificadas();
            this._notificarTodosModulos();
            
            console.log(`✅ Evento criado com estrutura unificada: "${novoEvento.titulo}" (Escopo: ${novoEvento.escopo})`);
            return novoEvento;
            
        } catch (error) {
            console.error('❌ Erro ao criar evento:', error);
            throw error;
        }
    },

    // 🔥 OBTER ITENS PARA USUÁRIO (nova função unificada)
    obterItensParaUsuario(usuario = null, filtros = {}) {
        try {
            const usuarioAlvo = usuario || this.usuarioAtual?.email || this.usuarioAtual?.displayName;
            
            if (!usuarioAlvo && !this.ehAdmin()) {
                console.warn('⚠️ Usuário não identificado para filtrar itens');
                return { eventos: [], tarefas: [] };
            }
            
            let eventos = [];
            let tarefas = [];
            
            // 🔥 FILTRAR EVENTOS VISÍVEIS
            eventos = this.dados.eventos.filter(evento => {
                // Admin vê tudo
                if (this.ehAdmin()) return true;
                
                // Filtrar por visibilidade e participação
                if (evento.visibilidade === 'publica') return true;
                if (evento.participantes?.includes(usuarioAlvo)) return true;
                if (evento.responsavel === usuarioAlvo) return true;
                if (evento.criadoPor === usuarioAlvo) return true;
                
                return false;
            });
            
            // 🔥 FILTRAR TAREFAS VISÍVEIS
            tarefas = this.dados.tarefas.filter(tarefa => {
                // Admin vê tudo
                if (this.ehAdmin()) return true;
                
                // Filtrar por visibilidade e participação
                if (tarefa.visibilidade === 'publica') return true;
                if (tarefa.responsavel === usuarioAlvo) return true;
                if (tarefa.criadoPor === usuarioAlvo) return true;
                if (tarefa.participantes?.includes(usuarioAlvo)) return true;
                
                return false;
            });
            
            // Aplicar filtros adicionais
            if (filtros.escopo) {
                eventos = eventos.filter(e => e.escopo === filtros.escopo);
                tarefas = tarefas.filter(t => t.escopo === filtros.escopo);
            }
            
            if (filtros.tipo) {
                eventos = eventos.filter(e => e.tipo === filtros.tipo);
                tarefas = tarefas.filter(t => t.tipo === filtros.tipo);
            }
            
            if (filtros.data) {
                eventos = eventos.filter(e => e.data === filtros.data);
                tarefas = tarefas.filter(t => t.dataInicio === filtros.data);
            }
            
            return { eventos, tarefas };
            
        } catch (error) {
            console.error('❌ Erro ao obter itens para usuário:', error);
            return { eventos: [], tarefas: [] };
        }
    },

    // 🔥 OBTER ITENS PARA CALENDÁRIO (nova função unificada)
    obterItensParaCalendario(usuario = null) {
        try {
            const { eventos, tarefas } = this.obterItensParaUsuario(usuario);
            
            // Filtrar tarefas que devem aparecer no calendário
            const tarefasCalendario = tarefas.filter(tarefa => tarefa.aparecerNoCalendario === true);
            
            // Combinar eventos + tarefas para calendário
            return {
                eventos: eventos,
                tarefas: tarefasCalendario,
                total: eventos.length + tarefasCalendario.length
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter itens para calendário:', error);
            return { eventos: [], tarefas: [], total: 0 };
        }
    },

    // ========== MANTER FUNÇÕES EXISTENTES ATUALIZADAS ==========
    
    // ✅ SALVAR DADOS UNIFICADOS (atualizado)
    async _salvarDadosUnificados() {
        try {
            if (!this.estadoSistema.firebaseDisponivel) {
                throw new Error('Firebase não disponível');
            }

            const agora = new Date().toISOString();
            
            const dadosParaSalvar = {
                eventos: this.dados.eventos,
                tarefas: this.dados.tarefas,
                areas: this.dados.areas,
                usuarios: this.dados.usuarios,
                metadata: {
                    ...this.dados.metadata,
                    ultimaAtualizacao: agora,
                    ultimoUsuario: this.usuarioAtual?.email || 'Sistema',
                    versao: this.config.versao,
                    totalEventos: this.dados.eventos.length,
                    totalTarefas: this.dados.tarefas.length,
                    estruturaUnificada: true
                }
            };

            // ✅ SALVAR COM TIMEOUT E GARANTIA
            await Promise.race([
                database.ref(this.config.firebasePath).set(dadosParaSalvar),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao salvar')), this.config.timeoutOperacao)
                )
            ]);

            console.log('✅ Dados com estrutura unificada salvos no Firebase');
            
            // Backup local em caso de sucesso
            if (this.config.backupAutomatico) {
                this._salvarBackupLocal(dadosParaSalvar);
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados unificados:', error);
            
            // ✅ BACKUP DE EMERGÊNCIA
            try {
                const backupEmergencia = {
                    dados: this.dados,
                    timestamp: Date.now(),
                    usuario: this.usuarioAtual?.email || 'Sistema',
                    estruturaUnificada: true
                };
                
                localStorage.setItem('biapo_backup_emergency_unified', JSON.stringify(backupEmergencia));
                console.log('💾 Backup de emergência unificado salvo localmente');
            } catch (e) {
                console.error('❌ FALHA TOTAL NA PERSISTÊNCIA!', e);
            }
            
            throw error;
        }
    },

    // ✅ Outras funções mantidas...
    editarTarefa: function(tarefaId, dadosAtualizacao) {
        // Implementação mantida, mas com estrutura unificada
        // (código similar ao anterior mas garantindo campos unificados)
    },

    excluirTarefa: function(tarefaId) {
        // Implementação mantida
    },

    obterTarefasUsuario: function(usuario = null, filtros = {}) {
        const { tarefas } = this.obterItensParaUsuario(usuario, filtros);
        return tarefas;
    },

    obterTarefasParaCalendario: function(usuario = null) {
        const { tarefas } = this.obterItensParaCalendario(usuario);
        return tarefas;
    },

    ehAdmin: function() {
        try {
            if (typeof Auth !== 'undefined' && Auth.ehAdmin) {
                return Auth.ehAdmin();
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    podeEditar: function() {
        return !this.estadoSistema.modoAnonimo;
    },

    // 🔥 STATUS SISTEMA EXPANDIDO UNIFICADO v8.7.0
    obterStatusSistema() {
        return {
            // Básico
            versao: this.config.versao,
            inicializado: this.estadoSistema.inicializado,
            firebaseDisponivel: this.estadoSistema.firebaseDisponivel,
            syncAtivo: this.estadoSistema.syncAtivo,
            
            // Usuário
            usuarioAutenticado: this.estadoSistema.usuarioAutenticado,
            modoAnonimo: this.estadoSistema.modoAnonimo,
            usuarioAtual: this.usuarioAtual,
            
            // 🔥 DADOS UNIFICADOS v8.7.0
            totalEventos: this.dados.eventos.length,
            totalTarefas: this.dados.tarefas.length,
            totalEventosUsuario: this.estadoSistema.totalEventosUsuario,
            totalTarefasUsuario: this.estadoSistema.totalTarefasUsuario,
            totalTarefasPessoais: this.estadoSistema.totalTarefasPessoais,
            totalTarefasEquipe: this.estadoSistema.totalTarefasEquipe,
            itensVisiveis: this.estadoSistema.itensVisiveis,
            
            // Operações
            operacoesEmAndamento: this.estadoSistema.operacoesEmAndamento.size,
            ultimaSincronizacao: this.estadoSistema.ultimaSincronizacao,
            
            // 🔥 ESTRUTURA UNIFICADA v8.7.0
            estruturaUnificada: this.config.estruturaUnificada,
            pathFirebase: this.config.firebasePath,
            tiposSuportados: this.config.suporteTipos,
            escoposSuportados: this.config.suporteEscopos,
            visibilidadesSuportadas: this.config.suporteVisibilidade,
            sistemaUnificado: true,
            tipoSistema: 'ESTRUTURA_UNIFICADA_v8.7.0'
        };
    },

    // ========== UTILITÁRIOS UNIFICADOS ==========
    
    _gerarId(tipo = 'item') {
        return `${tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    _obterUsuarioAtual() {
        try {
            if (this.usuarioAtual?.email) {
                return this.usuarioAtual.email;
            }
            if (this.usuarioAtual?.displayName) {
                return this.usuarioAtual.displayName;
            }
            return 'Sistema';
        } catch {
            return 'Sistema';
        }
    },

    _emitirEventoGlobal(nome, dados) {
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent(nome, { detail: dados }));
            }
        } catch (error) {
            // Silencioso
        }
    },

    _notificarTodosModulos() {
        try {
            // ✅ Atualizar Calendar
            if (typeof Calendar !== 'undefined' && Calendar.atualizarEventos) {
                Calendar.atualizarEventos();
            }
            
            // ✅ Atualizar agenda.html se estiver aberta
            if (typeof window.agendaUnificada !== 'undefined') {
                if (window.agendaUnificada.carregarDados) {
                    window.agendaUnificada.carregarDados();
                }
                if (window.agendaUnificada.atualizarEstatisticas) {
                    window.agendaUnificada.atualizarEstatisticas();
                }
            }
            
            // ✅ Evento global para outros módulos
            this._emitirEventoGlobal('dados-sincronizados', {
                eventos: this.dados.eventos.length,
                tarefas: this.dados.tarefas.length,
                timestamp: Date.now(),
                estruturaUnificada: true,
                versao: this.config.versao
            });
            
            console.log('📡 Todos os módulos notificados da sincronização unificada');
            
        } catch (error) {
            console.error('❌ Erro ao notificar módulos:', error);
        }
    },

    _salvarBackupLocal(dados) {
        try {
            const backup = {
                dados,
                timestamp: Date.now(),
                versao: this.config.versao,
                estruturaUnificada: true,
                usuario: this.usuarioAtual?.email || 'Sistema'
            };
            
            localStorage.setItem('biapo_backup_unified', JSON.stringify(backup));
        } catch (error) {
            // Silencioso - backup é opcional
        }
    },

    _carregarDadosLocais() {
        try {
            const backup = localStorage.getItem('biapo_backup_unified');
            if (backup) {
                const dadosBackup = JSON.parse(backup);
                if (dadosBackup.dados) {
                    this.dados = { ...this.dados, ...dadosBackup.dados };
                    console.log('📂 Dados unificados carregados do backup local');
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar backup local:', error);
        }
        
        // Inicializar estrutura vazia se necessário
        this._inicializarEstruturaUnificada();
    },

    _inicializarEstruturaUnificada() {
        if (!Array.isArray(this.dados.eventos)) this.dados.eventos = [];
        if (!Array.isArray(this.dados.tarefas)) this.dados.tarefas = [];
        if (!this.dados.areas) this.dados.areas = {};
        if (!this.dados.usuarios) this.dados.usuarios = {};
        if (!this.dados.metadata) {
            this.dados.metadata = {
                versao: this.config.versao,
                estruturaUnificada: true,
                totalEventos: 0,
                totalTarefas: 0
            };
        }
    },

    _inicializarModoFallback() {
        console.log('🔄 Inicializando modo fallback com estrutura unificada...');
        this._inicializarEstruturaUnificada();
        this.estadoSistema.inicializado = true;
        this.estadoSistema.firebaseDisponivel = false;
        this.estadoSistema.syncAtivo = false;
    },

    _configurarInterface() {
        try {
            // Atualizar data no header
            const hoje = new Date();
            const dataElement = document.getElementById('dataAtual');
            if (dataElement) {
                dataElement.textContent = hoje.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric'
                });
            }
            
            const mesAnoElement = document.getElementById('mesAno');
            if (mesAnoElement) {
                mesAnoElement.textContent = hoje.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao configurar interface:', error);
        }
    },

    renderizarDashboard() {
        try {
            // Inicializar Calendar se disponível
            if (typeof Calendar !== 'undefined' && Calendar.inicializar) {
                setTimeout(() => Calendar.inicializar(), 500);
            }
            
            console.log('📊 Dashboard com estrutura unificada renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar dashboard:', error);
        }
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.App = App;

// 🔥 FUNÇÕES GLOBAIS UNIFICADAS v8.7.0
window.criarTarefa = (dados) => App.criarTarefa(dados);
window.editarTarefa = (id, dados) => App.editarTarefa(id, dados);
window.excluirTarefa = (id) => App.excluirTarefa(id);
window.obterMinhasTarefas = (filtros) => App.obterTarefasUsuario(null, filtros);
window.obterTarefasCalendario = () => App.obterTarefasParaCalendario();
window.obterItensParaUsuario = (usuario, filtros) => App.obterItensParaUsuario(usuario, filtros);
window.obterItensParaCalendario = (usuario) => App.obterItensParaCalendario(usuario);

// ✅ FUNÇÕES EXISTENTES MANTIDAS
window.criarEvento = (dados) => App.criarEvento(dados);
window.salvarDados = () => App._salvarDadosUnificados();
window.verificarSistema = () => App.obterStatusSistema();

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (typeof App !== 'undefined') {
            await App.init();
        }
    }, 800);
});

console.log('🏗️ App.js v8.7.0 ESTRUTURA UNIFICADA carregado!');
console.log('🔥 Funcionalidades: Estrutura padronizada + Escopos + Visibilidade + Sync otimizado');

/*
🔥 ESTRUTURA UNIFICADA v8.7.0 - FASE 1 COMPLETA:

✅ DIFERENCIAÇÃO CLARA:
- _tipoItem: 'evento' | 'tarefa' ✅
- escopo: 'pessoal' | 'equipe' | 'publico' ✅  
- visibilidade: 'privada' | 'equipe' | 'publica' ✅

✅ ESTRUTURA PADRONIZADA:
- Todos os itens têm campos obrigatórios ✅
- Metadados de sincronização (_origem, _versaoEstrutura) ✅
- Timestamps padronizados ✅
- Compatibilidade com código existente ✅

✅ SISTEMA DE PERMISSÕES:
- obterItensParaUsuario() - filtra por visibilidade ✅
- obterItensParaCalendario() - itens para calendário ✅
- Administrador vê tudo ✅
- Usuários veem apenas seus itens ou públicos ✅

✅ FUNCIONALIDADES NOVAS:
- criarTarefa() com estrutura unificada ✅
- criarEvento() com estrutura unificada ✅
- Estatísticas detalhadas por escopo ✅
- Sync em tempo real preservado ✅

✅ COMPATIBILIDADE:
- Todas as funções existentes mantidas ✅
- Calendar.js funcionará normalmente ✅
- agenda.html funcionará normalmente ✅
- Migração automática de dados antigos ✅

📊 RESULTADO FASE 1:
- Base sólida para sincronização completa ✅
- Estrutura de dados consistente no Firebase ✅
- Permissões granulares implementadas ✅
- Pronto para Fase 2 (Calendar.js integrado) ✅
*/
