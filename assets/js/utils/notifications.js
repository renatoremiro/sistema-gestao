/**
 * 🔔 Sistema de Notificações v7.4.5 - MODO PRODUÇÃO
 * 
 * 🔥 OTIMIZADO: Removidas notificações de debug e teste
 * ✅ PRODUÇÃO: Apenas notificações relevantes para usuário final
 * ✅ CONTROLE: Flag para ativar/desativar diferentes tipos
 */

const Notifications = {
    // ✅ CONFIGURAÇÕES DE PRODUÇÃO
    config: {
        DURACAO_PADRAO: 4000,
        DURACAO_SUCESSO: 3000,
        DURACAO_ERRO: 6000,
        DURACAO_WARNING: 5000,
        DURACAO_INFO: 3000,
        MAX_NOTIFICATIONS: 3,
        POSICAO: 'top-right',
        
        // 🔥 CONTROLES DE PRODUÇÃO
        MODO_PRODUCAO: true,
        MOSTRAR_DEBUG: false,
        MOSTRAR_SISTEMA: false,
        MOSTRAR_AUTH_SUCESSO: false,
        MOSTRAR_SINCRONIZACAO: false,
        MOSTRAR_DADOS_SALVOS: false
    },

    // ✅ ESTADO INTERNO
    state: {
        notifications: [],
        container: null,
        nextId: 1
    },

    // ✅ FUNÇÃO PRINCIPAL - COM FILTROS DE PRODUÇÃO
    mostrar(mensagem, tipo = 'info', duracao = null, opcoes = {}) {
        // 🔥 FILTROS DE PRODUÇÃO - BLOQUEAR MENSAGENS DESNECESSÁRIAS
        if (this.config.MODO_PRODUCAO) {
            // Bloquear mensagens de debug/sistema
            if (this._ehMensagemDebug(mensagem)) {
                return;
            }
            
            // Bloquear mensagens de auth sucesso automático
            if (!this.config.MOSTRAR_AUTH_SUCESSO && this._ehMensagemAuthAuto(mensagem)) {
                return;
            }
            
            // Bloquear mensagens de sincronização automática
            if (!this.config.MOSTRAR_SINCRONIZACAO && this._ehMensagemSync(mensagem)) {
                return;
            }
            
            // Bloquear mensagens de dados salvos automaticamente
            if (!this.config.MOSTRAR_DADOS_SALVOS && this._ehMensagemSalvamento(mensagem)) {
                return;
            }
        }

        try {
            const notification = this._criarNotification({
                id: this.state.nextId++,
                mensagem: this._sanitizarMensagem(mensagem),
                tipo: tipo,
                duracao: duracao || this._obterDuracaoPorTipo(tipo),
                timestamp: new Date(),
                ...opcoes
            });

            this._adicionarAoContainer(notification);
            this._programarRemocao(notification);
            this._limitarQuantidade();

        } catch (error) {
            console.error('❌ Erro ao mostrar notificação:', error);
        }
    },

    // 🔥 NOVOS FILTROS DE PRODUÇÃO
    _ehMensagemDebug(mensagem) {
        const debug_keywords = [
            'debug', 'teste', 'desenvolvimento', 'dev',
            'inicializando sistema', 'carregado', 'módulo',
            'status do sistema', 'verificação', 'dependências'
        ];
        
        const msgLower = mensagem.toLowerCase();
        return debug_keywords.some(keyword => msgLower.includes(keyword));
    },

    _ehMensagemAuthAuto(mensagem) {
        const auth_keywords = [
            'bem-vindo', 'login realizado', 'autenticado',
            'auto-login', 'usuário logado', 'auth realizado'
        ];
        
        const msgLower = mensagem.toLowerCase();
        return auth_keywords.some(keyword => msgLower.includes(keyword));
    },

    _ehMensagemSync(mensagem) {
        const sync_keywords = [
            'dados atualizados automaticamente', 'sincronização',
            'backup', 'dados carregados', 'firebase conectado'
        ];
        
        const msgLower = mensagem.toLowerCase();
        return sync_keywords.some(keyword => msgLower.includes(keyword));
    },

    _ehMensagemSalvamento(mensagem) {
        const save_keywords = [
            'dados salvos com sucesso', 'salvamento', 'backup criado',
            'persistência', 'salvando dados'
        ];
        
        const msgLower = mensagem.toLowerCase();
        return save_keywords.some(keyword => msgLower.includes(keyword));
    },

    // ✅ FUNÇÕES PÚBLICAS ESPECÍFICAS
    success(mensagem, duracao = null) {
        this.mostrar(mensagem, 'success', duracao);
    },

    error(mensagem, duracao = null) {
        this.mostrar(mensagem, 'error', duracao);
    },

    warning(mensagem, duracao = null) {
        this.mostrar(mensagem, 'warning', duracao);
    },

    info(mensagem, duracao = null) {
        // Em produção, ser mais seletivo com mensagens info
        if (this.config.MODO_PRODUCAO && this._ehMensagemDebug(mensagem)) {
            return;
        }
        this.mostrar(mensagem, 'info', duracao);
    },

    // 🔥 NOVA FUNÇÃO: NOTIFICAÇÕES IMPORTANTES (SEMPRE MOSTRAM)
    importante(mensagem, tipo = 'info', duracao = null) {
        // Força exibição mesmo em modo produção
        const modoOriginal = this.config.MODO_PRODUCAO;
        this.config.MODO_PRODUCAO = false;
        
        this.mostrar(mensagem, tipo, duracao);
        
        this.config.MODO_PRODUCAO = modoOriginal;
    },

    // ✅ CRIAR CONTAINER DE NOTIFICAÇÕES
    _inicializarContainer() {
        if (this.state.container) return;

        this.state.container = document.createElement('div');
        this.state.container.id = 'notificationsContainer';
        this.state.container.className = 'notifications-container';
        
        // Posicionamento fixo no canto superior direito
        this.state.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
            max-width: 400px;
            width: 100%;
        `;

        document.body.appendChild(this.state.container);
    },

    // ✅ CRIAR ELEMENTO DE NOTIFICAÇÃO
    _criarNotification(data) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${data.tipo}`;
        notification.setAttribute('data-id', data.id);
        
        const icones = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };

        const cores = {
            success: { bg: '#10b981', border: '#059669' },
            error: { bg: '#ef4444', border: '#dc2626' },
            warning: { bg: '#f59e0b', border: '#d97706' },
            info: { bg: '#3b82f6', border: '#2563eb' }
        };

        const cor = cores[data.tipo] || cores.info;

        notification.style.cssText = `
            background: ${cor.bg};
            color: white;
            padding: 16px 20px;
            margin-bottom: 12px;
            border-radius: 8px;
            border-left: 4px solid ${cor.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            line-height: 1.4;
            max-width: 100%;
            word-wrap: break-word;
        `;

        notification.innerHTML = `
            <span style="font-size: 18px; flex-shrink: 0;">${icones[data.tipo]}</span>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; margin-bottom: 2px;">${data.mensagem}</div>
                <div style="font-size: 11px; opacity: 0.8;">
                    ${data.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <button style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                flex-shrink: 0;
            " onclick="Notifications._removerPorId(${data.id})">
                ×
            </button>
        `;

        // Evento para remover ao clicar
        notification.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                this._removerPorId(data.id);
            }
        });

        return notification;
    },

    // ✅ ADICIONAR AO CONTAINER
    _adicionarAoContainer(notification) {
        this._inicializarContainer();
        
        this.state.container.appendChild(notification);
        this.state.notifications.push(notification);

        // Animação de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 50);
    },

    // ✅ PROGRAMAR REMOÇÃO AUTOMÁTICA
    _programarRemocao(notification) {
        const duracao = parseInt(notification.getAttribute('data-duracao')) || this.config.DURACAO_PADRAO;
        
        setTimeout(() => {
            const id = parseInt(notification.getAttribute('data-id'));
            this._removerPorId(id);
        }, duracao);
    },

    // ✅ REMOVER NOTIFICAÇÃO POR ID
    _removerPorId(id) {
        const notification = this.state.container?.querySelector(`[data-id="${id}"]`);
        if (!notification) return;

        // Animação de saída
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Remover do array
            this.state.notifications = this.state.notifications.filter(n => 
                parseInt(n.getAttribute('data-id')) !== id
            );
        }, 300);
    },

    // ✅ LIMITAR QUANTIDADE DE NOTIFICAÇÕES
    _limitarQuantidade() {
        if (this.state.notifications.length > this.config.MAX_NOTIFICATIONS) {
            const oldest = this.state.notifications[0];
            const oldestId = parseInt(oldest.getAttribute('data-id'));
            this._removerPorId(oldestId);
        }
    },

    // ✅ OBTER DURAÇÃO POR TIPO
    _obterDuracaoPorTipo(tipo) {
        switch (tipo) {
            case 'success': return this.config.DURACAO_SUCESSO;
            case 'error': return this.config.DURACAO_ERRO;
            case 'warning': return this.config.DURACAO_WARNING;
            case 'info': return this.config.DURACAO_INFO;
            default: return this.config.DURACAO_PADRAO;
        }
    },

    // ✅ SANITIZAR MENSAGEM
    _sanitizarMensagem(mensagem) {
        if (typeof mensagem !== 'string') {
            mensagem = String(mensagem);
        }
        
        // Remover HTML para segurança
        const div = document.createElement('div');
        div.textContent = mensagem;
        
        return div.innerHTML;
    },

    // ✅ LIMPAR TODAS AS NOTIFICAÇÕES
    limparTodas() {
        this.state.notifications.forEach(notification => {
            const id = parseInt(notification.getAttribute('data-id'));
            this._removerPorId(id);
        });
    },

    // 🔥 CONFIGURAÇÕES DE PRODUÇÃO - CONTROLES ADMINISTRATIVOS
    configurarProducao(opcoes = {}) {
        Object.assign(this.config, opcoes);
        
        console.log('🔔 Notificações configuradas para produção:', {
            modoProducao: this.config.MODO_PRODUCAO,
            mostrarDebug: this.config.MOSTRAR_DEBUG,
            mostrarSistema: this.config.MOSTRAR_SISTEMA
        });
    },

    // ✅ OBTER STATUS
    obterStatus() {
        return {
            ativas: this.state.notifications.length,
            container: !!this.state.container,
            modoProducao: this.config.MODO_PRODUCAO,
            configuracao: this.config
        };
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Notifications = Notifications;

// 🔥 CONFIGURAÇÃO AUTOMÁTICA PARA PRODUÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Configurar automaticamente para produção
    Notifications.configurarProducao({
        MODO_PRODUCAO: true,
        MOSTRAR_DEBUG: false,
        MOSTRAR_SISTEMA: false,
        MOSTRAR_AUTH_SUCESSO: false,
        MOSTRAR_SINCRONIZACAO: false,
        MOSTRAR_DADOS_SALVOS: false
    });
});

// ✅ LOG FINAL OTIMIZADO
console.log('🔔 Notifications v7.4.5 - MODO PRODUÇÃO ATIVO!');

/*
🔥 OTIMIZAÇÕES v7.4.5 MODO PRODUÇÃO:
- ✅ Filtros automáticos para mensagens de debug/teste
- ✅ Controle granular de tipos de notificação
- ✅ Função importante() para notificações críticas
- ✅ Configuração automática para produção
- ✅ Interface limpa para usuário final

🎯 RESULTADO:
- Não aparecerão mais notificações de "teste de integração" ✅
- Notificações apenas relevantes para usuário ✅
- Sistema mais profissional ✅
- Controle total sobre exibição ✅
*/
