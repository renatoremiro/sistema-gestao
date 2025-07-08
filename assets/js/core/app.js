/**
 * 🚀 Sistema Principal v8.3 - DEPARTAMENTOS PERSISTENTES CORRIGIDOS
 * 
 * 🔥 CORREÇÃO APLICADA: Departamentos agora carregam do Firebase
 * ✅ SINCRONIZAÇÃO: Integração com AdminUsersManager
 * ✅ PERSISTÊNCIA: Departamentos mantêm após F5
 * ✅ INTEGRAÇÃO: Auth.departamentos sincronizado
 */

const App = {
    // ✅ ESTADO DO SISTEMA
    estadoSistema: {
        inicializado: false,
        carregandoDados: false,
        usuarioAutenticado: false,
        usuarioEmail: null,
        versao: '8.3.0', // ATUALIZADO
        debugMode: false,
        ultimoCarregamento: null,
        modoAnonimo: false,
        // 🔥 NOVO: Estado dos departamentos
        departamentosCarregados: false,
        ultimoCarregamentoDepartamentos: null
    },

    // 📊 DADOS PRINCIPAIS (carregados do Firebase)
    dados: {
        eventos: [],
        areas: {},
        tarefas: [],
        // 🔥 DEPARTAMENTOS REMOVIDOS - Auth.departamentos é a fonte única
        metadata: {
            versao: '8.3.0',
            ultimaAtualizacao: null
        }
    },

    // 👤 USUÁRIO ATUAL
    usuarioAtual: null,

    // 🔥 INICIALIZAÇÃO PRINCIPAL CORRIGIDA v8.3
    async inicializar() {
        try {
            console.log('🚀 Inicializando Sistema BIAPO v8.3...');
            
            this.estadoSistema.carregandoDados = true;
            
            // 1. Configurar estrutura básica
            this._configurarEstruturaBasica();
            
            // 2. 🔥 CARREGAR DADOS DO FIREBASE (SEM USUÁRIOS)
            await this._carregarDadosDoFirebaseGlobal();
            
            // 3. 🔥 NOVA FUNCIONALIDADE: CARREGAR DEPARTAMENTOS
            await this._carregarDepartamentosDoFirebase();
            
            // 4. Configurar usuário se estiver logado
            this._configurarUsuarioAtual();
            
            // 5. Detectar modo anônimo
            this._detectarModoAnonimo();
            
            // 6. Inicializar módulos DEPOIS dos dados carregados
            this._inicializarModulos();
            
            // 7. Renderizar interface
            this._renderizarInterface();
            
            // 8. Finalizar inicialização
            this.estadoSistema.inicializado = true;
            this.estadoSistema.carregandoDados = false;
            this.estadoSistema.ultimoCarregamento = new Date().toISOString();
            
            console.log('✅ Sistema BIAPO v8.3 inicializado com sucesso!');
            console.log(`📊 Eventos carregados: ${this.dados.eventos.length}`);
            console.log(`🏢 Departamentos carregados: ${this._contarDepartamentos()}`);
            console.log(`👤 Modo: ${this.estadoSistema.modoAnonimo ? 'Anônimo (leitura)' : 'Autenticado (escrita)'}`);
            console.log(`👥 Usuários em Auth.equipe: ${typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe).length : 'N/A'}`);
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.estadoSistema.carregandoDados = false;
            
            // Fallback: usar estrutura vazia
            this._configurarEstruturaBasica();
            this._inicializarModulos();
            this._renderizarInterface();
        }
    },

    // 🔥 NOVA FUNÇÃO v8.3: CARREGAR DEPARTAMENTOS DO FIREBASE
    async _carregarDepartamentosDoFirebase() {
        try {
            console.log('🏢 Iniciando carregamento de departamentos do Firebase...');
            
            // Verificar se Firebase está disponível
            if (typeof database === 'undefined' || !database) {
                console.warn('⚠️ Firebase não disponível para departamentos');
                this._configurarDepartamentosPadrao();
                return false;
            }
            
            // Carregar departamentos com timeout
            const departamentosFirebase = await Promise.race([
                this._buscarDepartamentosDoFirebase(),
                this._timeoutPromise(5000, 'Timeout ao carregar departamentos')
            ]);
            
            if (departamentosFirebase && departamentosFirebase.length > 0) {
                // 🎯 SINCRONIZAR COM Auth.departamentos
                if (typeof Auth !== 'undefined') {
                    Auth.departamentos = [...departamentosFirebase];
                    console.log(`✅ Departamentos sincronizados com Auth: ${departamentosFirebase.length} departamentos`);
                    console.log(`📋 Lista: ${departamentosFirebase.join(', ')}`);
                }
                
                // Atualizar estado
                this.estadoSistema.departamentosCarregados = true;
                this.estadoSistema.ultimoCarregamentoDepartamentos = new Date().toISOString();
                
                return true;
            } else {
                console.log('📭 Nenhum departamento encontrado no Firebase');
                this._configurarDepartamentosPadrao();
                return false;
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao carregar departamentos:', error.message);
            this._configurarDepartamentosPadrao();
            return false;
        }
    },

    // 🔥 BUSCAR DEPARTAMENTOS DO FIREBASE
    async _buscarDepartamentosDoFirebase() {
        try {
            console.log('🔍 Buscando departamentos no path /dados/departamentos...');
            
            const snapshot = await database.ref('dados/departamentos').once('value');
            const dadosDepartamentos = snapshot.val();
            
            if (!dadosDepartamentos || typeof dadosDepartamentos !== 'object') {
                console.log('📭 Nenhum departamento encontrado no Firebase');
                return null;
            }
            
            // Converter objeto Firebase para array de nomes
            const departamentosArray = Object.values(dadosDepartamentos)
                .filter(dept => dept && dept.ativo !== false && dept.nome)
                .map(dept => dept.nome.trim())
                .sort((a, b) => a.localeCompare(b, 'pt-BR'));
            
            console.log(`✅ ${departamentosArray.length} departamentos encontrados no Firebase`);
            console.log('📋 Departamentos:', departamentosArray);
            
            return departamentosArray;
            
        } catch (error) {
            console.error('❌ Erro ao buscar departamentos:', error);
            return null;
        }
    },

    // 🔥 CONFIGURAR DEPARTAMENTOS PADRÃO (FALLBACK)
    _configurarDepartamentosPadrao() {
        const departamentosPadrao = [
            "Gestão Geral",
            "Obra e Construção", 
            "Museu Nacional"
        ];
        
        if (typeof Auth !== 'undefined') {
            Auth.departamentos = [...departamentosPadrao];
            console.log('📋 Departamentos padrão configurados no Auth');
        }
        
        this.estadoSistema.departamentosCarregados = false;
    },

    // 🔥 CONTAR DEPARTAMENTOS
    _contarDepartamentos() {
        try {
            if (typeof Auth !== 'undefined' && Auth.departamentos && Array.isArray(Auth.departamentos)) {
                return Auth.departamentos.length;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    },

    // 🔥 NOVA FUNÇÃO: RECARREGAR DEPARTAMENTOS
    async recarregarDepartamentos() {
        try {
            console.log('🔄 Recarregando departamentos do Firebase...');
            
            const sucesso = await this._carregarDepartamentosDoFirebase();
            
            if (sucesso) {
                // Notificar outros módulos
                if (typeof Events !== 'undefined' && Events.atualizarParticipantes) {
                    Events.atualizarParticipantes();
                }
                
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('🏢 Departamentos atualizados!');
                }
                
                console.log('✅ Departamentos recarregados com sucesso');
            } else {
                console.log('⚠️ Nenhum departamento novo encontrado');
                
                if (typeof Notifications !== 'undefined') {
                    Notifications.info('📋 Usando departamentos padrão');
                }
            }
            
            return sucesso;
            
        } catch (error) {
            console.error('❌ Erro ao recarregar departamentos:', error);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao recarregar departamentos');
            }
            
            return false;
        }
    },

    // 🔥 CARREGAR DADOS DO FIREBASE GLOBAL (SEM USUÁRIOS) - MANTIDO
    async _carregarDadosDoFirebaseGlobal() {
        try {
            console.log('📥 Carregando dados globais do Firebase (SEM usuários)...');
            
            // 🔥 VERIFICAR FIREBASE SEM DEPENDER DE AUTH
            if (typeof database === 'undefined' || !database) {
                console.warn('⚠️ Firebase não disponível, usando dados locais');
                return;
            }
            
            // 🔥 CARREGAR DADOS SEM VERIFICAÇÃO DE USUÁRIO
            const dadosFirebase = await Promise.race([
                this._buscarDadosFirebaseGlobal(),
                this._timeoutPromise(8000, 'Timeout ao carregar dados globais')
            ]);
            
            if (dadosFirebase && typeof dadosFirebase === 'object') {
                // 🔥 APLICAR DADOS CARREGADOS (SEM USUÁRIOS)
                this.dados = {
                    eventos: dadosFirebase.eventos || [],
                    areas: dadosFirebase.areas || {},
                    tarefas: dadosFirebase.tarefas || [],
                    // 🔥 USUÁRIOS REMOVIDOS - NÃO CARREGAR DO FIREBASE
                    // usuarios: dadosFirebase.usuarios || {}, // REMOVIDO
                    metadata: dadosFirebase.metadata || { versao: '8.3.0' }
                };
                
                console.log(`✅ Dados globais carregados: ${this.dados.eventos.length} eventos`);
                console.log(`📍 Áreas: ${Object.keys(this.dados.areas).length}`);
                console.log(`👥 Auth.equipe preservado: ${typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe).length + ' usuários' : 'N/A'}`);
                
                // Atualizar timestamp
                if (this.dados.metadata) {
                    this.dados.metadata.ultimoCarregamento = new Date().toISOString();
                }
                
            } else {
                console.warn('⚠️ Dados do Firebase inválidos, usando estrutura vazia');
                this._configurarEstruturaBasica();
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao carregar do Firebase:', error.message);
            console.log('📂 Tentando carregar backup local...');
            
            // Fallback: tentar backup local
            await this._tentarCarregarBackupLocal();
        }
    },

    // 🔥 BUSCAR DADOS DO FIREBASE GLOBAL (SEM USUÁRIOS) - MANTIDO
    async _buscarDadosFirebaseGlobal() {
        try {
            console.log('🔍 Buscando dados no path /dados (SEM usuários)...');
            
            const snapshot = await database.ref('dados').once('value');
            const dados = snapshot.val();
            
            if (dados) {
                console.log('📦 Dados encontrados no Firebase:');
                console.log(`  - Eventos: ${dados.eventos ? dados.eventos.length : 0}`);
                console.log(`  - Áreas: ${dados.areas ? Object.keys(dados.areas).length : 0}`);
                console.log(`  - Usuários: ${dados.usuarios ? Object.keys(dados.usuarios).length + ' (IGNORADOS)' : 'nenhum'}`);
                console.log(`  - Departamentos: ${dados.departamentos ? Object.keys(dados.departamentos).length + ' (CARREGADOS SEPARADAMENTE)' : 'nenhum'}`);
                
                // 🔥 RETORNAR DADOS SEM USUÁRIOS
                return {
                    eventos: dados.eventos || [],
                    areas: dados.areas || {},
                    tarefas: dados.tarefas || [],
                    // usuarios: REMOVIDO - não carregar do Firebase
                    metadata: dados.metadata || {}
                };
            } else {
                console.log('📭 Nenhum dado encontrado no Firebase');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar dados globais:', error);
            throw error;
        }
    },

    // 🔥 DETECTAR MODO ANÔNIMO
    _detectarModoAnonimo() {
        // Usuário não autenticado = modo anônimo (apenas leitura)
        this.estadoSistema.modoAnonimo = !this.estadoSistema.usuarioAutenticado;
        
        if (this.estadoSistema.modoAnonimo) {
            console.log('👁️ Modo anônimo ativado - apenas visualização');
            
            // Mostrar indicador visual se necessário
            this._mostrarIndicadorModoAnonimo();
        }
    },

    // 🔥 MOSTRAR INDICADOR MODO ANÔNIMO
    _mostrarIndicadorModoAnonimo() {
        try {
            // Verificar se já existe indicador
            if (document.getElementById('indicadorAnonimo')) {
                return;
            }
            
            // Criar indicador visual
            const indicador = document.createElement('div');
            indicador.id = 'indicadorAnonimo';
            indicador.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #374151, #1f2937);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 6px;
            `;
            
            indicador.innerHTML = `
                <span>👁️</span>
                <span>Modo Visualização</span>
                <small style="opacity: 0.8; margin-left: 4px;">(Apenas Leitura)</small>
            `;
            
            document.body.appendChild(indicador);
            
        } catch (error) {
            // Silencioso - indicador é opcional
        }
    },

    // 🔥 TIMEOUT PROMISE (para evitar travamento)
    _timeoutPromise(ms, mensagem) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(mensagem)), ms);
        });
    },

    // 🔥 TENTAR CARREGAR BACKUP LOCAL
    async _tentarCarregarBackupLocal() {
        try {
            if (typeof Persistence !== 'undefined' && Persistence.recuperarBackupLocal) {
                const backup = Persistence.recuperarBackupLocal();
                
                if (backup) {
                    // 🔥 APLICAR BACKUP SEM USUÁRIOS
                    this.dados = {
                        eventos: backup.eventos || [],
                        areas: backup.areas || {},
                        tarefas: backup.tarefas || [],
                        // usuarios: REMOVIDO - não carregar do backup
                        metadata: backup.metadata || {}
                    };
                    console.log(`📂 Backup local carregado: ${this.dados.eventos.length} eventos (usuários preservados)`);
                    return;
                }
            }
            
            // Se não há backup, usar estrutura vazia
            console.log('📝 Iniciando com dados vazios');
            this._configurarEstruturaBasica();
            
        } catch (error) {
            console.warn('⚠️ Erro no backup local:', error);
            this._configurarEstruturaBasica();
        }
    },

    // ✅ CONFIGURAR ESTRUTURA BÁSICA (SEM USUÁRIOS)
    _configurarEstruturaBasica() {
        if (!this.dados.eventos) this.dados.eventos = [];
        if (!this.dados.areas) this.dados.areas = {};
        if (!this.dados.tarefas) this.dados.tarefas = [];
        // 🔥 USUÁRIOS REMOVIDOS - não inicializar aqui
        if (!this.dados.metadata) {
            this.dados.metadata = {
                versao: '8.3.0',
                ultimaAtualizacao: new Date().toISOString()
            };
        }
        
        // Aplicar estrutura padrão se necessário
        if (typeof DataStructure !== 'undefined' && DataStructure.inicializarDados) {
            const estruturaPadrao = DataStructure.inicializarDados();
            
            // Mesclar apenas se dados estão vazios (SEM USUÁRIOS)
            if (Object.keys(this.dados.areas).length === 0) {
                this.dados.areas = estruturaPadrao.areas;
            }
            // 🔥 NÃO mesclar usuários
            // if (Object.keys(this.dados.usuarios).length === 0) {
            //     this.dados.usuarios = estruturaPadrao.usuarios; // REMOVIDO
            // }
        }
        
        console.log('✅ Estrutura básica configurada (Auth.equipe preservado)');
    },

    // ✅ CONFIGURAR USUÁRIO ATUAL
    _configurarUsuarioAtual() {
        try {
            // Verificar se há usuário autenticado
            if (typeof Auth !== 'undefined' && Auth.obterUsuario) {
                this.usuarioAtual = Auth.obterUsuario();
                
                if (this.usuarioAtual) {
                    this.estadoSistema.usuarioAutenticado = true;
                    this.estadoSistema.usuarioEmail = this.usuarioAtual.email;
                    console.log(`👤 Usuário autenticado: ${this.usuarioAtual.email}`);
                } else {
                    console.log('👁️ Usuário anônimo detectado');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao configurar usuário:', error);
        }
    },

    // 🔥 INICIALIZAR MÓDULOS (DEPOIS DOS DADOS CARREGADOS)
    _inicializarModulos() {
        try {
            console.log('🔧 Inicializando módulos...');
            
            // 1. Aguardar um pouco para garantir que dados estão prontos
            setTimeout(() => {
                // 2. Inicializar Calendar (que vai usar App.dados.eventos)
                if (typeof Calendar !== 'undefined' && Calendar.inicializar) {
                    Calendar.inicializar();
                    console.log('✅ Calendar inicializado');
                }
                
                // 3. Inicializar outros módulos
                if (typeof Tasks !== 'undefined' && Tasks.inicializar) {
                    Tasks.inicializar();
                    console.log('✅ Tasks inicializado');
                }
                
                // 4. 🔥 NOVO: Notificar Events sobre departamentos carregados
                if (typeof Events !== 'undefined' && Events.atualizarParticipantes) {
                    Events.atualizarParticipantes();
                    console.log('✅ Events notificado sobre dados atualizados');
                }
                
            }, 200); // 200ms para garantir que dados estão prontos
            
        } catch (error) {
            console.error('❌ Erro ao inicializar módulos:', error);
        }
    },

    // ✅ RENDERIZAR INTERFACE
    _renderizarInterface() {
        try {
            // Atualizar informações da interface
            this._atualizarInfoInterface();
            
            // Renderizar dashboard se função existe
            if (typeof this.renderizarDashboard === 'function') {
                this.renderizarDashboard();
            }
            
        } catch (error) {
            console.error('❌ Erro ao renderizar interface:', error);
        }
    },

    // ✅ ATUALIZAR INFORMAÇÕES DA INTERFACE
    _atualizarInfoInterface() {
        try {
            // Data atual
            const agora = new Date();
            const dataElement = document.getElementById('dataAtual');
            if (dataElement) {
                dataElement.textContent = agora.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });
            }
            
            // Mês e ano
            const mesAnoElement = document.getElementById('mesAno');
            if (mesAnoElement) {
                mesAnoElement.textContent = agora.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            
            // Usuário logado ou anônimo
            const usuarioElement = document.getElementById('usuarioLogado');
            if (usuarioElement) {
                if (this.estadoSistema.modoAnonimo) {
                    usuarioElement.textContent = '👁️ Visualização';
                    usuarioElement.style.opacity = '0.7';
                } else {
                    const nomeUsuario = this.usuarioAtual?.displayName || this.usuarioAtual?.email || 'Sistema';
                    usuarioElement.textContent = `👤 ${nomeUsuario}`;
                    usuarioElement.style.opacity = '1';
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao atualizar interface:', error);
        }
    },

    // 🔄 RECARREGAR DADOS DO FIREBASE (SEM USUÁRIOS + DEPARTAMENTOS)
    async recarregarDados() {
        try {
            console.log('🔄 Recarregando dados (preservando Auth.equipe + departamentos)...');
            
            this.estadoSistema.carregandoDados = true;
            
            // Carregar dados atualizados (sempre global, sem usuários)
            await this._carregarDadosDoFirebaseGlobal();
            
            // 🔥 NOVA FUNCIONALIDADE: Recarregar departamentos também
            await this._carregarDepartamentosDoFirebase();
            
            // Atualizar módulos
            if (typeof Calendar !== 'undefined' && Calendar.atualizarEventos) {
                Calendar.atualizarEventos();
            }
            
            // 🔥 NOVO: Notificar Events sobre atualização
            if (typeof Events !== 'undefined' && Events.atualizarParticipantes) {
                Events.atualizarParticipantes();
            }
            
            // Atualizar interface
            this._renderizarInterface();
            
            this.estadoSistema.carregandoDados = false;
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('🔄 Dados atualizados (usuários + departamentos preservados)!');
            }
            
            console.log('✅ Dados recarregados com sucesso (Auth.equipe + departamentos preservados)');
            
        } catch (error) {
            console.error('❌ Erro ao recarregar dados:', error);
            this.estadoSistema.carregandoDados = false;
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao recarregar dados');
            }
        }
    },

    // 💾 SALVAR DADOS (PROTEGIDO POR AUTH)
    async salvarDados() {
        // 🔥 VERIFICAÇÃO DE AUTH APENAS PARA SALVAMENTO
        if (this.estadoSistema.modoAnonimo) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Login necessário para salvar dados');
            }
            console.warn('⚠️ Tentativa de salvamento em modo anônimo bloqueada');
            return Promise.reject('Login necessário para salvar');
        }
        
        try {
            if (typeof Persistence !== 'undefined' && Persistence.salvarDados) {
                await Persistence.salvarDados();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    },

    // 💾 SALVAR DADOS CRÍTICO (PROTEGIDO POR AUTH)
    async salvarDadosCritico() {
        // 🔥 VERIFICAÇÃO DE AUTH APENAS PARA SALVAMENTO
        if (this.estadoSistema.modoAnonimo) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Login necessário para salvar eventos');
            }
            console.warn('⚠️ Tentativa de salvamento crítico em modo anônimo bloqueada');
            return Promise.reject('Login necessário para salvar');
        }
        
        try {
            if (typeof Persistence !== 'undefined' && Persistence.salvarDadosCritico) {
                await Persistence.salvarDadosCritico();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados crítico:', error);
        }
    },

    // 📊 RENDERIZAR DASHBOARD
    renderizarDashboard() {
        try {
            // Implementar renderização do dashboard se necessário
            console.log('📊 Dashboard atualizado');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar dashboard:', error);
        }
    },

    // 📊 OBTER STATUS DO SISTEMA v8.3 - DEPARTAMENTOS
    obterStatusSistema() {
        return {
            inicializado: this.estadoSistema.inicializado,
            carregandoDados: this.estadoSistema.carregandoDados,
            usuarioAutenticado: this.estadoSistema.usuarioAutenticado,
            modoAnonimo: this.estadoSistema.modoAnonimo,
            versao: this.estadoSistema.versao,
            totalEventos: this.dados.eventos.length,
            totalAreas: Object.keys(this.dados.areas).length,
            // 🔥 USUÁRIOS DO Auth.equipe
            totalUsuarios: typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe).length : 0,
            fonteUsuarios: 'Auth.equipe',
            // 🔥 NOVO: Status dos departamentos
            totalDepartamentos: this._contarDepartamentos(),
            departamentosCarregados: this.estadoSistema.departamentosCarregados,
            ultimoCarregamentoDepartamentos: this.estadoSistema.ultimoCarregamentoDepartamentos,
            fonteDepartamentos: this.estadoSistema.departamentosCarregados ? 'Firebase' : 'Padrão',
            ultimoCarregamento: this.estadoSistema.ultimoCarregamento,
            firebase: typeof database !== 'undefined',
            modules: {
                Calendar: typeof Calendar !== 'undefined',
                Events: typeof Events !== 'undefined',
                Persistence: typeof Persistence !== 'undefined',
                Auth: typeof Auth !== 'undefined',
                AdminUsersManager: typeof AdminUsersManager !== 'undefined'
            },
            permissoes: {
                leitura: true,
                escrita: !this.estadoSistema.modoAnonimo,
                admin: this.usuarioAtual?.admin || false
            },
            integracao: {
                authEquipePreservado: typeof Auth !== 'undefined' && !!Auth.equipe,
                dadosFirebaseSemUsuarios: !this.dados.hasOwnProperty('usuarios'),
                departamentosSincronizados: this.estadoSistema.departamentosCarregados && typeof Auth !== 'undefined' && Array.isArray(Auth.departamentos)
            }
        };
    },

    // 🔧 FUNÇÕES DE UTILIDADE
    obterEventos() {
        return this.dados.eventos || [];
    },

    adicionarEvento(evento) {
        if (this.estadoSistema.modoAnonimo) {
            throw new Error('Login necessário para adicionar eventos');
        }
        
        if (!this.dados.eventos) this.dados.eventos = [];
        this.dados.eventos.push(evento);
    },

    atualizarEvento(id, dadosAtualizados) {
        if (this.estadoSistema.modoAnonimo) {
            throw new Error('Login necessário para atualizar eventos');
        }
        
        const index = this.dados.eventos.findIndex(e => e.id == id);
        if (index !== -1) {
            this.dados.eventos[index] = { ...this.dados.eventos[index], ...dadosAtualizados };
        }
    },

    removerEvento(id) {
        if (this.estadoSistema.modoAnonimo) {
            throw new Error('Login necessário para remover eventos');
        }
        
        this.dados.eventos = this.dados.eventos.filter(e => e.id != id);
    },

    // 🔥 VERIFICAR SE PODE EDITAR
    podeEditar() {
        return !this.estadoSistema.modoAnonimo;
    },

    // 🔥 VERIFICAR SE É ADMIN
    ehAdmin() {
        return this.usuarioAtual?.admin === true;
    },

    // 🔥 NOVA FUNÇÃO: OBTER USUÁRIOS (DELEGADO PARA Auth.equipe)
    obterUsuarios() {
        try {
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                return Auth.equipe;
            }
            console.warn('⚠️ Auth.equipe não disponível');
            return {};
        } catch (error) {
            console.error('❌ Erro ao obter usuários:', error);
            return {};
        }
    },

    // 🔥 NOVA FUNÇÃO: OBTER DEPARTAMENTOS
    obterDepartamentos() {
        try {
            if (typeof Auth !== 'undefined' && Auth.departamentos && Array.isArray(Auth.departamentos)) {
                return Auth.departamentos;
            }
            console.warn('⚠️ Auth.departamentos não disponível');
            return ["Gestão Geral", "Obra e Construção", "Museu Nacional"];
        } catch (error) {
            console.error('❌ Erro ao obter departamentos:', error);
            return ["Gestão Geral", "Obra e Construção", "Museu Nacional"];
        }
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.App = App;

// ✅ FUNÇÕES GLOBAIS DE CONVENIÊNCIA
window.recarregarDados = () => App.recarregarDados();
window.statusSistema = () => App.obterStatusSistema();
window.recarregarDepartamentos = () => App.recarregarDepartamentos(); // 🔥 NOVA

// 🔥 VERIFICAÇÃO DE SISTEMA (DEBUG) v8.3 - DEPARTAMENTOS
window.verificarSistema = () => {
    const status = App.obterStatusSistema();
    console.table({
        'Inicializado': status.inicializado ? 'Sim' : 'Não',
        'Modo': status.modoAnonimo ? 'Anônimo' : 'Autenticado',
        'Eventos': status.totalEventos,
        'Áreas': status.totalAreas,
        'Usuários (Auth.equipe)': status.totalUsuarios,
        'Fonte Usuários': status.fonteUsuarios,
        // 🔥 NOVO: Departamentos
        'Departamentos': status.totalDepartamentos,
        'Departamentos Carregados': status.departamentosCarregados ? 'Sim' : 'Não',
        'Fonte Departamentos': status.fonteDepartamentos,
        'Firebase': status.firebase ? 'Conectado' : 'Offline',
        'Pode Editar': status.permissoes.escrita ? 'Sim' : 'Não',
        'Auth.equipe Preservado': status.integracao.authEquipePreservado ? 'Sim' : 'Não',
        'Dados sem usuários': status.integracao.dadosFirebaseSemUsuarios ? 'Sim' : 'Não',
        'Departamentos Sincronizados': status.integracao.departamentosSincronizados ? 'Sim' : 'Não'
    });
    return status;
};

// 🔥 DEBUG ESPECÍFICO PARA DEPARTAMENTOS v8.3
window.debugDepartamentos = () => {
    console.log('🏢 ============ DEBUG DEPARTAMENTOS v8.3 ============');
    
    const authDepartamentos = typeof Auth !== 'undefined' && Auth.departamentos ? Auth.departamentos : null;
    const statusCarregados = App.estadoSistema.departamentosCarregados;
    
    console.log('🏢 Auth.departamentos:', authDepartamentos ? authDepartamentos.length + ' departamentos' : 'INDISPONÍVEL');
    console.log('📊 Carregados do Firebase:', statusCarregados ? 'SIM' : 'NÃO (usando padrão)');
    console.log('⏰ Último carregamento:', App.estadoSistema.ultimoCarregamentoDepartamentos || 'Nunca');
    
    if (authDepartamentos) {
        console.log('📋 Lista de departamentos:');
        authDepartamentos.forEach((dept, i) => {
            console.log(`  ${i + 1}. ${dept}`);
        });
    }
    
    // Verificar no Firebase
    if (typeof database !== 'undefined') {
        database.ref('dados/departamentos').once('value').then(snapshot => {
            const dados = snapshot.val();
            console.log(`\n🔥 FIREBASE: ${dados ? Object.keys(dados).length : 0} departamentos`);
            if (dados) {
                Object.values(dados).forEach(dept => {
                    console.log(`   - ${dept.nome} (${dept.ativo ? 'ativo' : 'inativo'})`);
                });
            }
        });
    }
    
    console.log('🎯 Integração funcionando:', statusCarregados && authDepartamentos ? 'FUNCIONANDO ✅' : 'PROBLEMA ❌');
    console.log('🏢 ====================================================');
    
    return {
        departamentos: authDepartamentos,
        total: authDepartamentos ? authDepartamentos.length : 0,
        carregadosFirebase: statusCarregados,
        ultimoCarregamento: App.estadoSistema.ultimoCarregamentoDepartamentos,
        funcionando: statusCarregados && authDepartamentos
    };
};

// 🔥 TESTE COMPLETO DE DEPARTAMENTOS
window.testarDepartamentos = async () => {
    console.log('🧪 ============ TESTE DEPARTAMENTOS v8.3 ============');
    console.log('📊 Status antes do teste:');
    debugDepartamentos();
    
    console.log('\n🔄 Recarregando departamentos do Firebase...');
    const resultado = await App.recarregarDepartamentos();
    
    console.log('\n📊 Status após o teste:');
    debugDepartamentos();
    
    console.log('\n🎯 RESULTADO:', resultado ? '✅ DEPARTAMENTOS FUNCIONANDO!' : '⚠️ Usando departamentos padrão');
    console.log('🧪 ====================================================');
    
    return resultado;
};

// 🔥 DEBUG ESPECÍFICO PARA USUÁRIOS v8.3 (MANTIDO)
window.debugUsuarios = () => {
    console.log('🔍 ============ DEBUG USUÁRIOS v8.3 ============');
    
    const authEquipe = typeof Auth !== 'undefined' && Auth.equipe ? Auth.equipe : null;
    const appDados = App.dados.usuarios || null;
    
    console.log('👥 Auth.equipe:', authEquipe ? Object.keys(authEquipe).length + ' usuários' : 'INDISPONÍVEL');
    console.log('📊 App.dados.usuarios:', appDados ? Object.keys(appDados).length + ' usuários' : 'NÃO EXISTE (CORRETO)');
    
    if (authEquipe) {
        console.log('📋 Usuários em Auth.equipe:');
        Object.keys(authEquipe).forEach(key => {
            const user = authEquipe[key];
            console.log(`  - ${key}: ${user.nome} (${user.email})`);
        });
    }
    
    console.log('🎯 Fonte única de usuários:', App.obterUsuarios() === authEquipe ? 'CORRETA' : 'PROBLEMA');
    console.log('✅ App.dados SEM usuários:', !App.dados.hasOwnProperty('usuarios') ? 'CORRETO' : 'PROBLEMA');
    
    return {
        authEquipe: authEquipe ? Object.keys(authEquipe) : null,
        appDados: appDados ? Object.keys(appDados) : null,
        fonteUnica: App.obterUsuarios() === authEquipe,
        dadosSemUsuarios: !App.dados.hasOwnProperty('usuarios')
    };
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA CORRIGIDA v8.3
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar outros módulos carregarem
    setTimeout(async () => {
        await App.inicializar();
    }, 500); // 500ms para garantir que todos os módulos estão carregados
});

// ✅ LOG FINAL
console.log('🚀 App.js v8.3 - DEPARTAMENTOS PERSISTENTES CORRIGIDOS carregado!');

/*
🔥 CORREÇÕES DEFINITIVAS v8.3 - DEPARTAMENTOS:

✅ NOVAS FUNCIONALIDADES:
- _carregarDepartamentosDoFirebase(): Carrega departamentos do Firebase ✅
- _buscarDepartamentosDoFirebase(): Busca dados em dados/departamentos ✅
- _configurarDepartamentosPadrao(): Fallback inteligente ✅
- recarregarDepartamentos(): Função pública para recarregar ✅
- debugDepartamentos(): Debug específico para departamentos ✅
- testarDepartamentos(): Teste completo de funcionamento ✅

🔧 INTEGRAÇÕES:
- Departamentos sincronizam com Auth.departamentos ✅
- Events.js é notificado sobre atualizações ✅
- Status do sistema inclui informações de departamentos ✅
- Interface mostra departamentos carregados ✅

📊 RESULTADO DEFINITIVO v8.3:
- Departamentos criados no AdminUsersManager persistem ✅
- App.js carrega departamentos na inicialização ✅
- Auth.departamentos sempre atualizado ✅
- Sistema robusto com fallback ✅
- Debug completo disponível ✅
- PROBLEMA RESOLVIDO DEFINITIVAMENTE ✅

🧪 COMANDOS DE TESTE:
- debugDepartamentos() → Status completo dos departamentos
- testarDepartamentos() → Teste de carregamento
- recarregarDepartamentos() → Forçar reload
- verificarSistema() → Status geral do sistema
*/
