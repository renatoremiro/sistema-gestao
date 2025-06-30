// ============================================
// 💼 SISTEMA DE CHAT EMPRESARIAL - OBRA 292
// Versão Profissional para Gestão Corporativa
// ============================================

// ✅ BASE DE FUNCIONÁRIOS REAIS DA OBRA
const FUNCIONARIOS_OBRA = {
    'bruabritto@biapo.com.br': {
        nome: 'Bruna Britto',
        cargo: 'Arquiteta Trainee',
        area: 'Documentação & Arquivo',
        nivel: 'colaborador',
        ativo: true
    },
    'isabella@biapo.com.br': {
        nome: 'Isabella Rocha',
        cargo: 'Coordenadora Geral',
        area: 'Planejamento & Controle',
        nivel: 'coordenador',
        ativo: true
    },
    'renatoremiro@biapo.com.br': {
        nome: 'Renato Remiro',
        cargo: 'Coordenador de Documentação',
        area: 'Documentação & Arquivo',
        nivel: 'coordenador',
        ativo: true
    },
    'redeinterna.obra3@gmail.com': {
        nome: 'Juliana Andrade',
        cargo: 'Estagiária de Arquitetura',
        area: 'Documentação & Arquivo',
        nivel: 'estagiario',
        ativo: true
    },
    'eduardo@biapo.com.br': {
        nome: 'Eduardo Silva',
        cargo: 'Coordenador de Engenharia',
        area: 'Produção & Qualidade',
        nivel: 'coordenador',
        ativo: true
    },
    'carlosmendonca@biapo.com.br': {
        nome: 'Carlos Mendonça',
        cargo: 'Arquiteto Sênior',
        area: 'Produção & Qualidade',
        nivel: 'senior',
        ativo: true
    },
    'alex@biapo.com.br': {
        nome: 'Alex Santos',
        cargo: 'Comprador',
        area: 'Produção & Qualidade',
        nivel: 'colaborador',
        ativo: true
    },
    'laracoutinho@biapo.com.br': {
        nome: 'Lara Coutinho',
        cargo: 'Arquiteta Trainee',
        area: 'Planejamento & Controle',
        nivel: 'colaborador',
        ativo: true
    },
    'emanoelimoreira@biapo.com.br': {
        nome: 'Emanoel Moreira',
        cargo: 'Assistente de Arquitetura',
        area: 'Produção & Qualidade',
        nivel: 'assistente',
        ativo: true
    },
    'estagio292@biapo.com.br': {
        nome: 'Jean Oliveira',
        cargo: 'Estagiário de Engenharia',
        area: 'Produção & Qualidade',
        nivel: 'estagiario',
        ativo: true
    }
};

// ✅ CONFIGURAÇÕES EMPRESARIAIS
const CONFIG_CHAT = {
    version: '1.0.0',
    ambiente: 'producao',
    debug: false,
    autoReconnect: true,
    messageBuffer: 50,
    typingTimeout: 3000,
    maxMessageLength: 1000,
    autoSave: true,
    themes: {
        corporate: {
            primary: '#1e40af',
            secondary: '#64748b', 
            success: '#059669',
            warning: '#d97706',
            danger: '#dc2626'
        }
    }
};

class ChatEmpresarial {
    constructor() {
        this.version = CONFIG_CHAT.version;
        this.chatRef = null;
        this.usuario = null;
        this.chatAtivo = 'geral';
        this.isOpen = false;
        this.status = 'disponivel';
        this.mensagensNaoLidas = new Map();
        this.usuariosOnline = new Map();
        this.listeners = new Map();
        this.messageBuffer = [];
        this.isInitialized = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Auto-inicialização robusta
        this.iniciarSistema();
    }

    // ✅ SISTEMA DE INICIALIZAÇÃO ROBUSTO
    async iniciarSistema() {
        try {
            console.log('🏢 Iniciando Chat Empresarial da Obra 292...');
            
            // Aguardar dependências críticas
            await this.aguardarDependencias();
            
            // Configurar sistema
            await this.configurarSistema();
            
            // Criar interface limpa
            this.criarInterface();
            
            // Inicializar Firebase
            await this.inicializarFirebase();
            
            // Configurar funcionalidades
            this.configurarEventos();
            this.configurarMonitoramento();
            
            // Marcar como online
            this.definirStatus('disponivel');
            
            this.isInitialized = true;
            console.log('✅ Chat Empresarial inicializado com sucesso');
            
            this.notificarSistema('Chat empresarial ativo', 'success');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.tratarErroInicializacao(error);
        }
    }

    async aguardarDependencias() {
        return new Promise((resolve, reject) => {
            let tentativas = 0;
            const maxTentativas = 30; // 15 segundos
            
            const verificar = () => {
                tentativas++;
                
                if (window.usuarioAtual && window.database && window.dados) {
                    this.usuario = window.usuarioAtual;
                    this.chatRef = window.database.ref('chat_empresarial');
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
        // Configurar usuário atual
        const email = this.usuario.email;
        const funcionario = FUNCIONARIOS_OBRA[email];
        
        if (!funcionario) {
            throw new Error(`Funcionário não encontrado: ${email}`);
        }
        
        this.funcionarioAtual = funcionario;
        console.log(`👤 Usuário identificado: ${funcionario.nome} - ${funcionario.cargo}`);
    }

    // ✅ INTERFACE EMPRESARIAL LIMPA
    criarInterface() {
        // Remover interfaces anteriores
        this.removerInterfaceExistente();

        const chatHTML = `
            <!-- Toggle Empresarial -->
            <div id="chatEmpresarial" class="chat-toggle-empresarial">
                <div class="chat-icon-wrapper">
                    <div class="chat-icon">💬</div>
                    <span id="chatBadgeEmp" class="chat-badge-emp hidden">0</span>
                </div>
            </div>

            <!-- Painel Principal -->
            <div id="panelChatEmp" class="chat-panel-empresarial hidden">
                <!-- Header Corporativo -->
                <div class="chat-header-corp">
                    <div class="header-info">
                        <h3>Chat Empresarial</h3>
                        <span class="obra-info">Obra 292 - Museu Nacional</span>
                    </div>
                    <div class="header-actions">
                        <select id="statusSelector" class="status-selector" onchange="window.chatEmp.alterarStatus(this.value)">
                            <option value="disponivel">🟢 Disponível</option>
                            <option value="ocupado">🟡 Ocupado</option>
                            <option value="reuniao">🔴 Em Reunião</option>
                            <option value="ausente">⚫ Ausente</option>
                        </select>
                        <button class="btn-header" onclick="window.chatEmp.limparChat()" title="Limpar">🗑️</button>
                        <button class="btn-header" onclick="window.chatEmp.fecharChat()" title="Fechar">✕</button>
                    </div>
                </div>

                <!-- Informações do Chat -->
                <div class="chat-info-bar">
                    <div class="chat-details">
                        <span class="chat-title">Chat Geral da Obra</span>
                        <span class="chat-members">👥 <span id="membrosOnline">0</span> online</span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">${this.funcionarioAtual.nome}</span>
                        <span class="user-role">${this.funcionarioAtual.cargo}</span>
                    </div>
                </div>

                <!-- Área de Mensagens -->
                <div class="mensagens-container" id="mensagensContainer">
                    <div class="chat-welcome">
                        <div class="welcome-header">
                            <h4>Sistema de Comunicação Empresarial</h4>
                            <p>Obra 292 - Museu Nacional</p>
                        </div>
                        <div class="guidelines">
                            <div class="guideline">• Mantenha comunicação profissional</div>
                            <div class="guideline">• Use @nome para mencionar colegas</div>
                            <div class="guideline">• Mensagens são registradas automaticamente</div>
                        </div>
                    </div>
                </div>

                <!-- Área de Input -->
                <div class="input-section">
                    <div class="input-wrapper">
                        <textarea 
                            id="inputMensagem" 
                            placeholder="Digite sua mensagem..."
                            onkeydown="window.chatEmp.handleInput(event)"
                            oninput="window.chatEmp.atualizarContador()"
                            maxlength="1000"
                            rows="1"></textarea>
                        <button id="btnEnviar" class="btn-enviar" onclick="window.chatEmp.enviarMensagem()">
                            <span>📤</span>
                        </button>
                    </div>
                    <div class="input-footer">
                        <span id="contadorCaracteres" class="char-counter">0/1000</span>
                        <span class="input-hint">Enter para enviar • Shift+Enter para nova linha</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        console.log('✅ Interface empresarial criada');
    }

    removerInterfaceExistente() {
        const elementos = ['chatEmpresarial', 'panelChatEmp', 'chatToggle', 'chatPanel'];
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    // ✅ FIREBASE EMPRESARIAL
    async inicializarFirebase() {
        try {
            const snapshot = await this.chatRef.once('value');
            
            if (!snapshot.val()) {
                await this.criarEstruturaInicial();
            }
            
            console.log('✅ Firebase empresarial configurado');
        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            throw error;
        }
    }

    async criarEstruturaInicial() {
        const estrutura = {
            configuracao: {
                versao: CONFIG_CHAT.version,
                criado: new Date().toISOString(),
                obra: 'Obra 292 - Museu Nacional'
            },
            mensagens: {
                geral: {
                    msg_inicial: {
                        id: 'msg_inicial',
                        autor: 'sistema',
                        nomeAutor: 'Sistema',
                        texto: '🏢 Chat empresarial da Obra 292 iniciado. Comunicação profissional ativa.',
                        timestamp: new Date().toISOString(),
                        tipo: 'sistema'
                    }
                }
            },
            usuarios_online: {},
            salas: {
                geral: {
                    nome: 'Chat Geral',
                    descricao: 'Comunicação geral da obra',
                    ativo: true
                }
            }
        };

        await this.chatRef.set(estrutura);
        console.log('✅ Estrutura inicial criada');
    }

    // ✅ CONFIGURAÇÃO DE EVENTOS
    configurarEventos() {
        // Toggle chat
        document.getElementById('chatEmpresarial').addEventListener('click', () => {
            this.toggleChat();
        });

        // Carregar mensagens
        this.carregarMensagens();
        
        // Monitorar novas mensagens
        this.monitorarNovasMensagens();
    }

    // ✅ SISTEMA DE MENSAGENS ROBUSTO
    async enviarMensagem() {
        const input = document.getElementById('inputMensagem');
        const texto = input.value.trim();
        
        if (!texto || !this.funcionarioAtual) return;

        const mensagem = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            autor: this.usuario.email,
            nomeAutor: this.funcionarioAtual.nome,
            cargo: this.funcionarioAtual.cargo,
            area: this.funcionarioAtual.area,
            texto: texto,
            timestamp: new Date().toISOString(),
            editado: false,
            tipo: 'normal'
        };

        try {
            await this.chatRef.child(`mensagens/${this.chatAtivo}/${mensagem.id}`).set(mensagem);
            
            input.value = '';
            this.atualizarContador();
            this.ajustarAlturaInput();
            
            console.log(`📤 Mensagem enviada: ${texto.substring(0, 30)}...`);
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            this.notificarSistema('Erro ao enviar mensagem', 'error');
        }
    }

    carregarMensagens() {
        const ref = this.chatRef.child(`mensagens/${this.chatAtivo}`);
        
        ref.once('value', (snapshot) => {
            const mensagens = snapshot.val() || {};
            const container = document.getElementById('mensagensContainer');
            
            // Limpar container
            container.innerHTML = '';
            
            const mensagensArray = Object.values(mensagens)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .slice(-CONFIG_CHAT.messageBuffer); // Limitar mensagens
            
            if (mensagensArray.length === 0) {
                this.mostrarWelcome();
            } else {
                mensagensArray.forEach(msg => this.adicionarMensagemUI(msg));
            }
        });
    }

    monitorarNovasMensagens() {
        const ref = this.chatRef.child(`mensagens/${this.chatAtivo}`);
        
        ref.on('child_added', (snapshot) => {
            const mensagem = snapshot.val();
            if (mensagem && this.isInitialized) {
                // Verificar se não é duplicata
                const container = document.getElementById('mensagensContainer');
                const existe = container.querySelector(`[data-msg-id="${mensagem.id}"]`);
                
                if (!existe) {
                    this.removerWelcome();
                    this.adicionarMensagemUI(mensagem);
                    
                    // Notificar se não for própria mensagem
                    if (mensagem.autor !== this.usuario.email && !this.isOpen) {
                        this.incrementarBadge();
                    }
                }
            }
        });
    }

    // ✅ UI DE MENSAGEM EMPRESARIAL
    adicionarMensagemUI(mensagem) {
        const container = document.getElementById('mensagensContainer');
        if (!container || !mensagem) return;

        const isPropia = mensagem.autor === this.usuario.email;
        const tempo = new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const mensagemEl = document.createElement('div');
        mensagemEl.className = `mensagem-item ${isPropia ? 'propria' : 'externa'} ${mensagem.tipo || 'normal'}`;
        mensagemEl.setAttribute('data-msg-id', mensagem.id);

        if (mensagem.tipo === 'sistema') {
            mensagemEl.innerHTML = `
                <div class="mensagem-sistema">
                    <span class="sistema-texto">${mensagem.texto}</span>
                    <span class="sistema-tempo">${tempo}</span>
                </div>
            `;
        } else {
            const iniciais = mensagem.nomeAutor.split(' ').map(n => n[0]).join('').substring(0, 2);
            const funcionario = FUNCIONARIOS_OBRA[mensagem.autor] || {};
            
            mensagemEl.innerHTML = `
                <div class="mensagem-avatar">
                    <div class="avatar-circle nivel-${funcionario.nivel || 'colaborador'}">
                        ${iniciais}
                    </div>
                </div>
                <div class="mensagem-conteudo">
                    <div class="mensagem-header">
                        <span class="autor-nome">${isPropia ? 'Você' : mensagem.nomeAutor}</span>
                        <span class="autor-cargo">${mensagem.cargo}</span>
                        <span class="mensagem-tempo">${tempo}</span>
                    </div>
                    <div class="mensagem-texto">${this.formatarTexto(mensagem.texto)}</div>
                </div>
            `;
        }

        container.appendChild(mensagemEl);
        this.scrollToBottom();
    }

    formatarTexto(texto) {
        return texto
            .replace(/@(\w+)/g, '<span class="mencao">@$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // ✅ FUNÇÕES DE UI
    toggleChat() {
        const panel = document.getElementById('panelChatEmp');
        
        if (this.isOpen) {
            panel.classList.add('hidden');
            this.isOpen = false;
        } else {
            panel.classList.remove('hidden');
            this.isOpen = true;
            this.zerarBadge();
            
            // Focus no input
            setTimeout(() => {
                const input = document.getElementById('inputMensagem');
                if (input) input.focus();
            }, 100);
        }
    }

    fecharChat() {
        this.isOpen = false;
        document.getElementById('panelChatEmp').classList.add('hidden');
    }

    limparChat() {
        if (confirm('Limpar histórico do chat atual?')) {
            const container = document.getElementById('mensagensContainer');
            container.innerHTML = '';
            this.mostrarWelcome();
            this.notificarSistema('Chat limpo');
        }
    }

    // ✅ SISTEMA DE STATUS
    alterarStatus(novoStatus) {
        this.status = novoStatus;
        this.atualizarStatusOnline();
        
        const statusTexto = {
            'disponivel': 'Disponível',
            'ocupado': 'Ocupado', 
            'reuniao': 'Em Reunião',
            'ausente': 'Ausente'
        };
        
        console.log(`👤 Status alterado: ${statusTexto[novoStatus]}`);
    }

    definirStatus(status) {
        this.status = status;
        const selector = document.getElementById('statusSelector');
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
                area: this.funcionarioAtual.area,
                status: this.status,
                ultimaAtividade: new Date().toISOString(),
                email: this.usuario.email
            });
            
            // Remover ao desconectar
            userRef.onDisconnect().remove();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
        }
    }

    // ✅ FUNÇÕES DE INPUT
    handleInput(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.enviarMensagem();
        }
        this.ajustarAlturaInput();
    }

    atualizarContador() {
        const input = document.getElementById('inputMensagem');
        const contador = document.getElementById('contadorCaracteres');
        
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
        const input = document.getElementById('inputMensagem');
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        }
    }

    // ✅ UTILITÁRIOS
    mostrarWelcome() {
        const container = document.getElementById('mensagensContainer');
        container.innerHTML = `
            <div class="chat-welcome">
                <div class="welcome-header">
                    <h4>Sistema de Comunicação Empresarial</h4>
                    <p>Obra 292 - Museu Nacional</p>
                </div>
                <div class="guidelines">
                    <div class="guideline">• Mantenha comunicação profissional</div>
                    <div class="guideline">• Use @nome para mencionar colegas</div>
                    <div class="guideline">• Mensagens são registradas automaticamente</div>
                </div>
            </div>
        `;
    }

    removerWelcome() {
        const welcome = document.querySelector('.chat-welcome');
        if (welcome) welcome.remove();
    }

    scrollToBottom() {
        const container = document.getElementById('mensagensContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    incrementarBadge() {
        const badge = document.getElementById('chatBadgeEmp');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
            badge.classList.remove('hidden');
        }
    }

    zerarBadge() {
        const badge = document.getElementById('chatBadgeEmp');
        if (badge) {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
    }

    configurarMonitoramento() {
        // Monitorar usuários online
        this.chatRef.child('usuarios_online').on('value', (snapshot) => {
            const usuarios = snapshot.val() || {};
            const count = Object.keys(usuarios).length;
            
            const membrosEl = document.getElementById('membrosOnline');
            if (membrosEl) membrosEl.textContent = count;
            
            this.usuariosOnline.clear();
            Object.values(usuarios).forEach(user => {
                this.usuariosOnline.set(user.email, user);
            });
        });
    }

    notificarSistema(mensagem, tipo = 'info') {
        if (window.mostrarNotificacao) {
            window.mostrarNotificacao(mensagem, tipo);
        }
        console.log(`📢 ${mensagem}`);
    }

    tratarErroInicializacao(error) {
        console.error('❌ Falha crítica no chat:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui;
            max-width: 300px;
        `;
        
        errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Chat Indisponível</div>
            <div style="font-size: 14px; margin-bottom: 12px;">Sistema temporariamente offline</div>
            <button onclick="this.parentElement.remove(); window.location.reload();" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                Recarregar Página
            </button>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 15000);
    }

    // ✅ DESTRUIÇÃO LIMPA
    destruir() {
        this.listeners.forEach(listener => {
            if (listener && listener.off) listener.off();
        });
        
        this.removerInterfaceExistente();
        console.log('🧹 Chat empresarial destruído');
    }
}

// ✅ SISTEMA DE CADASTRO AUTOMÁTICO DE FUNCIONÁRIOS
class CadastroFuncionarios {
    static async cadastrarTodos() {
        console.log('🔧 Iniciando cadastro automático de funcionários...');
        
        const resultados = [];
        const senhaBase = 'Obra292@2025';
        
        for (const [email, funcionario] of Object.entries(FUNCIONARIOS_OBRA)) {
            try {
                // Verificar se já existe
                const metodos = await firebase.auth().fetchSignInMethodsForEmail(email);
                
                if (metodos.length > 0) {
                    resultados.push(`⚠️ ${funcionario.nome}: Já cadastrado`);
                    continue;
                }
                
                // Criar conta
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senhaBase);
                
                // Atualizar perfil
                await userCredential.user.updateProfile({
                    displayName: funcionario.nome
                });
                
                // Salvar vinculação
                await window.database.ref(`vinculacoes/${email.replace(/[@.]/g, '_')}`).set({
                    nomeColaborador: funcionario.nome,
                    cargoColaborador: funcionario.cargo,
                    areaColaborador: funcionario.area,
                    emailUsuario: email,
                    nivel: funcionario.nivel,
                    dataVinculacao: new Date().toISOString(),
                    ativo: true,
                    cadastradoPor: 'sistema_automatico'
                });
                
                resultados.push(`✅ ${funcionario.nome}: Cadastrado com sucesso`);
                
                // Aguardar para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Erro ao cadastrar ${funcionario.nome}:`, error);
                resultados.push(`❌ ${funcionario.nome}: Erro - ${error.code}`);
            }
        }
        
        // Relatório final
        const relatorio = {
            total: Object.keys(FUNCIONARIOS_OBRA).length,
            sucessos: resultados.filter(r => r.includes('✅')).length,
            existentes: resultados.filter(r => r.includes('⚠️')).length,
            erros: resultados.filter(r => r.includes('❌')).length,
            detalhes: resultados
        };
        
        console.log('📊 RELATÓRIO DE CADASTRO:', relatorio);
        
        const mensagemRelatorio = `
CADASTRO DE FUNCIONÁRIOS CONCLUÍDO

📊 Resumo:
• Total: ${relatorio.total}
• Novos cadastros: ${relatorio.sucessos}
• Já existentes: ${relatorio.existentes}
• Erros: ${relatorio.erros}

📝 Detalhes:
${relatorio.detalhes.join('\n')}

🔑 Senha padrão: ${senhaBase}
        `;
        
        alert(mensagemRelatorio);
        return relatorio;
    }
    
    static async verificarStatus() {
        console.log('🔍 Verificando status dos funcionários...');
        
        const status = [];
        
        for (const [email, funcionario] of Object.entries(FUNCIONARIOS_OBRA)) {
            try {
                const metodos = await firebase.auth().fetchSignInMethodsForEmail(email);
                const cadastrado = metodos.length > 0;
                
                // Verificar vinculação
                const vinculacao = await window.database.ref(`vinculacoes/${email.replace(/[@.]/g, '_')}`).once('value');
                const temVinculacao = vinculacao.exists();
                
                status.push({
                    nome: funcionario.nome,
                    email: email,
                    cargo: funcionario.cargo,
                    area: funcionario.area,
                    cadastrado: cadastrado,
                    vinculado: temVinculacao,
                    status: cadastrado && temVinculacao ? '✅ OK' : '⚠️ Pendente'
                });
                
            } catch (error) {
                status.push({
                    nome: funcionario.nome,
                    email: email,
                    erro: error.message,
                    status: '❌ Erro'
                });
            }
        }
        
        console.table(status);
        return status;
    }
}

// ✅ INICIALIZAÇÃO GLOBAL
let chatEmp;

function inicializarChatEmpresarial() {
    if (chatEmp) {
        console.log('🔄 Reinicializando chat empresarial...');
        chatEmp.destruir();
    }
    
    chatEmp = new ChatEmpresarial();
    window.chatEmp = chatEmp;
    
    return chatEmp;
}

// ✅ AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM carregado - Aguardando sistema principal...');
    
    // Aguardar sistema principal
    setTimeout(() => {
        inicializarChatEmpresarial();
    }, 4000); // 4 segundos de delay
});

// ✅ EXPOSIÇÃO GLOBAL
window.inicializarChatEmpresarial = inicializarChatEmpresarial;
window.CadastroFuncionarios = CadastroFuncionarios;
window.FUNCIONARIOS_OBRA = FUNCIONARIOS_OBRA;
window.CONFIG_CHAT = CONFIG_CHAT;

// ✅ FUNÇÕES RÁPIDAS PARA TESTE
window.cadastrarFuncionarios = () => CadastroFuncionarios.cadastrarTodos();
window.verificarFuncionarios = () => CadastroFuncionarios.verificarStatus();
window.reiniciarChat = () => inicializarChatEmpresarial();

console.log('💼 Chat Empresarial carregado - v' + CONFIG_CHAT.version);
