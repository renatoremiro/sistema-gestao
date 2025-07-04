/* ========== 🚀 CORE APP v7.3.0 - LIMPO SEM DUPLICAÇÕES ========== */

const App = {
    // ✅ VERSÃO E CONSTANTES
    VERSAO_SISTEMA: '7.3.0',
    VERSAO_DB: 7,
    INTERVALO_VERIFICACAO_PRAZOS: 3600000, // 1 hora
    MAX_EVENTOS_VISIVEIS: 5,

    // ✅ ESTADO GLOBAL DO SISTEMA
    estadoSistema: {
        mesAtual: 6,  // Julho = 6 (0-indexed)
        anoAtual: 2025,
        areaAtual: null,
        pessoaAtual: null,
        filtroAtual: 'todos',
        editandoAtividade: null,
        editandoEvento: null,
        pessoasSelecionadas: new Set(),
        versaoSistema: '7.3.0',
        usuarioEmail: null,
        usuarioNome: null,
        alertasPrazosExibidos: new Set(),
        sistemaInicializado: false
    },

    // ✅ VARIÁVEIS GLOBAIS
    usuarioAtual: null,
    dados: null,
    listenersDados: {},
    intervaloPrazos: null,

    // ✅ INICIALIZAÇÃO PRINCIPAL DO SISTEMA - LIMPA
    async inicializarSistema() {
        try {
            console.log('🚀 Iniciando sistema v7.3.0...');
            
            // Verificar se já foi inicializado
            if (this.estadoSistema.sistemaInicializado) {
                return;
            }

            // Verificar conectividade Firebase
            const conectado = await this.verificarConectividade();
            if (!conectado) {
                Notifications.warning('Modo offline - funcionalidades limitadas');
            }

            // Carregar dados ANTES de configurar interface
            await this.carregarDados();

            // Configurar interface
            this.configurarInterface();

            // Renderizar dashboard DEPOIS dos dados
            this.renderizarDashboard();

            // Iniciar verificação de prazos
            this.iniciarVerificacaoPrazos();

            // ✅ DELEGAÇÃO TOTAL: Calendar.js controla 100% do calendário
            console.log('📅 Calendar.js assumiu controle total do calendário');

            // Marcar como inicializado
            this.estadoSistema.sistemaInicializado = true;

            console.log('✅ Sistema inicializado com sucesso');
            Notifications.success('Sistema inicializado!');

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            Notifications.error('Erro ao inicializar sistema');
            this.mostrarErroInicializacao(error);
        }
    },

    // ✅ CARREGAR DADOS DO FIREBASE
    async carregarDados() {
        try {
            const snapshot = await database.ref('dados').once('value');
            const dadosFirebase = snapshot.val();

            if (dadosFirebase && DataStructure.validarEstrutura(dadosFirebase)) {
                this.dados = dadosFirebase;
            } else {
                this.dados = DataStructure.inicializarDados();
                await this.salvarDados();
            }

            // Garantir estrutura de tarefas
            if (!this.dados.tarefas) {
                this.dados.tarefas = [];
            }

            // Configurar listeners para mudanças
            this.configurarListeners();

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            
            // Tentar backup local
            const backup = Helpers.storage.get('sistemaBackup');
            if (backup) {
                this.dados = backup;
                Notifications.warning('Usando backup local');
            } else {
                this.dados = DataStructure.inicializarDados();
                if (!this.dados.tarefas) {
                    this.dados.tarefas = [];
                }
                Notifications.error('Usando dados padrão');
            }
        }
    },

    // ✅ CONFIGURAR INTERFACE INICIAL
    configurarInterface() {
        // Atualizar informações do usuário
        if (this.usuarioAtual) {
            this.estadoSistema.usuarioEmail = this.usuarioAtual.email;
            this.estadoSistema.usuarioNome = this.usuarioAtual.displayName || this.usuarioAtual.email;
            
            const usuarioInfo = document.getElementById('usuarioInfo');
            if (usuarioInfo) {
                usuarioInfo.textContent = `👤 ${this.estadoSistema.usuarioNome}`;
            }
        }

        // Configurar data atual
        this.atualizarDataAtual();

        // Configurar eventos globais
        this.configurarEventosGlobais();
    },

    // ✅ RENDERIZAR DASHBOARD PRINCIPAL
    renderizarDashboard() {
        // Mostrar container principal
        const mainContainer = document.getElementById('mainContainer');
        const loginScreen = document.getElementById('loginScreen');
        
        if (mainContainer && loginScreen) {
            mainContainer.classList.remove('hidden');
            loginScreen.classList.add('hidden');
        }

        // Atualizar estatísticas
        this.atualizarEstatisticas();

        // Renderizar áreas
        this.renderizarAreas();

        // Configurar busca
        this.configurarBusca();
    },

    // ✅ ATUALIZAR ESTATÍSTICAS
    atualizarEstatisticas() {
        if (!this.dados) return;

        const stats = DataStructure.calcularEstatisticas(this.dados);
        
        // ✅ DELEGAÇÃO: usar Calendar.js para estatísticas do mês
        let eventosDoMes = 0;
        if (typeof Calendar !== 'undefined') {
            const statsCalendar = Calendar.obterEstatisticasDoMes();
            eventosDoMes = statsCalendar.totalEventos || 0;
        }

        // Atualizar números
        this.atualizarElemento('statEmDia', stats.emDia);
        this.atualizarElemento('statAtencao', stats.atencao);
        this.atualizarElemento('statAtraso', stats.atraso);
        this.atualizarElemento('statEventos', eventosDoMes);

        // Atualizar barras de progresso
        const total = stats.total || 1;
        this.atualizarProgresso('progressEmDia', (stats.emDia / total) * 100);
        this.atualizarProgresso('progressAtencao', (stats.atencao / total) * 100);
        this.atualizarProgresso('progressAtraso', (stats.atraso / total) * 100);
    },

    // ✅ RENDERIZAR ÁREAS DE TRABALHO
    renderizarAreas() {
        const areasGrid = document.getElementById('areasGrid');
        if (!areasGrid || !this.dados?.areas) return;

        areasGrid.innerHTML = '';

        Object.entries(this.dados.areas).forEach(([chave, area]) => {
            const areaCard = this.criarCardArea(chave, area);
            areasGrid.appendChild(areaCard);
        });
    },

    // ✅ CRIAR CARD DE ÁREA
    criarCardArea(chave, area) {
        const card = document.createElement('div');
        card.className = 'card area-card';
        card.style.borderLeft = `4px solid ${area.cor}`;

        const stats = this.calcularStatsArea(area);

        card.innerHTML = `
            <h3 style="color: ${area.cor};">${area.nome}</h3>
            <p style="color: #6b7280; margin-bottom: 16px;">${area.coordenador}</p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                <div class="resumo-box">
                    <div class="resumo-numero" style="color: #10b981;">${stats.emDia}</div>
                    <div>Em Dia</div>
                </div>
                <div class="resumo-box">
                    <div class="resumo-numero" style="color: #f59e0b;">${stats.atencao}</div>
                    <div>Atenção</div>
                </div>
                <div class="resumo-box">
                    <div class="resumo-numero" style="color: #ef4444;">${stats.atraso}</div>
                    <div>Atraso</div>
                </div>
            </div>
            
            <p><strong>Equipe:</strong> ${area.equipe ? area.equipe.length : 0} pessoas</p>
            <p><strong>Atividades:</strong> ${area.atividades ? area.atividades.length : 0} total</p>
        `;

        card.addEventListener('click', () => {
            this.abrirArea(chave);
        });

        return card;
    },

    // ✅ CALCULAR ESTATÍSTICAS DA ÁREA
    calcularStatsArea(area) {
        if (!area.atividades) {
            return { emDia: 0, atencao: 0, atraso: 0, total: 0 };
        }

        const stats = { emDia: 0, atencao: 0, atraso: 0, total: area.atividades.length };

        area.atividades.forEach(atividade => {
            switch (atividade.status) {
                case 'verde': stats.emDia++; break;
                case 'amarelo': stats.atencao++; break;
                case 'vermelho': stats.atraso++; break;
            }
        });

        return stats;
    },

    // ✅ NAVEGAÇÃO ENTRE TELAS
    voltarDashboard() {
        document.getElementById('dashboardExecutivo').classList.remove('hidden');
        document.getElementById('painelArea').classList.add('hidden');
        document.getElementById('agendaIndividual').classList.add('hidden');
        
        this.estadoSistema.areaAtual = null;
        this.estadoSistema.pessoaAtual = null;
        this.atualizarBreadcrumb();
    },

    voltarParaArea() {
        if (this.estadoSistema.areaAtual) {
            this.abrirArea(this.estadoSistema.areaAtual);
        } else {
            this.voltarDashboard();
        }
    },

    abrirArea(chaveArea) {
        this.estadoSistema.areaAtual = chaveArea;
        console.log('🏢 Abrindo área:', chaveArea);
    },

    // ✅ UTILITÁRIOS
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    },

    atualizarProgresso(id, porcentagem) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.width = `${porcentagem}%`;
        }
    },

    atualizarDataAtual() {
        const dataAtual = document.getElementById('dataAtual');
        if (dataAtual) {
            dataAtual.textContent = new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },

    atualizarBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        const breadcrumbPath = document.getElementById('breadcrumbPath');
        
        if (!breadcrumb || !breadcrumbPath) return;

        let caminho = '<a onclick="App.voltarDashboard()">Dashboard</a>';
        
        if (this.estadoSistema.areaAtual) {
            const area = this.dados?.areas?.[this.estadoSistema.areaAtual];
            if (area) {
                caminho += ` <span>></span> <a onclick="App.abrirArea('${this.estadoSistema.areaAtual}')">${area.nome}</a>`;
            }
        }
        
        if (this.estadoSistema.pessoaAtual) {
            caminho += ` <span>></span> <span>${this.estadoSistema.pessoaAtual}</span>`;
        }

        breadcrumbPath.innerHTML = caminho;
        breadcrumb.classList.remove('hidden');
    },

    // ✅ CONFIGURAR EVENTOS GLOBAIS
    configurarEventosGlobais() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharTodosModals();
            }
        });

        // Busca global com debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const buscarDebounced = Helpers.debounce(this.buscarGlobal.bind(this), 300);
            searchInput.addEventListener('input', buscarDebounced);
        }
    },

    // ✅ CONFIGURAR LISTENERS FIREBASE
    configurarListeners() {
        // Listener para mudanças nos dados
        this.listenersDados.principal = database.ref('dados').on('value', (snapshot) => {
            const dadosAtualizados = snapshot.val();
            if (dadosAtualizados && dadosAtualizados.ultimoUsuario !== this.estadoSistema.usuarioEmail) {
                this.dados = dadosAtualizados;
                this.renderizarDashboard();
                
                // ✅ Atualizar Calendar.js quando dados mudarem
                if (typeof Calendar !== 'undefined') {
                    Calendar.gerar();
                }
                
                Notifications.info('Dados atualizados automaticamente');
            }
        });
    },

    // ✅ VERIFICAÇÃO DE PRAZOS
    iniciarVerificacaoPrazos() {
        this.verificarPrazos();
        this.intervaloPrazos = setInterval(() => {
            this.verificarPrazos();
        }, this.INTERVALO_VERIFICACAO_PRAZOS);
    },

    verificarPrazos() {
        if (!this.dados?.areas) return;

        const proximosDias = 3;

        Object.values(this.dados.areas).forEach(area => {
            if (area.atividades) {
                area.atividades.forEach(atividade => {
                    const diasAte = Helpers.calcularDiasAte(atividade.prazo);
                    
                    if (diasAte <= proximosDias && diasAte >= 0) {
                        const alertaId = `prazo-${atividade.id}`;
                        
                        if (!this.estadoSistema.alertasPrazosExibidos.has(alertaId)) {
                            this.mostrarAlertaPrazo(atividade, diasAte);
                            this.estadoSistema.alertasPrazosExibidos.add(alertaId);
                        }
                    }
                });
            }
        });
    },

    mostrarAlertaPrazo(atividade, dias) {
        const tipo = dias === 0 ? 'error' : 'warning';
        const mensagem = dias === 0 
            ? `⏰ PRAZO HOJE: ${atividade.nome}`
            : `⚠️ Prazo em ${dias} dia(s): ${atividade.nome}`;
        
        Notifications.mostrarNotificacao(mensagem, tipo, 8000);
    },

    // ✅ MÉTODOS AUXILIARES
    buscarGlobal() {
        console.log('🔍 Busca global - implementar no módulo de busca');
    },

    filtrarStatus(status, elemento) {
        console.log('🔽 Filtro:', status);
    },

    fecharTodosModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    // ✅ DELEGAÇÕES PARA OUTROS MÓDULOS
    mostrarDetalhesEvento(evento) {
        if (typeof Events !== 'undefined' && typeof Events.mostrarDetalhesEvento === 'function') {
            Events.mostrarDetalhesEvento(evento);
        }
    },

    // ✅ SALVAMENTO DE DADOS
    async salvarDados() {
        console.log('💾 Salvando dados...');
        return Promise.resolve();
    },

    // ✅ TRATAMENTO DE ERROS
    mostrarErroInicializacao(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fee2e2;
            border: 2px solid #ef4444;
            color: #991b1b;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            z-index: 9999;
        `;
        
        errorDiv.innerHTML = `
            <h3>❌ Erro de Inicialização</h3>
            <p>O sistema não pôde ser inicializado completamente.</p>
            <details style="margin-top: 12px;">
                <summary>Detalhes técnicos</summary>
                <pre style="margin-top: 8px; font-size: 12px;">${error.message}</pre>
            </details>
            <button onclick="location.reload()" 
                    style="margin-top: 16px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Recarregar Sistema
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    },

    configurarBusca() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = 'Buscar atividades, pessoas, eventos...';
        }
    },

    // ✅ VERIFICAÇÃO DE CONECTIVIDADE
    async verificarConectividade() {
        try {
            return navigator.onLine;
        } catch (error) {
            console.warn('Erro ao verificar conectividade:', error);
            return false;
        }
    },

    // ✅ STATUS DO SISTEMA
    obterStatusSistema() {
        return {
            versao: this.VERSAO_SISTEMA,
            inicializado: this.estadoSistema.sistemaInicializado,
            dadosCarregados: !!this.dados,
            usuarioLogado: !!this.usuarioAtual,
            modulosDisponiveis: {
                Calendar: typeof Calendar !== 'undefined',
                Events: typeof Events !== 'undefined', 
                Tasks: typeof Tasks !== 'undefined',
                PDF: typeof PDF !== 'undefined',
                Notifications: typeof Notifications !== 'undefined',
                Persistence: typeof Persistence !== 'undefined'
            },
            calendarioControlado: typeof Calendar !== 'undefined'
        };
    }
};

// ✅ EXPOSIÇÃO CONSOLIDADA NO WINDOW GLOBAL (UMA ÚNICA VEZ)
window.App = App;
window.inicializarSistema = () => App.inicializarSistema();
window.testarStatusApp = () => {
    const status = App.obterStatusSistema();
    console.log('📊 Status do Sistema:', status);
    
    // Testar integração com Calendar.js
    if (status.modulosDisponiveis.Calendar) {
        const statusCalendar = Calendar.obterStatus();
        console.log('📅 Status Calendar:', statusCalendar);
    }
    
    return status;
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA QUANDO AUTENTICADO
auth.onAuthStateChanged((user) => {
    if (user) {
        App.usuarioAtual = user;
        App.inicializarSistema();
    } else {
        console.log('👤 Aguardando login...');
    }
});

console.log('🚀 Core App v7.3.0 LIMPO - ZERO DUPLICAÇÕES!');
