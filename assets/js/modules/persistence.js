/* ========== 💾 SISTEMA DE PERSISTÊNCIA ULTRA-ROBUSTA v6.2 ========== */

const Persistence = {
    // ✅ CONFIGURAÇÕES
    config: {
        MAX_TENTATIVAS: 3,
        TIMEOUT_OPERACAO: 10000, // 10 segundos
        INTERVALO_RETRY: 1000, // 1 segundo base
        BACKUP_LOCAL_KEY: 'sistemaBackup',
        VERSAO_BACKUP: '6.2'
    },

    // ✅ ESTADO INTERNO
    state: {
        salvandoTimeout: null,
        dadosParaSalvar: null,
        tentativasSalvamento: 0,
        indicadorSalvamento: null,
        operacoesEmAndamento: new Set(),
        ultimoBackup: null
    },

    // ✅ SALVAMENTO PADRÃO (com timeout para otimização)
    salvarDados() {
        if (!App.usuarioAtual) {
            console.warn('⚠️ Tentativa de salvamento sem usuário autenticado');
            return Promise.reject('Usuário não autenticado');
        }
        
        clearTimeout(this.state.salvandoTimeout);
        this.state.dadosParaSalvar = { ...App.dados };
        
        this.state.salvandoTimeout = setTimeout(() => {
            this._executarSalvamento();
        }, 500);

        return Promise.resolve();
    },

    // ✅ SALVAMENTO CRÍTICO IMEDIATO (para eventos/atividades importantes)
    async salvarDadosCritico() {
        if (!App.usuarioAtual) {
            Notifications.error('Usuário não autenticado!');
            return Promise.reject('Usuário não autenticado');
        }
        
        const operacaoId = 'critico-' + Date.now();
        
        try {
            this.state.operacoesEmAndamento.add(operacaoId);
            
            clearTimeout(this.state.salvandoTimeout);
            this.state.dadosParaSalvar = { ...App.dados };
            this.state.tentativasSalvamento = 0;
            
            this._mostrarIndicadorSalvamento('Salvando...');
            
            const resultado = await this._executarSalvamentoCritico();
            
            this.state.operacoesEmAndamento.delete(operacaoId);
            return resultado;
            
        } catch (error) {
            this.state.operacoesEmAndamento.delete(operacaoId);
            throw error;
        }
    },

    // ✅ EXECUÇÃO ROBUSTA COM RETRY E VALIDAÇÃO
    async _executarSalvamentoCritico() {
        return new Promise((resolve, reject) => {
            if (!this.state.dadosParaSalvar) {
                this._ocultarIndicadorSalvamento();
                reject('Nenhum dado para salvar');
                return;
            }
            
            try {
                // Preparar dados para salvamento
                const dadosPreparados = this._prepararDadosParaSalvamento(this.state.dadosParaSalvar);
                
                // ✅ BACKUP LOCAL ANTES DE SALVAR
                this._salvarBackupLocal(dadosPreparados);
                
                // Executar salvamento no Firebase
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
                Notifications.error('Erro crítico no salvamento!');
                reject(error);
            }
        });
    },

    // ✅ SALVAMENTO TRADICIONAL (otimizado)
    async _executarSalvamento() {
        if (!this.state.dadosParaSalvar) return;
        
        try {
            const dadosPreparados = this._prepararDadosParaSalvamento(this.state.dadosParaSalvar);
            
            await database.ref('dados').set(dadosPreparados);
            
            this.state.dadosParaSalvar = null;
            console.log('✅ Salvamento automático concluído');
            
        } catch (error) {
            console.error('⚠️ Erro no salvamento automático:', error);
            Notifications.warning('Erro no salvamento automático');
            
            // Tentar novamente em 5 segundos
            setTimeout(() => {
                if (this.state.dadosParaSalvar) {
                    this._executarSalvamento();
                }
            }, 5000);
        }
    },

    // ✅ PREPARAR DADOS PARA SALVAMENTO
    _prepararDadosParaSalvamento(dados) {
        const dadosPreparados = {
            ...dados,
            ultimaAtualizacao: new Date().toISOString(),
            ultimoUsuario: App.estadoSistema.usuarioEmail,
            versao: FIREBASE_CONFIG.VERSAO_DB,
            checksum: this._calcularChecksum(dados)
        };

        // Validar integridade
        if (!this._validarIntegridade(dadosPreparados)) {
            throw new Error('Falha na validação de integridade dos dados');
        }

        return dadosPreparados;
    },

    // ✅ CALLBACKS DE SUCESSO E ERRO
    _onSalvamentoSucesso() {
        this.state.dadosParaSalvar = null;
        this.state.tentativasSalvamento = 0;
        this._ocultarIndicadorSalvamento();
        Notifications.success('✅ Dados salvos com sucesso!');
        
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
            Notifications.error(`❌ Falha ao salvar após ${this.config.MAX_TENTATIVAS} tentativas!`);
            this._mostrarOpcoesRecuperacao();
            reject(error);
        }
    },

    // ✅ BACKUP LOCAL PARA SEGURANÇA
    _salvarBackupLocal(dados) {
        try {
            const backup = {
                dados: dados,
                timestamp: new Date().toISOString(),
                versao: this.config.VERSAO_BACKUP,
                usuario: App.estadoSistema.usuarioEmail,
                checksum: this._calcularChecksum(dados)
            };
            
            // Usar sessionStorage para não persistir entre sessões
            sessionStorage.setItem(this.config.BACKUP_LOCAL_KEY, JSON.stringify(backup));
            
            // Também salvar no localStorage como backup secundário
            Helpers.storage.set('sistemaBackupSecundario', backup);
            
            console.log('💾 Backup local criado');
            
        } catch (error) {
            console.warn('⚠️ Não foi possível criar backup local:', error);
        }
    },

    // ✅ RECUPERAÇÃO DE BACKUP
    recuperarBackupLocal() {
        try {
            // Tentar sessionStorage primeiro
            const backupSession = sessionStorage.getItem(this.config.BACKUP_LOCAL_KEY);
            if (backupSession) {
                const dadosBackup = JSON.parse(backupSession);
                if (this._validarBackup(dadosBackup)) {
                    return dadosBackup.dados;
                }
            }
            
            // Tentar localStorage como fallback
            const backupLocal = Helpers.storage.get('sistemaBackupSecundario');
            if (backupLocal && this._validarBackup(backupLocal)) {
                return backupLocal.dados;
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao recuperar backup local:', error);
        }
        
        return null;
    },

    // ✅ VALIDAÇÃO DE BACKUP
    _validarBackup(backup) {
        if (!backup || !backup.dados || !backup.timestamp || !backup.checksum) {
            return false;
        }
        
        // Verificar se o backup não é muito antigo (máximo 24 horas)
        const timestampBackup = new Date(backup.timestamp);
        const agora = new Date();
        const diferencaHoras = (agora - timestampBackup) / (1000 * 60 * 60);
        
        if (diferencaHoras > 24) {
            console.warn('⚠️ Backup muito antigo:', diferencaHoras, 'horas');
            return false;
        }
        
        // Verificar checksum se possível
        const checksumCalculado = this._calcularChecksum(backup.dados);
        if (backup.checksum && backup.checksum !== checksumCalculado) {
            console.warn('⚠️ Checksum do backup não confere');
            return false;
        }
        
        return true;
    },

    // ✅ CALCULAR CHECKSUM SIMPLES
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
            console.warn('⚠️ Erro ao calcular checksum:', error);
            return Date.now().toString();
        }
    },

    // ✅ VALIDAR INTEGRIDADE DOS DADOS
    _validarIntegridade(dados) {
        try {
            // Verificações básicas
            if (!dados || typeof dados !== 'object') return false;
            if (!dados.areas || typeof dados.areas !== 'object') return false;
            if (!dados.eventos || !Array.isArray(dados.eventos)) return false;
            if (!dados.versao || dados.versao < 1) return false;
            
            // Verificar estrutura das áreas
            for (const [chave, area] of Object.entries(dados.areas)) {
                if (!area.nome || !area.equipe || !area.atividades) return false;
                if (!Array.isArray(area.equipe) || !Array.isArray(area.atividades)) return false;
            }
            
            // Verificar estrutura dos eventos
            for (const evento of dados.eventos) {
                if (!evento.id || !evento.titulo || !evento.data) return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro na validação de integridade:', error);
            return false;
        }
    },

    // ✅ INDICADOR VISUAL DE SALVAMENTO
    _mostrarIndicadorSalvamento(texto) {
        // Remover indicador anterior se existir
        this._ocultarIndicadorSalvamento();
        
        this.state.indicadorSalvamento = document.createElement('div');
        this.state.indicadorSalvamento.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #3b82f6;
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
            <span>${Helpers.sanitizeHTML(texto)}</span>
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

    // ✅ OPÇÕES DE RECUPERAÇÃO EM CASO DE FALHA
    _mostrarOpcoesRecuperacao() {
        const modalRecuperacao = document.createElement('div');
        modalRecuperacao.className = 'modal active';
        modalRecuperacao.style.zIndex = '4000';
        
        modalRecuperacao.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="color: #ef4444; margin-bottom: 16px;">⚠️ Falha no Salvamento</h3>
                <p style="margin-bottom: 16px;">Não foi possível salvar os dados no servidor após várias tentativas.</p>
                <p style="margin-bottom: 20px; font-size: 14px; color: #6b7280;">
                    Suas alterações estão preservadas localmente. Escolha uma opção:
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-primary" onclick="Persistence._tentarSalvarNovamente(this)">
                        🔄 Tentar Salvar Novamente
                    </button>
                    <button class="btn btn-warning" onclick="Persistence._exportarDadosLocal(this)">
                        💾 Exportar Dados como Backup
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

    // ✅ AÇÕES DO MODAL DE RECUPERAÇÃO
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
            const nomeArquivo = `backup_sistema_${timestamp}_${Date.now()}.json`;
            
            Helpers.downloadFile(dadosExport, nomeArquivo, 'application/json');
            
            modal.remove();
            Notifications.success('📁 Backup exportado com sucesso!');
            
        } catch (error) {
            Notifications.error('Erro ao exportar backup');
            console.error('Erro export:', error);
        }
    },

    _continuarSemSalvar(botao) {
        const modal = botao.closest('.modal');
        modal.remove();
        Notifications.warning('⚠️ Continuando sem salvar - RISCO DE PERDA DE DADOS!');
    },

    _usarBackupLocal(botao) {
        const modal = botao.closest('.modal');
        
        const backup = this.recuperarBackupLocal();
        if (backup) {
            App.dados = backup;
            App.renderizarDashboard();
            modal.remove();
            Notifications.success('📂 Backup local restaurado com sucesso!');
        } else {
            Notifications.error('Nenhum backup local válido encontrado');
        }
    },

    // ✅ VERIFICAÇÃO DE CONECTIVIDADE
    async verificarConectividade() {
        try {
            const snapshot = await database.ref('.info/connected').once('value');
            return snapshot.val() === true;
        } catch (error) {
            console.warn('Erro ao verificar conectividade:', error);
            return false;
        }
    },

    // ✅ SINCRONIZAÇÃO DE DADOS
    async sincronizarDados() {
        try {
            console.log('🔄 Sincronizando dados...');
            
            const conectado = await this.verificarConectividade();
            if (!conectado) {
                Notifications.warning('Sem conexão - usando dados locais');
                return false;
            }
            
            const snapshot = await database.ref('dados').once('value');
            const dadosRemoto = snapshot.val();
            
            if (dadosRemoto) {
                // Verificar se os dados remotos são mais recentes
                const timestampLocal = new Date(App.dados?.ultimaAtualizacao || 0);
                const timestampRemoto = new Date(dadosRemoto.ultimaAtualizacao || 0);
                
                if (timestampRemoto > timestampLocal) {
                    App.dados = dadosRemoto;
                    App.renderizarDashboard();
                    Notifications.info('📥 Dados atualizados do servidor');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
            Notifications.warning('Erro na sincronização de dados');
            return false;
        }
    },

    // ✅ LIMPEZA DE DADOS ANTIGOS
    limparDadosAntigos() {
        try {
            // Limpar sessionStorage antigo
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('sistema') && key !== this.config.BACKUP_LOCAL_KEY) {
                    sessionStorage.removeItem(key);
                }
            });
            
            // Limpar localStorage antigo (manter apenas backup secundário)
            const backupSecundario = Helpers.storage.get('sistemaBackupSecundario');
            Helpers.storage.clear();
            if (backupSecundario) {
                Helpers.storage.set('sistemaBackupSecundario', backupSecundario);
            }
            
            console.log('🧹 Limpeza de dados antigos concluída');
            
        } catch (error) {
            console.warn('Erro na limpeza de dados:', error);
        }
    },

    // ✅ STATUS DO SISTEMA DE PERSISTÊNCIA
    obterStatus() {
        return {
            operacoesEmAndamento: this.state.operacoesEmAndamento.size,
            ultimoBackup: this.state.ultimoBackup,
            temDadosParaSalvar: !!this.state.dadosParaSalvar,
            tentativasAtual: this.state.tentativasSalvamento,
            conectividadeFirebase: null // Será preenchido assincronamente
        };
    },

    // ✅ FUNÇÃO DE INICIALIZAÇÃO
    init() {
        console.log('💾 Inicializando sistema de persistência...');
        
        // Limpar dados antigos na inicialização
        this.limparDadosAntigos();
        
        // Configurar listeners de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.state.dadosParaSalvar) {
                // Página voltou a ser visível, sincronizar dados
                this.sincronizarDados();
            }
        });
        
        // Salvamento antes de sair da página
        window.addEventListener('beforeunload', (e) => {
            if (this.state.dadosParaSalvar && App.usuarioAtual) {
                // Forçar salvamento síncrono
                navigator.sendBeacon && navigator.sendBeacon('/save-data', JSON.stringify(this.state.dadosParaSalvar));
                
                // Backup de emergência
                this._salvarBackupLocal(this.state.dadosParaSalvar);
                
                e.preventDefault();
                e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
                return e.returnValue;
            }
        });
        
        console.log('✅ Sistema de persistência inicializado');
    }
};

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
window.salvarDados = () => Persistence.salvarDados();
window.salvarDadosCritico = () => Persistence.salvarDadosCritico();
window.salvarDadosImediato = () => Persistence.salvarDadosCritico(); // Alias

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    Persistence.init();
});

console.log('💾 Sistema de Persistência Ultra-Robusta v6.2 carregado!');
