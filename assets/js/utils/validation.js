/* ========== ✅ SISTEMA DE VALIDAÇÃO v6.2 ========== */

const Validation = {
    // ✅ VALIDAR FORMULÁRIO GENÉRICO
    validarFormulario(campos) {
        let valido = true;
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            const errorElement = document.getElementById(campo.id + 'Error');
            
            if (!elemento) return;
            
            // Limpar erros anteriores
            elemento.classList.remove('input-error');
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
            
            let campoValido = true;
            let mensagemErro = '';
            
            // Validações obrigatórias
            if (campo.required && !elemento.value.trim()) {
                campoValido = false;
                mensagemErro = campo.message || 'Campo obrigatório';
            }
            
            // Validações específicas por tipo
            if (elemento.value.trim() && campo.type) {
                switch (campo.type) {
                    case 'email':
                        if (!this.isValidEmail(elemento.value)) {
                            campoValido = false;
                            mensagemErro = 'Email inválido';
                        }
                        break;
                        
                    case 'date':
                        if (!this.isValidDate(elemento.value)) {
                            campoValido = false;
                            mensagemErro = 'Data inválida';
                        }
                        break;
                        
                    case 'time':
                        if (!this.isValidTime(elemento.value)) {
                            campoValido = false;
                            mensagemErro = 'Horário inválido';
                        }
                        break;
                        
                    case 'minLength':
                        if (elemento.value.length < campo.minLength) {
                            campoValido = false;
                            mensagemErro = `Mínimo ${campo.minLength} caracteres`;
                        }
                        break;
                        
                    case 'maxLength':
                        if (elemento.value.length > campo.maxLength) {
                            campoValido = false;
                            mensagemErro = `Máximo ${campo.maxLength} caracteres`;
                        }
                        break;
                }
            }
            
            // Validações customizadas
            if (campoValido && campo.customValidator) {
                const resultado = campo.customValidator(elemento.value);
                if (!resultado.valido) {
                    campoValido = false;
                    mensagemErro = resultado.mensagem;
                }
            }
            
            // Aplicar resultado da validação
            if (!campoValido) {
                valido = false;
                elemento.classList.add('input-error');
                if (errorElement) {
                    errorElement.textContent = mensagemErro;
                    errorElement.classList.remove('hidden');
                }
            }
        });
        
        return valido;
    },

    // ✅ VALIDAÇÃO DE EMAIL
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // ✅ VALIDAÇÃO DE DATA
    isValidDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Verifica se é uma data válida
        if (isNaN(date.getTime())) return false;
        
        // Não permite datas muito antigas (anterior a 2020)
        const dataMinima = new Date('2020-01-01');
        if (date < dataMinima) return false;
        
        // Não permite datas muito futuras (mais de 10 anos)
        const dataMaxima = new Date();
        dataMaxima.setFullYear(dataMaxima.getFullYear() + 10);
        if (date > dataMaxima) return false;
        
        return true;
    },

    // ✅ VALIDAÇÃO DE HORÁRIO
    isValidTime(timeString) {
        if (!timeString) return false;
        
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(timeString);
    },

    // ✅ VALIDAÇÃO DE PRAZO (não pode ser no passado)
    isValidPrazo(dateString) {
        if (!this.isValidDate(dateString)) return false;
        
        const date = new Date(dateString + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Prazo não pode ser no passado
        return date >= hoje;
    },

    // ✅ VALIDAÇÃO DE INTERVALO DE HORÁRIO
    validarIntervaloHorario(inicio, fim) {
        if (!inicio) return { valido: true }; // Início é obrigatório, fim é opcional
        
        if (!this.isValidTime(inicio)) {
            return { valido: false, mensagem: 'Horário de início inválido' };
        }
        
        if (fim && !this.isValidTime(fim)) {
            return { valido: false, mensagem: 'Horário de fim inválido' };
        }
        
        if (inicio && fim) {
            const [horaI, minI] = inicio.split(':').map(Number);
            const [horaF, minF] = fim.split(':').map(Number);
            
            const inicioMinutos = horaI * 60 + minI;
            const fimMinutos = horaF * 60 + minF;
            
            if (fimMinutos <= inicioMinutos) {
                return { valido: false, mensagem: 'Horário de fim deve ser após o início' };
            }
        }
        
        return { valido: true };
    },

    // ✅ VALIDAÇÃO DE TÍTULO/NOME
    validarTitulo(titulo) {
        if (!titulo || !titulo.trim()) {
            return { valido: false, mensagem: 'Título é obrigatório' };
        }
        
        if (titulo.trim().length < 3) {
            return { valido: false, mensagem: 'Título deve ter pelo menos 3 caracteres' };
        }
        
        if (titulo.length > 100) {
            return { valido: false, mensagem: 'Título deve ter no máximo 100 caracteres' };
        }
        
        return { valido: true };
    },

    // ✅ VALIDAÇÃO DE SENHA
    validarSenha(senha) {
        if (!senha) {
            return { valido: false, mensagem: 'Senha é obrigatória' };
        }
        
        if (senha.length < 6) {
            return { valido: false, mensagem: 'Senha deve ter pelo menos 6 caracteres' };
        }
        
        if (senha.length > 50) {
            return { valido: false, mensagem: 'Senha deve ter no máximo 50 caracteres' };
        }
        
        return { valido: true };
    },

    // ✅ VALIDAÇÃO DE RECORRÊNCIA
    validarRecorrencia(tipo, quantidade) {
        if (!tipo) {
            return { valido: false, mensagem: 'Tipo de recorrência é obrigatório' };
        }
        
        const tiposValidos = ['diaria', 'quinzenal', 'mensal', 'bimestral'];
        if (!tiposValidos.includes(tipo)) {
            return { valido: false, mensagem: 'Tipo de recorrência inválido' };
        }
        
        const qtd = parseInt(quantidade);
        if (isNaN(qtd) || qtd < 1) {
            return { valido: false, mensagem: 'Quantidade deve ser maior que zero' };
        }
        
        if (qtd > 365) {
            return { valido: false, mensagem: 'Quantidade máxima é 365' };
        }
        
        return { valido: true };
    },

    // ✅ SANITIZAÇÃO DE ENTRADA
    sanitizarEntrada(texto) {
        if (!texto) return '';
        
        return texto
            .trim()
            .replace(/[<>]/g, '') // Remove caracteres perigosos
            .substring(0, 1000); // Limita tamanho
    },

    // ✅ VALIDAÇÃO DE DADOS DO EVENTO
    validarEvento(evento) {
        const erros = [];
        
        // Título obrigatório
        const tituloValidacao = this.validarTitulo(evento.titulo);
        if (!tituloValidacao.valido) {
            erros.push(tituloValidacao.mensagem);
        }
        
        // Data obrigatória e válida
        if (!this.isValidDate(evento.data)) {
            erros.push('Data inválida');
        }
        
        // Horário de início obrigatório
        if (!this.isValidTime(evento.horarioInicio)) {
            erros.push('Horário de início inválido');
        }
        
        // Validar intervalo de horário se ambos existirem
        if (evento.horarioInicio && evento.horarioFim) {
            const intervaloValidacao = this.validarIntervaloHorario(evento.horarioInicio, evento.horarioFim);
            if (!intervaloValidacao.valido) {
                erros.push(intervaloValidacao.mensagem);
            }
        }
        
        // Tipo obrigatório
        const tiposValidos = ['reuniao', 'entrega', 'prazo', 'marco', 'outro'];
        if (!evento.tipo || !tiposValidos.includes(evento.tipo)) {
            erros.push('Tipo de evento inválido');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    // ✅ VALIDAÇÃO DE DADOS DA TAREFA
    validarTarefa(tarefa) {
        const erros = [];
        
        // Título obrigatório
        const tituloValidacao = this.validarTitulo(tarefa.titulo);
        if (!tituloValidacao.valido) {
            erros.push(tituloValidacao.mensagem);
        }
        
        // Horário de início obrigatório
        if (!this.isValidTime(tarefa.horarioInicio)) {
            erros.push('Horário de início inválido');
        }
        
        // Validar data específica se informada
        if (tarefa.dataEspecifica && !this.isValidDate(tarefa.dataEspecifica)) {
            erros.push('Data específica inválida');
        }
        
        // Tipo obrigatório
        const tiposValidos = ['reuniao', 'entrega', 'prazo', 'marco', 'outro'];
        if (!tarefa.tipo || !tiposValidos.includes(tarefa.tipo)) {
            erros.push('Tipo de tarefa inválido');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    },

    // ✅ EXIBIR ERROS DE VALIDAÇÃO
    exibirErros(erros, containerId = null) {
        if (erros.length === 0) return;
        
        const mensagem = erros.join('\n');
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="validation-errors" style="background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <strong>❌ Erros encontrados:</strong>
                        <ul style="margin-top: 8px; margin-left: 16px;">
                            ${erros.map(erro => `<li>${erro}</li>`).join('')}
                        </ul>
                    </div>
                `;
                return;
            }
        }
        
        // Fallback para alert
        alert('❌ Erros encontrados:\n\n' + mensagem);
    },

    // ✅ LIMPAR ERROS DE VALIDAÇÃO
    limparErros(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const errorDiv = container.querySelector('.validation-errors');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
    },

    // ✅ VALIDAÇÃO EM TEMPO REAL
    setupValidacaoTempoReal(inputId, validatorFunction) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const debounced = Helpers.debounce((value) => {
            const resultado = validatorFunction(value);
            
            if (resultado.valido) {
                input.classList.remove('input-error');
                const errorElement = document.getElementById(inputId + 'Error');
                if (errorElement) {
                    errorElement.classList.add('hidden');
                }
            } else {
                input.classList.add('input-error');
                const errorElement = document.getElementById(inputId + 'Error');
                if (errorElement) {
                    errorElement.textContent = resultado.mensagem;
                    errorElement.classList.remove('hidden');
                }
            }
        }, 500);
        
        input.addEventListener('input', (e) => {
            debounced(e.target.value);
        });
    }
};

console.log('✅ Sistema de Validação v6.2 carregado!');
