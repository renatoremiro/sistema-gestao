/**
 * 💾 Sistema de Persistência v8.2 - EVENTOS GLOBAIS COMPLEMENTO
 * 
 * 🔥 CORREÇÃO INTEGRADA: Funciona com modo anônimo do app.js v8.2
 * ✅ SALVAMENTO PROTEGIDO: Apenas usuários autenticados
 * ✅ LEITURA LIVRE: Backup e recuperação funcionam sempre
 * ✅ VALIDAÇÃO ROBUSTA: Dados limpos e seguros
 */

const Persistence = {
    // ✅ CONFIGURAÇÕES
    config: {
        MAX_TENTATIVAS: 3,
        TIMEOUT_OPERACAO: 10000, // 10 segundos
        INTERVALO_RETRY: 1000, // 1 segundo base
        BACKUP_LOCAL_KEY: 'sistemaBackup',
        VERSAO_BACKUP: '8.2.0'
    },

    // ✅ ESTADO INTERNO
    state: {
        salvandoTimeout: null,
        dadosParaSalvar: null,
        tentativasSalvamento: 0,
        indicadorSalvamento: null,
        operacoesEmAndamento: new Set(),
        ultimoBackup: null,
        conectividade: null,
        modoAnonimo: false
    },

    // 🔥 VERIFICAR MODO ANÔNIMO
    _verificarModoAnonimo() {
        // Integração com App v8.2
        if (typeof App !== 'undefined' && App.estadoSistema) {
            this.state.modoAnonimo = App.estadoSistema.modoAnonimo;
            return this.state.modoAnonimo;
        }
        
        // Fallback: verificar se há usuário autenticado
        this.state.modoAnonimo = !App?.usuarioAtual;
        return this.state.modoAnonimo;
    },

    // ✅ SALVAMENTO PADRÃO - PROTEGIDO POR AUTH
    salvarDados() {
        // 🔥 VERIFICAÇÃO DE MODO ANÔNIMO
        if (this._verificarModoAnonimo()) {
            console.warn('⚠️ Salvamento bloqueado: modo anônimo');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Login necessário para salvar dados');
            }
            return Promise.reject('Login necessário para salvar');
        }
        
        clearTimeout(this.state.salvandoTimeout);
        this.state.dadosParaSalvar = { ...App.dados };
        
        this.state.salvandoTimeout = setTimeout(() => {
            this._executarSalvamento();
        }, 500);

        return Promise.resolve();
    },

    // 🔥 SALVAMENTO CRÍTICO IMEDIATO - PROTEGIDO POR AUTH v8.2
    async salvarDadosCritico() {
        // 🔥 VERIFICAÇÃO PRIORITÁRIA DE MODO ANÔNIMO
        if (this._verificarModoAnonimo()) {
            console.warn('⚠️ Salvamento crítico bloqueado: modo anônimo');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Login necessário para salvar eventos');
            }
            return Promise.reject('Login necessário para salvar');
        }
        
        const operacaoId = 'critico-' + Date.now();
        
        try {
            this.state.operacoesEmAndamento.add(operacaoId);
            
            clearTimeout(this.state.salvandoTimeout);
            this.state.dadosParaSalvar = { ...App.dados };
            this.state.tentativasSalvamento = 0;
            
            this._mostrarIndicadorSalvamento('Salvando eventos...');
            
            const resultado = await this._executarSalvamentoCritico();
            
            this.state.operacoesEmAndamento.delete(operacaoId);
            return resultado;
            
        } catch (error) {
            this.state.operacoesEmAndamento.delete(operacaoId);
            throw error;
        }
    },

    // 🔥 EXECUÇÃO ROBUSTA COM RETRY - CORRIGIDA v8.2
    async _executarSalvamentoCritico() {
        return new Promise((resolve, reject) => {
            if (!this.state.dadosParaSalvar) {
                this._ocultarIndicadorSalvamento();
                reject('Nenhum dado para salvar');
                return;
            }
            
            // 🔥 VERIFICAÇÃO DUPLA DE MODO ANÔNIMO
            if (this._verificarModoAnonimo()) {
                this._ocultarIndicadorSalvamento();
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('⚠️ Login necessário para salvar');
                }
                reject('Login necessário para salvar');
                return;
            }
            
            try {
                // 🔥 PREPARAR DADOS LIMPOS (mantém função v8.0)
                const dadosPreparados = this._prepararDadosLimpos(this.state.dadosParaSalvar);
                
                // Backup local antes de salvar
                this._salvarBackupLocal(dadosPreparados);
                
                // Executar salvamento no Firebase
                if (!database) {
                    this._ocultarIndicadorSalvamento();
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Firebase não configurado');
                    }
                    reject('Firebase não configurado');
                    return;
                }

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout na operação')), this.config.TIMEOUT_OPERACAO);
                });

                const savePromise = database.ref('dados').set(dadosPreparados);
                
                Promise.race([savePromise, timeoutPromise])
                    .then(() => {
                        this._onSalvamentoSucesso();
                        resolve('Sucesso');
                    })
                    .catch((error) => {
                        this._onSalvamentoErro(error, resolve, reject);
                    });
                    
            } catch (error) {
                console.error('❌ Erro crítico no salvamento:', error);
                this._ocultarIndicadorSalvamento();
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Erro crítico no salvamento!');
                }
                reject(error);
            }
        });
    },

    // ✅ SALVAMENTO TRADICIONAL - PROTEGIDO
    async _executarSalvamento() {
        if (!this.state.dadosParaSalvar) return;
        
        // 🔥 VERIFICAÇÃO DE MODO ANÔNIMO
        if (this._verificarModoAnonimo()) {
            console.warn('⚠️ Salvamento automático bloqueado: modo anônimo');
            return;
        }

        try {
            if (!database) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Firebase não configurado');
                }
                return;
            }
            
            // 🔥 USAR DADOS LIMPOS (sem corrupção)
            const dadosPreparados = this._prepararDadosLimpos(this.state.dadosParaSalvar);

            await database.ref('dados').set(dadosPreparados);
            
            this.state.dadosParaSalvar = null;
            // Silencioso em produção
            
        } catch (error) {
            // Tentar novamente em 5 segundos silenciosamente
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Erro no salvamento automático');
            }
            
            setTimeout(() => {
                if (this.state.dadosParaSalvar && !this._verificarModoAnonimo()) {
                    this._executarSalvamento();
                }
            }, 5000);
        }
    },

    // 🔥 NOVA FUNÇÃO v8.2: PREPARAR DADOS LIMPOS (mantém lógica v8.0)
    _prepararDadosLimpos(dados) {
        // 🎯 SALVAMENTO DIRETO - SEM CONVERSÕES QUE CORROMPEM DADOS
        const dadosLimpos = {
            // Áreas: manter como está
            areas: dados.areas || {},
            
            // 🔥 EVENTOS: SALVAMENTO DIRETO (SEM CONVERSÃO)
            eventos: dados.eventos || [],
            
            // Tarefas: manter como está
            tarefas: dados.tarefas || [],
            
            // Usuários: manter estrutura simples
            usuarios: dados.usuarios || {},
            
            // Metadata
            metadata: {
                ultimaAtualizacao: new Date().toISOString(),
                ultimoUsuario: this._obterUsuarioAtual(),
                versao: '8.2.0',
                totalEventos: (dados.eventos || []).length,
                totalAreas: Object.keys(dados.areas || {}).length,
                modoSalvamento: 'autenticado'
            },
            
            // Versão e checksum
            versao: '8.2.0',
            checksum: this._calcularChecksum(dados)
        };

        // 🔥 VALIDAÇÃO SIMPLES (sem conversões)
        if (!this._validarDadosLimpos(dadosLimpos)) {
            throw new Error('Falha na validação de dados limpos');
        }

        return dadosLimpos;
    },

    // 🔥 VALIDAÇÃO SIMPLES (mantém lógica v8.0)
    _validarDadosLimpos(dados) {
        try {
            // Verificações básicas
            if (!dados || typeof dados !== 'object') return false;
            if (!dados.areas || typeof dados.areas !== 'object') return false;
            if (!dados.eventos || !Array.isArray(dados.eventos)) return false;
            if (!dados.versao) return false;
            
            // Verificar eventos (crítico)
            for (const evento of dados.eventos) {
                if (!evento.id || !evento.titulo || !evento.data) {
                    console.warn('⚠️ Evento inválido encontrado:', evento);
                    return false;
                }
                
                // Verificar se participantes é array válido
                if (evento.participantes && !Array.isArray(evento.participantes)) {
                    console.warn('⚠️ Participantes inválidos:', evento.participantes);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro na validação:', error);
            return false;
        }
    },

    // ✅ CALLBACKS DE SUCESSO E ERRO - OTIMIZADOS
    _onSalvamentoSucesso() {
        this.state.dadosParaSalvar = null;
        this.state.tentativasSalvamento = 0;
        this._ocultarIndicadorSalvamento();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('✅ Eventos salvos com sucesso!');
        }
        
        // Atualizar timestamp do último backup
        this.state.ultimoBackup = new Date().toISOString();
    },

    _onSalvamentoErro(error, resolve, reject) {
        console.error('❌ Erro ao salvar:', error);
        this.state.tentativasSalvamento++;
        
        if (this.state.tentativasSalvamento < this.config.MAX_TENTATIVAS) {
            const tentativaAtual = this.state.tentativasSalvamento + 1;
            this._mostrarIndicadorSalvamento(`Tentativa ${tentativaAtual}/${this.config.MAX_TENTATIVAS}...`);
            
            // Retry com backoff exponencial
            const delay = this.config.INTERVALO_RETRY * Math.pow(2, this.state.tentativasSalvamento - 1);
            
            setTimeout(() => {
                this._executarSalvamentoCritico().then(resolve).catch(reject);
            }, delay);
        } else {
            this._ocultarIndicadorSalvamento();
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`❌ Falha ao salvar após ${this.config.MAX_TENTATIVAS} tentativas!`);
            }
            this._mostrarOpcoesRecuperacao();
            reject(error);
        }
    },

    // 🔥 BACKUP LOCAL PARA SEGURANÇA - SEMPRE PERMITIDO (LEITURA)
    _salvarBackupLocal(dados) {
        try {
            const backup = {
                dados: dados,
                timestamp: new Date().toISOString(),
                versao: this.config.VERSAO_BACKUP,
                usuario: this._obterUsuarioAtual(),
                checksum: this._calcularChecksum(dados),
                modoAnonimo: this.state.modoAnonimo
            };
            
            // Usar sessionStorage para não persistir entre sessões
            sessionStorage.setItem(this.config.BACKUP_LOCAL_KEY, JSON.stringify(backup));
            
            // Também salvar no localStorage como backup secundário
            if (typeof Helpers !== 'undefined' && Helpers.storage) {
                Helpers.storage.set('sistemaBackupSecundario', backup);
            }
            
        } catch (error) {
            // Silencioso - backup local é opcional
        }
    },

    // 🔥 RECUPERAÇÃO DE BACKUP - SEMPRE PERMITIDA (LEITURA)
    recuperarBackupLocal() {
        try {
            // Tentar sessionStorage primeiro
            const backupSession = sessionStorage.getItem(this.config.BACKUP_LOCAL_KEY);
            if (backupSession) {
                const dadosBackup = JSON.parse(backupSession);
                if (this._validarBackup(dadosBackup)) {
                    console.log('📂 Backup local recuperado com sucesso');
                    return dadosBackup.dados;
                }
            }
            
            // Tentar localStorage como fallback
            if (typeof Helpers !== 'undefined' && Helpers.storage) {
                const backupLocal = Helpers.storage.get('sistemaBackupSecundario');
                if (backupLocal && this._validarBackup(backupLocal)) {
                    console.log('📂 Backup secundário recuperado');
                    return backupLocal.dados;
                }
            }
            
        } catch (error) {
            // Silencioso - backup pode não existir
        }
        
        return null;
    },

    // ✅ VALIDAÇÃO DE BACKUP - OTIMIZADA
    _validarBackup(backup) {
        if (!backup || !backup.dados || !backup.timestamp || !backup.checksum) {
            return false;
        }
        
        // Verificar se o backup não é muito antigo (máximo 24 horas)
        const timestampBackup = new Date(backup.timestamp);
        const agora = new Date();
        const diferencaHoras = (agora - timestampBackup) / (1000 * 60 * 60);
        
        if (diferencaHoras > 24) {
            return false;
        }
        
        // Verificar checksum se possível
        const checksumCalculado = this._calcularChecksum(backup.dados);
        if (backup.checksum && backup.checksum !== checksumCalculado) {
            return false;
        }
        
        return true;
    },

    // ✅ CALCULAR CHECKSUM SIMPLES - OTIMIZADO
    _calcularChecksum(dados) {
        try {
            const dadosString = JSON.stringify(dados);
            let hash = 0;
            
            for (let i = 0; i < dadosString.length; i++) {
                const char = dadosString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Converter para 32-bit integer
            }
            
            return hash.toString();
        } catch (error) {
            return Date.now().toString();
        }
    },

    // ✅ INDICADOR VISUAL DE SALVAMENTO - OTIMIZADO
    _mostrarIndicadorSalvamento(texto) {
        // Remover indicador anterior se existir
        this._ocultarIndicadorSalvamento();
        
        this.state.indicadorSalvamento = document.createElement('div');
        this.state.indicadorSalvamento.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2001;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        this.state.indicadorSalvamento.innerHTML = `
            <div class="loading"></div>
            <span>${typeof Helpers !== 'undefined' && Helpers.sanitizeHTML ? Helpers.sanitizeHTML(texto) : texto}</span>
        `;
        
        document.body.appendChild(this.state.indicadorSalvamento);
    },

    _ocultarIndicadorSalvamento() {
        if (this.state.indicadorSalvamento && this.state.indicadorSalvamento.parentElement) {
            this.state.indicadorSalvamento.style.animation = 'slideOut 0.3s ease-in';
            
            setTimeout(() => {
                if (this.state.indicadorSalvamento && this.state.indicadorSalvamento.parentElement) {
                    this.state.indicadorSalvamento.parentElement.removeChild(this.state.indicadorSalvamento);
                    this.state.indicadorSalvamento = null;
                }
            }, 300);
        }
    },

    // ✅ OPÇÕES DE RECUPERAÇÃO EM CASO DE FALHA - OTIMIZADAS (mantém v8.0)
    _mostrarOpcoesRecuperacao() {
        const modalRecuperacao = document.createElement('div');
        modalRecuperacao.className = 'modal active';
        modalRecuperacao.style.zIndex = '4000';
        
        modalRecuperacao.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="color: #ef4444; margin-bottom: 16px;">⚠️ Falha no Salvamento de Eventos</h3>
                <p style="margin-bottom: 16px;">Não foi possível salvar os eventos no servidor após várias tentativas.</p>
                <p style="margin-bottom: 20px; font-size: 14px; color: #6b7280;">
                    Seus eventos estão preservados localmente. Escolha uma opção:
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-primary" onclick="Persistence._tentarSalvarNovamente(this)">
                        🔄 Tentar Salvar Novamente
                    </button>
                    <button class="btn btn-warning" onclick="Persistence._exportarDadosLocal(this)">
                        💾 Exportar Eventos como Backup
                    </button>
                    <button class="btn btn-secondary" onclick="Persistence._continuarSemSalvar(this)">
                        ⚠️ Continuar sem Salvar (Risco de Perda)
                    </button>
                    <button class="btn btn-success" onclick="Persistence._usarBackupLocal(this)">
                        📂 Restaurar do Backup Local
                    </button>
                </div>
                
                <div style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 6px; font-size: 12px; color: #6b7280;">
                    💡 <strong>Dica:</strong> Verifique sua conexão com a internet e tente novamente.
                </div>
            </div>
        `;
        
        document.body.appendChild(modalRecuperacao);
    },

    // ✅ AÇÕES DO MODAL DE RECUPERAÇÃO (mantém v8.0)
    _tentarSalvarNovamente(botao) {
        const modal = botao.closest('.modal');
        modal.remove();
        this.salvarDadosCritico();
    },

    _exportarDadosLocal(botao) {
        const modal = botao.closest('.modal');
        
        try {
            const dadosExport = JSON.stringify(App.dados, null, 2);
            const timestamp = new Date().toISOString().split('T')[0];
            const nomeArquivo = `backup_eventos_${timestamp}_${Date.now()}.json`;
            
            if (typeof Helpers !== 'undefined' && Helpers.downloadFile) {
                Helpers.downloadFile(dadosExport, nomeArquivo, 'application/json');
            }
            
            modal.remove();
            if (typeof Notifications !== 'undefined') {
                Notifications.success('📁 Backup de eventos exportado!');
            }
            
        } catch (error) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao exportar backup');
            }
            console.error('Erro export:', error);
        }
    },

    _continuarSemSalvar(botao) {
        const modal = botao.closest('.modal');
        modal.remove();
        if (typeof Notifications !== 'undefined') {
            Notifications.warning('⚠️ Eventos podem ser perdidos ao recarregar!');
        }
    },

    _usarBackupLocal(botao) {
        const modal = botao.closest('.modal');
        
        const backup = this.recuperarBackupLocal();
        if (backup) {
            App.dados = backup;
            if (typeof App.renderizarDashboard === 'function') {
                App.renderizarDashboard();
            }
            modal.remove();
            if (typeof Notifications !== 'undefined') {
                Notifications.success('📂 Backup de eventos restaurado!');
            }
        } else {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Nenhum backup de eventos encontrado');
            }
        }
    },

    // ✅ VERIFICAÇÃO DE CONECTIVIDADE - SEMPRE PERMITIDA
    async verificarConectividade() {
        try {
            if (typeof database !== 'undefined' && database) {
                const snapshot = await database.ref('.info/connected').once('value');
                this.state.conectividade = snapshot.val() === true;
                return this.state.conectividade;
            }
            this.state.conectividade = false;
            return false;
        } catch (error) {
            this.state.conectividade = false;
            return false;
        }
    },

    // 🔥 SINCRONIZAÇÃO DE DADOS - SEMPRE PERMITIDA (LEITURA)
    async sincronizarDados() {
        try {
            const conectado = await this.verificarConectividade();
            if (!conectado) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Sem conexão - usando dados locais');
                }
                return false;
            }
            
            if (typeof database !== 'undefined' && database) {
                const snapshot = await database.ref('dados').once('value');
                const dadosRemoto = snapshot.val();
                
                if (dadosRemoto) {
                    // Verificar se os dados remotos são mais recentes
                    const timestampLocal = new Date(App.dados?.metadata?.ultimaAtualizacao || 0);
                    const timestampRemoto = new Date(dadosRemoto.metadata?.ultimaAtualizacao || 0);
                    
                    if (timestampRemoto > timestampLocal) {
                        App.dados = dadosRemoto;
                        if (typeof App.renderizarDashboard === 'function') {
                            App.renderizarDashboard();
                        }
                        if (typeof Notifications !== 'undefined') {
                            Notifications.info('📥 Eventos atualizados do servidor');
                        }
                        return true;
                    }
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Erro na sincronização de eventos');
            }
            return false;
        }
    },

    // 🔥 OBTER USUÁRIO ATUAL (integração com v8.2)
    _obterUsuarioAtual() {
        try {
            if (typeof App !== 'undefined' && App.usuarioAtual) {
                return App.usuarioAtual.email || App.usuarioAtual.displayName || 'Sistema';
            }
            if (typeof Auth !== 'undefined' && Auth.obterUsuario) {
                const usuario = Auth.obterUsuario();
                return usuario?.email || usuario?.displayName || 'Sistema';
            }
            return this.state.modoAnonimo ? 'Anônimo' : 'Sistema';
        } catch {
            return this.state.modoAnonimo ? 'Anônimo' : 'Sistema';
        }
    },

    // ✅ STATUS DO SISTEMA DE PERSISTÊNCIA v8.2
    obterStatus() {
        return {
            operacoesEmAndamento: this.state.operacoesEmAndamento.size,
            ultimoBackup: this.state.ultimoBackup,
            temDadosParaSalvar: !!this.state.dadosParaSalvar,
            tentativasAtual: this.state.tentativasSalvamento,
            conectividadeFirebase: this.state.conectividade,
            versaoBackup: this.config.VERSAO_BACKUP,
            modoAnonimo: this.state.modoAnonimo,
            permissoes: {
                leitura: true,
                escrita: !this.state.modoAnonimo,
                backup: true,
                sincronizacao: true
            },
            integracao: {
                appV82: typeof App !== 'undefined',
                authSistema: typeof Auth !== 'undefined'
            }
        };
    },

    // ✅ FUNÇÃO DE INICIALIZAÇÃO - OTIMIZADA v8.2
    init() {
        // Detectar modo anônimo na inicialização
        this._verificarModoAnonimo();
        
        // Configurar listeners de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Página voltou a ser visível, sincronizar dados (sempre permitido)
                this.sincronizarDados();
            }
        });
        
        // Salvamento antes de sair da página (apenas se autenticado)
        window.addEventListener('beforeunload', (e) => {
            if (this.state.dadosParaSalvar && !this._verificarModoAnonimo()) {
                // Backup de emergência
                this._salvarBackupLocal(this.state.dadosParaSalvar);
                
                e.preventDefault();
                e.returnValue = 'Você tem eventos não salvos. Deseja realmente sair?';
                return e.returnValue;
            }
        });
        
        console.log('💾 Persistence v8.2 inicializado - modo:', this.state.modoAnonimo ? 'anônimo' : 'autenticado');
    }
};

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
window.salvarDados = () => Persistence.salvarDados();
window.salvarDadosCritico = () => Persistence.salvarDadosCritico();
window.salvarDadosImediato = () => Persistence.salvarDadosCritico(); // Alias

// ✅ EXPOSIÇÃO GLOBAL DO PERSISTENCE
window.Persistence = Persistence;

// ✅ FUNÇÃO GLOBAL PARA DEBUG - OTIMIZADA v8.2
window.Persistence_Debug = {
    status: () => Persistence.obterStatus(),
    conectividade: () => Persistence.verificarConectividade(),
    sincronizar: () => Persistence.sincronizarDados(),
    backup: () => Persistence.recuperarBackupLocal(),
    modoAnonimo: () => Persistence._verificarModoAnonimo(),
    testarSalvamento: async () => {
        console.log('🧪 Testando salvamento de eventos...');
        console.log('Modo anônimo:', Persistence._verificarModoAnonimo());
        
        if (Persistence._verificarModoAnonimo()) {
            console.log('⚠️ Salvamento bloqueado: modo anônimo');
            return false;
        }
        
        try {
            await Persistence.salvarDadosCritico();
            console.log('✅ Salvamento funcionando!');
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

// ✅ LOG FINAL OTIMIZADO - PRODUCTION READY v8.2
console.log('💾 Persistence.js v8.2 - EVENTOS GLOBAIS COMPLEMENTO!');

/*
🔥 INTEGRAÇÕES v8.2:
- _verificarModoAnonimo(): Integração com App.estadoSistema ✅
- Salvamento protegido por verificação de modo anônimo ✅
- Leitura e backup sempre permitidos ✅
- Sincronização independente de auth ✅
- Debug incluí verificação de modo ✅
- Status mostra permissões granulares ✅

📊 RESULTADO DEFINITIVO:
- Persistência funciona com modo anônimo ✅
- Salvamento seguro apenas para autenticados ✅
- Backup e recuperação sempre disponíveis ✅
- Sistema v8.2 COMPLETO E INTEGRADO ✅
- CORREÇÃO APLICADA DEFINITIVAMENTE ✅
*/
