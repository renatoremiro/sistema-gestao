/* ========== 🔔 SISTEMA DE NOTIFICAÇÕES v6.2 ========== */

const Notifications = {
    // ✅ CONFIGURAÇÕES
    config: {
        duracao: {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000
        },
        maxNotificacoes: 5,
        posicao: 'top-right' // top-right, top-left, bottom-right, bottom-left
    },

    // ✅ QUEUE DE NOTIFICAÇÕES
    queue: [],
    ativas: new Set(),

    // ✅ MOSTRAR NOTIFICAÇÃO PRINCIPAL
    mostrarNotificacao(texto, tipo = 'success', duracao = null) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (!notification || !notificationText) {
            console.warn('Elementos de notificação não encontrados');
            return this.mostrarNotificacaoToast(texto, tipo, duracao);
        }

        // Definir duracao se não especificada
        if (!duracao) {
            duracao = this.config.duracao[tipo] || this.config.duracao.info;
        }

        // Limpar classes anteriores
        notification.className = 'notification';
        
        // Adicionar classe do tipo
        if (tipo !== 'success') {
            notification.classList.add(tipo);
        }
        
        // Definir texto e mostrar
        notificationText.textContent = texto;
        notification.classList.add('active');
        
        // Auto-ocultar
        setTimeout(() => {
            this.ocultarNotificacao();
        }, duracao);
        
        // Log para debug
        console.log(`📢 ${tipo.toUpperCase()}: ${texto}`);
    },

    // ✅ OCULTAR NOTIFICAÇÃO PRINCIPAL
    ocultarNotificacao() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('active');
        }
    },

    // ✅ NOTIFICAÇÕES TOAST (múltiplas)
    mostrarNotificacaoToast(texto, tipo = 'success', duracao = null) {
        // Limitar número de notificações
        if (this.ativas.size >= this.config.maxNotificacoes) {
            this.queue.push({ texto, tipo, duracao });
            return;
        }

        const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        if (!duracao) {
            duracao = this.config.duracao[tipo] || this.config.duracao.info;
        }

        // Criar elemento da notificação
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast toast-${tipo}`;
        toast.style.cssText = `
            position: fixed;
            top: ${20 + this.ativas.size * 70}px;
            right: 20px;
            background: ${this.getBackgroundColor(tipo)};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideInToast 0.3s ease-out;
        `;

        // Ícone baseado no tipo
        const icone = this.getIcone(tipo);
        
        // Botão de fechar
        const btnFechar = document.createElement('button');
        btnFechar.innerHTML = '×';
        btnFechar.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            line-height: 1;
        `;
        
        btnFechar.onclick = () => this.removerToast(id);

        toast.innerHTML = `
            <span style="font-size: 18px;">${icone}</span>
            <span style="flex: 1;">${Helpers.sanitizeHTML(texto)}</span>
        `;
        toast.appendChild(btnFechar);

        // Adicionar ao DOM
        document.body.appendChild(toast);
        this.ativas.add(id);

        // Auto-remover
        setTimeout(() => {
            this.removerToast(id);
        }, duracao);

        // Log para debug
        console.log(`📢 TOAST ${tipo.toUpperCase()}: ${texto}`);
    },

    // ✅ REMOVER TOAST
    removerToast(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.style.animation = 'slideOutToast 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
                this.ativas.delete(id);
                this.reposicionarToasts();
                this.processarQueue();
            }, 300);
        }
    },

    // ✅ REPOSICIONAR TOASTS
    reposicionarToasts() {
        let index = 0;
        this.ativas.forEach(id => {
            const toast = document.getElementById(id);
            if (toast) {
                toast.style.top = `${20 + index * 70}px`;
                index++;
            }
        });
    },

    // ✅ PROCESSAR QUEUE
    processarQueue() {
        if (this.queue.length > 0 && this.ativas.size < this.config.maxNotificacoes) {
            const proxima = this.queue.shift();
            this.mostrarNotificacaoToast(proxima.texto, proxima.tipo, proxima.duracao);
        }
    },

    // ✅ OBTER COR DE FUNDO POR TIPO
    getBackgroundColor(tipo) {
        const cores = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return cores[tipo] || cores.info;
    },

    // ✅ OBTER ÍCONE POR TIPO
    getIcone(tipo) {
        const icones = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icones[tipo] || icones.info;
    },

    // ✅ NOTIFICAÇÕES ESPECÍFICAS
    success(texto, duracao = null) {
        this.mostrarNotificacao(texto, 'success', duracao);
    },

    error(texto, duracao = null) {
        this.mostrarNotificacao(texto, 'error', duracao);
    },

    warning(texto, duracao = null) {
        this.mostrarNotificacao(texto, 'warning', duracao);
    },

    info(texto, duracao = null) {
        this.mostrarNotificacao(texto, 'info', duracao);
    },

    // ✅ NOTIFICAÇÃO DE SALVAMENTO
    salvando(texto = 'Salvando...') {
        return this.mostrarNotificacaoPersistente(texto, 'info', '💾');
    },

    salvo(texto = 'Salvo com sucesso!') {
        this.success(texto);
    },

    erroSalvamento(texto = 'Erro ao salvar!') {
        this.error(texto);
    },

    // ✅ NOTIFICAÇÃO PERSISTENTE (até ser removida manualmente)
    mostrarNotificacaoPersistente(texto, tipo = 'info', icone = null) {
        const id = 'persistent-' + Date.now();
        
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification-persistent notification-${tipo}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${this.getBackgroundColor(tipo)};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3500;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideInToast 0.3s ease-out;
        `;

        const iconeFinal = icone || this.getIcone(tipo);
        
        notification.innerHTML = `
            <span style="font-size: 18px;">${iconeFinal}</span>
            <span>${Helpers.sanitizeHTML(texto)}</span>
            <div class="loading" style="margin-left: 8px;"></div>
        `;

        document.body.appendChild(notification);
        
        // Retornar objeto para controle
        return {
            id: id,
            element: notification,
            remove: () => this.removerNotificacaoPersistente(id),
            update: (novoTexto) => {
                const textSpan = notification.querySelector('span:nth-child(2)');
                if (textSpan) {
                    textSpan.textContent = novoTexto;
                }
            }
        };
    },

    // ✅ REMOVER NOTIFICAÇÃO PERSISTENTE
    removerNotificacaoPersistente(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.style.animation = 'slideOutToast 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    },

    // ✅ NOTIFICAÇÃO DE CONFIRMAÇÃO
    confirmar(titulo, mensagem, callback) {
        const id = 'confirm-' + Date.now();
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-confirmacao';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 4000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%; text-align: center;">
                <h3 style="margin-bottom: 16px; color: #1f2937;">${titulo}</h3>
                <p style="margin-bottom: 24px; color: #6b7280;">${mensagem}</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="${id}-cancelar" class="btn btn-secondary">Cancelar</button>
                    <button id="${id}-confirmar" class="btn btn-primary">Confirmar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById(`${id}-cancelar`).onclick = () => {
            document.body.removeChild(modal);
            if (callback) callback(false);
        };
        
        document.getElementById(`${id}-confirmar`).onclick = () => {
            document.body.removeChild(modal);
            if (callback) callback(true);
        };
        
        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEsc);
                if (callback) callback(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
    },

    // ✅ LIMPAR TODAS AS NOTIFICAÇÕES
    limparTodas() {
        // Remover notificação principal
        this.ocultarNotificacao();
        
        // Remover toasts
        this.ativas.forEach(id => {
            this.removerToast(id);
        });
        
        // Limpar queue
        this.queue = [];
        
        // Remover persistentes
        document.querySelectorAll('.notification-persistent').forEach(el => {
            if (el.parentElement) {
                el.parentElement.removeChild(el);
            }
        });
    }
};

// ✅ ADICIONAR ESTILOS CSS PARA ANIMAÇÕES
if (!document.getElementById('notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        @keyframes slideInToast {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutToast {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styles);
}

// ✅ EXPORTAR FUNÇÃO GLOBAL PARA COMPATIBILIDADE
window.mostrarNotificacao = (texto, tipo, duracao) => {
    Notifications.mostrarNotificacao(texto, tipo, duracao);
};

console.log('🔔 Sistema de Notificações v6.2 carregado!');
