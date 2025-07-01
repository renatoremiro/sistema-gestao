/* ========== 🚀 CORE APP v6.2 - ESTADO GLOBAL E INICIALIZAÇÃO ========== */

const App = {
    // ✅ VERSÃO E CONSTANTES
    VERSAO_SISTEMA: '6.2',
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
        versaoSistema: '6.2',
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

    // ✅ INICIALIZAÇÃO PRINCIPAL DO SISTEMA
    async inicializarSistema() {
        try {
            console.log('🚀 Iniciando sistema v6.2...');
            Helpers.performance.mark('inicializacao');

            // Verificar se já foi inicializado
            if (this.estadoSistema.sistemaInicializado) {
                console.log('⚠️ Sistema já inicializado');
                return;
            }

            // Inicializar cache DOM
            Helpers.initDOMCache();

            // Verificar conectividade Firebase
            const conectado = await verificarConectividade();
            if (!conectado) {
                Notifications.warning('Modo offline - algumas funcionalidades limitadas');
            }

            // Carregar dados
            await this.carregarDados();

            // Configurar interface
            this.configurarInterface();

            // Renderizar dashboard inicial
            this.renderizarDashboard();

            // Iniciar verificação de prazos
            this.iniciarVerificacaoPrazos();

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

        // Gerar calendário
        this.gerarCalendario();

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

    // ✅ GERAR CALENDÁRIO
    gerarCalendario() {
        const calendario = document.getElementById('calendario');
        if (!calendario) return;

        console.log(`📅 Gerando calendário: ${this.estadoSistema.mesAtual + 1}/${this.estadoSistema.anoAtual}`);

        // Limpar calendário
        calendario.innerHTML = '';

        // Adicionar cabeçalhos dos dias
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        diasSemana.forEach(dia => {
            const diaHeader = document.createElement('div');
            diaHeader.className = 'dia-header';
            diaHeader.textContent = dia;
            calendario.appendChild(diaHeader);
        });

        // Gerar dias do mês
        this.gerarDiasDoMes();
    },

    // ✅ GERAR DIAS DO MÊS
    gerarDiasDoMes() {
        const calendario = document.getElementById('calendario');
        const primeiroDia = new Date(this.estadoSistema.anoAtual, this.estadoSistema.mesAtual, 1);
        const ultimoDia = new Date(this.estadoSistema.anoAtual, this.estadoSistema.mesAtual + 1, 0);
        const primeiroDiaSemana = primeiroDia.getDay();

        let diaAtual = 1;

        // Gerar 6 semanas (42 células)
        for (let i = 0; i < 42; i++) {
            const diaElement = document.createElement('div');
            diaElement.className = 'dia';

            if (i >= primeiroDiaSemana && diaAtual <= ultimoDia.getDate()) {
                this.configurarDia(diaElement, diaAtual);
                diaAtual++;
            } else {
                diaElement.style.visibility = 'hidden';
            }

            calendario.appendChild(diaElement);
        }
    },

    // ✅ CONFIGURAR DIA DO CALENDÁRIO
    configurarDia(diaElement, numeroDia) {
        const dataCompleta = `${this.estadoSistema.anoAtual}-${String(this.estadoSistema.mesAtual + 1).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
        
        // Criar estrutura do dia
        const diaNumero = document.createElement('div');
        diaNumero.className = 'dia-numero';
        diaNumero.textContent = numeroDia;

        // Verificar se é feriado
        if (this.dados?.feriados?.[dataCompleta]) {
            diaElement.classList.add('dia-feriado');
            const feriado = document.createElement('span');
            feriado.className = 'feriado-label';
            feriado.textContent = 'FERIADO';
            diaNumero.appendChild(feriado);
        }

        diaElement.appendChild(diaNumero);

        // Adicionar eventos do dia
        this.adicionarEventosNoDia(diaElement, dataCompleta);

        // Adicionar evento de clique
        diaElement.addEventListener('click', () => {
            this.abrirDetalheDia(dataCompleta);
        });
    },

    // ✅ ADICIONAR EVENTOS NO DIA
    adicionarEventosNoDia(diaElement, data) {
        if (!this.dados?.eventos) return;

        const eventosoDia = this.dados.eventos.filter(evento => evento.data === data);
        const eventosVisiveis = eventosoDia.slice(0, this.MAX_EVENTOS_VISIVEIS);
        const eventosRestantes = eventosoDia.length - this.MAX_EVENTOS_VISIVEIS;

        eventosVisiveis.forEach(evento => {
            const eventoElement = document.createElement('div');
            eventoElement.className = `mini-evento evento-${evento.tipo}`;
            eventoElement.textContent = `${evento.horarioInicio || ''} ${Helpers.truncateText(evento.titulo, 15)}`;
            
            eventoElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarDetalhesEvento(evento);
            });

            diaElement.appendChild(eventoElement);
        });

        // Mostrar indicador de mais eventos
        if (eventosRestantes > 0) {
            const maisEventos = document.createElement('div');
            maisEventos.className = 'mais-eventos-mini';
            maisEventos.textContent = `+${eventosRestantes} mais`;
            maisEventos.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarTodosEventosDia(data);
            });
            diaElement.appendChild(maisEventos);
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

    // ✅ MÉTODOS PLACEHOLDER (serão implementados nos módulos específicos)
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

    mostrarDetalhesEvento(evento) {
        console.log('📅 Detalhes do evento:', evento);
        // Implementação no módulo de eventos
    },

    mostrarTodosEventosDia(data) {
        console.log('📅 Todos eventos do dia:', data);
        // Implementação no módulo de eventos
    },

    abrirDetalheDia(data) {
        console.log('📅 Detalhe do dia:', data);
        // Implementação no módulo de calendário
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

    // ✅ NAVEGAÇÃO DE MÊS
    mudarMes(direcao) {
        this.estadoSistema.mesAtual += direcao;
        
        if (this.estadoSistema.mesAtual > 11) {
            this.estadoSistema.mesAtual = 0;
            this.estadoSistema.anoAtual++;
        } else if (this.estadoSistema.mesAtual < 0) {
            this.estadoSistema.mesAtual = 11;
            this.estadoSistema.anoAtual--;
        }
        
        this.atualizarMesAno();
        this.gerarCalendario();
        this.atualizarEstatisticas();
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

console.log('🚀 Core App v6.2 carregado!');
