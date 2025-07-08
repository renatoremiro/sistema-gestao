/* ========== 🔐 AUTH BIAPO COMPLETO v8.3 - INTEGRAÇÃO ADMIN ========== */

var Auth = {
    // ✅ CONFIGURAÇÃO COMPLETA
    config: {
        versao: '8.3.0', // ATUALIZADO
        autoLogin: true,
        lembrarUsuario: true,
        sistemaEmails: true, // Para futuro
        sistemaAdmin: true,
        debug: false
    },

    // 👥 EQUIPE BIAPO COMPLETA - DADOS REAIS
    equipe: {
        "renato": {
            nome: "Renato Remiro",
            email: "renatoremiro@biapo.com.br",
            cargo: "Coordenador Geral",
            departamento: "Gestão Geral",
            admin: true,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "bruna": {
            nome: "Bruna Britto",
            email: "brunabritto@biapo.com.br",
            cargo: "Coordenadora",
            departamento: "Gestão Geral",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "lara": {
            nome: "Lara Coutinho",
            email: "laracoutinho@biapo.com.br",
            cargo: "Analista",
            departamento: "Gestão Geral",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "isabella": {
            nome: "Isabella",
            email: "isabella@biapo.com.br",
            cargo: "Especialista",
            departamento: "Obra e Construção",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "eduardo": {
            nome: "Eduardo Santos",
            email: "eduardosantos@biapo.com.br",
            cargo: "Engenheiro",
            departamento: "Obra e Construção",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "carlos": {
            nome: "Carlos Mendonça (Beto)",
            email: "carlosmendonca@biapo.com.br",
            cargo: "Supervisor de Obra",
            departamento: "Obra e Construção",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "beto": {
            nome: "Carlos Mendonça (Beto)",
            email: "carlosmendonca@biapo.com.br",
            cargo: "Supervisor de Obra",
            departamento: "Obra e Construção",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "alex": {
            nome: "Alex",
            email: "alex@biapo.com.br",
            cargo: "Técnico",
            departamento: "Obra e Construção",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "nominato": {
            nome: "Nominato Pires",
            email: "nominatopires@biapo.com.br",
            cargo: "Especialista",
            departamento: "Museu Nacional",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "nayara": {
            nome: "Nayara Alencar",
            email: "nayaraalencar@biapo.com.br",
            cargo: "Analista",
            departamento: "Museu Nacional",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "jean": {
            nome: "Jean (Estagiário)",
            email: "estagio292@biapo.com.br",
            cargo: "Estagiário",
            departamento: "Gestão Geral",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        },
        "juliana": {
            nome: "Juliana (Rede Interna)",
            email: "redeinterna.obra3@gmail.com",
            cargo: "Coordenadora de Rede",
            departamento: "Museu Nacional",
            admin: false,
            ativo: true,
            telefone: "",
            dataIngresso: "2024-01-01"
        }
    },

    // ✅ ESTADO DO SISTEMA
    state: {
        usuario: null,
        logado: false,
        tentativasLogin: 0,
        ultimoLogin: null,
        sessaoIniciada: null
    },

    // ========== FUNÇÕES PRINCIPAIS ==========

    // 🔐 LOGIN PRINCIPAL
    login: function(identificador, senha) {
        try {
            // Normalizar identificador (nome, email ou ID)
            var nomeKey = this._normalizarIdentificador(identificador);
            var dadosUsuario = this.equipe[nomeKey];
            
            if (!dadosUsuario) {
                this._logErro('Usuário não encontrado: ' + identificador);
                this.mostrarMensagem('Usuário não encontrado na equipe BIAPO', 'error');
                this.state.tentativasLogin++;
                return false;
            }

            if (!dadosUsuario.ativo) {
                this._logErro('Usuário inativo: ' + identificador);
                this.mostrarMensagem('Usuário inativo no sistema', 'error');
                return false;
            }

            // Criar objeto de usuário completo
            this.state.usuario = {
                email: dadosUsuario.email,
                displayName: dadosUsuario.nome,
                nome: dadosUsuario.nome,
                primeiroNome: nomeKey,
                cargo: dadosUsuario.cargo,
                departamento: dadosUsuario.departamento,
                admin: dadosUsuario.admin,
                ativo: dadosUsuario.ativo,
                telefone: dadosUsuario.telefone,
                dataIngresso: dadosUsuario.dataIngresso,
                uid: 'biapo_' + nomeKey,
                loginTimestamp: new Date().toISOString()
            };
            
            this.state.logado = true;
            this.state.tentativasLogin = 0;
            this.state.ultimoLogin = new Date().toISOString();
            this.state.sessaoIniciada = new Date().toISOString();

            // Integração com App
            this._integrarComApp();

            // Persistir preferências
            this._salvarPreferencias();

            // Mostrar sistema
            this.mostrarSistema();
            
            this.mostrarMensagem('Bem-vindo, ' + dadosUsuario.nome + '!', 'success');
            
            this._log('Login realizado com sucesso: ' + dadosUsuario.nome);
            
            // Callback de login
            this._executarCallbacksLogin();
            
            return true;

        } catch (error) {
            this._logErro('Erro no login: ' + error.message);
            this.mostrarMensagem('Erro interno no login', 'error');
            return false;
        }
    },

    // 🚪 LOGOUT COMPLETO
    logout: function() {
        try {
            var nomeAnterior = this.state.usuario ? this.state.usuario.displayName : 'Usuário';
            
            // Limpar estado
            this.state.usuario = null;
            this.state.logado = false;
            this.state.sessaoIniciada = null;
            
            // Limpar integração App
            this._limparIntegracaoApp();

            // Esconder sistema e mostrar login
            this.esconderSistema();
            this.mostrarLogin();
            
            this.mostrarMensagem('Até logo, ' + nomeAnterior + '!', 'info');
            this._log('Logout realizado: ' + nomeAnterior);
            
            // Callback de logout
            this._executarCallbacksLogout();
            
            return true;

        } catch (error) {
            this._logErro('Erro no logout: ' + error.message);
            return false;
        }
    },

    // 🔄 AUTO-LOGIN INTELIGENTE
    autoLogin: function() {
        try {
            if (!this.config.autoLogin || this.state.logado) {
                return false;
            }

            var ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
            var lembrarUsuario = localStorage.getItem('lembrarUsuarioBiapo') === 'true';
            
            if (ultimoUsuario && lembrarUsuario && this.equipe[ultimoUsuario]) {
                this._log('Tentando auto-login: ' + ultimoUsuario);
                return this.login(ultimoUsuario);
            }

            return false;

        } catch (error) {
            this._logErro('Erro no auto-login: ' + error.message);
            return false;
        }
    },

    // ========== INTERFACE DO USUÁRIO ==========

    // 🖥️ MOSTRAR SISTEMA PRINCIPAL
    mostrarSistema: function() {
        try {
            // Esconder todas as telas de login
            this._esconderTodasTelasLogin();
            
            // Mostrar sistema principal
            var mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.style.display = 'block';
                mainContainer.classList.remove('hidden');
            }

            // Atualizar interface do usuário
            this._atualizarInterfaceUsuario();
            
            this._log('Sistema principal exibido');

        } catch (error) {
            this._logErro('Erro ao mostrar sistema: ' + error.message);
        }
    },

    // 🔐 MOSTRAR TELA DE LOGIN
    mostrarLogin: function() {
        try {
            this.esconderSistema();
            this.criarTelaLogin();
            this._log('Tela de login exibida');
        } catch (error) {
            this._logErro('Erro ao mostrar login: ' + error.message);
        }
    },

    // 📱 ESCONDER SISTEMA
    esconderSistema: function() {
        var mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.style.display = 'none';
            mainContainer.classList.add('hidden');
        }
    },

    // 🎨 CRIAR TELA DE LOGIN COMPLETA
    criarTelaLogin: function() {
        // Remover login existente
        this._esconderTodasTelasLogin();

        var loginDiv = document.createElement('div');
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
                padding: 48px;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                text-align: center;
                max-width: 450px;
                width: 90%;
            ">
                <!-- Header -->
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
                    <p style="
                        color: #9ca3af;
                        margin: 8px 0 0 0;
                        font-size: 12px;
                    ">v${this.config.versao} | ${Object.keys(this.equipe).length} usuários</p>
                </div>

                <!-- Input de Login -->
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
                            transition: border-color 0.3s ease;
                        "
                        onkeydown="if(event.key==='Enter') Auth.fazerLogin()"
                        onfocus="this.style.borderColor='#C53030'"
                        onblur="this.style.borderColor='#e5e7eb'"
                    >
                </div>

                <!-- Botão de Login -->
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
                        transition: transform 0.2s ease;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    🔐 Entrar
                </button>

                <!-- Equipe Disponível -->
                <div>
                    <p style="
                        color: #6b7280;
                        font-size: 14px;
                        margin: 0 0 12px 0;
                        font-weight: 500;
                    ">👥 Equipe disponível:</p>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                        font-size: 12px;
                    ">
                        ${this._gerarBotoesEquipe()}
                    </div>
                    
                    <div style="
                        margin-top: 16px;
                        padding: 12px;
                        background: #f9fafb;
                        border-radius: 8px;
                        border-left: 4px solid #10b981;
                    ">
                        <p style="
                            margin: 0;
                            font-size: 12px;
                            color: #059669;
                            font-weight: 500;
                        ">✅ Sistema v8.3 pronto | Gestão completa de usuários, áreas e departamentos</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(loginDiv);
        
        // Focar no input
        setTimeout(function() {
            var input = document.getElementById('inputNome');
            if (input) {
                input.focus();
                // Pre-popular se houver último usuário
                var ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
                if (ultimoUsuario && Auth.config.lembrarUsuario) {
                    input.value = ultimoUsuario;
                    input.select();
                }
            }
        }, 100);
    },

    // ========== FUNÇÕES DE INTERFACE ==========

    // 🔧 FAZER LOGIN (chamada da interface)
    fazerLogin: function() {
        var input = document.getElementById('inputNome');
        if (input) {
            var nome = input.value.trim();
            if (nome) {
                this.login(nome);
            } else {
                this.mostrarMensagem('Digite seu nome', 'warning');
                input.focus();
            }
        }
    },

    // 🚪 FAZER LOGOUT (compatibilidade com HTML)
    fazerLogout: function() {
        return this.logout();
    },

    // 👥 PREENCHER NOME (botões da equipe)
    preencherNome: function(nome) {
        var input = document.getElementById('inputNome');
        if (input) {
            input.value = nome;
            input.focus();
        }
    },

    // ========== GESTÃO DE USUÁRIOS v8.3 - INTEGRAÇÃO ADMINUSERSMANAGER ==========

    // 👥 MOSTRAR GESTÃO DE USUÁRIOS (INTEGRAÇÃO v8.3)
    mostrarGerenciarUsuarios: function() {
        try {
            // 🔥 VERIFICAÇÃO DE PERMISSÕES
            if (!this.ehAdmin()) {
                this.mostrarMensagem('❌ Acesso restrito a administradores', 'error');
                return false;
            }
            
            console.log('👑 Abrindo gestão administrativa v8.3...');
            
            // 🔥 VERIFICAR SE AdminUsersManager ESTÁ DISPONÍVEL
            if (typeof AdminUsersManager !== 'undefined' && AdminUsersManager.abrirInterfaceGestao) {
                
                // ✅ CHAMAR ADMINUSERSMANAGER DIRETAMENTE
                AdminUsersManager.abrirInterfaceGestao();
                console.log('✅ AdminUsersManager v8.3 carregado com sucesso!');
                return true;
                
            } else {
                
                // ❌ FALLBACK: AdminUsersManager não disponível
                console.warn('⚠️ AdminUsersManager não encontrado - usando fallback');
                this._mostrarFallbackGestaoUsuarios();
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro ao abrir gestão de usuários:', error);
            this.mostrarMensagem('Erro interno na gestão de usuários', 'error');
            this._mostrarFallbackGestaoUsuarios();
            return false;
        }
    },

    // 🚨 FALLBACK: GESTÃO DE USUÁRIOS BÁSICA
    _mostrarFallbackGestaoUsuarios: function() {
        var modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #DC2626; margin: 0 0 16px 0;">AdminUsersManager não carregado</h3>
                <p style="color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
                    O módulo de gestão avançada não está disponível.<br>
                    Verifique se o arquivo <code>admin-users-manager.js</code> foi carregado corretamente.
                </p>
                
                <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
                    <h4 style="color: #991B1B; margin: 0 0 8px 0; font-size: 14px;">🔧 Solução:</h4>
                    <ol style="color: #7F1D1D; margin: 0; padding-left: 20px; font-size: 13px;">
                        <li>Adicione o script no index.html:<br>
                            <code>&lt;script src="assets/js/modules/admin-users-manager.js"&gt;&lt;/script&gt;</code>
                        </li>
                        <li>Recarregue a página (F5)</li>
                        <li>Tente novamente</li>
                    </ol>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="location.reload()" style="
                        background: #059669;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">🔄 Recarregar Página</button>
                    
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">❌ Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-fechar em 10 segundos
        setTimeout(function() {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    },

    // 📋 LISTAR USUÁRIOS (MANTIDO PARA COMPATIBILIDADE)
    listarUsuarios: function(filtros) {
        var usuarios = [];
        var self = this;
        
        Object.keys(this.equipe).forEach(function(key) {
            var usuario = self.equipe[key];
            if (!filtros || self._aplicarFiltros(usuario, filtros)) {
                usuarios.push({
                    id: key,
                    nome: usuario.nome,
                    email: usuario.email,
                    cargo: usuario.cargo,
                    departamento: usuario.departamento,
                    admin: usuario.admin,
                    ativo: usuario.ativo
                });
            }
        });
        
        return usuarios;
    },

    // ========== VERIFICAÇÕES E UTILITÁRIOS ==========

    // ✅ VERIFICAR SE ESTÁ LOGADO
    estaLogado: function() {
        return this.state.logado && this.state.usuario !== null;
    },

    // 👑 VERIFICAR SE É ADMINISTRADOR
    ehAdmin: function() {
        return this.state.usuario && this.state.usuario.admin === true;
    },

    // 👤 OBTER USUÁRIO ATUAL
    obterUsuario: function() {
        return this.state.usuario;
    },

    // 📊 OBTER STATUS COMPLETO
    obterStatus: function() {
        return {
            versao: this.config.versao,
            logado: this.state.logado,
            usuario: this.state.usuario ? {
                nome: this.state.usuario.displayName,
                email: this.state.usuario.email,
                cargo: this.state.usuario.cargo,
                admin: this.state.usuario.admin
            } : null,
            totalUsuarios: Object.keys(this.equipe).length,
            usuariosAtivos: Object.values(this.equipe).filter(function(u) { return u.ativo; }).length,
            tentativasLogin: this.state.tentativasLogin,
            ultimoLogin: this.state.ultimoLogin,
            sessaoIniciada: this.state.sessaoIniciada,
            config: this.config,
            adminUsersManager: typeof AdminUsersManager !== 'undefined'
        };
    },

    // ========== FUNÇÕES AUXILIARES PRIVADAS ==========

    _normalizarIdentificador: function(identificador) {
        if (!identificador) return '';
        
        // Se for email, extrair nome
        if (identificador.includes('@')) {
            identificador = identificador.split('@')[0];
        }
        
        return identificador.toLowerCase().trim();
    },

    _integrarComApp: function() {
        if (window.App) {
            App.usuarioAtual = this.state.usuario;
            if (App.estadoSistema) {
                App.estadoSistema.usuarioAutenticado = true;
                App.estadoSistema.usuarioEmail = this.state.usuario.email;
                App.estadoSistema.usuarioNome = this.state.usuario.displayName;
                App.estadoSistema.modoAnonimo = false; // v8.3: Usuário autenticado
            }
            this._log('Usuário integrado com App: ' + this.state.usuario.displayName);
        }
    },

    _limparIntegracaoApp: function() {
        if (window.App) {
            App.usuarioAtual = null;
            if (App.estadoSistema) {
                App.estadoSistema.usuarioAutenticado = false;
                App.estadoSistema.usuarioEmail = null;
                App.estadoSistema.usuarioNome = null;
                App.estadoSistema.modoAnonimo = true; // v8.3: Modo anônimo
            }
        }
    },

    _salvarPreferencias: function() {
        if (this.config.lembrarUsuario) {
            localStorage.setItem('ultimoUsuarioBiapo', this.state.usuario.primeiroNome);
            localStorage.setItem('lembrarUsuarioBiapo', 'true');
        }
    },

    _atualizarInterfaceUsuario: function() {
        if (!this.state.usuario) return;
        
        // Atualizar header
        var usuarioElement = document.getElementById('usuarioLogado');
        if (usuarioElement) {
            usuarioElement.textContent = '👤 ' + this.state.usuario.displayName;
        }
        
        // Atualizar outros elementos da interface se necessário
        var elementos = document.querySelectorAll('.nome-usuario');
        var self = this;
        elementos.forEach(function(el) {
            el.textContent = self.state.usuario.displayName;
        });
    },

    _esconderTodasTelasLogin: function() {
        // Esconder tela nova
        var loginBiapo = document.getElementById('loginBiapo');
        if (loginBiapo) {
            loginBiapo.remove();
        }
        
        // Esconder tela antiga
        var loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        
        // Esconder outras possíveis telas de login
        var outrosLogins = document.querySelectorAll('[id*="login"], [class*="login"]');
        outrosLogins.forEach(function(login) {
            if (login.id !== 'loginBiapo') {
                login.style.display = 'none';
            }
        });
    },

    _gerarBotoesEquipe: function() {
        var botoes = [];
        var equipeLimpa = this._removerDuplicatas();
        var self = this;
        
        equipeLimpa.forEach(function(key) {
            var usuario = self.equipe[key];
            botoes.push(
                '<span onclick="Auth.preencherNome(\'' + key + '\')" style="' +
                'cursor: pointer; ' +
                'padding: 6px 8px; ' +
                'background: #f3f4f6; ' +
                'border-radius: 4px; ' +
                'color: #374151; ' +
                'transition: background-color 0.2s ease; ' +
                'font-weight: 500;' +
                '" ' +
                'onmouseover="this.style.backgroundColor=\'#e5e7eb\'" ' +
                'onmouseout="this.style.backgroundColor=\'#f3f4f6\'" ' +
                'title="' + usuario.nome + ' - ' + usuario.cargo + '">' +
                key +
                '</span>'
            );
        });
        
        return botoes.join('');
    },

    _removerDuplicatas: function() {
        var nomes = Object.keys(this.equipe);
        var unicos = [];
        var self = this;
        
        nomes.forEach(function(nome) {
            var usuario = self.equipe[nome];
            var jaExiste = unicos.some(function(u) {
                return self.equipe[u].email === usuario.email;
            });
            
            if (!jaExiste) {
                unicos.push(nome);
            }
        });
        
        return unicos.sort();
    },

    _aplicarFiltros: function(usuario, filtros) {
        if (filtros.ativo !== undefined && usuario.ativo !== filtros.ativo) {
            return false;
        }
        if (filtros.admin !== undefined && usuario.admin !== filtros.admin) {
            return false;
        }
        if (filtros.departamento && usuario.departamento !== filtros.departamento) {
            return false;
        }
        return true;
    },

    _executarCallbacksLogin: function() {
        // Atualizar calendário
        if (window.Calendar && Calendar.atualizarEventos) {
            setTimeout(function() {
                Calendar.atualizarEventos();
            }, 500);
        }
        
        // Disparar evento customizado
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('biapo-login', {
                detail: { usuario: this.state.usuario }
            }));
        }
    },

    _executarCallbacksLogout: function() {
        // Disparar evento customizado
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('biapo-logout'));
        }
    },

    mostrarMensagem: function(mensagem, tipo) {
        if (window.Notifications) {
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
            console.log(tipo.toUpperCase() + ':', mensagem);
        }
    },

    _log: function(mensagem) {
        if (this.config.debug) {
            console.log('[Auth] ' + mensagem);
        }
    },

    _logErro: function(mensagem) {
        console.error('[Auth] ' + mensagem);
    },

    // ========== INICIALIZAÇÃO ==========

    init: function() {
        this._log('Inicializando Auth BIAPO v' + this.config.versao + '...');
        
        try {
            // Esconder sistema de login antigo
            this._esconderTodasTelasLogin();
            
            // Tentar auto-login
            if (!this.autoLogin()) {
                this.mostrarLogin();
            }
            
            this._log('Auth BIAPO v' + this.config.versao + ' inicializado com sucesso');
            this._log('Usuários cadastrados: ' + Object.keys(this.equipe).length);
            this._log('AdminUsersManager disponível: ' + (typeof AdminUsersManager !== 'undefined'));
            
        } catch (error) {
            this._logErro('Erro na inicialização: ' + error.message);
            this.mostrarLogin();
        }
    }
};

// ========== EXPOSIÇÃO GLOBAL ==========

window.Auth = Auth;

// ========== COMANDOS ÚTEIS ==========

window.loginBiapo = function(nome) { 
    return Auth.login(nome); 
};

window.logoutBiapo = function() { 
    return Auth.logout(); 
};

window.statusAuth = function() { 
    var status = Auth.obterStatus();
    console.table({
        'Versão': status.versao,
        'Logado': status.logado ? 'Sim' : 'Não',
        'Usuário': status.usuario ? status.usuario.nome : 'Nenhum',
        'Admin': status.usuario ? (status.usuario.admin ? 'Sim' : 'Não') : 'N/A',
        'Total Usuários': status.totalUsuarios,
        'Usuários Ativos': status.usuariosAtivos,
        'AdminUsersManager': status.adminUsersManager ? 'Disponível' : 'Não carregado'
    });
    return status;
};

window.equipeBiapo = function() {
    var usuarios = Auth.listarUsuarios();
    console.table(usuarios);
    return usuarios;
};

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (window.Auth) {
            Auth.init();
        }
    }, 600);
});

// ========== EVENTOS DE SISTEMA ==========

window.addEventListener('beforeunload', function() {
    if (Auth.estaLogado()) {
        Auth._log('Sessão finalizada pelo fechamento da página');
    }
});

console.log('🔐 Auth BIAPO v8.3 - INTEGRAÇÃO ADMINUSERSMANAGER carregado!');

/*
========== ✅ AUTH BIAPO v8.3 - INTEGRAÇÃO ADMINUSERSMANAGER ==========

🔥 CORREÇÕES v8.3:
- ✅ Versão atualizada para 8.3.0
- ✅ mostrarGerenciarUsuarios() integra com AdminUsersManager
- ✅ Fallback inteligente se AdminUsersManager não carregado
- ✅ Verificação de permissões mantida
- ✅ Erro de duplicidade resolvido
- ✅ Logs de depuração melhorados
- ✅ Interface de error para troubleshooting

🎯 FUNCIONALIDADES v8.3:
- ✅ Botão "👥 Usuários" chama AdminUsersManager.abrirInterfaceGestao()
- ✅ Verificação automática se módulo está carregado
- ✅ Fallback com instruções claras se módulo não disponível
- ✅ Integração perfeita entre Auth e AdminUsersManager
- ✅ Zero duplicidade de funcionalidades
- ✅ Mantém compatibilidade total com v8.2

🚀 RESULTADO:
- Clique em "👥 Usuários" abre AdminUsersManager v8.3 completo
- Gestão total: Usuários + Áreas + Departamentos
- Sem mensagem "Funcionalidade em desenvolvimento"
- Sistema unificado e profissional
- Troubleshooting automático se algo der errado

========== 🎉 INTEGRAÇÃO COMPLETA v8.3 ==========
*/
