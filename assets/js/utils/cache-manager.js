/**
 * 🧹 CACHE MANAGER BIAPO - SISTEMA ANTI-CACHE
 * 
 * Previne problemas de cache no Firebase e sistema
 * Salvar como: assets/js/utils/cache-manager.js
 */

const CacheManagerBiapo = {
    
    // ⚙️ CONFIGURAÇÃO
    config: {
        versaoSistema: '8.3.0',
        versaoCache: '001',
        intervaloLimpeza: 24 * 60 * 60 * 1000, // 24 horas
        forcarLimpezaStartup: true,
        debugMode: false
    },
    
    // 📊 ESTADO
    estado: {
        ultimaLimpeza: null,
        cacheItems: 0,
        limpezasPendentes: [],
        sistemaInicializado: false
    },

    // 🚀 INICIALIZAR SISTEMA ANTI-CACHE
    inicializar() {
        try {
            console.log('🧹 Inicializando Cache Manager BIAPO v8.3...');
            
            // Verificar se precisa limpar cache
            this._verificarNecessidadeLimpeza();
            
            // Configurar limpeza automática
            this._configurarLimpezaAutomatica();
            
            // Configurar listeners de mudança
            this._configurarListeners();
            
            // Limpar cache obsoleto na inicialização
            if (this.config.forcarLimpezaStartup) {
                this.limpezaCacheCompleta();
            }
            
            this.estado.sistemaInicializado = true;
            console.log('✅ Cache Manager BIAPO inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Cache Manager:', error);
        }
    },

    // 🔍 VERIFICAR NECESSIDADE DE LIMPEZA
    _verificarNecessidadeLimpeza() {
        try {
            const ultimaLimpeza = localStorage.getItem('biapo_ultima_limpeza_cache');
            const versaoAnterior = localStorage.getItem('biapo_versao_sistema');
            
            if (!ultimaLimpeza || versaoAnterior !== this.config.versaoSistema) {
                console.log('🧹 Limpeza necessária: Primeira vez ou versão alterada');
                this.estado.limpezasPendentes.push('versao_alterada');
            }
            
            if (ultimaLimpeza) {
                const tempoDecorrido = Date.now() - parseInt(ultimaLimpeza);
                if (tempoDecorrido > this.config.intervaloLimpeza) {
                    console.log('🧹 Limpeza necessária: Tempo limite excedido');
                    this.estado.limpezasPendentes.push('tempo_limite');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na verificação de limpeza:', error);
        }
    },

    // 🔄 CONFIGURAR LIMPEZA AUTOMÁTICA
    _configurarLimpezaAutomatica() {
        // Limpeza a cada 6 horas
        setInterval(() => {
            this.limpezaCacheInteligente();
        }, 6 * 60 * 60 * 1000);
        
        // Limpeza antes de fechar página
        window.addEventListener('beforeunload', () => {
            this.limpezaCacheRapida();
        });
        
        console.log('🔄 Limpeza automática configurada');
    },

    // 👂 CONFIGURAR LISTENERS
    _configurarListeners() {
        // Detectar mudanças no Firebase
        if (typeof database !== 'undefined') {
            database.ref('.info/connected').on('value', (snapshot) => {
                if (snapshot.val() === true) {
                    console.log('🔥 Firebase reconectado - verificando cache...');
                    this.verificarCacheFirebase();
                }
            });
        }
        
        // Detectar mudanças de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Página voltou a ficar visível
                this.verificarCacheFirebase();
            }
        });
    },

    // 🧹 LIMPEZA CACHE COMPLETA
    limpezaCacheCompleta() {
        try {
            console.log('🧹 Iniciando limpeza completa de cache...');
            
            let itensLimpos = 0;
            
            // 1. Limpar cache do navegador
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        if (cacheName.includes('biapo') || cacheName.includes('firebase')) {
                            caches.delete(cacheName);
                            itensLimpos++;
                        }
                    });
                });
            }
            
            // 2. Limpar localStorage obsoleto
            itensLimpos += this._limparLocalStorageObsoleto();
            
            // 3. Limpar sessionStorage
            if (sessionStorage) {
                const sessaoAntes = sessionStorage.length;
                for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const key = sessionStorage.key(i);
                    if (key && (key.includes('firebase') || key.includes('biapo_temp'))) {
                        sessionStorage.removeItem(key);
                        itensLimpos++;
                    }
                }
            }
            
            // 4. Forçar reconexão Firebase
            this._forcarReconexaoFirebase();
            
            // 5. Atualizar registro de limpeza
            localStorage.setItem('biapo_ultima_limpeza_cache', Date.now().toString());
            localStorage.setItem('biapo_versao_sistema', this.config.versaoSistema);
            
            this.estado.ultimaLimpeza = new Date().toISOString();
            this.estado.cacheItems = itensLimpos;
            
            console.log(`✅ Limpeza completa: ${itensLimpos} itens removidos`);
            
        } catch (error) {
            console.error('❌ Erro na limpeza completa:', error);
        }
    },

    // 🔧 LIMPEZA CACHE INTELIGENTE
    limpezaCacheInteligente() {
        try {
            console.log('🔧 Limpeza inteligente de cache...');
            
            // Limpar apenas itens temporários e obsoletos
            let itensLimpos = 0;
            
            // localStorage temporário
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (
                    key.includes('temp_') || 
                    key.includes('cache_') || 
                    key.includes('backup_temp') ||
                    key.startsWith('firebase:previous_websocket_failure')
                )) {
                    localStorage.removeItem(key);
                    itensLimpos++;
                }
            }
            
            // Verificar idade dos backups
            this._limparBackupsAntigos();
            
            console.log(`✅ Limpeza inteligente: ${itensLimpos} itens temporários removidos`);
            
        } catch (error) {
            console.warn('⚠️ Erro na limpeza inteligente:', error);
        }
    },

    // ⚡ LIMPEZA CACHE RÁPIDA
    limpezaCacheRapida() {
        try {
            // Limpar apenas cache de sessão
            const itensParaRemover = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('temp_')) {
                    itensParaRemover.push(key);
                }
            }
            
            itensParaRemover.forEach(key => localStorage.removeItem(key));
            
            if (itensParaRemover.length > 0) {
                console.log(`⚡ Limpeza rápida: ${itensParaRemover.length} itens temporários`);
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na limpeza rápida:', error);
        }
    },

    // 🔥 VERIFICAR CACHE FIREBASE
    verificarCacheFirebase() {
        try {
            if (typeof database === 'undefined') return;
            
            // Forçar refresh de conexão se detectar problemas
            const agora = Date.now();
            const ultimaVerificacao = localStorage.getItem('biapo_ultima_verificacao_firebase');
            
            if (!ultimaVerificacao || (agora - parseInt(ultimaVerificacao)) > 60000) { // 1 minuto
                this._forcarReconexaoFirebase();
                localStorage.setItem('biapo_ultima_verificacao_firebase', agora.toString());
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na verificação Firebase:', error);
        }
    },

    // 🔄 FORÇAR RECONEXÃO FIREBASE
    _forcarReconexaoFirebase() {
        try {
            if (typeof database !== 'undefined') {
                console.log('🔄 Forçando reconexão Firebase...');
                
                database.goOffline();
                
                setTimeout(() => {
                    database.goOnline();
                    console.log('✅ Firebase reconectado');
                }, 1000);
            }
        } catch (error) {
            console.warn('⚠️ Erro na reconexão Firebase:', error);
        }
    },

    // 🗑️ LIMPAR LOCALSTORAGE OBSOLETO
    _limparLocalStorageObsoleto() {
        let itensLimpos = 0;
        
        try {
            const chavesPelaData = [];
            
            // Identificar itens obsoletos
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const valor = localStorage.getItem(key);
                    
                    // Tentar parsear como JSON para verificar timestamp
                    try {
                        const obj = JSON.parse(valor);
                        if (obj && obj.timestamp) {
                            const idade = Date.now() - new Date(obj.timestamp).getTime();
                            const umaSemana = 7 * 24 * 60 * 60 * 1000;
                            
                            if (idade > umaSemana) {
                                chavesPelaData.push(key);
                            }
                        }
                    } catch (e) {
                        // Não é JSON, verificar outros critérios
                        if (key.includes('firebase:') && !key.includes('config')) {
                            chavesPelaData.push(key);
                        }
                    }
                }
            }
            
            // Remover itens obsoletos
            chavesPelaData.forEach(key => {
                localStorage.removeItem(key);
                itensLimpos++;
            });
            
        } catch (error) {
            console.warn('⚠️ Erro ao limpar localStorage obsoleto:', error);
        }
        
        return itensLimpos;
    },

    // 🗂️ LIMPAR BACKUPS ANTIGOS
    _limparBackupsAntigos() {
        try {
            const backupsParaRemover = [];
            const limiteDias = 30; // Manter backups por 30 dias
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('backup_')) {
                    const valor = localStorage.getItem(key);
                    try {
                        const backup = JSON.parse(valor);
                        if (backup.timestamp) {
                            const idade = Date.now() - new Date(backup.timestamp).getTime();
                            const limiteTempo = limiteDias * 24 * 60 * 60 * 1000;
                            
                            if (idade > limiteTempo) {
                                backupsParaRemover.push(key);
                            }
                        }
                    } catch (e) {
                        // Backup inválido, remover
                        backupsParaRemover.push(key);
                    }
                }
            }
            
            backupsParaRemover.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Backup antigo removido: ${key}`);
            });
            
        } catch (error) {
            console.warn('⚠️ Erro ao limpar backups antigos:', error);
        }
    },

    // 🆘 EMERGÊNCIA - RESET COMPLETO
    resetCompleto() {
        try {
            console.warn('🆘 EXECUTANDO RESET COMPLETO...');
            
            // Confirmar com usuário
            const confirmacao = confirm(
                '⚠️ ATENÇÃO!\n\n' +
                'Isto irá limpar TODOS os dados em cache incluindo:\n' +
                '- Cache do Firebase\n' +
                '- Backups locais\n' +
                '- Configurações temporárias\n\n' +
                'Continuar?'
            );
            
            if (!confirmacao) {
                console.log('❌ Reset cancelado pelo usuário');
                return false;
            }
            
            // Salvar dados críticos
            const dadosCriticos = {};
            if (localStorage.getItem('ultimoUsuarioBiapo')) {
                dadosCriticos.ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
            }
            
            // Limpar tudo
            localStorage.clear();
            sessionStorage.clear();
            
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => caches.delete(cacheName));
                });
            }
            
            // Restaurar dados críticos
            if (dadosCriticos.ultimoUsuario) {
                localStorage.setItem('ultimoUsuarioBiapo', dadosCriticos.ultimoUsuario);
            }
            
            // Marcar reset
            localStorage.setItem('biapo_reset_completo', new Date().toISOString());
            localStorage.setItem('biapo_versao_sistema', this.config.versaoSistema);
            
            console.log('✅ Reset completo executado');
            console.log('🔄 Recarregue a página para aplicar mudanças');
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro no reset completo:', error);
            return false;
        }
    },

    // 📊 OBTER STATUS
    obterStatus() {
        const status = {
            versaoSistema: this.config.versaoSistema,
            sistemaInicializado: this.estado.sistemaInicializado,
            ultimaLimpeza: this.estado.ultimaLimpeza,
            itensCache: this.estado.cacheItems,
            tamanhoLocalStorage: this._calcularTamanhoLocalStorage(),
            tamanhoSessionStorage: this._calcularTamanhoSessionStorage(),
            limpezasPendentes: this.estado.limpezasPendentes.length
        };
        
        console.table(status);
        return status;
    },

    // 📏 CALCULAR TAMANHO LOCALSTORAGE
    _calcularTamanhoLocalStorage() {
        let tamanho = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    tamanho += localStorage[key].length + key.length;
                }
            }
        } catch (e) {
            tamanho = -1;
        }
        return `${(tamanho / 1024).toFixed(2)} KB`;
    },

    // 📏 CALCULAR TAMANHO SESSIONSTORAGE
    _calcularTamanhoSessionStorage() {
        let tamanho = 0;
        try {
            for (let key in sessionStorage) {
                if (sessionStorage.hasOwnProperty(key)) {
                    tamanho += sessionStorage[key].length + key.length;
                }
            }
        } catch (e) {
            tamanho = -1;
        }
        return `${(tamanho / 1024).toFixed(2)} KB`;
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.CacheManagerBiapo = CacheManagerBiapo;

// ✅ COMANDOS ÚTEIS
window.limparCache = () => CacheManagerBiapo.limpezaCacheCompleta();
window.limparCacheInteligente = () => CacheManagerBiapo.limpezaCacheInteligente();
window.statusCache = () => CacheManagerBiapo.obterStatus();
window.resetCompleto = () => CacheManagerBiapo.resetCompleto();

// ✅ INICIALIZAÇÃO AUTOMÁTICA
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => CacheManagerBiapo.inicializar(), 1000);
    });
} else {
    setTimeout(() => CacheManagerBiapo.inicializar(), 1000);
}

console.log('🧹 Cache Manager BIAPO v8.3 carregado!');
console.log('📋 Comandos: limparCache() | statusCache() | resetCompleto()');

/*
🧹 CACHE MANAGER BIAPO v8.3 - SISTEMA ANTI-CACHE

✅ FUNCIONALIDADES:
- Limpeza automática de cache Firebase
- Detecção de cache obsoleto
- Limpeza inteligente por idade/tipo
- Reset completo em emergência
- Monitoramento de tamanho
- Reconexão automática Firebase
- Backup de dados críticos

✅ COMANDOS DISPONÍVEIS:
- limparCache() → Limpeza completa
- limparCacheInteligente() → Limpeza seletiva
- statusCache() → Ver informações
- resetCompleto() → Reset total (cuidado!)

✅ AUTOMÁTICO:
- Limpeza a cada 6 horas
- Verificação na reconexão
- Limpeza na mudança de versão
- Limpeza ao fechar página

🎯 PREVINE:
- Problemas de cache Firebase
- Rules antigas em cache
- Dados obsoletos
- Conexões lentas
- Conflitos de versão
*/
