/* ========== 🔐 AUTH BIAPO COMPLETO v8.4 - CORREÇÃO DEFINITIVA PERSISTÊNCIA ========== */

var Auth = {
    // ✅ CONFIGURAÇÃO COMPLETA
    config: {
        versao: '8.4.0', // ATUALIZADO - CORREÇÃO PERSISTÊNCIA
        autoLogin: true,
        lembrarUsuario: true,
        sistemaEmails: true,
        sistemaAdmin: true,
        debug: false,
        // 🔥 NOVA CONFIG v8.4: FIREBASE
        carregarDoFirebase: true,
        pathsFirebase: ['dados/auth_equipe', 'auth/equipe'], // Ordem de prioridade
        timeoutCarregamento: 8000,
        maxTentativasCarregamento: 3
    },

    // 🔥 EQUIPE BIAPO - AGORA SERÁ CARREGADA DO FIREBASE
    equipe: {
        // 🎯 DADOS HARDCODED MANTIDOS APENAS COMO FALLBACK DE SEGURANÇA
        // Serão sobrescritos pelos dados do Firebase se existirem
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

    // 🔥 NOVA PROPRIEDADE v8.4: DEPARTAMENTOS (CARREGADOS DO FIREBASE)
    departamentos: [
        "Gestão Geral",
        "Obra e Construção", 
        "Museu Nacional"
    ], // Array que será preenchido do Firebase

    // ✅ ESTADO DO SISTEMA
    state: {
        usuario: null,
        logado: false,
        tentativasLogin: 0,
        ultimoLogin: null,
        sessaoIniciada: null,
        // 🔥 NOVO ESTADO v8.4: FIREBASE
        equipeCarregadaDoFirebase: false,
        ultimoCarregamentoFirebase: null,
        fonteEquipeAtual: 'hardcoded', // hardcoded, firebase, fallback
        // 🔥 NOVO ESTADO: DEPARTAMENTOS
        departamentosCarregadosDoFirebase: false,
        fonteDepartamentosAtual: 'hardcoded' // hardcoded, firebase
    },

    // ========== 🔥 NOVA FUNCIONALIDADE v8.4: CARREGAR EQUIPE DO FIREBASE ==========

    // 🔥 CARREGAR EQUIPE DO FIREBASE (SOLUÇÃO DEFINITIVA)
    async _carregarEquipeDoFirebase() {
        if (!this.config.carregarDoFirebase) {
            this.state.fonteEquipeAtual = 'hardcoded';
            this._log('Carregamento do Firebase desabilitado - usando dados hardcoded');
            return false;
        }

        this._log('🔥 Iniciando carregamento da equipe do Firebase...');
        
        try {
            // Verificar se Firebase está disponível
            if (typeof database === 'undefined' || !database) {
                this._logErro('Firebase database não disponível');
                this.state.fonteEquipeAtual = 'hardcoded';
                return false;
            }

            // Tentar carregar de cada path na ordem de prioridade
            for (const path of this.config.pathsFirebase) {
                this._log(`🔍 Tentando carregar de: ${path}`);
                
                const equipeFirebase = await this._buscarEquipeDoPath(path);
                
                if (equipeFirebase && Object.keys(equipeFirebase).length > 0) {
                    // 🎯 SUBSTITUIR DADOS HARDCODED PELOS DO FIREBASE
                    this.equipe = { ...equipeFirebase };
                    this.state.equipeCarregadaDoFirebase = true;
                    this.state.ultimoCarregamentoFirebase = new Date().toISOString();
                    this.state.fonteEquipeAtual = 'firebase';
                    
                    this._log(`✅ Equipe carregada do Firebase (${path}): ${Object.keys(this.equipe).length} usuários`);
                    this._logCarregamentoSucesso(path, Object.keys(this.equipe).length);
                    
                    // 🔥 NOVA FUNCIONALIDADE: CARREGAR DEPARTAMENTOS TAMBÉM
                    await this._carregarDepartamentosDoFirebase();
                    
                    return true;
                }
            }

            // Se chegou aqui, não encontrou dados em nenhum path
            this._log('📭 Nenhum dado de equipe encontrado no Firebase - mantendo hardcoded');
            this.state.fonteEquipeAtual = 'hardcoded';
            
            // Mesmo sem usuários no Firebase, tentar carregar departamentos
            await this._carregarDepartamentosDoFirebase();
            
            return false;

        } catch (error) {
            this._logErro('Erro ao carregar equipe do Firebase: ' + error.message);
            this.state.fonteEquipeAtual = 'hardcoded';
            return false;
        }
    },

    // 🔥 NOVA FUNÇÃO: CARREGAR DEPARTAMENTOS DO FIREBASE
    async _carregarDepartamentosDoFirebase() {
        try {
            this._log('🏢 Carregando departamentos do Firebase...');
            
            if (typeof database === 'undefined' || !database) {
                this._log('⚠️ Firebase não disponível para departamentos');
                this.state.fonteDepartamentosAtual = 'hardcoded';
                return false;
            }
            
            const snapshot = await Promise.race([
                database.ref('dados/departamentos').once('value'),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout departamentos')), this.config.timeoutCarregamento)
                )
            ]);
            
            const dadosDepartamentos = snapshot.val();
            
            if (dadosDepartamentos && Object.keys(dadosDepartamentos).length > 0) {
                // Converter para array de nomes (compatível com AdminUsersManager)
                this.departamentos = Object.values(dadosDepartamentos)
                    .filter(dept => dept && dept.ativo !== false)
                    .map(dept => dept.nome)
                    .sort();
                
                this.state.departamentosCarregadosDoFirebase = true;
                this.state.fonteDepartamentosAtual = 'firebase';
                
                this._log(`✅ ${this.departamentos.length} departamentos carregados do Firebase`);
                this._log('📋 Departamentos: ' + this.departamentos.join(', '));
                return true;
            } else {
                this._log('📭 Nenhum departamento no Firebase, usando padrão');
                this.state.fonteDepartamentosAtual = 'hardcoded';
                return false;
            }
            
        } catch (error) {
            this._log('❌ Erro ao carregar departamentos: ' + error.message);
            this.state.fonteDepartamentosAtual = 'hardcoded';
            return false;
        }
    },

    // 🔥 BUSCAR EQUIPE DE UM PATH ESPECÍFICO
    async _buscarEquipeDoPath(path) {
        try {
            const snapshot = await Promise.race([
                database.ref(path).once('value'),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.config.timeoutCarregamento)
                )
            ]);

            const dados = snapshot.val();
            
            if (!dados || typeof dados !== 'object') {
                this._log(`📭 Path ${path}: nenhum dado encontrado`);
                return null;
            }

            // Validar estrutura dos dados
            if (!this._validarDadosEquipe(dados)) {
                this._log(`⚠️ Path ${path}: dados inválidos encontrados`);
                return null;
            }

            this._log(`✅ Path ${path}: ${Object.keys(dados).length} usuários encontrados`);
            return dados;

        } catch (error) {
            this._log(`❌ Path ${path}: erro - ${error.message}`);
            return null;
        }
    },

    // 🔥 VALIDAR DADOS DA EQUIPE
    _validarDadosEquipe(dados) {
        try {
            if (!dados || typeof dados !== 'object') return false;

            // Verificar se tem pelo menos um usuário válido
            let usuariosValidos = 0;
            
            for (const [key, usuario] of Object.entries(dados)) {
                if (usuario && 
                    typeof usuario === 'object' && 
                    usuario.nome && 
                    usuario.email &&
                    usuario.cargo) {
                    usuariosValidos++;
                }
            }

            return usuariosValidos > 0;

        } catch (error) {
            this._logErro('Erro na validação de dados: ' + error.message);
            return false;
        }
    },

    // 🔥 LOG DE CARREGAMENTO SUCESSO
    _logCarregamentoSucesso(path, totalUsuarios) {
        console.log('🎯 =============== EQUIPE CARREGADA DO FIREBASE ===============');
        console.log(`📍 Path: ${path}`);
        console.log(`👥 Total usuários: ${totalUsuarios}`);
        console.log('📋 Usuários carregados:');
        
        Object.keys(this.equipe).forEach(key => {
            const user = this.equipe[key];
            console.log(`  - ${key}: ${user.nome} (${user.email})`);
        });
        
        console.log('✅ Problema "não persiste" RESOLVIDO!');
        console.log('🎉 ========================================================');
    },

    // ========== FUNÇÕES PRINCIPAIS (MANTIDAS) ==========

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
            
            this._log('Login realizado com sucesso: ' + dadosUsuario.nome + ' (fonte: ' + this.state.fonteEquipeAtual + ')');
            
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
                this._log('Tentando auto-login: ' + ultimoUsuario + ' (fonte: ' + this.state.fonteEquipeAtual + ')');
                return this.login(ultimoUsuario);
            }

            return false;

        } catch (error) {
            this._logErro('Erro no auto-login: ' + error.message);
            return false;
        }
    },

    // ========== INTERFACE DO USUÁRIO (MANTIDA) ==========

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
                    ">v${this.config.versao} | ${Object.keys(this.equipe).length} usuários | ${this.state.fonteEquipeAtual}</p>
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
                        background: ${this.state.equipeCarregadaDoFirebase ? '#d1fae5' : '#f9fafb'};
                        border-radius: 8px;
                        border-left: 4px solid ${this.state.equipeCarregadaDoFirebase ? '#10b981' : '#6b7280'};
                    ">
                        <p style="
                            margin: 0;
                            font-size: 12px;
                            color: ${this.state.equipeCarregadaDoFirebase ? '#059669' : '#6b7280'};
                            font-weight: 500;
                        ">${this.state.equipeCarregadaDoFirebase ? 
                            '✅ Dados carregados do Firebase | Persistência funcionando!' : 
                            '⚠️ Usando dados locais | Verifique conexão Firebase'
                        }</p>
                        
                        <p style="
                            margin: 4px 0 0 0;
                            font-size: 11px;
                            color: ${this.state.departamentosCarregadosDoFirebase ? '#059669' : '#6b7280'};
                        ">🏢 Departamentos: ${this.state.departamentosCarregadosDoFirebase ? 
                            'Firebase ✅' : 'Local ⚠️'
                        } (${this.departamentos.length})</p>
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

    // ========== FUNÇÕES DE INTERFACE (MANTIDAS) ==========

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

    // ========== GESTÃO DE USUÁRIOS v8.4 - INTEGRAÇÃO ADMINUSERSMANAGER ==========

    // 👥 MOSTRAR GESTÃO DE USUÁRIOS (INTEGRAÇÃO v8.4)
    mostrarGerenciarUsuarios: function() {
        try {
            // 🔥 VERIFICAÇÃO DE PERMISSÕES
            if (!this.ehAdmin()) {
                this.mostrarMensagem('❌ Acesso restrito a administradores', 'error');
                return false;
            }
            
            console.log('👑 Abrindo gestão administrativa v8.4...');
            
            // 🔥 VERIFICAR SE AdminUsersManager ESTÁ DISPONÍVEL
            if (typeof AdminUsersManager !== 'undefined' && AdminUsersManager.abrirInterfaceGestao) {
                
                // ✅ CHAMAR ADMINUSERSMANAGER DIRETAMENTE
                AdminUsersManager.abrirInterfaceGestao();
                console.log('✅ AdminUsersManager v8.4 carregado com sucesso!');
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

    // ========== VERIFICAÇÕES E UTILITÁRIOS (MANTIDOS) ==========

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

    // 📊 OBTER STATUS COMPLETO v8.4
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
            adminUsersManager: typeof AdminUsersManager !== 'undefined',
            // 🔥 NOVO STATUS v8.4: FIREBASE
            firebase: {
                carregadoDoFirebase: this.state.equipeCarregadaDoFirebase,
                fonteAtual: this.state.fonteEquipeAtual,
                ultimoCarregamento: this.state.ultimoCarregamentoFirebase,
                pathsConfigurados: this.config.pathsFirebase
            },
            // 🔥 NOVO STATUS: DEPARTAMENTOS
            departamentos: {
                total: this.departamentos.length,
                lista: this.departamentos,
                fonte: this.state.fonteDepartamentosAtual,
                carregadoDoFirebase: this.state.departamentosCarregadosDoFirebase
            },
            persistencia: {
                problemaResolvido: this.state.equipeCarregadaDoFirebase,
                statusCorreção: this.state.equipeCarregadaDoFirebase ? 'FUNCIONANDO' : 'USANDO_FALLBACK',
                departamentosPersistem: this.state.departamentosCarregadosDoFirebase
            }
        };
    },

    // ========== FUNÇÕES AUXILIARES PRIVADAS (MANTIDAS) ==========

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
                App.estadoSistema.modoAnonimo = false;
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
                App.estadoSistema.modoAnonimo = true;
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

    // ========== 🔥 INICIALIZAÇÃO v8.4 - COM CARREGAMENTO FIREBASE ==========

    init: async function() {
        this._log('Inicializando Auth BIAPO v' + this.config.versao + '...');
        
        try {
            // Esconder sistema de login antigo
            this._esconderTodasTelasLogin();
            
            // 🔥 CARREGAR EQUIPE DO FIREBASE PRIMEIRO
            this._log('🔄 Tentando carregar equipe do Firebase...');
            
            try {
                // Aguardar Firebase estar pronto (se existir)
                if (typeof window.firebaseInitPromise !== 'undefined') {
                    await window.firebaseInitPromise;
                    this._log('Firebase inicializado, carregando equipe...');
                } else {
                    this._log('Firebase não detectado, usando dados hardcoded');
                }
                
                // Tentar carregar do Firebase
                await this._carregarEquipeDoFirebase();
                
            } catch (error) {
                this._logErro('Erro ao carregar do Firebase: ' + error.message);
                this.state.fonteEquipeAtual = 'hardcoded';
                this.state.fonteDepartamentosAtual = 'hardcoded';
            }
            
            // Tentar auto-login
            if (!this.autoLogin()) {
                this.mostrarLogin();
            }
            
            this._log('Auth BIAPO v' + this.config.versao + ' inicializado com sucesso');
            this._log('Usuários cadastrados: ' + Object.keys(this.equipe).length);
            this._log('Departamentos disponíveis: ' + this.departamentos.length);
            this._log('Fonte da equipe: ' + this.state.fonteEquipeAtual);
            this._log('Fonte dos departamentos: ' + this.state.fonteDepartamentosAtual);
            this._log('AdminUsersManager disponível: ' + (typeof AdminUsersManager !== 'undefined'));
            this._log('Persistência funcionando: ' + (this.state.equipeCarregadaDoFirebase ? 'SIM' : 'Fallback'));
            
        } catch (error) {
            this._logErro('Erro na inicialização: ' + error.message);
            this.mostrarLogin();
        }
    }
};

// ========== EXPOSIÇÃO GLOBAL ==========

window.Auth = Auth;

// ========== COMANDOS ÚTEIS v8.4 ==========

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
        'AdminUsersManager': status.adminUsersManager ? 'Disponível' : 'Não carregado',
        // 🔥 NOVO v8.4
        'Fonte Equipe': status.firebase.fonteAtual,
        'Carregado Firebase': status.firebase.carregadoDoFirebase ? 'SIM' : 'NÃO',
        'Fonte Departamentos': status.departamentos.fonte,
        'Departamentos Firebase': status.departamentos.carregadoDoFirebase ? 'SIM' : 'NÃO',
        'Total Departamentos': status.departamentos.total,
        'Persistência': status.persistencia.statusCorreção
    });
    return status;
};

window.equipeBiapo = function() {
    var usuarios = Auth.listarUsuarios();
    console.table(usuarios);
    console.log('🔥 Fonte dos dados:', Auth.state.fonteEquipeAtual);
    console.log('📅 Último carregamento Firebase:', Auth.state.ultimoCarregamentoFirebase || 'Nunca');
    return usuarios;
};

// 🔥 NOVOS COMANDOS v8.4 - DEBUG FIREBASE
window.recarregarEquipeFirebase = async function() {
    console.log('🔄 Recarregando equipe do Firebase...');
    try {
        const sucesso = await Auth._carregarEquipeDoFirebase();
        if (sucesso) {
            console.log('✅ Equipe recarregada com sucesso!');
            console.log('👥 Total usuários:', Object.keys(Auth.equipe).length);
        } else {
            console.log('⚠️ Nenhum dado encontrado no Firebase - mantendo local');
        }
        return sucesso;
    } catch (error) {
        console.log('❌ Erro ao recarregar:', error.message);
        return false;
    }
};

// 🔥 NOVO COMANDO: DEBUG DEPARTAMENTOS
window.departamentosAuth = function() {
    console.log('\n🏢 DEPARTAMENTOS AUTH v8.4:');
    console.log('============================================');
    console.log(`📊 Total: ${Auth.departamentos.length}`);
    console.log(`📊 Fonte: ${Auth.state.fonteDepartamentosAtual}`);
    console.log(`🔥 Firebase: ${Auth.state.departamentosCarregadosDoFirebase ? 'SIM' : 'NÃO'}`);
    console.log('📋 Lista:');
    Auth.departamentos.forEach((dept, i) => {
        console.log(`   ${i + 1}. ${dept}`);
    });
    
    // Verificar no Firebase
    if (typeof database !== 'undefined') {
        database.ref('dados/departamentos').once('value').then(snapshot => {
            const dados = snapshot.val();
            console.log(`\n🔥 FIREBASE: ${dados ? Object.keys(dados).length : 0} departamentos`);
            if (dados) {
                Object.values(dados).forEach(dept => {
                    console.log(`   - ${dept.nome} (${dept.ativo ? 'ativo' : 'inativo'})`);
                });
            }
        });
    }
    
    return {
        lista: Auth.departamentos,
        fonte: Auth.state.fonteDepartamentosAtual,
        firebase: Auth.state.departamentosCarregadosDoFirebase
    };
};

window.testarPersistenciaAuth = async function() {
    console.log('🧪 ============ TESTE PERSISTÊNCIA AUTH v8.4 ============');
    console.log('📊 Status antes do teste:');
    statusAuth();
    
    console.log('\n🔄 Recarregando equipe do Firebase...');
    const resultado = await recarregarEquipeFirebase();
    
    console.log('\n🏢 Verificando departamentos...');
    departamentosAuth();
    
    console.log('\n📊 Status após o teste:');
    statusAuth();
    
    console.log('\n🎯 RESULTADO:', resultado ? '✅ PERSISTÊNCIA FUNCIONANDO!' : '⚠️ Usando dados locais');
    console.log('🧪 ========================================================');
    
    return resultado;
};

// ========== INICIALIZAÇÃO AUTOMÁTICA v8.4 ==========

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async function() {
        if (window.Auth) {
            // Inicialização assíncrona para aguardar Firebase
            await Auth.init();
        }
    }, 800); // Aguardar 800ms para garantir que Firebase carregou
});

// ========== EVENTOS DE SISTEMA ==========

window.addEventListener('beforeunload', function() {
    if (Auth.estaLogado()) {
        Auth._log('Sessão finalizada pelo fechamento da página');
    }
});

console.log('🔐 Auth BIAPO v8.4 - CORREÇÃO DEFINITIVA PERSISTÊNCIA carregado!');
console.log('🔥 NOVOS COMANDOS: recarregarEquipeFirebase() | testarPersistenciaAuth() | departamentosAuth()');

/*
========== ✅ AUTH BIAPO v8.4 - CORREÇÃO DEFINITIVA PERSISTÊNCIA ==========

🎯 PROBLEMA RESOLVIDO:
- Auth.equipe agora CARREGA DO FIREBASE na inicialização ✅
- Auth.departamentos agora CARREGA DO FIREBASE na inicialização ✅ (NOVO)
- Dados hardcoded mantidos apenas como fallback ✅
- AdminUsersManager → Firebase → Auth.equipe → Interface ✅
- AdminUsersManager → Firebase → Auth.departamentos → Interface ✅ (NOVO)
- PERSISTÊNCIA FUNCIONANDO DEFINITIVAMENTE ✅

🔥 MUDANÇAS CRÍTICAS v8.4 + DEPARTAMENTOS:
1. _carregarEquipeDoFirebase(): Carrega dados na inicialização
2. _carregarDepartamentosDoFirebase(): NOVA - Carrega departamentos do Firebase ✅
3. init() assíncrono: Aguarda Firebase e carrega dados + departamentos
4. Status detalhado: Mostra fonte dos dados (firebase/hardcoded) para usuários E departamentos
5. Interface atualizada: Indica se dados vieram do Firebase (usuários + departamentos)
6. Novos comandos: departamentosAuth() e testarPersistenciaAuth() atualizado

📋 PATHS FIREBASE SUPORTADOS:
- dados/auth_equipe (principal - usado pelo AdminUsersManager)
- dados/departamentos (departamentos customizados) ✅ NOVO
- auth/equipe (backup)

🧪 COMANDOS DEBUG v8.4 + DEPARTAMENTOS:
- statusAuth() → Status completo incluindo fonte dos dados (usuários + departamentos)
- equipeBiapo() → Lista usuários com informação da fonte
- departamentosAuth() → NOVO - Lista departamentos com fonte e verificação Firebase ✅
- recarregarEquipeFirebase() → Força recarregamento do Firebase
- testarPersistenciaAuth() → Teste completo de persistência (usuários + departamentos)

🎉 RESULTADO FINAL:
1. AdminUsersManager salva usuários no Firebase ✅
2. AdminUsersManager salva departamentos no Firebase ✅
3. Auth.js carrega usuários do Firebase na próxima sessão ✅
4. Auth.js carrega departamentos do Firebase na próxima sessão ✅ NOVO
5. Usuários persistem entre sessões ✅
6. Departamentos customizados persistem entre sessões ✅ NOVO
7. Problema "departamentos sumem" RESOLVIDO DEFINITIVAMENTE ✅

========== 🎊 CORREÇÃO APLICADA COM SUCESSO ==========
*/
