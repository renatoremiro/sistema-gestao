// ============================================
// 💼 SISTEMA DE CHAT PROFISSIONAL - GESTÃO DE OBRA
// ============================================

// ✅ BASE DE DADOS DE USUÁRIOS REAIS
const USUARIOS_SISTEMA = {
    'bruabritto@biapo.com.br': {
        nome: 'Bruna',
        cargo: 'Arquiteta Trainee',
        area: 'Documentação & Arquivo',
        senha: 'Bruna@2025',
        ativo: true,
        nivel: 'colaborador'
    },
    'isabella@biapo.com.br': {
        nome: 'Isabella',
        cargo: 'Coordenadora Geral',
        area: 'Planejamento & Controle de Obra',
        senha: 'Isabella@2025',
        ativo: true,
        nivel: 'coordenador'
    },
    'renatoremiro@biapo.com.br': {
        nome: 'Renato',
        cargo: 'Coordenador',
        area: 'Documentação & Arquivo',
        senha: 'Renato@2025',
        ativo: true,
        nivel: 'coordenador'
    },
    'redeinterna.obra3@gmail.com': {
        nome: 'Juliana A.',
        cargo: 'Estagiária de Arquitetura',
        area: 'Documentação & Arquivo',
        senha: 'Juliana@2025',
        ativo: true,
        nivel: 'colaborador'
    },
    'eduardo@biapo.com.br': {
        nome: 'Eduardo',
        cargo: 'Coordenador Eng. Civil',
        area: 'Produção & Qualidade',
        senha: 'Eduardo@2025',
        ativo: true,
        nivel: 'coordenador'
    },
    'carlosmendonca@biapo.com.br': {
        nome: 'Beto',
        cargo: 'Coordenador Arquiteto',
        area: 'Produção & Qualidade',
        senha: 'Beto@2025',
        ativo: true,
        nivel: 'coordenador'
    },
    'alex@biapo.com.br': {
        nome: 'Alex',
        cargo: 'Comprador',
        area: 'Produção & Qualidade',
        senha: 'Alex@2025',
        ativo: true,
        nivel: 'colaborador'
    },
    'laracoutinho@biapo.com.br': {
        nome: 'Lara',
        cargo: 'Arquiteta Trainee',
        area: 'Planejamento & Controle de Obra',
        senha: 'Lara@2025',
        ativo: true,
        nivel: 'colaborador'
    },
    'emanoelimoreira@biapo.com.br': {
        nome: 'Manu',
        cargo: 'Assistente de Arquitetura',
        area: 'Produção & Qualidade',
        senha: 'Manu@2025',
        ativo: true,
        nivel: 'colaborador'
    },
    'estagio292@biapo.com.br': {
        nome: 'Jean',
        cargo: 'Estagiário de Eng. Civil',
        area: 'Produção & Qualidade',
        senha: 'Jean@2025',
        ativo: true,
        nivel: 'colaborador'
    }
};

// ✅ CONFIGURAÇÕES DE NOTIFICAÇÃO PROFISSIONAL
const CONFIG_NOTIFICACOES = {
    horarioComercial: { inicio: 8, fim: 18 },
    nivelPrioridade: {
        emergencia: { som: 'alto', persistir: true, cor: '#ef4444' },
        urgente: { som: 'medio', persistir: false, cor: '#f59e0b' },
        normal: { som: 'baixo', persistir: false, cor: '#3b82f6' },
        info: { som: 'none', persistir: false, cor: '#6b7280' }
    },
    tiposChat: {
        global: 'normal',
        area: 'normal',
        projeto: 'urgente',
        privado: 'normal',
        coordenacao: 'urgente'
    }
};

class ChatSystemProfissional {
    constructor() {
        this.chatRef = null;
        this.usuario = null;
        this.areas = null;
        this.chatAtivo = 'global';
        this.mensagensNaoLidas = new Map();
        this.listeners = new Map();
        this.isOpen = false;
        this.usuariosOnline = new Map();
        this.ultimasMensagens = new Map();
        this.notificationListeners = new Map();
        this.statusUsuario = 'online'; // online, ocupado, ausente, reuniao
        this.modoNaoPerturbe = false;
        this.mensagensReagidas = new Map();
        this.threadsAtivos = new Map();
        
        this.aguardarInicializacao();
    }

    aguardarInicializacao() {
        const verificar = () => {
            if (window.usuarioAtual && window.dados && window.database) {
                this.usuario = window.usuarioAtual;
                this.areas = window.dados.areas;
                this.chatRef = window.database.ref('chat');
                
                console.log('✅ Chat System Profissional - Iniciando com usuário:', this.usuario.email);
                this.init();
            } else {
                console.log('⏳ Chat System - Aguardando sistema principal...');
                setTimeout(verificar, 500);
            }
        };
        verificar();
    }

    async init() {
        this.criarInterface();
        this.configurarEventListeners();
        
        try {
            await this.inicializarFirebase();
            this.carregarChats();
            this.monitorarUsuariosOnline();
            this.marcarUsuarioOnline();
            this.iniciarNotificacoesInteligentes();
            this.configurarModoNaoPerturbe();
            
            console.log('✅ Sistema de Chat PROFISSIONAL inicializado');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    async inicializarFirebase() {
        try {
            const snapshot = await this.chatRef.once('value');
            if (!snapshot.val()) {
                console.log('🔧 Criando estrutura inicial do chat...');
                await this.chatRef.set({
                    mensagens: { global: {} },
                    usuariosOnline: {},
                    privados: {},
                    reacoes: {},
                    threads: {}
                });
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
        }
    }

    criarInterface() {
        // Remover indicador de sincronização
        const syncIndicator = document.getElementById('syncIndicator');
        if (syncIndicator) {
            syncIndicator.style.display = 'none';
        }

        const chatHTML = `
            <!-- Botão Flutuante Profissional -->
            <div id="chatToggle" class="chat-toggle-pro">
                <div class="chat-icon-container">
                    <span class="chat-icon">💬</span>
                    <span id="chatBadge" class="chat-badge-pro hidden">0</span>
                    <div id="statusIndicator" class="status-indicator-mini online"></div>
                </div>
            </div>

            <!-- Painel do Chat Profissional -->
            <div id="chatPanel" class="chat-panel-pro hidden">
                <!-- Header Profissional -->
                <div class="chat-header-pro">
                    <div class="header-left">
                        <div class="chat-title-section">
                            <h3>💼 Chat da Obra</h3>
                            <div class="subtitle">Obra 292 - Museu Nacional</div>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="header-controls">
                            <!-- Status do Usuário -->
                            <div class="user-status" onclick="chatSystem.toggleStatusMenu()">
                                <div class="status-dot ${this.statusUsuario}" id="userStatusDot"></div>
                                <span id="userStatusText">Online</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            
                            <!-- Menu de Status -->
                            <div id="statusMenu" class="status-menu hidden">
                                <div class="status-option" onclick="chatSystem.setStatus('online')">
                                    <div class="status-dot online"></div>Online
                                </div>
                                <div class="status-option" onclick="chatSystem.setStatus('ocupado')">
                                    <div class="status-dot ocupado"></div>Ocupado
                                </div>
                                <div class="status-option" onclick="chatSystem.setStatus('reuniao')">
                                    <div class="status-dot reuniao"></div>Em Reunião
                                </div>
                                <div class="status-option" onclick="chatSystem.setStatus('ausente')">
                                    <div class="status-dot ausente"></div>Ausente
                                </div>
                                <div class="status-divider"></div>
                                <div class="status-option" onclick="chatSystem.toggleNaoPerturbe()">
                                    <span id="naoPerturbeIcon">🔕</span>
                                    <span id="naoPerturbeText">Não Perturbe</span>
                                </div>
                            </div>
                            
                            <div class="users-online-pro">
                                <span id="usersOnlineCount">👥 0</span>
                            </div>
                            
                            <button class="header-btn" onclick="chatSystem.abrirConfiguracoes()" title="Configurações">⚙️</button>
                            <button class="header-btn" onclick="chatSystem.limparChat()" title="Limpar Chat">🗑️</button>
                            <button class="header-btn" onclick="chatSystem.toggleChat()" title="Minimizar">−</button>
                            <button class="header-btn close-btn" onclick="chatSystem.toggleChat()" title="Fechar">×</button>
                        </div>
                    </div>
                </div>

                <div class="chat-content-pro">
                    <!-- Sidebar Profissional -->
                    <div class="chat-sidebar-pro">
                        <!-- Busca Avançada -->
                        <div class="search-section-pro">
                            <div class="search-input-container">
                                <input type="text" id="chatSearchPro" placeholder="🔍 Buscar conversas, mensagens..." 
                                       onkeyup="chatSystem.buscarConversas(this.value)">
                                <button class="search-filter-btn" onclick="chatSystem.toggleFiltros()">⚙️</button>
                            </div>
                            
                            <!-- Filtros de Busca -->
                            <div id="searchFilters" class="search-filters hidden">
                                <select id="filtroTempo">
                                    <option value="all">Qualquer período</option>
                                    <option value="today">Hoje</option>
                                    <option value="week">Esta semana</option>
                                    <option value="month">Este mês</option>
                                </select>
                                <select id="filtroPessoa">
                                    <option value="all">Qualquer pessoa</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Lista de Conversas Profissional -->
                        <div class="conversations-section">
                            <!-- Chat Geral -->
                            <div class="conversation-category">
                                <div class="category-header">
                                    <span class="category-icon">🌐</span>
                                    <span class="category-title">Geral</span>
                                </div>
                                <div class="conversation-item active" data-room="global" onclick="chatSystem.abrirChat('global')">
                                    <div class="conversation-info">
                                        <div class="conversation-header">
                                            <span class="conversation-icon">🌐</span>
                                            <span class="conversation-name">Chat Geral</span>
                                            <span class="conversation-time" id="time-global"></span>
                                        </div>
                                        <div class="conversation-preview" id="preview-global">Aguardando mensagens...</div>
                                    </div>
                                    <div class="conversation-meta">
                                        <span class="unread-badge hidden" id="unread-global">0</span>
                                        <div class="priority-indicator" id="priority-global"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Chats por Área -->
                            <div class="conversation-category">
                                <div class="category-header">
                                    <span class="category-icon">📁</span>
                                    <span class="category-title">Por Área</span>
                                    <span class="category-count" id="areasCount">0</span>
                                </div>
                                <div id="chatsAreasPro"></div>
                            </div>

                            <!-- Chats de Projetos -->
                            <div class="conversation-category">
                                <div class="category-header">
                                    <span class="category-icon">📋</span>
                                    <span class="category-title">Projetos</span>
                                    <span class="category-count" id="projetosCount">0</span>
                                </div>
                                <div id="chatsProjetosPro"></div>
                            </div>

                            <!-- Chats Privados -->
                            <div class="conversation-category">
                                <div class="category-header">
                                    <span class="category-icon">👤</span>
                                    <span class="category-title">Conversas Privadas</span>
                                    <span class="category-count" id="privadosCount">0</span>
                                </div>
                                <div id="chatsPrivadosPro"></div>
                                <button class="new-conversation-btn" onclick="chatSystem.novoPrivado()">
                                    <span class="btn-icon">+</span>Nova Conversa
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Área Principal de Mensagens -->
                    <div class="chat-main-pro">
                        <!-- Info do Chat Ativo -->
                        <div class="chat-info-pro">
                            <div class="chat-header-info">
                                <div class="chat-avatar" id="chatAvatar">🌐</div>
                                <div class="chat-details">
                                    <h4 id="chatTitlePro">Chat Geral</h4>
                                    <div class="chat-description">
                                        <span id="chatDescriptionPro">Comunicação geral da obra</span>
                                        <span class="members-info">
                                            👥 <span id="membersCountPro">0</span> membros
                                            <span id="onlineMembersInfo"></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ações do Chat -->
                            <div class="chat-actions">
                                <button class="action-btn" onclick="chatSystem.fixarMensagem()" title="Mensagens Fixadas">📌</button>
                                <button class="action-btn" onclick="chatSystem.abrirArquivos()" title="Arquivos Compartilhados">📎</button>
                                <button class="action-btn" onclick="chatSystem.abrirBusca()" title="Buscar no Chat">🔍</button>
                                <button class="action-btn" onclick="chatSystem.abrirDetalhes()" title="Detalhes do Chat">ℹ️</button>
                            </div>
                        </div>

                        <!-- Área de Mensagens Profissional -->
                        <div class="messages-container-pro" id="messagesContainerPro">
                            <div class="welcome-message-pro">
                                <div class="welcome-icon">💼</div>
                                <h3>Bem-vindo ao Chat Profissional</h3>
                                <p>Sistema de comunicação corporativa da obra</p>
                                <div class="welcome-tips">
                                    <div class="tip">💡 Use @nome para mencionar alguém</div>
                                    <div class="tip">📌 Clique em uma mensagem para reagir</div>
                                    <div class="tip">🔍 Use a busca para encontrar conversas</div>
                                </div>
                            </div>
                        </div>

                        <!-- Área de Input Profissional -->
                        <div class="input-area-pro">
                            <!-- Indicador de Digitação -->
                            <div id="typingIndicatorPro" class="typing-indicator-pro hidden">
                                <div class="typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <span id="typingText">Alguém está digitando...</span>
                            </div>
                            
                            <!-- Container de Input -->
                            <div class="input-container-pro">
                                <div class="input-toolbar">
                                    <button class="toolbar-btn" onclick="chatSystem.anexarArquivo()" title="Anexar Arquivo">📎</button>
                                    <button class="toolbar-btn" onclick="chatSystem.inserirEmoji()" title="Emoji">😊</button>
                                    <button class="toolbar-btn" onclick="chatSystem.inserirMencao()" title="Mencionar">@</button>
                                </div>
                                
                                <div class="input-main">
                                    <textarea id="chatInputPro" placeholder="Digite sua mensagem..." 
                                              onkeydown="chatSystem.handleKeyDown(event)"
                                              oninput="chatSystem.handleTyping(event)"
                                              rows="1"></textarea>
                                    <button id="sendBtnPro" class="send-btn-pro" onclick="chatSystem.enviarMensagem()">
                                        <span class="send-icon">📤</span>
                                    </button>
                                </div>
                                
                                <div class="input-info">
                                    <span id="characterCountPro">0/1000</span>
                                    <span class="input-hints">Enter para enviar, Shift+Enter para nova linha</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Configurações -->
            <div id="configModal" class="modal-pro hidden">
                <div class="modal-content-pro">
                    <div class="modal-header">
                        <h3>⚙️ Configurações do Chat</h3>
                        <button class="modal-close" onclick="chatSystem.fecharConfiguracoes()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="config-section">
                            <h4>🔔 Notificações</h4>
                            <label><input type="checkbox" id="configSom"> Som nas notificações</label>
                            <label><input type="checkbox" id="configDesktop"> Notificações desktop</label>
                            <label><input type="checkbox" id="configHorario"> Respeitar horário comercial</label>
                        </div>
                        <div class="config-section">
                            <h4>🎨 Aparência</h4>
                            <label><input type="radio" name="theme" value="light"> Tema claro</label>
                            <label><input type="radio" name="theme" value="dark"> Tema escuro</label>
                            <label><input type="radio" name="theme" value="auto"> Automático</label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.carregarChatsEspecificos();
        this.preencherFiltrosPessoas();
    }

    // ✅ SISTEMA DE STATUS PROFISSIONAL
    setStatus(novoStatus) {
        this.statusUsuario = novoStatus;
        this.atualizarStatusUI();
        this.salvarStatusOnline();
        
        // Fechar menu
        document.getElementById('statusMenu').classList.add('hidden');
        
        const statusTextos = {
            online: 'Online',
            ocupado: 'Ocupado',
            reuniao: 'Em Reunião',
            ausente: 'Ausente'
        };
        
        window.mostrarNotificacao(`Status alterado para: ${statusTextos[novoStatus]}`);
    }

    atualizarStatusUI() {
        const dot = document.getElementById('userStatusDot');
        const text = document.getElementById('userStatusText');
        const miniIndicator = document.getElementById('statusIndicator');
        
        if (dot) dot.className = `status-dot ${this.statusUsuario}`;
        if (miniIndicator) miniIndicator.className = `status-indicator-mini ${this.statusUsuario}`;
        
        const statusTextos = {
            online: 'Online',
            ocupado: 'Ocupado', 
            reuniao: 'Em Reunião',
            ausente: 'Ausente'
        };
        
        if (text) text.textContent = statusTextos[this.statusUsuario];
    }

    toggleStatusMenu() {
        const menu = document.getElementById('statusMenu');
        menu.classList.toggle('hidden');
    }

    toggleNaoPerturbe() {
        this.modoNaoPerturbe = !this.modoNaoPerturbe;
        
        const icon = document.getElementById('naoPerturbeIcon');
        const text = document.getElementById('naoPerturbeText');
        
        if (this.modoNaoPerturbe) {
            icon.textContent = '🔕';
            text.textContent = 'Não Perturbe (Ativo)';
            window.mostrarNotificacao('Modo Não Perturbe ativado');
        } else {
            icon.textContent = '🔔';
            text.textContent = 'Não Perturbe';
            window.mostrarNotificacao('Modo Não Perturbe desativado');
        }
    }

    // ✅ SISTEMA DE NOTIFICAÇÕES INTELIGENTES
    iniciarNotificacoesInteligentes() {
        console.log('🔔 Iniciando notificações inteligentes...');
        
        // Verificar permissão para notificações desktop
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        this.monitorarChatParaNotificacoes('global');
        
        Object.keys(this.areas).forEach(areaKey => {
            this.monitorarChatParaNotificacoes(`area-${areaKey}`);
        });
        
        this.chatRef.child('privados').on('value', (snapshot) => {
            const chatsPrivados = snapshot.val() || {};
            Object.keys(chatsPrivados).forEach(chatId => {
                const chatData = chatsPrivados[chatId];
                if (chatData.participantes && chatData.participantes.includes(this.usuario.email)) {
                    this.monitorarChatParaNotificacoes(chatId);
                }
            });
        });
    }

    deveNotificar(mensagem, chatId) {
        // Não notificar se for própria mensagem
        if (mensagem.autor === this.usuario.email) return false;
        
        // Não notificar se estiver no chat ativo
        if (this.chatAtivo === chatId) return false;
        
        // Respeitar modo não perturbe (exceto emergências)
        if (this.modoNaoPerturbe && mensagem.prioridade !== 'emergencia') return false;
        
        // Verificar horário comercial
        const agora = new Date();
        const hora = agora.getHours();
        const config = CONFIG_NOTIFICACOES.horarioComercial;
        
        if (hora < config.inicio || hora > config.fim) {
            // Fora do horário: só urgente e emergência
            return mensagem.prioridade === 'urgente' || mensagem.prioridade === 'emergencia';
        }
        
        return true;
    }

    // ✅ CARREGAMENTO DE CHATS PROFISSIONAL
    carregarChatsEspecificos() {
        this.carregarChatsAreasProfissional();
        this.carregarChatsProjetosProfissional();
        this.carregarChatsPrivadosProfissional();
    }

    carregarChatsAreasProfissional() {
        const container = document.getElementById('chatsAreasPro');
        if (!container) return;
        container.innerHTML = '';

        let count = 0;
        Object.entries(this.areas).forEach(([areaKey, area]) => {
            const naoLidas = this.mensagensNaoLidas.get(`area-${areaKey}`) || 0;
            const temMensagens = naoLidas > 0;
            
            container.innerHTML += `
                <div class="conversation-item" data-room="area-${areaKey}" onclick="chatSystem.abrirChat('area-${areaKey}')">
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-icon" style="color: ${area.cor}">📁</span>
                            <span class="conversation-name">${area.nome}</span>
                            <span class="conversation-time" id="time-area-${areaKey}"></span>
                        </div>
                        <div class="conversation-preview" id="preview-area-${areaKey}">
                            ${area.equipe.length} membros da equipe
                        </div>
                    </div>
                    <div class="conversation-meta">
                        <span class="unread-badge ${naoLidas > 0 ? '' : 'hidden'}" id="unread-area-${areaKey}">${naoLidas}</span>
                        <div class="priority-indicator" id="priority-area-${areaKey}"></div>
                    </div>
                </div>
            `;
            count++;
        });
        
        document.getElementById('areasCount').textContent = count;
    }

    carregarChatsProjetosProfissional() {
        const container = document.getElementById('chatsProjetosPro');
        if (!container) return;
        container.innerHTML = '';

        let count = 0;
        const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
        
        Object.entries(this.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                if (atividade.responsaveis.includes(nomeUsuario)) {
                    const naoLidas = this.mensagensNaoLidas.get(`projeto-${atividade.id}`) || 0;
                    const prazo = new Date(atividade.prazo);
                    const hoje = new Date();
                    const diasRestantes = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
                    
                    let prioridadeClass = '';
                    if (diasRestantes <= 3) prioridadeClass = 'urgente';
                    else if (diasRestantes <= 7) prioridadeClass = 'atencao';
                    
                    container.innerHTML += `
                        <div class="conversation-item ${prioridadeClass}" data-room="projeto-${atividade.id}" onclick="chatSystem.abrirChat('projeto-${atividade.id}')">
                            <div class="conversation-info">
                                <div class="conversation-header">
                                    <span class="conversation-icon">📋</span>
                                    <span class="conversation-name">${atividade.nome.substring(0, 25)}...</span>
                                    <span class="conversation-time">${diasRestantes}d</span>
                                </div>
                                <div class="conversation-preview">
                                    ${atividade.responsaveis.length} responsáveis
                                </div>
                            </div>
                            <div class="conversation-meta">
                                <span class="unread-badge ${naoLidas > 0 ? '' : 'hidden'}" id="unread-projeto-${atividade.id}">${naoLidas}</span>
                                <div class="priority-indicator ${prioridadeClass}"></div>
                            </div>
                        </div>
                    `;
                    count++;
                }
            });
        });
        
        document.getElementById('projetosCount').textContent = count;
    }

    carregarChatsPrivadosProfissional() {
        const container = document.getElementById('chatsPrivadosPro');
        if (!container) return;
        
        this.chatRef.child('privados').once('value', (snapshot) => {
            const chatsPrivados = snapshot.val() || {};
            container.innerHTML = '';
            
            let count = 0;
            Object.entries(chatsPrivados).forEach(([chatId, chatData]) => {
                if (chatData.participantes && chatData.participantes.includes(this.usuario.email)) {
                    const outroUsuario = chatData.participantes.find(p => p !== this.usuario.email);
                    const nomeOutro = this.getNomeUsuario(outroUsuario);
                    const statusOnline = this.usuariosOnline.has(outroUsuario);
                    const naoLidas = this.mensagensNaoLidas.get(chatId) || 0;
                    
                    container.innerHTML += `
                        <div class="conversation-item" data-room="${chatId}" onclick="chatSystem.abrirChat('${chatId}')">
                            <div class="conversation-info">
                                <div class="conversation-header">
                                    <span class="conversation-icon">👤</span>
                                    <span class="conversation-name">${nomeOutro}</span>
                                    <div class="user-status-mini">
                                        <div class="status-dot-mini ${statusOnline ? 'online' : 'offline'}"></div>
                                    </div>
                                </div>
                                <div class="conversation-preview">
                                    ${statusOnline ? 'Online agora' : 'Última atividade recente'}
                                </div>
                            </div>
                            <div class="conversation-meta">
                                <span class="unread-badge ${naoLidas > 0 ? '' : 'hidden'}" id="unread-${chatId}">${naoLidas}</span>
                            </div>
                        </div>
                    `;
                    count++;
                }
            });
            
            document.getElementById('privadosCount').textContent = count;
        });
    }

    // ✅ BUSCA AVANÇADA
    buscarConversas(termo) {
        if (!termo.trim()) {
            // Mostrar todas as conversas
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.style.display = 'flex';
            });
            return;
        }
        
        const termoLower = termo.toLowerCase();
        document.querySelectorAll('.conversation-item').forEach(item => {
            const nome = item.querySelector('.conversation-name').textContent.toLowerCase();
            const preview = item.querySelector('.conversation-preview').textContent.toLowerCase();
            
            if (nome.includes(termoLower) || preview.includes(termoLower)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleFiltros() {
        const filtros = document.getElementById('searchFilters');
        filtros.classList.toggle('hidden');
    }

    preencherFiltrosPessoas() {
        const select = document.getElementById('filtroPessoa');
        if (!select) return;
        
        select.innerHTML = '<option value="all">Qualquer pessoa</option>';
        
        Object.values(USUARIOS_SISTEMA).forEach(usuario => {
            if (usuario.ativo) {
                select.innerHTML += `<option value="${usuario.nome}">${usuario.nome}</option>`;
            }
        });
    }

    // ✅ ENVIO DE MENSAGEM PROFISSIONAL
    enviarMensagem() {
        const input = document.getElementById('chatInputPro');
        if (!input) return;
        
        const texto = input.value.trim();
        if (!texto || !this.chatAtivo || !this.usuario) {
            console.log('❌ Dados insuficientes para enviar');
            return;
        }
        
        const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
        const mensagemId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Detectar prioridade baseada no conteúdo
        let prioridade = 'normal';
        if (texto.toLowerCase().includes('urgente') || texto.toLowerCase().includes('emergência')) {
            prioridade = 'urgente';
        }
        if (texto.toLowerCase().includes('emergencia') || texto.toLowerCase().includes('socorro')) {
            prioridade = 'emergencia';
        }
        
        const mensagem = {
            id: mensagemId,
            autor: this.usuario.email,
            nomeAutor: nomeUsuario,
            texto: texto,
            timestamp: new Date().toISOString(),
            chatId: this.chatAtivo,
            prioridade: prioridade,
            reacoes: {},
            editado: false
        };
        
        console.log('📤 Enviando mensagem profissional:', mensagem);
        
        this.chatRef.child(`mensagens/${this.chatAtivo}/${mensagemId}`).set(mensagem)
            .then(() => {
                console.log('✅ Mensagem enviada com sucesso!');
                input.value = '';
                this.atualizarContadorCaracteres();
                this.ajustarAlturaInput();
                setTimeout(() => input.focus(), 100);
            })
            .catch((error) => {
                console.error('❌ Erro ao enviar:', error);
                window.mostrarNotificacao('Erro ao enviar mensagem!', 'error');
            });
    }

    // ✅ UI DE MENSAGENS PROFISSIONAL
    adicionarMensagemUIProfissional(mensagem) {
        const container = document.getElementById('messagesContainerPro');
        if (!container || !mensagem) return;
        
        // Verificar duplicata
        const mensagemExistente = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
        if (mensagemExistente) return;
        
        const isPropia = mensagem.autor === this.usuario.email;
        const usuarioInfo = USUARIOS_SISTEMA[mensagem.autor] || {};
        
        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message-pro ${isPropia ? 'own' : 'other'} ${mensagem.prioridade || 'normal'}`;
        mensagemEl.setAttribute('data-msg-id', mensagem.id);
        
        const tempo = new Date(mensagem.timestamp);
        const tempoFormatado = tempo.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const iniciais = mensagem.nomeAutor.split(' ').map(n => n[0]).join('').substring(0, 2);
        
        mensagemEl.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-circle ${usuarioInfo.nivel || 'colaborador'}">
                    ${iniciais}
                </div>
                <div class="status-dot-msg ${this.usuariosOnline.has(mensagem.autor) ? 'online' : 'offline'}"></div>
            </div>
            
            <div class="message-content-wrapper">
                <div class="message-header-pro">
                    <span class="message-author-pro">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                    <span class="message-role">${usuarioInfo.cargo || ''}</span>
                    <span class="message-time-pro">${tempoFormatado}</span>
                    ${mensagem.prioridade && mensagem.prioridade !== 'normal' ? 
                        `<span class="priority-badge ${mensagem.prioridade}">${mensagem.prioridade.toUpperCase()}</span>` : ''}
                </div>
                
                <div class="message-body-pro">
                    <div class="message-text">${this.formatarMensagemProfissional(mensagem.texto)}</div>
                    
                    <!-- Reações -->
                    <div class="message-reactions" id="reactions-${mensagem.id}">
                        ${this.renderizarReacoes(mensagem.reacoes || {})}
                    </div>
                    
                    <!-- Ações da Mensagem -->
                    <div class="message-actions hidden">
                        <button class="action-btn-mini" onclick="chatSystem.adicionarReacao('${mensagem.id}', '👍')" title="Curtir">👍</button>
                        <button class="action-btn-mini" onclick="chatSystem.adicionarReacao('${mensagem.id}', '❤️')" title="Amar">❤️</button>
                        <button class="action-btn-mini" onclick="chatSystem.adicionarReacao('${mensagem.id}', '😂')" title="Rir">😂</button>
                        <button class="action-btn-mini" onclick="chatSystem.responderMensagem('${mensagem.id}')" title="Responder">↩️</button>
                        <button class="action-btn-mini" onclick="chatSystem.copiarMensagem('${mensagem.id}')" title="Copiar">📋</button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar eventos para mostrar ações
        mensagemEl.addEventListener('mouseenter', () => {
            mensagemEl.querySelector('.message-actions').classList.remove('hidden');
        });
        
        mensagemEl.addEventListener('mouseleave', () => {
            mensagemEl.querySelector('.message-actions').classList.add('hidden');
        });
        
        container.appendChild(mensagemEl);
        
        // Remover welcome message
        const welcome = container.querySelector('.welcome-message-pro');
        if (welcome) welcome.remove();
        
        // Scroll suave para baixo
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
        
        console.log(`✅ Mensagem profissional adicionada: "${mensagem.texto}"`);
    }

    formatarMensagemProfissional(texto) {
        return texto
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    renderizarReacoes(reacoes) {
        if (!reacoes || Object.keys(reacoes).length === 0) return '';
        
        let html = '';
        Object.entries(reacoes).forEach(([emoji, usuarios]) => {
            if (usuarios.length > 0) {
                const isReacted = usuarios.includes(this.usuario.email);
                html += `
                    <span class="reaction ${isReacted ? 'reacted' : ''}" 
                          onclick="chatSystem.toggleReacao('${emoji}', '${mensagemId}')">
                        ${emoji} ${usuarios.length}
                    </span>
                `;
            }
        });
        
        return html;
    }

    // ✅ SISTEMA DE REAÇÕES
    adicionarReacao(mensagemId, emoji) {
        const mensagemRef = this.chatRef.child(`mensagens/${this.chatAtivo}/${mensagemId}/reacoes/${emoji}`);
        
        mensagemRef.once('value', (snapshot) => {
            const usuarios = snapshot.val() || [];
            const userEmail = this.usuario.email;
            
            if (usuarios.includes(userEmail)) {
                // Remover reação
                const novaLista = usuarios.filter(email => email !== userEmail);
                mensagemRef.set(novaLista.length > 0 ? novaLista : null);
            } else {
                // Adicionar reação
                usuarios.push(userEmail);
                mensagemRef.set(usuarios);
            }
        });
    }

    // ✅ FUNÇÕES AUXILIARES PROFISSIONAIS
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.enviarMensagem();
        }
        
        this.ajustarAlturaInput();
    }

    handleTyping(event) {
        this.atualizarContadorCaracteres();
        // Aqui poderia implementar indicador de "está digitando"
    }

    atualizarContadorCaracteres() {
        const input = document.getElementById('chatInputPro');
        const counter = document.getElementById('characterCountPro');
        
        if (input && counter) {
            const count = input.value.length;
            counter.textContent = `${count}/1000`;
            
            if (count > 800) {
                counter.style.color = '#ef4444';
            } else if (count > 600) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = '#6b7280';
            }
        }
    }

    ajustarAlturaInput() {
        const input = document.getElementById('chatInputPro');
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        }
    }

    // ✅ FUNÇÕES HERDADAS E ADAPTADAS (mantendo compatibilidade)
    async getTodosUsuarios() {
        return Object.entries(USUARIOS_SISTEMA)
            .filter(([email, dados]) => dados.ativo)
            .map(([email, dados]) => ({
                nome: dados.nome,
                email: email,
                cargo: dados.cargo,
                area: dados.area
            }));
    }

    getNomeUsuario(email) {
        const usuario = USUARIOS_SISTEMA[email];
        return usuario ? usuario.nome : email.split('@')[0];
    }

    async novoPrivado() {
        const usuarios = await this.getTodosUsuarios();
        const usuariosDisponiveis = usuarios.filter(u => u.email !== this.usuario.email);
        
        if (usuariosDisponiveis.length === 0) {
            window.mostrarNotificacao('Nenhum usuário disponível', 'warning');
            return;
        }
        
        const opcoes = usuariosDisponiveis.map(u => `${u.nome} - ${u.cargo}`).join('\n');
        const escolha = prompt(`Iniciar conversa privada com:\n\n${opcoes}\n\nDigite o nome:`);
        
        if (escolha) {
            const usuarioEscolhido = usuariosDisponiveis.find(u => 
                u.nome.toLowerCase().includes(escolha.toLowerCase())
            );
            
            if (usuarioEscolhido) {
                this.iniciarChatPrivado(usuarioEscolhido.email);
            } else {
                window.mostrarNotificacao('Usuário não encontrado', 'error');
            }
        }
    }

    iniciarChatPrivado(emailDestino) {
        const participantes = [this.usuario.email, emailDestino].sort();
        const chatId = `privado_${participantes[0].replace(/[@.-]/g, '_')}_${participantes[1].replace(/[@.-]/g, '_')}`;
        
        const chatData = {
            participantes: participantes,
            criadoEm: new Date().toISOString(),
            ultimaAtividade: new Date().toISOString(),
            criadoPor: this.usuario.email
        };
        
        this.chatRef.child(`privados/${chatId}`).set(chatData)
            .then(() => {
                this.monitorarChatParaNotificacoes(chatId);
                this.carregarChatsPrivadosProfissional();
                setTimeout(() => this.abrirChat(chatId), 500);
                window.mostrarNotificacao('Conversa privada iniciada!');
            })
            .catch(error => {
                console.error('❌ Erro ao criar chat privado:', error);
                window.mostrarNotificacao('Erro ao criar conversa privada', 'error');
            });
    }

    // Implementar outras funções necessárias...
    abrirChat(chatId) {
        this.chatAtivo = chatId;
        this.configurarInfoChatProfissional(chatId);
        this.carregarMensagens(chatId);
        this.marcarComoLido(chatId);
        
        // Atualizar UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const roomElement = document.querySelector(`[data-room="${chatId}"]`);
        if (roomElement) {
            roomElement.classList.add('active');
        }
    }

    configurarInfoChatProfissional(chatId) {
        const titleEl = document.getElementById('chatTitlePro');
        const descEl = document.getElementById('chatDescriptionPro');
        const membersEl = document.getElementById('membersCountPro');
        const avatarEl = document.getElementById('chatAvatar');
        
        if (chatId === 'global') {
            titleEl.textContent = 'Chat Geral';
            descEl.textContent = 'Comunicação geral da obra';
            membersEl.textContent = this.getTotalMembros();
            avatarEl.textContent = '🌐';
        }
        // Adicionar outras configurações...
    }

    // Outras funções necessárias (carregarMensagens, toggleChat, etc.)
    carregarMensagens(chatId) {
        // Implementação similar à original, mas com UI profissional
        const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
        
        messagesRef.once('value', (snapshot) => {
            const mensagens = snapshot.val() || {};
            const container = document.getElementById('messagesContainerPro');
            
            if (container) {
                container.innerHTML = '';
            }
            
            const mensagensArray = Object.values(mensagens).sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            mensagensArray.forEach(mensagem => {
                this.adicionarMensagemUIProfissional(mensagem);
            });
        });
        
        // Listener para novas mensagens...
    }

    toggleChat() {
        const panel = document.getElementById('chatPanel');
        const toggle = document.getElementById('chatToggle');
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            this.isOpen = false;
        } else {
            panel.classList.remove('hidden');
            this.isOpen = true;
            
            const input = document.getElementById('chatInputPro');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    // Funções de configuração
    abrirConfiguracoes() {
        document.getElementById('configModal').classList.remove('hidden');
    }

    fecharConfiguracoes() {
        document.getElementById('configModal').classList.add('hidden');
    }

    // Implementar funções restantes conforme necessário...
    configurarEventListeners() {
        // Event listeners para o sistema profissional
    }

    getTotalMembros() {
        return Object.keys(USUARIOS_SISTEMA).length;
    }

    marcarComoLido(chatId) {
        this.mensagensNaoLidas.set(chatId, 0);
        const unreadEl = document.getElementById(`unread-${chatId.replace('/', '-')}`);
        if (unreadEl) {
            unreadEl.classList.add('hidden');
        }
    }

    // Funções placeholder para funcionalidades futuras
    fixarMensagem() { console.log('Fixar mensagem - a implementar'); }
    abrirArquivos() { console.log('Arquivos - a implementar'); }
    abrirBusca() { console.log('Busca - a implementar'); }
    abrirDetalhes() { console.log('Detalhes - a implementar'); }
    anexarArquivo() { console.log('Anexar - a implementar'); }
    inserirEmoji() { console.log('Emoji - a implementar'); }
    inserirMencao() { console.log('Menção - a implementar'); }
    limparChat() { console.log('Limpar - a implementar'); }
    
    carregarChats() {}
    salvarStatusOnline() {}
    configurarModoNaoPerturbe() {}
    monitorarChatParaNotificacoes() {}
    monitorarUsuariosOnline() {}
    marcarUsuarioOnline() {}
}

// ========== INICIALIZAÇÃO ==========
let chatSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Inicializando Chat System PROFISSIONAL...');
    
    const inicializarChat = () => {
        if (window.usuarioAtual && window.dados && window.database) {
            chatSystem = new ChatSystemProfissional();
            window.chatSystem = chatSystem;
            console.log('✅ Chat System PROFISSIONAL inicializado!');
        } else {
            setTimeout(inicializarChat, 1000);
        }
    };
    
    setTimeout(inicializarChat, 3000);
});

// ✅ FUNÇÕES DE CADASTRO E TESTE (mantidas da versão anterior)
async function cadastrarTodosUsuarios() {
    console.log('🔧 Iniciando cadastro de usuários reais...');
    
    const resultados = [];
    
    for (const [email, dadosUsuario] of Object.entries(USUARIOS_SISTEMA)) {
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, dadosUsuario.senha);
            
            await userCredential.user.updateProfile({
                displayName: dadosUsuario.nome
            });
            
            await window.database.ref(`vinculacoes/${email.replace(/[@.]/g, '_')}`).set({
                nomeColaborador: dadosUsuario.nome,
                cargoColaborador: dadosUsuario.cargo,
                areaColaborador: dadosUsuario.area,
                emailUsuario: email,
                dataVinculacao: new Date().toISOString(),
                ativo: true
            });
            
            resultados.push(`✅ ${dadosUsuario.nome}: Cadastrado com sucesso`);
            
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                resultados.push(`⚠️ ${dadosUsuario.nome}: Email já cadastrado`);
            } else {
                resultados.push(`❌ ${dadosUsuario.nome}: Erro - ${error.message}`);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('📋 RESULTADO DO CADASTRO:');
    resultados.forEach(resultado => console.log(resultado));
    
    const resumo = resultados.join('\n');
    alert(`CADASTRO DE USUÁRIOS CONCLUÍDO:\n\n${resumo}`);
    
    return resultados;
}

// Expor funções globalmente
window.cadastrarTodosUsuarios = cadastrarTodosUsuarios;
window.USUARIOS_SISTEMA = USUARIOS_SISTEMA;

console.log('💼 Chat System PROFISSIONAL carregado - Execute cadastrarTodosUsuarios() se necessário');
