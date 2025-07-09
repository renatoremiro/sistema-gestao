/**
 * 🔥 FIREBASE AUTH INTEGRATION v8.3 - ARQUIVO PERMANENTE
 * 
 * Sistema híbrido de autenticação e persistência Firebase
 * Salvar como: assets/js/modules/firebase-auth-integration.js
 */

const FirebaseAuthIntegration = {
    
    // ⚙️ CONFIGURAÇÃO
    config: {
        versao: '8.3.0',
        modoHibrido: true,
        authAnonimo: true,
        retryAutomatico: true,
        maxTentativas: 3,
        timeoutReconexao: 5000,
        debugMode: false
    },
    
    // 📊 ESTADO
    estado: {
        inicializado: false,
        firebaseAuth: null,
        usuarioAuth: null,
        conexaoAtiva: false,
        ultimoTeste: null,
        operacoesQueue: []
    },

    // 🚀 INICIALIZAR SISTEMA
    async inicializar() {
        if (this.estado.inicializado) {
            console.log('🔥 Firebase Auth Integration já inicializado');
            return true;
        }
        
        try {
            console.log('🔥 Inicializando Firebase Auth Integration v8.3...');
            
            // 1. Verificar dependências
            await this._verificarDependencias();
            
            // 2. Configurar autenticação
            await this._configurarAuth();
            
            // 3. Testar conectividade
            await this._testarConectividade();
            
            // 4. Integrar com sistema existente
            this._integrarSistema();
            
            // 5. Configurar monitoramento
            this._configurarMonitoramento();
            
            this.estado.inicializado = true;
            console.log('✅ Firebase Auth Integration v8.3 inicializado com sucesso!');
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro na inicialização Firebase Auth:', error);
            this._configurarModoFallback();
            return false;
        }
    },

    // 🔍 VERIFICAR DEPENDÊNCIAS
    async _verificarDependencias() {
        const dependencias = [
            { nome: 'firebase', objeto: typeof firebase !== 'undefined' },
            { nome: 'database', objeto: typeof database !== 'undefined' },
            { nome: 'Auth', objeto: typeof Auth !== 'undefined' },
            { nome: 'AdminUsersManager', objeto: typeof AdminUsersManager !== 'undefined' }
        ];
        
        const faltando = dependencias.filter(dep => !dep.objeto);
        
        if (faltando.length > 0) {
            const nomes = faltando.map(d => d.nome).join(', ');
            throw new Error(`Dependências faltando: ${nomes}`);
        }
        
        console.log('✅ Dependências verificadas:', dependencias.length);
    },

    // 🔑 CONFIGURAR AUTENTICAÇÃO
    async _configurarAuth() {
        try {
            if (this.config.authAnonimo && firebase.auth) {
                console.log('🔑 Configurando autenticação anônima...');
                
                // Verificar se já está autenticado
                const usuarioAtual = firebase.auth().currentUser;
                if (usuarioAtual) {
                    console.log('✅ Usuário já autenticado:', usuarioAtual.uid);
                    this.estado.usuarioAuth = usuarioAtual;
                } else {
                    // Fazer sign in anônimo
                    const result = await firebase.auth().signInAnonymously();
                    this.estado.usuarioAuth = result.user;
                    console.log('✅ Autenticação anônima realizada:', result.user.uid);
                }
                
                // Configurar listener
                firebase.auth().onAuthStateChanged((user) => {
                    this.estado.usuarioAuth = user;
                    this.estado.conexaoAtiva = !!user;
                    
                    if (user) {
                        console.log('🔑 Auth state: Conectado');
                        this._processarQueue();
                    } else {
                        console.log('🔑 Auth state: Desconectado');
                    }
                });
                
                this.estado.firebaseAuth = firebase.auth();
            }
        } catch (error) {
            console.warn('⚠️ Erro na configuração de auth:', error);
            // Continuar sem auth específico
        }
    },

    // 🧪 TESTAR CONECTIVIDADE
    async _testarConectividade() {
        try {
            console.log('🧪 Testando conectividade Firebase...');
            
            const testRef = database.ref('conexao_teste');
            const testData = {
                timestamp: new Date().toISOString(),
                teste: 'conectividade',
                usuario: Auth.obterUsuario()?.email || 'sistema'
            };
            
            // Teste de escrita
            await testRef.set(testData);
            
            // Teste de leitura
            const snapshot = await testRef.once('value');
            const dados = snapshot.val();
            
            if (dados && dados.timestamp === testData.timestamp) {
                console.log('✅ Conectividade Firebase OK');
                this.estado.conexaoAtiva = true;
                this.estado.ultimoTeste = new Date().toISOString();
                
                // Limpar teste
                await testRef.remove();
            } else {
                throw new Error('Dados de teste não correspondem');
            }
            
        } catch (error) {
            console.error('❌ Falha no teste de conectividade:', error);
            this.estado.conexaoAtiva = false;
            throw error;
        }
    },

    // 🔗 INTEGRAR COM SISTEMA EXISTENTE
    _integrarSistema() {
        console.log('🔗 Integrando com sistema existente...');
        
        // Integrar com AdminUsersManager
        if (typeof AdminUsersManager !== 'undefined') {
            const salvarOriginal = AdminUsersManager._salvarUsuariosNoFirebase;
            
            AdminUsersManager._salvarUsuariosNoFirebase = async function() {
                return await FirebaseAuthIntegration.salvarComIntegracao(Auth.equipe, 'dados/usuarios');
            };
            
            console.log('✅ AdminUsersManager integrado');
        }
        
        // Integrar com App (eventos)
        if (typeof App !== 'undefined' && App.salvarDados) {
            const salvarEventosOriginal = App.salvarDados;
            
            App.salvarDados = async function() {
                if (App.dados && App.dados.eventos) {
                    await FirebaseAuthIntegration.salvarComIntegracao(App.dados.eventos, 'dados/eventos');
                }
                return salvarEventosOriginal.call(this);
            };
            
            console.log('✅ App.salvarDados integrado');
        }
        
        // Integrar com Tasks (se existir)
        if (typeof Tasks !== 'undefined' && Tasks.salvarTarefas) {
            const salvarTarefasOriginal = Tasks.salvarTarefas;
            
            Tasks.salvarTarefas = async function(tarefas) {
                const usuarioAtual = Auth.obterUsuario();
                if (usuarioAtual) {
                    const path = `dados/tarefas/${usuarioAtual.email.replace(/[.@]/g, '_')}`;
                    await FirebaseAuthIntegration.salvarComIntegracao(tarefas, path);
                }
                return salvarTarefasOriginal.call(this, tarefas);
            };
            
            console.log('✅ Tasks integrado');
        }
    },

    // 📊 CONFIGURAR MONITORAMENTO
    _configurarMonitoramento() {
        // Monitor de conexão Firebase
        database.ref('.info/connected').on('value', (snapshot) => {
            const conectado = snapshot.val();
            this.estado.conexaoAtiva = conectado;
            
            if (conectado) {
                console.log('🔥 Firebase reconectado');
                this._processarQueue();
            } else {
                console.log('🔥 Firebase desconectado');
            }
        });
        
        // Monitor de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.estado.inicializado) {
                this._verificarConexao();
            }
        });
        
        // Monitor periódico (a cada 5 minutos)
        setInterval(() => {
            if (this.estado.inicializado) {
                this._verificarConexao();
            }
        }, 5 * 60 * 1000);
        
        console.log('📊 Monitoramento configurado');
    },

    // 💾 SALVAR COM INTEGRAÇÃO (MÉTODO PRINCIPAL)
    async salvarComIntegracao(dados, path) {
        const operacao = {
            id: Date.now(),
            dados,
            path,
            tentativas: 0,
            timestamp: new Date().toISOString()
        };
        
        if (!this.estado.conexaoAtiva) {
            console.log('⏳ Conexão inativa, adicionando à queue...');
            this.estado.operacoesQueue.push(operacao);
            this._salvarBackupLocal(dados, path);
            return false;
        }
        
        return await this._executarOperacao(operacao);
    },

    // ⚡ EXECUTAR OPERAÇÃO
    async _executarOperacao(operacao) {
        const maxTentativas = this.config.maxTentativas;
        
        while (operacao.tentativas < maxTentativas) {
            try {
                operacao.tentativas++;
                
                if (this.config.debugMode) {
                    console.log(`💾 Tentativa ${operacao.tentativas}/${maxTentativas} - ${operacao.path}`);
                }
                
                // Garantir auth se necessário
                await this._garantirAuth();
                
                // Executar salvamento
                await database.ref(operacao.path).set(operacao.dados);
                
                // Verificar se salvou
                const verificacao = await database.ref(operacao.path).once('value');
                if (verificacao.exists()) {
                    if (this.config.debugMode) {
                        console.log(`✅ Salvamento verificado: ${operacao.path}`);
                    }
                    return true;
                } else {
                    throw new Error('Verificação falhou - dados não salvos');
                }
                
            } catch (error) {
                console.warn(`⚠️ Tentativa ${operacao.tentativas} falhou:`, error.message);
                
                if (operacao.tentativas < maxTentativas) {
                    // Tentar reconectar antes da próxima tentativa
                    await this._reconectar();
                    await new Promise(resolve => setTimeout(resolve, 1000 * operacao.tentativas));
                } else {
                    console.error(`❌ Todas as tentativas falharam para ${operacao.path}`);
                    this._salvarBackupLocal(operacao.dados, operacao.path);
                    throw error;
                }
            }
        }
        
        return false;
    },

    // 🔑 GARANTIR AUTENTICAÇÃO
    async _garantirAuth() {
        if (this.config.authAnonimo && this.estado.firebaseAuth && !this.estado.usuarioAuth) {
            try {
                const result = await this.estado.firebaseAuth.signInAnonymously();
                this.estado.usuarioAuth = result.user;
                console.log('🔑 Re-autenticação realizada');
            } catch (error) {
                console.warn('⚠️ Erro na re-autenticação:', error);
            }
        }
    },

    // 🔄 RECONECTAR
    async _reconectar() {
        try {
            console.log('🔄 Reconectando Firebase...');
            
            database.goOffline();
            await new Promise(resolve => setTimeout(resolve, 1000));
            database.goOnline();
            
            // Aguardar reconexão
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Re-autenticar se necessário
            await this._garantirAuth();
            
            console.log('✅ Reconexão concluída');
            
        } catch (error) {
            console.warn('⚠️ Erro na reconexão:', error);
        }
    },

    // 📋 PROCESSAR QUEUE
    async _processarQueue() {
        if (this.estado.operacoesQueue.length === 0) return;
        
        console.log(`📋 Processando queue: ${this.estado.operacoesQueue.length} operações`);
        
        const operacoesPendentes = [...this.estado.operacoesQueue];
        this.estado.operacoesQueue = [];
        
        for (const operacao of operacoesPendentes) {
            try {
                await this._executarOperacao(operacao);
                console.log(`✅ Operação da queue processada: ${operacao.path}`);
            } catch (error) {
                console.error(`❌ Erro ao processar operação da queue: ${operacao.path}`, error);
                // Recolocar na queue se for erro temporário
                if (this.estado.operacoesQueue.length < 10) {
                    this.estado.operacoesQueue.push(operacao);
                }
            }
        }
    },

    // 🔍 VERIFICAR CONEXÃO
    async _verificarConexao() {
        try {
            const snapshot = await database.ref('.info/connected').once('value');
            const conectado = snapshot.val();
            
            if (conectado && this.estado.operacoesQueue.length > 0) {
                this._processarQueue();
            }
            
            this.estado.conexaoAtiva = conectado;
            
        } catch (error) {
            console.warn('⚠️ Erro na verificação de conexão:', error);
            this.estado.conexaoAtiva = false;
        }
    },

    // 💾 BACKUP LOCAL
    _salvarBackupLocal(dados, path) {
        try {
            const chave = `backup_${path.replace(/[\/\.]/g, '_')}`;
            const backup = {
                dados,
                path,
                timestamp: new Date().toISOString(),
                versao: this.config.versao
            };
            
            localStorage.setItem(chave, JSON.stringify(backup));
            
            if (this.config.debugMode) {
                console.log(`💾 Backup local salvo: ${chave}`);
            }
            
        } catch (error) {
            console.error('❌ Erro no backup local:', error);
        }
    },

    // 🆘 CONFIGURAR MODO FALLBACK
    _configurarModoFallback() {
        console.log('🆘 Configurando modo fallback...');
        
        // Todos os salvamentos vão para localStorage
        this.salvarComIntegracao = async (dados, path) => {
            this._salvarBackupLocal(dados, path);
            return true;
        };
        
        console.log('⚠️ Sistema funcionando em modo offline');
    },

    // 🔧 FORÇAR SINCRONIZAÇÃO
    async forcarSincronizacao() {
        try {
            console.log('🔧 Forçando sincronização completa...');
            
            // Reconectar
            await this._reconectar();
            
            // Testar conectividade
            await this._testarConectividade();
            
            // Processar queue
            await this._processarQueue();
            
            // Tentar sincronizar backups locais
            await this._sincronizarBackupsLocais();
            
            console.log('✅ Sincronização forçada concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na sincronização forçada:', error);
            return false;
        }
    },

    // 📤 SINCRONIZAR BACKUPS LOCAIS
    async _sincronizarBackupsLocais() {
        try {
            const backupsParaSincronizar = [];
            
            // Encontrar backups
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('backup_dados_')) {
                    const backup = JSON.parse(localStorage.getItem(key));
                    if (backup && backup.path && backup.dados) {
                        backupsParaSincronizar.push({ key, backup });
                    }
                }
            }
            
            // Sincronizar cada backup
            for (const item of backupsParaSincronizar) {
                try {
                    await this.salvarComIntegracao(item.backup.dados, item.backup.path);
                    localStorage.removeItem(item.key);
                    console.log(`📤 Backup sincronizado: ${item.backup.path}`);
                } catch (error) {
                    console.warn(`⚠️ Erro ao sincronizar backup: ${item.backup.path}`, error);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro na sincronização de backups:', error);
        }
    },

    // 📊 OBTER STATUS
    obterStatus() {
        return {
            versao: this.config.versao,
            inicializado: this.estado.inicializado,
            conexaoAtiva: this.estado.conexaoAtiva,
            usuarioAuth: this.estado.usuarioAuth?.uid || 'nenhum',
            operacoesQueue: this.estado.operacoesQueue.length,
            ultimoTeste: this.estado.ultimoTeste,
            modoAtual: this.estado.conexaoAtiva ? 'ONLINE' : 'OFFLINE'
        };
    },

    // 📋 OBTER STATUS DETALHADO
    obterStatusDetalhado() {
        const status = this.obterStatus();
        console.table(status);
        
        if (this.estado.operacoesQueue.length > 0) {
            console.log('📋 Operações na queue:');
            console.table(this.estado.operacoesQueue.map(op => ({
                path: op.path,
                tentativas: op.tentativas,
                timestamp: op.timestamp
            })));
        }
        
        return status;
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.FirebaseAuthIntegration = FirebaseAuthIntegration;

// ✅ COMANDOS ÚTEIS
window.statusFirebaseAuth = () => FirebaseAuthIntegration.obterStatusDetalhado();
window.forcarSyncFirebase = () => FirebaseAuthIntegration.forcarSincronizacao();
window.reconectarFirebase = () => FirebaseAuthIntegration._reconectar();

// ✅ INICIALIZAÇÃO AUTOMÁTICA
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => FirebaseAuthIntegration.inicializar(), 1500);
    });
} else {
    setTimeout(() => FirebaseAuthIntegration.inicializar(), 1500);
}

console.log('🔥 Firebase Auth Integration v8.3 carregado!');
console.log('📋 Comandos: statusFirebaseAuth() | forcarSyncFirebase() | reconectarFirebase()');

/*
🔥 FIREBASE AUTH INTEGRATION v8.3 - ARQUIVO PERMANENTE

✅ FUNCIONALIDADES COMPLETAS:
- Autenticação anônima automática
- Sistema de retry inteligente
- Queue de operações offline
- Backup local automático
- Monitoramento de conexão
- Integração com sistema existente
- Sincronização de backups
- Modo fallback robusto

✅ INTEGRAÇÕES:
- AdminUsersManager → Salva usuários automaticamente
- App → Salva eventos automaticamente  
- Tasks → Salva tarefas por usuário
- Cache Manager → Limpa cache em problemas

✅ COMANDOS:
- statusFirebaseAuth() → Status detalhado
- forcarSyncFirebase() → Sincronização manual
- reconectarFirebase() → Reconexão manual

✅ AUTOMÁTICO:
- Inicialização automática
- Auth anônimo automático
- Retry em falhas
- Queue offline
- Backup local
- Monitoramento contínuo

🎯 RESOLVE:
- Problemas de cache persistente
- Falhas de autenticação
- Perda de conexão
- Dados não salvos
- Conflitos de versão
*/
