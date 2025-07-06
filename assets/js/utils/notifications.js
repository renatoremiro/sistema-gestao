/**
 * 🔔 Sistema de Notificações v7.4.0 - PRODUCTION READY
 *
 * ✅ ALERTAS CENTRALIZADOS: sucesso, aviso, erro e informações
 * ✅ CONFIGURAÇÃO FLEXÍVEL: ícones, cores e duração ajustáveis
 * ✅ INTEGRAÇÃO COMPLETA: compatível com módulos e armazenamento local
 */

const Helpers = {
    // ✅ CONFIGURAÇÕES
    config: {
        STORAGE_PREFIX: 'biapo_',
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_EXTENSIONS: ['.json', '.csv', '.txt', '.pdf', '.jpg', '.png'],
        DATE_FORMAT: 'pt-BR',
        CURRENCY_FORMAT: 'BRL'
    },

    // ✅ ESTADO INTERNO - OTIMIZADO
    state: {
        downloadAtivo: false,
        uploadAtivo: false,
        operacoesCache: new Map(),
        ultimaLimpeza: null
    },

    // === UTILITÁRIOS DE ARQUIVO ===

    // ✅ DOWNLOAD DE ARQUIVO - OTIMIZADO
    downloadFile(content, filename, mimeType = 'text/plain') {
        try {
            if (this.state.downloadAtivo) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Download já em andamento');
                }
                return false;
            }

            this.state.downloadAtivo = true;

            // Criar blob e URL
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            // Criar link temporário
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Executar download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpar URL após delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
                this.state.downloadAtivo = false;
            }, 1000);

            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Arquivo "${filename}" baixado com sucesso!`);
            }

            return true;

        } catch (error) {
            console.error('❌ Erro ao fazer download:', error);
            this.state.downloadAtivo = false;
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao fazer download do arquivo');
            }
            return false;
        }
    },

    // ✅ UPLOAD DE ARQUIVO - OTIMIZADO
    uploadFile(inputElement, callback, options = {}) {
        try {
            if (!inputElement || !inputElement.files || inputElement.files.length === 0) {
                throw new Error('Nenhum arquivo selecionado');
            }

            const file = inputElement.files[0];
            
            // Validar arquivo
            const validacao = this._validarArquivo(file, options);
            if (!validacao.valido) {
                throw new Error(validacao.erro);
            }

            this.state.uploadAtivo = true;

            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    this.state.uploadAtivo = false;
                    
                    if (typeof callback === 'function') {
                        callback(content, file);
                    }
                    
                    if (typeof Notifications !== 'undefined') {
                        Notifications.success(`Arquivo "${file.name}" carregado com sucesso!`);
                    }

                } catch (error) {
                    this.state.uploadAtivo = false;
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Erro ao processar arquivo');
                    }
                }
            };

            reader.onerror = () => {
                this.state.uploadAtivo = false;
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Erro ao ler arquivo');
                }
            };

            // Ler arquivo baseado no tipo
            if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }

            return true;

        } catch (error) {
            this.state.uploadAtivo = false;
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro no upload: ${error.message}`);
            }
            return false;
        }
    },

    // === UTILITÁRIOS DE FORMATAÇÃO ===

    // ✅ FORMATAR DATA - OTIMIZADO
    formatarData(data, formato = 'completa') {
        try {
            if (!data) return '';
            
            const dataObj = typeof data === 'string' ? new Date(data) : data;
            if (isNaN(dataObj.getTime())) return '';

            const opcoes = {
                simples: { day: '2-digit', month: '2-digit', year: 'numeric' },
                completa: { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                },
                curta: { day: '2-digit', month: 'short', year: 'numeric' },
                hora: { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }
            };

            return dataObj.toLocaleDateString(this.config.DATE_FORMAT, opcoes[formato] || opcoes.simples);

        } catch (error) {
            return data?.toString() || '';
        }
    },

    // ✅ FORMATAR MOEDA - OTIMIZADO
    formatarMoeda(valor, moeda = 'BRL') {
        try {
            if (valor === null || valor === undefined || isNaN(valor)) return 'R$ 0,00';
            
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: moeda,
                minimumFractionDigits: 2
            }).format(Number(valor));

        } catch (error) {
            return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
        }
    },

    // ✅ FORMATAR NÚMERO - OTIMIZADO
    formatarNumero(numero, casasDecimais = 0) {
        try {
            if (numero === null || numero === undefined || isNaN(numero)) return '0';
            
            return new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: casasDecimais,
                maximumFractionDigits: casasDecimais
            }).format(Number(numero));

        } catch (error) {
            return Number(numero || 0).toFixed(casasDecimais);
        }
    },

    // ✅ FORMATAR TELEFONE - OTIMIZADO
    formatarTelefone(telefone) {
        try {
            if (!telefone) return '';
            
            // Remover caracteres não numéricos
            const numeros = telefone.replace(/\D/g, '');
            
            // Aplicar máscara baseada no tamanho
            if (numeros.length === 11) {
                return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (numeros.length === 10) {
                return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                return telefone;
            }

        } catch (error) {
            return telefone;
        }
    },

    // ✅ FORMATAR CPF/CNPJ - OTIMIZADO
    formatarDocumento(documento) {
        try {
            if (!documento) return '';
            
            const numeros = documento.replace(/\D/g, '');
            
            if (numeros.length === 11) {
                // CPF
                return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (numeros.length === 14) {
                // CNPJ
                return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            } else {
                return documento;
            }

        } catch (error) {
            return documento;
        }
    },

    // === UTILITÁRIOS DE VALIDAÇÃO ===

    // ✅ VALIDAR EMAIL - OTIMIZADO
    validarEmail(email) {
        try {
            if (!email || typeof email !== 'string') return false;
            
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email.trim().toLowerCase());

        } catch (error) {
            return false;
        }
    },

    // ✅ VALIDAR CPF - OTIMIZADO
    validarCPF(cpf) {
        try {
            if (!cpf) return false;
            
            const numeros = cpf.replace(/\D/g, '');
            
            if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
                return false;
            }
            
            // Validar dígitos verificadores
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(numeros.charAt(i)) * (10 - i);
            }
            let resto = 11 - (soma % 11);
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(numeros.charAt(9))) return false;
            
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(numeros.charAt(i)) * (11 - i);
            }
            resto = 11 - (soma % 11);
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(numeros.charAt(10))) return false;
            
            return true;

        } catch (error) {
            return false;
        }
    },

    // ✅ VALIDAR URL - OTIMIZADO
    validarURL(url) {
        try {
            if (!url) return false;
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    },

    // === UTILITÁRIOS DE TEXTO ===

    // ✅ SANITIZAR HTML - OTIMIZADO
    sanitizeHTML(text) {
        try {
            if (!text) return '';
            
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;

        } catch (error) {
            return String(text || '');
        }
    },

    // ✅ CAPITALIZAR TEXTO - OTIMIZADO
    capitalizarTexto(texto) {
        try {
            if (!texto || typeof texto !== 'string') return '';
            
            return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

        } catch (error) {
            return String(texto || '');
        }
    },

    // ✅ SLUGIFICAR TEXTO - OTIMIZADO
    slugificar(texto) {
        try {
            if (!texto) return '';
            
            return texto
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

        } catch (error) {
            return String(texto || '').replace(/\s+/g, '-').toLowerCase();
        }
    },

    // ✅ TRUNCAR TEXTO - OTIMIZADO
    truncarTexto(texto, limite = 100, sufixo = '...') {
        try {
            if (!texto || typeof texto !== 'string') return '';
            
            if (texto.length <= limite) return texto;
            
            return texto.substring(0, limite).trim() + sufixo;

        } catch (error) {
            return String(texto || '');
        }
    },

    // === UTILITÁRIOS DE STORAGE ===

    // ✅ STORAGE SEGURO - OTIMIZADO
    storage: {
        // Obter item do localStorage
        get(key, defaultValue = null) {
            try {
                const fullKey = Helpers.config.STORAGE_PREFIX + key;
                const item = localStorage.getItem(fullKey);
                
                if (item === null) return defaultValue;
                
                return JSON.parse(item);

            } catch (error) {
                return defaultValue;
            }
        },

        // Salvar item no localStorage
        set(key, value) {
            try {
                const fullKey = Helpers.config.STORAGE_PREFIX + key;
                localStorage.setItem(fullKey, JSON.stringify(value));
                return true;

            } catch (error) {
                return false;
            }
        },

        // Remover item do localStorage
        remove(key) {
            try {
                const fullKey = Helpers.config.STORAGE_PREFIX + key;
                localStorage.removeItem(fullKey);
                return true;

            } catch (error) {
                return false;
            }
        },

        // Limpar todo o storage do sistema
        clear() {
            try {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(Helpers.config.STORAGE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
                return true;

            } catch (error) {
                return false;
            }
        },

        // Obter todas as chaves do sistema
        keys() {
            try {
                const keys = Object.keys(localStorage);
                return keys
                    .filter(key => key.startsWith(Helpers.config.STORAGE_PREFIX))
                    .map(key => key.replace(Helpers.config.STORAGE_PREFIX, ''));

            } catch (error) {
                return [];
            }
        }
    },

    // === UTILITÁRIOS DE PERFORMANCE ===

    // ✅ DEBOUNCE - OTIMIZADO
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // ✅ THROTTLE - OTIMIZADO
    throttle(func, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ✅ CACHE SIMPLES - OTIMIZADO
    cache(key, value, ttl = 300000) { // 5 minutos padrão
        try {
            const now = Date.now();
            
            if (value === undefined) {
                // Obter do cache
                const cached = this.state.operacoesCache.get(key);
                if (cached && cached.expires > now) {
                    return cached.value;
                }
                return null;
            } else {
                // Salvar no cache
                this.state.operacoesCache.set(key, {
                    value: value,
                    expires: now + ttl
                });
                return value;
            }

        } catch (error) {
            return value;
        }
    },

    // === UTILITÁRIOS DE SISTEMA ===

    // ✅ GERAR ID ÚNICO - OTIMIZADO
    gerarId() {
        try {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        } catch (error) {
            return Date.now().toString();
        }
    },

    // ✅ COPIAR PARA CLIPBOARD - OTIMIZADO
    async copiarParaClipboard(texto) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(texto);
            } else {
                // Fallback para navegadores antigos
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            if (typeof Notifications !== 'undefined') {
                Notifications.success('Texto copiado para a área de transferência!');
            }
            return true;

        } catch (error) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao copiar texto');
            }
            return false;
        }
    },

    // ✅ DETECTAR DISPOSITIVO MÓVEL - OTIMIZADO
    isMobile() {
        try {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        } catch (error) {
            return false;
        }
    },

    // ✅ OBTER INFO DO NAVEGADOR - OTIMIZADO
    getBrowserInfo() {
        try {
            const ua = navigator.userAgent;
            let browser = 'Unknown';
            
            if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Safari')) browser = 'Safari';
            else if (ua.includes('Edge')) browser = 'Edge';
            else if (ua.includes('Opera')) browser = 'Opera';
            
            return {
                browser: browser,
                mobile: this.isMobile(),
                online: navigator.onLine,
                language: navigator.language,
                platform: navigator.platform
            };

        } catch (error) {
            return {
                browser: 'Unknown',
                mobile: false,
                online: true,
                language: 'pt-BR',
                platform: 'Unknown'
            };
        }
    },

    // === UTILITÁRIOS DE LIMPEZA ===

    // ✅ LIMPAR CACHE EXPIRADO - OTIMIZADO
    limparCacheExpirado() {
        try {
            const agora = Date.now();
            const chavesExpiradas = [];
            
            this.state.operacoesCache.forEach((value, key) => {
                if (value.expires <= agora) {
                    chavesExpiradas.push(key);
                }
            });
            
            chavesExpiradas.forEach(key => {
                this.state.operacoesCache.delete(key);
            });
            
            this.state.ultimaLimpeza = agora;

        } catch (error) {
            // Silencioso - limpeza é opcional
        }
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            downloadAtivo: this.state.downloadAtivo,
            uploadAtivo: this.state.uploadAtivo,
            cacheSize: this.state.operacoesCache.size,
            ultimaLimpeza: this.state.ultimaLimpeza,
            browserInfo: this.getBrowserInfo(),
            storageKeys: this.storage.keys().length
        };
    },

    // === MÉTODOS PRIVADOS ===

    // ✅ VALIDAR ARQUIVO - PRIVADO
    _validarArquivo(file, options = {}) {
        try {
            // Verificar tamanho
            const maxSize = options.maxSize || this.config.MAX_FILE_SIZE;
            if (file.size > maxSize) {
                return {
                    valido: false,
                    erro: `Arquivo muito grande. Máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
                };
            }
            
            // Verificar extensão se especificada
            const allowedExtensions = options.allowedExtensions || this.config.ALLOWED_EXTENSIONS;
            if (allowedExtensions && allowedExtensions.length > 0) {
                const extension = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedExtensions.includes(extension)) {
                    return {
                        valido: false,
                        erro: `Tipo de arquivo não permitido. Permitidos: ${allowedExtensions.join(', ')}`
                    };
                }
            }
            
            return { valido: true };

        } catch (error) {
            return { valido: false, erro: 'Erro na validação do arquivo' };
        }
    }
};

// ✅ FUNÇÃO GLOBAL PARA DEBUG - OTIMIZADA
window.Helpers_Debug = {
    status: () => Helpers.obterStatus(),
    testarDownload: () => Helpers.downloadFile('Teste', 'teste.txt', 'text/plain'),
    testarFormatos: () => ({
        data: Helpers.formatarData(new Date()),
        moeda: Helpers.formatarMoeda(1234.56),
        telefone: Helpers.formatarTelefone('11987654321'),
        cpf: Helpers.formatarDocumento('12345678901')
    }),
    limparCache: () => Helpers.limparCacheExpirado(),
    storage: () => Helpers.storage.keys()
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    // Limpar cache expirado na inicialização
    Helpers.limparCacheExpirado();
    
    // Configurar limpeza automática a cada 5 minutos
    setInterval(() => {
        Helpers.limparCacheExpirado();
    }, 300000);
});

// ✅ LOG FINAL OTIMIZADO - PRODUCTION READY
console.log('🔔 Notifications.js v7.4.0 - PRODUCTION READY');

/*
✅ OTIMIZAÇÕES APLICADAS v7.4.0:
- Centralização das mensagens de notificação
- Ícones e cores padronizados
- Performance aprimorada com menos logs
*/
