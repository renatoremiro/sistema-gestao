// AUTH BIAPO ULTRA-SIMPLES v8.1
var Auth = {
    equipe: {
        "renato": { nome: "Renato Remiro", admin: true },
        "bruna": { nome: "Bruna Britto", admin: false },
        "lara": { nome: "Lara Coutinho", admin: false },
        "isabella": { nome: "Isabella", admin: false },
        "eduardo": { nome: "Eduardo Santos", admin: false },
        "carlos": { nome: "Carlos Mendonça (Beto)", admin: false },
        "alex": { nome: "Alex", admin: false },
        "nominato": { nome: "Nominato Pires", admin: false },
        "nayara": { nome: "Nayara Alencar", admin: false },
        "jean": { nome: "Jean (Estagiário)", admin: false },
        "juliana": { nome: "Juliana (Rede Interna)", admin: false }
    },
    
    usuario: null,
    logado: false,
    
    login: function(nome) {
        var user = this.equipe[nome.toLowerCase()];
        if (user) {
            this.usuario = { displayName: user.nome, admin: user.admin };
            this.logado = true;
            
            if (window.App) {
                App.usuarioAtual = this.usuario;
            }
            
            var main = document.getElementById('mainContainer');
            if (main) {
                main.style.display = 'block';
                main.classList.remove('hidden');
            }
            
            var userEl = document.getElementById('usuarioLogado');
            if (userEl) {
                userEl.textContent = '👤 ' + user.nome;
            }
            
            console.log('✅ Login:', user.nome);
            return true;
        }
        console.log('❌ Usuário não encontrado:', nome);
        return false;
    },
    
    logout: function() {
        this.usuario = null;
        this.logado = false;
        
        // Limpar App
        if (window.App) {
            App.usuarioAtual = null;
        }
        
        // Esconder sistema
        var main = document.getElementById('mainContainer');
        if (main) {
            main.style.display = 'none';
            main.classList.add('hidden');
        }
        
        // Mostrar tela de login
        this.criarTelaLogin();
        
        console.log('✅ Logout realizado');
    },
    
    // ADICIONAR: Função compatível com HTML
    fazerLogout: function() {
        return this.logout();
    },
    
    estaLogado: function() {
        return this.logado;
    },
    
    mostrarGerenciarUsuarios: function() {
        console.log('Função de gestão de usuários em desenvolvimento');
    },
    
    fazerLogin: function() {
        console.log('Usar: loginBiapo("nome")');
    },
    
    // ADICIONAR: Criar tela de login
    criarTelaLogin: function() {
        var loginExistente = document.getElementById('loginBiapo');
        if (loginExistente) {
            loginExistente.remove();
        }

        var loginDiv = document.createElement('div');
        loginDiv.id = 'loginBiapo';
        loginDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; z-index: 999999;';

        loginDiv.innerHTML = '<div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; width: 90%;"><h2 style="color: #1f2937; margin: 0 0 32px 0;">🏗️ Sistema BIAPO</h2><div style="margin-bottom: 24px;"><input type="text" id="inputNome" placeholder="Digite seu primeiro nome..." style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; text-align: center; box-sizing: border-box;" onkeydown="if(event.key===\'Enter\') loginBiapo(this.value)"></div><button onclick="loginBiapo(document.getElementById(\'inputNome\').value)" style="width: 100%; background: #C53030; color: white; border: none; padding: 16px; border-radius: 8px; font-size: 16px; cursor: pointer;">🔐 Entrar</button><div style="margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px;"><span onclick="loginBiapo(\'renato\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">renato</span><span onclick="loginBiapo(\'bruna\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">bruna</span><span onclick="loginBiapo(\'lara\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">lara</span><span onclick="loginBiapo(\'isabella\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">isabella</span><span onclick="loginBiapo(\'eduardo\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">eduardo</span><span onclick="loginBiapo(\'carlos\')" style="cursor:pointer; padding: 4px; background: #f3f4f6; border-radius: 4px;">carlos</span></div></div>';

        document.body.appendChild(loginDiv);
        
        setTimeout(function() {
            var input = document.getElementById('inputNome');
            if (input) input.focus();
        }, 100);
    },
    
    fazerLogout: function() {
        return this.logout();
    }
};

window.Auth = Auth;

function loginBiapo(nome) { 
    return Auth.login(nome); 
}

function logoutBiapo() { 
    return Auth.logout(); 
}

function statusAuth() {
    console.log('Auth Status:', {
        logado: Auth.logado,
        usuario: Auth.usuario ? Auth.usuario.displayName : null
    });
}

setTimeout(function() {
    if (!Auth.logado) {
        var autoUser = localStorage.getItem('ultimoUsuarioBiapo') || 'renato';
        console.log('🔄 Auto-login:', autoUser);
        Auth.login(autoUser);
    }
}, 1000);

console.log('🔐 Auth Ultra-Simples v8.1 carregado!');
