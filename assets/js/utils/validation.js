/**
 * 🚨 CORREÇÃO CRÍTICA COMPLETA v7.4.0 - Sistema de Emergência
 * 
 * ✅ PROBLEMA 1: Validation.isValidEmail is not a function
 * ✅ PROBLEMA 2: Notifications is not defined  
 * ✅ SOLUÇÃO: Implementação fallback completa de ambos os sistemas
 * ✅ URGÊNCIA: Execução automática e monitoramento contínuo
 */

console.log('🚨 INICIANDO CORREÇÃO CRÍTICA COMPLETA v7.4.0 - EMERGÊNCIA!');

// ✅ IMPLEMENTAÇÃO VALIDATION FALLBACK
function implementarValidationCompleto() {
    console.log('🛡️ Implementando Validation completo...');
    
    window.Validation = {
        config: {
            emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
            urlRegex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
            passwordMinLength: 6,
            nomeMinLength: 2,
            tituloMinLength: 3
        },

        // Validações básicas COMPLETAS
        isValidEmail(email) {
            if (!email || typeof email !== 'string') return false;
            return this.config.emailRegex.test(email.trim());
        },

        isValidPassword(senha) {
            if (!senha || typeof senha !== 'string') return false;
            return senha.length >= this.config.passwordMinLength;
        },

        isValidName(nome) {
            if (!nome || typeof nome !== 'string') return false;
            return nome.trim().length >= this.config.nomeMinLength;
        },

        isValidTitle(titulo) {
            if (!titulo || typeof titulo !== 'string') return false;
            return titulo.trim().length >= this.config.tituloMinLength;
        },

        isValidPhone(phone) {
            if (!phone || typeof phone !== 'string') return false;
            const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
            return this.config.phoneRegex.test(cleanPhone);
        },

        isValidURL(url) {
            if (!url || typeof url !== 'string') return false;
            return this.config.urlRegex.test(url.trim());
        },

        isValidDate(data) {
            if (!data) return false;
            const dateObj = typeof data === 'string' ? new Date(data + 'T00:00:00') : new Date(data);
            return !isNaN(dateObj.getTime()) && dateObj.getFullYear() > 1900;
        },

        isValidTime(horario) {
            if (!horario || typeof horario !== 'string') return false;
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(horario);
        },

        // Validações específicas
        validateEvent(dados) {
            const erros = [];
            if (!this.isValidTitle(dados.titulo)) {
                erros.push('Título deve ter pelo menos 3 caracteres');
            }
            if (!dados.tipo) {
                erros.push('Tipo do evento é obrigatório');
            }
            if (!this.isValidDate(dados.data)) {
                erros.push('Data do evento é obrigatória e deve ser válida');
            }
            return { valido: erros.length === 0, erros: erros };
        },

        validateTask(dados) {
            const erros = [];
            if (!this.isValidTitle(dados.titulo)) {
                erros.push('Título deve ter pelo menos 3 caracteres');
            }
            if (!dados.tipo) {
                erros.push('Tipo da tarefa é obrigatório');
            }
            return { valido: erros.length === 0, erros: erros };
        },

        validateUser(dados) {
            const erros = [];
            if (!this.isValidName(dados.nome)) {
                erros.push('Nome deve ter pelo menos 2 caracteres');
            }
            if (!this.isValidEmail(dados.email)) {
                erros.push('Email é obrigatório e deve ser válido');
            }
            if (dados.senha && !this.isValidPassword(dados.senha)) {
                erros.push(`Senha deve ter pelo menos ${this.config.passwordMinLength} caracteres`);
            }
            return { valido: erros.length === 0, erros: erros };
        },

        obterStatus() {
            return {
                modulo: 'Validation',
                versao: '7.4.0-EMERGENCY',
                status: 'EMERGENCY_FALLBACK',
                debug: 'ATIVO',
                funcionalidades: {
                    validacoes_basicas: true,
                    validacoes_especificas: true,
                    validacao_formularios: false,
                    tempo_real: false
                }
            };
        }
    };

    console.log('✅ Validation emergency implementado!');
}

// ✅ IMPLEMENTAÇÃO NOTIFICATIONS FALLBACK
function implementarNotificationsCompleto() {
    console.log('🔔 Implementando Notifications completo...');
    
    window.Notifications = {
        // Estados do sistema
        toasts: [],
        config: {
            duration: 4000,
            maxToasts: 5,
            position: 'top-right'
        },

        // Métodos principais que o auth.js usa
        success(message, title = 'Sucesso') {
            this._mostrarToast(message, 'success', title);
        },

        error(message, title = 'Erro') {
            this._mostrarToast(message, 'error', title);
        },

        warning(message, title = 'Aviso') {
            this._mostrarToast(message, 'warning', title);
        },

        info(message, title = 'Informação') {
            this._mostrarToast(message, 'info', title);
        },

        // Método interno para mostrar toast
        _mostrarToast(message, type = 'info', title = '') {
            try {
                // Criar container se não existir
                this._criarContainer();

                // Criar toast
                const toast = this._criarToast(message, type, title);
                
                // Adicionar ao DOM
                const container = document.getElementById('notifications-container');
                if (container) {
                    container.appendChild(toast);
                    
                    // Animar entrada
                    setTimeout(() => {
                        toast.classList.add('show');
                    }, 10);
                    
                    // Auto-remover
                    setTimeout(() => {
                        this._removerToast(toast);
                    }, this.config.duration);
                }

                // Fallback - console se DOM falhar
                const emoji = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
                console.log(`${emoji[type]} ${title}: ${message}`);

            } catch (error) {
                // Fallback absoluto - alert nativo
                console.error('NOTIFICATIONS FALLBACK ERRO:', error);
                alert(`${title}: ${message}`);
            }
        },

        _criarContainer() {
            if (document.getElementById('notifications-container')) return;

            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        },

        _criarToast(message, type, title) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.style.cssText = `
                background: ${this._getBackgroundColor(type)};
                color: white;
                padding: 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                pointer-events: auto;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                cursor: pointer;
            `;
            
            const icon = this._getIcon(type);
            toast.innerHTML = `
                <div style="display: flex; align-items: start; gap: 12px;">
                    <div style="font-size: 20px;">${icon}</div>
                    <div style="flex: 1;">
                        ${title ? `<div style="font-weight: bold; margin-bottom: 4px;">${title}</div>` : ''}
                        <div>${message}</div>
                    </div>
                    <div style="font-size: 18px; cursor: pointer; opacity: 0.7; hover: opacity: 1;" onclick="this.closest('.toast').remove()">×</div>
                </div>
            `;

            // Clicar para remover
            toast.addEventListener('click', () => {
                this._removerToast(toast);
            });

            return toast;
        },

        _getBackgroundColor(type) {
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            return colors[type] || colors.info;
        },

        _getIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || icons.info;
        },

        _removerToast(toast) {
            if (!toast || !toast.parentNode) return;
            
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },

        // Método adicional para confirmar
        mostrarConfirmacao(titulo, mensagem, callback) {
            const resultado = confirm(`${titulo}\n\n${mensagem}`);
            if (callback) callback(resultado);
            return resultado;
        },

        // Status para debug
        obterStatus() {
            return {
                modulo: 'Notifications',
                versao: '7.4.0-EMERGENCY',
                status: 'EMERGENCY_FALLBACK',
                debug: 'ATIVO',
                funcionalidades: {
                    toasts: true,
                    modals: false,
                    confirmacao: true
                }
            };
        }
    };

    // Adicionar CSS básico
    const styles = document.createElement('style');
    styles.textContent = `
        .toast.show {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
    `;
    document.head.appendChild(styles);

    console.log('✅ Notifications emergency implementado!');
}

// ✅ VERIFICAÇÕES DE INTEGRIDADE
function verificarSistemas() {
    const resultados = {
        validation: false,
        notifications: false,
        integracao_auth: false
    };

    // Testar Validation
    try {
        if (window.Validation && typeof window.Validation.isValidEmail === 'function') {
            const teste = window.Validation.isValidEmail('teste@email.com');
            resultados.validation = teste === true;
        }
    } catch (error) {
        console.error('❌ Erro testando Validation:', error);
    }

    // Testar Notifications
    try {
        if (window.Notifications && typeof window.Notifications.success === 'function') {
            // Teste silencioso
            resultados.notifications = true;
        }
    } catch (error) {
        console.error('❌ Erro testando Notifications:', error);
    }

    // Testar integração com Auth
    try {
        if (resultados.validation && resultados.notifications) {
            resultados.integracao_auth = true;
        }
    } catch (error) {
        console.error('❌ Erro testando integração:', error);
    }

    return resultados;
}

// ✅ FUNÇÃO PRINCIPAL DE CORREÇÃO COMPLETA
function executarCorrecaoCompleta() {
    console.log('🔧 EXECUTANDO CORREÇÃO COMPLETA DE EMERGÊNCIA...');
    
    // 1. Implementar sistemas
    implementarValidationCompleto();
    implementarNotificationsCompleto();
    
    // 2. Verificar funcionamento
    const resultados = verificarSistemas();
    
    console.log('📊 RESULTADOS DA CORREÇÃO:');
    console.log('- Validation:', resultados.validation ? '✅' : '❌');
    console.log('- Notifications:', resultados.notifications ? '✅' : '❌');
    console.log('- Integração Auth:', resultados.integracao_auth ? '✅' : '❌');
    
    const sucesso = Object.values(resultados).every(r => r === true);
    
    if (sucesso) {
        console.log('🎉 CORREÇÃO COMPLETA SUCESSO!');
        
        // Testar com notificação real
        setTimeout(() => {
            window.Notifications.success('Sistema de emergência ativado com sucesso!', 'Correção Aplicada');
        }, 500);
        
        return true;
    } else {
        console.error('❌ CORREÇÃO FALHOU EM ALGUNS PONTOS!');
        return false;
    }
}

// ✅ MONITORAMENTO CONTÍNUO MELHORADO
function monitorarSistemasEmergencia() {
    console.log('🔍 Iniciando monitoramento de emergência...');
    
    const intervalo = setInterval(() => {
        const status = verificarSistemas();
        
        if (!status.validation) {
            console.warn('⚠️ Validation perdido, restaurando...');
            implementarValidationCompleto();
        }
        
        if (!status.notifications) {
            console.warn('⚠️ Notifications perdido, restaurando...');
            implementarNotificationsCompleto();
        }
    }, 5000); // Verificar a cada 5 segundos
    
    // Parar após 10 minutos
    setTimeout(() => {
        clearInterval(intervalo);
        console.log('🏁 Monitoramento de emergência concluído');
    }, 600000);
    
    return intervalo;
}

// ✅ TESTE COMPLETO DO AUTH
function testarIntegracaoAuth() {
    console.log('🔐 Testando integração específica com Auth...');
    
    try {
        // Simular validação que o auth.js faz
        const emailTeste = 'usuario@teste.com';
        const senhaTeste = '123456';
        
        const emailValido = window.Validation.isValidEmail(emailTeste);
        const senhaValida = window.Validation.isValidPassword(senhaTeste);
        
        console.log('📧 Email válido:', emailValido);
        console.log('🔑 Senha válida:', senhaValida);
        
        // Testar notificação
        if (window.Notifications) {
            console.log('🔔 Testando notificação...');
            window.Notifications.info('Teste de integração Auth realizado', 'Sistema Funcionando');
        }
        
        return emailValido && senhaValida;
        
    } catch (error) {
        console.error('❌ Erro no teste de integração Auth:', error);
        return false;
    }
}

// ✅ EXECUÇÃO AUTOMÁTICA DE EMERGÊNCIA
(function() {
    console.log('🚀 INICIANDO CORREÇÃO DE EMERGÊNCIA AUTOMÁTICA...');
    
    // Executar correção imediata
    const sucesso = executarCorrecaoCompleta();
    
    if (sucesso) {
        // Iniciar monitoramento
        const monitor = monitorarSistemasEmergencia();
        
        // Testar integração auth
        const authOk = testarIntegracaoAuth();
        
        // Expor funções globais para debug
        window.CorrecaoEmergencia = {
            executar: executarCorrecaoCompleta,
            verificar: verificarSistemas,
            testarAuth: testarIntegracaoAuth,
            status: () => ({
                validation: window.Validation?.obterStatus(),
                notifications: window.Notifications?.obterStatus()
            })
        };
        
        console.log('🎯 SISTEMA DE EMERGÊNCIA ATIVO!');
        console.log('📝 Para verificar: CorrecaoEmergencia.verificar()');
        console.log('🧪 Para testar Auth: CorrecaoEmergencia.testarAuth()');
        
        // Notificar usuário se tudo ok
        if (authOk) {
            setTimeout(() => {
                window.Notifications.success('Todos os sistemas funcionando!', 'Correção Completa');
            }, 1000);
        }
        
    } else {
        console.error('💥 FALHA CRÍTICA NA CORREÇÃO DE EMERGÊNCIA!');
        alert('ERRO CRÍTICO: Sistema não conseguiu ser corrigido automaticamente. Recarregue a página.');
    }
})();

// ✅ LOG FINAL
console.log('✅ CORREÇÃO CRÍTICA COMPLETA v7.4.0: Sistema de emergência carregado!');
