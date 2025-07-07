/* ========== 🔐 AUTH BIAPO SIMPLES v8.1 ========== */

const Auth = {
    // ✅ CONFIGURAÇÃO
    config: {
        versao: '8.1.0'
    },

    // 👥 EQUIPE BIAPO
    equipe: {
        "renato": { nome: "Renato Remiro", email: "renatoremiro@biapo.com.br", admin: true },
        "bruna": { nome: "Bruna Britto", email: "brunabritto@biapo.com.br", admin: false },
        "lara": { nome: "Lara Coutinho", email: "laracoutinho@biapo.com.br", admin: false },
        "isabella": { nome: "Isabella", email: "isabella@biapo.com.br", admin: false },
        "eduardo": { nome: "Eduardo Santos", email: "eduardosantos@biapo.com.br", admin: false },
        "carlos": { nome: "Carlos Mendonça (Beto)", email: "carlosmendonca@biapo.com.br", admin: false },
        "beto": { nome: "Carlos Mendonça (Beto)", email: "carlosmendonca@biapo.com.br", admin: false },
        "alex": { nome: "Alex", email: "alex@biapo.com.br", admin: false },
        "nominato": { nome: "Nominato Pires", email: "nominatopires@biapo.com.br", admin: false },
        "nayara": { nome: "Nayara Alencar", email: "nayaraalencar@biapo.com.br", admin: false },
        "jean": { nome: "Jean (Estagiário)", email: "estagio292@biapo.com.br", admin: false },
        "juliana": { nome: "Juliana (Rede Interna)", email: "redeinterna.obra3@gmail.com", admin: false }
    },

    // ✅ ESTADO
    usuario: null,
    logado: false,

    // 🔐 LOGIN SIMPLES
    login: function(nome) {
        const nomeKey = nome.toLowerCase().trim();
        const dadosUsuario = this.equipe[nomeKey];
        
        if (!dadosUsuario) {
            console.log('❌ Usuário não encontrado:', nome);
            this.mostrarMensagem('Usuário não encontrado na equipe BIAPO', 'error');
            return false;
        }

        // Criar usuário
        this.usuario = {
            email: dadosUsuario.email,
            displayName: dadosUsuario.nome,
            nome: dadosUsuario.nome,
            primeiroNome: nomeKey,
            admin: dadosUsuario.admin
        };
        
        this.logado = true;

        // Integrar com App
        if (typeof App !== 'undefined') {
            App.usuarioAtual = this.usuario;
            if (App.estadoSistema) {
                App.estadoSistema.usuarioAutenticado = true;
                App.estadoSistema.usuarioEmail = this.usuario.email;
                App.estadoSistema.usuarioNome = this.usuario.displayName;
            }
        }

        // Salvar preferência
        localStorage.setItem('ultimoUsuarioBiapo', nomeKey);

        // Mostrar sistema
        this.mostrarSistema();
        
        this.mostrarMensagem('Bem-vindo, ' + dadosUsuario.nome + '!', 'success');
        
        console.log('✅ Login realizado:', dadosUsuario.nome);
        return true;
    },

    // 🚪 LOGOUT
    logout: function() {
        const nomeAnterior = this.usuario ? this.usuario.displayName : 'Usuário';
        
        this.usuario = null;
        this.logado = false;

        // Limpar App
        if (typeof App !== 'undefined') {
            App.usuarioAtual = null;
            if (App.estadoSistema) {
                App.estadoSistema.usuarioAutenticado = false;
                App.estadoSistema.usuarioEmail = null;
                App.estadoSistema.usuarioNome = null;
            }
        }

        this.mostrarLogin();
        this.mostrarMensagem('Até logo, ' + nomeAnterior + '!', 'info');
        
        console.log('✅ Logout realizado');
        return true;
    },

    // 🔄 AUTO-LOGIN
    autoLogin: function() {
        const ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
        if (ultimoUsuario && this.equipe[ultimoUsuario]) {
            console.log('🔄 Auto-login:', ultimoUsuario);
            return this.login(ultimoUsuario);
        }
        return false;
    },

    // 🖥️ MOSTRAR SISTEMA
    mostrarSistema: function() {
        const loginDiv = document.getElementById('loginBiapo');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loginDiv) {
            loginDiv.remove();
        }
        
        if (mainContainer) {
            mainContainer.style.display = 'block';
            mainContainer.classList.remove('hidden');
        }

        // Atualizar header
        const usuarioElement = document.getElementById('usuarioLogado');
        if (usuarioElement && this.usuario) {
            usuarioElement.textContent = '👤 ' + this.usuario.displayName;
        }
    },

    // 🔐 MOSTRAR LOGIN
    mostrarLogin: function() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.style.display = 'none';
            mainContainer.classList.add('hidden');
        }

        this.criarTelaLogin();
    },

    // 🎨 CRIAR TELA DE LOGIN
    criarTelaLogin: function() {
        // Remover login existente
        const loginExistente = document.getElementById('loginBiapo');
        if (loginExistente) {
            loginExistente.remove();
        }

        const loginDiv = document.createElement('div');
        loginDiv.id = 'loginBiapo';
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
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                    🏗️ Sistema BIAPO
                </h2>
                <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 16px;">
                    Gestão de Eventos - Obra 292
                </p>

                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 600; text-align: left;">
                        👤 Digite seu primeiro nome:
                    </label>
                    <input 
                        type="text" 
                        id="inputNome" 
                        placeholder="Ex: renato, bruna, lara..."
                        style="
                            width: 100%;
                            padding: 16px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 16px;
                            text-align: center;
                            box-sizing: border-box;
                        "
                        onkeydown="if(event.key==='Enter') Auth.fazerLogin()"
                    >
                </div>

                <button 
                    onclick="Auth.fazerLogin()" 
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
                        margin-bottom: 24px;
                    "
                >
                    🔐 Entrar
                </button>

                <div style="margin-top: 24px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">
                        Equipe disponível:
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px;">
                        <span onclick="Auth.preencherNome('renato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">renato</span>
                        <span onclick="Auth.preencherNome('bruna')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">bruna</span>
                        <span onclick="Auth.preencherNome('lara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">lara</span>
                        <span onclick="Auth.preencherNome('isabella')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">isabella</span>
                        <span onclick="Auth.preencherNome('eduardo')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">eduardo</span>
                        <span onclick="Auth.preencherNome('carlos')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">carlos</span>
                        <span onclick="Auth.preencherNome('alex')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">alex</span>
                        <span onclick="Auth.preencherNome('nominato')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">nominato</span>
                        <span onclick="Auth.preencherNome('nayara')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">nayara</span>
                        <span onclick="Auth.preencherNome('jean')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">jean</span>
                        <span onclick="Auth.preencherNome('juliana')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px; color: #374151;">juliana</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(loginDiv);
        
        setTimeout(function() {
            const input = document.getElementById('inputNome');
            if (input) input.focus();
        }, 100);
    },

    // 🔧 FUNÇÕES AUXILIARES
    fazerLogin: function() {
        const input = document.getElementById('inputNome');
        if (input) {
            const nome = input.value.trim();
            if (nome) {
                this.login(nome);
            } else {
                this.mostrarMensagem('Digite seu nome', 'warning');
            }
        }
    },

    preencherNome: function(nome) {
        const input = document.getElementById('inputNome');
        if (input) {
            input.value = nome;
            input.focus();
        }
    },

    mostrarMensagem: function(mensagem, tipo) {
        if (typeof Notifications !== 'undefined') {
            if (tipo === 'success' && Notifications.success) {
                Notifications.success(mensagem);
            } else if (tipo === 'error' && Notifications.error) {
                Notifications.error(mensagem);
            } else if (tipo === 'warning' && Notifications.warning) {
                Notifications.warning(mensagem);
            } else if (Notifications.info) {
                Notifications.info(mensagem);
            }
        } else {
            console.log(tipo.toUpperCase() + ':', mensagem);
        }
    },

    // ✅ VERIFICAÇÕES
    estaLogado: function() {
        return this.logado;
    },

    obterUsuario: function() {
        return this.usuario;
    },

    ehAdmin: function() {
        return this.usuario && this.usuario.admin;
    },

    // 🚀 INICIALIZAÇÃO
    init: function() {
        console.log('🔐 Inicializando Auth BIAPO v8.1...');
        
        // Esconder login antigo
        const loginAntigo = document.getElementById('loginScreen');
        if (loginAntigo) {
            loginAntigo.style.display = 'none';
        }
        
        // Tentar auto-login
        if (!this.autoLogin()) {
            this.mostrarLogin();
        }
        
        console.log('✅ Auth BIAPO v8.1 inicializado');
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Auth = Auth;

// 📊 COMANDOS ÚTEIS
window.loginBiapo = function(nome) { return Auth.login(nome); };
window.logoutBiapo = function() { return Auth.logout(); };
window.statusAuth = function() { 
    console.log('Auth Status:', {
        logado: Auth.logado,
        usuario: Auth.usuario ? Auth.usuario.displayName : null,
        versao: Auth.config.versao
    });
};

// 🚀 INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof Auth !== 'undefined') {
            Auth.init();
        }
    }, 500);
});

console.log('🔐 Auth BIAPO Simples v8.1 carregado!');

/*
✅ AUTH SIMPLES FUNCIONAL:
- Login por primeiro nome ✅
- Equipe BIAPO completa ✅
- Interface visual ✅
- Auto-login ✅
- Integração com App ✅
- Zero erros de sintaxe ✅
- Comandos: loginBiapo('nome'), logoutBiapo(), statusAuth() ✅
*/
