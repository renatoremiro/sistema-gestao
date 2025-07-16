/**
 * 💾 Sistema de Persistência SUPABASE PURO v1.0
 * 
 * 🎯 ESTRATÉGIA: Supabase do zero (sem Firebase)
 * 🚀 VANTAGENS: Simples, rápido, servidor no Brasil
 * 🛡️ FALLBACK: localStorage sempre disponível
 */

const Persistence = {
    // ✅ CONFIGURAÇÕES SUPABASE
    config: {
        MAX_TENTATIVAS: 2,
        TIMEOUT_OPERACAO: 5000, // Reduzido: Supabase é mais rápido
        INTERVALO_RETRY: 500,
        BACKUP_LOCAL_KEY: 'sistemaBackupSupabase',
        VERSAO: '1.0-supabase',
        CACHE_USUARIO: 30000 // 30s cache usuário
    },

    // ✅ ESTADO SIMPLIFICADO
    state: {
        salvandoTimeout: null,
        dadosParaSalvar: null,
        tentativasSalvamento: 0,
        indicadorSalvamento: null,
        conectividadeSupabase: null,
        ultimoBackup: null,
        usuarioAtual: null,
        ultimaVerificacaoUsuario: null
    },

    // 🔥 VERIFICAÇÃO DE USUÁRIO CACHED
    _verificarUsuarioLogado() {
        const agora = Date.now();
        
        // Cache válido por 30 segundos
        if (this.state.ultimaVerificacaoUsuario && 
            (agora - this.state.ultimaVerificacaoUsuario) < this.config.CACHE_USUARIO &&
            this.state.usuarioAtual !== null) {
            return this.state.usuarioAtual;
        }
        
        // Verificar usuário atual
        let usuario = null;
        
        if (typeof App !== 'undefined' && App.usuarioAtual) {
            usuario = App.usuarioAtual;
        } else if (typeof Auth !== 'undefined' && Auth.state?.usuario) {
            usuario = Auth.state.usuario;
        }
        
        // Atualizar cache
        this.state.usuarioAtual = usuario;
        this.state.ultimaVerificacaoUsuario = agora;
        
        return usuario;
    },

    // 🚀 SALVAMENTO SUPABASE SIMPLES
    async salvarDados() {
        const usuario = this._verificarUsuarioLogado();
        if (!usuario) {
            console.warn('⚠️ Salvamento bloqueado: usuário não logado');
            return this._salvarLocalApenas();
        }
        
        clearTimeout(this.state.salvandoTimeout);
        this.state.dadosParaSalvar = { ...App.dados };
        
        this.state.salvandoTimeout = setTimeout(() => {
            this._executarSalvamentoSupabase();
        }, 300);

        return Promise.resolve();
    },

    // 🔥 SALVAMENTO CRÍTICO SUPABASE
    async salvarDadosCritico() {
        const usuario = this._verificarUsuarioLogado();
        if (!usuario) {
            console.warn('⚠️ Salvamento crítico bloqueado: usuário não logado');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Login necessário para salvar');
            }
            return this._salvarLocalApenas();
        }
        
        try {
            clearTimeout(this.state.salvandoTimeout);
            this.state.dadosParaSalvar = { ...App.dados };
            this.state.tentativasSalvamento = 0;
            
            this._mostrarIndicadorSalvamento('Salvando no Supabase...');
            
            const resultado = await this._executarSalvamentoSupabaseCritico();
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro salvamento crítico:', error);
            throw error;
        }
    },

    // 💾 SALVAMENTO LOCAL APENAS
    async _salvarLocalApenas() {
        try {
            const dados = this.state.dadosParaSalvar || App.dados;
            this._salvarBackupLocal(dados);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.info('💾 Dados salvos localmente');
            }
            
            return 'local';
        } catch (error) {
            console.error('❌ Erro salvamento local:', error);
            return null;
        }
    },

    // 🚀 EXECUÇÃO SALVAMENTO SUPABASE
    async _executarSalvamentoSupabaseCritico() {
        return new Promise(async (resolve, reject) => {
            if (!this.state.dadosParaSalvar) {
                this._ocultarIndicadorSalvamento();
                reject('Nenhum dado para salvar');
                return;
            }
            
            const usuario = this._verificarUsuarioLogado();
            if (!usuario) {
                this._ocultarIndicadorSalvamento();
                reject('Usuário não logado');
                return;
            }
            
            try {
                // Verificar se Supabase está disponível
                if (!window.supabaseClient) {
                    throw new Error('Supabase client não disponível');
                }
                
                // Testar conexão rapidamente
                const conectado = await this._testarConexaoSupabase();
                if (!conectado) {
                    console.warn('⚠️ Supabase offline - salvando apenas localmente');
                    const resultadoLocal = await this._salvarLocalApenas();
                    this._ocultarIndicadorSalvamento();
                    resolve(resultadoLocal);
                    return;
                }
                
                // Preparar dados para Supabase
                const dadosPreparados = this._prepararDadosSupabase(this.state.dadosParaSalvar, usuario);
                
                // Backup local antes de salvar na nuvem
                this._salvarBackupLocal(dadosPreparados);
                
                // Salvar no Supabase com timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout Supabase')), this.config.TIMEOUT_OPERACAO);
                });
                
                const savePromise = this._salvarNoSupabase(dadosPreparados, usuario);
                
                Promise.race([savePromise, timeoutPromise])
                    .then(() => {
                        this._onSalvamentoSucesso();
                        resolve('supabase');
                    })
                    .catch((error) => {
                        this._onSalvamentoErro(error, resolve, reject);
                    });
                    
            } catch (error) {
                console.error('❌ Erro crítico salvamento Supabase:', error);
                this._ocultarIndicadorSalvamento();
                
                // Fallback para local
                const resultadoLocal = await this._salvarLocalApenas();
                if (resultadoLocal) {
                    resolve(resultadoLocal);
                } else {
                    reject(error);
                }
            }
        });
    },

    // 🔗 TESTAR CONEXÃO SUPABASE
    async _testarConexaoSupabase() {
        try {
            if (!window.supabaseClient) return false;
            
            const conectado = await window.supabaseClient.testarConexao();
            this.state.conectividadeSupabase = conectado;
            return conectado;
            
        } catch (error) {
            this.state.conectividadeSupabase = false;
            return false;
        }
    },

    // 📊 PREPARAR DADOS PARA SUPABASE
    _prepararDadosSupabase(dados, usuario) {
        const dadosLimpos = {
            // Estrutura principal
            areas: dados.areas || {},
            eventos: dados.eventos || [],
            tarefas: dados.tarefas || [],
            usuarios: dados.usuarios || {},
            
            // Metadata
            metadata: {
                ultimaAtualizacao: new Date().toISOString(),
                ultimoUsuario: usuario.email || usuario.nome || 'Sistema',
                versao: this.config.VERSAO,
                totalEventos: (dados.eventos || []).length,
                totalTarefas: (dados.tarefas || []).length,
                totalAreas: Object.keys(dados.areas || {}).length,
                banco: 'supabase',
                servidor: 'brasil'
            },
            
            // Controle
            versao: this.config.VERSAO,
            timestamp: Date.now(),
            checksum: this._calcularChecksum(dados)
        };

        // Validação simples
        this._validarDadosBasicos(dadosLimpos);
        
        return dadosLimpos;
    },

    // ✅ VALIDAÇÃO BÁSICA (menos rigorosa)
    _validarDadosBasicos(dados) {
        if (!dados || typeof dados !== 'object') {
            throw new Error('Dados inválidos');
        }
        
        // Garantir estruturas básicas
        if (!dados.areas) dados.areas = {};
        if (!dados.eventos) dados.eventos = [];
        if (!dados.tarefas) dados.tarefas = [];
        if (!dados.usuarios) dados.usuarios = {};
        
        // Corrigir eventos sem ID
        if (Array.isArray(dados.eventos)) {
            dados.eventos.forEach((evento, index) => {
                if (!evento.id) evento.id = 'evento_' + Date.now() + '_' + index;
                if (!evento.titulo) evento.titulo = 'Evento sem título';
                if (!evento.data) evento.data = new Date().toISOString().split('T')[0];
            });
        }
        
        // Corrigir tarefas sem ID
        if (Array.isArray(dados.tarefas)) {
            dados.tarefas.forEach((tarefa, index) => {
                if (!tarefa.id) tarefa.id = 'tarefa_' + Date.now() + '_' + index;
                if (!tarefa.titulo) tarefa.titulo = 'Tarefa sem título';
            });
        }
        
        return true;
    },

    // 🚀 SALVAR NO SUPABASE
    async _salvarNoSupabase(dados, usuario) {
        try {
            // Estratégia: salvar em tabela de backups do sistema
            const backup = {
                usuario_email: usuario.email || usuario.nome,
                dados: dados,
                versao: this.config.VERSAO,
                timestamp: new Date().toISOString()
            };
            
            // Tentar upsert (inserir ou atualizar)
            const resultado = await window.supabaseClient.upsert('backups_sistema', backup);
            
            console.log('✅ Dados salvos no Supabase:', resultado?.id);
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro ao salvar no Supabase:', error);
            throw error;
        }
    },

    // ✅ SALVAMENTO TRADICIONAL (background)
    async _executarSalvamentoSupabase() {
        if (!this.state.dadosParaSalvar) return;
        
        const usuario = this._verificarUsuarioLogado();
        if (!usuario) {
            console.warn('⚠️ Salvamento automático bloqueado: usuário não logado');
            return;
        }

        try {
            const conectado = await this._testarConexaoSupabase();
            if (!conectado) {
                // Fallback silencioso para local
                this._salvarBackupLocal(this.state.dadosParaSalvar);
                return;
            }
            
            const dadosPreparados = this._prepararDadosSupabase(this.state.dadosParaSalvar, usuario);
            await this._salvarNoSupabase(dadosPreparados, usuario);
            
            this.state.dadosParaSalvar = null;
            console.log('💾 Salvamento automático Supabase concluído');
            
        } catch (error) {
            console.warn('⚠️ Erro salvamento automático - usando local:', error.message);
            this._salvarBackupLocal(this.state.dadosParaSalvar);
            
            // Retry silencioso em 3 segundos
            setTimeout(() => {
                if (this.state.dadosParaSalvar && this._verificarUsuarioLogado()) {
                    this._executarSalvamentoSupabase();
                }
            }, 3000);
        }
    },

    // ✅ CALLBACKS DE SUCESSO
    _onSalvamentoSucesso() {
        this.state.dadosParaSalvar = null;
        this.state.tentativasSalvamento = 0;
        this._ocultarIndicadorSalvamento();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('✅ Dados salvos no Supabase!');
        }
        
        this.state.ultimoBackup = new Date().toISOString();
    },

    // ⚠️ CALLBACK DE ERRO
    _onSalvamentoErro(error, resolve, reject) {
        console.error('❌ Erro salvamento Supabase:', error);
        this.state.tentativasSalvamento++;
        
        if (this.state.tentativasSalvamento < this.config.MAX_TENTATIVAS) {
            const tentativaAtual = this.state.tentativasSalvamento + 1;
            this._mostrarIndicadorSalvamento(`Tentativa ${tentativaAtual}/${this.config.MAX_TENTATIVAS}...`);
            
            const delay = this.config.INTERVALO_RETRY * this.state.tentativasSalvamento;
            
            setTimeout(() => {
                this._executarSalvamentoSupabaseCritico().then(resolve).catch(reject);
            }, delay);
        } else {
            this._ocultarIndicadorSalvamento();
            
            // Tentar salvar local como último recurso
            this._salvarLocalApenas().then((resultado) => {
                if (resultado) {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.warning('⚠️ Salvo localmente (Supabase offline)');
                    }
                    resolve(resultado);
                } else {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('❌ Falha completa no salvamento!');
                    }
                    reject(error);
                }
            });
        }
    },

    // 📁 BACKUP LOCAL
    _salvarBackupLocal(dados) {
        try {
            const backup = {
                dados: dados,
                timestamp: new Date().toISOString(),
                versao: this.config.VERSAO,
                usuario: this._verificarUsuarioLogado()?.email || 'Sistema',
                banco: 'local'
            };
            
            // localStorage principal
            localStorage.setItem(this.config.BACKUP_LOCAL_KEY, JSON.stringify(backup));
            
            // sessionStorage como backup
            sessionStorage.setItem(this.config.BACKUP_LOCAL_KEY + '_session', JSON.stringify(backup));
            
            console.log('💾 Backup local salvo');
            
        } catch (error) {
            console.error('❌ Erro backup local:', error);
        }
    },

    // 📂 RECUPERAR BACKUP LOCAL
    recuperarBackupLocal() {
        try {
            // Tentar localStorage primeiro
            const backupLocal = localStorage.getItem(this.config.BACKUP_LOCAL_KEY);
            if (backupLocal) {
                const dados = JSON.parse(backupLocal);
                if (this._validarBackup(dados)) {
                    console.log('📂 Backup local recuperado');
                    return dados.dados;
                }
            }
            
            // Fallback sessionStorage
            const backupSession = sessionStorage.getItem(this.config.BACKUP_LOCAL_KEY + '_session');
            if (backupSession) {
                const dados = JSON.parse(backupSession);
                if (this._validarBackup(dados)) {
                    console.log('📂 Backup sessão recuperado');
                    return dados.dados;
                }
            }
            
        } catch (error) {
            console.error('❌ Erro recuperar backup:', error);
        }
        
        return null;
    },

    // ✅ VALIDAR BACKUP
    _validarBackup(backup) {
        if (!backup || !backup.dados || !backup.timestamp) {
            return false;
        }
        
        // Verificar se backup não é muito antigo (7 dias)
        const timestampBackup = new Date(backup.timestamp);
        const agora = new Date();
        const diferencaDias = (agora - timestampBackup) / (1000 * 60 * 60 * 24);
        
        return diferencaDias <= 7;
    },

    // 🔄 SINCRONIZAÇÃO COM SUPABASE
    async sincronizarDados() {
        try {
            const conectado = await this._testarConexaoSupabase();
            if (!conectado) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Supabase offline - dados locais');
                }
                return false;
            }
            
            const usuario = this._verificarUsuarioLogado();
            if (!usuario) {
                console.warn('⚠️ Usuário não logado - sem sincronização');
                return false;
            }
            
            // Buscar dados mais recentes do Supabase
            const dadosRemoto = await this._carregarDoSupabase(usuario);
            
            if (dadosRemoto) {
                // Verificar se dados remotos são mais recentes
                const timestampLocal = new Date(App.dados?.metadata?.ultimaAtualizacao || 0);
                const timestampRemoto = new Date(dadosRemoto.metadata?.ultimaAtualizacao || 0);
                
                if (timestampRemoto > timestampLocal) {
                    App.dados = dadosRemoto;
                    if (typeof App.renderizarDashboard === 'function') {
                        App.renderizarDashboard();
                    }
                    if (typeof Notifications !== 'undefined') {
                        Notifications.info('📥 Dados sincronizados do Supabase');
                    }
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Erro sincronização:', error);
            return false;
        }
    },

    // 📥 CARREGAR DO SUPABASE
    async _carregarDoSupabase(usuario) {
        try {
            if (!window.supabaseClient) return null;
            
            // Buscar backup mais recente do usuário
            const backups = await window.supabaseClient.buscar('backups_sistema', {
                usuario_email: usuario.email || usuario.nome
            });
            
            if (backups && backups.length > 0) {
                // Pegar o mais recente
                const backupMaisRecente = backups.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                )[0];
                
                return backupMaisRecente.dados;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Erro carregar do Supabase:', error);
            return null;
        }
    },

    // 🔧 CHECKSUM SIMPLES
    _calcularChecksum(dados) {
        try {
            const str = JSON.stringify(dados);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString();
        } catch {
            return Date.now().toString();
        }
    },

    // 📊 STATUS DO SISTEMA
    obterStatus() {
        return {
            versao: this.config.VERSAO,
            banco: 'supabase',
            servidor: 'brasil',
            usuarioLogado: !!this._verificarUsuarioLogado(),
            conectividadeSupabase: this.state.conectividadeSupabase,
            ultimoBackup: this.state.ultimoBackup,
            temDadosParaSalvar: !!this.state.dadosParaSalvar,
            tentativasAtual: this.state.tentativasSalvamento,
            operacoes: 'salvamento + sincronização + backup local',
            vantagens: [
                'Servidor no Brasil (baixa latência)',
                'SQL nativo',
                'Interface moderna',
                'Sem problemas CORS',
                'Backup local sempre funcional'
            ]
        };
    },

    // 🚀 INDICADORES VISUAIS (reutilizados)
    _mostrarIndicadorSalvamento(texto) {
        this._ocultarIndicadorSalvamento();
        
        this.state.indicadorSalvamento = document.createElement('div');
        this.state.indicadorSalvamento.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2001;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            max-width: 300px;
        `;
        
        this.state.indicadorSalvamento.innerHTML = `
            <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite;"></div>
            <span>${texto}</span>
        `;
        
        document.body.appendChild(this.state.indicadorSalvamento);
    },

    _ocultarIndicadorSalvamento() {
        if (this.state.indicadorSalvamento && this.state.indicadorSalvamento.parentElement) {
            this.state.indicadorSalvamento.remove();
            this.state.indicadorSalvamento = null;
        }
    },

    // 🚀 INICIALIZAÇÃO
    init() {
        // Verificar usuário na inicialização
        this._verificarUsuarioLogado();
        
        // Listener de visibilidade para sincronização
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.state.ultimaVerificacaoUsuario = null; // Limpar cache
                this.sincronizarDados();
            }
        });
        
        // Salvamento antes de sair
        window.addEventListener('beforeunload', (e) => {
            if (this.state.dadosParaSalvar && this._verificarUsuarioLogado()) {
                this._salvarBackupLocal(this.state.dadosParaSalvar);
            }
        });
        
        console.log('💾 Persistence Supabase v1.0 inicializada!');
        console.log('🚀 Servidor: Brasil | Banco: Supabase | Fallback: localStorage');
    }
};

// ✅ FUNÇÕES GLOBAIS DE COMPATIBILIDADE
window.salvarDados = () => Persistence.salvarDados();
window.salvarDadosCritico = () => Persistence.salvarDadosCritico();
window.salvarDadosImediato = () => Persistence.salvarDadosCritico();

// ✅ EXPOSIÇÃO GLOBAL
window.Persistence = Persistence;

// 🧪 DEBUG SUPABASE
window.Persistence_Debug = {
    status: () => Persistence.obterStatus(),
    testarConexao: () => Persistence._testarConexaoSupabase(),
    sincronizar: () => Persistence.sincronizarDados(),
    backup: () => Persistence.recuperarBackupLocal(),
    usuario: () => {
        const usuario = Persistence._verificarUsuarioLogado();
        console.log('👤 Usuário logado:', usuario?.email || 'Nenhum');
        return usuario;
    },
    limparCache: () => {
        Persistence.state.ultimaVerificacaoUsuario = null;
        Persistence.state.usuarioAtual = null;
        console.log('🗑️ Cache usuário limpo!');
    },
    testarSalvamento: async () => {
        console.log('🧪 Testando salvamento Supabase...');
        
        try {
            const resultado = await Persistence.salvarDadosCritico();
            console.log('✅ Salvamento funcionando! Resultado:', resultado);
            return true;
        } catch (error) {
            console.error('❌ Erro no salvamento:', error);
            return false;
        }
    }
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    Persistence.init();
});

// CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('🚀 Persistence Supabase PURO v1.0 carregado!');
console.log('💡 Comandos: Persistence_Debug.status() | testarSalvamento() | sincronizar()');

/*
🎯 PERSISTENCE SUPABASE PURO v1.0

✅ CARACTERÍSTICAS:
- 🚀 Apenas Supabase (sem Firebase problemático)
- 🇧🇷 Servidor no Brasil (latência baixa)
- 💾 Backup local sempre funcional
- 🔄 Sincronização bidirecional
- ⚡ Performance otimizada
- 🛡️ Fallbacks inteligentes

✅ FLUXO:
1. Verificar usuário logado (cached)
2. Tentar Supabase (timeout 5s)
3. Fallback localStorage sempre
4. Sincronização automática

✅ VANTAGENS:
- Sem problemas CORS
- SQL nativo flexível
- Interface moderna Supabase
- Backup automático
- Zero dependência Firebase

🚀 PRONTO PARA USAR!
*/