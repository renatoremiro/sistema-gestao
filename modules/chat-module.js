// ============================================
// 💼 CHAT EMPRESARIAL REVOLUCIONADO - OBRA 292
// Sistema Completo de 3 Colunas com Múltiplos Chats
// ============================================

// ✅ BASE DE FUNCIONÁRIOS ATUALIZADA
const FUNCIONARIOS_OBRA = {
    'bruabritto@biapo.com.br': {
        nome: 'Bruna Britto',
        cargo: 'Arquiteta Trainee',
        area: 'documentacao',
        nivel: 'colaborador',
        ativo: true,
        iniciais: 'BB',
        cor: '#8b5cf6'
    },
    'isabella@biapo.com.br': {
        nome: 'Isabella Rocha',
        cargo: 'Coordenadora Geral',
        area: 'planejamento',
        nivel: 'coordenador',
        ativo: true,
        iniciais: 'IR',
        cor: '#06b6d4'
    },
    'renatoremiro@biapo.com.br': {
        nome: 'Renato Remiro',
        cargo: 'Coordenador de Documentação',
        area: 'documentacao',
        nivel: 'coordenador',
        ativo: true,
        iniciais: 'RR',
        cor: '#8b5cf6'
    },
    'redeinterna.obra3@gmail.com': {
        nome: 'Juliana Andrade',
        cargo: 'Estagiária de Arquitetura',
        area: 'documentacao',
        nivel: 'estagiario',
        ativo: true,
        iniciais: 'JA',
        cor: '#8b5cf6'
    },
    'eduardo@biapo.com.br': {
        nome: 'Eduardo Silva',
        cargo: 'Coordenador de Engenharia',
        area: 'producao',
        nivel: 'coordenador',
        ativo: true,
        iniciais: 'ES',
        cor: '#ef4444'
    },
    'carlosmendonca@biapo.com.br': {
        nome: 'Carlos Mendonça',
        cargo: 'Arquiteto Sênior',
        area: 'producao',
        nivel: 'senior',
        ativo: true,
        iniciais: 'CM',
        cor: '#ef4444'
    },
    'alex@biapo.com.br': {
        nome: 'Alex Santos',
        cargo: 'Comprador',
        area: 'producao',
        nivel: 'colaborador',
        ativo: true,
        iniciais: 'AS',
        cor: '#ef4444'
    },
    'laracoutinho@biapo.com.br': {
        nome: 'Lara Coutinho',
        cargo: 'Arquiteta Trainee',
        area: 'planejamento',
        nivel: 'colaborador',
        ativo: true,
        iniciais: 'LC',
        cor: '#06b6d4'
    },
    'emanoelimoreira@biapo.com.br': {
        nome: 'Emanoel Moreira',
        cargo: 'Assistente de Arquitetura',
        area: 'producao',
        nivel: 'assistente',
        ativo: true,
        iniciais: 'EM',
        cor: '#ef4444'
    },
    'estagio292@biapo.com.br': {
        nome: 'Jean Oliveira',
        cargo: 'Estagiário de Engenharia',
        area: 'planejamento',
        nivel: 'estagiario',
        ativo: true,
        iniciais: 'JO',
        cor: '#06b6d4'
    }
};

// ✅ CONFIGURAÇÃO DOS CHATS POR ÁREA
const CHATS_CONFIGURACAO = {
    geral: {
        id: 'geral',
        nome: 'Chat Geral',
        icon: '🌐',
        cor: '#3b82f6',
        descricao: 'Comunicação geral da obra',
        tipo: 'publico',
        membros: Object.keys(FUNCIONARIOS_OBRA)
    },
    documentacao: {
        id: 'documentacao',
        nome: 'Documentação',
        icon: '📁',
        cor: '#8b5cf6',
        descricao: 'Arquivos e documentação',
        tipo: 'area',
        membros: ['renatoremiro@biapo.com.br', 'bruabritto@biapo.com.br', 'redeinterna.obra3@gmail.com', 'laracoutinho@biapo.com.br']
    },
    planejamento: {
        id: 'planejamento',
        nome: 'Planejamento',
        icon: '📋',
        cor: '#06b6d4',
        descricao: 'Cronogramas e estratégia',
        tipo: 'area',
        membros: ['isabella@biapo.com.br', 'laracoutinho@biapo.com.br', 'eduardo@biapo.com.br', 'estagio292@biapo.com.br']
    },
    producao: {
        id: 'producao',
        nome: 'Produção',
        icon: '🏗️',
        cor: '#ef4444',
        descricao: 'Execução e qualidade',
        tipo: 'area',
        membros: ['eduardo@biapo.com.br', 'carlosmendonca@biapo.com.br', 'alex@biapo.com.br', 'emanoelimoreira@biapo.com.br']
    }
};

class ChatEmpresarialRevolucionado {
    constructor() {
        this.version = '2.0.0';
        this.chatRef = null;
        this.usuario = null;
        this.chatAtivo = { tipo: 'publico', id: 'geral' };
        this.isOpen = false;
        this.chatsAbertos = new Map();
        this.mensagensNaoLidas = new Map();
        this.usuariosOnline = new Map();
        this.listeners = new Map();
        this.buscaAtiva = '';
        this.isInitialized = false;
        this.notificacoes = [];
        
        this.iniciarSistema();
    }

    // ✅ INICIALIZAÇÃO ROBUSTA
    async iniciarSistema() {
        try {
            console.log('🚀 Iniciando Chat Empresarial Revolucionado v2.0...');
            
            await this.aguardarDependencias();
            await this.configurarSistema();
            this.criarInterfaceCompleta();
            await this.inicializarFirebase();
            this.configurarEventos();
            this.inicializarChats();
            
            this.isInitialized = true;
            console.log('✅ Chat Revolucionado pronto!');
            this.mostrarNotificacao('Sistema de chat atualizado! 🚀', 'success');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.tratarErroInicializacao(error);
        }
    }

    async aguardarDependencias() {
        return new Promise((resolve, reject) => {
            let tentativas = 0;
            const maxTentativas = 30;
            
            const verificar = () => {
                tentativas++;
                
                if (window.usuarioAtual && window.database) {
                    this.usuario = window.usuarioAtual;
                    this.chatRef = window.database.ref('chat_revolucionado');
                    resolve();
                    return;
                }
                
                if (tentativas >= maxTentativas) {
                    reject(new Error('Timeout: Sistema principal não carregou'));
                    return;
                }
                
                setTimeout(verificar, 500);
            };
            
            verificar();
        });
    }

    async configurarSistema() {
        const email = this.usuario.email;
        const funcionario = FUNCIONARIOS_OBRA[email];
        
        if (!funcionario) {
            throw new Error(`Funcionário não encontrado: ${email}`);
        }
        
        this.funcionarioAtual = funcionario;
        console.log(`👤 ${funcionario.nome} logado - ${funcionario.cargo}`);
    }

    // ✅ INTERFACE REVOLUCIONADA DE 3 COLUNAS
    criarInterfaceCompleta() {
        this.removerInterfaceExistente();

        const chatHTML = `
            <!-- Toggle Minimalista -->
            <div id="chatToggleRev" class="chat-toggle-rev">
                <div class="toggle-icon">💬</div>
                <div id="badgeGlobal" class="badge-global hidden">0</div>
            </div>

            <!-- Interface Principal de 3 Colunas -->
            <div id="chatPanelRev" class="chat-panel-rev hidden">
                <!-- Header Superior -->
                <div class="chat-header-rev">
                    <div class="header-left">
                        <h2>Chat Empresarial</h2>
                        <span class="obra-tag">Obra 292 - Museu Nacional</span>
                    </div>
                    <div class="header-right">
                        <div class="user-status">
                            <div class="user-avatar" style="background: ${this.funcionarioAtual.cor}">
                                ${this.funcionarioAtual.iniciais}
                            </div>
                            <div class="user-details">
                                <span class="user-name">${this.funcionarioAtual.nome}</span>
                                <select id="statusSelect" class="status-select">
                                    <option value="online">🟢 Online</option>
                                    <option value="ocupado">🟡 Ocupado</option>
                                    <option value="reuniao">🔴 Em Reunião</option>
                                    <option value="ausente">⚫ Ausente</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-minimize" onclick="window.chatRev.fecharChat()" title="Minimizar">─</button>
                        <button class="btn-close" onclick="window.chatRev.fecharChat()" title="Fechar">✕</button>
                    </div>
                </div>

                <!-- Container Principal de 3 Colunas -->
                <div class="chat-container-rev">
                    <!-- COLUNA 1: Lista de Conversas -->
                    <div class="chat-sidebar">
                        <!-- Busca -->
                        <div class="search-section">
                            <div class="search-box">
                                <span class="search-icon">🔍</span>
                                <input type="text" id="searchInput" placeholder="Buscar conversas..." 
                                       oninput="window.chatRev.buscarConversas(this.value)">
                            </div>
                        </div>

                        <!-- Navegação de Tipos -->
                        <div class="chat-nav">
                            <button class="nav-btn active" data-tipo="publico" onclick="window.chatRev.filtrarChats('publico')">
                                <span class="nav-icon">🌐</span>
                                <span class="nav-text">Geral</span>
                                <span id="badge-publico" class="nav-badge hidden">0</span>
                            </button>
                            <button class="nav-btn" data-tipo="area" onclick="window.chatRev.filtrarChats('area')">
                                <span class="nav-icon">🏢</span>
                                <span class="nav-text">Áreas</span>
                                <span id="badge-area" class="nav-badge hidden">0</span>
                            </button>
                            <button class="nav-btn" data-tipo="privado" onclick="window.chatRev.filtrarChats('privado')">
                                <span class="nav-icon">💬</span>
                                <span class="nav-text">Privados</span>
                                <span id="badge-privado" class="nav-badge hidden">0</span>
                            </button>
                        </div>

                        <!-- Lista de Conversas -->
                        <div class="conversations-list" id="conversationsList">
                            <!-- Gerado dinamicamente -->
                        </div>

                        <!-- Botão Novo Chat -->
                        <div class="new-chat-section">
                            <button class="btn-new-chat" onclick="window.chatRev.abrirNovoChat()">
                                <span class="new-chat-icon">+</span>
                                <span class="new-chat-text">Nova Conversa</span>
                            </button>
                        </div>
                    </div>

                    <!-- COLUNA 2: Chat Ativo -->
                    <div class="chat-main">
                        <!-- Header do Chat Ativo -->
                        <div class="chat-active-header" id="chatActiveHeader">
                            <div class="chat-info">
                                <div class="chat-avatar" id="chatAvatar">🌐</div>
                                <div class="chat-details">
                                    <h3 id="chatName">Chat Geral</h3>
                                    <span id="chatDescription">Comunicação geral da obra</span>
                                </div>
                            </div>
                            <div class="chat-actions">
                                <button class="btn-action" onclick="window.chatRev.limparChat()" title="Limpar Chat">🗑️</button>
                                <button class="btn-action" onclick="window.chatRev.configurarChat()" title="Configurações">⚙️</button>
                            </div>
                        </div>

                        <!-- Área de Mensagens -->
                        <div class="messages-area" id="messagesArea">
                            <div class="welcome-message">
                                <div class="welcome-content">
                                    <h3>Bem-vindo ao Chat Revolucionado! 🚀</h3>
                                    <p>Sistema de comunicação empresarial da Obra 292</p>
                                    <div class="welcome-features">
                                        <div class="feature">✨ Chats por área organizados</div>
                                        <div class="feature">💬 Conversas privadas</div>
                                        <div class="feature">🔔 Notificações inteligentes</div>
                                        <div class="feature">🔍 Busca avançada</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Área de Input -->
                        <div class="input-area">
                            <div class="input-container">
                                <div class="input-box">
                                    <textarea id="messageInput" placeholder="Digite sua mensagem..."
                                             onkeydown="window.chatRev.handleKeyDown(event)"
                                             oninput="window.chatRev.handleTyping()"
                                             rows="1"></textarea>
                                    <div class="input-actions">
                                        <button class="btn-emoji" onclick="window.chatRev.abrirEmojis()" title="Emojis">😊</button>
                                        <button class="btn-attach" onclick="window.chatRev.anexarArquivo()" title="Anexar">📎</button>
                                        <button class="btn-send" onclick="window.chatRev.enviarMensagem()" title="Enviar">
                                            <span class="send-icon">📤</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="input-footer">
                                    <span id="charCounter" class="char-counter">0/1000</span>
                                    <span class="typing-indicator" id="typingIndicator"></span>
                                    <span class="input-help">Enter para enviar • Shift+Enter para quebrar linha</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COLUNA 3: Informações -->
                    <div class="chat-info-panel">
                        <!-- Header da Info -->
                        <div class="info-header">
                            <h3>Informações</h3>
                        </div>

                        <!-- Membros Online -->
                        <div class="info-section">
                            <div class="section-title">
                                <span class="section-icon">👥</span>
                                <span class="section-text">Membros Online</span>
                                <span id="onlineCount" class="section-count">0</span>
                            </div>
                            <div class="members-list" id="membersList">
                                <!-- Gerado dinamicamente -->
                            </div>
                        </div>

                        <!-- Detalhes do Chat -->
                        <div class="info-section">
                            <div class="section-title">
                                <span class="section-icon">ℹ️</span>
                                <span class="section-text">Detalhes</span>
                            </div>
                            <div class="chat-details-info" id="chatDetailsInfo">
                                <!-- Gerado dinamicamente -->
                            </div>
                        </div>

                        <!-- Ações Rápidas -->
                        <div class="info-section">
                            <div class="section-title">
                                <span class="section-icon">⚡</span>
                                <span class="section-text">Ações</span>
                            </div>
                            <div class="quick-actions">
                                <button class="quick-action" onclick="window.chatRev.exportarChat()">
                                    <span class="action-icon">📥</span>
                                    <span class="action-text">Exportar Chat</span>
                                </button>
                                <button class="quick-action" onclick="window.chatRev.silenciarChat()">
                                    <span class="action-icon">🔕</span>
                                    <span class="action-text">Silenciar</span>
                                </button>
                                <button class="quick-action" onclick="window.chatRev.marcarImportante()">
                                    <span class="action-icon">⭐</span>
                                    <span class="action-text">Importante</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notificações Toast -->
            <div id="notificationsContainer" class="notifications-container"></div>

            <!-- Modal Novo Chat -->
            <div id="newChatModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Nova Conversa</h3>
                        <button class="btn-modal-close" onclick="window.chatRev.fecharModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="contact-search">
                            <input type="text" id="contactSearch" placeholder="Buscar funcionário..." 
                                   oninput="window.chatRev.buscarContatos(this.value)">
                        </div>
                        <div class="contacts-list" id="contactsList">
                            <!-- Gerado dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        console.log('✅ Interface revolucionada criada');
    }

    removerInterfaceExistente() {
        const elementos = ['chatToggleRev', 'chatPanelRev', 'chatEmpresarial', 'panelChatEmp', 'chatToggle', 'chatPanel'];
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    // ✅ FIREBASE E ESTRUTURA DE DADOS
    async inicializarFirebase() {
        try {
            const snapshot = await this.chatRef.once('value');
            
            if (!snapshot.val()) {
                await this.criarEstruturaCompleta();
            }
            
            console.log('✅ Firebase revolucionado configurado');
        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            throw error;
        }
    }

    async criarEstruturaCompleta() {
        const estrutura = {
            configuracao: {
                versao: '2.0.0',
                criado: new Date().toISOString(),
                obra: 'Obra 292 - Museu Nacional'
            },
            chats: {},
            usuarios_online: {},
            conversas_privadas: {},
            notificacoes: {}
        };

        // Criar estrutura para cada chat configurado
        Object.values(CHATS_CONFIGURACAO).forEach(chat => {
            estrutura.chats[chat.id] = {
                configuracao: chat,
                mensagens: {},
                membros: chat.membros,
                ativo: true,
                criado: new Date().toISOString()
            };
        });

        await this.chatRef.set(estrutura);
        console.log('✅ Estrutura completa criada');
    }

    // ✅ CONFIGURAÇÃO DE EVENTOS
    configurarEventos() {
        // Toggle principal
        document.getElementById('chatToggleRev').addEventListener('click', () => {
            this.toggleChat();
        });

        // Busca global
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.buscarConversas(e.target.value);
        });

        // Status do usuário
        document.getElementById('statusSelect').addEventListener('change', (e) => {
            this.alterarStatus(e.target.value);
        });

        // Tecla ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.fecharChat();
            }
        });

        // Monitorar atividade
        this.configurarMonitoramento();
    }

    // ✅ INICIALIZAÇÃO DOS CHATS
    inicializarChats() {
        this.atualizarListaConversas();
        this.carregarChatAtivo();
        this.monitorarUsuariosOnline();
        this.definirStatus('online');
    }

    // ✅ SISTEMA DE NAVEGAÇÃO
    filtrarChats(tipo) {
        // Atualizar botões de navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tipo="${tipo}"]`).classList.add('active');

        // Filtrar lista de conversas
        this.atualizarListaConversas(tipo);
    }

    atualizarListaConversas(filtro = 'publico') {
        const container = document.getElementById('conversationsList');
        container.innerHTML = '';

        if (filtro === 'publico') {
            // Mostrar chat geral
            const geral = CHATS_CONFIGURACAO.geral;
            this.adicionarItemConversa(geral, container);
        } else if (filtro === 'area') {
            // Mostrar chats por área
            Object.values(CHATS_CONFIGURACAO).forEach(chat => {
                if (chat.tipo === 'area') {
                    this.adicionarItemConversa(chat, container);
                }
            });
        } else if (filtro === 'privado') {
            // Mostrar conversas privadas
            this.carregarConversasPrivadas(container);
        }
    }

    adicionarItemConversa(chat, container) {
        const isAtivo = this.chatAtivo.id === chat.id;
        const naoLidas = this.mensagensNaoLidas.get(chat.id) || 0;

        const item = document.createElement('div');
        item.className = `conversation-item ${isAtivo ? 'active' : ''}`;
        item.onclick = () => this.trocarChat(chat.tipo, chat.id);
        
        item.innerHTML = `
            <div class="conv-avatar" style="background: ${chat.cor}">
                ${chat.icon}
            </div>
            <div class="conv-content">
                <div class="conv-header">
                    <span class="conv-name">${chat.nome}</span>
                    <span class="conv-time">agora</span>
                </div>
                <div class="conv-preview">
                    <span class="conv-last">${chat.descricao}</span>
                    ${naoLidas > 0 ? `<span class="conv-badge">${naoLidas}</span>` : ''}
                </div>
            </div>
        `;

        container.appendChild(item);
    }

    // ✅ SISTEMA DE MENSAGENS
    async enviarMensagem() {
        const input = document.getElementById('messageInput');
        const texto = input.value.trim();
        
        if (!texto || !this.funcionarioAtual) return;

        const mensagem = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            autor: this.usuario.email,
            nomeAutor: this.funcionarioAtual.nome,
            cargo: this.funcionarioAtual.cargo,
            iniciais: this.funcionarioAtual.iniciais,
            cor: this.funcionarioAtual.cor,
            texto: texto,
            timestamp: new Date().toISOString(),
            editado: false,
            tipo: 'normal'
        };

        try {
            const chatPath = this.chatAtivo.tipo === 'privado' 
                ? `conversas_privadas/${this.chatAtivo.id}/mensagens`
                : `chats/${this.chatAtivo.id}/mensagens`;
            
            await this.chatRef.child(`${chatPath}/${mensagem.id}`).set(mensagem);
            
            input.value = '';
            this.atualizarContador();
            this.ajustarAlturaInput();
            
            console.log(`📤 Mensagem enviada para ${this.chatAtivo.id}`);
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            this.mostrarNotificacao('Erro ao enviar mensagem', 'error');
        }
    }

    trocarChat(tipo, id) {
        this.chatAtivo = { tipo, id };
        
        // Atualizar UI
        this.atualizarHeaderChatAtivo();
        this.carregarMensagensChat();
        this.atualizarInfoPanel();
        this.marcarComoLido(id);
        
        // Atualizar lista de conversas
        this.atualizarListaConversas(
            tipo === 'publico' ? 'publico' : 
            tipo === 'area' ? 'area' : 'privado'
        );
    }

    carregarChatAtivo() {
        this.carregarMensagensChat();
        this.atualizarHeaderChatAtivo();
        this.atualizarInfoPanel();
    }

    async carregarMensagensChat() {
        const chatPath = this.chatAtivo.tipo === 'privado' 
            ? `conversas_privadas/${this.chatAtivo.id}/mensagens`
            : `chats/${this.chatAtivo.id}/mensagens`;
        
        const ref = this.chatRef.child(chatPath);
        
        try {
            const snapshot = await ref.once('value');
            const mensagens = snapshot.val() || {};
            
            const container = document.getElementById('messagesArea');
            container.innerHTML = '';
            
            const mensagensArray = Object.values(mensagens)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .slice(-50); // Últimas 50 mensagens
            
            if (mensagensArray.length === 0) {
                this.mostrarWelcomeMessage();
            } else {
                mensagensArray.forEach(msg => this.adicionarMensagemUI(msg));
            }
            
            // Monitorar novas mensagens
            this.monitorarNovasMensagens(chatPath);
            
        } catch (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
        }
    }

    monitorarNovasMensagens(chatPath) {
        // Remover listener anterior se existir
        if (this.listeners.has('mensagens')) {
            this.listeners.get('mensagens').off();
        }
        
        const ref = this.chatRef.child(chatPath);
        
        ref.on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            if (mensagem && this.isInitialized) {
                const container = document.getElementById('messagesArea');
                const existe = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
                
                if (!existe) {
                    this.removerWelcomeMessage();
                    this.adicionarMensagemUI(mensagem);
                    
                    // Notificar se não for própria mensagem
                    if (mensagem.autor !== this.usuario.email && this.isOpen) {
                        this.mostrarNotificacao(`${mensagem.nomeAutor}: ${mensagem.texto.substring(0, 50)}...`);
                    }
                }
            }
        });
        
        this.listeners.set('mensagens', ref);
    }

    // ✅ UI DE MENSAGENS
    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('messagesArea');
        if (!container || !mensagem) return;

        const isPropia = mensagem.autor === this.usuario.email;
        const tempo = new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message-item ${isPropia ? 'own' : 'other'}`;
        mensagemEl.setAttribute('data-msg-id', mensagem.id);

        mensagemEl.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-circle" style="background: ${mensagem.cor || '#64748b'}">
                    ${mensagem.iniciais || mensagem.nomeAutor.substring(0, 2)}
                </div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                    <span class="message-role">${mensagem.cargo}</span>
                    <span class="message-time">${tempo}</span>
                </div>
                <div class="message-text">${this.formatarTexto(mensagem.texto)}</div>
            </div>
        `;

        container.appendChild(mensagemEl);
        this.scrollToBottom();
    }

    formatarTexto(texto) {
        return texto
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // ✅ FUNCIONALIDADES ADICIONAIS
    buscarConversas(termo) {
        this.buscaAtiva = termo.toLowerCase();
        // Implementar busca nas conversas
        console.log('🔍 Buscando:', termo);
    }

    abrirNovoChat() {
        document.getElementById('newChatModal').classList.remove('hidden');
        this.carregarListaContatos();
    }

    fecharModal() {
        document.getElementById('newChatModal').classList.add('hidden');
    }

    carregarListaContatos() {
        const container = document.getElementById('contactsList');
        container.innerHTML = '';

        Object.entries(FUNCIONARIOS_OBRA).forEach(([email, funcionario]) => {
            if (email === this.usuario.email) return; // Pular próprio usuário

            const item = document.createElement('div');
            item.className = 'contact-item';
            item.onclick = () => this.iniciarChatPrivado(email);
            
            item.innerHTML = `
                <div class="contact-avatar" style="background: ${funcionario.cor}">
                    ${funcionario.iniciais}
                </div>
                <div class="contact-info">
                    <span class="contact-name">${funcionario.nome}</span>
                    <span class="contact-role">${funcionario.cargo}</span>
                </div>
                <div class="contact-status ${funcionario.ativo ? 'online' : 'offline'}"></div>
            `;

            container.appendChild(item);
        });
    }

    async iniciarChatPrivado(emailDestino) {
        const chatId = this.gerarIdChatPrivado(this.usuario.email, emailDestino);
        
        // Criar conversa privada no Firebase se não existir
        await this.criarConversaPrivada(chatId, emailDestino);
        
        // Trocar para o chat privado
        this.trocarChat('privado', chatId);
        this.fecharModal();
    }

    // ✅ SISTEMA DE NOTIFICAÇÕES
    mostrarNotificacao(mensagem, tipo = 'info') {
        const container = document.getElementById('notificationsContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-text">${mensagem}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // ✅ CONTROLES DE UI
    toggleChat() {
        const panel = document.getElementById('chatPanelRev');
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            this.isOpen = false;
        } else {
            panel.classList.remove('hidden');
            this.isOpen = true;
            this.zerarBadgeGlobal();
            
            // Focus no input
            setTimeout(() => {
                const input = document.getElementById('messageInput');
                if (input) input.focus();
            }, 100);
        }
    }

    fecharChat() {
        this.isOpen = false;
        document.getElementById('chatPanelRev').classList.add('hidden');
    }

    // ✅ UTILITÁRIOS
    atualizarHeaderChatAtivo() {
        const chat = CHATS_CONFIGURACAO[this.chatAtivo.id];
        if (!chat) return;

        document.getElementById('chatAvatar').textContent = chat.icon;
        document.getElementById('chatName').textContent = chat.nome;
        document.getElementById('chatDescription').textContent = chat.descricao;
    }

    atualizarInfoPanel() {
        // Implementar atualização do painel de informações
        const membrosContainer = document.getElementById('membersList');
        const detalhesContainer = document.getElementById('chatDetailsInfo');
        
        // Carregar membros online
        this.carregarMembrosOnline(membrosContainer);
        
        // Carregar detalhes do chat
        this.carregarDetalhesChat(detalhesContainer);
    }

    mostrarWelcomeMessage() {
        const container = document.getElementById('messagesArea');
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-content">
                    <h3>Bem-vindo ao ${CHATS_CONFIGURACAO[this.chatAtivo.id]?.nome || 'Chat'}! 🚀</h3>
                    <p>Comunicação profissional da Obra 292</p>
                    <div class="welcome-features">
                        <div class="feature">✨ Interface moderna e intuitiva</div>
                        <div class="feature">💬 Mensagens em tempo real</div>
                        <div class="feature">🔔 Notificações inteligentes</div>
                        <div class="feature">👥 Colaboração em equipe</div>
                    </div>
                </div>
            </div>
        `;
    }

    removerWelcomeMessage() {
        const welcome = document.querySelector('.welcome-message');
        if (welcome) welcome.remove();
    }

    scrollToBottom() {
        const container = document.getElementById('messagesArea');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // ✅ FUNCIONALIDADES DO INPUT
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.enviarMensagem();
        }
        this.ajustarAlturaInput();
    }

    handleTyping() {
        this.atualizarContador();
        // Implementar indicador de digitação
    }

    atualizarContador() {
        const input = document.getElementById('messageInput');
        const contador = document.getElementById('charCounter');
        
        if (input && contador) {
            const length = input.value.length;
            contador.textContent = `${length}/1000`;
            
            if (length > 800) {
                contador.style.color = '#dc2626';
            } else if (length > 600) {
                contador.style.color = '#d97706';
            } else {
                contador.style.color = '#64748b';
            }
        }
    }

    ajustarAlturaInput() {
        const input = document.getElementById('messageInput');
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        }
    }

    // ✅ SISTEMA DE STATUS E ONLINE
    alterarStatus(novoStatus) {
        this.status = novoStatus;
        this.atualizarStatusOnline();
        console.log(`👤 Status: ${novoStatus}`);
    }

    definirStatus(status) {
        this.status = status;
        const selector = document.getElementById('statusSelect');
        if (selector) selector.value = status;
        this.atualizarStatusOnline();
    }

    async atualizarStatusOnline() {
        if (!this.chatRef || !this.funcionarioAtual) return;
        
        try {
            const userRef = this.chatRef.child(`usuarios_online/${this.usuario.email.replace(/[@.]/g, '_')}`);
            
            await userRef.set({
                nome: this.funcionarioAtual.nome,
                cargo: this.funcionarioAtual.cargo,
                iniciais: this.funcionarioAtual.iniciais,
                cor: this.funcionarioAtual.cor,
                status: this.status,
                ultimaAtividade: new Date().toISOString(),
                email: this.usuario.email
            });
            
            userRef.onDisconnect().remove();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
        }
    }

    configurarMonitoramento() {
        // Monitorar usuários online
        this.chatRef.child('usuarios_online').on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            const count = Object.keys(usuarios).length;
            
            const countEl = document.getElementById('onlineCount');
            if (countEl) countEl.textContent = count;
            
            this.usuariosOnline.clear();
            Object.values(usuarios).forEach(user => {
                this.usuariosOnline.set(user.email, user);
            });
            
            this.atualizarMembrosOnline();
        });
    }

    // ✅ BADGES E CONTADORES
    zerarBadgeGlobal() {
        const badge = document.getElementById('badgeGlobal');
        if (badge) {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
    }

    marcarComoLido(chatId) {
        this.mensagensNaoLidas.set(chatId, 0);
        this.atualizarBadges();
    }

    atualizarBadges() {
        // Implementar sistema de badges
    }

    // ✅ FUNCIONALIDADES PLACEHOLDER
    abrirEmojis() {
        console.log('😊 Abrir seletor de emojis');
    }

    anexarArquivo() {
        console.log('📎 Anexar arquivo');
    }

    limparChat() {
        if (confirm('Limpar mensagens do chat atual?')) {
            const container = document.getElementById('messagesArea');
            container.innerHTML = '';
            this.mostrarWelcomeMessage();
            this.mostrarNotificacao('Chat limpo', 'success');
        }
    }

    configurarChat() {
        console.log('⚙️ Configurações do chat');
    }

    exportarChat() {
        console.log('📥 Exportar chat');
    }

    silenciarChat() {
        console.log('🔕 Silenciar notificações');
    }

    marcarImportante() {
        console.log('⭐ Marcar como importante');
    }

    // ✅ UTILITÁRIOS AUXILIARES
    gerarIdChatPrivado(email1, email2) {
        return [email1, email2].sort().join('_').replace(/[@.]/g, '_');
    }

    async criarConversaPrivada(chatId, emailDestino) {
        const conversaRef = this.chatRef.child(`conversas_privadas/${chatId}`);
        
        try {
            const snapshot = await conversaRef.once('value');
            
            if (!snapshot.exists()) {
                await conversaRef.set({
                    participantes: [this.usuario.email, emailDestino],
                    criado: new Date().toISOString(),
                    ativo: true,
                    mensagens: {}
                });
            }
        } catch (error) {
            console.error('❌ Erro ao criar conversa privada:', error);
        }
    }

    tratarErroInicializacao(error) {
        console.error('❌ Falha crítica:', error);
        
        this.mostrarNotificacao('Sistema indisponível. Recarregue a página.', 'error');
        
        setTimeout(() => {
            if (confirm('Sistema com problema. Recarregar página?')) {
                window.location.reload();
            }
        }, 3000);
    }

    destruir() {
        this.listeners.forEach(listener => {
            if (listener && listener.off) listener.off();
        });
        
        this.removerInterfaceExistente();
        console.log('🧹 Chat destruído');
    }
}

// ✅ INICIALIZAÇÃO GLOBAL
let chatRev;

function inicializarChatRevolucionado() {
    if (chatRev) {
        console.log('🔄 Reinicializando chat...');
        chatRev.destruir();
    }
    
    chatRev = new ChatEmpresarialRevolucionado();
    window.chatRev = chatRev;
    
    return chatRev;
}

// ✅ AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM carregado - Aguardando sistema...');
    
    setTimeout(() => {
        inicializarChatRevolucionado();
    }, 4000);
});

// ✅ EXPOSIÇÃO GLOBAL
window.inicializarChatRevolucionado = inicializarChatRevolucionado;
window.CHATS_CONFIGURACAO = CHATS_CONFIGURACAO;
window.FUNCIONARIOS_OBRA = FUNCIONARIOS_OBRA;

console.log('🚀 Chat Empresarial Revolucionado carregado - v2.0.0');
