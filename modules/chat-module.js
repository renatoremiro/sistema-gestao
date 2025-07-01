// ============================================
// 🎯 CHAT EMPRESARIAL PROFESSIONAL v4.2 LEAN
// Focado em PRODUTIVIDADE e CONFIABILIDADE
// ============================================

class ChatEmpresarialPro {
    constructor() {
        this.version = '4.2.0';
        this.isOpen = false;
        this.chatAtivo = 'geral';
        this.usuario = null;
        this.funcionarioAtual = null;
        this.mensagens = new Map();
        this.usuariosOnline = new Set();
        this.chatRef = null;
        this.listeners = [];
        
        // Limites de performance
        this.MAX_MENSAGENS = 100;
        this.MAX_MESSAGE_LENGTH = 1000;
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        
        console.log('🚀 Iniciando Chat Professional v4.2...');
        this.inicializar();
    }

    // ✨ INICIALIZAÇÃO SIMPLIFICADA
    async inicializar() {
        try {
            await this.configurarUsuario();
            this.criarInterface();
            await this.conectarFirebase();
            this.configurarEventos();
            console.log('✅ Chat v4.2 inicializado');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showToast('Erro ao inicializar chat', 'error');
        }
    }

    // 👤 CONFIGURAR USUÁRIO
    async configurarUsuario() {
        // Detectar usuário atual ou usar fallback
        this.usuario = window.usuarioAtual || {
            email: 'usuario@exemplo.com',
            displayName: 'Usuário',
            uid: 'user_' + Date.now()
        };

        const funcionario = FUNCIONARIOS_OBRA[this.usuario.email];
        if (funcionario) {
            this.funcionarioAtual = funcionario;
        } else {
            // Criar funcionário padrão
            const nome = this.usuario.displayName || 'Usuário';
            const iniciais = nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            this.funcionarioAtual = {
                nome: nome,
                cargo: 'Membro da Equipe',
                iniciais: iniciais,
                cor: '#6366f1'
            };
        }
    }

    // 🎨 CRIAR INTERFACE LIMPA
    criarInterface() {
        this.removerInterfaceExistente();

        const html = `
            <!-- Botão Flutuante Pequeno -->
            <button id="chatTogglePro" class="chat-toggle-pro">
                💬
                <span id="badgePro" class="badge-pro hidden">0</span>
            </button>

            <!-- Painel Principal -->
            <div id="chatPanelPro" class="chat-panel-pro">
                <!-- Header Simples -->
                <header class="chat-header-pro">
                    <div class="header-left">
                        <span class="logo">🏛️ Chat Empresarial</span>
                        <span class="obra-tag">Obra 292</span>
                    </div>
                    <div class="header-right">
                        <span class="user-name">${this.funcionarioAtual.nome}</span>
                        <button class="btn-close" onclick="chatPro.fechar()">✕</button>
                    </div>
                </header>

                <!-- Container -->
                <div class="chat-container">
                    <!-- Sidebar -->
                    <aside class="sidebar">
                        <!-- Busca -->
                        <div class="search-box">
                            <input type="text" placeholder="Buscar..." oninput="chatPro.buscar(this.value)">
                        </div>

                        <!-- Canais -->
                        <nav class="channels">
                            <div class="channel-item active" data-channel="geral" onclick="chatPro.trocarCanal('geral')">
                                <span>🌐</span>
                                <span>Geral</span>
                            </div>
                            <div class="channel-item" data-channel="documentacao" onclick="chatPro.trocarCanal('documentacao')">
                                <span>📁</span>
                                <span>Documentação</span>
                            </div>
                            <div class="channel-item" data-channel="planejamento" onclick="chatPro.trocarCanal('planejamento')">
                                <span>📋</span>
                                <span>Planejamento</span>
                            </div>
                            <div class="channel-item" data-channel="producao" onclick="chatPro.trocarCanal('producao')">
                                <span>🏗️</span>
                                <span>Produção</span>
                            </div>
                        </nav>

                        <!-- Usuários Online -->
                        <div class="users-section">
                            <div class="section-title">Online (<span id="onlineCount">0</span>)</div>
                            <div id="usersList" class="users-list"></div>
                        </div>
                    </aside>

                    <!-- Chat Principal -->
                    <main class="chat-main">
                        <!-- Área de Mensagens -->
                        <div id="messagesArea" class="messages-area">
                            <div class="welcome">
                                <h3>Bem-vindo ao Chat Profissional! 👋</h3>
                                <p>Comece uma conversa no canal <strong>${CANAIS[this.chatAtivo].nome}</strong></p>
                            </div>
                        </div>

                        <!-- Input -->
                        <div class="input-area">
                            <div class="input-box">
                                <input 
                                    type="text" 
                                    id="messageInput"
                                    placeholder="Digite sua mensagem..."
                                    maxlength="${this.MAX_MESSAGE_LENGTH}"
                                    onkeypress="chatPro.handleKeyPress(event)"
                                >
                                <button onclick="chatPro.anexarArquivo()" title="Anexar">📎</button>
                                <button onclick="chatPro.enviarMensagem()" title="Enviar">➤</button>
                            </div>
                            <div class="input-help">
                                Enter para enviar • <span id="charCount">0</span>/${this.MAX_MESSAGE_LENGTH}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <!-- Toast Container -->
            <div id="toastContainer" class="toast-container"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        console.log('✅ Interface criada');
    }

    // 🔥 CONECTAR FIREBASE
    async conectarFirebase() {
        try {
            if (window.firebase && window.firebase.database) {
                this.chatRef = window.firebase.database().ref('chat_pro_v42');
                this.configurarListeners();
                this.marcarOnline();
                console.log('✅ Firebase conectado');
            } else {
                console.warn('⚠️ Modo offline');
                this.carregarMensagensOffline();
            }
        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            this.carregarMensagensOffline();
        }
    }

    // 🎯 CONFIGURAR LISTENERS
    configurarListeners() {
        if (!this.chatRef) return;

        // Mensagens
        const msgRef = this.chatRef.child(`canais/${this.chatAtivo}/mensagens`);
        const msgListener = msgRef.limitToLast(50).on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            if (mensagem && !this.mensagens.has(mensagem.id)) {
                this.adicionarMensagem(mensagem);
            }
        });
        this.listeners.push({ ref: msgRef, listener: msgListener });

        // Usuários online
        const usersRef = this.chatRef.child('usuarios_online');
        const usersListener = usersRef.on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            this.usuariosOnline.clear();
            Object.values(usuarios).forEach(user => {
                this.usuariosOnline.add(user);
            });
            this.atualizarUsuariosOnline();
        });
        this.listeners.push({ ref: usersRef, listener: usersListener });
    }

    // 🎮 CONFIGURAR EVENTOS
    configurarEventos() {
        // Toggle chat
        document.getElementById('chatTogglePro').onclick = () => this.toggle();

        // Atalhos
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.fechar();
            }
        });

        // Contador de caracteres
        const input = document.getElementById('messageInput');
        input.oninput = () => {
            document.getElementById('charCount').textContent = input.value.length;
        };
    }

    // 💬 ENVIAR MENSAGEM
    async enviarMensagem() {
        const input = document.getElementById('messageInput');
        const texto = input.value.trim();
        
        if (!texto) return;

        if (texto.length > this.MAX_MESSAGE_LENGTH) {
            this.showToast('Mensagem muito longa', 'error');
            return;
        }

        try {
            const mensagem = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                autor: this.usuario.email,
                nomeAutor: this.funcionarioAtual.nome,
                cargo: this.funcionarioAtual.cargo,
                iniciais: this.funcionarioAtual.iniciais,
                cor: this.funcionarioAtual.cor,
                texto: texto,
                timestamp: new Date().toISOString(),
                canal: this.chatAtivo
            };

            // Salvar
            if (this.chatRef) {
                await this.chatRef.child(`canais/${this.chatAtivo}/mensagens/${mensagem.id}`).set(mensagem);
            } else {
                this.salvarMensagemOffline(mensagem);
                this.adicionarMensagem(mensagem);
            }

            // Limpar input
            input.value = '';
            document.getElementById('charCount').textContent = '0';

        } catch (error) {
            console.error('Erro ao enviar:', error);
            this.showToast('Erro ao enviar mensagem', 'error');
        }
    }

    // ➕ ADICIONAR MENSAGEM NA UI
    adicionarMensagem(mensagem) {
        // Limitar mensagens em memória
        if (this.mensagens.size >= this.MAX_MENSAGENS) {
            const primeiraMensagem = this.mensagens.keys().next().value;
            this.mensagens.delete(primeiraMensagem);
            
            // Remover da UI
            const elemento = document.querySelector(`[data-msg-id="${primeiraMensagem}"]`);
            if (elemento) elemento.remove();
        }

        this.mensagens.set(mensagem.id, mensagem);

        const container = document.getElementById('messagesArea');
        
        // Remover welcome se existir
        const welcome = container.querySelector('.welcome');
        if (welcome) welcome.remove();

        const isPropia = mensagem.autor === this.usuario.email;
        const tempo = this.formatarTempo(mensagem.timestamp);

        const div = document.createElement('div');
        div.className = `message ${isPropia ? 'own' : 'other'}`;
        div.dataset.msgId = mensagem.id;
        
        div.innerHTML = `
            <div class="message-avatar" style="background-color: ${mensagem.cor}">
                ${mensagem.iniciais}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="author">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                    <span class="time">${tempo}</span>
                </div>
                <div class="message-text">${this.processarTexto(mensagem.texto)}</div>
            </div>
        `;

        container.appendChild(div);
        
        // Scroll para o fim (só se já estava no fim)
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
            container.scrollTop = container.scrollHeight;
        }

        // Notificar se não estiver aberto
        if (!this.isOpen && !isPropia) {
            this.notificar();
        }
    }

    // 📝 PROCESSAR TEXTO SIMPLES
    processarTexto(texto) {
        return texto
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    // 🔄 TROCAR CANAL
    async trocarCanal(canal) {
        if (canal === this.chatAtivo) return;

        this.chatAtivo = canal;
        
        // Atualizar UI
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-channel="${canal}"]`).classList.add('active');

        // Limpar mensagens
        document.getElementById('messagesArea').innerHTML = `
            <div class="welcome">
                <h3>Canal ${CANAIS[canal].nome} 📋</h3>
                <p>${CANAIS[canal].descricao}</p>
            </div>
        `;

        // Limpar cache de mensagens
        this.mensagens.clear();

        // Reconfigurar listeners
        this.limparListeners();
        this.configurarListeners();
        
        // Carregar mensagens
        if (!this.chatRef) {
            this.carregarMensagensOffline();
        }
    }

    // 🔍 BUSCAR MENSAGENS
    buscar(termo) {
        if (!termo) {
            // Mostrar todas as mensagens
            document.querySelectorAll('.message').forEach(msg => {
                msg.style.display = 'flex';
            });
            return;
        }

        const termoLower = termo.toLowerCase();
        document.querySelectorAll('.message').forEach(msg => {
            const texto = msg.querySelector('.message-text').textContent.toLowerCase();
            const autor = msg.querySelector('.author').textContent.toLowerCase();
            
            if (texto.includes(termoLower) || autor.includes(termoLower)) {
                msg.style.display = 'flex';
            } else {
                msg.style.display = 'none';
            }
        });
    }

    // 📎 ANEXAR ARQUIVO
    anexarArquivo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > this.MAX_FILE_SIZE) {
                this.showToast('Arquivo muito grande (máx 10MB)', 'error');
                return;
            }

            // Simular upload
            this.showToast(`Arquivo "${file.name}" anexado!`, 'success');
            
            // Enviar mensagem com arquivo
            document.getElementById('messageInput').value = `📎 ${file.name}`;
            this.enviarMensagem();
        };
        
        input.click();
    }

    // 👥 ATUALIZAR USUÁRIOS ONLINE
    atualizarUsuariosOnline() {
        const container = document.getElementById('usersList');
        const counter = document.getElementById('onlineCount');
        
        container.innerHTML = '';
        counter.textContent = this.usuariosOnline.size;

        this.usuariosOnline.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <div class="user-avatar" style="background-color: ${user.cor}">
                    ${user.iniciais}
                </div>
                <div class="user-info">
                    <div class="user-name">${user.nome}</div>
                    <div class="user-role">${user.cargo}</div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // 🟢 MARCAR COMO ONLINE
    marcarOnline() {
        if (!this.chatRef || !this.usuario) return;

        const userRef = this.chatRef.child(`usuarios_online/${this.usuario.uid}`);
        const userData = {
            email: this.usuario.email,
            nome: this.funcionarioAtual.nome,
            cargo: this.funcionarioAtual.cargo,
            cor: this.funcionarioAtual.cor,
            iniciais: this.funcionarioAtual.iniciais,
            timestamp: Date.now()
        };

        userRef.set(userData);
        userRef.onDisconnect().remove();
    }

    // 💾 OPERAÇÕES OFFLINE
    carregarMensagensOffline() {
        try {
            const key = `chat_mensagens_${this.chatAtivo}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const mensagens = JSON.parse(saved);
                mensagens.forEach(msg => this.adicionarMensagem(msg));
            }
        } catch (error) {
            console.error('Erro ao carregar offline:', error);
        }
    }

    salvarMensagemOffline(mensagem) {
        try {
            const key = `chat_mensagens_${this.chatAtivo}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(mensagem);
            
            // Manter apenas últimas 50 mensagens
            if (existing.length > 50) {
                existing.splice(0, existing.length - 50);
            }
            
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (error) {
            console.error('Erro ao salvar offline:', error);
        }
    }

    // 🔔 NOTIFICAÇÕES SIMPLES
    notificar() {
        const badge = document.getElementById('badgePro');
        const count = parseInt(badge.textContent) + 1;
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    }

    resetarBadge() {
        const badge = document.getElementById('badgePro');
        badge.textContent = '0';
        badge.classList.add('hidden');
    }

    // 🍞 TOAST SIMPLES
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // 🎯 CONTROLES
    toggle() {
        if (this.isOpen) {
            this.fechar();
        } else {
            this.abrir();
        }
    }

    abrir() {
        document.getElementById('chatPanelPro').classList.add('active');
        this.isOpen = true;
        this.resetarBadge();
        
        // Focar no input
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 100);
    }

    fechar() {
        document.getElementById('chatPanelPro').classList.remove('active');
        this.isOpen = false;
    }

    // 🎮 EVENTOS DE INPUT
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.enviarMensagem();
        }
    }

    // 🛠️ UTILITÁRIOS
    formatarTempo(timestamp) {
        const data = new Date(timestamp);
        const agora = new Date();
        const diff = agora - data;
        
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (data.toDateString() === agora.toDateString()) {
            return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    limparListeners() {
        this.listeners.forEach(({ ref, listener }) => {
            ref.off('value', listener);
            ref.off('child_added', listener);
        });
        this.listeners = [];
    }

    removerInterfaceExistente() {
        const elementos = [
            'chatTogglePro', 'chatPanelPro', 'toastContainer',
            'chatTogglePremium', 'chatPanelPremium', 'chatToggleCorrigido'
        ];
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    // 🧹 DESTRUIR
    destruir() {
        try {
            this.limparListeners();
            if (this.chatRef && this.usuario) {
                this.chatRef.child(`usuarios_online/${this.usuario.uid}`).remove();
            }
            this.removerInterfaceExistente();
            console.log('🧹 Chat destruído');
        } catch (error) {
            console.error('Erro ao destruir:', error);
        }
    }
}

// 📊 DADOS DO SISTEMA
const FUNCIONARIOS_OBRA = {
    'bruabritto@biapo.com.br': {
        nome: 'Bruna Britto',
        cargo: 'Arquiteta Trainee',
        iniciais: 'BB',
        cor: '#8b5cf6'
    },
    'isabella@biapo.com.br': {
        nome: 'Isabella Rocha',
        cargo: 'Coordenadora Geral',
        iniciais: 'IR',
        cor: '#06b6d4'
    },
    'renatoremiro@biapo.com.br': {
        nome: 'Renato Remiro',
        cargo: 'Coordenador de Documentação',
        iniciais: 'RR',
        cor: '#8b5cf6'
    },
    'eduardo@biapo.com.br': {
        nome: 'Eduardo Silva',
        cargo: 'Coordenador de Engenharia',
        iniciais: 'ES',
        cor: '#ef4444'
    },
    'carlosmendonca@biapo.com.br': {
        nome: 'Carlos Mendonça',
        cargo: 'Arquiteto Sênior',
        iniciais: 'CM',
        cor: '#ef4444'
    },
    'alex@biapo.com.br': {
        nome: 'Alex Santos',
        cargo: 'Comprador',
        iniciais: 'AS',
        cor: '#ef4444'
    },
    'laracoutinho@biapo.com.br': {
        nome: 'Lara Coutinho',
        cargo: 'Arquiteta Trainee',
        iniciais: 'LC',
        cor: '#06b6d4'
    },
    'emanoelimoreira@biapo.com.br': {
        nome: 'Emanoel Moreira',
        cargo: 'Assistente de Arquitetura',
        iniciais: 'EM',
        cor: '#ef4444'
    },
    'estagio292@biapo.com.br': {
        nome: 'Jean Oliveira',
        cargo: 'Estagiário de Engenharia',
        iniciais: 'JO',
        cor: '#06b6d4'
    }
};

const CANAIS = {
    geral: {
        nome: 'Chat Geral',
        descricao: 'Comunicação geral da obra'
    },
    documentacao: {
        nome: 'Documentação',
        descricao: 'Arquivos e documentação'
    },
    planejamento: {
        nome: 'Planejamento',
        descricao: 'Cronogramas e estratégia'
    },
    producao: {
        nome: 'Produção',
        descricao: 'Execução e qualidade'
    }
};

// 🚀 INICIALIZAÇÃO
let chatPro;

function inicializarChatPro() {
    try {
        if (chatPro) {
            chatPro.destruir();
        }
        chatPro = new ChatEmpresarialPro();
        window.chatPro = chatPro;
        return chatPro;
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        return null;
    }
}

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarChatPro, 500);
});

// Exposição global
window.inicializarChatPro = inicializarChatPro;
window.ChatEmpresarialPro = ChatEmpresarialPro;

console.log('🎯 Chat Professional v4.2 LEAN carregado - "It Just Works"');
