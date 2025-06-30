// ============================================
// 💬 SISTEMA DE CHAT CORRIGIDO - GESTÃO DE OBRAS
// ============================================

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
        
        // ✅ CORREÇÃO: Aguardar inicialização melhorada
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

    init() {
        this.criarInterface();
        this.configurarEventListeners();
        
        // ✅ CORREÇÃO: Inicializar Firebase primeiro
        this.inicializarFirebase().then(() => {
            this.carregarChats();
            this.monitorarUsuariosOnline();
            this.marcarUsuarioOnline();
            
            console.log('✅ Sistema de Chat CORRIGIDO inicializado');
        });
    }

    // ✅ NOVA FUNÇÃO: Inicializar estrutura Firebase corretamente
    async inicializarFirebase() {
        try {
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
                                texto: '🏗️ Bem-vindos ao chat da obra 292! Sistema funcionando corretamente.',
                                timestamp: new Date().toISOString(),
                                chatId: 'global'
                            }
                        }
                    },
                    usuariosOnline: {},
                    privados: {}
                });
                console.log('✅ Estrutura do chat criada no Firebase');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
        }
    }

    // ========== INTERFACE (CORRIGIDA) ==========
    criarInterface() {
        // ✅ REMOVER CAIXINHA SINCRONIZADO CHATA
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
        // Carregar chats por área
        this.carregarChatsAreas();
        
        // Carregar chats de projetos (atividades)
        this.carregarChatsProjetos();
        
        // Carregar chats privados
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

        // Pegar atividades das áreas
        Object.entries(this.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                // ✅ CORREÇÃO: Usar nome do usuário vinculado
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

    carregarChatsPrivados() {
        const container = document.getElementById('chatsPrivados');
        if (!container) return;
        
        // Buscar conversas privadas existentes
        this.chatRef.child('privados').once('value', (snapshot) => {
            const chatsPrivados = snapshot.val() || {};
            container.innerHTML = '';
            
            Object.entries(chatsPrivados).forEach(([chatId, chatData]) => {
                if (chatData.participantes && chatData.participantes.includes(this.usuario.email)) {
                    const outroUsuario = chatData.participantes.find(p => p !== this.usuario.email);
                    const nomeOutro = this.getNomeUsuario(outroUsuario);
                    const statusOnline = this.usuariosOnline.has(outroUsuario);
                    const naoLidas = this.mensagensNaoLidas.get(`privado-${chatId}`) || 0;
                    
                    container.innerHTML += `
                        <div class="chat-room-item" data-room="privado-${chatId}" onclick="chatSystem.abrirChat('privado-${chatId}')">
                            <div class="room-info">
                                <span class="room-icon">👤</span>
                                <span class="room-name">${nomeOutro}</span>
                                <span class="online-status ${statusOnline ? 'online' : 'offline'}">●</span>
                            </div>
                            <span class="unread-count ${naoLidas > 0 ? '' : 'hidden'}" id="unread-privado-${chatId}">${naoLidas}</span>
                        </div>
                    `;
                }
            });
        });
    }

    // ========== GERENCIAMENTO DE CHATS (CORRIGIDO) ==========
    abrirChat(chatId) {
        console.log(`🔧 Abrindo chat: ${chatId}`);
        this.chatAtivo = chatId;
        
        // Atualizar UI
        document.querySelectorAll('.chat-room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const roomElement = document.querySelector(`[data-room="${chatId}"]`);
        if (roomElement) {
            roomElement.classList.add('active');
        }
        
        // Limpar mensagens
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '<div class="welcome-message"><p>Carregando mensagens...</p></div>';
        }
        
        // Configurar informações do chat
        this.configurarInfoChat(chatId);
        
        // ✅ CORREÇÃO: Parar listeners anteriores
        this.pararListenersAnteriores();
        
        // Carregar mensagens
        this.carregarMensagens(chatId);
        
        // Marcar como lido
        this.marcarComoLido(chatId);
    }

    // ✅ NOVA FUNÇÃO: Parar listeners anteriores
    pararListenersAnteriores() {
        this.listeners.forEach((ref, chatId) => {
            if (ref && typeof ref.off === 'function') {
                ref.off();
                console.log(`🔧 Listener removido para: ${chatId}`);
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

    // ✅ FUNÇÃO CORRIGIDA: Carregar mensagens com listener funcional
    carregarMensagens(chatId) {
        console.log(`🔧 Carregando mensagens para: ${chatId}`);
        
        const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
        
        // ✅ CORREÇÃO: Primeiro carregar mensagens existentes
        messagesRef.limitToLast(50).once('value', (snapshot) => {
            const mensagens = snapshot.val() || {};
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            // Ordenar mensagens por timestamp
            const mensagensOrdenadas = Object.values(mensagens).sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            mensagensOrdenadas.forEach(mensagem => {
                this.adicionarMensagemUI(mensagem);
            });
            
            console.log(`✅ ${mensagensOrdenadas.length} mensagens carregadas para ${chatId}`);
        });
        
        // ✅ CORREÇÃO: Escutar novas mensagens
        const listener = messagesRef.limitToLast(1).on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            if (mensagem && mensagem.timestamp) {
                // Verificar se é uma mensagem nova (não carregada inicialmente)
                const agora = Date.now();
                const timestampMensagem = new Date(mensagem.timestamp).getTime();
                
                if (agora - timestampMensagem < 10000) { // Mensagem dos últimos 10 segundos
                    console.log('📥 Nova mensagem recebida:', mensagem);
                    this.adicionarMensagemUI(mensagem);
                }
            }
        });
        
        // Salvar referência do listener
        this.listeners.set(chatId, messagesRef);
    }

    // ✅ FUNÇÃO CORRIGIDA: Enviar mensagem com verificações
    enviarMensagem() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const texto = input.value.trim();
        
        if (!texto || !this.chatAtivo || !this.usuario) {
            console.log('❌ Dados insuficientes para enviar mensagem');
            return;
        }
        
        // ✅ CORREÇÃO: Usar nome do usuário vinculado
        const nomeUsuario = window.estadoSistema?.usuarioNome || this.usuario.displayName || this.usuario.email.split('@')[0];
        
        const mensagem = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            autor: this.usuario.email,
            nomeAutor: nomeUsuario,
            texto: texto,
            timestamp: new Date().toISOString(),
            chatId: this.chatAtivo
        };
        
        console.log('📤 Enviando mensagem:', mensagem);
        
        // ✅ CORREÇÃO: Salvar no Firebase com tratamento de erro
        this.chatRef.child(`mensagens/${this.chatAtivo}`).push(mensagem)
            .then(() => {
                console.log('✅ Mensagem salva no Firebase');
                // Limpar input apenas após confirmação
                input.value = '';
                document.getElementById('characterCount').textContent = '0/500';
                input.focus();
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar mensagem:', error);
                window.mostrarNotificacao('Erro ao enviar mensagem!', 'error');
            });
    }

    // ✅ FUNÇÃO CORRIGIDA: Adicionar mensagem na UI
    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('chatMessages');
        if (!container || !mensagem) return;
        
        const isPropia = mensagem.autor === this.usuario.email;
        
        // ✅ CORREÇÃO: Verificar se mensagem já existe
        const mensagemExistente = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
        if (mensagemExistente) {
            return; // Mensagem já existe
        }
        
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
        
        // Remover mensagem de boas-vindas se existir
        const welcome = container.querySelector('.welcome-message');
        if (welcome) welcome.remove();
        
        // Scroll para baixo
        container.scrollTop = container.scrollHeight;
        
        console.log('✅ Mensagem adicionada na UI:', mensagem.texto);
    }

    formatarMensagem(texto) {
        // Formatar menções @usuario
        return texto.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }

    // ========== USUÁRIOS ONLINE (CORRIGIDO) ==========
    monitorarUsuariosOnline() {
        this.chatRef.child('usuariosOnline').on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            this.usuariosOnline.clear();
            
            let count = 0;
            Object.entries(usuarios).forEach(([emailKey, data]) => {
                const ultimaAtividade = new Date(data.ultimaAtividade);
                const agora = new Date();
                const diffMinutos = (agora - ultimaAtividade) / (1000 * 60);
                
                if (diffMinutos < 5) { // Considerado online se ativo nos últimos 5 min
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
            }).catch(error => {
                console.error('❌ Erro ao atualizar status online:', error);
            });
        };
        
        atualizarStatus();
        setInterval(atualizarStatus, 60000); // Atualizar a cada minuto
        
        // Marcar como offline ao sair
        window.addEventListener('beforeunload', () => {
            this.chatRef.child(`usuariosOnline/${emailKey}`).remove();
        });
    }

    // ========== FUNCIONALIDADES AUXILIARES ==========
    marcarComoLido(chatId) {
        this.mensagensNaoLidas.set(chatId, 0);
        const unreadEl = document.getElementById(`unread-${chatId.replace('-', '-')}`);
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
        
        // Atualizar contador de caracteres
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

    // ========== UTILITÁRIOS ==========
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

    getTodosUsuarios() {
        if (!this.areas) return [];
        
        const usuarios = [];
        Object.values(this.areas).forEach(area => {
            if (area.equipe) {
                area.equipe.forEach(membro => {
                    if (!usuarios.find(u => u.nome === membro.nome)) {
                        usuarios.push({
                            nome: membro.nome,
                            email: `${membro.nome.toLowerCase().replace(' ', '.')}@obra.com`
                        });
                    }
                });
            }
        });
        return usuarios;
    }

    getNomeUsuario(email) {
        const usuarios = this.getTodosUsuarios();
        const usuario = usuarios.find(u => u.email === email);
        return usuario ? usuario.nome : email.split('@')[0];
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
        // Esta função agora é chamada pela inicializarFirebase()
        console.log('✅ Chats carregados');
    }

    // ========== CHAT PRIVADO ==========
    novoPrivado() {
        const usuarios = this.getTodosUsuarios();
        const usuariosDisponiveis = usuarios.filter(u => u.email !== this.usuario.email);
        
        if (usuariosDisponiveis.length === 0) {
            window.mostrarNotificacao('Nenhum usuário disponível para conversa', 'warning');
            return;
        }
        
        const opcoes = usuariosDisponiveis
            .map(u => `${u.nome} (${u.email})`)
            .join('\n');
        
        const escolha = prompt(`Iniciar conversa privada com:\n\n${opcoes}\n\nDigite o email do usuário:`);
        
        if (escolha) {
            const usuarioEscolhido = usuariosDisponiveis.find(u => 
                u.email.toLowerCase() === escolha.toLowerCase() || 
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
        const chatId = participantes.join('_').replace(/[@.]/g, '_');
        
        const chatData = {
            participantes: participantes,
            criadoEm: new Date().toISOString(),
            ultimaAtividade: new Date().toISOString()
        };
        
        this.chatRef.child(`privados/${chatId}`).set(chatData).then(() => {
            this.carregarChatsPrivados();
            this.abrirChat(`privado-${chatId}`);
            window.mostrarNotificacao('Conversa privada iniciada!');
        }).catch(error => {
            console.error('❌ Erro ao criar chat privado:', error);
            window.mostrarNotificacao('Erro ao criar conversa privada', 'error');
        });
    }
}

// ========== INICIALIZAÇÃO CORRIGIDA ==========
let chatSystem;

// ✅ CORREÇÃO: Aguardar que o sistema principal esteja carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Inicializando sistema de chat...');
    
    const inicializarChat = () => {
        if (window.usuarioAtual && window.dados && window.database) {
            chatSystem = new ChatSystem();
            window.chatSystem = chatSystem; // Expor globalmente
            console.log('✅ Chat System inicializado com sucesso!');
        } else {
            setTimeout(inicializarChat, 1000);
        }
    };
    
    setTimeout(inicializarChat, 3000); // Aguardar 3 segundos para garantir que tudo carregou
});

// ✅ CORREÇÃO: Remover caixinha sincronizado no CSS também
const style = document.createElement('style');
style.textContent = `
    .sync-indicator.synced {
        display: none !important;
    }
`;
document.head.appendChild(style);
