/* ========== 🔐 SISTEMA DE AUTENTICAÇÃO FIREBASE v6.2 ========== */

let firebaseAuth = null;


const Auth = {
    // ✅ CONFIGURAÇÕES
    config: {
        TIMEOUT_LOGIN: 10000, // 10 segundos
        MAX_TENTATIVAS_LOGIN: 3,
        AUTO_REDIRECT_DELAY: 1500, // 1.5 segundos
        REMEMBER_USER: true
    },

    // ✅ ESTADO DO SISTEMA DE AUTH
    state: {
        usuarioAtual: null,
        tentativasLogin: 0,
        loginEmAndamento: false,
        autoLoginTentado: false,
        listeners: new Set(),
        loginCallbacks: new Set(),
        logoutCallbacks: new Set()
    },

    // ✅ FAZER LOGIN
    async fazerLogin() {
        if (this.state.loginEmAndamento) {
            Notifications.warning('Login já em andamento...');
            return;
        }

        const email = document.getElementById('loginEmail')?.value?.trim();
        const senha = document.getElementById('loginPassword')?.value;

        // Validar campos
        const validacao = this._validarCamposLogin(email, senha);
        if (!validacao.valido) {
            Notifications.error(validacao.erro);
            this._destacarCamposErro(validacao.campos);
            return;
        }

        try {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }

            this.state.loginEmAndamento = true;
            this.state.tentativasLogin++;

            this._mostrarIndicadorLogin('Fazendo login...');

            // Timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout no login')), this.config.TIMEOUT_LOGIN);
            });

            // Login promise
            const loginPromise = firebaseAuth?.signInWithEmailAndPassword(email, senha);
            
            // Race entre login e timeout
            const userCredential = await Promise.race([loginPromise, timeoutPromise]);
            
            this._onLoginSucesso(userCredential.user);
            
        } catch (error) {
            this._onLoginErro(error);
        } finally {
            this.state.loginEmAndamento = false;
            this._ocultarIndicadorLogin();
        }
    },

    // ✅ FAZER LOGOUT
    async fazerLogout() {
        try {
            Notifications.info('Fazendo logout...');
            
            // Salvar dados antes do logout se houver
            if (App.dados && Persistence.state.dadosParaSalvar) {
                await Persistence.salvarDadosCritico();
            }
            
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            await firebaseAuth.signOut();
            this._onLogoutSucesso();
            
        } catch (error) {
            console.error('Erro no logout:', error);
            Notifications.error('Erro ao fazer logout');
            
            // Forçar logout local mesmo com erro
            this._limparSessaoLocal();
            this._mostrarTelaLogin();
        }
    },

    // ✅ REGISTRAR NOVO USUÁRIO
    async mostrarRegistro() {
        // Criar modal de registro dinamicamente
        const modalRegistro = this._criarModalRegistro();
        document.body.appendChild(modalRegistro);
    },

    async registrarUsuario(email, senha, nome) {
        try {
            this._mostrarIndicadorLogin('Criando conta...');
            
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, senha);
            
            // Atualizar perfil com nome
            await userCredential.user.updateProfile({
                displayName: nome
            });
            
            this._onLoginSucesso(userCredential.user);
            Notifications.success('Conta criada com sucesso!');
            
        } catch (error) {
            this._onRegistroErro(error);
        } finally {
            this._ocultarIndicadorLogin();
        }
    },

    // ✅ RECUPERAR SENHA
    async recuperarSenha(email) {
        try {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            await firebaseAuth.sendPasswordResetEmail(email);
            Notifications.success('Email de recuperação enviado!');
        } catch (error) {
            console.error('Erro na recuperação:', error);
            Notifications.error('Erro ao enviar email de recuperação');
        }
    },

    // ✅ CALLBACKS DE SUCESSO E ERRO
    _onLoginSucesso(user) {
        this.state.usuarioAtual = user;
        this.state.tentativasLogin = 0;
        
        // Atualizar estado global do App
        App.usuarioAtual = user;
        App.estadoSistema.usuarioEmail = user.email;
        App.estadoSistema.usuarioNome = user.displayName || user.email;
        
        // Salvar preferência de login se habilitado
        if (this.config.REMEMBER_USER) {
            Helpers.storage.set('ultimoUsuario', {
                email: user.email,
                nome: user.displayName,
                timestamp: Date.now()
            });
        }
        
        // Limpar campos de login
        this._limparCamposLogin();
        
        // Notificar sucesso
        Notifications.success(`Bem-vindo, ${user.displayName || user.email}!`);
        
        // Redirecionar após delay
        setTimeout(() => {
            this._mostrarSistema();
            this.state.loginCallbacks.forEach(cb => {
                try { cb(user); } catch (e) { console.error(e); }
            });
        }, this.config.AUTO_REDIRECT_DELAY);
    },

    _onLoginErro(error) {
        console.error('Erro no login:', error);
        
        let mensagemErro = 'Erro no login';
        let sugestao = '';
        
        switch (error.code) {
            case 'auth/user-not-found':
                mensagemErro = 'Usuário não encontrado';
                sugestao = 'Verifique o email ou registre-se';
                break;
            case 'auth/wrong-password':
                mensagemErro = 'Senha incorreta';
                sugestao = 'Verifique sua senha ou recupere-a';
                break;
            case 'auth/invalid-email':
                mensagemErro = 'Email inválido';
                sugestao = 'Verifique o formato do email';
                break;
            case 'auth/too-many-requests':
                mensagemErro = 'Muitas tentativas';
                sugestao = 'Aguarde alguns minutos';
                break;
            case 'auth/network-request-failed':
                mensagemErro = 'Erro de conexão';
                sugestao = 'Verifique sua internet';
                break;
            default:
                mensagemErro = error.message || 'Erro desconhecido';
        }
        
        Notifications.error(`${mensagemErro}${sugestao ? ` - ${sugestao}` : ''}`);
        
        // Verificar limite de tentativas
        if (this.state.tentativasLogin >= this.config.MAX_TENTATIVAS_LOGIN) {
            this._bloquearLogin();
        }
    },

    _onLogoutSucesso() {
        this.state.usuarioAtual = null;
        
        // Limpar estado global do App
        App.usuarioAtual = null;
        App.dados = null;
        App.estadoSistema.usuarioEmail = null;
        App.estadoSistema.usuarioNome = null;
        
        this._limparSessaoLocal();
        this._mostrarTelaLogin();

        this.state.logoutCallbacks.forEach(cb => {
            try { cb(); } catch (e) { console.error(e); }
        });

        Notifications.info('Logout realizado com sucesso');
    },

    _onRegistroErro(error) {
        console.error('Erro no registro:', error);
        
        let mensagemErro = 'Erro ao criar conta';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                mensagemErro = 'Email já está em uso';
                break;
            case 'auth/weak-password':
                mensagemErro = 'Senha muito fraca';
                break;
            case 'auth/invalid-email':
                mensagemErro = 'Email inválido';
                break;
            default:
                mensagemErro = error.message || 'Erro desconhecido';
        }
        
        Notifications.error(mensagemErro);
    },

    // ✅ VALIDAÇÃO DE CAMPOS
    _validarCamposLogin(email, senha) {
        const campos = [];
        let erro = '';
        
        if (!email) {
            erro = 'Email é obrigatório';
            campos.push('loginEmail');
        } else if (!Validation.isValidEmail(email)) {
            erro = 'Email inválido';
            campos.push('loginEmail');
        }
        
        if (!senha) {
            erro = erro || 'Senha é obrigatória';
            campos.push('loginPassword');
        } else if (senha.length < 6) {
            erro = erro || 'Senha deve ter pelo menos 6 caracteres';
            campos.push('loginPassword');
        }
        
        return {
            valido: campos.length === 0,
            erro,
            campos
        };
    },

    _destacarCamposErro(campos) {
        // Limpar erros anteriores
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        
        // Destacar campos com erro
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.classList.add('input-error');
                campo.focus();
            }
        });
    },

    // ✅ INTERFACE - MOSTRAR/OCULTAR TELAS
    _mostrarTelaLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loginScreen && mainContainer) {
            loginScreen.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        }
        
        // Limpar dados sensíveis
        this._limparCamposLogin();
    },

    _mostrarSistema() {
        const loginScreen = document.getElementById('loginScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loginScreen && mainContainer) {
            loginScreen.classList.add('hidden');
            mainContainer.classList.remove('hidden');
        }
        
        // Inicializar sistema se necessário
        if (App && typeof App.inicializarSistema === 'function') {
            App.inicializarSistema();
        }
    },

    // ✅ INDICADORES VISUAIS
    _mostrarIndicadorLogin(texto) {
        // Encontrar botão de login
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        if (btnLogin) {
            btnLogin.innerHTML = `<div class="loading"></div> ${texto}`;
            btnLogin.disabled = true;
        }
    },

    _ocultarIndicadorLogin() {
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        if (btnLogin) {
            btnLogin.innerHTML = 'Entrar';
            btnLogin.disabled = false;
        }
    },

    // ✅ BLOQUEIO TEMPORÁRIO APÓS MUITAS TENTATIVAS
    _bloquearLogin() {
        const tempoBloquei = 5 * 60 * 1000; // 5 minutos
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        
        if (btnLogin) {
            btnLogin.disabled = true;
            btnLogin.innerHTML = '🔒 Bloqueado (5min)';
        }
        
        Notifications.error('Login bloqueado por 5 minutos após muitas tentativas');
        
        setTimeout(() => {
            this.state.tentativasLogin = 0;
            this._ocultarIndicadorLogin();
            Notifications.info('Bloqueio removido - pode tentar novamente');
        }, tempoBloquei);
    },

    // ✅ LIMPEZA DE DADOS
    _limparCamposLogin() {
        const campos = ['loginEmail', 'loginPassword'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.classList.remove('input-error');
            }
        });
    },

    _limparSessaoLocal() {
        // Limpar dados locais sensíveis, mas manter preferências
        const backup = Helpers.storage.get('ultimoUsuario');
        Persistence.limparDadosAntigos();
        
        if (backup && this.config.REMEMBER_USER) {
            Helpers.storage.set('ultimoUsuario', backup);
        }
    },

    // ✅ MODAL DE REGISTRO
    _criarModalRegistro() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '3000';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="margin-bottom: 24px;">🔐 Criar Nova Conta</h3>
                
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" id="registroNome" placeholder="Seu nome completo" required>
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="registroEmail" placeholder="seu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="registroSenha" placeholder="Mínimo 6 caracteres" required>
                </div>
                
                <div class="form-group">
                    <label>Confirmar Senha</label>
                    <input type="password" id="registroConfirmarSenha" placeholder="Digite a senha novamente" required>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="Auth._processarRegistro(this)">
                        Criar Conta
                    </button>
                </div>
                
                <div style="margin-top: 16px; text-align: center; font-size: 14px; color: #6b7280;">
                    Já tem conta? <a href="#" onclick="this.closest('.modal').remove()" style="color: #3b82f6;">Faça login</a>
                </div>
            </div>
        `;
        
        return modal;
    },

    _processarRegistro(botao) {
        const modal = botao.closest('.modal');
        const nome = modal.querySelector('#registroNome').value.trim();
        const email = modal.querySelector('#registroEmail').value.trim();
        const senha = modal.querySelector('#registroSenha').value;
        const confirmarSenha = modal.querySelector('#registroConfirmarSenha').value;
        
        // Validações
        if (!nome || nome.length < 2) {
            Notifications.error('Nome deve ter pelo menos 2 caracteres');
            return;
        }
        
        if (!Validation.isValidEmail(email)) {
            Notifications.error('Email inválido');
            return;
        }
        
        if (senha.length < 6) {
            Notifications.error('Senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (senha !== confirmarSenha) {
            Notifications.error('Senhas não conferem');
            return;
        }
        
        // Processar registro
        this.registrarUsuario(email, senha, nome).then(() => {
            modal.remove();
        });
    },

    // ✅ AUTO-LOGIN SE USUÁRIO JÁ LOGADO
    async verificarAutoLogin() {
        if (this.state.autoLoginTentado) return;
        
        this.state.autoLoginTentado = true;
        
        return new Promise((resolve) => {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                resolve(null);
                return;
            }

            const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
                unsubscribe();
                
                if (user) {
                    console.log('👤 Usuário já autenticado:', user.email);
                    this._onLoginSucesso(user);
                } else {
                    console.log('👤 Usuário não autenticado');
                    this._mostrarTelaLogin();
                    
                    // Pré-popular email se lembrado
                    this._preencherUltimoUsuario();
                }
                
                resolve(user);
            });
        });
    },

    _preencherUltimoUsuario() {
        if (!this.config.REMEMBER_USER) return;
        
        const ultimoUsuario = Helpers.storage.get('ultimoUsuario');
        if (ultimoUsuario && ultimoUsuario.email) {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                emailInput.value = ultimoUsuario.email;
                
                // Focar no campo senha
                const senhaInput = document.getElementById('loginPassword');
                if (senhaInput) {
                    senhaInput.focus();
                }
            }
        }
    },

    // ✅ CONFIGURAR EVENTOS DE TECLADO
    _configurarEventosTeclado() {
        // Enter para fazer login
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const loginScreen = document.getElementById('loginScreen');
                if (loginScreen && !loginScreen.classList.contains('hidden')) {
                    this.fazerLogin();
                }
            }
        });
    },

    // ✅ OBTER STATUS DE AUTENTICAÇÃO
    obterStatus() {
        return {
            usuarioAtual: this.state.usuarioAtual,
            email: this.state.usuarioAtual?.email || null,
            nome: this.state.usuarioAtual?.displayName || null,
            autenticado: !!this.state.usuarioAtual,
            tentativasLogin: this.state.tentativasLogin,
            loginEmAndamento: this.state.loginEmAndamento
        };
    },

    // ✅ VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
    estaAutenticado() {
        return !!this.state.usuarioAtual;
    },

    onLogin(callback) {
        if (typeof callback === 'function') {
            this.state.loginCallbacks.add(callback);
        }
    },

    onLogout(callback) {
        if (typeof callback === 'function') {
            this.state.logoutCallbacks.add(callback);
        }
    },

    // ✅ INICIALIZAÇÃO DO MÓDULO
    init() {
        console.log('🔐 Inicializando sistema de autenticação...');

        if (!firebaseAuth) {
            Notifications.error('Serviço de autenticação indisponível');
            return;
        }

        // Configurar eventos de teclado
        this._configurarEventosTeclado();

        // Verificar auto-login
        this.verificarAutoLogin();

        // Configurar listener de mudanças de autenticação
        const authListener = firebaseAuth?.onAuthStateChanged((user) => {
            if (user && !this.state.usuarioAtual) {
                // Usuário fez login
                this._onLoginSucesso(user);
            } else if (!user && this.state.usuarioAtual) {
                // Usuário fez logout
                this._onLogoutSucesso();
            }
        });
        
        this.state.listeners.add(authListener);
        
        console.log('✅ Sistema de autenticação inicializado');
    },

    // ✅ LIMPEZA DO MÓDULO
    destroy() {
        // Limpar listeners
        this.state.listeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener();
            }
        });
        this.state.listeners.clear();
        this.state.loginCallbacks.clear();
        this.state.logoutCallbacks.clear();
    }
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', async () => {
    if (window.firebaseInitPromise) {
        await window.firebaseInitPromise;
    }
    firebaseAuth = window.auth || (window.firebase ? window.firebase.auth() : null);
    Auth.init();
});

// Disponibilizar objeto para handlers em inline scripts
window.Auth = Auth;

console.log('🔐 Sistema de Autenticação Firebase v6.2 carregado!');
