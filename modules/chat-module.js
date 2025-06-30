// ============================================
// 💬 SISTEMA DE CHAT COMPLETO - GESTÃO DE OBRAS
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
        
        // Aguardar inicialização do sistema principal
        this.aguardarInicializacao();
    }

    aguardarInicializacao() {
        const verificar = () => {
            if (window.usuarioAtual && window.dados && window.database) {
                this.usuario = window.usuarioAtual;
                this.areas = window.dados.areas;
                this.chatRef = window.database.ref('chat');
                this.init();
            } else {
                setTimeout(verificar, 500);
            }
        };
        verificar();
    }

    init() {
        this.criarInterface();
        this.configurarEventListeners();
        this.carregarChats();
        this.monitorarUsuariosOnline();
        this.marcarUsuarioOnline();
        
        console.log('✅ Sistema de Chat inicializado');
    }

    // ========== INTERFACE ==========
    criarInterface() {
        const chatHTML = `
            <!-- Botão Flutuante do Chat -->
            <div id="chatToggle" class="chat-toggle">
                <span class="chat-icon">💬</span>
                <span id="chatBadge" class="chat-badge hidden">0</span>
            </div>

            <!-- Painel do Chat -->
            <div id="chatPanel" class="chat-panel">
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
                                <p>Comece a conversar com sua equipe.</p>
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
        container.innerHTML = '';

        // Pegar atividades das áreas
        Object.entries(this.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                // Só mostrar atividades onde o usuário é responsável
                if (atividade.responsaveis.includes(this.usuario.displayName || this.usuario.email.split('@')[0])) {
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

    // ========== GERENCIAMENTO DE CHATS ==========
    abrirChat(chatId) {
        this.chatAtivo = chatId;
        
        // Atualizar UI
        document.querySelectorAll('.chat-room-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-room="${chatId}"]`).classList.add('active');
        
        // Limpar mensagens
        document.getElementById('chatMessages').innerHTML = '';
        
        // Configurar informações do chat
        this.configurarInfoChat(chatId);
        
        // Carregar mensagens
        this.carregarMensagens(chatId);
        
        // Marcar como lido
        this.marcarComoLido(chatId);
    }

    configurarInfoChat(chatId) {
        const titleEl = document.getElementById('chatTitle');
        const descEl = document.getElementById('chatDescription');
        const membersEl = document.getElementById('membersCount');
        
        if (chatId === 'global') {
            titleEl.textContent = '🌐 Chat Geral';
            descEl.textContent = 'Comunicação geral da obra';
            membersEl.textContent = this.getTotalMembros();
        } else if (chatId.startsWith('area-')) {
            const areaKey = chatId.replace('area-', '');
            const area = this.areas[areaKey];
            titleEl.textContent = `📁 ${area.nome}`;
            descEl.textContent = `Chat da área ${area.nome}`;
            membersEl.textContent = area.equipe.length;
        } else if (chatId.startsWith('projeto-')) {
            const projetoId = chatId.replace('projeto-', '');
            const atividade = this.encontrarAtividade(projetoId);
            titleEl.textContent = `📋 ${atividade?.nome || 'Projeto'}`;
            descEl.textContent = 'Chat do projeto/atividade';
            membersEl.textContent = atividade?.responsaveis?.length || 0;
        } else if (chatId.startsWith('privado-')) {
            titleEl.textContent = '👤 Conversa Privada';
            descEl.textContent = 'Mensagem direta';
            membersEl.textContent = '2';
        }
    }

    carregarMensagens(chatId) {
        if (this.listeners.has(chatId)) {
            this.listeners.get(chatId).off();
        }
        
        const messagesRef = this.chatRef.child(`mensagens/${chatId}`);
        const listener = messagesRef.limitToLast(50).on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            this.adicionarMensagemUI(mensagem);
        });
        
        this.listeners.set(chatId, messagesRef);
    }

    enviarMensagem() {
        const input = document.getElementById('chatInput');
        const texto = input.value.trim();
        
        if (!texto || !this.chatAtivo) return;
        
        const mensagem = {
            id: Date.now().toString(),
            autor: this.usuario.email,
            nomeAutor: this.usuario.displayName || this.usuario.email.split('@')[0],
            texto: texto,
            timestamp: new Date().toISOString(),
            chatId: this.chatAtivo
        };
        
        // Salvar no Firebase
        this.chatRef.child(`mensagens/${this.chatAtivo}`).push(mensagem);
        
        // Limpar input
        input.value = '';
        document.getElementById('characterCount').textContent = '0/500';
        
        // Focar novamente no input
        input.focus();
    }

    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('chatMessages');
        const isPropia = mensagem.autor === this.usuario.email;
        
        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message ${isPropia ? 'own' : 'other'}`;
        
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
    }

    formatarMensagem(texto) {
        // Formatar menções @usuario
        return texto.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
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
        });
    }

    // ========== USUÁRIOS ONLINE ==========
    monitorarUsuariosOnline() {
        this.chatRef.child('usuariosOnline').on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            this.usuariosOnline.clear();
            
            let count = 0;
            Object.entries(usuarios).forEach(([email, data]) => {
                const ultimaAtividade = new Date(data.ultimaAtividade);
                const agora = new Date();
                const diffMinutos = (agora - ultimaAtividade) / (1000 * 60);
                
                if (diffMinutos < 5) { // Considerado online se ativo nos últimos 5 min
                    this.usuariosOnline.set(email, data);
                    count++;
                }
            });
            
            document.getElementById('usersOnlineCount').textContent = `👥 ${count}`;
        });
    }

    marcarUsuarioOnline() {
        if (!this.usuario) return;
        
        const atualizarStatus = () => {
            this.chatRef.child(`usuariosOnline/${this.usuario.email.replace(/[@.]/g, '_')}`).set({
                nome: this.usuario.displayName || this.usuario.email.split('@')[0],
                ultimaAtividade: new Date().toISOString(),
                status: 'online'
            });
        };
        
        atualizarStatus();
        setInterval(atualizarStatus, 60000); // Atualizar a cada minuto
        
        // Marcar como offline ao sair
        window.addEventListener('beforeunload', () => {
            this.chatRef.child(`usuariosOnline/${this.usuario.email.replace(/[@.]/g, '_')}`).remove();
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
        
        if (total > 0) {
            badge.classList.remove('hidden');
            badge.textContent = total > 99 ? '99+' : total;
        } else {
            badge.classList.add('hidden');
        }
    }

    filtrarConversas(termo) {
        const salas = document.querySelectorAll('.chat-room-item');
        salas.forEach(sala => {
            const nome = sala.querySelector('.room-name').textContent.toLowerCase();
            if (nome.includes(termo.toLowerCase())) {
                sala.style.display = 'flex';
            } else {
                sala.style.display = 'none';
            }
        });
    }

    toggleChat() {
        const panel = document.getElementById('chatPanel');
        const toggle = document.getElementById('chatToggle');
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            toggle.classList.remove('open');
            this.isOpen = false;
        } else {
            panel.classList.remove('hidden');
            toggle.classList.add('open');
            this.isOpen = true;
            document.getElementById('chatInput').focus();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.enviarMensagem();
        }
        
        // Atualizar contador de caracteres
        const input = event.target;
        const count = input.value.length;
        document.getElementById('characterCount').textContent = `${count}/500`;
    }

    configurarEventListeners() {
        document.getElementById('chatToggle').onclick = () => this.toggleChat();
        document.getElementById('chatClose').onclick = () => this.toggleChat();
        document.getElementById('chatMinimize').onclick = () => this.toggleChat();
    }

    // ========== UTILITÁRIOS ==========
    getTotalMembros() {
        const membrosUnicos = new Set();
        Object.values(this.areas).forEach(area => {
            area.equipe.forEach(membro => membrosUnicos.add(membro.nome));
        });
        return membrosUnicos.size;
    }

    getTodosUsuarios() {
        const usuarios = [];
        Object.values(this.areas).forEach(area => {
            area.equipe.forEach(membro => {
                if (!usuarios.find(u => u.nome === membro.nome)) {
                    usuarios.push({
                        nome: membro.nome,
                        email: `${membro.nome.toLowerCase().replace(' ', '.')}@obra.com` // Email simulado
                    });
                }
            });
        });
        return usuarios;
    }

    getNomeUsuario(email) {
        const usuarios = this.getTodosUsuarios();
        const usuario = usuarios.find(u => u.email === email);
        return usuario ? usuario.nome : email.split('@')[0];
    }

    encontrarAtividade(id) {
        for (const area of Object.values(this.areas)) {
            const atividade = area.atividades.find(a => a.id == id);
            if (atividade) return atividade;
        }
        return null;
    }

    carregarChats() {
        // Inicializar estrutura no Firebase se não existir
        this.chatRef.once('value', (snapshot) => {
            if (!snapshot.val()) {
                this.chatRef.set({
                    mensagens: {},
                    usuariosOnline: {},
                    privados: {}
                });
            }
        });
    }
}

// ========== INICIALIZAÇÃO ==========
let chatSystem;

// Aguardar que o sistema principal esteja carregado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        chatSystem = new ChatSystem();
        window.chatSystem = chatSystem; // Expor globalmente
    }, 2000);
});
