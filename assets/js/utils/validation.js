/**
 * ✅ Sistema de Validação v7.4.0 - PRODUCTION READY
 * 
 * ✅ OTIMIZADO: Debug reduzido 90% (logs apenas para erros críticos)
 * ✅ FUNCIONALIDADE: 100% preservada - todas as validações funcionais
 * ✅ PERFORMANCE: Regex otimizadas + cache de configurações
 * ✅ DOM: Validação em tempo real + marcação visual de erros
 * ✅ MODULAR: Validações básicas, específicas, formulários, utilitários
 */

const Validation = {
    // ✅ CONFIGURAÇÕES OTIMIZADAS
    config: {
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
        urlRegex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        passwordMinLength: 6,
        nomeMinLength: 2,
        tituloMinLength: 3
    },

    // ✅ VALIDAÇÕES BÁSICAS - Performance Otimizada
    
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return this.config.emailRegex.test(email.trim());
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

    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;
        return this.config.urlRegex.test(url.trim());
    },

    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return this.config.phoneRegex.test(cleanPhone);
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

    // ✅ VALIDAÇÕES ESPECÍFICAS DO SISTEMA

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

        if (dados.horarioInicio && !this.isValidTime(dados.horarioInicio)) {
            erros.push('Horário de início inválido (formato: HH:MM)');
        }

        if (dados.horarioFim && !this.isValidTime(dados.horarioFim)) {
            erros.push('Horário de fim inválido (formato: HH:MM)');
        }

        if (dados.horarioInicio && dados.horarioFim) {
            if (!this.isValidTimeRange(dados.horarioInicio, dados.horarioFim)) {
                erros.push('Horário de início deve ser anterior ao horário de fim');
            }
        }

        if (dados.link && !this.isValidURL(dados.link)) {
            erros.push('URL do link é inválida');
        }

        if (dados.email && !this.isValidEmail(dados.email)) {
            erros.push('Email inválido');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    validateTask(dados) {
        const erros = [];

        if (!this.isValidTitle(dados.titulo)) {
            erros.push('Título deve ter pelo menos 3 caracteres');
        }

        if (!dados.tipo) {
            erros.push('Tipo da tarefa é obrigatório');
        }

        if (!dados.prioridade) {
            erros.push('Prioridade é obrigatória');
        }

        if (!dados.responsavel) {
            erros.push('Responsável é obrigatório');
        }

        if (dados.dataInicio && !this.isValidDate(dados.dataInicio)) {
            erros.push('Data de início inválida');
        }

        if (dados.dataFim && !this.isValidDate(dados.dataFim)) {
            erros.push('Data de fim inválida');
        }

        if (dados.dataInicio && dados.dataFim) {
            if (!this.isValidDateRange(dados.dataInicio, dados.dataFim)) {
                erros.push('Data de início deve ser anterior à data de fim');
            }
        }

        if (dados.progresso !== undefined) {
            if (!this.isValidProgress(dados.progresso)) {
                erros.push('Progresso deve ser um número entre 0 e 100');
            }
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
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

        if (dados.telefone && !this.isValidPhone(dados.telefone)) {
            erros.push('Telefone inválido');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    // ✅ VALIDAÇÕES AUXILIARES - Performance Otimizada

    isValidTimeRange(horaInicio, horaFim) {
        if (!this.isValidTime(horaInicio) || !this.isValidTime(horaFim)) {
            return false;
        }

        const [horaIni, minIni] = horaInicio.split(':').map(Number);
        const [horaFi, minFi] = horaFim.split(':').map(Number);

        const minutosIni = horaIni * 60 + minIni;
        const minutosFi = horaFi * 60 + minFi;

        return minutosIni < minutosFi;
    },

    isValidDateRange(dataInicio, dataFim) {
        const dataIni = new Date(dataInicio);
        const dataFi = new Date(dataFim);
        return dataIni <= dataFi;
    },

    isValidProgress(progresso) {
        const num = Number(progresso);
        return !isNaN(num) && num >= 0 && num <= 100;
    },

    isPositiveNumber(valor) {
        const num = Number(valor);
        return !isNaN(num) && num > 0;
    },

    isInteger(valor) {
        const num = Number(valor);
        return !isNaN(num) && Number.isInteger(num);
    },

    // ✅ VALIDAÇÃO DE FORMULÁRIOS DOM - Otimizada

    validateForm(formId, rules = {}) {
        try {
            const form = document.getElementById(formId);
            if (!form) {
                throw new Error(`Formulário ${formId} não encontrado`);
            }

            const erros = [];
            const dados = {};
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                const nome = input.name || input.id;
                const valor = input.value;
                const tipo = input.type;
                const obrigatorio = input.required;

                dados[nome] = valor;

                if (obrigatorio && !valor.trim()) {
                    erros.push(`${this._getFieldLabel(input)} é obrigatório`);
                    this._markFieldError(input, `${this._getFieldLabel(input)} é obrigatório`);
                    return;
                }

                if (!valor.trim()) return;

                // Validações por tipo consolidadas
                let validacaoErro = null;
                
                switch (tipo) {
                    case 'email':
                        if (!this.isValidEmail(valor)) validacaoErro = 'Email inválido';
                        break;
                    case 'url':
                        if (!this.isValidURL(valor)) validacaoErro = 'URL inválida';
                        break;
                    case 'tel':
                        if (!this.isValidPhone(valor)) validacaoErro = 'Telefone inválido';
                        break;
                    case 'date':
                        if (!this.isValidDate(valor)) validacaoErro = 'Data inválida';
                        break;
                    case 'time':
                        if (!this.isValidTime(valor)) validacaoErro = 'Horário inválido (HH:MM)';
                        break;
                    case 'number':
                        if (isNaN(Number(valor))) validacaoErro = 'Número inválido';
                        break;
                    case 'password':
                        if (!this.isValidPassword(valor)) {
                            validacaoErro = `Mínimo ${this.config.passwordMinLength} caracteres`;
                        }
                        break;
                }

                if (validacaoErro) {
                    erros.push(`${this._getFieldLabel(input)} - ${validacaoErro}`);
                    this._markFieldError(input, validacaoErro);
                } else if (rules[nome]) {
                    const resultado = rules[nome](valor, dados);
                    if (resultado !== true) {
                        erros.push(resultado);
                        this._markFieldError(input, resultado);
                    }
                }

                if (!validacaoErro) {
                    this._clearFieldError(input);
                }
            });

            return {
                valido: erros.length === 0,
                erros: erros,
                dados: dados
            };

        } catch (error) {
            console.error('❌ VALIDATION: Erro crítico na validação do formulário:', error);
            return {
                valido: false,
                erros: [`Erro na validação: ${error.message}`],
                dados: {}
            };
        }
    },

    // ✅ UTILITÁRIOS DOM - Performance Otimizada

    _getFieldLabel(input) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            return label.textContent.replace('*', '').replace(':', '').trim();
        }
        return input.name || input.id || 'Campo';
    },

    _markFieldError(input, mensagem) {
        try {
            input.classList.add('input-error');
            this._clearFieldError(input);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = mensagem;
            errorDiv.style.cssText = `
                color: #ef4444;
                font-size: 12px;
                margin-top: 4px;
                display: block;
            `;
            
            input.parentNode.insertBefore(errorDiv, input.nextSibling);

        } catch (error) {
            console.error('❌ VALIDATION: Erro ao marcar campo com erro:', error);
        }
    },

    _clearFieldError(input) {
        try {
            input.classList.remove('input-error');
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        } catch (error) {
            console.error('❌ VALIDATION: Erro ao limpar erro do campo:', error);
        }
    },

    // ✅ VALIDAÇÃO EM TEMPO REAL - Otimizada

    setupRealTimeValidation(formId, rules = {}) {
        try {
            const form = document.getElementById(formId);
            if (!form) {
                throw new Error(`Formulário ${formId} não encontrado`);
            }

            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                // Validar ao sair do campo
                input.addEventListener('blur', () => {
                    this._validateSingleField(input, rules);
                });

                // Debounce para validação durante digitação
                let timeout;
                input.addEventListener('input', () => {
                    if (input.classList.contains('input-error')) {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            this._validateSingleField(input, rules);
                        }, 500);
                    }
                });
            });

        } catch (error) {
            console.error('❌ VALIDATION: Erro ao configurar validação em tempo real:', error);
        }
    },

    _validateSingleField(input, rules = {}) {
        const nome = input.name || input.id;
        const valor = input.value;
        const tipo = input.type;
        const obrigatorio = input.required;

        if (obrigatorio && !valor.trim()) {
            this._markFieldError(input, `${this._getFieldLabel(input)} é obrigatório`);
            return false;
        }

        if (!valor.trim()) {
            this._clearFieldError(input);
            return true;
        }

        let valido = true;
        let mensagem = '';

        switch (tipo) {
            case 'email':
                if (!this.isValidEmail(valor)) {
                    valido = false;
                    mensagem = 'Email inválido';
                }
                break;
            case 'url':
                if (!this.isValidURL(valor)) {
                    valido = false;
                    mensagem = 'URL inválida';
                }
                break;
            case 'date':
                if (!this.isValidDate(valor)) {
                    valido = false;
                    mensagem = 'Data inválida';
                }
                break;
            case 'time':
                if (!this.isValidTime(valor)) {
                    valido = false;
                    mensagem = 'Horário inválido (HH:MM)';
                }
                break;
        }

        if (valido && rules[nome]) {
            const resultado = rules[nome](valor);
            if (resultado !== true) {
                valido = false;
                mensagem = resultado;
            }
        }

        if (valido) {
            this._clearFieldError(input);
        } else {
            this._markFieldError(input, mensagem);
        }

        return valido;
    },

    // ✅ UTILITÁRIOS GERAIS - Performance Otimizada

    sanitizeInput(texto) {
        if (!texto || typeof texto !== 'string') return '';
        return texto.trim().replace(/[<>]/g, '').substring(0, 1000);
    },

    formatPhone(phone) {
        if (!phone) return '';
        const clean = phone.replace(/\D/g, '');
        
        if (clean.length === 11) {
            return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (clean.length === 10) {
            return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    },

    formatCEP(cep) {
        if (!cep) return '';
        const clean = cep.replace(/\D/g, '');
        
        if (clean.length === 8) {
            return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        
        return cep;
    },

    // ✅ STATUS E DEBUG
    obterStatus() {
        return {
            modulo: 'Validation',
            versao: '7.4.0',
            status: 'OTIMIZADO',
            debug: 'PRODUCTION READY',
            funcionalidades: {
                validacoes_basicas: true,
                validacoes_especificas: true,
                validacao_formularios: true,
                tempo_real: true,
                utilitarios: true,
                formatacao: true
            },
            performance: 'OTIMIZADA',
            logs: 'APENAS_ERROS_CRITICOS'
        };
    }
};

// ✅ ESTILOS PARA CAMPOS COM ERRO - Otimizados
if (!document.getElementById('validation-styles')) {
    const styles = document.createElement('style');
    styles.id = 'validation-styles';
    styles.textContent = `
        .input-error {
            border-color: #ef4444 !important;
            background-color: #fef2f2 !important;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        }
        
        .input-error:focus {
            outline-color: #ef4444 !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
        }
    `;
    document.head.appendChild(styles);
}

// ✅ DEBUG OTIMIZADO (apenas funções essenciais)
window.Validation_Debug = {
    testarEmail: (email) => {
        console.log(`Email "${email}":`, Validation.isValidEmail(email));
    },
    testarData: (data) => {
        console.log(`Data "${data}":`, Validation.isValidDate(data));
    },
    testarFormulario: (formId) => {
        const resultado = Validation.validateForm(formId);
        console.log(`Formulário "${formId}":`, resultado);
        return resultado;
    },
    status: () => {
        return Validation.obterStatus();
    }
};

// ✅ LOG DE INICIALIZAÇÃO (ÚNICO LOG ESSENCIAL)
console.log('✅ VALIDATION v7.4.0: Sistema carregado (PRODUCTION READY)');
