/* ========== 🚀 CORE APP v6.3.0 - INTEGRAÇÃO CALENDAR.JS CORRIGIDA ========== */

const App = {
    // ✅ VERSÃO E CONSTANTES
    VERSAO_SISTEMA: '6.3.0',
    VERSAO_DB: 6,
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
        versaoSistema: '6.3.0',
        usuarioEmail: null,
        usuarioNome: null,
        alertasPrazosExibidos: new Set(),
        sistemaInicializado: false,
        calendarCarregado: false // ✅ NOVO: tracking do calendar
    },

    // ✅ VARIÁVEIS GLOBAIS
    usuarioAtual: null,
    dados: null,
    listenersDados: {},
    intervaloPrazos: null,

    // ✅ INICIALIZAÇÃO PRINCIPAL DO SISTEMA - CORRIGIDA
    async inicializarSistema() {
        try {
            console.log('🚀 Iniciando sistema v6.3.0...');
            Helpers.performance.mark('inicializacao');

            // Verificar se já foi inicializado
            if (this.estadoSistema.sistemaInicializado) {
                console.log('⚠️ Sistema já inicializado');
                return;
            }

            // Inicializar cache DOM
            Helpers.initDOMCache();

            // Verificar conectividade Firebase
            const conectado = await this.verificarConectividade();
            if (!conectado) {
                Notifications.warning('Modo offline - algumas funcionalidades limitadas');
            }

            // ✅ CORREÇÃO: Carregar dados ANTES de configurar interface
            await this.carregarDados();

            // Configurar interface
            this.configurarInterface();

            // ✅ CORREÇÃO: Renderizar dashboard DEPOIS dos dados
            this.renderizarDashboard();

            // Iniciar verificação de prazos
            this.iniciarVerificacaoPrazos();

            // ✅ NOVO: Aguardar Calendar.js estar disponível e inicializar
            this.aguardarEInicializarCalendar();

            // Marcar como inicializado
            this.estadoSistema.sistemaInicializado = true;

            const tempoInicializacao = Helpers.performance.measure('inicializacao');
            console.log(`✅ Sistema inicializado em ${tempoInicializacao}ms`);
            Notifications.success('Sistema inicializado com sucesso!');

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            Notifications.error('Erro ao inicializar sistema');
            this.mostrarErroInicializacao(error);
        }
    },

    // ✅ NOVA FUNÇÃO: Aguardar e inicializar Calendar.js
    aguardarEInicializarCalendar() {
        console.log('📅 Aguardando Calendar.js estar disponível...');
        
        const tentarInicializar = () => {
            if (typeof Calendar !== 'undefined' && this.dados) {
                console.log('✅ Calendar.js disponível - inicializando...');
                
                // ✅ CORREÇÃO: Conectar estado do App ao Calendar
                Calendar.config.mesAtual = this.estadoSistema.mesAtual;
                Calendar.config.anoAtual = this.estadoSistema.anoAtual;
                
                // ✅ DELEGAÇÃO CORRETA: Usar Calendar.gerar() ao invés do método local
                Calendar.gerar();
                
                this.estadoSistema.calendarCarregado = true;
                console.log('📅 Calendar.js inicializado com sucesso!');
                
                return true;
            }
            return false;
        };
        
        // Tentar imediatamente
        if (!tentarInicializar()) {
            // Se não conseguir, tentar a cada 100ms por até 5 segundos
            let tentativas = 0;
            const maxTentativas = 50;
            
            const interval = setInterval(() => {
                tentativas++;
                
                if (tentarInicializar()) {
                    clearInterval(interval);
                } else if (tentativas >= maxTentativas) {
                    clearInterval(interval);
                    console.warn('⚠️ Calendar.js não pôde ser inicializado automaticamente');
                    Notifications.warning('Módulo de calendário será carregado quando disponível');
                }
            }, 100);
        }
    },

    // ✅ CARREGAR DADOS DO FIREBASE
    async carregarDados() {
        try {
            console.log('📊 Carregando dados...');
            
            const snapshot = await database.ref('dados').once('value');
            const dadosFirebase = snapshot.val();

            if (dadosFirebase && DataStructure.validarEstrutura(dadosFirebase)) {
                this.dados = dadosFirebase;
                console.log('✅ Dados carregados do Firebase');
            } else {
                console.log('🔄 Inicializando dados padrão...');
                this.dados = DataStructure.inicializarDados();
                await this.salvarDados();
            }

            // ✅ CORREÇÃO: Garantir estrutura de tarefas
            if (!this.dados.tarefas) {
                this.dados.tarefas = [];
                console.log('📝 Estrutura de tarefas inicializada');
            }

            // Configurar listeners para mudanças
            this.configurarListeners();

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            
            // Tentar backup local
            const backup = Helpers.storage.get('sistemaBackup');
            if (backup) {
                this.dados = backup;
                Notifications.warning('Usando backup local - verifique conectividade');
            } else {
                this.dados = DataStructure.inicializarDados();
                // ✅ CORREÇÃO: Garantir estrutura de tarefas no fallback
                if (!this.dados.tarefas) {
                    this.dados.tarefas = [];
                }
                Notifications.error('Erro ao carregar dados - usando padrão');
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

        // Configurar mês/ano atual
        this.atualizarMesAno();

        // Configurar eventos globais
        this.configurarEventosGlobais();
    },

    // ✅ RENDERIZAR DASHBOARD PRINCIPAL
    renderizarDashboard() {
        console.log('🎨 Renderizando dashboard...');

        // Mostrar container principal
        const mainContainer = document.getElementById('mainContainer');
        const loginScreen = document.getElementById('loginScreen');
        
        if (mainContainer && loginScreen) {
            mainContainer.classList.remove('hidden');
            loginScreen.classList.add('hidden');
        }

        // Atualizar estatísticas
        this.atualizarEstatisticas();

        // ✅ CORREÇÃO: NÃO chamar gerarCalendario() aqui - será feito pelo Calendar.js
        // this.gerarCalendario(); // ← REMOVIDO

        // Renderizar áreas
        this.renderizarAreas();

        // Configurar busca
        this.configurarBusca();
    },

    // ✅ ATUALIZAR ESTATÍSTICAS
    atualizarEstatisticas() {
        if (!this.dados) return;

        const stats = DataStructure.calcularEstatisticas(this.dados);
        const eventosDoMes = DataStructure.obterEventosDoMes(
            this.dados, 
            this.estadoSistema.mesAtual, 
            this.estadoSistema.anoAtual
        );

        // Atualizar números
        this.atualizarElemento('statEmDia', stats.emDia);
        this.atualizarElemento('statAtencao', stats.atencao);
        this.atualizarElemento('statAtraso', stats.atraso);
        this.atualizarElemento('statEventos', eventosDoMes.length);

        // Atualizar barras de progresso
        const total = stats.total || 1; // Evitar divisão por zero
        this.atualizarProgresso('progressEmDia', (stats.emDia / total) * 100);
        this.atualizarProgresso('progressAtencao', (stats.atencao / total) * 100);
        this.atualizarProgresso('progressAtraso', (stats.atraso / total) * 100);
    },

    // ✅ MÉTODO CORRIGIDO: Delegar para Calendar.js
    gerarCalendario() {
        if (typeof Calendar !== 'undefined') {
            console.log('📅 Delegando para Calendar.gerar()...');
            Calendar.gerar();
        } else {
            console.warn('⚠️ Calendar.js ainda não disponível');
            // Tentar novamente em 1 segundo
            setTimeout(() => {
                this.gerarCalendario();
            }, 1000);
        }
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
        // Implementação completa será no módulo de áreas
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

    atualizarMesAno() {
        const mesAno = document.getElementById('mesAno');
        if (mesAno) {
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            mesAno.textContent = `${meses[this.estadoSistema.mesAtual]} ${this.estadoSistema.anoAtual}`;
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
                
                // ✅ CORREÇÃO: Atualizar Calendar.js quando dados mudarem
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

        const hoje = new Date();
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

    // ✅ MÉTODOS DELEGADOS AO CALENDAR.JS - CORRIGIDOS
    buscarGlobal() {
        console.log('🔍 Busca global - implementar no módulo de busca');
    },

    filtrarStatus(status, elemento) {
        console.log('🔽 Filtro:', status);
        // Implementação no módulo de filtros
    },

    fecharTodosModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    // ✅ CORREÇÃO CRÍTICA: Delegar para Calendar.js
    mostrarDetalhesEvento(evento) {
        if (typeof Events !== 'undefined' && typeof Events.mostrarDetalhesEvento === 'function') {
            Events.mostrarDetalhesEvento(evento);
        } else {
            console.log('📅 Detalhes do evento:', evento);
            Notifications.info('Módulo de eventos carregando...');
        }
    },

    mostrarTodosEventosDia(data) {
        if (typeof Calendar !== 'undefined' && typeof Calendar.mostrarTodosEventosDia === 'function') {
            Calendar.mostrarTodosEventosDia(data);
        } else {
            console.log('📅 Todos eventos do dia:', data);
            Notifications.info('Módulo de calendário carregando...');
        }
    },

    abrirDetalheDia(data) {
        // ✅ CORREÇÃO PRINCIPAL: Conectar ao Calendar.js real
        if (typeof Calendar !== 'undefined' && typeof Calendar.mostrarTodosEventosDia === 'function') {
            Calendar.mostrarTodosEventosDia(data);
        } else {
            console.log('📅 Detalhe do dia:', data);
            Notifications.info('Módulo de calendário carregando...');
            
            // Tentar carregar quando disponível
            setTimeout(() => {
                this.abrirDetalheDia(data);
            }, 500);
        }
    },

    // ✅ SALVAMENTO DE DADOS (placeholder - será no módulo persistence)
    async salvarDados() {
        console.log('💾 Salvando dados...');
        // Implementação no módulo de persistência
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

    // ✅ CONFIGURAÇÃO DE BUSCA
    configurarBusca() {
        // Implementação básica - será expandida no módulo de busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = 'Buscar atividades, pessoas, eventos...';
        }
    },

    // ✅ NAVEGAÇÃO DE MÊS CORRIGIDA - Delegar para Calendar.js
    mudarMes(direcao) {
        // ✅ CORREÇÃO: Atualizar tanto App.js quanto Calendar.js
        this.estadoSistema.mesAtual += direcao;
        
        if (this.estadoSistema.mesAtual > 11) {
            this.estadoSistema.mesAtual = 0;
            this.estadoSistema.anoAtual++;
        } else if (this.estadoSistema.mesAtual < 0) {
            this.estadoSistema.mesAtual = 11;
            this.estadoSistema.anoAtual--;
        }
        
        // Atualizar display
        this.atualizarMesAno();
        
        // ✅ DELEGAÇÃO CORRETA: Usar Calendar.js para navegação
        if (typeof Calendar !== 'undefined') {
            Calendar.config.mesAtual = this.estadoSistema.mesAtual;
            Calendar.config.anoAtual = this.estadoSistema.anoAtual;
            Calendar.gerar();
        }
        
        // Atualizar estatísticas
        this.atualizarEstatisticas();
    },

    // ✅ NOVA FUNÇÃO: Verificar conectividade
    async verificarConectividade() {
        try {
            // Implementação básica - será expandida
            return navigator.onLine;
        } catch (error) {
            console.warn('Erro ao verificar conectividade:', error);
            return false;
        }
    },

    // ✅ NOVA FUNÇÃO: Status do sistema
    obterStatusSistema() {
        return {
            versao: this.VERSAO_SISTEMA,
            inicializado: this.estadoSistema.sistemaInicializado,
            calendarCarregado: this.estadoSistema.calendarCarregado,
            dadosCarregados: !!this.dados,
            usuarioLogado: !!this.usuarioAtual,
            modulosDisponiveis: {
                Calendar: typeof Calendar !== 'undefined',
                Events: typeof Events !== 'undefined', 
                Tasks: typeof Tasks !== 'undefined',
                PDF: typeof PDF !== 'undefined',
                Notifications: typeof Notifications !== 'undefined',
                Persistence: typeof Persistence !== 'undefined'
            }
        };
    }
};

// ✅ FUNÇÃO GLOBAL PARA INICIALIZAÇÃO (compatibilidade)
window.inicializarSistema = () => App.inicializarSistema();

// ✅ INICIALIZAÇÃO AUTOMÁTICA QUANDO AUTENTICADO
auth.onAuthStateChanged((user) => {
    if (user) {
        App.usuarioAtual = user;
        App.inicializarSistema();
    } else {
        console.log('👤 Usuário não autenticado - aguardando login');
        // Mostrar tela de login (será implementado no módulo auth)
    }
});

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE COM INDEX.HTML
window.testarStatusApp = () => {
    const status = App.obterStatusSistema();
    console.log('📊 Status do Sistema:', status);
    
    // Testar integração com Calendar.js
    if (status.modulosDisponiveis.Calendar) {
        console.log('📅 Testando Calendar.js...');
        const statusCalendar = Calendar.obterStatus();
        console.log('📅 Status Calendar:', statusCalendar);
        
        if (typeof Calendar_Debug !== 'undefined') {
            console.log('🧪 Ativando debug mode...');
            Calendar_Debug.enableDebug();
        }
    }
    
    return status;
};

console.log('🚀 Core App v6.3.0 CORRIGIDO - Integração Calendar.js perfeita!');
console.log('✅ Correções aplicadas: delegação Calendar.js, ordem de inicialização, métodos conectados');
console.log('🧪 Teste: window.testarStatusApp() para verificar integração');
