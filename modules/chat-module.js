// ============================================
// 💬 SISTEMA DE CHAT COMPLETO FINAL - CORRIGIDO COM USUÁRIOS REAIS
// ============================================

// ✅ BASE DE DADOS DE USUÁRIOS REAIS
const USUARIOS_SISTEMA = {
    'bruabritto@biapo.com.br': {
        nome: 'Bruna',
        cargo: 'Arquiteta Trainee',
        area: 'Documentação & Arquivo',
        senha: 'Bruna@2025',
        ativo: true
    },
    'isabella@biapo.com.br': {
        nome: 'Isabella',
        cargo: 'Coordenadora Geral',
        area: 'Planejamento & Controle de Obra',
        senha: 'Isabella@2025',
        ativo: true
    },
    'renatoremiro@biapo.com.br': {
        nome: 'Renato',
        cargo: 'Coordenador',
        area: 'Documentação & Arquivo',
        senha: 'Renato@2025',
        ativo: true
    },
    'redeinterna.obra3@gmail.com': {
        nome: 'Juliana A.',
        cargo: 'Estagiária de Arquitetura',
        area: 'Documentação & Arquivo',
        senha: 'Juliana@2025',
        ativo: true
    },
    'eduardo@biapo.com.br': {
        nome: 'Eduardo',
        cargo: 'Coordenador Eng. Civil',
        area: 'Produção & Qualidade',
        senha: 'Eduardo@2025',
        ativo: true
    },
    'carlosmendonca@biapo.com.br': {
        nome: 'Beto',
        cargo: 'Coordenador Arquiteto', // ✅ CORRIGIDO
        area: 'Produção & Qualidade',
        senha: 'Beto@2025',
        ativo: true
    },
    'alex@biapo.com.br': {
        nome: 'Alex',
        cargo: 'Comprador',
        area: 'Produção & Qualidade',
        senha: 'Alex@2025',
        ativo: true
    },
    'laracoutinho@biapo.com.br': {
        nome: 'Lara',
        cargo: 'Arquiteta Trainee',
        area: 'Planejamento & Controle de Obra',
        senha: 'Lara@2025',
        ativo: true
    },
    'emanoelimoreira@biapo.com.br': {
        nome: 'Manu',
        cargo: 'Assistente de Arquitetura',
        area: 'Produção & Qualidade',
        senha: 'Manu@2025',
        ativo: true
    },
    'estagio292@biapo.com.br': {
        nome: 'Jean',
        cargo: 'Estagiário de Eng. Civil',
        area: 'Produção & Qualidade',
        senha: 'Jean@2025',
        ativo: true
    }
};

class ChatSystem {
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
        
        this.aguardarInicializacao();
    }

    aguardarInicializacao() {
        const verificar = () => {
            if (window.usuarioAtual && window.dados && window.database) {
                this.usuario = window.usuarioAtual;
                this.areas = window.dados.areas;
                this.chatRef = window.database.ref('chat');
                
                console.log('✅ Chat System - Iniciando com usuário:', this.usuario.email);
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
            this.iniciarNotificacoesGlobais();
            
            console.log('✅ Sistema de Chat COMPLETO inicializado');
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
                    mensagens: {
                        global: {}
                    },
                    usuariosOnline: {},
                    privados: {}
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
            <!-- Botão Flutuante do Chat -->
            <div id="chatToggle" class="chat-toggle">
                <span class="chat-icon">💬</span>
                <span id="chatBadge" class="chat-badge hidden">0</span>
            </div>

            <!-- Painel do Chat -->
            <div id="chatPanel" class="chat-panel hidden">
                <div class="chat-header">
                    <h3>💬 Chat da Obra</h3>
                    <div class="chat-controls">
                        <span id="usersOnlineCount" class="users-online">👥 0</span>
                        <button id="clearChatBtn" class="chat-btn" onclick="chatSystem.limparChat()" title="Limpar conversa">🗑️</button>
                        <button id="chatMinimize" class="chat-btn">−</button>
                        <button id="chatClose" class="chat-btn">×</button>
                    </div>
                </div>

                <div class="chat-content">
                    <!-- Lista de Conversas -->
                    <div class="chat-sidebar">
                        <div class="chat-search">
                            <input type="text" id="chatSearch" placeholder="🔍 Buscar conversas..." onkeyup="chatSystem.filtrarConversas(this.value)">
                        </div>
                        
                        <div class="chat-sections">
                            <!-- Chat Global -->
                            <div class="chat-section">
                                <div class="section-title">🌐 Geral</div>
                                <div class="chat-room-item active" data-room="global" onclick="chatSystem.abrirChat('global')">
                                    <div class="room-info">
                                        <span class="room-icon">🌐</span>
                                        <span class="room-name">Chat Geral</span>
                                    </div>
                                    <span class="unread-count hidden" id="unread-global">0</span>
                                </div>
                            </div>

                            <!-- Chats por Área -->
                            <div class="chat-section">
                                <div class="section-title">📁 Por Área</div>
                                <div id="chatsAreas"></div>
                            </div>

                            <!-- Chats de Projetos/Atividades -->
                            <div class="chat-section">
                                <div class="section-title">📋 Projetos</div>
                                <div id="chatsProjetos"></div>
                            </div>

                            <!-- Chats Privados -->
                            <div class="chat-section">
                                <div class="section-title">👤 Privados</div>
                                <div id="chatsPrivados"></div>
                                <button class="new-chat-btn" onclick="chatSystem.novoPrivado()">+ Nova Conversa</button>
                            </div>
                        </div>
                    </div>

                    <!-- Área de Mensagens -->
                    <div class="chat-main">
                        <div class="chat-info" id="chatInfo">
                            <h4 id="chatTitle">Chat Geral</h4>
                            <div id="chatDescription">Comunicação geral da obra</div>
                            <div id="chatMembers">👥 <span id="membersCount">0</span> membros</div>
                        </div>

                        <div class="chat-messages" id="chatMessages">
                            <div class="welcome-message">
                                <p>👋 Bem-vindo ao chat da obra!</p>
                                <p>Aguardando mensagens...</p>
                            </div>
                        </div>

                        <div class="chat-input-area">
                            <div class="chat-input-container">
                                <input type="text" id="chatInput" placeholder="Digite sua mensagem..." 
                                       onkeypress="chatSystem.handleKeyPress(event)" maxlength="500">
                                <button id="sendBtn" onclick="chatSystem.enviarMensagem()">📤</button>
                            </div>
                            <div class="chat-input-info">
                                <span id="typingIndicator"></span>
                                <span id="characterCount">0/500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.carregarChatsEspecificos();
    }

    carregarChatsEspecificos() {
        this.carregarChatsAreas();
        this.carregarChatsProjetos();
        this.carregarChatsPrivados();
    }

    carregarChatsAreas() {
        const container = document.getElementById('chatsAreas');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(this.areas).forEach(([areaKey, area]) => {
            const naoLidas = this.mensagensNaoLidas.get(`area-${areaKey}`) || 0;
            
            container.innerHTML += `
                <div class="chat-room-item" data-room="area-${areaKey}" onclick="chatSystem.abrirChat('area-${areaKey}')">
                    <div class="room-info">
                        <span class="room-icon" style="color: ${area.cor}">📁</span>
                        <span class="room-name">${area.nome}</span>
                    </div>
                    <span class="unread-count ${naoLidas > 0 ? '' : 'hidden'}" id="unread-area-${areaKey}">${naoLidas}</span>
                </div>
            `;
        });
    }

    carregarChatsProjetos() {
        const container = document.getElementById('chatsProjetos');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(this.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
                
                if (atividade.responsaveis.includes(nomeUsuario)) {
                    const naoLidas = this.mensagensNaoLidas.get(`projeto-${atividade.id}`) || 0;
                    
                    container.innerHTML += `
                        <div class="chat-room-item" data-room="projeto-${atividade.id}" onclick="chatSystem.abrirChat('projeto-${atividade.id}')">
                            <div class="room-info">
                                <span class="room-icon">📋</span>
                                <span class="room-name">${atividade.nome.substring(0, 20)}...</span>
                            </div>
                            <span class="unread-count ${naoLidas > 0 ? '' : 'hidden'}" id="unread-projeto-${atividade.id}">${naoLidas}</span>
                        </div>
                    `;
                }
            });
        });
    }

    // ✅ FUNÇÃO CORRIGIDA - CARREGAMENTO DE CHATS PRIVADOS
    carregarChatsPrivados() {
        const container = document.getElementById('chatsPrivados');
        if (!container) return;
        
        this.chatRef.child('privados').once('value', (snapshot) => {
            const chatsPrivados = snapshot.val() || {};
            container.innerHTML = '';
            
            console.log('📂 Carregando chats privados:', chatsPrivados);
            
            Object.entries(chatsPrivados).forEach(([chatId, chatData]) => {
                if (chatData.participantes && chatData.participantes.includes(this.usuario.email)) {
                    const outroUsuario = chatData.participantes.find(p => p !== this.usuario.email);
                    const nomeOutro = this.getNomeUsuario(outroUsuario);
                    const statusOnline = this.usuariosOnline.has(outroUsuario);
                    const naoLidas = this.mensagensNaoLidas.get(chatId) || 0;
                    
                    console.log(`💬 Chat privado encontrado: ${nomeOutro} (${outroUsuario})`);
                    
                    container.innerHTML += `
                        <div class="chat-room-item" data-room="${chatId}" onclick="chatSystem.abrirChat('${chatId}')">
                            <div class="room-info">
                                <span class="room-icon">👤</span>
                                <span class="room-name">${nomeOutro}</span>
                                <span class="online-status ${statusOnline ? 'online' : 'offline'}">●</span>
                            </div>
                            <span class="unread-count ${naoLidas > 0 ? '' : 'hidden'}" id="unread-${chatId}">${naoLidas}</span>
                        </div>
                    `;
                }
            });
            
            console.log('✅ Chats privados carregados');
        });
    }

    // ✅ SISTEMA DE NOTIFICAÇÕES GLOBAIS
    iniciarNotificacoesGlobais() {
        console.log('🔔 Iniciando sistema de notificações...');
        
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

    monitorarChatParaNotificacoes(chatId) {
        if (this.notificationListeners.has(chatId)) return;
        
        const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
        
        const listener = messagesRef.on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            
            if (mensagem && mensagem.autor !== this.usuario.email) {
                if (this.chatAtivo !== chatId) {
                    this.adicionarNotificacao(chatId);
                    this.mostrarNotificacaoVisual(mensagem, chatId);
                    this.tocarSomNotificacao();
                }
            }
        });
        
        this.notificationListeners.set(chatId, messagesRef);
        console.log(`🔔 Monitorando notificações para: ${chatId}`);
    }

    adicionarNotificacao(chatId) {
        const atual = this.mensagensNaoLidas.get(chatId) || 0;
        this.mensagensNaoLidas.set(chatId, atual + 1);
        
        const unreadEl = document.getElementById(`unread-${chatId.replace('/', '-')}`);
        if (unreadEl) {
            const count = this.mensagensNaoLidas.get(chatId);
            unreadEl.textContent = count;
            unreadEl.classList.remove('hidden');
        }
        
        this.atualizarBadgeTotal();
        console.log(`🔔 Notificação adicionada para ${chatId}: ${atual + 1}`);
    }

    mostrarNotificacaoVisual(mensagem, chatId) {
        const notification = document.createElement('div');
        notification.className = 'chat-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <strong>${this.obterNomeChat(chatId)}</strong>
                <span class="notification-close" onclick="this.parentElement.parentElement.remove()">×</span>
            </div>
            <div class="notification-body">
                <strong>${mensagem.nomeAutor}:</strong> ${mensagem.texto.substring(0, 50)}${mensagem.texto.length > 50 ? '...' : ''}
            </div>
        `;
        
        notification.onclick = () => {
            this.abrirChat(chatId);
            notification.remove();
        };
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    obterNomeChat(chatId) {
        if (chatId === 'global') return '🌐 Chat Geral';
        if (chatId.startsWith('area-')) {
            const areaKey = chatId.replace('area-', '');
            return `📁 ${this.areas[areaKey]?.nome || 'Área'}`;
        }
        if (chatId.startsWith('projeto-')) {
            return '📋 Projeto';
        }
        if (chatId.startsWith('privado-')) {
            return '👤 Conversa Privada';
        }
        return 'Chat';
    }

    // ========== CHAT MANAGEMENT ==========
    abrirChat(chatId) {
        console.log(`🔧 Abrindo chat: ${chatId}`);
        this.chatAtivo = chatId;
        
        this.mensagensNaoLidas.set(chatId, 0);
        
        document.querySelectorAll('.chat-room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const roomElement = document.querySelector(`[data-room="${chatId}"]`);
        if (roomElement) {
            roomElement.classList.add('active');
        }
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '<div class="welcome-message"><p>Carregando mensagens...</p></div>';
        }
        
        this.configurarInfoChat(chatId);
        this.pararListenersAnteriores();
        this.carregarMensagens(chatId);
        this.marcarComoLido(chatId);
    }

    pararListenersAnteriores() {
        this.listeners.forEach((ref, chatId) => {
            try {
                if (ref && typeof ref.off === 'function') {
                    ref.off();
                    console.log(`🔧 Listener removido para: ${chatId}`);
                }
            } catch (error) {
                console.error('Erro ao remover listener:', error);
            }
        });
        this.listeners.clear();
    }

    configurarInfoChat(chatId) {
        const titleEl = document.getElementById('chatTitle');
        const descEl = document.getElementById('chatDescription');
        const membersEl = document.getElementById('membersCount');
        
        if (!titleEl || !descEl || !membersEl) return;
        
        if (chatId === 'global') {
            titleEl.textContent = '🌐 Chat Geral';
            descEl.textContent = 'Comunicação geral da obra';
            membersEl.textContent = this.getTotalMembros();
        } else if (chatId.startsWith('area-')) {
            const areaKey = chatId.replace('area-', '');
            const area = this.areas[areaKey];
            if (area) {
                titleEl.textContent = `📁 ${area.nome}`;
                descEl.textContent = `Chat da área ${area.nome}`;
                membersEl.textContent = area.equipe.length;
            }
        } else if (chatId.startsWith('projeto-')) {
            const projetoId = chatId.replace('projeto-', '');
            const atividade = this.encontrarAtividade(projetoId);
            if (atividade) {
                titleEl.textContent = `📋 ${atividade.nome}`;
                descEl.textContent = 'Chat do projeto/atividade';
                membersEl.textContent = atividade.responsaveis?.length || 0;
            }
        } else if (chatId.startsWith('privado-')) {
            titleEl.textContent = '👤 Conversa Privada';
            descEl.textContent = 'Mensagem direta';
            membersEl.textContent = '2';
        }
    }

    carregarMensagens(chatId) {
        console.log(`🔧 Carregando mensagens para: ${chatId}`);
        
        const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
        
        messagesRef.once('value', (snapshot) => {
            const mensagens = snapshot.val() || {};
            const container = document.getElementById('chatMessages');
            
            if (container) {
                container.innerHTML = '';
            }
            
            this.ultimasMensagens.set(chatId, new Set());
            
            const mensagensArray = Object.values(mensagens).sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            console.log(`📥 ${mensagensArray.length} mensagens existentes carregadas`);
            
            mensagensArray.forEach(mensagem => {
                if (mensagem.id) {
                    this.ultimasMensagens.get(chatId).add(mensagem.id);
                    this.adicionarMensagemUI(mensagem);
                }
            });
        });
        
        const listener = messagesRef.on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            const cache = this.ultimasMensagens.get(chatId) || new Set();
            
            if (mensagem && mensagem.id && !cache.has(mensagem.id)) {
                console.log('📥 NOVA mensagem detectada:', mensagem);
                cache.add(mensagem.id);
                
                if (this.chatAtivo === chatId) {
                    this.adicionarMensagemUI(mensagem);
                }
            }
        });
        
        this.listeners.set(chatId, messagesRef);
        console.log(`✅ Listener ativo para chat: ${chatId}`);
    }

    enviarMensagem() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
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
            chatId: this.chatAtivo
        };
        
        console.log('📤 Enviando mensagem:', mensagem);
        
        this.chatRef.child(`mensagens/${this.chatAtivo}/${mensagemId}`).set(mensagem)
            .then(() => {
                console.log('✅ Mensagem salva com sucesso!');
                input.value = '';
                const countEl = document.getElementById('characterCount');
                if (countEl) countEl.textContent = '0/500';
                setTimeout(() => input.focus(), 100);
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar:', error);
                window.mostrarNotificacao('Erro ao enviar mensagem!', 'error');
            });
    }

    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('chatMessages');
        if (!container || !mensagem) return;
        
        const mensagemExistente = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
        if (mensagemExistente) {
            return;
        }
        
        const isPropia = mensagem.autor === this.usuario.email;
        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message ${isPropia ? 'own' : 'other'}`;
        mensagemEl.setAttribute('data-msg-id', mensagem.id);
        
        const tempo = new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        mensagemEl.innerHTML = `
            <div class="message-header">
                <span class="message-author">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                <span class="message-time">${tempo}</span>
            </div>
            <div class="message-content">${this.formatarMensagem(mensagem.texto)}</div>
        `;
        
        container.appendChild(mensagemEl);
        
        const welcome = container.querySelector('.welcome-message');
        if (welcome) welcome.remove();
        
        container.scrollTop = container.scrollHeight;
        
        console.log(`✅ Mensagem UI adicionada: "${mensagem.texto}"`);
    }

    formatarMensagem(texto) {
        return texto.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }

    tocarSomNotificacao() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Som não disponível');
        }
    }

    limparChat() {
        if (!confirm(`Deseja realmente limpar todas as mensagens do chat atual?\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }
        
        console.log(`🗑️ Limpando chat: ${this.chatAtivo}`);
        
        this.chatRef.child(`mensagens/${this.chatAtivo}`).remove()
            .then(() => {
                console.log('✅ Chat limpo com sucesso!');
                
                const container = document.getElementById('chatMessages');
                if (container) {
                    container.innerHTML = '<div class="welcome-message"><p>Chat limpo!</p><p>Comece uma nova conversa.</p></div>';
                }
                
                this.ultimasMensagens.set(this.chatAtivo, new Set());
                
                window.mostrarNotificacao('Chat limpo com sucesso!');
            })
            .catch((error) => {
                console.error('❌ Erro ao limpar chat:', error);
                window.mostrarNotificacao('Erro ao limpar chat!', 'error');
            });
    }

    // ✅ FUNÇÃO CORRIGIDA - OBTER TODOS OS USUÁRIOS REAIS
    async getTodosUsuarios() {
        console.log('👥 Obtendo usuários reais do sistema...');
        
        return new Promise((resolve) => {
            // Usar base de dados de usuários reais
            const usuarios = Object.entries(USUARIOS_SISTEMA)
                .filter(([email, dados]) => dados.ativo)
                .map(([email, dados]) => ({
                    nome: dados.nome,
                    email: email,
                    cargo: dados.cargo,
                    area: dados.area
                }));
            
            console.log('✅ Usuários reais encontrados:', usuarios);
            resolve(usuarios);
        });
    }

    // ✅ FUNÇÃO CORRIGIDA - NOVO CHAT PRIVADO
    async novoPrivado() {
        console.log('📞 Iniciando novo chat privado...');
        
        const usuarios = await this.getTodosUsuarios();
        const usuariosDisponiveis = usuarios.filter(u => u.email !== this.usuario.email);
        
        if (usuariosDisponiveis.length === 0) {
            window.mostrarNotificacao('Nenhum usuário disponível', 'warning');
            return;
        }
        
        console.log('👥 Usuários disponíveis:', usuariosDisponiveis);
        
        const opcoes = usuariosDisponiveis.map(u => `${u.nome} - ${u.cargo} (${u.email})`).join('\n');
        const escolha = prompt(`Iniciar conversa privada com:\n\n${opcoes}\n\nDigite o nome ou email:`);
        
        if (escolha) {
            const usuarioEscolhido = usuariosDisponiveis.find(u => 
                u.email.toLowerCase().includes(escolha.toLowerCase()) || 
                u.nome.toLowerCase().includes(escolha.toLowerCase())
            );
            
            if (usuarioEscolhido) {
                console.log('✅ Usuário escolhido:', usuarioEscolhido);
                this.iniciarChatPrivado(usuarioEscolhido.email);
            } else {
                window.mostrarNotificacao('Usuário não encontrado', 'error');
            }
        }
    }

    // ✅ FUNÇÃO CORRIGIDA - INICIAR CHAT PRIVADO
    iniciarChatPrivado(emailDestino) {
        console.log('🔧 Criando chat privado entre:', this.usuario.email, 'e', emailDestino);
        
        const participantes = [this.usuario.email, emailDestino].sort();
        const chatId = `privado_${participantes[0].replace(/[@.-]/g, '_')}_${participantes[1].replace(/[@.-]/g, '_')}`;
        
        console.log('🆔 ID do chat privado:', chatId);
        
        const chatData = {
            participantes: participantes,
            criadoEm: new Date().toISOString(),
            ultimaAtividade: new Date().toISOString(),
            criadoPor: this.usuario.email
        };
        
        this.chatRef.child(`privados/${chatId}`).set(chatData)
            .then(() => {
                console.log('✅ Chat privado criado no Firebase');
                
                this.monitorarChatParaNotificacoes(chatId);
                
                this.carregarChatsPrivados();
                setTimeout(() => {
                    this.abrirChat(chatId);
                }, 500);
                
                window.mostrarNotificacao('Conversa privada iniciada!');
            })
            .catch(error => {
                console.error('❌ Erro ao criar chat privado:', error);
                window.mostrarNotificacao('Erro ao criar conversa privada', 'error');
            });
    }

    // ✅ FUNÇÃO CORRIGIDA - OBTER NOME DO USUÁRIO
    getNomeUsuario(email) {
        console.log('👤 Buscando nome para email:', email);
        
        const usuario = USUARIOS_SISTEMA[email];
        if (usuario) {
            console.log('✅ Nome encontrado:', usuario.nome);
            return usuario.nome;
        } else {
            console.log('⚠️ Nome não encontrado, usando fallback');
            return email.split('@')[0];
        }
    }

    // ========== USUÁRIOS ONLINE ==========
    monitorarUsuariosOnline() {
        this.chatRef.child('usuariosOnline').on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            this.usuariosOnline.clear();
            
            let count = 0;
            Object.entries(usuarios).forEach(([emailKey, data]) => {
                const ultimaAtividade = new Date(data.ultimaAtividade);
                const agora = new Date();
                const diffMinutos = (agora - ultimaAtividade) / (1000 * 60);
                
                if (diffMinutos < 5) {
                    this.usuariosOnline.set(data.email || emailKey.replace(/_/g, '@'), data);
                    count++;
                }
            });
            
            const countEl = document.getElementById('usersOnlineCount');
            if (countEl) {
                countEl.textContent = `👥 ${count}`;
            }
        });
    }

    marcarUsuarioOnline() {
        if (!this.usuario) return;
        
        const emailKey = this.usuario.email.replace(/[@.]/g, '_');
        const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
        
        const atualizarStatus = () => {
            this.chatRef.child(`usuariosOnline/${emailKey}`).set({
                email: this.usuario.email,
                nome: nomeUsuario,
                ultimaAtividade: new Date().toISOString(),
                status: 'online'
            });
        };
        
        atualizarStatus();
        setInterval(atualizarStatus, 60000);
        
        window.addEventListener('beforeunload', () => {
            this.chatRef.child(`usuariosOnline/${emailKey}`).remove();
        });
    }

    // ========== UTILITIES ==========
    marcarComoLido(chatId) {
        this.mensagensNaoLidas.set(chatId, 0);
        const unreadEl = document.getElementById(`unread-${chatId.replace('/', '-')}`);
        if (unreadEl) {
            unreadEl.classList.add('hidden');
            unreadEl.textContent = '0';
        }
        this.atualizarBadgeTotal();
    }

    atualizarBadgeTotal() {
        const total = Array.from(this.mensagensNaoLidas.values()).reduce((a, b) => a + b, 0);
        const badge = document.getElementById('chatBadge');
        
        if (badge) {
            if (total > 0) {
                badge.classList.remove('hidden');
                badge.textContent = total > 99 ? '99+' : total;
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    filtrarConversas(termo) {
        const salas = document.querySelectorAll('.chat-room-item');
        salas.forEach(sala => {
            const nome = sala.querySelector('.room-name');
            if (nome) {
                const nomeTexto = nome.textContent.toLowerCase();
                if (nomeTexto.includes(termo.toLowerCase())) {
                    sala.style.display = 'flex';
                } else {
                    sala.style.display = 'none';
                }
            }
        });
    }

    toggleChat() {
        const panel = document.getElementById('chatPanel');
        const toggle = document.getElementById('chatToggle');
        
        if (!panel || !toggle) return;
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            toggle.classList.remove('open');
            this.isOpen = false;
        } else {
            panel.classList.remove('hidden');
            toggle.classList.add('open');
            this.isOpen = true;
            
            const input = document.getElementById('chatInput');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.enviarMensagem();
        }
        
        const input = event.target;
        const count = input.value.length;
        const countEl = document.getElementById('characterCount');
        if (countEl) {
            countEl.textContent = `${count}/500`;
        }
    }

    configurarEventListeners() {
        const toggleBtn = document.getElementById('chatToggle');
        const closeBtn = document.getElementById('chatClose');
        const minimizeBtn = document.getElementById('chatMinimize');
        
        if (toggleBtn) toggleBtn.onclick = () => this.toggleChat();
        if (closeBtn) closeBtn.onclick = () => this.toggleChat();
        if (minimizeBtn) minimizeBtn.onclick = () => this.toggleChat();
    }

    getTotalMembros() {
        if (!this.areas) return 0;
        
        const membrosUnicos = new Set();
        Object.values(this.areas).forEach(area => {
            if (area.equipe) {
                area.equipe.forEach(membro => membrosUnicos.add(membro.nome));
            }
        });
        return membrosUnicos.size;
    }

    encontrarAtividade(id) {
        if (!this.areas) return null;
        
        for (const area of Object.values(this.areas)) {
            if (area.atividades) {
                const atividade = area.atividades.find(a => a.id == id);
                if (atividade) return atividade;
            }
        }
        return null;
    }

    carregarChats() {
        console.log('✅ Chats carregados');
    }
}

// ============================================
// 🔧 SISTEMA DE CADASTRO DE USUÁRIOS
// ============================================

// ✅ FUNÇÃO PARA CADASTRAR TODOS OS USUÁRIOS NO FIREBASE AUTH
async function cadastrarTodosUsuarios() {
    console.log('🔧 Iniciando cadastro de usuários reais...');
    
    const resultados = [];
    
    for (const [email, dadosUsuario] of Object.entries(USUARIOS_SISTEMA)) {
        try {
            console.log(`📝 Cadastrando: ${dadosUsuario.nome} (${email})`);
            
            // Criar usuário no Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, dadosUsuario.senha);
            
            // Atualizar perfil com nome real
            await userCredential.user.updateProfile({
                displayName: dadosUsuario.nome
            });
            
            // Salvar vinculação no sistema
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
        
        // Aguardar um pouco entre cadastros
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('📋 RESULTADO DO CADASTRO:');
    resultados.forEach(resultado => console.log(resultado));
    
    const resumo = resultados.join('\n');
    alert(`CADASTRO DE USUÁRIOS CONCLUÍDO:\n\n${resumo}`);
    
    return resultados;
}

// ✅ FUNÇÃO PARA TESTAR O CHAT PRIVADO
function testarChatPrivado() {
    console.log('🧪 TESTANDO SISTEMA DE CHAT PRIVADO...');
    
    if (chatSystem && chatSystem.getTodosUsuarios) {
        chatSystem.getTodosUsuarios().then(usuarios => {
            console.log('👥 Usuários disponíveis:', usuarios);
            console.log('📧 Emails válidos:', usuarios.map(u => u.email));
        });
    }
    
    if (window.database) {
        window.database.ref('chat/privados').once('value', (snapshot) => {
            console.log('💾 Chats privados no Firebase:', snapshot.val());
        });
    }
    
    console.log('👤 Usuário atual:', window.usuarioAtual?.email);
    console.log('🏷️ Nome do usuário:', window.estadoSistema?.usuarioNome);
}

// ✅ FUNÇÃO PARA LIMPAR E RECRIAR ESTRUTURA DE CHAT PRIVADO
function limparERecriarChatPrivado() {
    if (confirm('Deseja limpar todos os chats privados e recriar a estrutura? Esta ação não pode ser desfeita.')) {
        console.log('🗑️ Limpando estrutura de chat privado...');
        
        window.database.ref('chat/privados').remove()
            .then(() => {
                console.log('✅ Estrutura limpa com sucesso!');
                
                if (chatSystem && chatSystem.carregarChatsPrivados) {
                    chatSystem.carregarChatsPrivados();
                }
                
                window.mostrarNotificacao('Estrutura de chat privado limpa e recriada!');
            })
            .catch(error => {
                console.error('❌ Erro ao limpar:', error);
            });
    }
}

// ========== INICIALIZAÇÃO ==========
let chatSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Inicializando sistema de chat COMPLETO...');
    
    const inicializarChat = () => {
        if (window.usuarioAtual && window.dados && window.database) {
            chatSystem = new ChatSystem();
            window.chatSystem = chatSystem;
            console.log('✅ Chat System COMPLETO inicializado!');
        } else {
            setTimeout(inicializarChat, 1000);
        }
    };
    
    setTimeout(inicializarChat, 3000);
});

// ✅ EXPOSIÇÃO DAS FUNÇÕES GLOBALMENTE
window.cadastrarTodosUsuarios = cadastrarTodosUsuarios;
window.testarChatPrivado = testarChatPrivado;
window.limparERecriarChatPrivado = limparERecriarChatPrivado;
window.USUARIOS_SISTEMA = USUARIOS_SISTEMA;

// ✅ ESTILOS PARA NOTIFICAÇÕES
const style = document.createElement('style');
style.textContent = `
    .sync-indicator.synced {
        display: none !important;
    }
    
    .chat-toggle {
        bottom: 20px !important;
        right: 20px !important;
        z-index: 1001 !important;
    }
    
    .chat-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        z-index: 2000;
        cursor: pointer;
        animation: slideInRight 0.3s ease-out;
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
        color: #3b82f6;
    }
    
    .notification-close {
        cursor: pointer;
        font-weight: bold;
        color: #6b7280;
    }
    
    .notification-body {
        font-size: 13px;
        color: #374151;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .unread-count {
        background: #ef4444 !important;
        color: white !important;
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);

// ✅ INSTRUÇÕES DE USO
console.log(`
🔧 CHAT SYSTEM CORRIGIDO - INSTRUÇÕES:

1️⃣ CADASTRAR USUÁRIOS:
   digite: cadastrarTodosUsuarios()

2️⃣ TESTAR CHAT PRIVADO:
   digite: testarChatPrivado()

3️⃣ LIMPAR E RECRIAR (se necessário):
   digite: limparERecriarChatPrivado()

4️⃣ CREDENCIAIS DOS USUÁRIOS:
   - Bruna: bruabritto@biapo.com.br / Bruna@2025
   - Isabella: isabella@biapo.com.br / Isabella@2025
   - Renato: renatoremiro@biapo.com.br / Renato@2025
   - Juliana: redeinterna.obra3@gmail.com / Juliana@2025
   - Eduardo: eduardo@biapo.com.br / Eduardo@2025
   - Beto: carlosmendonca@biapo.com.br / Beto@2025 (Coordenador Arquiteto)
   - Alex: alex@biapo.com.br / Alex@2025
   - Lara: laracoutinho@biapo.com.br / Lara@2025
   - Manu: emanoelimoreira@biapo.com.br / Manu@2025
   - Jean: estagio292@biapo.com.br / Jean@2025

💡 Execute cadastrarTodosUsuarios() no console (F12) para criar todos os usuários!
`);
