// ============================================
// 💼 SISTEMA DE CHAT PROFISSIONAL - VERSÃO CORRIGIDA
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
        this.statusUsuario = 'online';
        this.modoNaoPerturbe = false;
        this.inicializado = false;
        this.tentativasInit = 0;
        this.maxTentativas = 20; // 10 segundos
        
        console.log('🚀 Chat System Profissional - Iniciando...');
        this.iniciarSistema();
    }

    // ✅ INICIALIZAÇÃO ROBUSTA
    iniciarSistema() {
        const verificarDependencias = () => {
            this.tentativasInit++;
            
            if (window.usuarioAtual && window.dados && window.database) {
                this.usuario = window.usuarioAtual;
                this.areas = window.dados.areas;
                this.chatRef = window.database.ref('chat');
                
                console.log('✅ Chat System - Dependências encontradas!');
                console.log('👤 Usuário:', this.usuario.email);
                console.log('📁 Areas:', Object.keys(this.areas || {}));
                
                this.init();
                return;
            }
            
            if (this.tentativasInit >= this.maxTentativas) {
                console.error('❌ Chat System - Timeout na inicialização');
                this.mostrarErroInicializacao();
                return;
            }
            
            console.log(`⏳ Chat System - Tentativa ${this.tentativasInit}/${this.maxTentativas}...`);
            setTimeout(verificarDependencias, 500);
        };
        
        verificarDependencias();
    }

    async init() {
        if (this.inicializado) return;
        
        try {
            console.log('🔧 Inicializando sistema de chat...');
            
            // 1. Criar interface
            this.criarInterface();
            
            // 2. Configurar Firebase
            await this.inicializarFirebase();
            
            // 3. Configurar listeners
            this.configurarEventListeners();
            
            // 4. Carregar chats
            this.carregarChats();
            
            // 5. Marcar como online
            this.marcarUsuarioOnline();
            
            // 6. Configurar notificações
            this.configurarNotificacoes();
            
            this.inicializado = true;
            console.log('✅ Chat System TOTALMENTE inicializado!');
            
            // Mostrar notificação de sucesso
            if (window.mostrarNotificacao) {
                window.mostrarNotificacao('💬 Chat profissional ativado!');
            }
            
        } catch (error) {
            console.error('❌ Erro na inicialização do chat:', error);
            this.mostrarErroInicializacao();
        }
    }

    mostrarErroInicializacao() {
        const errorHTML = `
            <div id="chatErrorNotification" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="font-weight: bold; margin-bottom: 4px;">❌ Chat Indisponível</div>
                <div style="font-size: 14px;">Sistema principal não carregou completamente</div>
                <button onclick="this.parentElement.remove()" style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                ">×</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHTML);
        
        // Remover automaticamente após 10 segundos
        setTimeout(() => {
            const notification = document.getElementById('chatErrorNotification');
            if (notification) notification.remove();
        }, 10000);
    }

    // ✅ FIREBASE INICIALIZAÇÃO SEGURA
    async inicializarFirebase() {
        try {
            if (!this.chatRef) {
                throw new Error('Referência do Firebase não disponível');
            }
            
            const snapshot = await this.chatRef.once('value');
            if (!snapshot.val()) {
                console.log('🔧 Criando estrutura inicial do chat...');
                await this.chatRef.set({
                    mensagens: { 
                        global: {
                            msg_inicial: {
                                id: 'msg_inicial',
                                autor: 'sistema@obra.com',
                                nomeAutor: 'Sistema',
                                texto: '🏗️ Bem-vindos ao chat da obra 292! Sistema de comunicação profissional ativo.',
                                timestamp: new Date().toISOString(),
                                chatId: 'global'
                            }
                        }
                    },
                    usuariosOnline: {},
                    privados: {}
                });
            }
            console.log('✅ Firebase configurado');
        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            throw error;
        }
    }

    // ✅ INTERFACE MELHORADA E ISOLADA
    criarInterface() {
        // Remover interface existente se houver
        const existingToggle = document.getElementById('chatToggle');
        const existingPanel = document.getElementById('chatPanel');
        if (existingToggle) existingToggle.remove();
        if (existingPanel) existingPanel.remove();

        // Ocultar indicador de sincronização que pode conflitar
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
                            <div class="user-status" onclick="window.chatSystem.toggleStatusMenu()">
                                <div class="status-dot ${this.statusUsuario}" id="userStatusDot"></div>
                                <span id="userStatusText">Online</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            
                            <!-- Menu de Status -->
                            <div id="statusMenu" class="status-menu hidden">
                                <div class="status-option" onclick="window.chatSystem.setStatus('online')">
                                    <div class="status-dot online"></div>Online
                                </div>
                                <div class="status-option" onclick="window.chatSystem.setStatus('ocupado')">
                                    <div class="status-dot ocupado"></div>Ocupado
                                </div>
                                <div class="status-option" onclick="window.chatSystem.setStatus('reuniao')">
                                    <div class="status-dot reuniao"></div>Em Reunião
                                </div>
                                <div class="status-option" onclick="window.chatSystem.setStatus('ausente')">
                                    <div class="status-dot ausente"></div>Ausente
                                </div>
                                <div class="status-divider"></div>
                                <div class="status-option" onclick="window.chatSystem.toggleNaoPerturbe()">
                                    <span id="naoPerturbeIcon">🔔</span>
                                    <span id="naoPerturbeText">Não Perturbe</span>
                                </div>
                            </div>
                            
                            <div class="users-online-pro">
                                <span id="usersOnlineCount">👥 0</span>
                            </div>
                            
                            <button class="header-btn" onclick="window.chatSystem.limparChat()" title="Limpar Chat">🗑️</button>
                            <button class="header-btn" onclick="window.chatSystem.toggleChat()" title="Fechar">×</button>
                        </div>
                    </div>
                </div>

                <div class="chat-content-pro">
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
                                            👥 <span id="membersCountPro">10</span> membros
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Área de Mensagens Profissional -->
                        <div class="messages-container-pro" id="messagesContainerPro">
                            <div class="welcome-message-pro">
                                <div class="welcome-icon">💼</div>
                                <h3>Chat Profissional da Obra</h3>
                                <p>Sistema de comunicação corporativa</p>
                                <div class="welcome-tips">
                                    <div class="tip">💡 Use @nome para mencionar alguém</div>
                                    <div class="tip">📌 Clique em uma mensagem para reagir</div>
                                    <div class="tip">🔍 Mensagens são salvas automaticamente</div>
                                </div>
                            </div>
                        </div>

                        <!-- Área de Input Profissional -->
                        <div class="input-area-pro">
                            <!-- Container de Input -->
                            <div class="input-container-pro">                                
                                <div class="input-main">
                                    <textarea id="chatInputPro" placeholder="Digite sua mensagem..." 
                                              onkeydown="window.chatSystem.handleKeyDown(event)"
                                              oninput="window.chatSystem.handleTyping(event)"
                                              rows="1"></textarea>
                                    <button id="sendBtnPro" class="send-btn-pro" onclick="window.chatSystem.enviarMensagem()">
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
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        console.log('✅ Interface criada');
    }

    // ✅ EVENT LISTENERS SEGUROS
    configurarEventListeners() {
        try {
            // Toggle chat
            const toggle = document.getElementById('chatToggle');
            if (toggle) {
                toggle.addEventListener('click', () => this.toggleChat());
            }
            
            // Fechar menu de status ao clicar fora
            document.addEventListener('click', (e) => {
                const statusMenu = document.getElementById('statusMenu');
                const userStatus = document.querySelector('.user-status');
                
                if (statusMenu && !statusMenu.contains(e.target) && !userStatus.contains(e.target)) {
                    statusMenu.classList.add('hidden');
                }
            });
            
            console.log('✅ Event listeners configurados');
        } catch (error) {
            console.error('❌ Erro nos event listeners:', error);
        }
    }

    // ✅ CARREGAMENTO DE CHATS FUNCIONAL
    carregarChats() {
        try {
            this.abrirChat('global');
            this.carregarMensagens('global');
            console.log('✅ Chats carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar chats:', error);
        }
    }

    // ✅ ABRIR CHAT FUNCIONAL
    abrirChat(chatId) {
        this.chatAtivo = chatId;
        this.configurarInfoChat(chatId);
        this.carregarMensagens(chatId);
        console.log(`📂 Chat aberto: ${chatId}`);
    }

    configurarInfoChat(chatId) {
        const titleEl = document.getElementById('chatTitlePro');
        const descEl = document.getElementById('chatDescriptionPro');
        const avatarEl = document.getElementById('chatAvatar');
        
        if (chatId === 'global') {
            if (titleEl) titleEl.textContent = 'Chat Geral';
            if (descEl) descEl.textContent = 'Comunicação geral da obra';
            if (avatarEl) avatarEl.textContent = '🌐';
        }
    }

    // ✅ CARREGAMENTO DE MENSAGENS ROBUSTO
    carregarMensagens(chatId) {
        if (!this.chatRef) {
            console.error('❌ ChatRef não disponível');
            return;
        }
        
        try {
            const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
            
            // Carregar mensagens existentes
            messagesRef.once('value', (snapshot) => {
                const mensagens = snapshot.val() || {};
                const container = document.getElementById('messagesContainerPro');
                
                if (container) {
                    // Limpar mensagens antigas
                    container.innerHTML = '';
                }
                
                const mensagensArray = Object.values(mensagens).sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                );
                
                if (mensagensArray.length === 0) {
                    this.mostrarWelcomeMessage();
                } else {
                    mensagensArray.forEach(mensagem => {
                        this.adicionarMensagemUI(mensagem);
                    });
                }
                
                console.log(`✅ ${mensagensArray.length} mensagens carregadas para ${chatId}`);
            });
            
            // Listener para novas mensagens
            const listenerKey = `mensagens_${chatId}`;
            if (this.listeners.has(listenerKey)) {
                this.listeners.get(listenerKey).off();
            }
            
            const newMessageListener = messagesRef.on('child_added', (snapshot) => {
                const mensagem = snapshot.val();
                if (mensagem && this.chatAtivo === chatId) {
                    // Verificar se não é mensagem duplicada
                    const container = document.getElementById('messagesContainerPro');
                    const existente = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
                    
                    if (!existente) {
                        this.adicionarMensagemUI(mensagem);
                        this.removerWelcomeMessage();
                    }
                }
            });
            
            this.listeners.set(listenerKey, { off: () => messagesRef.off('child_added', newMessageListener) });
            
        } catch (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
        }
    }

    mostrarWelcomeMessage() {
        const container = document.getElementById('messagesContainerPro');
        if (container) {
            container.innerHTML = `
                <div class="welcome-message-pro">
                    <div class="welcome-icon">💼</div>
                    <h3>Chat Profissional da Obra</h3>
                    <p>Sistema de comunicação corporativa</p>
                    <div class="welcome-tips">
                        <div class="tip">💡 Use @nome para mencionar alguém</div>
                        <div class="tip">📌 Mensagens são salvas automaticamente</div>
                        <div class="tip">🔍 Histórico preservado no Firebase</div>
                    </div>
                </div>
            `;
        }
    }

    removerWelcomeMessage() {
        const welcome = document.querySelector('.welcome-message-pro');
        if (welcome) {
            welcome.remove();
        }
    }

    // ✅ ENVIO DE MENSAGEM FUNCIONAL
    enviarMensagem() {
        const input = document.getElementById('chatInputPro');
        if (!input || !this.chatRef) return;
        
        const texto = input.value.trim();
        if (!texto || !this.chatAtivo || !this.usuario) {
            console.log('❌ Dados insuficientes para enviar');
            return;
        }
        
        const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
        const mensagemId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const mensagem = {
            id: mensagemId,
            autor: this.usuario.email,
            nomeAutor: nomeUsuario,
            texto: texto,
            timestamp: new Date().toISOString(),
            chatId: this.chatAtivo,
            editado: false
        };
        
        console.log('📤 Enviando mensagem:', { id: mensagemId, texto: texto.substring(0, 50) });
        
        this.chatRef.child(`mensagens/${this.chatAtivo}/${mensagemId}`).set(mensagem)
            .then(() => {
                console.log('✅ Mensagem enviada!');
                input.value = '';
                this.atualizarContadorCaracteres();
                this.ajustarAlturaInput();
                setTimeout(() => input.focus(), 100);
            })
            .catch((error) => {
                console.error('❌ Erro ao enviar:', error);
                if (window.mostrarNotificacao) {
                    window.mostrarNotificacao('Erro ao enviar mensagem!', 'error');
                }
            });
    }

    // ✅ UI DE MENSAGEM MELHORADA
    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('messagesContainerPro');
        if (!container || !mensagem) return;
        
        // Verificar duplicata
        const existente = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
        if (existente) return;
        
        const isPropia = mensagem.autor === this.usuario.email;
        const usuarioInfo = USUARIOS_SISTEMA[mensagem.autor] || {};
        
        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message-pro ${isPropia ? 'own' : 'other'}`;
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
            </div>
            
            <div class="message-content-wrapper">
                <div class="message-header-pro">
                    <span class="message-author-pro">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                    <span class="message-role">${usuarioInfo.cargo || ''}</span>
                    <span class="message-time-pro">${tempoFormatado}</span>
                </div>
                
                <div class="message-body-pro">
                    <div class="message-text">${this.formatarMensagem(mensagem.texto)}</div>
                </div>
            </div>
        `;
        
        container.appendChild(mensagemEl);
        
        // Scroll suave para baixo
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
        
        console.log(`✅ Mensagem UI adicionada: ${mensagem.texto.substring(0, 30)}...`);
    }

    formatarMensagem(texto) {
        return texto
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // ✅ FUNÇÕES DE UI
    toggleChat() {
        const panel = document.getElementById('chatPanel');
        const toggle = document.getElementById('chatToggle');
        
        if (!panel || !toggle) return;
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            this.isOpen = false;
            console.log('📵 Chat fechado');
        } else {
            panel.classList.remove('hidden');
            this.isOpen = true;
            console.log('📱 Chat aberto');
            
            const input = document.getElementById('chatInputPro');
            if (input) {
                setTimeout(() => input.focus(), 200);
            }
        }
    }

    // ✅ STATUS DO USUÁRIO
    setStatus(novoStatus) {
        this.statusUsuario = novoStatus;
        this.atualizarStatusUI();
        this.salvarStatusOnline();
        
        // Fechar menu
        const menu = document.getElementById('statusMenu');
        if (menu) menu.classList.add('hidden');
        
        const statusTextos = {
            online: 'Online',
            ocupado: 'Ocupado',
            reuniao: 'Em Reunião',
            ausente: 'Ausente'
        };
        
        if (window.mostrarNotificacao) {
            window.mostrarNotificacao(`Status: ${statusTextos[novoStatus]}`);
        }
        
        console.log(`👤 Status alterado para: ${novoStatus}`);
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
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    toggleNaoPerturbe() {
        this.modoNaoPerturbe = !this.modoNaoPerturbe;
        
        const icon = document.getElementById('naoPerturbeIcon');
        const text = document.getElementById('naoPerturbeText');
        
        if (this.modoNaoPerturbe) {
            if (icon) icon.textContent = '🔕';
            if (text) text.textContent = 'Não Perturbe (Ativo)';
            if (window.mostrarNotificacao) {
                window.mostrarNotificacao('Modo Não Perturbe ativado');
            }
        } else {
            if (icon) icon.textContent = '🔔';
            if (text) text.textContent = 'Não Perturbe';
            if (window.mostrarNotificacao) {
                window.mostrarNotificacao('Modo Não Perturbe desativado');
            }
        }
        
        console.log(`🔔 Não perturbe: ${this.modoNaoPerturbe}`);
    }

    // ✅ FUNÇÕES DE INPUT
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.enviarMensagem();
        }
        this.ajustarAlturaInput();
    }

    handleTyping(event) {
        this.atualizarContadorCaracteres();
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

    // ✅ FUNÇÕES DE MANUTENÇÃO
    marcarUsuarioOnline() {
        if (!this.chatRef || !this.usuario) return;
        
        try {
            const userOnlineRef = this.chatRef.child(`usuariosOnline/${this.usuario.email.replace(/[@.]/g, '_')}`);
            
            userOnlineRef.set({
                nome: window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0],
                email: this.usuario.email,
                status: this.statusUsuario,
                ultimaAtividade: new Date().toISOString()
            });
            
            // Remover quando desconectar
            userOnlineRef.onDisconnect().remove();
            
            console.log('✅ Usuário marcado como online');
        } catch (error) {
            console.error('❌ Erro ao marcar online:', error);
        }
    }

    salvarStatusOnline() {
        if (!this.chatRef || !this.usuario) return;
        
        try {
            this.chatRef.child(`usuariosOnline/${this.usuario.email.replace(/[@.]/g, '_')}/status`).set(this.statusUsuario);
        } catch (error) {
            console.error('❌ Erro ao salvar status:', error);
        }
    }

    configurarNotificacoes() {
        // Solicitar permissão para notificações
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log(`🔔 Permissão de notificação: ${permission}`);
            });
        }
    }

    // ✅ FUNÇÕES AUXILIARES
    limparChat() {
        if (confirm('Deseja limpar o histórico do chat atual?')) {
            const container = document.getElementById('messagesContainerPro');
            if (container) {
                container.innerHTML = '';
                this.mostrarWelcomeMessage();
            }
            
            if (window.mostrarNotificacao) {
                window.mostrarNotificacao('Chat limpo!');
            }
            
            console.log('🗑️ Chat limpo');
        }
    }

    destruir() {
        // Limpar listeners
        this.listeners.forEach(listener => {
            if (listener && listener.off) {
                listener.off();
            }
        });
        this.listeners.clear();
        
        // Remover elementos da UI
        const toggle = document.getElementById('chatToggle');
        const panel = document.getElementById('chatPanel');
        if (toggle) toggle.remove();
        if (panel) panel.remove();
        
        console.log('🧹 Chat system destruído');
    }
}

// ✅ INICIALIZAÇÃO GLOBAL SEGURA
let chatSystem;

function inicializarChatGlobal() {
    if (chatSystem) {
        console.log('⚠️ Chat system já existe, destruindo anterior...');
        chatSystem.destruir();
    }
    
    chatSystem = new ChatSystemProfissional();
    window.chatSystem = chatSystem;
    
    return chatSystem;
}

// ✅ AGUARDAR DOM + DELAY PARA SISTEMA PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM carregado, aguardando sistema principal...');
    
    // Aguardar sistema principal estar pronto
    setTimeout(() => {
        inicializarChatGlobal();
    }, 3000); // 3 segundos de delay
});

// ✅ EXPOR FUNÇÕES GLOBALMENTE
window.inicializarChatGlobal = inicializarChatGlobal;
window.USUARIOS_SISTEMA = USUARIOS_SISTEMA;

// ✅ FUNÇÃO DE CADASTRO (mantida)
async function cadastrarTodosUsuarios() {
    console.log('🔧 Iniciando cadastro de usuários...');
    
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
            
            resultados.push(`✅ ${dadosUsuario.nome}: Cadastrado`);
            
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                resultados.push(`⚠️ ${dadosUsuario.nome}: Já existe`);
            } else {
                resultados.push(`❌ ${dadosUsuario.nome}: Erro`);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('📋 RESULTADO:', resultados);
    alert(`CADASTRO CONCLUÍDO:\n\n${resultados.join('\n')}`);
    
    return resultados;
}

window.cadastrarTodosUsuarios = cadastrarTodosUsuarios;

console.log('💼 Chat System PROFISSIONAL - Módulo carregado ✅');
