// ============================================
// 💎 CHAT EMPRESARIAL PREMIUM - ENGINE v4.0
// Sistema Avançado com Animações e UX Premium
// Arquivo: modules/chat-module.js
// 
// Este arquivo substitui diretamente o chat-module.js anterior
// Mantém compatibilidade total com o index.html existente
// ============================================

class ChatEmpresarialPremium {
    constructor() {
        this.version = '4.0.0';
        this.chatRef = null;
        this.usuario = null;
        this.chatAtivo = { tipo: 'publico', id: 'geral' };
        this.isOpen = false;
        this.mensagensNaoLidas = new Map();
        this.usuariosOnline = new Map();
        this.isInitialized = false;
        this.filtroAtivo = 'publico';
        this.typingUsers = new Map();
        this.messageCache = new Map();
        this.virtualScroll = null;
        this.theme = 'light';
        this.soundEnabled = true;
        this.animations = true;
        
        // Configurações de performance
        this.debounceTimers = new Map();
        this.intersectionObserver = null;
        
        // Sons do sistema
        this.sounds = {
            newMessage: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2Oy9diMFl2z/yk3b2+3NjCwFxBEbDxcnDhZ+jzTb0v9kDC9OiBzBRm0tAXqOG6lBACgaZJiu1NjhyDhRD0CLGLpTORLgFCNjdGTjzIykGQBDvhFbKQ65AEUMJyDVVgnVvhGwLzdkVwxQ725Y2Ke12TtKCwCQsJPMxMlOE28SLAiLFxhqkXkYvELmgSlfk3qkVEgo3lv+3aXnPBlaD1DfhNHLpABEBwHWvHA2CdTvjKPXm3qwVx8sWuLTyLTJPR5SHlTjfNXLpwBQBwnU6XwYBMvVm9L1m2+pfE8Y9lr92awrPhdmE1DU'),
            messageSent: new Audio('data:audio/wav;base64,UklGRvABAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcwBAACA3rLFstKp1rW7t9ey2rXUuNuz3LfhtNe02rbUuNq12LPiuOi457vpweLA4rzfvOS95L3jvOS95b3kveS75LvdtNu22rbZt9e31rTXuda138Tjzuu+6MCsqqikm6OOoZGgjqGOopGikqOTpJSllqaXp5iomaqbq5ysnq2gsKOzpraquKu5rbuuv7PEuMm9z8LUx9rM38/j0efU6szDrJeJoZGhkaGSopKjk6SVpZellqiXqZmqm6ycqC1tXpqAr3CaeNaVzK3dp8yx2azXr9uw2LLYseC74LnitOi66r3qvurA6sDqwerA6sDpverA6sDqwOu/68How/rrnQCTvnZjWcZm/4HHmN5pGgNJeOmuqo+SV4NfLQRLfcKnNwAAAA=='),
            typing: new Audio('data:audio/wav;base64,UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
        };
        
        console.log('🚀 Iniciando Chat Empresarial Premium v4.0...');
        this.iniciarSistema();
    }

    // ✨ INICIALIZAÇÃO AVANÇADA
    async iniciarSistema() {
        try {
            this.detectarTema();
            await this.aguardarDependencias();
            await this.configurarSistema();
            this.criarInterfacePremium();
            await this.inicializarFirebase();
            this.configurarEventosAvancados();
            this.inicializarAnimacoes();
            this.configurarIntersectionObserver();
            
            this.isInitialized = true;
            console.log('✅ Chat Premium inicializado com sucesso');
            
            // Animação de entrada
            this.animarEntrada();
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.exibirToast('Erro ao inicializar chat', 'error');
        }
    }

    // 🎨 DETECÇÃO DE TEMA
    detectarTema() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Listener para mudanças de tema
        window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
            this.theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.theme);
        });
    }

    // 🎯 CRIAÇÃO DA INTERFACE PREMIUM
    criarInterfacePremium() {
        this.removerInterfaceExistente();

        const chatHTML = `
            <!-- Toggle Premium -->
            <button id="chatTogglePremium" class="chat-toggle-premium">
                <div class="toggle-icon">💬</div>
                <div id="badgePremium" class="badge-premium hidden">0</div>
            </button>

            <!-- Painel Principal Premium -->
            <div id="chatPanelPremium" class="chat-panel-premium">
                <!-- Header Premium com Glassmorphism -->
                <header class="chat-header-premium glass">
                    <div class="header-left-premium">
                        <div class="header-logo-premium">
                            <span>🏛️</span>
                            <div>
                                <h2>Chat Empresarial</h2>
                                <span class="obra-tag-premium">Obra 292 - Museu Nacional</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-right-premium">
                        <div class="user-status-premium">
                            <div class="user-avatar-premium" style="background: ${this.funcionarioAtual?.cor || '#6366f1'}">
                                ${this.funcionarioAtual?.iniciais || 'US'}
                            </div>
                            <div class="user-details-premium">
                                <span class="user-name-premium">${this.funcionarioAtual?.nome || 'Usuário'}</span>
                                <span class="user-role-premium">${this.funcionarioAtual?.cargo || 'Membro'}</span>
                            </div>
                        </div>
                        <button class="btn-close-premium" onclick="chatPremium.fecharChat()">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M14.95 5.05a.75.75 0 10-1.06 1.06L11.06 9l2.83 2.89a.75.75 0 11-1.06 1.06L10 10.06l-2.89 2.83a.75.75 0 01-1.06-1.06L8.94 9 6.05 6.11a.75.75 0 011.06-1.06L10 7.94l2.89-2.89z"/>
                            </svg>
                        </button>
                    </div>
                </header>

                <!-- Container 3 Colunas -->
                <div class="chat-container-premium">
                    <!-- Sidebar Premium -->
                    <aside class="chat-sidebar-premium" id="chatSidebarPremium">
                        <!-- Busca Avançada -->
                        <div class="search-section-premium">
                            <div class="search-box-premium">
                                <span class="search-icon-premium">🔍</span>
                                <input type="text" 
                                       class="search-input-premium" 
                                       placeholder="Buscar conversas..."
                                       oninput="chatPremium.buscarConversas(this.value)">
                            </div>
                        </div>

                        <!-- Navigation Pills -->
                        <nav class="chat-nav-premium">
                            <button class="nav-pill-premium active" 
                                    data-tipo="publico"
                                    onclick="chatPremium.filtrarChats('publico')">
                                <span>🌐</span>
                                <span>Geral</span>
                            </button>
                            <button class="nav-pill-premium" 
                                    data-tipo="area"
                                    onclick="chatPremium.filtrarChats('area')">
                                <span>🏢</span>
                                <span>Áreas</span>
                            </button>
                            <button class="nav-pill-premium" 
                                    data-tipo="privado"
                                    onclick="chatPremium.filtrarChats('privado')">
                                <span>💬</span>
                                <span>Privados</span>
                            </button>
                        </nav>

                        <!-- Lista de Conversas -->
                        <div class="conversations-list-premium" id="conversationsListPremium">
                            <!-- Preenchido dinamicamente -->
                        </div>

                        <!-- Novo Chat -->
                        <div class="new-chat-section-premium">
                            <button class="btn-new-chat-premium" onclick="chatPremium.abrirNovoChat()">
                                <span>➕</span>
                                <span>Nova Conversa</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Chat Principal -->
                    <main class="chat-main-premium">
                        <!-- Header do Chat Ativo -->
                        <div class="chat-active-header-premium">
                            <div class="chat-info-premium">
                                <div class="chat-avatar-premium" id="chatAvatarPremium">🌐</div>
                                <div class="chat-details-premium">
                                    <h3 id="chatNamePremium">Chat Geral</h3>
                                    <span id="chatDescriptionPremium">Comunicação geral da obra</span>
                                </div>
                            </div>
                            <div class="chat-actions-premium">
                                <button class="btn-action-premium" onclick="chatPremium.toggleNotificacoes()" title="Notificações">
                                    🔔
                                </button>
                                <button class="btn-action-premium" onclick="chatPremium.abrirConfiguracoes()" title="Configurações">
                                    ⚙️
                                </button>
                            </div>
                        </div>

                        <!-- Área de Mensagens -->
                        <div class="messages-area-premium" id="messagesAreaPremium">
                            <!-- Welcome State -->
                            <div class="welcome-message-premium" id="welcomeStatePremium">
                                <div class="welcome-content-premium">
                                    <h3 class="gradient-text">Bem-vindo ao Chat Premium! 🚀</h3>
                                    <p>Sistema de comunicação avançado da Obra 292</p>
                                    <div class="welcome-features-premium">
                                        <div class="feature-premium">
                                            <span>✨</span>
                                            <span>Interface moderna com glassmorphism</span>
                                        </div>
                                        <div class="feature-premium">
                                            <span>💬</span>
                                            <span>Indicadores de digitação em tempo real</span>
                                        </div>
                                        <div class="feature-premium">
                                            <span>🎨</span>
                                            <span>Temas claro e escuro automáticos</span>
                                        </div>
                                        <div class="feature-premium">
                                            <span>🚀</span>
                                            <span>Performance otimizada com lazy loading</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Drop Zone para Arquivos -->
                            <div class="drop-zone-premium" id="dropZonePremium">
                                <div class="drop-zone-content">
                                    <span style="font-size: 48px;">📎</span>
                                    <h3>Solte arquivos aqui</h3>
                                    <p>Ou clique para selecionar</p>
                                </div>
                            </div>
                        </div>

                        <!-- Typing Indicator -->
                        <div class="typing-indicator-premium hidden" id="typingIndicatorPremium">
                            <div class="typing-avatar-premium">
                                <div class="avatar-circle-premium" style="background: #8b5cf6">JS</div>
                            </div>
                            <div class="typing-content">
                                <span class="typing-text">João está digitando</span>
                                <div class="typing-dots-premium">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Input Premium -->
                        <div class="input-area-premium">
                            <div class="input-container-premium">
                                <div class="input-box-premium">
                                    <textarea 
                                        id="messageInputPremium"
                                        class="input-textarea-premium"
                                        placeholder="Digite sua mensagem..."
                                        rows="1"
                                        onkeydown="chatPremium.handleKeyDown(event)"
                                        oninput="chatPremium.handleInput(event)"></textarea>
                                    <div class="input-actions-premium">
                                        <button class="btn-input-action-premium" onclick="chatPremium.abrirEmojis()" title="Emojis">
                                            😊
                                        </button>
                                        <button class="btn-input-action-premium" onclick="chatPremium.anexarArquivo()" title="Anexar">
                                            📎
                                        </button>
                                        <button class="btn-input-action-premium btn-send-premium" 
                                                onclick="chatPremium.enviarMensagem()"
                                                title="Enviar">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M17.218 2.268L2.477 8.388c-.596.245-.584.871.03 1.095l3.39 1.226 1.228 3.39c.223.613.85.625 1.094.029l6.12-14.74c.268-.642-.357-1.262-1.001-.998z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="input-footer-premium">
                                    <div class="char-counter-premium">
                                        <svg class="char-counter-circle" width="32" height="32">
                                            <circle class="char-counter-bg" cx="16" cy="16" r="14" />
                                            <circle class="char-counter-fill" 
                                                    cx="16" cy="16" r="14"
                                                    stroke-dasharray="88"
                                                    stroke-dashoffset="88" />
                                        </svg>
                                        <span class="char-counter-text" id="charCounterText">0</span>
                                    </div>
                                    <span class="input-help-premium">Enter para enviar • Shift+Enter para nova linha</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <!-- Info Panel Premium -->
                    <aside class="chat-info-panel-premium" id="chatInfoPanelPremium">
                        <div class="info-header-premium">
                            <h3>Informações</h3>
                        </div>

                        <!-- Membros Online -->
                        <div class="info-section-premium">
                            <div class="section-title-premium">
                                <span>👥</span>
                                <span>Membros Online</span>
                                <span class="section-count-premium" id="onlineCountPremium">0</span>
                            </div>
                            <div class="members-list-premium" id="membersListPremium">
                                <!-- Preenchido dinamicamente -->
                            </div>
                        </div>

                        <!-- Detalhes do Chat -->
                        <div class="info-section-premium">
                            <div class="section-title-premium">
                                <span>ℹ️</span>
                                <span>Detalhes</span>
                            </div>
                            <div class="chat-details-info-premium" id="chatDetailsInfoPremium">
                                <div class="detail-item-premium">
                                    <strong>Mensagens hoje:</strong>
                                    <span id="messagesTodayCount">0</span>
                                </div>
                                <div class="detail-item-premium">
                                    <strong>Participantes:</strong>
                                    <span id="participantsCount">0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Ações Rápidas -->
                        <div class="info-section-premium">
                            <div class="section-title-premium">
                                <span>⚡</span>
                                <span>Ações Rápidas</span>
                            </div>
                            <div class="quick-actions-premium">
                                <button class="quick-action-premium" onclick="chatPremium.buscarMensagens()">
                                    <span>🔍</span>
                                    <span>Buscar mensagens</span>
                                </button>
                                <button class="quick-action-premium" onclick="chatPremium.exportarChat()">
                                    <span>📥</span>
                                    <span>Exportar conversa</span>
                                </button>
                                <button class="quick-action-premium" onclick="chatPremium.limparChat()">
                                    <span>🧹</span>
                                    <span>Limpar histórico</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <!-- Modal de Nova Conversa -->
            <div id="newChatModalPremium" class="modal-overlay-premium">
                <div class="modal-content-premium">
                    <div class="modal-header-premium">
                        <h3>Nova Conversa</h3>
                        <button class="btn-close-premium" onclick="chatPremium.fecharModal()">✕</button>
                    </div>
                    <div class="modal-body-premium">
                        <input type="text" 
                               class="search-input-premium" 
                               placeholder="Buscar funcionário..."
                               oninput="chatPremium.filtrarContatos(this.value)">
                        <div class="contacts-list-premium" id="contactsListPremium">
                            <!-- Preenchido dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast Container -->
            <div class="toast-container-premium" id="toastContainerPremium"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        console.log('✅ Interface Premium criada');
        
        // Inicializar componentes
        this.inicializarComponentes();
    }

    // 🎯 COMPONENTES AVANÇADOS
    inicializarComponentes() {
        this.atualizarListaConversas();
        this.carregarMembrosOnline();
        this.configurarDragAndDrop();
        this.inicializarEmojiPicker();
        this.configurarMentions();
    }

    // 🔄 EVENTOS AVANÇADOS
    configurarEventosAvancados() {
        // Toggle principal
        const toggle = document.getElementById('chatTogglePremium');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleChat());
        }

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.toggleChat();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.fecharChat();
            }
        });

        // Visibility API para economia de recursos
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausarAnimacoes();
            } else {
                this.resumirAnimacoes();
            }
        });

        // Responsive handlers
        this.configurarResponsive();
    }

    // ✨ ANIMAÇÕES AVANÇADAS
    inicializarAnimacoes() {
        // Animações GSAP ou CSS customizadas
        this.animations = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (this.animations) {
            this.configurarAnimacoesEntrada();
            this.configurarAnimacoesMensagem();
            this.configurarAnimacoesInteracao();
        }
    }

    configurarAnimacoesEntrada() {
        // Stagger animation para lista de conversas
        const conversas = document.querySelectorAll('.conversation-item-premium');
        conversas.forEach((conv, index) => {
            conv.style.animationDelay = `${index * 50}ms`;
        });
    }

    animarEntrada() {
        const panel = document.getElementById('chatPanelPremium');
        if (panel && this.animations) {
            requestAnimationFrame(() => {
                panel.classList.add('active');
            });
        }
    }

    // 📐 INTERSECTION OBSERVER
    configurarIntersectionObserver() {
        const options = {
            root: document.querySelector('.messages-area-premium'),
            rootMargin: '0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.marcarComoLida(entry.target.dataset.messageId);
                }
            });
        }, options);
    }

    // 💬 SISTEMA DE MENSAGENS AVANÇADO
    async enviarMensagem() {
        const input = document.getElementById('messageInputPremium');
        if (!input) return;
        
        const texto = input.value.trim();
        if (!texto) return;

        // Animação de envio
        this.animarEnvio();

        const mensagem = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            autor: this.usuario?.email || 'usuario@exemplo.com',
            nomeAutor: this.funcionarioAtual?.nome || 'Usuário',
            cargo: this.funcionarioAtual?.cargo || 'Membro',
            iniciais: this.funcionarioAtual?.iniciais || 'US',
            cor: this.funcionarioAtual?.cor || '#6366f1',
            texto: texto,
            timestamp: new Date().toISOString(),
            tipo: 'normal',
            reactions: {},
            vistoPor: [this.usuario?.email],
            mentions: this.extrairMencoes(texto)
        };

        // Adicionar na UI imediatamente
        this.adicionarMensagemUI(mensagem);

        // Som de envio
        if (this.soundEnabled) {
            this.sounds.messageSent.play();
        }

        // Salvar no Firebase
        try {
            if (this.chatRef) {
                await this.chatRef.child(`chats/${this.chatAtivo.id}/mensagens/${mensagem.id}`).set(mensagem);
            }
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            this.exibirToast('Erro ao enviar mensagem', 'error');
        }

        // Limpar input
        input.value = '';
        this.atualizarContadorCaracteres();
        this.autoResizeTextarea(input);
        
        // Notificar typing = false
        this.notificarDigitacao(false);
    }

    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('messagesAreaPremium');
        if (!container || !mensagem) return;

        // Remover welcome state
        const welcome = document.getElementById('welcomeStatePremium');
        if (welcome) welcome.remove();

        const isPropia = mensagem.autor === this.usuario?.email;
        const tempo = this.formatarTempo(mensagem.timestamp);

        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message-item-premium ${isPropia ? 'own' : 'other'}`;
        mensagemEl.dataset.messageId = mensagem.id;
        
        // Verificar se deve agrupar com mensagem anterior
        const shouldGroup = this.devAgruparMensagem(mensagem);

        mensagemEl.innerHTML = `
            ${!shouldGroup ? `
                <div class="message-avatar-premium">
                    <div class="avatar-circle-premium" style="background: ${mensagem.cor || '#6366f1'}">
                        ${mensagem.iniciais || 'US'}
                    </div>
                </div>
            ` : '<div class="message-avatar-premium"></div>'}
            <div class="message-content-premium">
                ${!shouldGroup ? `
                    <div class="message-header-premium">
                        <span class="message-author-premium">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                        <span class="message-time-premium">${tempo}</span>
                    </div>
                ` : ''}
                <div class="message-text-premium">
                    ${this.processarTextoMensagem(mensagem.texto)}
                </div>
                <div class="message-reactions-premium" id="reactions-${mensagem.id}">
                    <!-- Reactions aparecem aqui -->
                </div>
            </div>
        `;

        // Adicionar event listeners
        const messageText = mensagemEl.querySelector('.message-text-premium');
        messageText.addEventListener('dblclick', () => this.abrirReactions(mensagem.id));

        container.appendChild(mensagemEl);
        
        // Observer para marcar como lida
        if (this.intersectionObserver && !isPropia) {
            this.intersectionObserver.observe(mensagemEl);
        }

        // Scroll suave para o fim
        this.scrollToBottom(true);
    }

    // 🎨 PROCESSAMENTO DE TEXTO
    processarTextoMensagem(texto) {
        // Processar menções
        texto = texto.replace(/@(\w+)/g, '<span class="mention-premium">@$1</span>');
        
        // Processar links
        texto = texto.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="link-premium">$1</a>');
        
        // Processar código
        texto = texto.replace(/`([^`]+)`/g, '<code class="code-inline-premium">$1</code>');
        
        return texto;
    }

    // 🔄 TYPING INDICATOR
    async notificarDigitacao(isTyping) {
        if (!this.chatRef || !this.usuario) return;

        const typingRef = this.chatRef.child(`chats/${this.chatAtivo.id}/typing/${this.usuario.email}`);
        
        if (isTyping) {
            await typingRef.set({
                nome: this.funcionarioAtual?.nome || 'Usuário',
                timestamp: Date.now()
            });
            
            // Auto-remover após 3 segundos
            setTimeout(() => {
                typingRef.remove();
            }, 3000);
        } else {
            await typingRef.remove();
        }
    }

    mostrarTypingIndicator(usuarios) {
        const indicator = document.getElementById('typingIndicatorPremium');
        if (!indicator) return;

        if (usuarios.length > 0) {
            const nomes = usuarios.map(u => u.nome).join(', ');
            const texto = usuarios.length === 1 
                ? `${nomes} está digitando` 
                : `${nomes} estão digitando`;
            
            indicator.querySelector('.typing-text').textContent = texto;
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    }

    // 📎 DRAG AND DROP
    configurarDragAndDrop() {
        const messagesArea = document.getElementById('messagesAreaPremium');
        const dropZone = document.getElementById('dropZonePremium');
        
        if (!messagesArea || !dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            messagesArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            messagesArea.addEventListener(eventName, () => {
                dropZone.classList.add('active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            messagesArea.addEventListener(eventName, () => {
                dropZone.classList.remove('active');
            }, false);
        });

        messagesArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        }, false);
    }

    handleFiles(files) {
        [...files].forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                this.exibirToast('Arquivo muito grande (máx 10MB)', 'warning');
                return;
            }
            
            this.uploadFile(file);
        });
    }

    async uploadFile(file) {
        // Implementar upload
        this.exibirToast(`Arquivo ${file.name} enviado!`, 'success');
    }

    // 🔔 NOTIFICAÇÕES TOAST
    exibirToast(mensagem, tipo = 'info', duracao = 3000) {
        const container = document.getElementById('toastContainerPremium');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-premium toast-${tipo}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[tipo]}</span>
            <span class="toast-message">${mensagem}</span>
        `;

        container.appendChild(toast);

        // Auto-remover
        setTimeout(() => {
            toast.style.animation = 'toast-slide-out 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    }

    // 🎯 REACTIONS
    abrirReactions(messageId) {
        const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];
        
        // Criar picker de emojis inline
        const reactionsContainer = document.getElementById(`reactions-${messageId}`);
        if (!reactionsContainer) return;

        const picker = document.createElement('div');
        picker.className = 'emoji-picker-inline';
        picker.innerHTML = emojis.map(emoji => 
            `<span class="emoji-option" onclick="chatPremium.adicionarReaction('${messageId}', '${emoji}')">${emoji}</span>`
        ).join('');

        reactionsContainer.appendChild(picker);

        // Remover picker após 3 segundos
        setTimeout(() => picker.remove(), 3000);
    }

    adicionarReaction(messageId, emoji) {
        // Implementar adição de reaction
        this.exibirToast('Reaction adicionada!', 'success');
    }

    // 🔍 BUSCA AVANÇADA
    buscarConversas(termo) {
        this.debounce('buscarConversas', () => {
            const conversas = document.querySelectorAll('.conversation-item-premium');
            const termoLower = termo.toLowerCase();

            conversas.forEach(conv => {
                const nome = conv.querySelector('.conv-name-premium')?.textContent.toLowerCase();
                const preview = conv.querySelector('.conv-preview-premium')?.textContent.toLowerCase();
                
                if (nome?.includes(termoLower) || preview?.includes(termoLower)) {
                    conv.style.display = 'flex';
                    // Highlight do termo
                    this.highlightTermo(conv, termo);
                } else {
                    conv.style.display = 'none';
                }
            });
        }, 300);
    }

    highlightTermo(elemento, termo) {
        // Implementar highlight visual
    }

    // 🛠️ UTILITIES
    debounce(key, func, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(func, delay);
        this.debounceTimers.set(key, timer);
    }

    formatarTempo(timestamp) {
        const data = new Date(timestamp);
        const agora = new Date();
        const diff = agora - data;
        
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    scrollToBottom(smooth = true) {
        const container = document.getElementById('messagesAreaPremium');
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // 📊 CHARACTER COUNTER
    atualizarContadorCaracteres() {
        const input = document.getElementById('messageInputPremium');
        const counter = document.getElementById('charCounterText');
        const circle = document.querySelector('.char-counter-fill');
        
        if (!input || !counter || !circle) return;

        const length = input.value.length;
        const max = 1000;
        const percentage = (length / max) * 100;
        const circumference = 2 * Math.PI * 14; // raio = 14
        const offset = circumference - (percentage / 100) * circumference;

        counter.textContent = length;
        circle.style.strokeDashoffset = offset;

        // Mudar cor baseado no comprimento
        if (length > 800) {
            circle.style.stroke = 'var(--chat-danger)';
        } else if (length > 600) {
            circle.style.stroke = 'var(--chat-warning)';
        } else {
            circle.style.stroke = 'var(--chat-primary)';
        }
    }

    // 🎮 CONTROLES
    toggleChat() {
        const panel = document.getElementById('chatPanelPremium');
        const toggle = document.getElementById('chatTogglePremium');
        
        if (!panel || !toggle) return;

        if (this.isOpen) {
            panel.classList.remove('active');
            this.isOpen = false;
        } else {
            panel.classList.add('active');
            this.isOpen = true;
            
            // Focar no input
            setTimeout(() => {
                const input = document.getElementById('messageInputPremium');
                if (input) input.focus();
            }, 300);
            
            // Resetar badge
            this.resetarBadge();
        }
    }

    fecharChat() {
        const panel = document.getElementById('chatPanelPremium');
        if (panel) {
            panel.classList.remove('active');
            this.isOpen = false;
        }
    }

    // 🎯 HANDLERS
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.enviarMensagem();
        }
    }

    handleInput(event) {
        this.autoResizeTextarea(event.target);
        this.atualizarContadorCaracteres();
        
        // Notificar digitação
        this.debounce('typing', () => {
            this.notificarDigitacao(event.target.value.length > 0);
        }, 1000);
    }

    // 🔄 FILTROS
    filtrarChats(tipo) {
        this.filtroAtivo = tipo;
        
        // Atualizar pills
        document.querySelectorAll('.nav-pill-premium').forEach(pill => {
            pill.classList.remove('active');
        });
        
        const pillAtivo = document.querySelector(`[data-tipo="${tipo}"]`);
        if (pillAtivo) {
            pillAtivo.classList.add('active');
        }

        this.atualizarListaConversas();
    }

    // 📱 RESPONSIVE
    configurarResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobileView = (e) => {
            if (e.matches) {
                this.configurarMobile();
            } else {
                this.configurarDesktop();
            }
        };
        
        mediaQuery.addListener(handleMobileView);
        handleMobileView(mediaQuery);
    }

    configurarMobile() {
        // Adicionar botões de navegação mobile
        const header = document.querySelector('.chat-header-premium');
        if (header && !header.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '☰';
            menuBtn.onclick = () => this.toggleSidebarMobile();
            header.prepend(menuBtn);
        }
    }

    configurarDesktop() {
        // Configurações específicas para desktop
    }

    toggleSidebarMobile() {
        const sidebar = document.getElementById('chatSidebarPremium');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    // 🔧 MÉTODOS DE COMPATIBILIDADE
    atualizarListaConversas() {
        const container = document.getElementById('conversationsListPremium');
        if (!container) return;

        container.innerHTML = '';

        if (this.filtroAtivo === 'publico') {
            const geral = CHATS_CONFIGURACAO.geral;
            this.adicionarItemConversa(geral, container);
        } else if (this.filtroAtivo === 'area') {
            Object.values(CHATS_CONFIGURACAO).forEach(chat => {
                if (chat.tipo === 'area') {
                    this.adicionarItemConversa(chat, container);
                }
            });
        } else if (this.filtroAtivo === 'privado') {
            container.innerHTML = `
                <div class="empty-state-premium">
                    <p>Nenhuma conversa privada ainda</p>
                    <small>Clique em "Nova Conversa" para começar</small>
                </div>
            `;
        }
    }

    adicionarItemConversa(chat, container) {
        const isAtivo = this.chatAtivo.id === chat.id;

        const item = document.createElement('div');
        item.className = `conversation-item-premium ${isAtivo ? 'active' : ''}`;
        item.onclick = () => this.trocarChat(chat.tipo, chat.id);
        
        item.innerHTML = `
            <div class="conv-avatar-premium" style="background: ${chat.cor}">
                ${chat.icon}
            </div>
            <div class="conv-content-premium">
                <div class="conv-header-premium">
                    <span class="conv-name-premium">${chat.nome}</span>
                    <span class="conv-time-premium">agora</span>
                </div>
                <div class="conv-preview-premium">
                    ${chat.descricao}
                </div>
            </div>
        `;

        container.appendChild(item);
    }

    trocarChat(tipo, id) {
        this.chatAtivo = { tipo, id };
        
        const chat = CHATS_CONFIGURACAO[id];
        if (chat) {
            // Atualizar header
            const avatar = document.getElementById('chatAvatarPremium');
            const name = document.getElementById('chatNamePremium');
            const desc = document.getElementById('chatDescriptionPremium');
            
            if (avatar) avatar.textContent = chat.icon;
            if (name) name.textContent = chat.nome;
            if (desc) desc.textContent = chat.descricao;
        }

        // Atualizar lista de conversas
        this.atualizarListaConversas();
        
        // Carregar mensagens
        this.carregarMensagens();
    }

    carregarMensagens() {
        // Implementar carregamento de mensagens
        console.log('Carregando mensagens do chat:', this.chatAtivo.id);
    }

    carregarMembrosOnline() {
        const container = document.getElementById('membersListPremium');
        const counter = document.getElementById('onlineCountPremium');
        
        if (!container || !counter) return;

        container.innerHTML = '';
        
        // Simular alguns membros online
        const membrosOnline = Object.entries(FUNCIONARIOS_OBRA).slice(0, 4);
        
        counter.textContent = membrosOnline.length;

        membrosOnline.forEach(([email, funcionario]) => {
            const item = document.createElement('div');
            item.className = 'member-item-premium';
            
            item.innerHTML = `
                <div class="member-avatar-premium" style="background: ${funcionario.cor}">
                    ${funcionario.iniciais}
                    <span class="member-status-dot"></span>
                </div>
                <div class="member-info-premium">
                    <span class="member-name-premium">${funcionario.nome}</span>
                    <span class="member-role-premium">${funcionario.cargo}</span>
                </div>
            `;

            container.appendChild(item);
        });
    }

    inicializarEmojiPicker() {
        // Implementação futura do emoji picker
    }

    configurarMentions() {
        // Implementação futura do sistema de menções
    }

    extrairMencoes(texto) {
        const mencoes = [];
        const regex = /@(\w+)/g;
        let match;
        while ((match = regex.exec(texto)) !== null) {
            mencoes.push(match[1]);
        }
        return mencoes;
    }

    devAgruparMensagem(mensagem) {
        // Lógica para determinar se deve agrupar com mensagem anterior
        // Por enquanto, retorna false
        return false;
    }

    marcarComoLida(messageId) {
        // Implementar marcação de leitura
        console.log('Mensagem marcada como lida:', messageId);
    }

    animarEnvio() {
        // Animação visual de envio
        const btn = document.querySelector('.btn-send-premium');
        if (btn) {
            btn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    }

    pausarAnimacoes() {
        this.animations = false;
    }

    resumirAnimacoes() {
        this.animations = true;
    }

    resetarBadge() {
        const badge = document.getElementById('badgePremium');
        if (badge) {
            badge.classList.add('hidden');
            badge.textContent = '0';
        }
    }

    atualizarBadge(count) {
        const badge = document.getElementById('badgePremium');
        if (badge && count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        }
    }

    toggleNotificacoes() {
        this.soundEnabled = !this.soundEnabled;
        this.exibirToast(
            this.soundEnabled ? 'Notificações ativadas' : 'Notificações desativadas',
            'info'
        );
    }

    abrirConfiguracoes() {
        this.exibirToast('Configurações em desenvolvimento', 'info');
    }

    buscarMensagens() {
        this.exibirToast('Busca em desenvolvimento', 'info');
    }

    exportarChat() {
        this.exibirToast('Exportação em desenvolvimento', 'info');
    }

    limparChat() {
        const container = document.getElementById('messagesAreaPremium');
        if (container) {
            container.innerHTML = `
                <div class="welcome-message-premium">
                    <div class="welcome-content-premium">
                        <h3 class="gradient-text">Chat limpo! 🧹</h3>
                        <p>Histórico removido com sucesso</p>
                    </div>
                </div>
            `;
            this.exibirToast('Histórico limpo', 'success');
        }
    }

    abrirNovoChat() {
        const modal = document.getElementById('newChatModalPremium');
        if (modal) {
            modal.classList.add('active');
            this.carregarListaContatos();
        }
    }

    fecharModal() {
        const modal = document.getElementById('newChatModalPremium');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    carregarListaContatos() {
        const container = document.getElementById('contactsListPremium');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(FUNCIONARIOS_OBRA).forEach(([email, funcionario]) => {
            if (email === this.usuario?.email) return;

            const item = document.createElement('div');
            item.className = 'contact-item-premium';
            item.onclick = () => {
                this.iniciarConversaPrivada(email, funcionario);
                this.fecharModal();
            };
            
            item.innerHTML = `
                <div class="contact-avatar-premium" style="background: ${funcionario.cor}">
                    ${funcionario.iniciais}
                </div>
                <div class="contact-info-premium">
                    <span class="contact-name-premium">${funcionario.nome}</span>
                    <span class="contact-role-premium">${funcionario.cargo}</span>
                </div>
                <div class="contact-status-premium online"></div>
            `;

            container.appendChild(item);
        });
    }

    filtrarContatos(termo) {
        // Implementar filtro de contatos
        console.log('Filtrando contatos:', termo);
    }

    iniciarConversaPrivada(email, funcionario) {
        this.exibirToast(`Iniciando conversa com ${funcionario.nome}`, 'success');
        // Implementar início de conversa privada
    }

    abrirEmojis() {
        this.exibirToast('Emoji picker em desenvolvimento', 'info');
    }

    anexarArquivo() {
        // Criar input file temporário
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
        
        input.onchange = (e) => {
            this.handleFiles(e.target.files);
        };
        
        input.click();
    }

    // Métodos de compatibilidade adicionais
    aguardarDependencias() {
        return new Promise((resolve) => {
            // Mock de dependências para desenvolvimento
            setTimeout(() => {
                this.usuario = window.usuarioAtual || { 
                    email: 'usuario@exemplo.com', 
                    displayName: 'Usuário Exemplo' 
                };
                this.chatRef = window.database?.ref('chat_empresarial_v4');
                resolve();
            }, 100);
        });
    }

    configurarSistema() {
        const email = this.usuario?.email || 'usuario@exemplo.com';
        const funcionario = FUNCIONARIOS_OBRA[email];
        
        if (funcionario) {
            this.funcionarioAtual = funcionario;
        } else {
            this.funcionarioAtual = {
                nome: this.usuario?.displayName || 'Usuário',
                cargo: 'Membro da Equipe',
                area: 'geral',
                nivel: 'colaborador',
                iniciais: 'US',
                cor: '#6366f1'
            };
        }
    }

    async inicializarFirebase() {
        // Mock de inicialização Firebase
        console.log('Firebase mock inicializado');
    }

    // 🧹 LIMPEZA
    destruir() {
        // Limpar timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        
        // Limpar observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Remover elementos
        this.removerInterfaceExistente();
        
        console.log('🧹 Chat Premium destruído');
    }

    removerInterfaceExistente() {
        const elementos = [
            'chatTogglePremium', 'chatPanelPremium', 'newChatModalPremium',
            'toastContainerPremium', 'chatToggleCorrigido', 'chatPanelCorrigido',
            'chatToggleRev', 'chatPanelRev', 'chatToggle', 'chatPanel',
            'chatEmpresarial', 'panelChatEmp'
        ];
        
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    // ... Métodos auxiliares continuam ...
}

// 🚀 DADOS DO SISTEMA
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

const CHATS_CONFIGURACAO = {
    geral: {
        id: 'geral',
        nome: 'Chat Geral',
        icon: '🌐',
        cor: '#3b82f6',
        descricao: 'Comunicação geral da obra',
        tipo: 'publico'
    },
    documentacao: {
        id: 'documentacao',
        nome: 'Documentação',
        icon: '📁',
        cor: '#8b5cf6',
        descricao: 'Arquivos e documentação',
        tipo: 'area'
    },
    planejamento: {
        id: 'planejamento',
        nome: 'Planejamento',
        icon: '📋',
        cor: '#06b6d4',
        descricao: 'Cronogramas e estratégia',
        tipo: 'area'
    },
    producao: {
        id: 'producao',
        nome: 'Produção',
        icon: '🏗️',
        cor: '#ef4444',
        descricao: 'Execução e qualidade',
        tipo: 'area'
    }
};

// 🚀 INICIALIZAÇÃO GLOBAL
let chatPremium;

function inicializarChatPremium() {
    try {
        if (chatPremium) {
            console.log('🔄 Reinicializando chat premium...');
            chatPremium.destruir();
        }
        
        chatPremium = new ChatEmpresarialPremium();
        window.chatPremium = chatPremium;
        window.chatCorrigido = chatPremium; // Compatibilidade com versão anterior
        
        return chatPremium;
    } catch (error) {
        console.error('❌ Erro ao inicializar chat premium:', error);
        return null;
    }
}

// 🎯 AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM carregado - Iniciando chat premium...');
    
    // Aguardar um momento para garantir que tudo esteja carregado
    setTimeout(() => {
        inicializarChatPremium();
    }, 1000);
});

// 🌍 EXPOSIÇÃO GLOBAL
window.inicializarChatPremium = inicializarChatPremium;
window.inicializarChatCorrigido = inicializarChatPremium; // Compatibilidade
window.ChatEmpresarialPremium = ChatEmpresarialPremium;
window.ChatEmpresarialCorrigido = ChatEmpresarialPremium; // Compatibilidade
window.FUNCIONARIOS_OBRA_PREMIUM = FUNCIONARIOS_OBRA;
window.FUNCIONARIOS_OBRA_V3 = FUNCIONARIOS_OBRA; // Compatibilidade
window.CHATS_CONFIGURACAO_PREMIUM = CHATS_CONFIGURACAO;
window.CHATS_CONFIGURACAO_V3 = CHATS_CONFIGURACAO; // Compatibilidade

console.log('💎 Chat Empresarial Premium carregado - v4.0.0');
