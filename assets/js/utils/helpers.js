/* ========== 🔧 SISTEMA DE UTILITÁRIOS v6.2 ========== */

const Helpers = {
    // ✅ CACHE DE ELEMENTOS DOM PARA PERFORMANCE
    domCache: {
        calendario: null,
        agendaSemana: null,
        areasGrid: null,
        notification: null,
        notificationText: null
    },

    // ✅ INICIALIZAR CACHE NA PRIMEIRA UTILIZAÇÃO
    initDOMCache() {
        if (!this.domCache.calendario) {
            this.domCache.calendario = document.getElementById('calendario');
            this.domCache.agendaSemana = document.getElementById('agendaSemana');
            this.domCache.areasGrid = document.getElementById('areasGrid');
            this.domCache.notification = document.getElementById('notification');
            this.domCache.notificationText = document.getElementById('notificationText');
        }
    },

    // ✅ FORMATAR DATA BRASILEIRA
    formatarDataBR(data) {
        if (!data) return '';
        const dataObj = new Date(data + 'T00:00:00');
        return dataObj.toLocaleDateString('pt-BR');
    },

    // ✅ OBTER DATA ATUAL FORMATADA
    obterDataAtual() {
        return new Date().toISOString().split('T')[0];
    },

    // ✅ CALCULAR DIFERENÇA EM DIAS
    calcularDiasAte(dataAlvo) {
        const hoje = new Date();
        const alvo = new Date(dataAlvo + 'T00:00:00');
        const diferencaMs = alvo - hoje;
        return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
    },

    // ✅ DETERMINAR STATUS POR PRAZO
    determinarStatusPorPrazo(prazo) {
        const dias = this.calcularDiasAte(prazo);
        if (dias < 0) return 'vermelho'; // Atrasado
        if (dias <= 3) return 'amarelo'; // Atenção
        return 'verde'; // Em dia
    },

    // ✅ GERAR ID ÚNICO
    gerarId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    // ✅ DEBOUNCE PARA OTIMIZAÇÃO
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ✅ SANITIZAR TEXTO PARA HTML
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ✅ FECHAR MODAL GENÉRICO
    fecharModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            
            // Limpar formulários
            const forms = modal.querySelectorAll('input, textarea, select');
            forms.forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
                input.classList.remove('input-error');
            });
            
            // Ocultar mensagens de erro
            const errorMessages = modal.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.classList.add('hidden'));
        }
    },

    // ✅ ABRIR MODAL GENÉRICO
    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    // ✅ CAPITALIZAR PRIMEIRA LETRA
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // ✅ TRUNCAR TEXTO
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // ✅ CONVERTER PARA SLUG
    toSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .trim()
            .replace(/\s+/g, '-'); // Substitui espaços por hífens
    },

    // ✅ VALIDAR EMAIL
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // ✅ FORMATAR HORÁRIO
    formatarHorario(horario) {
        if (!horario) return '';
        return horario.substring(0, 5); // Remove segundos se houver
    },

    // ✅ OBTER COR PELO TIPO
    obterCorPorTipo(tipo) {
        const cores = {
            'reuniao': '#3b82f6',
            'entrega': '#10b981',
            'prazo': '#ef4444',
            'marco': '#8b5cf6',
            'outro': '#6b7280'
        };
        return cores[tipo] || cores.outro;
    },

    // ✅ FORMATAR NÚMERO COM SEPARADOR DE MILHARES
    formatarNumero(numero) {
        return new Intl.NumberFormat('pt-BR').format(numero);
    },

    // ✅ COPIAR PARA CLIPBOARD
    async copiarParaClipboard(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    // ✅ DOWNLOAD DE ARQUIVO
    downloadFile(content, fileName, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    },

    // ✅ STORAGE LOCAL SEGURO
    storage: {
        set(key, value) {
            try {
                const data = {
                    value: value,
                    timestamp: Date.now(),
                    version: '6.2'
                };
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.warn('Erro ao salvar no localStorage:', error);
                return false;
            }
        },

        get(key) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const data = JSON.parse(item);
                return data.value;
            } catch (error) {
                console.warn('Erro ao ler do localStorage:', error);
                return null;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Erro ao remover do localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Erro ao limpar localStorage:', error);
                return false;
            }
        }
    },

    // ✅ UTILITÁRIOS DE ARRAY
    array: {
        // Remove duplicatas
        unique(arr) {
            return [...new Set(arr)];
        },

        // Agrupa por propriedade
        groupBy(arr, key) {
            return arr.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        // Ordena por propriedade
        sortBy(arr, key, ascending = true) {
            return arr.sort((a, b) => {
                if (ascending) {
                    return a[key] > b[key] ? 1 : -1;
                } else {
                    return a[key] < b[key] ? 1 : -1;
                }
            });
        },

        // Embaralha array
        shuffle(arr) {
            const newArr = [...arr];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    },

    // ✅ UTILITÁRIOS DE STRING
    string: {
        // Remove espaços extras
        clean(str) {
            return str.replace(/\s+/g, ' ').trim();
        },

        // Conta palavras
        wordCount(str) {
            return str.trim().split(/\s+/).length;
        },

        // Extrai iniciais
        getInitials(str) {
            return str
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');
        }
    },

    // ✅ PERFORMANCE E TIMING
    performance: {
        // Marca início de medição
        mark(label) {
            if (performance.mark) {
                performance.mark(`${label}-start`);
            }
        },

        // Mede tempo decorrido
        measure(label) {
            if (performance.mark && performance.measure) {
                performance.mark(`${label}-end`);
                performance.measure(label, `${label}-start`, `${label}-end`);
                
                const measures = performance.getEntriesByName(label);
                if (measures.length > 0) {
                    return Math.round(measures[0].duration);
                }
            }
            return null;
        }
    }
};

// ✅ INICIALIZAÇÃO DOS HELPERS
document.addEventListener('DOMContentLoaded', () => {
    Helpers.initDOMCache();
});

console.log('🔧 Helpers v6.2 carregados!');
