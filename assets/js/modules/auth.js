/* ========== 🔐 AUTH SIMPLES BIAPO v8.1 - INTEGRAÇÃO APP v8.0 ========== */

const Auth = {
    // ✅ VERSÃO SIMPLES INTEGRADA COM APP v8.0
    config: {
        versao: '8.1.0',
        autoLogin: true,
        lembrarUsuario: true,
        integracaoApp: true // NOVA: Integração com App v8.0
    },

    // 👥 EQUIPE BIAPO - LOGIN POR PRIMEIRO NOME
    equipeBiapo: {
        "renato": {
            nomeCompleto: "Renato Remiro",
            email: "renatoremiro@biapo.com.br",
            admin: true,
            ativo: true
        },
        "bruna": {
            nomeCompleto: "Bruna Britto",
            email: "brunabritto@biapo.com.br", 
            admin: false,
            ativo: true
        },
        "lara": {
            nomeCompleto: "Lara Coutinho",
            email: "laracoutinho@biapo.com.br",
            admin: false,
            ativo: true
        },
        "isabella": {
            nomeCompleto: "Isabella",
            email: "isabella@biapo.com.br",
            admin: false,
            ativo: true
        },
        "eduardo": {
            nomeCompleto: "Eduardo Santos",
            email: "eduardosantos@biapo.com.br",
            admin: false,
            ativo: true
        },
        "carlos": {
            nomeCompleto: "Carlos Mendonça (Beto)",
            email: "carlosmendonca@biapo.com.br",
            admin: false,
            ativo: true
        },
        "beto": { // Alternativa para Carlos
            nomeCompleto: "Carlos Mendonça (Beto)",
            email: "carlosmendonca@biapo.com.br",
            admin: false,
            ativo: true
        },
        "alex": {
            nomeCompleto: "Alex",
            email: "alex@biapo.com.br",
            admin: false,
            ativo: true
        },
        "nominato": {
            nomeCompleto: "Nominato Pires",
            email: "nominatopires@biapo.com.br",
            admin: false,
            ativo: true
        },
        "nayara": {
            nomeCompleto: "Nayara Alencar",
            email: "nayaraalencar@biapo.com.br",
            admin: false,
            ativo: true
        },
        "jean": {
            nomeCompleto: "Jean (Estagiário)",
            email: "estagio292@biapo.com.br",
            admin: false,
            ativo: true
        },
        "juliana": {
            nomeCompleto: "Juliana (Rede Interna)",
            email: "redeinterna.obra3@gmail.com",
            admin: false,
            ativo: true
        }
    },

    // ✅ ESTADO ATUAL
    state: {
        usuarioAtual: null,
        logado: false
    },

    // ✅ PROPRIEDADE COMPATÍVEL COM SISTEMA ATUAL
    get usuario() {
        return this.state.usuarioAtual;
    },

    set usuario(valor) {
        this.state.usuarioAtual = valor;
        this.state.logado = !!valor;
    },

    // 🔐 LOGIN SIMPLES COM INTEGRAÇÃO APP v8.0
    login(nomeUsuario) {
        try {
            const nome = nomeUsuario.toLowerCase().trim();
            
            if (!nome) {
                this._mostrarMensagem('Digite seu nome', 'warning');
                return false;
            }

            const dadosUsuario = this.equipeBiapo[nome];
            
            if (!dadosUsuario) {
                this._mostrarMensagem(`"${nomeUsuario}" não encontrado na equipe BIAPO`, 'error');
                return false;
            }

            if (!dadosUsuario.ativo) {
                this._mostrarMensagem('Usuário inativo', 'error');
                return false;
            }

            // Criar objeto de usuário compatível com App v8.0
            this.usuario = {
                email: dadosUsuario.email,
                displayName: dadosUsuario.nomeCompleto,
                uid: `biapo_${nome}`,
                nome: dadosUsuario.nomeCompleto,
                primeiroNome: nome,
                admin: dadosUsuario.admin,
                ativo: dadosUsuario.ativo
            };

            // 🔥 INTEGRAÇÃO COM APP v8.0
            this._integrarComApp();

            // Salvar preferência
            if (this.config.lembrarUsuario) {
                localStorage.setItem('ultimoUsuarioBiapo', nome);
            }

            this._mostrarMensagem(`Bem-vindo, ${dadosUsuario.nomeCompleto}! 👋`, 'success');
            
            // Esconder tela de login
            setTimeout(() => {
                this._esconderTelaLogin();
                this._executarCallbacksLogin();
            }, 1000);

            return true;

        } catch (error) {
            console.error('❌ Erro no login:', error);
            this._mostrarMensagem('Erro no login', 'error');
            return false;
        }
    },

    // 🔥 NOVA: INTEGRAÇÃO COM APP v8.0
    _integrarComApp() {
        if (typeof App !== 'undefined') {
            // Atualizar App global
            App.usuarioAtual = this.usuario;
            App.estadoSistema = App.estadoSistema || {};
            App.estadoSistema.usuarioAutenticado = true;
            App.estadoSistema.usuarioEmail = this.usuario.email;
            App.estadoSistema.usuarioNome = this.usuario.displayName;
            
            console.log(`🔗 Usuário integrado com App v8.0: ${this.usuario.displayName}`);
        }
    },

    // 🚪 LOGOUT SIMPLES COM INTEGRAÇÃO APP v8.0
    logout() {
        try {
            const nomeAnterior = this.usuario?.displayName;
            
            this.usuario = null;
            
            // 🔥 LIMPAR APP v8.0
            if (typeof App !== 'undefined') {
                App.usuarioAtual = null;
                App.estadoSistema = App.estadoSistema || {};
                App.estadoSistema.usuarioAutenticado = false;
                App.estadoSistema.usuarioEmail = null;
                App.estadoSistema.usuarioNome = null;
            }

            this._mostrarMensagem(`Até logo, ${nomeAnterior}! 👋`, 'info');
            
            // Mostrar tela de login
            setTimeout(() => {
                this._mostrarTelaLogin();
            }, 1000);

            return true;

        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return false;
        }
    },

    // 🔄 AUTO-LOGIN COM INTEGRAÇÃO
    autoLogin() {
        try {
            if (!this.config.autoLogin || this.state.logado) {
                return false;
            }

            const ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
            
            if (ultimoUsuario && this.equipeBiapo[ultimoUsuario]) {
                console.log(`🔄 Auto-login: ${ultimoUsuario}`);
                return this.login(ultimoUsuario);
            }

            return false;

        } catch (error) {
            console.error('❌ Erro no auto-login:', error);
            return false;
        }
    },

    // 📋 LISTAR EQUIPE DISPONÍVEL
    listarEquipe() {
        const equipe = Object.entries(this.equipeBiapo)
            .filter(([_, dados]) => dados.ativo)
            .map(([nome, dados]) => ({
                login: nome,
                nome: dados.nomeCompleto,
                email: dados.email,
                admin: dados.admin
            }));

        console.log('👥 Equipe BIAPO disponível:');
        console.table(equipe);
        
        return equipe;
    },

    // ✅ VERIFICAÇÕES
    estaLogado() {
        return this.state.logado && !!this.usuario;
    },

    ehAdmin() {
        return this.usuario?.admin || false;
    },

    // 🔧 CRIAR INTERFACE DE LOGIN SIMPLES
    criarInterfaceLogin() {
        // Remover interface existente
        const loginExistente = document.getElementById('loginSimplesBiapo');
        if (loginExistente) {
            loginExistente.remove();
        }

        const loginDiv = document.createElement('div');
        loginDiv.id = 'loginSimplesBiapo';
        loginDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
        `;

        loginDiv.innerHTML = `
            <div style="
                background: white;
                padding: 48px;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <div style="margin-bottom: 32px;">
                    <h2 style="
                        color: #1f2937;
                        margin: 0 0 8px 0;
                        font-size: 28px;
                        font-weight: 700;
                    ">🏗️ Sistema BIAPO</h2>
                    <p style="
                        color: #6b7280;
                        margin: 0;
                        font-size: 16px;
                    ">Gestão de Eventos - Obra 292</p>
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        color: #374151;
                        font-weight: 600;
                        text-align: left;
                    ">👤 Digite seu primeiro nome:</label>
                    
                    <input 
                        type="text" 
                        id="inputNomeUsuario" 
                        placeholder="Ex: renato, bruna, lara..."
                        style="
                            width: 100%;
                            padding: 16px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 16px;
                            text-align: center;
                            box-sizing: border-box;
                            transition: border-color 0.2s;
                        "
                        onkeydown="if(event.key==='Enter') Auth.tentarLogin()"
                        onfocus="this.style.borderColor='#C53030'"
                        onblur="this.style.borderColor='#e5e7eb'"
                    >
                </div>

                <button 
                    onclick="Auth.tentarLogin()" 
                    style="
                        width: 100%;
                        background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%);
                        color: white;
                        border: none;
                        padding: 16px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    🔐 Entrar
                </button>

                <div style="margin-top: 24px;">
                    <p style="
                        color: #6b7280;
                        font-size: 14px;
                        margin: 0 0 12px 0;
                    ">Equipe disponível:</p>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                        font-size: 12px;
                        color: #374151;
                    ">
                        <span onclick="Auth.preencherNome('renato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">renato</span>
                        <span onclick="Auth.preencherNome('bruna')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">bruna</span>
                        <span onclick="Auth.preencherNome('lara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">lara</span>
                        <span onclick="Auth.preencherNome('isabella')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">isabella</span>
                        <span onclick="Auth.preencherNome('eduardo')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">eduardo</span>
                        <span onclick="Auth.preencherNome('carlos')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">carlos</span>
                        <span onclick="Auth.preencherNome('alex')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">alex</span>
                        <span onclick="Auth.preencherNome('nominato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">nominato</span>
                        <span onclick="Auth.preencherNome('nayara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">nayara</span>
                        <span onclick="Auth.preencherNome('jean')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">jean</span>
                        <span onclick="Auth.preencherNome('juliana')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">juliana</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(loginDiv);
        
        // Focar no input
        setTimeout(() => {
            const input = document.getElementById('inputNomeUsuario');
            if (input) input.focus();
        }, 100);

        return loginDiv;
    },

    // 🔧 MÉTODO AUXILIAR PARA INTERFACE
    tentarLogin() {
        const input = document.getElementById('inputNomeUsuario');
        if (input) {
            const nome = input.value.trim();
            if (nome) {
                this.login(nome);
            } else {
                this._mostrarMensagem('Digite seu nome', 'warning');
            }
        }
    },

    preencherNome(nome) {
        const input = document.getElementById('inputNomeUsuario');
        if (input) {
            input.value = nome;
            input.focus();
        }
    },

    // 🎯 MÉTODOS AUXILIARES COM INTEGRAÇÃO APP v8.0
    _mostrarTelaLogin() {
        // Esconder sistema principal
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.classList.add('hidden');
            mainContainer.style.display = 'none';
            console.log("✅ Sistema principal escondido");
        }
        
        // Mostrar interface de login
        this.criarInterfaceLogin();
        console.log("✅ Tela de login exibida");
    },

    _esconderTelaLogin() {
        // Remover interface de login
        const loginDiv = document.getElementById('loginSimplesBiapo');
        if (loginDiv) {
            loginDiv.remove();
        }
        
        // Mostrar sistema principal - CORREÇÃO DEFINITIVA COM APP v8.0
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
            mainContainer.style.display = 'block';
            console.log("✅ Sistema principal exibido");
        }
        
        // 🔥 INICIALIZAR APP SE NECESSÁRIO
        setTimeout(() => {
            if (typeof App !== 'undefined') {
                try {
                    // Verificar se App precisa ser inicializado
                    if (!App.estadoSistema.inicializado) {
                        console.log("🚀 Inicializando App após login...");
                        App.inicializar();
                    }
                    
                    // Atualizar interface com usuário
                    if (document.getElementById('usuarioLogado')) {
                        document.getElementById('usuarioLogado').textContent = `👤 ${this.usuario.displayName}`;
                    }
                    
                    console.log("✅ Sistema totalmente inicializado após login");
                } catch (error) {
                    console.warn("⚠️ Erro na inicialização pós-login:", error);
                }
            }
        }, 200);
    },

    _executarCallbacksLogin() {
        // Executar callbacks adicionais se necessário
        setTimeout(() => {
            // Atualizar calendário se existir
            if (typeof Calendar !== 'undefined' && Calendar.atualizarEventos) {
                Calendar.atualizarEventos();
            }
            
            // Disparar evento customizado de login
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('biapo-login', {
                    detail: { usuario: this.usuario }
                }));
            }
        }, 500);
    },

    _mostrarMensagem(mensagem, tipo = 'info') {
        // Usar Notifications se disponível
        if (typeof Notifications !== 'undefined') {
            switch (tipo) {
                case 'success': 
                    if (Notifications.success) Notifications.success(mensagem);
                    break;
                case 'error': 
                    if (Notifications.error) Notifications.error(mensagem);
                    break;
                case 'warning': 
                    if (Notifications.warning) Notifications.warning(mensagem);
                    break;
                default: 
                    if (Notifications.info) Notifications.info(mensagem);
            }
        } else {
            // Fallback para console
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
            
            // Fallback para alert se for erro
            if (tipo === 'error') {
                alert(`❌ ${mensagem}`);
            }
        }
    },

    // 📊 STATUS E DEBUG
    obterStatus() {
        return {
            versao: this.config.versao,
            logado: this.state.logado,
            usuario: this.usuario?.displayName || null,
            email: this.usuario?.email || null,
            primeiroNome: this.usuario?.primeiroNome || null,
            admin: this.ehAdmin(),
            totalEquipe: Object.keys(this.equipeBiapo).length,
            equipeBiapoCarregada: true,
            integracaoApp: this.config.integracaoApp,
            appDisponivel: typeof App !== 'undefined'
        };
    },

    debug() {
        const info = this.obterStatus();
        console.log('🔐 Auth Simples BIAPO - Status:', info);
        console.log('👥 Equipe:', this.listarEquipe());
        
        // Debug adicional da interface
        console.log('🖥️ Interface:', {
            loginDiv: !!document.getElementById('loginSimplesBiapo'),
            mainContainer: !!document.getElementById('mainContainer'),
            mainContainerVisible: document.getElementById('mainContainer')?.style.display !== 'none'
        });
        
        return info;
    },

    // 🔧 FUNÇÃO DE CORREÇÃO MANUAL
    corrigirInterface() {
        console.log('🔧 Corrigindo interface manualmente...');
        
        if (this.state.logado) {
            this._esconderTelaLogin();
        } else {
            this._mostrarTelaLogin();
        }
        
        console.log('✅ Interface corrigida');
    },

    // 🆘 FUNÇÃO DE EMERGÊNCIA PARA JANELA ANÔNIMA
    emergencia() {
        console.log('🆘 Modo emergência ativado!');
        
        // Limpar qualquer estado confuso
        this.state.logado = false;
        this.state.usuarioAtual = null;
        
        // Forçar exibição do login
        this._mostrarTelaLogin();
        
        // Esconder sistema principal
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.style.display = 'none';
            mainContainer.classList.add('hidden');
        }
        
        console.log('✅ Modo emergência aplicado - tela de login deve aparecer');
    },

    // 🚀 INICIALIZAÇÃO ROBUSTA PARA JANELA ANÔNIMA
    init() {
        console.log('🔐 Inicializando Auth Simples BIAPO v8.1...');
        
        // 🔥 ESCONDER SISTEMA DE LOGIN ANTIGO
        this._esconderLoginAntigo();
        
        // 🔥 VERIFICAR SE É INICIALIZAÇÃO FRIA (janela anônima)
        const inicializacaoFria = !localStorage.getItem('ultimoUsuarioBiapo');
        
        if (inicializacaoFria) {
            console.log('❄️ Inicialização fria detectada - forçando login');
            // Para janela anônima, sempre mostrar login
            setTimeout(() => {
                this._mostrarTelaLogin();
            }, 100);
        } else {
            // Tentar auto-login para usuários conhecidos
            const autoLoginSucesso = this.autoLogin();
            
            if (!autoLoginSucesso) {
                // Se não conseguiu auto-login, mostrar tela de login
                setTimeout(() => {
                    this._mostrarTelaLogin();
                }, 100);
            } else {
                console.log('✅ Auto-login realizado com sucesso');
            }
        }
        
        console.log('✅ Auth Simples BIAPO v8.1 inicializado');
    },

    // 🔥 ESCONDER SISTEMA DE LOGIN ANTIGO
    _esconderLoginAntigo() {
        // Esconder possíveis telas de login antigas
        const loginScreens = [
            '#loginScreen',
            '.login-screen', 
            '.auth-screen',
            '#authContainer',
            '.modal-login'
        ];
        
        loginScreens.forEach(selector => {
            const elemento = document.querySelector(selector);
            if (elemento) {
                elemento.style.display = 'none';
                console.log(`🚫 Escondido login antigo: ${selector}`);
            }
        });
        
        // Forçar esconder qualquer modal de auth ativo
        const modals = document.querySelectorAll('.modal, [id*="login"], [id*="auth"]');
        modals.forEach(modal => {
            if (modal.id !== 'loginSimplesBiapo') {
                modal.style.display = 'none';
            }
        });
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Auth = Auth;

// 🚀 AUTO-INICIALIZAÇÃO ROBUSTA PARA JANELA ANÔNIMA
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado - iniciando Auth...');
    
    // Múltiplas tentativas de inicialização para garantir
    const tentarInicializar = () => {
        try {
            if (typeof Auth !== 'undefined') {
                Auth.init();
                return true;
            }
            return false;
        } catch (error) {
            console.warn('⚠️ Erro na inicialização Auth:', error);
            return false;
        }
    };
    
    // Primeira tentativa imediata
    if (!tentarInicializar()) {
        // Segunda tentativa após 300ms
        setTimeout(() => {
            if (!tentarInicializar()) {
                // Terceira tentativa após 600ms  
                setTimeout(() => {
                    if (!tentarInicializar()) {
                        // Quarta tentativa forçada após 1000ms
                        setTimeout(() => {
                            console.warn('⚠️ Auth não inicializou - forçando manualmente');
                            if (typeof Auth !== 'undefined') {
                                Auth._mostrarTelaLogin();
                            } else {
                                console.error('❌ Auth.js não carregou corretamente');
                            }
                        }, 1000);
                    }
                }, 600);
            }
        }, 300);
    }
});

// 🔧 FALLBACK PARA WINDOW LOAD (garante que tudo carregou)
window.addEventListener('load', () => {
    setTimeout(() => {
        // Verificar se login está visível
        const loginDiv = document.getElementById('loginSimplesBiapo');
        const mainContainer = document.getElementById('mainContainer');
        
        if (!loginDiv && (!Auth?.state?.logado)) {
            console.log('🔧 Fallback: forçando login na window.load');
            if (typeof Auth !== 'undefined') {
                Auth._mostrarTelaLogin();
            }
        }
        
        // Garantir que main container está configurado corretamente
        if (mainContainer && !Auth?.state?.logado) {
            mainContainer.style.display = 'none';
            mainContainer.classList.add('hidden');
        }
    }, 500);
});

// 📊 COMANDOS ÚTEIS NO CONSOLE
window.loginBiapo = (nome) => Auth.login(nome);
window.logoutBiapo = () => Auth.logout();
window.statusAuth = () => Auth.debug();
window.equipeBiapo = () => Auth.listarEquipe();
window.corrigirInterface = () => Auth.corrigirInterface();
window.emergenciaAuth = () => Auth.emergencia(); // NOVO: Para janela anônima

console.log('🔐 Auth Simples BIAPO v8.1 - INTEGRAÇÃO APP v8.0 + CORREÇÃO JANELA ANÔNIMA carregado!');

/*
✅ SISTEMA AUTH SIMPLES v8.1 - INTEGRAÇÃO COMPLETA COM APP v8.0:

🎯 FUNCIONALIDADES:
- ✅ Login apenas com primeiro nome (sem senha)
- ✅ Equipe BIAPO completa (11 pessoas) 
- ✅ Interface visual simples e bonita
- ✅ Auto-login (lembra último usuário)
- ✅ INTEGRAÇÃO TOTAL com App v8.0
- ✅ Admin para Renato Remiro
- ✅ Compatibilidade com sistema atual

🔗 INTEGRAÇÃO APP v8.0:
- ✅ App.usuarioAtual sincronizado
- ✅ App.estadoSistema atualizado
- ✅ Inicialização automática do App após login
- ✅ Interface de usuário atualizada
- ✅ Callbacks e eventos customizados

👥 EQUIPE DISPONÍVEL:
renato, bruna, lara, isabella, eduardo, carlos/beto, 
alex, nominato, nayara, jean, juliana

🔧 COMANDOS ÚTEIS:
loginBiapo('renato')  - Fazer login
logoutBiapo()         - Fazer logout  
statusAuth()          - Ver status
equipeBiapo()         - Listar equipe
corrigirInterface()   - Corrigir interface manualmente
emergenciaAuth()      - EMERGÊNCIA: forçar login (janela anônima)

🚀 RESULTADO:
- Sistema pronto para usar ✅
- Login super simples ✅
- Integração total com App v8.0 ✅
- Funciona em janela anônima ✅
- Múltiplas tentativas de inicialização ✅
- Função de emergência incluída ✅
- Zero complexidade ✅
- Totalmente funcional ✅
*/

    // 👥 EQUIPE BIAPO - LOGIN POR PRIMEIRO NOME
    equipeBiapo: {
        "renato": {
            nomeCompleto: "Renato Remiro",
            admin: true,
            ativo: true
        },
        "bruna": {
            nomeCompleto: "Bruna Britto",
            admin: false,
            ativo: true
        },
        "lara": {
            nomeCompleto: "Lara Coutinho",
            admin: false,
            ativo: true
        },
        "isabella": {
            nomeCompleto: "Isabella",
            admin: false,
            ativo: true
        },
        "eduardo": {
            nomeCompleto: "Eduardo Santos",
            admin: false,
            ativo: true
        },
        "carlos": {
            nomeCompleto: "Carlos Mendonça (Beto)",
            admin: false,
            ativo: true
        },
        "beto": { // Alternativa para Carlos
            nomeCompleto: "Carlos Mendonça (Beto)",
            admin: false,
            ativo: true
        },
        "alex": {
            nomeCompleto: "Alex",
            admin: false,
            ativo: true
        },
        "nominato": {
            nomeCompleto: "Nominato Pires",
            admin: false,
            ativo: true
        },
        "nayara": {
            nomeCompleto: "Nayara Alencar",
            admin: false,
            ativo: true
        },
        "jean": {
            nomeCompleto: "Jean (Estagiário)",
            admin: false,
            ativo: true
        },
        "juliana": {
            nomeCompleto: "Juliana (Rede Interna)",
            admin: false,
            ativo: true
        }
    },

    // ✅ ESTADO ATUAL
    state: {
        usuarioAtual: null,
        logado: false
    },

    // ✅ PROPRIEDADE COMPATÍVEL COM SISTEMA ATUAL
    get usuario() {
        return this.state.usuarioAtual;
    },

    set usuario(valor) {
        this.state.usuarioAtual = valor;
        this.state.logado = !!valor;
    },

    // 🔐 LOGIN SIMPLES
    login(nomeUsuario) {
        try {
            const nome = nomeUsuario.toLowerCase().trim();
            
            if (!nome) {
                this._mostrarMensagem('Digite seu nome', 'warning');
                return false;
            }

            const dadosUsuario = this.equipeBiapo[nome];
            
            if (!dadosUsuario) {
                this._mostrarMensagem(`"${nomeUsuario}" não encontrado na equipe BIAPO`, 'error');
                return false;
            }

            if (!dadosUsuario.ativo) {
                this._mostrarMensagem('Usuário inativo', 'error');
                return false;
            }

            // Criar objeto de usuário compatível
            this.usuario = {
                email: `${nome}@biapo.com.br`,
                displayName: dadosUsuario.nomeCompleto,
                uid: `biapo_${nome}`,
                nome: dadosUsuario.nomeCompleto,
                primeiroNome: nome,
                admin: dadosUsuario.admin,
                ativo: dadosUsuario.ativo
            };

            // Salvar preferência
            if (this.config.lembrarUsuario) {
                localStorage.setItem('ultimoUsuarioBiapo', nome);
            }

            // Atualizar App global
            if (typeof App !== 'undefined') {
                App.usuarioAtual = this.usuario;
                App.estadoSistema = App.estadoSistema || {};
                App.estadoSistema.usuarioEmail = this.usuario.email;
                App.estadoSistema.usuarioNome = this.usuario.displayName;
            }

            this._mostrarMensagem(`Bem-vindo, ${dadosUsuario.nomeCompleto}! 👋`, 'success');
            
            // Esconder tela de login se existir
            setTimeout(() => {
                this._esconderTelaLogin();
                this._executarCallbacksLogin();
            }, 1000);

            return true;

        } catch (error) {
            console.error('❌ Erro no login:', error);
            this._mostrarMensagem('Erro no login', 'error');
            return false;
        }
    },

    // 🚪 LOGOUT SIMPLES
    logout() {
        try {
            const nomeAnterior = this.usuario?.displayName;
            
            this.usuario = null;
            
            // Limpar App global
            if (typeof App !== 'undefined') {
                App.usuarioAtual = null;
                App.estadoSistema = App.estadoSistema || {};
                App.estadoSistema.usuarioEmail = null;
                App.estadoSistema.usuarioNome = null;
            }

            this._mostrarMensagem(`Até logo, ${nomeAnterior}! 👋`, 'info');
            
            // Mostrar tela de login se existir
            setTimeout(() => {
                this._mostrarTelaLogin();
            }, 1000);

            return true;

        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return false;
        }
    },

    // 🔄 AUTO-LOGIN (se lembrar usuário)
    autoLogin() {
        try {
            if (!this.config.autoLogin || this.state.logado) {
                return false;
            }

            const ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
            
            if (ultimoUsuario && this.equipeBiapo[ultimoUsuario]) {
                console.log(`🔄 Auto-login: ${ultimoUsuario}`);
                return this.login(ultimoUsuario);
            }

            return false;

        } catch (error) {
            console.error('❌ Erro no auto-login:', error);
            return false;
        }
    },

    // 📋 LISTAR EQUIPE DISPONÍVEL
    listarEquipe() {
        const equipe = Object.entries(this.equipeBiapo)
            .filter(([_, dados]) => dados.ativo)
            .map(([nome, dados]) => ({
                login: nome,
                nome: dados.nomeCompleto,
                admin: dados.admin
            }));

        console.log('👥 Equipe BIAPO disponível:');
        console.table(equipe);
        
        return equipe;
    },

    // ✅ VERIFICAÇÕES
    estaLogado() {
        return this.state.logado && !!this.usuario;
    },

    ehAdmin() {
        return this.usuario?.admin || false;
    },

    // 🔧 CRIAR INTERFACE DE LOGIN SIMPLES
    criarInterfaceLogin() {
        // Remover interface existente
        const loginExistente = document.getElementById('loginSimplesBiapo');
        if (loginExistente) {
            loginExistente.remove();
        }

        const loginDiv = document.createElement('div');
        loginDiv.id = 'loginSimplesBiapo';
        loginDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
        `;

        loginDiv.innerHTML = `
            <div style="
                background: white;
                padding: 48px;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <div style="margin-bottom: 32px;">
                    <h2 style="
                        color: #1f2937;
                        margin: 0 0 8px 0;
                        font-size: 28px;
                        font-weight: 700;
                    ">🏗️ Sistema BIAPO</h2>
                    <p style="
                        color: #6b7280;
                        margin: 0;
                        font-size: 16px;
                    ">Gestão de Eventos - Obra 292</p>
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        color: #374151;
                        font-weight: 600;
                        text-align: left;
                    ">👤 Digite seu primeiro nome:</label>
                    
                    <input 
                        type="text" 
                        id="inputNomeUsuario" 
                        placeholder="Ex: renato, bruna, lara..."
                        style="
                            width: 100%;
                            padding: 16px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 16px;
                            text-align: center;
                            box-sizing: border-box;
                            transition: border-color 0.2s;
                        "
                        onkeydown="if(event.key==='Enter') Auth.tentarLogin()"
                        onfocus="this.style.borderColor='#C53030'"
                        onblur="this.style.borderColor='#e5e7eb'"
                    >
                </div>

                <button 
                    onclick="Auth.tentarLogin()" 
                    style="
                        width: 100%;
                        background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%);
                        color: white;
                        border: none;
                        padding: 16px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    🔐 Entrar
                </button>

                <div style="margin-top: 24px;">
                    <p style="
                        color: #6b7280;
                        font-size: 14px;
                        margin: 0 0 12px 0;
                    ">Equipe disponível:</p>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                        font-size: 12px;
                        color: #374151;
                    ">
                        <span onclick="Auth.preencherNome('renato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">renato</span>
                        <span onclick="Auth.preencherNome('bruna')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">bruna</span>
                        <span onclick="Auth.preencherNome('lara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">lara</span>
                        <span onclick="Auth.preencherNome('isabella')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">isabella</span>
                        <span onclick="Auth.preencherNome('eduardo')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">eduardo</span>
                        <span onclick="Auth.preencherNome('carlos')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">carlos</span>
                        <span onclick="Auth.preencherNome('alex')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">alex</span>
                        <span onclick="Auth.preencherNome('nominato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">nominato</span>
                        <span onclick="Auth.preencherNome('nayara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">nayara</span>
                        <span onclick="Auth.preencherNome('jean')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">jean</span>
                        <span onclick="Auth.preencherNome('juliana')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">juliana</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(loginDiv);
        
        // Focar no input
        setTimeout(() => {
            const input = document.getElementById('inputNomeUsuario');
            if (input) input.focus();
        }, 100);

        return loginDiv;
    },

    // 🔧 MÉTODO AUXILIAR PARA INTERFACE
    tentarLogin() {
        const input = document.getElementById('inputNomeUsuario');
        if (input) {
            const nome = input.value.trim();
            if (nome) {
                this.login(nome);
            } else {
                this._mostrarMensagem('Digite seu nome', 'warning');
            }
        }
    },

    preencherNome(nome) {
        const input = document.getElementById('inputNomeUsuario');
        if (input) {
            input.value = nome;
            input.focus();
        }
    },

    // 🎯 MÉTODOS AUXILIARES
    _mostrarTelaLogin() {
        // Esconder sistema principal - CORREÇÃO DEFINITIVA
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.classList.add('hidden');
            mainContainer.style.display = 'none';
            console.log("✅ Sistema principal escondido");
        }
        
        // Mostrar interface de login
        this.criarInterfaceLogin();
        console.log("✅ Tela de login exibida");
    },

    _esconderTelaLogin() {
        // Remover interface de login
        const loginDiv = document.getElementById('loginSimplesBiapo');
        if (loginDiv) {
            loginDiv.remove();
        }
        
        // Mostrar sistema principal - CORREÇÃO DEFINITIVA
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
            mainContainer.style.display = 'block';
            console.log("✅ Sistema principal exibido");
        }
        
        // Inicializar App se necessário
        setTimeout(() => {
            if (typeof App !== 'undefined' && App.inicializar) {
                try {
                    App.inicializar();
                    console.log("✅ App inicializado");
                } catch (error) {
                    console.warn("⚠️ Erro ao inicializar App:", error);
                }
            }
        }, 100);
    },

    _executarCallbacksLogin() {
        // Inicializar sistema se necessário - CORREÇÃO AMPLIADA
        setTimeout(() => {
            if (typeof App !== 'undefined') {
                try {
                    if (App.inicializar) {
                        App.inicializar();
                    } else if (App.inicializarSistema) {
                        App.inicializarSistema();
                    }
                    
                    // Atualizar header com usuário
                    if (document.getElementById('usuarioLogado')) {
                        document.getElementById('usuarioLogado').textContent = `👤 ${this.usuario.displayName}`;
                    }
                    
                    console.log("✅ Sistema totalmente inicializado após login");
                } catch (error) {
                    console.warn("⚠️ Erro na inicialização pós-login:", error);
                }
            }
        }, 200);
    },

    _mostrarMensagem(mensagem, tipo = 'info') {
        // Usar Notifications se disponível
        if (typeof Notifications !== 'undefined') {
            switch (tipo) {
                case 'success': 
                    if (Notifications.success) Notifications.success(mensagem);
                    break;
                case 'error': 
                    if (Notifications.error) Notifications.error(mensagem);
                    break;
                case 'warning': 
                    if (Notifications.warning) Notifications.warning(mensagem);
                    break;
                default: 
                    if (Notifications.info) Notifications.info(mensagem);
            }
        } else {
            // Fallback para console
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
            
            // Fallback para alert se for erro
            if (tipo === 'error') {
                alert(`❌ ${mensagem}`);
            }
        }
    },

    // 📊 STATUS E DEBUG
    obterStatus() {
        return {
            versao: this.config.versao,
            logado: this.state.logado,
            usuario: this.usuario?.displayName || null,
            primeiroNome: this.usuario?.primeiroNome || null,
            admin: this.ehAdmin(),
            totalEquipe: Object.keys(this.equipeBiapo).length,
            equipeBiapoCarregada: true
        };
    },

    debug() {
        const info = this.obterStatus();
        console.log('🔐 Auth Simples BIAPO - Status:', info);
        console.log('👥 Equipe:', this.listarEquipe());
        
        // Debug adicional da interface
        console.log('🖥️ Interface:', {
            loginDiv: !!document.getElementById('loginSimplesBiapo'),
            mainContainer: !!document.getElementById('mainContainer'),
            mainContainerVisible: document.getElementById('mainContainer')?.style.display !== 'none'
        });
        
        return info;
    },

    // 🔧 FUNÇÃO DE CORREÇÃO MANUAL
    corrigirInterface() {
        console.log('🔧 Corrigindo interface manualmente...');
        
        if (this.state.logado) {
            this._esconderTelaLogin();
        } else {
            this._mostrarTelaLogin();
        }
        
        console.log('✅ Interface corrigida');
    },

    // 🚀 INICIALIZAÇÃO
    init() {
        console.log('🔐 Inicializando Auth Simples BIAPO v8.1...');
        
        // 🔥 ESCONDER SISTEMA DE LOGIN ANTIGO
        this._esconderLoginAntigo();
        
        // Tentar auto-login primeiro
        const autoLoginSucesso = this.autoLogin();
        
        if (!autoLoginSucesso) {
            // Se não conseguiu auto-login, mostrar tela de login
            this._mostrarTelaLogin();
        } else {
            console.log('✅ Auto-login realizado com sucesso');
        }
        
        console.log('✅ Auth Simples BIAPO v8.1 inicializado');
    },

    // 🔥 ESCONDER SISTEMA DE LOGIN ANTIGO
    _esconderLoginAntigo() {
        // Esconder possíveis telas de login antigas
        const loginScreens = [
            '#loginScreen',
            '.login-screen', 
            '.auth-screen',
            '#authContainer',
            '.modal-login'
        ];
        
        loginScreens.forEach(selector => {
            const elemento = document.querySelector(selector);
            if (elemento) {
                elemento.style.display = 'none';
                console.log(`🚫 Escondido login antigo: ${selector}`);
            }
        });
        
        // Forçar esconder qualquer modal de auth ativo
        const modals = document.querySelectorAll('.modal, [id*="login"], [id*="auth"]');
        modals.forEach(modal => {
            if (modal.id !== 'loginSimplesBiapo') {
                modal.style.display = 'none';
            }
        });
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Auth = Auth;

// 🚀 AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para outros scripts carregarem
    setTimeout(() => {
        Auth.init();
    }, 500);
});

// 📊 COMANDOS ÚTEIS NO CONSOLE
window.loginBiapo = (nome) => Auth.login(nome);
window.logoutBiapo = () => Auth.logout();
window.statusAuth = () => Auth.debug();
window.equipeBiapo = () => Auth.listarEquipe();
window.corrigirInterface = () => Auth.corrigirInterface(); // NOVO: Correção manual

console.log('🔐 Auth Simples BIAPO v8.1 carregado!');

/*
✅ SISTEMA AUTH SIMPLES v8.1:

🎯 FUNCIONALIDADES:
- ✅ Login apenas com primeiro nome (sem senha)
- ✅ Equipe BIAPO completa (11 pessoas) 
- ✅ Interface visual simples e bonita
- ✅ Auto-login (lembra último usuário)
- ✅ Compatibilidade total com sistema atual
- ✅ Admin para Renato Remiro

👥 EQUIPE DISPONÍVEL:
renato, bruna, lara, isabella, eduardo, carlos/beto, 
alex, nominato, nayara, jean, juliana

🔧 COMANDOS ÚTEIS:
loginBiapo('renato')  - Fazer login
logoutBiapo()         - Fazer logout  
statusAuth()          - Ver status
equipeBiapo()         - Listar equipe

🚀 RESULTADO:
- Sistema pronto para usar ✅
- Login super simples ✅
- Zero complexidade ✅
- Totalmente funcional ✅
*/
