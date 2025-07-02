/* ========== ✅ SISTEMA DE VALIDAÇÃO v6.3.0 ========== */

const Validation = {
    // ✅ CONFIGURAÇÕES
    config: {
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
        urlRegex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        passwordMinLength: 6,
        nomeMinLength: 2,
        tituloMinLength: 3
    },

    // ✅ VALIDAÇÕES BÁSICAS
    
    // Validar email
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return this.config.emailRegex.test(email.trim());
    },

    // Validar data
    isValidDate(data) {
        if (!data) return false;
        
        // Aceitar tanto string (YYYY-MM-DD) quanto objeto Date
        const dateObj = typeof data === 'string' ? new Date(data + 'T00:00:00') : new Date(data);
        
        return !isNaN(dateObj.getTime()) && dateObj.getFullYear() > 1900;
    },

    // Validar horário (HH:MM)
    isValidTime(horario) {
        if (!horario || typeof horario !== 'string') return false;
        
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(horario);
    },

    // Validar URL
    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;
        return this.config.urlRegex.test(url.trim());
    },

    // Validar telefone
    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        // Remover formatação para validar apenas números
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return this.config.phoneRegex.test(cleanPhone);
    },

    // Validar senha
    isValidPassword(senha) {
        if (!senha || typeof senha !== 'string') return false;
        return senha.length >= this.config.passwordMinLength;
    },

    // Validar nome
    isValidName(nome) {
        if (!nome || typeof nome !== 'string') return false;
        return nome.trim().length >= this.config.nomeMinLength;
    },

    // Validar título
    isValidTitle(titulo) {
        if (!titulo || typeof titulo !== 'string') return false;
        return titulo.trim().length >= this.config.tituloMinLength;
    },

    // ✅ VALIDAÇÕES ESPECÍFICAS DO SISTEMA

    // Validar dados de evento
    validateEvent(dados) {
        const erros = [];

        // Título obrigatório
        if (!this.isValidTitle(dados.titulo)) {
            erros.push('Título deve ter pelo menos 3 caracteres');
        }

        // Tipo obrigatório
        if (!dados.tipo) {
            erros.push('Tipo do evento é obrigatório');
        }

        // Data obrigatória
        if (!this.isValidDate(dados.data)) {
            erros.push('Data do evento é obrigatória e deve ser válida');
        }

        // Validar horários se fornecidos
        if (dados.horarioInicio && !this.isValidTime(dados.horarioInicio)) {
            erros.push('Horário de início inválido (formato: HH:MM)');
        }

        if (dados.horarioFim && !this.isValidTime(dados.horarioFim)) {
            erros.push('Horário de fim inválido (formato: HH:MM)');
        }

        // Validar sequência de horários
        if (dados.horarioInicio && dados.horarioFim) {
            if (!this.isValidTimeRange(dados.horarioInicio, dados.horarioFim)) {
                erros.push('Horário de início deve ser anterior ao horário de fim');
            }
        }

        // Validar URL se fornecida
        if (dados.link && !this.isValidURL(dados.link)) {
            erros.push('URL do link é inválida');
        }

        // Validar email se fornecido
        if (dados.email && !this.isValidEmail(dados.email)) {
            erros.push('Email inválido');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    // Validar dados de tarefa
    validateTask(dados) {
        const erros = [];

        // Título obrigatório
        if (!this.isValidTitle(dados.titulo)) {
            erros.push('Título deve ter pelo menos 3 caracteres');
        }

        // Tipo obrigatório
        if (!dados.tipo) {
            erros.push('Tipo da tarefa é obrigatório');
        }

        // Prioridade obrigatória
        if (!dados.prioridade) {
            erros.push('Prioridade é obrigatória');
        }

        // Responsável obrigatório
        if (!dados.responsavel) {
            erros.push('Responsável é obrigatório');
        }

        // Validar datas se fornecidas
        if (dados.dataInicio && !this.isValidDate(dados.dataInicio)) {
            erros.push('Data de início inválida');
        }

        if (dados.dataFim && !this.isValidDate(dados.dataFim)) {
            erros.push('Data de fim inválida');
        }

        // Validar sequência de datas
        if (dados.dataInicio && dados.dataFim) {
            if (!this.isValidDateRange(dados.dataInicio, dados.dataFim)) {
                erros.push('Data de início deve ser anterior à data de fim');
            }
        }

        // Validar progresso
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

    // Validar dados de usuário
    validateUser(dados) {
        const erros = [];

        // Nome obrigatório
        if (!this.isValidName(dados.nome)) {
            erros.push('Nome deve ter pelo menos 2 caracteres');
        }

        // Email obrigatório e válido
        if (!this.isValidEmail(dados.email)) {
            erros.push('Email é obrigatório e deve ser válido');
        }

        // Senha obrigatória se for novo usuário
        if (dados.senha && !this.isValidPassword(dados.senha)) {
            erros.push(`Senha deve ter pelo menos ${this.config.passwordMinLength} caracteres`);
        }

        // Telefone se fornecido
        if (dados.telefone && !this.isValidPhone(dados.telefone)) {
            erros.push('Telefone inválido');
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    // ✅ VALIDAÇÕES AUXILIARES

    // Validar intervalo de horários
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

    // Validar intervalo de datas
    isValidDateRange(dataInicio, dataFim) {
        const dataIni = new Date(dataInicio);
        const dataFi = new Date(dataFim);

        return dataIni <= dataFi;
    },

    // Validar progresso (0-100)
    isValidProgress(progresso) {
        const num = Number(progresso);
        return !isNaN(num) && num >= 0 && num <= 100;
    },

    // Validar número positivo
    isPositiveNumber(valor) {
        const num = Number(valor);
        return !isNaN(num) && num > 0;
    },

    // Validar número inteiro
    isInteger(valor) {
        const num = Number(valor);
        return !isNaN(num) && Number.isInteger(num);
    },

    // ✅ VALIDAÇÃO DE FORMULÁRIOS DOM

    // Validar formulário completo
    validateForm(formId, rules = {}) {
        try {
            const form = document.getElementById(formId);
            if (!form) {
                throw new Error(`Formulário ${formId} não encontrado`);
            }

            const erros = [];
            const dados = {};

            // Obter todos os inputs do formulário
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                const nome = input.name || input.id;
                const valor = input.value;
                const tipo = input.type;
                const obrigatorio = input.required;

                // Armazenar valor
                dados[nome] = valor;

                // Validar campo obrigatório
                if (obrigatorio && !valor.trim()) {
                    erros.push(`${this._getFieldLabel(input)} é obrigatório`);
                    this._markFieldError(input, `${this._getFieldLabel(input)} é obrigatório`);
                    return;
                }

                // Pular validação se campo vazio e não obrigatório
                if (!valor.trim()) return;

                // Validações por tipo
                switch (tipo) {
                    case 'email':
                        if (!this.isValidEmail(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ser um email válido`);
                            this._markFieldError(input, 'Email inválido');
                        }
                        break;
                        
                    case 'url':
                        if (!this.isValidURL(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ser uma URL válida`);
                            this._markFieldError(input, 'URL inválida');
                        }
                        break;
                        
                    case 'tel':
                        if (!this.isValidPhone(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ser um telefone válido`);
                            this._markFieldError(input, 'Telefone inválido');
                        }
                        break;
                        
                    case 'date':
                        if (!this.isValidDate(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ser uma data válida`);
                            this._markFieldError(input, 'Data inválida');
                        }
                        break;
                        
                    case 'time':
                        if (!this.isValidTime(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ser um horário válido`);
                            this._markFieldError(input, 'Horário inválido (HH:MM)');
                        }
                        break;
                        
                    case 'number':
                        if (isNaN(Number(valor))) {
                            erros.push(`${this._getFieldLabel(input)} deve ser um número válido`);
                            this._markFieldError(input, 'Número inválido');
                        }
                        break;
                        
                    case 'password':
                        if (!this.isValidPassword(valor)) {
                            erros.push(`${this._getFieldLabel(input)} deve ter pelo menos ${this.config.passwordMinLength} caracteres`);
                            this._markFieldError(input, `Mínimo ${this.config.passwordMinLength} caracteres`);
                        }
                        break;
                }

                // Validações customizadas
                if (rules[nome]) {
                    const resultado = rules[nome](valor, dados);
                    if (resultado !== true) {
                        erros.push(resultado);
                        this._markFieldError(input, resultado);
                    }
                }

                // Limpar erro se campo está válido
                if (erros.length === 0) {
                    this._clearFieldError(input);
                }
            });

            return {
                valido: erros.length === 0,
                erros: erros,
                dados: dados
            };

        } catch (error) {
            console.error('❌ Erro na validação do formulário:', error);
            return {
                valido: false,
                erros: [`Erro na validação: ${error.message}`],
                dados: {}
            };
        }
    },

    // ✅ UTILITÁRIOS DOM

    // Obter label do campo
    _getFieldLabel(input) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            return label.textContent.replace('*', '').replace(':', '').trim();
        }
        return input.name || input.id || 'Campo';
    },

    // Marcar campo com erro
    _markFieldError(input, mensagem) {
        try {
            // Adicionar classe de erro
            input.classList.add('input-error');
            
            // Remover mensagem de erro anterior
            this._clearFieldError(input);
            
            // Adicionar nova mensagem de erro
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = mensagem;
            errorDiv.style.cssText = `
                color: #ef4444;
                font-size: 12px;
                margin-top: 4px;
                display: block;
            `;
            
            // Inserir após o input
            input.parentNode.insertBefore(errorDiv, input.nextSibling);

        } catch (error) {
            console.error('❌ Erro ao marcar campo com erro:', error);
        }
    },

    // Limpar erro do campo
    _clearFieldError(input) {
        try {
            input.classList.remove('input-error');
            
            // Remover mensagem de erro
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }

        } catch (error) {
            console.error('❌ Erro ao limpar erro do campo:', error);
        }
    },

    // ✅ VALIDAÇÃO EM TEMPO REAL

    // Configurar validação em tempo real para um formulário
    setupRealTimeValidation(formId, rules = {}) {
        try {
            const form = document.getElementById(formId);
            if (!form) {
                throw new Error(`Formulário ${formId} não encontrado`);
            }

            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                // Validar ao sair do campo (blur)
                input.addEventListener('blur', () => {
                    this._validateSingleField(input, rules);
                });

                // Limpar erro ao digitar (input)
                input.addEventListener('input', () => {
                    if (input.classList.contains('input-error')) {
                        setTimeout(() => {
                            this._validateSingleField(input, rules);
                        }, 500); // Debounce de 500ms
                    }
                });
            });

            console.log(`✅ Validação em tempo real configurada para ${formId}`);

        } catch (error) {
            console.error('❌ Erro ao configurar validação em tempo real:', error);
        }
    },

    // Validar campo individual
    _validateSingleField(input, rules = {}) {
        const nome = input.name || input.id;
        const valor = input.value;
        const tipo = input.type;
        const obrigatorio = input.required;

        // Campo obrigatório vazio
        if (obrigatorio && !valor.trim()) {
            this._markFieldError(input, `${this._getFieldLabel(input)} é obrigatório`);
            return false;
        }

        // Campo vazio não obrigatório
        if (!valor.trim()) {
            this._clearFieldError(input);
            return true;
        }

        // Validar por tipo
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

        // Validação customizada
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

    // ✅ UTILITÁRIOS GERAIS

    // Sanitizar entrada de texto
    sanitizeInput(texto) {
        if (!texto || typeof texto !== 'string') return '';
        
        return texto
            .trim()
            .replace(/[<>]/g, '') // Remover caracteres HTML básicos
            .substring(0, 1000); // Limitar tamanho
    },

    // Formatar telefone
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

    // Formatar CEP
    formatCEP(cep) {
        if (!cep) return '';
        
        const clean = cep.replace(/\D/g, '');
        
        if (clean.length === 8) {
            return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        
        return cep;
    }
};

// ✅ ADICIONAR ESTILOS PARA CAMPOS COM ERRO
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

// ✅ FUNÇÃO GLOBAL PARA DEBUG
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
    }
};

console.log('✅ Sistema de Validação v6.3.0 carregado!');
console.log('🎯 Funcionalidades: Validação de formulários, tempo real, eventos/tarefas');
console.log('🧪 Debug: Validation_Debug.testarEmail(), Validation_Debug.testarData()');
